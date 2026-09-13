/* ============================================================
   components.js — shared UI components & application chrome
   1-to-1 exact match with live DMP design reference
   ============================================================ */
window.UI = (function () {

    function esc(s) {
        if (s === null || s === undefined) return "";
        return String(s).replace(/[&<>"']/g, c => ({
            "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
        }[c]));
    }

    function go(hash) { window.location.hash = hash; }

    function money(v, cur) {
        if (v === undefined || v === null || v === "" || isNaN(Number(v))) return "—";
        return Number(v).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " " + (cur || "USD");
    }

    function nowLabel(ts) {
        if (!ts) return "—";
        const d = new Date(ts);
        return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
    }

    function bindActions(root, map) {
        if (!root) return;
        if (root.__actHandler) root.removeEventListener("click", root.__actHandler);
        const handler = e => {
            const t = e.target.closest("[data-act]");
            if (!t || !root.contains(t)) return;
            const fn = map[t.getAttribute("data-act")];
            if (fn) {
                e.preventDefault();
                fn(t, e);
            }
        };
        root.__actHandler = handler;
        root.addEventListener("click", handler);
    }

    function toast(opts) {
        if (typeof opts === "string") opts = { body: opts };
        const root = document.getElementById("toast-root");
        if (!root) return;
        const el = document.createElement("div");
        el.className = "toast " + (opts.kind || "");
        el.innerHTML = (opts.title ? `<div class="toast-title">${esc(opts.title)}</div>` : "") +
            `<div>${esc(opts.body)}</div>`;
        root.appendChild(el);
        setTimeout(() => {
            el.style.opacity = "0";
            el.style.transition = "opacity .3s";
            setTimeout(() => el.remove(), 300);
        }, opts.duration || 4000);
    }

    function openModal(opts) {
        const root = document.getElementById("modal-root");
        if (!root) return;
        const overlay = document.createElement("div");
        overlay.className = "modal-overlay";
        overlay.innerHTML = `
            <div class="modal${opts.wide ? " modal-wide" : ""}${opts.full ? " modal-full" : ""}">
                <div class="modal-head">
                    <span>${esc(opts.title || "")}</span>
                    <button class="modal-close" data-close="1">✕</button>
                </div>
                <div class="modal-body">${opts.bodyHtml || ""}</div>
                <div class="modal-foot" id="modal-foot"></div>
            </div>`;
        root.appendChild(overlay);
        const foot = overlay.querySelector("#modal-foot");
        (opts.buttons || []).forEach(b => {
            const btn = document.createElement("button");
            btn.className = "btn " + (b.cls || "btn-outline");
            btn.textContent = b.label;
            btn.onclick = () => { if (b.onClick) b.onClick(overlay); };
            foot.appendChild(btn);
        });
        overlay.querySelectorAll("[data-close]").forEach(el => {
            el.addEventListener("click", () => overlay.remove());
        });
        overlay.addEventListener("click", e => {
            if (e.target === overlay && opts.dismissable !== false) overlay.remove();
        });
        if (opts.onOpen) opts.onOpen(overlay);
        return { overlay, close: () => overlay.remove() };
    }

    function closeModals() {
        const root = document.getElementById("modal-root");
        if (root) root.innerHTML = "";
    }

    function statusBadge(st) {
        const s = (st || "").toLowerCase();
        let cls = "status-pill draft";
        if (s === "active" || s === "approved" || s === "resolved") cls = "status-pill active";
        else if (s === "expired" || s === "disabled" || s === "declined") cls = "status-pill declined";
        else if (s === "upcoming" || s === "in progress") cls = "status-pill pending";
        return `<span class="${cls}">${esc(st || "—")}</span>`;
    }

    function priorityBadge(p) {
        const pr = (p || "").toLowerCase();
        let cls = "status-pill draft";
        if (pr === "critical") cls = "status-pill declined";
        else if (pr === "high") cls = "status-pill pending";
        else if (pr === "medium") cls = "status-pill active";
        return `<span class="${cls}">${esc(p || "Normal")}</span>`;
    }

    function userSubtitle(u) {
        if (window.ContractWorkflow && window.ContractWorkflow.isSupplier(u)) {
            const sup = window.Store.supplierById ? window.Store.supplierById(u.supplierId) : null;
            return sup ? sup.name : (u.company || 'Supplier');
        }
        return (u.company || 'SOCAR') + ' · ' + (u.role === 'CAM' ? 'Technical (CAM)' : 'Procurement (PROC)');
    }

    function renderHeader() {
        const s = window.Store.session();
        const me = window.Store.currentUser();
        const users = window.Store.users();
        const unread = (window.Store.notifications() || []).filter(n => !n.read).length;

        const custUsers = users.filter(u => window.ContractWorkflow.isCustomer(u));
        const supUsers = users.filter(u => window.ContractWorkflow.isSupplier(u));

        const userRow = u => `
            <div class="role-menu-item ${u.id === me.id ? 'active' : ''}" data-act="user-pick" data-user="${esc(u.id)}">
                <span>${esc(u.name)}<span class="user-sub">${esc(userSubtitle(u))}</span></span>
            </div>`;

        const header = document.getElementById("app-header");
        if (!header) return;
        header.className = "header";

        header.innerHTML = `
            <div class="header-left">
                <button class="menu-toggle" data-act="nav-drawer" title="Menu">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                </button>
                <div class="logo-area" data-act="home">
                    <img class="logo-img" src="img/logo.svg" alt="dmp — Digital Material Purchasing">
                    <div class="divider"></div>
                    <div class="app-title">CONTRACTS</div>
                </div>
            </div>
            <div class="header-right">
                <div class="lang-switcher">
                    <button class="lang-switch-btn" data-act="lang-toggle" title="Language / Dil">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                        <span class="lang-label">${(s.lang || 'en').toUpperCase()}</span>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="lang-menu" id="lang-menu">
                        <div class="lang-menu-item ${(s.lang || 'en') === 'en' ? 'active' : ''}" data-act="lang-pick" data-lang="en"><span>EN</span><span class="lang-name">English</span></div>
                        <div class="lang-menu-item ${s.lang === 'az' ? 'active' : ''}" data-act="lang-pick" data-lang="az"><span>AZ</span><span class="lang-name">Azərbaycan dili</span></div>
                    </div>
                </div>
                <div class="role-switcher">
                    <button class="role-switcher-btn" data-act="user-toggle">
                        <span class="role-dot"></span>
                        <span>Acting as <span class="role-label">${esc(me.name)}</span></span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                    </button>
                    <div class="role-menu" id="role-menu">
                        <div class="role-menu-head">Customer</div>
                        ${custUsers.map(userRow).join('')}
                        <div class="role-menu-head" style="border-top:1px solid var(--border-soft)">Suppliers</div>
                        ${supUsers.map(userRow).join('')}
                        <div class="role-menu-head" style="border-top:1px solid var(--border-soft);border-bottom:none">Demo</div>
                        <div class="role-menu-item" data-act="reset-demo"><span>↻ Reset demo data</span></div>
                    </div>
                </div>
                <button class="icon-btn" data-act="notif">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                    <span>Notifications</span>
                    ${unread ? `<span class="count-badge">${unread}</span>` : ''}
                </button>
                <div class="user-profile">
                    <div class="user-avatar"></div>
                    <div class="user-info">
                        <div class="user-name">${esc(me.name)}</div>
                        <div class="user-company">${esc(userSubtitle(me))}</div>
                    </div>
                </div>
            </div>`;

        bindActions(header, {
            "home": () => { window.location.href = location.port === '8125' ? '/main' : '../'; },
            "nav-drawer": () => openNavDrawer(),
            "lang-toggle": () => document.getElementById("lang-menu").classList.toggle("open"),
            "lang-pick": (t) => {
                document.getElementById("lang-menu").classList.remove("open");
                if (window.Store.setLang) window.Store.setLang(t.getAttribute("data-lang"));
                renderHeader();
            },
            "user-toggle": () => {
                const rm = document.getElementById("role-menu");
                if (rm) rm.classList.toggle("open");
            },
            "user-pick": (t) => {
                const rm = document.getElementById("role-menu");
                if (rm) rm.classList.remove("open");
                window.Store.setUser(t.getAttribute("data-user"));
                renderHeader();
                window.Router.render();
            },
            "notif": () => toggleNotifPanel(),
            "reset-demo": () => {
                const rm = document.getElementById("role-menu");
                if (rm) rm.classList.remove("open");
                window.Store.reset();
                toast({ kind: "success", title: "Demo reset", body: "All contracts cleared and demo data re-seeded." });
                go("#/contracts");
                renderHeader();
                window.Router.render();
            }
        });

        if (!document.__menuCloseBound) {
            document.__menuCloseBound = true;
            document.addEventListener("click", e => {
                if (!e.target.closest(".role-switcher")) {
                    const m = document.getElementById("role-menu");
                    if (m) m.classList.remove("open");
                }
                if (!e.target.closest(".lang-switcher")) {
                    const lm = document.getElementById("lang-menu");
                    if (lm) lm.classList.remove("open");
                }
                if (!e.target.closest(".notif-panel") && !e.target.closest("[data-act=\"notif\"]")) {
                    const np = document.getElementById("notif-panel");
                    if (np) np.classList.remove("open");
                }
            });
        }
    }

    function toggleNotifPanel() {
        const panel = document.getElementById("notif-panel");
        if (!panel) return;
        if (panel.classList.contains("open")) {
            panel.classList.remove("open");
            return;
        }
        const notifs = window.Store.notifications() || [];
        panel.innerHTML = `
            <div class="notif-head">
                <span>Notifications</span>
                <button class="btn-link" style="background:none;border:none;color:var(--primary-green);cursor:pointer;font-size:12px;" data-act="mark-read">Mark all read</button>
            </div>
            ${notifs.length ? notifs.map(n => `
                <div class="notif-item ${n.read ? "" : "unread"}" ${n.contractId ? `data-act="open-ctr" data-id="${esc(n.contractId)}" style="cursor:pointer"` : ""}>
                    <span class="n-dot" style="${n.read ? "background:#ccc" : ""}"></span>
                    <div>
                        <div style="font-weight:700">${esc(n.title || "")}</div>
                        <div>${esc(n.body || "")}</div>
                        <div class="n-time">${nowLabel(n.ts)}</div>
                    </div>
                </div>`).join("") : `<div style="padding:20px;text-align:center;color:var(--text-muted)">No notifications</div>`}`;
        panel.classList.add("open");
        bindActions(panel, {
            "mark-read": () => {
                window.Store.markAllNotificationsRead();
                renderHeader();
                toggleNotifPanel();
                toggleNotifPanel();
            },
            "open-ctr": (t) => {
                panel.classList.remove("open");
                go("#/contracts/" + t.getAttribute("data-id"));
            }
        });
    }

    function openNavDrawer() {
        const root = document.getElementById("drawer-root");
        if (!root) return;
        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);

        const ic = {
            list: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
            plus: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
            doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
            book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
            req: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
            users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`
        };
        const ic2 = {
            chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
            bag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
            doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`
        };

        const currentHash = window.location.hash || "#/contracts";
        const link = (hash, icon, label) => `
            <div class="drawer-link ${currentHash === hash ? "drawer-link-active" : ""}" data-go="${hash}">
                ${icon}<span>${esc(label)}</span>
            </div>`;
        const extLink = (url, icon, label) => `
            <div class="drawer-link" data-href="${esc(url)}">
                ${icon}<span>${esc(label)}</span>
            </div>`;

        const DP_URL = window.DP_URL || "http://127.0.0.1:8123";
        const SOURCING_URL = window.SOURCING_URL || "http://127.0.0.1:8124";

        root.innerHTML = `
            <div class="drawer-backdrop" data-close="1"></div>
            <aside class="nav-drawer">
                <div class="drawer-head">
                    <img class="logo-img" src="img/logo.svg" alt="dmp">
                    <button class="drawer-close" data-close="1">✕</button>
                </div>
                <div class="drawer-section">Navigation</div>
                ${link("#/contracts", ic.list, "Contracts List")}
                ${isCust ? link("#/contracts/new", ic.plus, "Add Contract") : ""}
                ${link("#/pricebooks", ic.book, "Pricebooks")}
                ${link("#/ctr-requests", ic.req, "CTR Requests")}
                ${isCust ? link("#/spm", ic.users, "Suppliers") : ""}

                <div class="drawer-section">Modules</div>
                ${extLink(DP_URL, ic2.chart, "Demand Planning")}
                ${extLink(SOURCING_URL, ic2.bag, "Sourcing")}
                <div class="drawer-link drawer-link-active">${ic2.doc}<span>Contract</span></div>

                <div class="drawer-foot">
                    Acting as <strong>${esc(me.role)}</strong> · ${esc(me.name)}
                </div>
            </aside>`;

        const close = () => { root.innerHTML = ""; };
        root.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", close));
        root.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => {
            const h = el.getAttribute("data-go");
            close();
            if (window.location.hash === h) window.Router.render(); else go(h);
        }));
        root.querySelectorAll("[data-href]").forEach(el => el.addEventListener("click", () => {
            window.location.href = el.getAttribute("data-href");
        }));
    }

    /* ---------- breadcrumb band ---------- */
    function breadcrumb() {
        const parts = Array.prototype.slice.call(arguments);
        return `<div class="crumb-band">
            <a class="crumb-muted" href="#/contracts">Contract module</a>
            ${parts.map((p, i) => `<span class="crumb-sep">›</span><span class="${i === parts.length - 1 ? 'crumb-cur' : 'crumb-muted'}">${esc(p)}</span>`).join('')}
        </div>`;
    }

    function renderBreadcrumbs(items) {
        const labels = items.map(it => it.label || it);
        return breadcrumb.apply(null, labels);
    }

    function renderFeedbackBubble() {
        return `
            <div class="dragContainer-pQJHvS">
                <div class="flex-center reportFeedback-HoEh2N" title="Report Feedback" data-act="feedback-bubble">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2H4C2.9 2 2.01 2.9 2.01 4L2 22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2ZM20 16H5.17L4 17.17V4H20V16Z" fill="#4d4d4d"></path>
                        <circle cx="12" cy="13" r="1" fill="#4d4d4d"></circle>
                        <path d="M11 6H13V11H11V6Z" fill="#4d4d4d"></path>
                    </svg>
                </div>
            </div>`;
    }

    function openPhotoModal(url, title) {
        openModal({
            title: title || "Item Technical Photo",
            bodyHtml: `
                <div style="text-align:center;padding:10px;">
                    <img src="${esc(url)}" alt="Item Photo" style="max-width:100%;max-height:480px;border-radius:8px;box-shadow:var(--shadow);">
                </div>`,
            buttons: [{ label: "Close", cls: "btn-black", onClick: ov => ov.remove() }]
        });
    }

    return {
        esc,
        go,
        money,
        nowLabel,
        bindActions,
        toast,
        openModal,
        closeModals,
        statusBadge,
        priorityBadge,
        renderHeader,
        openNavDrawer,
        toggleNotifPanel,
        breadcrumb,
        renderBreadcrumbs,
        renderFeedbackBubble,
        openPhotoModal
    };
})();
