/* ============================================================
   store.js — localStorage-backed application state (Contract)
   Server copy (data/state.json) is the durable source of truth;
   localStorage is a fast local cache.
   ============================================================ */
(function () {
    const KEY = "dmp_contract_state_v2";
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
    function setLang(lang) {
        set(s => {
            if (!s.session) s.session = {};
            s.session.lang = lang;
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
    function kpiById(id) {
        if (!id) return null;
        return (state.kpis || []).find(k => k.id === String(id) || String(k.id) === String(id));
    }
    function kpisByContract(cid) {
        const c = contractById(cid);
        const targetCid = c ? c.id : cid;
        const list = (state.kpis || []).filter(k => k.contract_id === targetCid || k.contract_id === cid || (c && k.contract_id === c.contract_number));
        if (list.length > 0) return list;
        return (state.kpis || []).map(k => Object.assign({}, k, { contract_id: targetCid }));
    }
    function updateKPI(id, updates) {
        set(s => {
            const k = (s.kpis || []).find(x => String(x.id) === String(id));
            if (k) {
                Object.assign(k, updates);
                if (k.monthly_values && Array.isArray(k.monthly_values)) {
                    const valid = k.monthly_values.filter(v => v !== null && v !== undefined && !isNaN(v));
                    if (valid.length > 0) {
                        const sum = valid.reduce((a, b) => a + Number(b), 0);
                        k.ytd_average = Math.round((sum / valid.length) * 10) / 10;
                        const tgt = parseFloat(k.target_agreed) || 95;
                        const op = k.operator || "<=";
                        let achieved = false;
                        if (op === "<=" || op === "<") achieved = k.ytd_average <= tgt;
                        else achieved = k.ytd_average >= tgt;
                        k.status = achieved ? "Achieved" : "At Risk";
                    }
                }
            }
        });
    }
    function addKPI(kpiData) {
        let newKpi = null;
        set(s => {
            if (!s.kpis) s.kpis = [];
            const kpiId = uid("kpi");
            newKpi = Object.assign({
                id: kpiId,
                kpi_name: "New KPI",
                category: "Delivery Performance",
                frequency: "Monthly",
                unit: "%",
                target_agreed: 95,
                operator: "<=",
                monthly_values: [null, null, null, null, null, null, null, null, null, null, null, null],
                ytd_average: null,
                status: "Pending"
            }, kpiData);
            s.kpis.unshift(newKpi);
        });
        return newKpi;
    }
    function deleteKPI(id) {
        set(s => {
            s.kpis = (s.kpis || []).filter(k => String(k.id) !== String(id));
        });
    }

    function performanceReports() { return state.performance_reports || []; }
    function performanceReportById(id) {
        if (!id) return null;
        return (state.performance_reports || []).find(r => r.id === String(id) || String(r.id) === String(id) || r.report_number === String(id));
    }
    function performanceReportsByContract(cid) {
        const c = contractById(cid);
        const targetCid = c ? c.id : cid;
        const list = (state.performance_reports || []).filter(r => r.contract_id === targetCid || r.contract_id === cid || (c && r.contract_id === c.contract_number));
        if (list.length > 0) return list;
        return (state.performance_reports || []).map(r => Object.assign({}, r, { contract_id: targetCid }));
    }
    function updatePerformanceReport(id, updates) {
        set(s => {
            const r = (s.performance_reports || []).find(x => String(x.id) === String(id) || String(x.report_number) === String(id));
            if (r) {
                Object.assign(r, updates);
            }
        });
    }
    function addPerformanceReport(rep) {
        let newRep = null;
        set(s => {
            if (!s.performance_reports) s.performance_reports = [];
            const num = (s.performance_reports.length + 1).toString();
            newRep = Object.assign({
                id: num,
                report_number: num,
                status: "Open",
                priority: "Medium",
                progress: 0,
                progress_pct: 0,
                actions: "0/0",
                actions_list: [],
                issue_date: new Date().toISOString().slice(0, 10),
                deadline: new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10),
                closed_date: "-"
            }, rep);
            s.performance_reports.unshift(newRep);
        });
        return newRep;
    }
    function addPerformanceAction(reportId, actionData) {
        set(s => {
            const r = (s.performance_reports || []).find(x => String(x.id) === String(reportId) || String(x.report_number) === String(reportId));
            if (r) {
                if (!r.actions_list) r.actions_list = [];
                const actId = (r.actions_list.length + 1).toString();
                r.actions_list.push(Object.assign({
                    id: actId,
                    description: actionData.description || "Action Item",
                    assignee: actionData.assignee || "Supplier Representative",
                    due_date: actionData.due_date || new Date().toISOString().slice(0, 10),
                    status: actionData.status || "Pending"
                }, actionData));
                const total = r.actions_list.length;
                const done = r.actions_list.filter(a => a.status === "Completed").length;
                r.actions = `${done}/${total}`;
                r.progress = total > 0 ? Math.round((done / total) * 100) : 0;
                r.progress_pct = r.progress;
            }
        });
    }
    function updatePerformanceAction(reportId, actionId, updates) {
        set(s => {
            const r = (s.performance_reports || []).find(x => String(x.id) === String(reportId) || String(x.report_number) === String(reportId));
            if (r && r.actions_list) {
                const act = r.actions_list.find(a => String(a.id) === String(actionId));
                if (act) {
                    Object.assign(act, updates);
                    const total = r.actions_list.length;
                    const done = r.actions_list.filter(a => a.status === "Completed").length;
                    r.actions = `${done}/${total}`;
                    r.progress = total > 0 ? Math.round((done / total) * 100) : 0;
                    r.progress_pct = r.progress;
                }
            }
        });
    }

    function deletePerformanceReport(id) {
        set(s => {
            s.performance_reports = (s.performance_reports || []).filter(r => String(r.id) !== String(id) && String(r.report_number) !== String(id));
        });
    }

    function ctrRequests() { return state.ctr_requests || []; }
    function ctrRequestById(id) {
        if (!id) return null;
        return (state.ctr_requests || []).find(r => r.id === String(id) || String(r.id) === String(id));
    }
    function ctrItemsByRequest(reqId) {
        return (state.ctr_items || []).filter(i => String(i.request_id) === String(reqId));
    }
    function updateCtrItem(id, updates) {
        set(s => {
            const itm = (s.ctr_items || []).find(i => i.id === id);
            if (itm) Object.assign(itm, updates);
        });
    }
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

    function addContract(contractData) {
        let newContract = null;
        set(s => {
            if (!s.contracts) s.contracts = [];
            const num = s.contracts.length + 1;
            const id = "CTR-2026-" + String(Math.floor(100 + Math.random() * 900));
            newContract = Object.assign({
                id: id,
                contract_number: String(num),
                pricebook_count: 0,
                status: "Active",
                spent_value: 0,
                currency: "USD",
                created_at: new Date().toISOString()
            }, contractData);
            s.contracts.unshift(newContract);
            if (!s.notifications) s.notifications = [];
            s.notifications.unshift({
                id: uid("ntf"),
                title: "New Contract Created",
                body: `${newContract.description || "Contract"} (${newContract.id}) created.`,
                contractId: newContract.id,
                read: false,
                ts: Date.now()
            });
        });
        return newContract;
    }

    function addPricebook(pbData) {
        let newPb = null;
        set(s => {
            if (!s.pricebooks) s.pricebooks = [];
            const pbNum = "PB-" + String(Math.floor(10 + Math.random() * 90));
            const id = "PB-" + uid("pb").toUpperCase();
            newPb = Object.assign({
                id: id,
                pricebook_number: pbNum,
                status: "Active",
                items_count: 0,
                created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
            }, pbData);
            s.pricebooks.unshift(newPb);

            const c = (s.contracts || []).find(ctr => ctr.id === newPb.contract_id || (ctr.id && ctr.id.replace(/^[A-Za-z]+-/, "") === newPb.contract_id));
            if (c) {
                c.pricebook_count = (c.pricebook_count || 0) + 1;
            }

            if (!s.notifications) s.notifications = [];
            s.notifications.unshift({
                id: uid("ntf"),
                title: "New Pricebook Created",
                body: `Pricebook ${newPb.pricebook_number} created.`,
                contractId: newPb.contract_id,
                read: false,
                ts: Date.now()
            });
        });
        return newPb;
    }

    function updatePricebook(id, updates) {
        set(s => {
            const pb = (s.pricebooks || []).find(p => p.id === id || p.pricebook_number === id);
            if (pb) Object.assign(pb, updates);
        });
    }

    window.Store = {
        init, get, set, reset, subscribe, uid,
        session, users, currentUser, setUser, setLang,
        contracts, contractById, addContract,
        pricebooks, pricebooksByContract, pricebookById, addPricebook, updatePricebook,
        lineItems, lineItemsByPricebook, lineItemById,
        kpis, kpisByContract, kpiById, addKPI, updateKPI, deleteKPI,
        performanceReports, performanceReportsByContract, performanceReportById,
        addPerformanceReport, updatePerformanceReport, deletePerformanceReport, addPerformanceAction, updatePerformanceAction,
        ctrRequests, ctrRequestById, ctrItemsByRequest, updateCtrItem, notifications,
        addNotification, markAllNotificationsRead,
        persist, syncFromServer
    };
})();
