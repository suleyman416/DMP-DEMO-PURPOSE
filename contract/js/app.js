/* ============================================================
   app.js — Bootstrap & initialization
   ============================================================ */
(function () {
    window.addEventListener("DOMContentLoaded", () => {
        window.Store.init();
        window.Store.syncFromServer(() => {
            window.Router.init();
        });
    });
})();
