/* ============================================================
   views/contracts-list.js — Contracts dashboard & data table
   1-to-1 exact match with live DMP design reference
   ============================================================ */
window.ContractsListView = (function () {

    let filterState = {
        search: "",
        statuses: new Set(),
        supplier: "",
        owner: "",
        cam: "",
        validFrom: "",
        validTo: "",
        sidebarCollapsed: false,
        rowsPerPage: 10,
        page: 1
    };

    function render(root) {
        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);
        let allContracts = window.Store.contracts();
        allContracts = window.ContractWorkflow.filterContractsForUser(allContracts, me);

        const suppliersList = Array.from(new Set(allContracts.map(c => c.supplier).filter(Boolean)));
        const customersList = Array.from(new Set(allContracts.map(c => c.customer).filter(Boolean)));
        const ownersList = Array.from(new Set(allContracts.map(c => c.procurement_contract_owner).filter(Boolean)));
        const camList = Array.from(new Set(allContracts.map(c => c.cam_name).filter(Boolean)));

        const hasFilters = Boolean(
            filterState.search ||
            filterState.statuses.size > 0 ||
            filterState.supplier ||
            filterState.customer ||
            filterState.owner ||
            filterState.cam ||
            filterState.validFrom ||
            filterState.validTo
        );

        const filtered = allContracts.filter(c => {
            if (filterState.search) {
                const q = filterState.search.toLowerCase();
                const match = (c.id && c.id.toLowerCase().includes(q)) ||
                              (c.description && c.description.toLowerCase().includes(q)) ||
                              (c.external_id && c.external_id.toLowerCase().includes(q)) ||
                              (c.supplier && c.supplier.toLowerCase().includes(q)) ||
                              (c.customer && c.customer.toLowerCase().includes(q)) ||
                              (c.procurement_contract_owner && c.procurement_contract_owner.toLowerCase().includes(q)) ||
                              (c.cam_name && c.cam_name.toLowerCase().includes(q)) ||
                              (c.department && c.department.toLowerCase().includes(q)) ||
                              (c.region && c.region.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (filterState.statuses.size > 0 && !filterState.statuses.has(c.status)) {
                return false;
            }
            if (filterState.supplier && c.supplier !== filterState.supplier) {
                return false;
            }
            if (filterState.customer && c.customer !== filterState.customer) {
                return false;
            }
            if (filterState.owner && c.procurement_contract_owner !== filterState.owner) {
                return false;
            }
            if (filterState.cam && c.cam_name !== filterState.cam) {
                return false;
            }
            if (filterState.validFrom && c.valid_from < filterState.validFrom) {
                return false;
            }
            if (filterState.validTo && c.valid_to > filterState.validTo) {
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
            ${window.UI.breadcrumb("Contracts", "Contracts")}

            <div class="rfx-layout">
                <!-- Sidebar Filter Card -->
                ${filterState.sidebarCollapsed ? `
                    <aside class="filter-card collapsed">
                        <button class="fc-collapse" data-act="toggle-sidebar" title="Expand filters">»</button>
                    </aside>
                ` : `
                    <aside class="filter-card">
                        <button class="fc-collapse" data-act="toggle-sidebar" title="Collapse filters">«</button>
                        <div class="fc-body">
                            <div class="fc-label">Status</div>
                            ${["Active", "Expired", "Upcoming"].map(st => `
                                <label class="fc-check">
                                    <input type="checkbox" value="${st}" data-filter="status" ${filterState.statuses.has(st) ? "checked" : ""}>
                                    ${st}
                                </label>
                            `).join("")}

                            ${isCust ? `
                            <div class="fc-label">Supplier Name</div>
                            <select class="form-select" data-filter="supplier">
                                <option value="">Select...</option>
                                ${suppliersList.map(s => `<option value="${window.UI.esc(s)}" ${filterState.supplier === s ? "selected" : ""}>${window.UI.esc(s)}</option>`).join("")}
                            </select>

                            <div class="fc-label">Contract Owner</div>
                            <select class="form-select" data-filter="owner">
                                <option value="">Select...</option>
                                ${ownersList.map(o => `<option value="${window.UI.esc(o)}" ${filterState.owner === o ? "selected" : ""}>${window.UI.esc(o)}</option>`).join("")}
                            </select>

                            <div class="fc-label">CAM Name</div>
                            <select class="form-select" data-filter="cam">
                                <option value="">Select...</option>
                                ${camList.map(c => `<option value="${window.UI.esc(c)}" ${filterState.cam === c ? "selected" : ""}>${window.UI.esc(c)}</option>`).join("")}
                            </select>
                            ` : `
                            <div class="fc-label">Customer Name</div>
                            <select class="form-select" data-filter="customer">
                                <option value="">Select...</option>
                                ${customersList.map(cust => `<option value="${window.UI.esc(cust)}" ${filterState.customer === cust ? "selected" : ""}>${window.UI.esc(cust)}</option>`).join("")}
                            </select>
                            `}

                            <div class="fc-label">Valid From</div>
                            <div class="fc-date-row"><input type="date" class="form-input" data-filter="validFrom" value="${window.UI.esc(filterState.validFrom)}" placeholder="YYYY-MM-DD"></div>
                            <div class="fc-label" style="margin-top:8px;">Valid To</div>
                            <div class="fc-date-row"><input type="date" class="form-input" data-filter="validTo" value="${window.UI.esc(filterState.validTo)}" placeholder="YYYY-MM-DD"></div>
                        </div>
                        <div class="fc-clear" data-act="clear-all-filters" style="${hasFilters ? "opacity:1;cursor:pointer;" : "opacity:0.5;pointer-events:none;"}">Clear All Filters</div>
                    </aside>
                `}

                <!-- Main Column -->
                <div class="rfx-main">
                    <div class="rfx-toolbar">
                        <div class="rfx-search">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input placeholder="Search here" data-filter="search" value="${window.UI.esc(filterState.search)}" id="search-here-input">
                        </div>
                        ${isCust ? `
                            <button class="btn-create" data-act="create-contract">+ Add new contract</button>
                        ` : ""}
                    </div>

                    <table class="rfx-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th># of Pricebooks</th>
                                <th>Contract Description</th>
                                ${isCust ? `<th>Contract owner name</th><th>Supplier</th>` : `<th>Contract type</th><th>Customer</th>`}
                                <th>CAM name</th>
                                <th>External contract #</th>
                                <th>Region</th>
                                <th>Department</th>
                                <th>Valid to</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageRows.length === 0 ? `
                                <tr>
                                    <td colspan="12" style="text-align:center;padding:40px 20px;background:#fff;">
                                        ${window.UI.emptyFolder(hasFilters ? "No contracts match the selected filter criteria." : "No contracts have been created yet.")}
                                    </td>
                                </tr>
                            ` : pageRows.map((c, idx) => {
                                const st = c.status || "Active";
                                let dotClass = "dot-awarded";
                                if (st.toLowerCase() === "expired" || st.toLowerCase() === "disabled") dotClass = "dot-cancelled";
                                else if (st.toLowerCase() === "upcoming") dotClass = "dot-open";

                                return `
                                    <tr data-act="open-ctr" data-id="${c.id}" style="cursor:pointer;">
                                        <td class="rt-no">${startIdx + idx + 1}</td>
                                        <td style="font-weight:600;text-align:center;">${c.pricebook_count || 1}</td>
                                        <td>
                                            <div class="rt-title">${window.UI.esc(c.description || "—")}</div>
                                            ${c.contract_number ? `<div class="rt-sub">Contract #${window.UI.esc(c.contract_number)}</div>` : ""}
                                        </td>
                                        ${isCust ? `
                                            <td>${window.UI.esc(c.procurement_contract_owner || "—")}</td>
                                            <td style="font-weight:600;">${window.UI.esc(c.supplier || "—")}</td>
                                        ` : `
                                            <td>${window.UI.esc(c.contract_type || "Regular")}</td>
                                            <td style="font-weight:600;">${window.UI.esc(c.customer || "Delta Drilling LTD.")}</td>
                                        `}
                                        <td>${window.UI.esc(c.cam_name || "—")}</td>
                                        <td>${window.UI.esc(c.external_id || "—")}</td>
                                        <td>${window.UI.esc(c.region || "—")}</td>
                                        <td>${window.UI.esc(c.department || "—")}</td>
                                        <td>${window.UI.esc(c.valid_to || "—")}</td>
                                        <td>
                                            <span class="st-row"><span class="st-dot ${dotClass}"></span>${window.UI.esc(st)}</span>
                                        </td>
                                        <td style="text-align:right;">
                                            <button class="icon-btn" data-act="ctr-options" data-id="${c.id}" style="display:inline-flex;padding:6px;font-size:16px;" title="Actions">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                            </button>
                                        </td>
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>

                    <!-- Pagination -->
                    <div class="rfx-pager">
                        <button class="pg-btn" data-act="prev-page" ${filterState.page <= 1 ? "disabled" : ""}>‹</button>
                        ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                            <button class="pg-num ${p === filterState.page ? "active" : ""}" data-act="set-page" data-page="${p}">${p}</button>
                        `).join("")}
                        <button class="pg-btn" data-act="next-page" ${filterState.page >= totalPages ? "disabled" : ""}>›</button>
                        <span class="pg-show">Show
                            <select id="rows-per-page-select">
                                ${[10, 25, 50].map(n => `<option value="${n}" ${filterState.rowsPerPage === n ? "selected" : ""}>${n} rows</option>`).join("")}
                            </select>
                        </span>
                    </div>
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

        const custSel = root.querySelector("select[data-filter='customer']");
        if (custSel) {
            custSel.addEventListener("change", e => {
                filterState.customer = e.target.value;
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

        const ownerSel = root.querySelector("select[data-filter='owner']");
        if (ownerSel) {
            ownerSel.addEventListener("change", e => {
                filterState.owner = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const camSel = root.querySelector("select[data-filter='cam']");
        if (camSel) {
            camSel.addEventListener("change", e => {
                filterState.cam = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const vfInput = root.querySelector("input[data-filter='validFrom']");
        if (vfInput) {
            vfInput.addEventListener("change", e => {
                filterState.validFrom = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const vtInput = root.querySelector("input[data-filter='validTo']");
        if (vtInput) {
            vtInput.addEventListener("change", e => {
                filterState.validTo = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const rowsSel = root.querySelector("#rows-per-page-select");
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
                filterState.supplier = "";
                filterState.customer = "";
                filterState.owner = "";
                filterState.cam = "";
                filterState.validFrom = "";
                filterState.validTo = "";
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
            "create-contract": () => {
                window.location.hash = "#/contracts/new";
            },
            "open-ctr": (t) => {
                window.location.hash = "#/contracts/" + t.getAttribute("data-id");
            },
            "ctr-options": (t) => {
                const id = t.getAttribute("data-id");
                const c = (window.Store.contracts() || []).find(x => x.id === id);
                if (!c) return;
                const isAct = (c.status || "Active") === "Active";
                window.UI.showActionMenu(t, [
                    {
                        label: "View contract details",
                        icon: "📄",
                        onClick: () => { window.location.hash = "#/contracts/" + id; }
                    },
                    {
                        label: "Download contract (PDF)",
                        icon: "📥",
                        onClick: () => {
                            window.UI.toast({ kind: "success", title: "PDF Export", body: `Downloading signed agreement for Contract ${id}...` });
                        }
                    },
                    {
                        label: isAct ? "Deactivate contract" : "Activate contract",
                        icon: isAct ? "🚫" : "✅",
                        danger: isAct,
                        onClick: () => {
                            toggleContractStatus(id);
                        }
                    },
                    {
                        label: "Delete contract",
                        icon: "🗑️",
                        danger: true,
                        onClick: () => {
                            if (confirm(`Are you sure you want to delete Contract ${id}? This action cannot be undone.`)) {
                                window.Store.set(s => {
                                    s.contracts = (s.contracts || []).filter(x => x.id !== id);
                                });
                                window.UI.toast({ kind: "info", title: "Contract Removed", body: `Contract ${id} has been deleted.` });
                                render(root);
                            }
                        }
                    }
                ]);
            }
        });
    }

    function toggleContractStatus(id) {
        const contracts = window.Store.contracts();
        const c = contracts.find(x => x.id === id);
        if (c) {
            c.status = (c.status === "Active" ? "Expired" : "Active");
            window.Store.set(s => {
                const idx = (s.contracts || []).findIndex(x => x.id === id);
                if (idx !== -1) s.contracts[idx].status = c.status;
            });
            window.UI.toast({ kind: "success", title: "Status Updated", body: `Contract ${id} status set to ${c.status}.` });
            window.Router.render();
        }
    }

    return { render, toggleContractStatus };
})();
