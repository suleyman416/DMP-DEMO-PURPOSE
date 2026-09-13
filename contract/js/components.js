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

    function renderHeader() {
        const me = window.Store.currentUser();
        const users = window.Store.users();
        const unread = (window.Store.notifications() || []).filter(n => !n.read).length;

        const custUsers = users.filter(u => window.ContractWorkflow.isCustomer(u));
        const supUsers = users.filter(u => window.ContractWorkflow.isSupplier(u));

        const userRow = u => `
            <div class="role-menu-item ${u.id === me.id ? "active" : ""}" data-act="user-pick" data-user="${esc(u.id)}">
                <div>
                    <div style="font-weight:700">${esc(u.name)}</div>
                    <span class="user-sub">${esc(u.company)} · ${esc(u.role)}</span>
                </div>
            </div>`;

        const header = document.getElementById("app-header");
        if (!header) return;
        header.className = "flex-align-center w-full container-TR4ALy";

        // Header matching live reference exactly
        header.innerHTML = `
            <div class="flex-align-center left-JWidsa">
                <div>
                    <div class="flex-center icon-utU0AI" data-act="nav-drawer" data-testid="navigation-drawer-open-button" title="Menu">
                        <svg width="26" height="26" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg" color="#121212">
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.16663 13C2.16663 12.4017 2.65165 11.9167 3.24996 11.9167H22.75C23.3483 11.9167 23.8333 12.4017 23.8333 13C23.8333 13.5983 23.3483 14.0834 22.75 14.0834H3.24996C2.65165 14.0834 2.16663 13.5983 2.16663 13Z" fill="#3A3A3A"></path>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.16663 6.50002C2.16663 5.90171 2.65165 5.41669 3.24996 5.41669H22.75C23.3483 5.41669 23.8333 5.90171 23.8333 6.50002C23.8333 7.09833 23.3483 7.58335 22.75 7.58335H3.24996C2.65165 7.58335 2.16663 7.09833 2.16663 6.50002Z" fill="#3A3A3A"></path>
                            <path fill-rule="evenodd" clip-rule="evenodd" d="M2.16663 19.5C2.16663 18.9017 2.65165 18.4167 3.24996 18.4167H22.75C23.3483 18.4167 23.8333 18.9017 23.8333 19.5C23.8333 20.0983 23.3483 20.5834 22.75 20.5834H3.24996C2.65165 20.5834 2.16663 20.0983 2.16663 19.5Z" fill="#3A3A3A"></path>
                        </svg>
                    </div>
                </div>
                <div class="logo-XwY0D7" data-act="home" title="DMP Home">
                    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true">
                        <rect width="46" height="46" fill="url(#pattern0_header_logo)"></rect>
                        <defs>
                            <pattern id="pattern0_header_logo" patternContentUnits="objectBoundingBox" width="1" height="1">
                                <use xlink:href="#image0_header_logo" transform="scale(0.00609756)"></use>
                            </pattern>
                            <image id="image0_header_logo" width="164" height="164" xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKQAAACkCAYAAAAZtYVBAAAACXBIWXMAAA7DAAAOwwHHb6hkAAAAGXRFWHRTb2Z0d2FyZQB3d3cuaW5rc2NhcGUub3Jnm+48GgAAArBJREFUeJzt3T1qVFEYxvEnMfiBjUERG+2yEFcRcUeCG3ENQhajjRE/YiExYoxFFIZrLHLuwXmK3w+mOAP35b3wH6Y8CQAAAAAAAAAAAFzbzrYXWLiT5P7gs9+SfJi4C+QwycXg52gL+zLZ7rYXgE2CpIogqSJIqgiSKoKkiiCpIkiqCJIqgqSKIKkiSKoIkiqCpIogqSJIqgiSKoKkiiCpIkiqCJIqgqSKIKkiSKoIkiqCpIogqSJIqgiSKoKkiiCpIkiqCJIqgqSKIKkiSKoIkiqCpIogqSJIqgiSKoKkyt6EGY9yeUfhiPdJvk7Y4V+eJLkx+OzbJD82zvtJ7g3O+pLk08Z5L8njwVnnSd4svttPcnNw3kmSs43z3SQPB2edJnk3+Ow0rzN+P+HzxazZdx2erJh3sJj1YsWsl4tZBytmnVzxnkcr5h0uZm31vkl/2VQRJFUESRVBUkWQVBEkVQRJFUFSRZBUESRVBEkVQVJFkFQRJFUESRVBUkWQVBEkVQRJFUFSRZBUESRVBEkVQVJFkFQRJFUESRVBUkWQVBEkVQRJFUFSRZBUESRVBEkVQVJFkFQRJFUESRVBUkWQVBEkVQRJlZ0JM3ZXzPmZyzvy/riV8Qsuvyf5vPhuzW7ni/NOxn/Ay/dMxi8Fvfg9b9NRkqeD854lebVxXvOeV+12LTNug121wMJZkuOJ82budpG/I11j5qyZZr/ntfjLpoogqSJIqgiSKoKkiiCpIkiqCJIqgqSKIKkiSKoIkiqCpIogqSJIqgiSKoKkiiCpIkiqCJIqgqSKIKkiSKoIkiqCpIogqSJIqgiSKoKkiiCpIkiqCJIqgqSKIKkiSKoIkiqCpIogqSJIqgiSKoKkiiCpMuOuQ7bvQZLbg89+THI6cRcAAAAAAAAAAAD4334BQcGfFZFAiqEAAAAASUVORK5CYII="></image>
                        </defs>
                    </svg>
                </div>
            </div>
            <div class="flex-align-center right-bjThpw">
                <div class="flex-align-center notifications-Pd9iq4" data-act="notif" title="Notifications">
                    <div>
                        <div class="flex-align-center notifications-pLudgr">
                            <svg width="22" height="22" viewBox="0 0 22 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M10.9891 1.82961C12.3155 1.82961 13.5558 2.20269 14.6072 2.85169C14.2902 3.19012 14.0503 3.59323 13.9041 4.03327C13.0292 3.48953 12.0192 3.2024 10.9891 3.20461C10.266 3.20231 9.54948 3.34289 8.88081 3.61826C8.21214 3.89363 7.60445 4.29838 7.09264 4.80925C6.58083 5.32013 6.17497 5.92707 5.89837 6.59524C5.62177 7.2634 5.47989 7.97962 5.48086 8.70277V12.7444L4.24794 15.5796H17.7376L16.4964 12.7453V8.71377L16.4928 8.50752C16.4893 8.40868 16.4832 8.30995 16.4744 8.21144C16.9336 8.2813 17.4024 8.25065 17.8485 8.12161C17.8577 8.23772 17.8647 8.35444 17.8696 8.47177L17.8733 8.70186V12.4565L19.1401 15.3486C19.2163 15.5231 19.2477 15.7138 19.2317 15.9035C19.2157 16.0931 19.1526 16.2758 19.0483 16.4351C18.9439 16.5943 18.8015 16.725 18.634 16.8154C18.4665 16.9058 18.2791 16.953 18.0887 16.9528L13.7428 16.9546C13.7428 18.4726 12.5099 19.7046 10.9891 19.7046C10.2869 19.7058 9.61078 19.4383 9.09945 18.957C8.58812 18.4757 8.2803 17.817 8.23911 17.1159L8.23452 16.9528H3.89777C3.70769 16.9529 3.52055 16.9058 3.35322 16.8156C3.18588 16.7254 3.04361 16.5951 2.93922 16.4362C2.83483 16.2773 2.77161 16.095 2.75523 15.9056C2.73886 15.7162 2.76986 15.5258 2.84544 15.3514L4.10402 12.4574V8.70277C4.10342 7.79908 4.28115 6.90415 4.62703 6.06927C4.97292 5.23439 5.48015 4.47597 6.11967 3.83747C6.75919 3.19897 7.51842 2.69295 8.35385 2.3484C9.18929 2.00386 10.0854 1.82756 10.9891 1.82961ZM12.3641 16.9537L9.61136 16.9555C9.60566 17.3128 9.73914 17.6582 9.98357 17.9188C10.228 18.1794 10.5642 18.3347 10.9211 18.3518C11.2779 18.3689 11.6275 18.2466 11.8958 18.0107C12.164 17.7747 12.33 17.4437 12.3586 17.0875L12.3641 16.9537ZM14.6961 4.63186C14.7922 4.10297 15.0712 3.6247 15.4842 3.28069C15.8973 2.93667 16.4181 2.7488 16.9557 2.74994C17.2568 2.74958 17.555 2.80856 17.8333 2.92351C18.1116 3.03845 18.3645 3.20712 18.5776 3.41986C18.7907 3.6326 18.9597 3.88524 19.0751 4.16335C19.1905 4.44147 19.25 4.73959 19.2501 5.04069C19.2503 5.39802 19.1669 5.75044 19.0067 6.0698C18.8464 6.38917 18.6136 6.66663 18.327 6.88002C18.0404 7.09342 17.7079 7.23684 17.356 7.29883C17.0041 7.36081 16.6425 7.33965 16.3003 7.23702C15.7591 7.07648 15.2962 6.72184 15.0004 6.24109C14.7045 5.76035 14.5965 5.18732 14.697 4.63186" fill="#616161"></path>
                            </svg>
                            <div class="flex-center notificationBadge-PMQGEE">${unread > 9 ? "9+" : unread}</div>
                            <span class="iconDescription-fLXx_E">Notifications</span>
                        </div>
                    </div>
                </div>
                <div class="flex-align-center notifications-Pd9iq4" data-act="cart" title="Shopping cart">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.8333 5.00004H14.1667C14.1667 2.66671 12.3333 0.833374 10 0.833374C7.66667 0.833374 5.83333 2.66671 5.83333 5.00004H4.16667C3.25 5.00004 2.5 5.75004 2.5 6.66671V16.6667C2.5 17.5834 3.25 18.3334 4.16667 18.3334H15.8333C16.75 18.3334 17.5 17.5834 17.5 16.6667V6.66671C17.5 5.75004 16.75 5.00004 15.8333 5.00004ZM10 2.50004C11.4167 2.50004 12.5 3.58337 12.5 5.00004H7.5C7.5 3.58337 8.58333 2.50004 10 2.50004ZM15.8333 16.6667H4.16667V6.66671H15.8333V16.6667ZM10 10C8.58333 10 7.5 8.91671 7.5 7.50004H5.83333C5.83333 9.83337 7.66667 11.6667 10 11.6667C12.3333 11.6667 14.1667 9.83337 14.1667 7.50004H12.5C12.5 8.91671 11.4167 10 10 10Z" fill="#616161"></path>
                    </svg>
                    <span class="iconDescription-P1X8B_">Shopping cart</span>
                </div>
                <div class="settings-jKlbt0" data-act="user-toggle" title="Switch Persona / User Settings">
                    <div class="flex-center user-FrK5S0">
                        <div class="userPhoto-nvYykg"></div>
                        <div class="flex-column userDetails-iMwhep">
                            <span class="userName-EkwbSx">${esc(me.name)}</span>
                            <span class="userCompany-Old1Dv">${esc(me.company)}</span>
                        </div>
                    </div>
                    <div class="role-menu" id="role-menu" style="position: absolute; right: 0; top: calc(100% + 10px);">
                        <div class="role-menu-head">Customer (Procurement)</div>
                        ${custUsers.map(userRow).join("")}
                        <div class="role-menu-head" style="border-top:1px solid var(--border-soft)">Suppliers</div>
                        ${supUsers.map(userRow).join("")}
                        <div class="role-menu-head" style="border-top:1px solid var(--border-soft)">Demo Actions</div>
                        <div class="role-menu-item" data-act="reset-demo"><span>&#8635; Reset demo data</span></div>
                    </div>
                </div>
            </div>`;

        bindActions(header, {
            "home": () => go("#/contracts"),
            "nav-drawer": () => openNavDrawer(),
            "user-toggle": (t, e) => {
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
            "cart": () => {
                window.location.href = window.DP_URL ? (window.DP_URL + "#/cart") : "http://127.0.0.1:8123/#/cart";
            },
            "reset-demo": () => {
                const rm = document.getElementById("role-menu");
                if (rm) rm.classList.remove("open");
                window.Store.reset();
                toast({ kind: "success", title: "Demo Reset", body: "Contract demo data re-seeded." });
                go("#/contracts");
                renderHeader();
                window.Router.render();
            }
        });

        if (!document.__menuCloseBound) {
            document.__menuCloseBound = true;
            document.addEventListener("click", e => {
                if (!e.target.closest(".settings-jKlbt0")) {
                    const m = document.getElementById("role-menu");
                    if (m) m.classList.remove("open");
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
            doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
            book: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
            req: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`,
            spm: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
            chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
            bag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`
        };

        const currentHash = window.location.hash || "#/contracts";
        const link = (hash, icon, label) => `
            <div class="drawer-link ${currentHash.startsWith(hash) ? "drawer-link-active" : ""}" data-go="${hash}">
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
                ${link("#/contracts", ic.doc, "Contracts List")}
                ${link("#/pricebooks", ic.book, "Global Pricebooks")}
                ${link("#/ctr-requests", ic.req, "CTR Requests")}
                ${isCust ? link("#/spm", ic.spm, "SPM Suppliers") : ""}

                <div class="drawer-section">Modules</div>
                ${extLink(DP_URL, ic.chart, "Demand Planning")}
                ${extLink(SOURCING_URL, ic.bag, "Sourcing")}
                <div class="drawer-link drawer-link-active">${ic.doc}<span>Contract</span></div>

                <div class="drawer-foot">
                    Acting as <strong>${esc(me.role)}</strong><br>
                    <span style="color:var(--text-light)">${esc(me.name)} (${esc(me.company)})</span>
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

    function renderBreadcrumbs(items) {
        return `
            <div class="motion-content-header contentHeader-SOWwbQ">
                <nav class="flex-align-center breadcrumbs-mhE9Ok">
                    ${items.map((it, idx) => {
                        const isLast = idx === items.length - 1;
                        if (isLast) {
                            return `<span class="flex-align-center item-Vrkft2"><span class="link-h7l698">${esc(it.label)}</span></span>`;
                        }
                        return `<span class="flex-align-center item-Vrkft2 grayed-XXam4F">
                            <a href="${esc(it.hash || '#/contracts')}" class="link-h7l698">${esc(it.label)}</a>
                            <span class="separator-p6lKQR">
                                <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);">
                                    <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                </svg>
                            </span>
                        </span>`;
                    }).join("")}
                </nav>
            </div>`;
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
        renderBreadcrumbs,
        renderFeedbackBubble,
        openPhotoModal
    };
})();
