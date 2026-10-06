// Enlace mínimo con Moodle por SCORM 1.2: busca la API en las ventanas padre, guarda el progreso
// (suspend_data), la puntuación y el estado. Sin Moodle (pruebas sueltas) no hace nada.
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
