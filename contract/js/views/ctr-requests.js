/* ============================================================
   views/ctr-requests.js — Catalogue & Price Change Requests (CTR)
   1-to-1 match with demov2.dmpservice.ai/contract/requests live audit
   ============================================================ */
window.CTRRequestsView = (function () {

    let filterState = {
        search: "",
        statuses: new Set(),
        actionBy: "",
        dateFrom: "",
        dateTo: "",
        assignedTo: "",
        supplier: "",
        currency: "",
        sidebarCollapsed: false,
        rowsPerPage: 10,
        page: 1
    };

    function render(root) {
        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);
        let allRequests = window.Store.ctrRequests() || [];

        // Supplier has 0 requests and sees empty folder state
        if (!isCust) {
            allRequests = allRequests.filter(r => r.supplier_name === me.company);
        }

        const suppliersList = Array.from(new Set(allRequests.map(r => r.supplier_name).filter(Boolean)));
        const assignedList = Array.from(new Set(allRequests.map(r => r.assigned_to).filter(Boolean)));
        const currenciesList = Array.from(new Set(allRequests.map(r => r.currency).filter(Boolean)));

        const hasFilters = Boolean(
            filterState.search ||
            filterState.statuses.size > 0 ||
            filterState.actionBy ||
            filterState.dateFrom ||
            filterState.dateTo ||
            filterState.assignedTo ||
            filterState.supplier ||
            filterState.currency
        );

        const filtered = allRequests.filter(r => {
            if (filterState.search) {
                const q = filterState.search.toLowerCase();
                const match = (r.id && String(r.id).toLowerCase().includes(q)) ||
                              (r.supplier_name && r.supplier_name.toLowerCase().includes(q)) ||
                              (r.assigned_to && r.assigned_to.toLowerCase().includes(q)) ||
                              (r.contract_description && r.contract_description.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (filterState.statuses.size > 0 && !filterState.statuses.has(r.status)) {
                return false;
            }
            if (filterState.actionBy && r.required_action_by !== filterState.actionBy) {
                return false;
            }
            if (filterState.assignedTo && r.assigned_to !== filterState.assignedTo) {
                return false;
            }
            if (filterState.supplier && r.supplier_name !== filterState.supplier) {
                return false;
            }
            if (filterState.currency && r.currency !== filterState.currency) {
                return false;
            }
            if (filterState.dateFrom && r.created_at && r.created_at < filterState.dateFrom) {
                return false;
            }
            if (filterState.dateTo && r.created_at && r.created_at > filterState.dateTo) {
                return false;
            }
            return true;
        });

        const totalRows = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalRows / filterState.rowsPerPage));
        if (filterState.page > totalPages) filterState.page = totalPages;
        const startIdx = (filterState.page - 1) * filterState.rowsPerPage;
        const pageRows = filtered.slice(startIdx, startIdx + filterState.rowsPerPage);

        root.innerHTML = `
            ${window.UI.breadcrumb("Contract module requests")}

            <div class="rfx-layout" style="padding: 16px 28px;">
                <!-- Filter Sidebar matching demov2 08_ctr_3dots_open.png -->
                ${filterState.sidebarCollapsed ? `
                    <aside class="filter-card collapsed">
                        <button class="fc-collapse" data-act="toggle-sidebar" title="Expand filters">»</button>
                    </aside>
                ` : `
                    <aside class="filter-card">
                        <button class="fc-collapse" data-act="toggle-sidebar" title="Collapse filters">«</button>
                        <div class="fc-body">
                            
                            <!-- Status: Open / Closed -->
                            <div class="fc-label">Status</div>
                            <label class="fc-check">
                                <input type="checkbox" value="Open" data-filter="status" ${filterState.statuses.has("Open") ? "checked" : ""}>
                                Open
                            </label>
                            <label class="fc-check">
                                <input type="checkbox" value="Closed" data-filter="status" ${filterState.statuses.has("Closed") ? "checked" : ""}>
                                Closed
                            </label>

                            <!-- Required Action By -->
                            <div class="fc-label">Required Action By</div>
                            <select class="form-select" data-filter="actionBy">
                                <option value="">Select...</option>
                                <option value="Procurement" ${filterState.actionBy === "Procurement" ? "selected" : ""}>Procurement</option>
                                <option value="CAM" ${filterState.actionBy === "CAM" ? "selected" : ""}>CAM</option>
                            </select>

                            <!-- Created date range -->
                            <div class="fc-label">Created date range</div>
                            <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:12px;">
                                <input type="text" placeholder="YYYY-MM-DD" class="form-input" data-filter="dateFrom" value="${filterState.dateFrom}" style="height:36px; padding:0 10px; font-size:13px; border:1px solid #D1D5DB; border-radius:4px;">
                                <input type="text" placeholder="YYYY-MM-DD" class="form-input" data-filter="dateTo" value="${filterState.dateTo}" style="height:36px; padding:0 10px; font-size:13px; border:1px solid #D1D5DB; border-radius:4px;">
                            </div>

                            <!-- Assigned to -->
                            <div class="fc-label">Assigned to</div>
                            <select class="form-select" data-filter="assignedTo">
                                <option value="">Select...</option>
                                ${assignedList.map(a => `<option value="${window.UI.esc(a)}" ${filterState.assignedTo === a ? "selected" : ""}>${window.UI.esc(a)}</option>`).join("")}
                            </select>

                            <!-- Supplier name -->
                            <div class="fc-label">Supplier name</div>
                            <select class="form-select" data-filter="supplier">
                                <option value="">Select...</option>
                                ${suppliersList.map(s => `<option value="${window.UI.esc(s)}" ${filterState.supplier === s ? "selected" : ""}>${window.UI.esc(s)}</option>`).join("")}
                            </select>

                            <!-- Currency -->
                            <div class="fc-label">Currency</div>
                            <select class="form-select" data-filter="currency">
                                <option value="">Select...</option>
                                ${currenciesList.map(c => `<option value="${window.UI.esc(c)}" ${filterState.currency === c ? "selected" : ""}>${window.UI.esc(c)}</option>`).join("")}
                            </select>
                        </div>
                        <div class="fc-clear" data-act="clear-all-filters" style="${hasFilters ? "opacity:1;cursor:pointer;" : "opacity:0.5;pointer-events:none;"}">Clear All Filters</div>
                    </aside>
                `}

                <!-- Main Table Section -->
                <div class="rfx-main">
                    
                    <div class="rfx-toolbar" style="margin-bottom: 16px;">
                        <div class="rfx-search" style="width:100%; max-width:300px;">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input placeholder="Search here" data-filter="search" value="${window.UI.esc(filterState.search)}" id="search-here-input">
                        </div>
                    </div>

                    ${totalRows === 0 ? `
                        <!-- Empty State Graphic matching demov2 05_supplier_ctr_requests.png -->
                        <div style="background:#FFFFFF; border:1px solid #E5E7EB; border-radius:6px; padding:60px 20px; text-align:center; min-height:400px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                            <div style="width:80px; height:80px; margin-bottom:16px;">
                                <svg viewBox="0 0 64 64" fill="none" style="width:100%; height:100%;">
                                    <path d="M10 18C10 15.7909 11.7909 14 14 14H26L32 20H50C52.2091 20 54 21.7909 54 24V48C54 50.2091 52.2091 52 50 52H14C11.7909 52 10 50.2091 10 48V18Z" fill="#F3F4F6" stroke="#D1D5DB" stroke-width="2"/>
                                    <path d="M22 36H42M22 42H34" stroke="#9CA3AF" stroke-width="2" stroke-linecap="round"/>
                                </svg>
                            </div>
                            <div style="font-size:14px; font-weight:500; color:#6B7280;">No data</div>
                        </div>
                    ` : `
                        <div class="table-container" style="background:#FFFFFF; border:1px solid #E5E7EB; border-radius:6px; overflow:hidden;">
                            <table class="data-table" style="width:100%; border-collapse:collapse; font-size:13px;">
                                <thead>
                                    <tr style="background:#FAFAFA; border-bottom:1px solid #E5E7EB; height:44px;">
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Status</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Required Action By</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;"># of Items</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Supplier Name</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Currency</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Assigned To</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Creation date and time</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Last update date and time</th>
                                        ${isCust ? `<th style="padding:0 12px; text-align:right; width:40px;"></th>` : ""}
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pageRows.map(r => {
                                        const isClosed = r.status === "Closed";
                                        const dotColor = isClosed ? "#EF4444" : "#10B981";
                                        return `
                                            <tr data-act="open-ctr-req" data-id="${r.id}" style="border-bottom:1px solid #F3F4F6; height:54px; cursor:pointer;" class="clickable-row">
                                                <td style="padding:0 12px;">
                                                    <span style="display:inline-flex; align-items:center; gap:6px; font-weight:500; color:#111827;">
                                                        <span style="width:7px; height:7px; border-radius:50%; background:${dotColor}; display:inline-block;"></span>
                                                        ${window.UI.esc(r.status)}
                                                    </span>
                                                </td>
                                                <td style="padding:0 12px; color:#374151;">${window.UI.esc(r.required_action_by || "Procurement")}</td>
                                                <td style="padding:0 12px; color:#374151;">${r.items_count || 1}</td>
                                                <td style="padding:0 12px; font-weight:500; color:#111827;">${window.UI.esc(r.supplier_name)}</td>
                                                <td style="padding:0 12px; color:#374151;">${window.UI.esc(r.currency || "USD")}</td>
                                                <td style="padding:0 12px; color:#374151;">${window.UI.esc(r.assigned_to || "Aisel Verdieva")}</td>
                                                <td style="padding:0 12px; color:#6B7280;">${window.UI.esc(r.created_at)}</td>
                                                <td style="padding:0 12px; color:#6B7280;">${window.UI.esc(r.updated_at || r.created_at)}</td>
                                                ${isCust ? `
                                                    <td style="padding:0 12px; text-align:right;">
                                                        <button class="icon-btn" data-act="ctr-req-options" data-id="${r.id}" aria-label="More options" style="display:inline-flex; padding:6px; font-size:16px; background:none; border:none; cursor:pointer; color:#6B7280;" title="Actions">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                                        </button>
                                                    </td>
                                                ` : ""}
                                            </tr>
                                        `;
                                    }).join("")}
                                </tbody>
                            </table>

                            <!-- Pagination -->
                            <div class="rfx-pager" style="display:flex; justify-content:flex-end; align-items:center; padding:12px 16px; border-top:1px solid #E5E7EB;">
                                <button class="pg-btn" data-act="prev-page" ${filterState.page <= 1 ? "disabled" : ""}>‹</button>
                                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                                    <button class="pg-num ${p === filterState.page ? "active" : ""}" data-act="set-page" data-page="${p}">${p}</button>
                                `).join("")}
                                <button class="pg-btn" data-act="next-page" ${filterState.page >= totalPages ? "disabled" : ""}>›</button>
                                <span class="pg-show" style="margin-left:8px; font-size:13px; color:#6B7280;">Show
                                    <select id="ctr-rows-per-page-select" style="margin-left:4px; height:30px; border:1px solid #D1D5DB; border-radius:4px; padding:0 6px;">
                                        ${[10, 25, 50].map(n => `<option value="${n}" ${filterState.rowsPerPage === n ? "selected" : ""}>${n} rows</option>`).join("")}
                                    </select>
                                </span>
                            </div>
                        </div>
                    `}
                </div>
            </div>
            ${window.UI.renderFeedbackBubble ? window.UI.renderFeedbackBubble() : ""}
        `;

        // Event bindings
        const searchInput = root.querySelector("#search-here-input");
        if (searchInput) {
            searchInput.addEventListener("input", e => {
                filterState.search = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        root.querySelectorAll("input[data-filter='status']").forEach(chk => {
            chk.addEventListener("change", e => {
                if (e.target.checked) filterState.statuses.add(e.target.value);
                else filterState.statuses.delete(e.target.value);
                filterState.page = 1;
                render(root);
            });
        });

        const actionSel = root.querySelector("select[data-filter='actionBy']");
        if (actionSel) {
            actionSel.addEventListener("change", e => {
                filterState.actionBy = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const dateFromInput = root.querySelector("input[data-filter='dateFrom']");
        if (dateFromInput) {
            dateFromInput.addEventListener("change", e => {
                filterState.dateFrom = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const dateToInput = root.querySelector("input[data-filter='dateTo']");
        if (dateToInput) {
            dateToInput.addEventListener("change", e => {
                filterState.dateTo = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const assignSel = root.querySelector("select[data-filter='assignedTo']");
        if (assignSel) {
            assignSel.addEventListener("change", e => {
                filterState.assignedTo = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const supSel = root.querySelector("select[data-filter='supplier']");
        if (supSel) {
            supSel.addEventListener("change", e => {
                filterState.supplier = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const curSel = root.querySelector("select[data-filter='currency']");
        if (curSel) {
            curSel.addEventListener("change", e => {
                filterState.currency = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const rowsSel = root.querySelector("#ctr-rows-per-page-select");
        if (rowsSel) {
            rowsSel.addEventListener("change", e => {
                filterState.rowsPerPage = parseInt(e.target.value, 10) || 10;
                filterState.page = 1;
                render(root);
            });
        }

        window.UI.bindActions(root, {
            "toggle-sidebar": () => {
                filterState.sidebarCollapsed = !filterState.sidebarCollapsed;
                render(root);
            },
            "clear-all-filters": () => {
                filterState.statuses = new Set();
                filterState.actionBy = "";
                filterState.dateFrom = "";
                filterState.dateTo = "";
                filterState.assignedTo = "";
                filterState.supplier = "";
                filterState.currency = "";
                filterState.search = "";
                filterState.page = 1;
                render(root);
            },
            "prev-page": () => {
                if (filterState.page > 1) {
                    filterState.page -= 1;
                    render(root);
                }
            },
            "next-page": () => {
                if (filterState.page < totalPages) {
                    filterState.page += 1;
                    render(root);
                }
            },
            "set-page": (t) => {
                const p = parseInt(t.getAttribute("data-page"), 10);
                if (p && p !== filterState.page) {
                    filterState.page = p;
                    render(root);
                }
            },
            "open-ctr-req": (t) => {
                const id = t.getAttribute("data-id");
                window.location.hash = "#/requests/procurement/" + id;
            },
            "ctr-req-options": (t, e) => {
                if (e) e.stopPropagation();
                const id = t.getAttribute("data-id");
                window.UI.showActionMenu(t, [
                    {
                        label: "Download request",
                        onClick: () => {
                            window.UI.toast({ kind: "success", title: "Download Started", body: `Downloading request #${id}...` });
                        }
                    },
                    {
                        label: "Export items",
                        onClick: () => {
                            window.UI.toast({ kind: "success", title: "Export Started", body: `Exporting items for request #${id}...` });
                        }
                    }
                ]);
            }
        });
    }

    return { render };
})();
