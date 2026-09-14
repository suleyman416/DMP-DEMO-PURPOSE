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

        const isCust = window.ContractWorkflow.isCustomer(me);
        const notifBadge = isCust ? (unread > 9 ? "9+" : String(unread || "9+")) : "4";

        const cartHtml = isCust ? `
            <div class="header-shopping-cart" title="Shopping cart" style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:6px 10px;color:#616161;font-size:13px;" onclick="window.location.href='http://127.0.0.1:8123/#/cart'">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.8333 5.00004H14.1667C14.1667 2.66671 12.3333 0.833374 10 0.833374C7.66667 0.833374 5.83333 2.66671 5.83333 5.00004H4.16667C3.25 5.00004 2.5 5.75004 2.5 6.66671V16.6667C2.5 17.5834 3.25 18.3334 4.16667 18.3334H15.8333C16.75 18.3334 17.5 17.5834 17.5 16.6667V6.66671C17.5 5.00004 16.75 5.00004 15.8333 5.00004ZM10 2.50004C11.4167 2.50004 12.5 3.58337 12.5 5.00004H7.5C7.5 3.58337 8.58333 2.50004 10 2.50004ZM15.8333 16.6667H4.16667V6.66671H15.8333V16.6667ZM10 10C8.58333 10 7.5 8.91671 7.5 7.50004H5.83333C5.83333 9.83337 7.66667 11.6667 10 11.6667C12.3333 11.6667 14.1667 9.83337 14.1667 7.50004H12.5C12.5 8.91671 11.4167 10 10 10Z" fill="#616161"></path></svg>
                <span class="icon-desc" style="font-size:13px;font-weight:500;">Shopping cart</span>
            </div>` : "";

        header.innerHTML = `
            <div class="header-left">
                <button class="menu-toggle" data-act="nav-drawer" data-testid="navigation-drawer-open-button" title="Menu">
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
                    <span class="count-badge">${notifBadge}</span>
                </button>
                ${cartHtml}
                <div class="user-profile">
                    <div class="user-avatar">${(me.name || 'U').slice(0, 1).toUpperCase()}</div>
                    <div class="user-info">
                        <div class="user-name">${esc(me.name)}</div>
                        <div class="user-company">${esc(me.company || (isCust ? 'DMP Demo Company' : 'Vendor B'))}</div>
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
                        <div class="notif-title">${esc(n.title || "Notification")}</div>
                        <div class="notif-body">${esc(n.body || "")}</div>
                        <div class="notif-time">${nowLabel(n.ts)}</div>
                    </div>
                </div>
            `).join("") : `<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:13px;">No notifications yet.</div>`}
        `;
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

        const currentHash = window.location.hash || "#/contracts";

        const DP_URL = window.DP_URL || "http://127.0.0.1:8123";
        const SOURCING_URL = window.SOURCING_URL || "http://127.0.0.1:8124";

        const roleTitle = isCust ? "Customer Admin" : "Supplier Admin";
        const userInitial = (me.name || "U").slice(0, 1).toUpperCase();

        const customerSectionsHtml = `
            <div class="nav-drawer-section" data-nav-ext="${DP_URL}">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></span>
                    <span>Demand Planning</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section" data-nav-ext="${SOURCING_URL}">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></span>
                    <span>Sourcing</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section" data-nav-ext="${SOURCING_URL}">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></span>
                    <span>Sourcing (Old)</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></span>
                    <span>Benchmarking</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section nav-drawer-section-expanded">
                <div class="nav-drawer-sec-header nav-sec-active">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
                    <span style="font-weight:600;">Contract</span>
                    <span class="nav-chevron">⌃</span>
                </div>
                <div class="nav-drawer-sublinks">
                    <div class="nav-sublink ${currentHash === '#/spm' ? 'nav-sublink-active' : ''}" data-go="#/spm">Suppliers</div>
                    <div class="nav-sublink ${currentHash.startsWith('#/contracts') ? 'nav-sublink-active' : ''}" data-go="#/contracts">Contracts</div>
                    <div class="nav-sublink ${currentHash === '#/pricebooks' ? 'nav-sublink-active' : ''}" data-go="#/pricebooks">Pricebooks</div>
                    <div class="nav-sublink ${currentHash === '#/ctr-requests' ? 'nav-sublink-active' : ''}" data-go="#/ctr-requests">Requests</div>
                </div>
            </div>
            <div class="nav-drawer-section" data-go="#/ctr-requests">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
                    <span>CTR</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"/><path d="M22 12A10 10 0 0 0 12 2v10z"/></svg></span>
                    <span>Analytics & Reports</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                    <span>Supplier Compliance</span>
                </div>
            </div>
            <div class="nav-drawer-section">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg></span>
                    <span>Admin Panel</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
        `;

        const supplierSectionsHtml = `
            <div class="nav-drawer-section" data-nav-ext="${SOURCING_URL}">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></span>
                    <span>Sourcing</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section" data-nav-ext="${SOURCING_URL}">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg></span>
                    <span>Sourcing (Old)</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section nav-drawer-section-expanded">
                <div class="nav-drawer-sec-header nav-sec-active">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg></span>
                    <span style="font-weight:600;">Contract</span>
                    <span class="nav-chevron">⌃</span>
                </div>
                <div class="nav-drawer-sublinks">
                    <div class="nav-sublink ${currentHash.startsWith('#/contracts') ? 'nav-sublink-active' : ''}" data-go="#/contracts">Contracts</div>
                    <div class="nav-sublink ${currentHash === '#/pricebooks' ? 'nav-sublink-active' : ''}" data-go="#/pricebooks">Pricebooks</div>
                    <div class="nav-sublink ${currentHash === '#/ctr-requests' ? 'nav-sublink-active' : ''}" data-go="#/ctr-requests">Requests</div>
                </div>
            </div>
            <div class="nav-drawer-section">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                    <span>Customer Compliance</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
            <div class="nav-drawer-section" data-go="#/ctr-requests">
                <div class="nav-drawer-sec-header">
                    <span class="nav-sec-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></span>
                    <span>CTR</span>
                    <span class="nav-chevron">⌵</span>
                </div>
            </div>
        `;

        root.innerHTML = `
            <div class="drawer-backdrop" data-close="1"></div>
            <aside class="nav-drawer nav-drawer-dark">
                <div class="nav-drawer-header">
                    <div class="nav-drawer-user">
                        <div class="nav-user-circle">${userInitial}</div>
                        <div class="nav-user-text">
                            <div class="nav-user-name">${esc(me.name)}</div>
                            <div class="nav-user-role">${esc(roleTitle)}</div>
                        </div>
                    </div>
                    <button class="nav-drawer-close" data-close="1">✕</button>
                </div>

                <div class="nav-drawer-body">
                    ${isCust ? customerSectionsHtml : supplierSectionsHtml}
                </div>

                <div class="nav-drawer-footer">
                    <div class="nav-footer-link" data-act="settings">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                        <span>Settings</span>
                    </div>
                    <div class="nav-footer-link" data-act="logout">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                        <span>Log out</span>
                    </div>
                </div>
            </aside>`;

        const close = () => { root.innerHTML = ""; };
        root.querySelectorAll("[data-close]").forEach(el => el.addEventListener("click", close));
        root.querySelectorAll("[data-go]").forEach(el => el.addEventListener("click", () => {
            const h = el.getAttribute("data-go");
            close();
            if (window.location.hash === h) window.Router.render(); else go(h);
        }));
        root.querySelectorAll("[data-nav-ext]").forEach(el => el.addEventListener("click", () => {
            window.location.href = el.getAttribute("data-nav-ext");
        }));
        root.querySelectorAll("[data-act=\"settings\"]").forEach(el => el.addEventListener("click", () => {
            close();
            toast({ kind: "info", title: "Settings", body: "Account settings are configured for this session." });
        }));
        root.querySelectorAll("[data-act=\"logout\"]").forEach(el => el.addEventListener("click", () => {
            close();
            toast({ kind: "info", title: "Logged out", body: "Session closed. Switching to default demo user." });
            window.Store.setUser("u_cust1");
            renderHeader();
            go("#/contracts");
        }));
    }

    function emptyFolder(message) {
        return `
            <div class="empty-folder-state" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:50px 20px;width:100%;text-align:center;">
                <div style="font-size:16px;color:#3A3A3A;font-weight:500;margin-bottom:16px;">${esc(message || "No items have been created yet.")}</div>
                <img src="img/folder_empty.svg" alt="Empty" style="width:360px;max-width:90%;height:auto;" />
            </div>`;
    }

    function openPricebookModal(opts) {
        opts = opts || {};
        const me = window.Store.currentUser();
        const customerName = opts.customerName || (opts.contract ? opts.contract.customer : "Delta Drilling LTD.");
        const contractDesc = opts.contractDescription || (opts.contract ? opts.contract.description : "provision of office supplies");
        const contractId = opts.contractId || (opts.contract ? opts.contract.id : (opts.contractId || "CTR-2026-001"));

        const modalHtml = `
            <div class="dmp-modal-backdrop" id="pb-modal-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="dmp-modal-box" style="background:#FFF;border-radius:8px;width:520px;max-width:94vw;box-shadow:0 12px 30px rgba(0,0,0,0.18);padding:26px 30px;position:relative;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="font-size:18px;font-weight:600;color:#111827;margin:0;">Create new pricebook</h2>
                        <button type="button" id="pb-modal-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;line-height:1;">✕</button>
                    </div>
                    <form id="pb-create-form">
                        <div style="margin-bottom:16px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Customer</label>
                            <input type="text" disabled value="${esc(customerName)}" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;background:#F9FAFB;color:#6B7280;font-size:13px;" />
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Contracts</label>
                            <input type="text" disabled value="${esc(contractDesc)}" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;background:#F9FAFB;color:#6B7280;font-size:13px;" />
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">External pricebook number (Optional)</label>
                            <input type="text" id="pb-ext-num" placeholder="Enter external pricebook number" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;font-size:13px;" />
                            <div style="font-size:11px;color:#9CA3AF;margin-top:4px;">Customer-specific reference number</div>
                        </div>
                        <div style="margin-bottom:16px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Currency</label>
                            <select id="pb-currency" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;font-size:13px;background:#FFF;">
                                <option value="USD" selected>USD</option>
                                <option value="AZN">AZN</option>
                                <option value="EUR">EUR</option>
                                <option value="GBP">GBP</option>
                            </select>
                        </div>
                        <div style="margin-bottom:24px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Pricebook description</label>
                            <input type="text" id="pb-desc" required placeholder="Enter pricebook description" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;font-size:13px;" />
                        </div>
                        <div style="display:flex;justify-content:flex-end;gap:12px;">
                            <button type="button" id="pb-cancel-btn" style="height:38px;padding:0 20px;border:1px solid #111827;background:#FFF;color:#111827;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer;">Cancel</button>
                            <button type="submit" style="height:38px;padding:0 20px;border:none;background:#111827;color:#FFF;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer;">Create pricebook</button>
                        </div>
                    </form>
                </div>
            </div>`;

        const div = document.createElement("div");
        div.id = "pb-modal-container";
        div.innerHTML = modalHtml;
        document.body.appendChild(div);

        const close = () => { div.remove(); };
        div.querySelector("#pb-modal-close").onclick = close;
        div.querySelector("#pb-cancel-btn").onclick = close;
        div.querySelector("#pb-modal-backdrop").onclick = e => { if (e.target.id === "pb-modal-backdrop") close(); };

        div.querySelector("#pb-create-form").onsubmit = e => {
            e.preventDefault();
            const extNum = div.querySelector("#pb-ext-num").value.trim() || ("EXT-" + Math.floor(1000 + Math.random() * 9000));
            const curr = div.querySelector("#pb-currency").value;
            const desc = div.querySelector("#pb-desc").value.trim() || "New Price Agreement";

            const newPb = window.Store.addPricebook({
                contract_id: contractId,
                external_pricebook_number: extNum,
                currency: curr,
                description: desc,
                supplier: me.company || "Vendor B"
            });

            close();
            toast({ kind: "success", title: "Pricebook Created", body: `Pricebook ${newPb.pricebook_number} created successfully.` });
            if (opts.onSuccess) opts.onSuccess(newPb);
            else window.Router.render();
        };
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

    function showActionMenu(targetEl, items) {
        document.querySelectorAll(".dmp-floating-action-menu").forEach(el => el.remove());
        if (!targetEl || !items || items.length === 0) return;

        const rect = targetEl.getBoundingClientRect();
        const menu = document.createElement("div");
        menu.className = "dmp-floating-action-menu ant-dropdown";
        menu.style.position = "fixed";
        menu.style.zIndex = "999999";
        menu.style.background = "#FFFFFF";
        menu.style.borderRadius = "8px";
        menu.style.boxShadow = "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)";
        menu.style.border = "1px solid #F0F0F0";
        menu.style.padding = "4px";
        menu.style.minWidth = "180px";
        menu.style.boxSizing = "border-box";

        items.forEach(it => {
            if (it.divider) {
                const div = document.createElement("div");
                div.style.height = "1px";
                div.style.background = "#F3F4F6";
                div.style.margin = "4px 0";
                menu.appendChild(div);
                return;
            }
            const btn = document.createElement("button");
            btn.type = "button";
            btn.className = "dmp-action-menu-item";
            btn.style.display = "flex";
            btn.style.alignItems = "center";
            btn.style.gap = "8px";
            btn.style.width = "100%";
            btn.style.padding = "8px 12px";
            btn.style.border = "none";
            btn.style.background = "transparent";
            btn.style.fontSize = "13px";
            btn.style.fontWeight = "400";
            btn.style.color = it.danger ? "#EF4444" : "#1F2937";
            btn.style.borderRadius = "4px";
            btn.style.cursor = "pointer";
            btn.style.textAlign = "left";
            btn.style.lineHeight = "1.4";
            btn.style.transition = "background 0.15s, color 0.15s";

            btn.onmouseenter = () => { btn.style.background = it.danger ? "#FEF2F2" : "#F3F4F6"; };
            btn.onmouseleave = () => { btn.style.background = "transparent"; };

            btn.innerHTML = `${it.icon ? `<span style="display:inline-flex;align-items:center;font-size:14px;">${it.icon}</span>` : ""}<span>${esc(it.label)}</span>`;
            btn.onclick = (e) => {
                e.stopPropagation();
                menu.remove();
                if (typeof it.onClick === "function") it.onClick();
            };
            menu.appendChild(btn);
        });

        document.body.appendChild(menu);

        const menuRect = menu.getBoundingClientRect();
        let top = rect.bottom + 4;
        let left = rect.right - menuRect.width;

        if (top + menuRect.height > window.innerHeight - 10) {
            top = Math.max(10, rect.top - menuRect.height - 4);
        }
        if (left + menuRect.width > window.innerWidth - 10) {
            left = window.innerWidth - menuRect.width - 10;
        }
        if (left < 10) {
            left = 10;
        }

        menu.style.top = `${top}px`;
        menu.style.left = `${left}px`;

        const closeMenu = (e) => {
            if (e.type === "scroll" && menu.contains(e.target)) return;
            if (!menu.contains(e.target) && e.target !== targetEl && !targetEl.contains(e.target)) {
                menu.remove();
                document.removeEventListener("click", closeMenu, true);
                window.removeEventListener("resize", closeMenu);
                window.removeEventListener("scroll", closeMenu);
            }
        };
        const onHashChange = () => {
            menu.remove();
            window.removeEventListener("hashchange", onHashChange);
        };
        window.addEventListener("hashchange", onHashChange);
        setTimeout(() => {
            document.addEventListener("click", closeMenu, true);
            window.addEventListener("resize", closeMenu);
            window.addEventListener("scroll", closeMenu);
        }, 120);
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
        openPhotoModal,
        emptyFolder,
        openPricebookModal,
        showActionMenu
    };
})();
