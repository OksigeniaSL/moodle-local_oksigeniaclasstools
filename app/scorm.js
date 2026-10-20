// This file is part of Moodle - https://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <https://www.gnu.org/licenses/>.

/**
 * Minimal link with Moodle through SCORM 1.2: finds the API in the parent windows and keeps the progress
 * (suspend_data), the score and the status. Without Moodle it does nothing.
 *
 * @copyright  2026 Oksigenia SL <dev@oksigenia.cc>
 * @license    https://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
'use strict';
const SCORM = (() => {
    let api = null, vivo = false;
    const busca = (w) => {
        for (let i = 0; w && i < 10; i++) {
            try { if (w.API) { return w.API; } } catch (e) { return null; }
            if (w.parent === w) { break; }
            w = w.parent;
        }
        return null;
    };
    const iniciar = () => {
        api = busca(window) || (window.opener ? busca(window.opener) : null);
        if (api) {
            vivo = String(api.LMSInitialize('')) === 'true';
            if (vivo && api.LMSGetValue('cmi.core.lesson_status') === 'not attempted') {
                api.LMSSetValue('cmi.core.lesson_status', 'incomplete');
                api.LMSCommit('');
            }
        }
        return vivo;
    };
    const leer = () => {
        if (!vivo) { return null; }
        try { return JSON.parse(api.LMSGetValue('cmi.suspend_data') || 'null'); } catch (e) { return null; }
    };
    const guardar = (datos, puntos, completo) => {
        if (!vivo) { return; }
        api.LMSSetValue('cmi.suspend_data', JSON.stringify(datos));
        api.LMSSetValue('cmi.core.score.min', '0');
        api.LMSSetValue('cmi.core.score.max', '100');
        api.LMSSetValue('cmi.core.score.raw', String(Math.round(puntos)));
        api.LMSSetValue('cmi.core.lesson_status', completo ? 'completed' : 'incomplete');
        api.LMSCommit('');
    };
    const terminar = () => { if (vivo) { api.LMSFinish(''); vivo = false; } };
    window.addEventListener('pagehide', terminar);
    window.addEventListener('beforeunload', terminar);
    return { iniciar, leer, guardar, terminar };
})();
