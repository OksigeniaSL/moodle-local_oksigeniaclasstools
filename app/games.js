// Whole-class games for the board. Each game lives in its own file and registers here with
// window.ClasstoolsGames.add({ id, name, mount(panel), enter(), leave(), space() }).
//
// @copyright 2026 Oksigenia <dev@oksigenia.cc>
// @license   https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
'use strict';
(() => {
    const core = window.ClasstoolsCore;
    const root = document.getElementById('h-juegos');
    if (!core || !root) { return; }
    const { $, $$, save, load } = core;

    root.innerHTML = `
        <div class="barra-herr ct-top"><div class="segmentos" role="radiogroup" aria-label="Juego" id="ga-mode"></div></div>
        <div class="ct-body" id="ga-body"></div>`;
    const games = [];
    let current = null, visible = false;

    const paintModes = () => {
        $('#ga-mode').innerHTML = games.map((g) => `<button type="button" role="radio" aria-checked="${g.id === current}" data-game="${g.id}">${g.name}</button>`).join('');
    };
    const show = (id, remember = true) => {
        const game = games.find((g) => g.id === id) || games[0];
        if (!game) { return; }
        const before = games.find((g) => g.id === current);
        if (before && before !== game && before.leave) { before.leave(); }
        current = game.id;
        if (remember) { save('juego', current); }
        $$('.ct-game', root).forEach((p) => { p.hidden = p.dataset.game !== current; });
        paintModes();
        if (visible && game.enter) { game.enter(); }
    };
    $('#ga-mode').addEventListener('click', (e) => { const b = e.target.closest('button[data-game]'); if (b) { show(b.dataset.game); } });

    window.ClasstoolsGames = {
        add(game) {
            const panel = document.createElement('div');
            panel.className = 'ct-game';
            panel.dataset.game = game.id;
            panel.hidden = true;
            $('#ga-body').append(panel);
            games.push(game);
            game.mount(panel);
            const wanted = load('juego', null);   // the game used last time, as soon as it is registered
            show(games.some((g) => g.id === wanted) ? wanted : (current || game.id), false);
        },
        show,
    };
    core.register('juegos', {
        entra: () => { visible = true; show(current); },
        sale: () => { visible = false; const g = games.find((x) => x.id === current); if (g && g.leave) { g.leave(); } },
        espacio: () => { const g = games.find((x) => x.id === current); if (g && g.space) { g.space(); } },
    });
})();
