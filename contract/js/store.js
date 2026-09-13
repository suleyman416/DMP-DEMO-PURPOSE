/* ============================================================
   store.js — localStorage-backed application state (Contract)
   Server copy (data/state.json) is the durable source of truth;
   localStorage is a fast local cache.
   ============================================================ */
(function () {
    const KEY = "dmp_contract_state_v1";
    let state = null;
    let loadedSavedAt = 0;
    const listeners = new Set();

    function load() {
        try {
            const raw = localStorage.getItem(KEY);
            if (raw) return JSON.parse(raw);
        } catch (e) { /* ignore */ }
        return null;
    }

    function persist(noStamp) {
        if (!noStamp) state.__savedAt = Date.now();
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
        scheduleServerSave();
    }

    let saveTimer = null;
    let syncPending = false;
    function scheduleServerSave() {
        if (typeof fetch !== "function" || syncPending) return;
        clearTimeout(saveTimer);
        saveTimer = setTimeout(() => {
            try {
                fetch("/api/state", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(state)
                }).catch(() => {});
            } catch (e) { /* ignore */ }
        }, 400);
    }

    function syncFromServer(done, mode) {
        if (typeof fetch !== "function") { if (done) done(false); return; }
        syncPending = true;
        clearTimeout(saveTimer);
        fetch("/api/state", { cache: "no-store" })
            .then(r => (r.status === 200 ? r.json() : null))
            .catch(() => null)
            .then(remote => {
                let changed = false;
                if (remote && remote.contracts) {
                    const base = mode === "focus" ? ((state && state.__savedAt) || 0) : loadedSavedAt;
                    if (state.__freshSeed || (remote.__savedAt || 0) > base) {
                        state = remote;
                        loadedSavedAt = remote.__savedAt || 0;
                        changed = true;
                    }
                }
                if (state) delete state.__freshSeed;
                try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* ignore */ }
                syncPending = false;
                scheduleServerSave();
                if (done) done(changed);
            });
    }

    if (typeof window.addEventListener === "function") {
        window.addEventListener("beforeunload", () => {
            try {
                if (state && navigator.sendBeacon) navigator.sendBeacon("/api/state", JSON.stringify(state));
            } catch (e) { /* ignore */ }
        });
        window.addEventListener("visibilitychange", () => {
            if (document.visibilityState !== "visible") return;
            syncFromServer((changed) => {
                if (!changed) return;
                if (window.UI && window.UI.renderHeader) window.UI.renderHeader();
                if (window.Router && window.Router.render) window.Router.render();
            }, "focus");
        });
        window.addEventListener("storage", (e) => {
            if (e.key !== KEY || !e.newValue) return;
            try {
                const incoming = JSON.parse(e.newValue);
                if (!incoming.contracts) return;
                if ((incoming.__savedAt || 0) <= ((state && state.__savedAt) || 0)) return;
                state = incoming;
                loadedSavedAt = incoming.__savedAt || 0;
                if (window.UI && window.UI.renderHeader) window.UI.renderHeader();
                if (window.Router && window.Router.render) window.Router.render();
            } catch (err) { /* ignore */ }
        });
    }

    function init() {
        state = load();
        if (!state || !state.contracts) {
            state = window.ContractSeed ? window.ContractSeed.initialState() : (window.STATE_SNAPSHOT || {});
            state.__seeded = true;
            state.__freshSeed = true;
        }
        loadedSavedAt = state.__savedAt || 0;
        persist(true);
    }

    function get() { return state; }

    function set(mutator) {
        mutator(state);
        persist();
        emit();
    }

    function reset() {
        state = window.ContractSeed ? window.ContractSeed.initialState() : {};
        state.__seeded = true;
        persist();
        emit();
    }

    function subscribe(fn) { listeners.add(fn); return () => listeners.delete(fn); }
    function emit() { listeners.forEach(fn => { try { fn(state); } catch (e) { console.error(e); } }); }

    let _seq = Math.floor(performance.now() * 1000) % 100000;
    function uid(prefix) { _seq += 1; return (prefix || "id") + "_" + _seq.toString(36) + Date.now().toString(36).slice(-4); }

    function session() { return state.session || { lang: "en" }; }
    function users() { return state.users || []; }
    function currentUser() {
        const uid = state.session && state.session.user ? state.session.user : (state.currentUser || "u_cust1");
        return (state.users || []).find(u => u.id === uid) || state.users[0];
    }
    function setUser(id) {
        set(s => {
            s.currentUser = id;
            if (!s.session) s.session = {};
            s.session.user = id;
        });
    }

    function contracts() { return state.contracts || []; }
    function contractById(id) {
        if (!id) return null;
        return (state.contracts || []).find(c =>
            c.id === id ||
            c.contract_number === id ||
            (c.id && c.id.replace(/^[A-Za-z]+-/, "") === id) ||
            (c.external_id && c.external_id === id)
        );
    }

    function pricebooks() { return state.pricebooks || []; }
    function pricebooksByContract(cid) {
        const c = contractById(cid);
        const targetCid = c ? c.id : cid;
        return (state.pricebooks || []).filter(p => p.contract_id === targetCid || p.contract_id === cid);
    }
    function pricebookById(id) {
        if (!id) return null;
        return (state.pricebooks || []).find(p =>
            p.id === id ||
            p.pricebook_number === id ||
            (p.id && p.id.replace(/^[A-Za-z]+-/, "") === id) ||
            (p.external_pricebook_number && p.external_pricebook_number === id)
        );
    }

    function lineItems() { return state.line_items || []; }
    function lineItemsByPricebook(pbid) {
        const pb = pricebookById(pbid);
        const targetId = pb ? pb.id : pbid;
        return (state.line_items || []).filter(i => i.pricebook_id === targetId || i.pricebook_id === pbid || (pb && i.pricebook_id === pb.pricebook_number));
    }
    function lineItemById(id) { return (state.line_items || []).find(i => i.id === id); }

    function kpis() { return state.kpis || []; }
    function kpisByContract(cid) { return (state.kpis || []).filter(k => k.contract_id === cid); }

    function performanceReports() { return state.performance_reports || []; }
    function performanceReportsByContract(cid) { return (state.performance_reports || []).filter(r => r.contract_id === cid); }

    function ctrRequests() { return state.ctr_requests || []; }
    function notifications() { return state.notifications || []; }

    function addNotification(n) {
        set(s => {
            if (!s.notifications) s.notifications = [];
            s.notifications.unshift(Object.assign({ id: uid("ntf"), read: false, ts: Date.now() }, n));
        });
    }

    function markAllNotificationsRead() {
        set(s => (s.notifications || []).forEach(n => { n.read = true; }));
    }

    window.Store = {
        init, get, set, reset, subscribe, uid,
        session, users, currentUser, setUser,
        contracts, contractById,
        pricebooks, pricebooksByContract, pricebookById,
        lineItems, lineItemsByPricebook, lineItemById,
        kpis, kpisByContract,
        performanceReports, performanceReportsByContract,
        ctrRequests, notifications,
        addNotification, markAllNotificationsRead,
        persist, syncFromServer
    };
})();
