#!/usr/bin/env node
// Checks the board in a headless Chrome, outside Moodle: app/ is served as it is, with a pretend Moodle course and a
// pretend live server, and each check drives the real screen as a teacher would.
// Usage: node tools/browser_check.mjs [check …]   (Node 22 or later, Chrome or Chromium installed; no packages)
// CHROME=/path/to/chrome to choose the browser.
'use strict';
import { spawn } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = join(dirname(fileURLToPath(import.meta.url)), '..', 'app');

// What the page gets before the board: a course with a class, and a live server that answers like livehost.php
// (start, state, open, close, end) for a vote, keeping what the board sent.
const FAKE = `
window.CLASSTOOLS = { lists: [{ id: 1, name: 'Class 1', key: 'c1', students: Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: 'Student ' + (i + 1) })) }],
    courseid: 1, mode: 'teacher', sesskey: 'x', days: {}, state: {}, liveurl: 'fake://live', me: { id: 99, name: 'Teacher' } };
window.FAKE = { calls: [], polls: 0 };
(() => {
    const VOTES = { abcd: ['A', 'B', 'C', 'D'], yesno: ['yes', 'no'], light: ['green', 'yellow', 'red'], five: ['1', '2', '3', '4', '5'] };
    let S = null;
    const view = () => ({ id: 7, code: 'TEST42', kind: 'vote', identity: 'anon', ended: S.ended, round: S.round, open: S.open, show: false,
        others: 0, notice: false, seq: 0, url: 'https://example.org/local/oksigeniaclasstools/join.php?c=TEST42', devices: [],
        vote: S.vote, options: VOTES[S.vote], results: Object.fromEntries(VOTES[S.vote].map((o) => [o, 0])) });
    const real = window.fetch;
    window.fetch = (url, opts) => {
        if (!String(url).startsWith('fake://')) { return real(url, opts); }
        const p = new URLSearchParams(opts && opts.body), a = p.get('action');
        FAKE.calls.push(Object.fromEntries(p));
        if (a === 'start') { S = { vote: VOTES[p.get('vote')] ? p.get('vote') : 'abcd', round: 0, open: false, ended: false }; }
        else if (a === 'state') { FAKE.polls++; }
        else if (a === 'open') { if (VOTES[p.get('vote')]) { S.vote = p.get('vote'); } S.open = true; S.round++; }
        else if (a === 'close') { S.open = false; }
        else if (a === 'end') { S.ended = true; }
        return Promise.resolve(new Response(JSON.stringify(S ? view() : { ended: true, devices: [] }), { headers: { 'Content-Type': 'application/json' } }));
    };
})();
`;

// Each check runs in the page and returns what went wrong, or nothing.
const CHECKS = {
    // The type of answers the teacher picks between two rounds stays picked while the board keeps asking the server,
    // and it is the one the vote opens with.
    'vote-type': async () => {
        const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
        const until = async (s) => { for (let i = 0; i < 100 && !document.querySelector(s); i++) { await sleep(50); } return document.querySelector(s); };
        (await until('#t-envivo')).click();
        (await until('#lv-kind [data-v="vote"]')).click();
        document.querySelector('#lv-identity [data-v="anon"]').click();
        document.querySelector('#lv-vote').value = 'abcd';
        document.querySelector('#lv-start').click();
        const select = await until('#lv-kind-vote');
        if (!select) { return 'the vote did not start'; }
        await sleep(300);
        select.value = 'yesno';
        select.dispatchEvent(new Event('change', { bubbles: true }));
        const polls = window.FAKE.polls;
        await sleep(3600);
        if (window.FAKE.polls < polls + 2) { return 'the board did not ask the server while waiting'; }
        if (select.value !== 'yesno') { return `the type of answers went back to «${select.value}» while the board asked the server`; }
        document.querySelector('#lv-open').click();
        await sleep(300);
        const open = window.FAKE.calls.filter((c) => c.action === 'open').pop();
        if (!open || open.vote !== 'yesno') { return `the vote opened with «${open ? open.vote : 'nothing'}»`; }
        return '';
    },
};

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.woff2': 'font/woff2', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/check.html') {
        // The board's own page, with the pretend course and server before its scripts.
        const html = readFileSync(join(APP, 'index.html'), 'utf8').replace('<script src="strings.js"></script>', '<script src="/fake.js"></script>\n<script src="strings.js"></script>');
        res.writeHead(200, { 'Content-Type': 'text/html' }); res.end(html); return;
    }
    if (path === '/fake.js') { res.writeHead(200, { 'Content-Type': 'text/javascript' }); res.end(FAKE); return; }
    const file = normalize(join(APP, path));
    if (!file.startsWith(APP) || !existsSync(file)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream' }); res.end(readFileSync(file));
});

const chromePath = () => process.env.CHROME || ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'].find(existsSync);

async function main() {
    const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CHECKS);
    const unknown = names.filter((n) => !CHECKS[n]);
    if (unknown.length) { console.error(`Unknown check: ${unknown.join(', ')}. Checks: ${Object.keys(CHECKS).join(', ')}`); process.exit(2); }
    const bin = chromePath();
    if (!bin) { console.error('No Chrome found: set CHROME'); process.exit(2); }
    await new Promise((r) => server.listen(0, '127.0.0.1', r));
    const base = `http://127.0.0.1:${server.address().port}`;
    const profile = mkdtempSync(join(tmpdir(), 'ct-check-'));
    const chrome = spawn(bin, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${profile}`, '--no-first-run',
        '--no-default-browser-check', '--disable-gpu', '--mute-audio', 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
    let failed = 0;
    try {
        const wsUrl = await new Promise((ok, ko) => {
            let err = '';
            const t = setTimeout(() => ko(new Error('Chrome did not start')), 20000);
            chrome.stderr.on('data', (d) => { err += d; const m = err.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); ok(m[1]); } });
            chrome.on('exit', () => ko(new Error('Chrome exited: ' + err.slice(-400))));
        });
        const ws = new WebSocket(wsUrl);
        await new Promise((ok, ko) => { ws.onopen = ok; ws.onerror = ko; });
        let id = 0; const waiting = new Map(), events = [];
        ws.onmessage = (m) => {
            const msg = JSON.parse(m.data);
            if (msg.id && waiting.has(msg.id)) { const [ok, ko] = waiting.get(msg.id); waiting.delete(msg.id); if (msg.error) { ko(new Error(msg.error.message)); } else { ok(msg.result); } }
            else if (msg.method) { events.push(msg); }
        };
        const send = (method, params = {}, sessionId) => new Promise((ok, ko) => { const n = ++id; waiting.set(n, [ok, ko]); ws.send(JSON.stringify({ id: n, method, params, sessionId })); });
        for (const name of names) {
            const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
            const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
            await send('Runtime.enable', {}, sessionId);
            await send('Emulation.setDeviceMetricsOverride', { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false }, sessionId);
            await send('Page.enable', {}, sessionId);
            events.length = 0;
            await send('Page.navigate', { url: `${base}/check.html` }, sessionId);
            for (let i = 0; i < 200 && !events.some((e) => e.method === 'Page.loadEventFired' && e.sessionId === sessionId); i++) { await new Promise((r) => setTimeout(r, 50)); }
            const r = await send('Runtime.evaluate', { expression: `(${CHECKS[name].toString()})()`, awaitPromise: true, returnByValue: true }, sessionId);
            const problem = r.exceptionDetails ? (r.exceptionDetails.exception?.description || r.exceptionDetails.text) : r.result.value;
            // Errors of the page itself fail the check too.
            const errors = events.filter((e) => e.sessionId === sessionId && e.method === 'Runtime.exceptionThrown')
                .map((e) => e.params.exceptionDetails.exception?.description || e.params.exceptionDetails.text);
            if (problem || errors.length) { failed++; console.log(`FAIL ${name}: ${problem || 'errors in the page'}`); } else { console.log(`ok   ${name}`); }
            if (errors.length) { console.log(`     page errors: ${[...new Set(errors)].join(' | ')}`); }
            await send('Target.closeTarget', { targetId });
        }
        // Closed from inside, so that Chrome stops its helpers and lets go of its profile.
        await Promise.race([send('Browser.close').catch(() => {}), new Promise((r) => setTimeout(r, 3000))]);
        ws.close();
    } finally {
        const gone = new Promise((r) => { if (chrome.exitCode !== null || chrome.signalCode) { r(); } else { chrome.once('exit', r); } });
        await Promise.race([gone, new Promise((r) => setTimeout(r, 3000))]);
        if (chrome.exitCode === null && !chrome.signalCode) { chrome.kill('SIGKILL'); await gone; }
        server.close();
        // Chrome's helpers may still be writing their profile for a moment.
        rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
    }
    process.exit(failed ? 1 : 0);
}
main().catch((e) => { console.error(e.message); process.exit(2); });
