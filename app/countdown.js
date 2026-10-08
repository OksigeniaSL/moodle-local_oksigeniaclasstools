// Countdown, in the Clock tab: what the class is waiting for (the trip, the show, the holidays), the day and the time,
// and how long is left in days, hours, minutes and seconds, with the school days in between (Monday to Friday). Kept
// for each course in the browser and, inside Moodle, for the teacher in the course.
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-reloj');
    if (!core || !root) { return; }
    const { t, escape, save, load, play, announce } = core;
    const $ = (s) => root.querySelector(s);

    const key = 'cuenta-atras' + (core.moodle ? ':' + core.moodle.courseid : '');
    let st = Object.assign({ name: '', date: '', time: '09:00' }, load(key, {}));
    const kept = core.kept('countdown');
    if (kept && typeof kept === 'object' && (kept.updated || 0) > (st.updated || 0)) { st = Object.assign(st, kept); }
    const keep = () => { st.updated = Date.now(); save(key, st); core.keep('countdown', st); };

    const panel = document.createElement('div');
    panel.className = 'ct-cd';
    panel.innerHTML = `
        <aside class="tarjeta ct-side ct-cd-side">
            <label class="campo apilado"><span>${escape(t('cd_what'))}</span><input type="text" id="cd-name" maxlength="60" placeholder="${escape(t('cd_what_ph'))}"></label>
            <label class="campo apilado"><span>${escape(t('cd_day'))}</span><input type="date" id="cd-date"></label>
            <label class="campo apilado"><span>${escape(t('cd_time'))}</span><input type="time" id="cd-time"></label>
        </aside>
        <div class="tarjeta ct-stage ct-cd-stage">
            <p class="ct-cd-name" id="cd-title"></p>
            <p class="ct-cd-left" id="cd-left"></p>
            <div class="ct-cd-units" id="cd-units"></div>
            <p class="nota ct-cd-school" id="cd-school"></p>
        </div>`;
    root.append(panel);
    $('#cd-name').value = st.name; $('#cd-date').value = st.date; $('#cd-time').value = st.time || '09:00';
    ['#cd-name', '#cd-date', '#cd-time'].forEach((s) => $(s).addEventListener('input', () => {
        st.name = $('#cd-name').value.slice(0, 60); st.date = $('#cd-date').value; st.time = $('#cd-time').value || '09:00';
        arrived = false; keep(); paint();
    }));

    const when = () => (st.date ? new Date(`${st.date}T${st.time || '09:00'}`) : null);
    // Monday to Friday after today and before the day itself (holidays are not known).
    const schoolDays = (end) => {
        const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1);
        const last = new Date(end); last.setHours(0, 0, 0, 0);
        let n = 0;
        while (d < last && n < 400) { if (d.getDay() > 0 && d.getDay() < 6) { n++; } d.setDate(d.getDate() + 1); }
        return n;
    };
    let arrived = false, shown = '';
    const unit = (n, one, many) => `<span class="ct-cd-unit"><strong>${n}</strong><small>${escape(t(n === 1 ? one : many))}</small></span>`;
    function paint() {
        const end = when();
        $('#cd-title').textContent = st.name;
        if (!end || isNaN(end)) {
            $('#cd-left').textContent = ''; $('#cd-units').innerHTML = `<p class="ct-cd-hint">${escape(t('cd_hint'))}</p>`; $('#cd-school').textContent = '';
            shown = ''; return;
        }
        const ms = end - Date.now();
        if (ms <= 0) {
            $('#cd-left').textContent = '';
            $('#cd-units').innerHTML = `<p class="ct-cd-here">${escape(t('cd_here'))}</p>`;
            $('#cd-school').textContent = '';
            if (!arrived && root.classList.contains('ct-cl-countdown') && !root.hidden) {
                arrived = true; play('fin');
                if (core.celebrate) { core.celebrate($('.ct-cd-stage'), { title: t('cd_here'), text: st.name }); }
                announce(t('cd_here'));
            }
            return;
        }
        const s = Math.floor(ms / 1000), days = Math.floor(s / 86400), hours = Math.floor((s % 86400) / 3600), mins = Math.floor((s % 3600) / 60), secs = s % 60;
        const html = (days ? unit(days, 'cd_day_one', 'cd_days') : '') + unit(hours, 'cd_hour_one', 'cd_hours') + unit(mins, 'cd_minute_one', 'cd_minutes')
            + (days < 2 ? unit(secs, 'cd_second_one', 'cd_seconds') : '');
        if (html !== shown) { $('#cd-units').innerHTML = html; shown = html; }
        $('#cd-left').textContent = t('cd_left');
        const sd = schoolDays(end);
        $('#cd-school').textContent = days >= 1 ? t(sd === 1 ? 'cd_school_one' : 'cd_school_many', sd) : '';
    }
    // Every second while it is on screen.
    setInterval(() => { if (!root.hidden && root.classList.contains('ct-cl-countdown')) { paint(); } }, 1000);
    paint();

    window.ClasstoolsCountdown = { state: () => st, paint };   // for automated tests
})();
