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
            if (e.target.closest("input, select, textarea") && !e.target.closest("[data-act]")) {
                return;
            }
            const t = e.target.closest("[data-act]");
            if (!t || !root.contains(t)) return;
            const fn = map[t.getAttribute("data-act")];
            if (fn) {
                e.preventDefault();
                e.stopPropagation();
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
        initAllDatePickers(overlay);
        initAllCustomSelects(overlay);
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
                <div class="logo-area" data-act="home" style="cursor:pointer;">
                    <img class="logo-img" src="img/logo.svg" alt="dmp — Digital Material Purchasing">
                </div>
            </div>
            <div class="header-right">
                <button class="icon-btn" data-act="notif" style="display:flex;align-items:center;gap:6px;background:none;border:none;cursor:pointer;padding:6px 10px;color:#616161;">
                    <span style="position:relative;display:inline-flex;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                        <span class="count-badge" style="position:absolute;top:-6px;right:-8px;background:#EF4444;color:#FFF;font-size:10px;font-weight:700;padding:1px 5px;border-radius:10px;line-height:1.2;">${notifBadge}</span>
                    </span>
                    <span style="font-size:13px;font-weight:500;">Notifications</span>
                </button>
                ${cartHtml}
                <div class="user-profile" data-act="user-toggle" style="display:flex;align-items:center;gap:8px;cursor:pointer;position:relative;padding:4px 6px;border-radius:6px;">
                    <div class="user-avatar" style="width:36px;height:36px;border-radius:50%;background:#71717A;color:#FFF;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:13px;">
                        ${isCust ? "DC" : "DS"}
                    </div>
                    <div class="user-info" style="display:flex;flex-direction:column;text-align:left;">
                        <div class="user-name" style="font-size:13px;font-weight:600;color:#18181B;line-height:1.2;">${isCust ? "Demo Customer" : "Demo Supplier B"}</div>
                        <div class="user-company" style="font-size:11.5px;color:#71717A;line-height:1.2;">${isCust ? "DMP Demo Company" : "Vendor B"}</div>
                    </div>
                    <div class="role-menu" id="role-menu" style="display:none;position:absolute;top:100%;right:0;margin-top:8px;background:#FFF;border-radius:8px;box-shadow:0 10px 25px rgba(0,0,0,0.15);border:1px solid #E5E7EB;min-width:220px;z-index:99999;padding:6px 0;">
                        <div class="role-menu-head" style="padding:6px 14px;font-size:11px;font-weight:700;color:#9CA3AF;text-transform:uppercase;">Switch Persona (Demo)</div>
                        <div class="role-menu-head" style="padding:6px 14px;font-size:11px;font-weight:700;color:#6B7280;background:#F9FAFB;">Customer</div>
                        ${custUsers.map(userRow).join('')}
                        <div class="role-menu-head" style="padding:6px 14px;font-size:11px;font-weight:700;color:#6B7280;background:#F9FAFB;border-top:1px solid #F3F4F6;">Suppliers</div>
                        ${supUsers.map(userRow).join('')}
                        <div class="role-menu-head" style="padding:6px 14px;font-size:11px;font-weight:700;color:#6B7280;background:#F9FAFB;border-top:1px solid #F3F4F6;">Demo Storage</div>
                        <div class="role-menu-item" data-act="reset-demo" style="padding:8px 14px;font-size:13px;color:#EF4444;cursor:pointer;"><span>↻ Reset demo data</span></div>
                    </div>
                </div>
            </div>`;

        bindActions(header, {
            "home": () => { window.location.href = location.port === '8125' ? '/main' : '../'; },
            "nav-drawer": () => openNavDrawer(),
            "user-toggle": () => {
                const rm = document.getElementById("role-menu");
                if (rm) rm.style.display = (rm.style.display === "none" || !rm.style.display) ? "block" : "none";
            },
            "user-pick": (t) => {
                const rm = document.getElementById("role-menu");
                if (rm) rm.style.display = "none";
                window.Store.setUser(t.getAttribute("data-user"));
                renderHeader();
                window.Router.render();
            },
            "notif": () => toggleNotifPanel(),
            "reset-demo": () => {
                const rm = document.getElementById("role-menu");
                if (rm) rm.style.display = "none";
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
                if (!e.target.closest(".user-profile")) {
                    const m = document.getElementById("role-menu");
                    if (m) m.style.display = "none";
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
        initAllCustomSelects(div);

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

    function openEditExternalPbModal(opts) {
        opts = opts || {};
        const pbid = opts.pricebookId;
        const currVal = opts.currentValue || "";

        const modalHtml = `
            <div class="dmp-modal-backdrop" id="edit-ext-pb-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="dmp-modal-box" style="background:#FFF;border-radius:8px;width:480px;max-width:94vw;box-shadow:0 12px 30px rgba(0,0,0,0.18);padding:24px 28px;position:relative;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                        <h2 style="font-size:17px;font-weight:600;color:#111827;margin:0;">Edit external pricebook number</h2>
                        <button type="button" id="edit-ext-pb-close" style="background:none;border:none;font-size:20px;cursor:pointer;color:#6B7280;line-height:1;">✕</button>
                    </div>
                    <form id="edit-ext-pb-form">
                        <div style="margin-bottom:20px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">External pricebook number</label>
                            <input type="text" id="edit-ext-pb-input" value="${esc(currVal)}" placeholder="Enter external pricebook number" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;font-size:13px;outline:none;" />
                            <div style="font-size:11px;color:#9CA3AF;margin-top:4px;">Customer-specific reference number</div>
                        </div>
                        <div style="display:flex;justify-content:flex-end;gap:12px;">
                            <button type="button" id="edit-ext-pb-cancel" style="height:38px;padding:0 18px;border:1px solid #D9D9D9;background:#FFF;color:#374151;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer;">Cancel</button>
                            <button type="submit" style="height:38px;padding:0 20px;border:none;background:#111827;color:#FFF;border-radius:4px;font-size:13px;font-weight:500;cursor:pointer;">Save changes</button>
                        </div>
                    </form>
                </div>
            </div>`;

        const div = document.createElement("div");
        div.id = "edit-ext-pb-container";
        div.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;";
        div.innerHTML = modalHtml;
        document.body.appendChild(div);

        const input = div.querySelector("#edit-ext-pb-input");
        if (input) {
            setTimeout(() => {
                input.focus();
                input.select();
            }, 50);
        }

        const close = () => { div.remove(); };
        div.querySelector("#edit-ext-pb-close").onclick = close;
        div.querySelector("#edit-ext-pb-cancel").onclick = close;
        div.querySelector("#edit-ext-pb-backdrop").onclick = e => { if (e.target.id === "edit-ext-pb-backdrop") close(); };

        const handleKey = (e) => {
            if (e.key === "Escape") {
                close();
                document.removeEventListener("keydown", handleKey);
            }
        };
        document.addEventListener("keydown", handleKey);

        div.querySelector("#edit-ext-pb-form").onsubmit = e => {
            e.preventDefault();
            document.removeEventListener("keydown", handleKey);
            const newVal = input.value.trim();
            if (pbid) {
                window.Store.set(s => {
                    const target = (s.pricebooks || []).find(x => x.id === pbid);
                    if (target) target.external_pricebook_number = newVal;
                });
            }
            close();
            toast({ kind: "success", title: "Pricebook Updated", body: `External pricebook number set to ${newVal || "(empty)"}` });
            if (opts.onSuccess) opts.onSuccess(newVal);
        };
    }

    /* ---------- breadcrumb band matching demov2 ---------- */
    function breadcrumb() {
        const parts = Array.prototype.slice.call(arguments);
        if (parts.length === 0) return "";
        if (parts.length === 1) {
            return `<div class="crumb-band"><span class="crumb-cur">${esc(parts[0])}</span></div>`;
        }
        return `<div class="crumb-band">
            ${parts.map((p, i) => {
                const isLast = i === parts.length - 1;
                let href = "#/contracts";
                if (p === "Contracts") href = "#/contracts";
                else if (p === "Suppliers") href = "#/spm";
                else if (p === "My Pricebooks") href = "#/pricebooks";
                else if (p === "Contract module requests") href = "#/ctr-requests";
                else if (p.startsWith("Contract #")) {
                    const match = p.match(/Contract #\s*([A-Za-z0-9_-]+)/);
                    if (match) href = `#/contracts/${match[1]}`;
                }
                const link = isLast ? `<span class="crumb-cur">${esc(p)}</span>` : `<a class="crumb-muted" href="${href}">${esc(p)}</a>`;
                return (i > 0 ? `<span class="crumb-sep">›</span>` : "") + link;
            }).join("")}
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

    /* -------------------------------------------------------------
       1:1 DMP Ant Design Calendar DatePicker Component
       ------------------------------------------------------------- */
    const MONTH_NAMES = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    const DAY_NAMES = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

    function pad2(n) { return n < 10 ? "0" + n : String(n); }

    function renderDatePickerHTML(opts = {}) {
        const val = opts.value || "";
        const name = opts.name || "";
        const testId = opts.testId || "";
        const placeholder = opts.placeholder || "YYYY-MM-DD";
        const req = opts.required ? "required" : "";
        return `
            <div class="ant-picker ant-picker-outlined datepicker-t5AVY9" data-datepicker="1" ${testId ? `data-testid="${testId}"` : ""}>
                <div class="ant-picker-input">
                    <input type="text" name="${name}" placeholder="${placeholder}" value="${esc(val)}" autocomplete="off" ${req} ${testId ? `data-testid="${testId}-input"` : ""}>
                    <span class="ant-picker-suffix">
                        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                        </svg>
                    </span>
                </div>
            </div>
        `;
    }

    function initDatePicker(containerOrInput, opts = {}) {
        let container = containerOrInput;
        let input = null;

        if (containerOrInput.tagName === "INPUT") {
            input = containerOrInput;
            container = input.closest(".datepicker-t5AVY9, .ant-picker");
            if (!container) {
                container = document.createElement("div");
                container.className = "ant-picker ant-picker-outlined datepicker-t5AVY9";
                input.parentNode.insertBefore(container, input);
                const wrapper = document.createElement("div");
                wrapper.className = "ant-picker-input";
                wrapper.appendChild(input);
                container.appendChild(wrapper);
            }
        } else {
            input = container.querySelector("input");
        }

        if (!input) return;
        if (container.__dpInitialized) return;
        container.__dpInitialized = true;

        // Ensure suffix icon exists
        let suffix = container.querySelector(".ant-picker-suffix");
        if (!suffix) {
            const wrap = container.querySelector(".ant-picker-input") || container;
            suffix = document.createElement("span");
            suffix.className = "ant-picker-suffix";
            suffix.innerHTML = `
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                </svg>
            `;
            wrap.appendChild(suffix);
        }

        let activeDropdown = null;

        const closeDropdown = () => {
            if (activeDropdown) {
                activeDropdown.remove();
                activeDropdown = null;
                container.classList.remove("ant-picker-focused", "focused");
                document.removeEventListener("click", onDocClick, true);
                window.removeEventListener("resize", closeDropdown);
            }
        };

        const onDocClick = e => {
            if (activeDropdown && !activeDropdown.contains(e.target) && !container.contains(e.target)) {
                closeDropdown();
            }
        };

        const openDropdown = () => {
            // Close any other open datepickers
            document.querySelectorAll(".ant-picker-dropdown").forEach(d => d.remove());

            container.classList.add("ant-picker-focused", "focused");
            clearDatePickerError(input);

            // Parse initial date
            const today = new Date();
            let viewYear = today.getFullYear();
            let viewMonth = today.getMonth();
            let selectedDateStr = (input.value || "").trim();

            if (/^\d{4}-\d{2}-\d{2}$/.test(selectedDateStr)) {
                const parts = selectedDateStr.split("-");
                viewYear = parseInt(parts[0], 10);
                viewMonth = parseInt(parts[1], 10) - 1;
            }

            activeDropdown = document.createElement("div");
            activeDropdown.className = "ant-picker-dropdown popup-CWX6Lv ant-picker-dropdown-placement-bottomLeft";
            document.body.appendChild(activeDropdown);

            // Positioning
            const rect = container.getBoundingClientRect();
            let top = rect.bottom + window.scrollY + 4;
            let left = rect.left + window.scrollX;
            if (left + 290 > window.innerWidth) {
                left = Math.max(10, rect.right + window.scrollX - 288);
            }
            activeDropdown.style.top = `${top}px`;
            activeDropdown.style.left = `${left}px`;

            const renderCalendar = (y, m) => {
                const firstDayIdx = new Date(y, m, 1).getDay(); // 0 = SUN
                const daysInMonth = new Date(y, m + 1, 0).getDate();
                const daysInPrevMonth = new Date(y, m, 0).getDate();

                const todayIso = `${today.getFullYear()}-${pad2(today.getMonth() + 1)}-${pad2(today.getDate())}`;

                let rowsHtml = "";
                let dayCounter = 1;
                let nextMonthDay = 1;

                for (let row = 0; row < 6; row++) {
                    let colsHtml = "";
                    for (let col = 0; col < 7; col++) {
                        const cellIdx = row * 7 + col;
                        let cellYear = y;
                        let cellMonth = m;
                        let cellDay = 0;
                        let inView = false;

                        if (cellIdx < firstDayIdx) {
                            // Prev month day
                            cellDay = daysInPrevMonth - (firstDayIdx - cellIdx - 1);
                            cellMonth = m - 1;
                            if (cellMonth < 0) { cellMonth = 11; cellYear = y - 1; }
                        } else if (dayCounter <= daysInMonth) {
                            // Current month day
                            cellDay = dayCounter;
                            inView = true;
                            dayCounter++;
                        } else {
                            // Next month day
                            cellDay = nextMonthDay;
                            cellMonth = m + 1;
                            if (cellMonth > 11) { cellMonth = 0; cellYear = y + 1; }
                            nextMonthDay++;
                        }

                        const dateIso = `${cellYear}-${pad2(cellMonth + 1)}-${pad2(cellDay)}`;
                        const isToday = dateIso === todayIso;
                        const isSelected = dateIso === selectedDateStr;

                        let classes = "ant-picker-cell";
                        if (inView) classes += " ant-picker-cell-in-view";
                        if (isToday) classes += " ant-picker-cell-today";
                        if (isSelected) classes += " ant-picker-cell-selected";

                        colsHtml += `
                            <td class="${classes}" title="${dateIso}" data-date="${dateIso}">
                                <div class="ant-picker-cell-inner">${cellDay}</div>
                                <span class="ant-picker-tooltip">${dateIso}</span>
                            </td>
                        `;
                    }
                    rowsHtml += `<tr>${colsHtml}</tr>`;
                    if (dayCounter > daysInMonth && row >= 4) break;
                }

                activeDropdown.innerHTML = `
                    <div class="ant-picker-panel-container">
                        <div class="ant-picker-panel">
                            <div class="ant-picker-date-panel">
                                <div class="ant-picker-header">
                                    <button type="button" class="ant-picker-header-super-prev-btn" title="Last year" id="dp-super-prev">&laquo;</button>
                                    <button type="button" class="ant-picker-header-prev-btn" title="Previous month" id="dp-prev">&lsaquo;</button>
                                    <div class="ant-picker-header-view">
                                        <button type="button" class="ant-picker-month-btn">${MONTH_NAMES[m]}</button>
                                        <button type="button" class="ant-picker-year-btn">${y}</button>
                                    </div>
                                    <button type="button" class="ant-picker-header-next-btn" title="Next month" id="dp-next">&rsaquo;</button>
                                    <button type="button" class="ant-picker-header-super-next-btn" title="Next year" id="dp-super-next">&raquo;</button>
                                </div>
                                <div class="ant-picker-body">
                                    <table class="ant-picker-content">
                                        <thead>
                                            <tr>${DAY_NAMES.map(d => `<th>${d}</th>`).join("")}</tr>
                                        </thead>
                                        <tbody>${rowsHtml}</tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                `;

                // Bind navigation
                activeDropdown.querySelector("#dp-super-prev").onclick = e => {
                    e.stopPropagation();
                    viewYear -= 1;
                    renderCalendar(viewYear, viewMonth);
                };
                activeDropdown.querySelector("#dp-prev").onclick = e => {
                    e.stopPropagation();
                    viewMonth -= 1;
                    if (viewMonth < 0) { viewMonth = 11; viewYear -= 1; }
                    renderCalendar(viewYear, viewMonth);
                };
                activeDropdown.querySelector("#dp-next").onclick = e => {
                    e.stopPropagation();
                    viewMonth += 1;
                    if (viewMonth > 11) { viewMonth = 0; viewYear += 1; }
                    renderCalendar(viewYear, viewMonth);
                };
                activeDropdown.querySelector("#dp-super-next").onclick = e => {
                    e.stopPropagation();
                    viewYear += 1;
                    renderCalendar(viewYear, viewMonth);
                };

                // Bind date cell clicks
                activeDropdown.querySelectorAll("td[data-date]").forEach(td => {
                    td.onclick = e => {
                        e.stopPropagation();
                        const picked = td.getAttribute("data-date");
                        input.value = picked;
                        selectedDateStr = picked;
                        clearDatePickerError(input);
                        input.dispatchEvent(new Event("input", { bubbles: true }));
                        input.dispatchEvent(new Event("change", { bubbles: true }));
                        if (opts.onSelect) opts.onSelect(picked);
                        closeDropdown();
                    };
                });
            };

            renderCalendar(viewYear, viewMonth);

            setTimeout(() => {
                document.addEventListener("click", onDocClick, true);
                window.addEventListener("resize", closeDropdown);
            }, 10);
        };

        container.onclick = e => {
            if (activeDropdown) {
                if (e.target === input) return;
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        input.onfocus = () => {
            if (!activeDropdown) openDropdown();
        };

        input.onkeydown = e => {
            if (e.key === "Escape") closeDropdown();
        };
    }

    function setDatePickerError(inputEl, msg) {
        if (!inputEl) return;
        const container = inputEl.closest(".ant-picker, .datepicker-t5AVY9");
        if (container) {
            container.classList.add("has-error");
            let errEl = container.nextElementSibling;
            if (!errEl || !errEl.classList.contains("field-error-message")) {
                errEl = document.createElement("div");
                errEl.className = "field-error-message";
                container.parentNode.insertBefore(errEl, container.nextSibling);
            }
            errEl.textContent = msg;
        }
    }

    function clearDatePickerError(inputEl) {
        if (!inputEl) return;
        const container = inputEl.closest(".ant-picker, .datepicker-t5AVY9");
        if (container) {
            container.classList.remove("has-error");
            const errEl = container.nextElementSibling;
            if (errEl && errEl.classList.contains("field-error-message")) {
                errEl.remove();
            }
        }
    }

    function initAllDatePickers(root = document) {
        const containers = root.querySelectorAll("[data-datepicker='1'], .datepicker-t5AVY9, .ant-picker");
        containers.forEach(c => initDatePicker(c));
    }

    /* ============================================================
       1:1 Ant Design Custom Select Engine
       Exact match with live DMP design reference:
       - Custom floating dropdown popup with soft shadow & rounded corners
       - Light sage/olive green selected item with green checkmark
       - Official Ant Design Empty State ("No data" with tray SVG)
       - Hover state with tooltip matching media_1789641175872.png
       - Upward / downward auto-flip positioning
       ============================================================ */
    function initCustomSelect(target, opts = {}) {
        if (!target) return;

        let container = target;
        let select = target.matches("select") ? target : target.querySelector("select");

        if (!select) return;

        // If a standalone <select> was provided without an .ant-select container, wrap it
        if (target.matches("select")) {
            if (target.parentElement && target.parentElement.classList.contains("ant-select")) {
                container = target.parentElement;
            } else {
                container = document.createElement("div");
                container.className = "ant-select ant-select-outlined select-l8uECl css-1r50iqp ant-select-single ant-select-show-arrow";
                if (target.style.width) container.style.width = target.style.width;
                if (target.classList.contains("w-full")) container.classList.add("w-full");

                const selector = document.createElement("div");
                selector.className = "ant-select-selector";
                selector.style.cssText = "display:flex;align-items:center;width:100%;height:100%;";

                const wrap = document.createElement("span");
                wrap.className = "ant-select-selection-wrap";
                wrap.style.cssText = "flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;";

                const initialOpt = target.querySelector("option:checked") || target.options[0];
                const isPl = !initialOpt || initialOpt.value === "" || initialOpt.disabled;

                wrap.innerHTML = `<span class="${isPl ? 'ant-select-selection-placeholder' : 'ant-select-selection-item'}" style="font-size:13.5px;color:${isPl ? '#8C8C8C' : '#111827'};">${esc(initialOpt ? initialOpt.textContent : (target.getAttribute('placeholder') || 'Select...'))}</span>`;

                const arrow = document.createElement("span");
                arrow.className = "ant-select-arrow";
                arrow.innerHTML = `<svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

                selector.appendChild(wrap);
                selector.appendChild(arrow);

                target.parentNode.insertBefore(container, target);
                container.appendChild(selector);
                container.appendChild(target);
            }
        }

        function syncDisplay() {
            const checkedOpt = select.querySelector("option:checked") || select.options[select.selectedIndex];
            const isPl = !checkedOpt || checkedOpt.value === "" || checkedOpt.disabled;
            const textSpan = container.querySelector(".ant-select-selection-item, .ant-select-selection-placeholder");
            if (textSpan) {
                textSpan.className = isPl ? "ant-select-selection-placeholder" : "ant-select-selection-item";
                textSpan.style.color = isPl ? "#8C8C8C" : "#111827";
                textSpan.textContent = checkedOpt ? checkedOpt.textContent : (select.getAttribute("placeholder") || "Select...");
            }
        }

        container.__syncDisplay = syncDisplay;

        if (container.__customSelectInitialized) {
            syncDisplay();
            return;
        }
        container.__customSelectInitialized = true;

        container.setAttribute("role", "combobox");
        container.setAttribute("aria-haspopup", "listbox");
        container.setAttribute("aria-expanded", "false");
        container.setAttribute("tabindex", "0");

        // Completely disable native select interactions so OS dropdown NEVER opens
        select.style.position = "absolute";
        select.style.inset = "0";
        select.style.opacity = "0";
        select.style.pointerEvents = "none";
        select.style.zIndex = "-1";

        select.addEventListener("change", syncDisplay);
        select.addEventListener("input", syncDisplay);

        let activeDropdown = null;

        function closeDropdown() {
            if (activeDropdown) {
                activeDropdown.remove();
                activeDropdown = null;
            }
            container.classList.remove("ant-select-open", "ant-select-focused");
            container.setAttribute("aria-expanded", "false");

            const activeTooltip = document.querySelector(".ant-select-item-tooltip");
            if (activeTooltip) activeTooltip.remove();

            document.removeEventListener("click", onDocClick, true);
            window.removeEventListener("resize", closeDropdown);
            window.removeEventListener("scroll", onScroll, true);
        }

        function onDocClick(e) {
            if (activeDropdown && !activeDropdown.contains(e.target) && !container.contains(e.target)) {
                closeDropdown();
            }
        }

        function onScroll(e) {
            if (activeDropdown && !activeDropdown.contains(e.target) && !container.contains(e.target)) {
                closeDropdown();
            }
        }

        function openDropdown() {
            // Close any existing open dropdowns across the application
            document.querySelectorAll(".ant-select-dropdown").forEach(d => d.remove());
            document.querySelectorAll(".ant-select.ant-select-open").forEach(s => {
                s.classList.remove("ant-select-open", "ant-select-focused");
                s.setAttribute("aria-expanded", "false");
            });

            container.classList.add("ant-select-open", "ant-select-focused");
            container.setAttribute("aria-expanded", "true");

            const rect = container.getBoundingClientRect();
            const rawOptions = Array.from(select.querySelectorAll("option"));

            // Filter out placeholder options if they are disabled/hidden or empty string placeholders
            const validOptions = rawOptions.filter(opt => {
                if (opt.disabled || opt.hidden) return false;
                if (opt.value === "" && opt.getAttribute("data-placeholder") === "1") return false;
                if (opt.value === "" && opt.textContent.trim().toLowerCase().startsWith("select")) return false;
                return true;
            });

            const dropdown = document.createElement("div");
            dropdown.className = "ant-select-dropdown ant-select-dropdown-placement-bottomLeft";
            dropdown.setAttribute("role", "listbox");
            dropdown.setAttribute("tabindex", "-1");

            if (validOptions.length === 0) {
                // Official Ant Design Empty State ("No data") matching media_1789641196120.png
                dropdown.classList.add("ant-select-dropdown-empty");
                dropdown.innerHTML = `
                    <div class="ant-select-empty">
                        <div class="ant-empty-image">
                            <svg width="64" height="41" viewBox="0 0 64 41" xmlns="http://www.w3.org/2000/svg">
                                <g transform="translate(0 1)" fill="none" fill-rule="evenodd">
                                    <ellipse fill="#F5F5F5" cx="32" cy="33" rx="32" ry="7"></ellipse>
                                    <g fill-rule="nonzero" stroke="#D9D9D9">
                                        <path d="M55 12.76L44.854 1.258C44.367.474 43.656 0 42.907 0H21.093c-.749 0-1.46.474-1.947 1.257L9 12.761V22h46v-9.24z"></path>
                                        <path d="M41.613 15.914c0 .874-.707 1.583-1.58 1.583H23.967c-.873 0-1.58-.709-1.58-1.583V12.76H9V30.5c0 1.933 1.567 3.5 3.5 3.5h39c1.933 0 3.5-1.567 3.5-3.5V12.76h-13.387v3.154z" fill="#FAFAFA"></path>
                                    </g>
                                </g>
                            </svg>
                        </div>
                        <div class="ant-empty-description">No data</div>
                    </div>
                `;
            } else {
                // Options list matching media_1789641175872.png and media_1789641189225.png
                const curVal = select.value;
                const itemsHtml = validOptions.map(opt => {
                    const isSelected = opt.value === curVal || (!curVal && opt.selected && opt.value !== "");
                    return `
                        <div class="ant-select-item ant-select-item-option ${isSelected ? 'ant-select-item-option-selected' : ''}" 
                             role="option" 
                             aria-selected="${isSelected ? 'true' : 'false'}"
                             data-val="${esc(opt.value)}"
                             data-title="${esc(opt.textContent.trim())}"
                             title="${esc(opt.textContent.trim())}">
                            <div class="ant-select-item-option-content">${esc(opt.textContent.trim())}</div>
                            ${isSelected ? `
                                <span class="ant-select-item-option-state">
                                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.5 4.5L6.5 11.5L3 8" stroke="#4E5D45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                                    </svg>
                                </span>
                            ` : ''}
                        </div>
                    `;
                }).join("");

                dropdown.innerHTML = `<div class="ant-select-dropdown-menu">${itemsHtml}</div>`;

                // Tooltip on hover matching media_1789641175872.png
                dropdown.querySelectorAll(".ant-select-item-option").forEach(itemEl => {
                    itemEl.addEventListener("mouseenter", () => {
                        const titleText = itemEl.getAttribute("data-title");
                        if (!titleText) return;
                        let tip = document.querySelector(".ant-select-item-tooltip");
                        if (!tip) {
                            tip = document.createElement("div");
                            tip.className = "ant-select-item-tooltip";
                            document.body.appendChild(tip);
                        }
                        tip.textContent = titleText;
                        const itemRect = itemEl.getBoundingClientRect();
                        tip.style.left = (itemRect.right + 8) + "px";
                        tip.style.top = (itemRect.top + itemRect.height / 2 - 13) + "px";
                        tip.classList.add("show");
                    });

                    itemEl.addEventListener("mouseleave", () => {
                        const tip = document.querySelector(".ant-select-item-tooltip");
                        if (tip) tip.remove();
                    });

                    // Option click
                    itemEl.addEventListener("click", e => {
                        e.stopPropagation();
                        const tip = document.querySelector(".ant-select-item-tooltip");
                        if (tip) tip.remove();

                        const val = itemEl.getAttribute("data-val");
                        select.value = val;
                        syncDisplay();

                        select.dispatchEvent(new Event("input", { bubbles: true }));
                        select.dispatchEvent(new Event("change", { bubbles: true }));

                        closeDropdown();
                    });
                });
            }

            document.body.appendChild(dropdown);
            activeDropdown = dropdown;

            // Dimensions & Positioning
            const dropdownHeight = dropdown.offsetHeight || (validOptions.length === 0 ? 140 : Math.min(validOptions.length * 36 + 8, 256));
            const viewportHeight = window.innerHeight;
            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            dropdown.style.width = rect.width + "px";
            dropdown.style.left = rect.left + "px";

            // If near the bottom of viewport and more space above, open upwards (as in media_1789641189225.png)
            if (spaceBelow < dropdownHeight + 10 && spaceAbove > spaceBelow) {
                dropdown.classList.remove("ant-select-dropdown-placement-bottomLeft");
                dropdown.classList.add("ant-select-dropdown-placement-topLeft");
                dropdown.style.top = (rect.top - dropdownHeight - 4) + "px";
            } else {
                dropdown.classList.remove("ant-select-dropdown-placement-topLeft");
                dropdown.classList.add("ant-select-dropdown-placement-bottomLeft");
                dropdown.style.top = (rect.bottom + 4) + "px";
            }

            // Scroll selected option into view
            const selEl = dropdown.querySelector(".ant-select-item-option-selected");
            if (selEl) {
                selEl.scrollIntoView({ block: "nearest" });
            }

            setTimeout(() => {
                document.addEventListener("click", onDocClick, true);
                window.addEventListener("resize", closeDropdown);
                window.addEventListener("scroll", onScroll, true);
            }, 10);
        }

        container.onclick = e => {
            e.stopPropagation();
            if (activeDropdown) {
                closeDropdown();
            } else {
                openDropdown();
            }
        };

        container.onkeydown = e => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (activeDropdown) closeDropdown();
                else openDropdown();
            } else if (e.key === "Escape") {
                closeDropdown();
            }
        };
    }

    function initAllCustomSelects(root = document) {
        // 1. Initialize existing .ant-select containers
        const antSelects = root.querySelectorAll(".ant-select");
        antSelects.forEach(c => initCustomSelect(c));

        // 2. Wrap and initialize standalone select elements across all forms, tables, and modals
        const standaloneSelects = root.querySelectorAll("select:not(.native-select-ignore)");
        standaloneSelects.forEach(s => {
            if (!s.closest(".ant-select")) {
                initCustomSelect(s);
            }
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
        openPhotoModal,
        emptyFolder,
        openPricebookModal,
        openEditExternalPbModal,
        showActionMenu,
        renderDatePickerHTML,
        initDatePicker,
        setDatePickerError,
        clearDatePickerError,
        initAllDatePickers,
        initCustomSelect,
        initAllCustomSelects
    };
})();

