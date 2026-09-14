/* ============================================================
   views/ctr-requests.js — Catalogue & Price Change Requests (CTR)
   1-to-1 match with demov2.dmpservice.ai live audit
   ============================================================ */
window.CTRRequestsView = (function () {

    let activeTab = "ctrs"; // "ctrs" | "drafts"
    let filterState = {
        search: "",
        statuses: new Set(),
        supplier: "",
        customer: "",
        actionBy: "",
        seal: "",
        validFrom: "",
        validTo: "",
        sidebarCollapsed: false,
        rowsPerPage: 10,
        page: 1
    };

    function render(root) {
        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);
        let allRequests = window.Store.ctrRequests() || [];

        // In demov2 live audit, supplier has 0 requests and sees empty state
        if (!isCust) {
            allRequests = allRequests.filter(r => r.supplier === me.company);
        }

        const suppliersList = Array.from(new Set(allRequests.map(r => r.supplier).filter(Boolean)));
        const customersList = Array.from(new Set(allRequests.map(r => r.customer || "Delta Drilling LTD.").filter(Boolean)));

        const hasFilters = Boolean(
            filterState.search ||
            filterState.statuses.size > 0 ||
            filterState.supplier ||
            filterState.customer ||
            filterState.actionBy ||
            filterState.seal ||
            filterState.validFrom ||
            filterState.validTo
        );

        const filtered = allRequests.filter(r => {
            if (activeTab === "drafts" && r.status !== "Draft") return false;
            if (activeTab === "ctrs" && r.status === "Draft") return false;

            if (filterState.search) {
                const q = filterState.search.toLowerCase();
                const match = (r.id && r.id.toLowerCase().includes(q)) ||
                              (r.item_desc && r.item_desc.toLowerCase().includes(q)) ||
                              (r.supplier && r.supplier.toLowerCase().includes(q)) ||
                              (r.project_name && r.project_name.toLowerCase().includes(q));
                if (!match) return false;
            }
            if (filterState.statuses.size > 0 && !filterState.statuses.has(r.status)) {
                return false;
            }
            if (filterState.supplier && r.supplier !== filterState.supplier) {
                return false;
            }
            if (filterState.customer && (r.customer || "Delta Drilling LTD.") !== filterState.customer) {
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
            ${window.UI.breadcrumb("CTR requests", "CTR requests")}

            <div class="rfx-layout" style="padding: 16px 28px;">
                <!-- Filter Sidebar matching demov2 -->
                ${filterState.sidebarCollapsed ? `
                    <aside class="filter-card collapsed">
                        <button class="fc-collapse" data-act="toggle-sidebar" title="Expand filters">»</button>
                    </aside>
                ` : `
                    <aside class="filter-card">
                        <button class="fc-collapse" data-act="toggle-sidebar" title="Collapse filters">«</button>
                        <div class="fc-body">
                            ${isCust ? `
                            <div class="fc-label">Supplier Company</div>
                            <select class="form-select" data-filter="supplier">
                                <option value="">Select supplier company</option>
                                ${suppliersList.map(s => `<option value="${window.UI.esc(s)}" ${filterState.supplier === s ? "selected" : ""}>${window.UI.esc(s)}</option>`).join("")}
                            </select>
                            ` : `
                            <div class="fc-label">Customer Company</div>
                            <select class="form-select" data-filter="customer">
                                <option value="">Select customer company</option>
                                ${customersList.map(c => `<option value="${window.UI.esc(c)}" ${filterState.customer === c ? "selected" : ""}>${window.UI.esc(c)}</option>`).join("")}
                            </select>
                            `}

                            <div class="fc-label">Required action by</div>
                            <select class="form-select" data-filter="actionBy">
                                <option value="">Select</option>
                                <option value="no_action_required" ${filterState.actionBy === "no_action_required" ? "selected" : ""}>No action required</option>
                                <option value="customer" ${filterState.actionBy === "customer" ? "selected" : ""}>Customer</option>
                                <option value="supplier" ${filterState.actionBy === "supplier" ? "selected" : ""}>Supplier</option>
                            </select>

                            <div class="fc-label">Seal</div>
                            <select class="form-select" data-filter="seal">
                                <option value="">Select</option>
                                <option value="yes" ${filterState.seal === "yes" ? "selected" : ""}>Yes</option>
                                <option value="no" ${filterState.seal === "no" ? "selected" : ""}>No</option>
                            </select>

                            <div class="fc-label">Status</div>
                            ${["Active", "Expired", "Upcoming"].map(st => `
                                <label class="fc-check">
                                    <input type="checkbox" value="${st}" data-filter="status" ${filterState.statuses.has(st) ? "checked" : ""}>
                                    ${st}
                                </label>
                            `).join("")}

                            ${isCust ? `
                            <div class="fc-label">Validity range</div>
                            <div class="fc-date-row"><input type="date" class="form-input" data-filter="validFrom" value="${window.UI.esc(filterState.validFrom)}" placeholder="YYYY-MM-DD"></div>
                            <div class="fc-date-row"><input type="date" class="form-input" data-filter="validTo" value="${window.UI.esc(filterState.validTo)}" placeholder="YYYY-MM-DD"></div>
                            ` : ""}
                        </div>
                        <div class="fc-clear" data-act="clear-all-filters" style="${hasFilters ? "opacity:1;cursor:pointer;" : "opacity:0.5;pointer-events:none;"}">Clear All Filters</div>
                    </aside>
                `}

                <!-- Main Section -->
                <div class="rfx-main">
                    ${isCust ? `
                    <!-- Customer Tabs & Request Button matching demov2 06_ctr_requests.png -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <div class="tabsWrapper-NSSGrZ" style="margin-bottom:0;">
                            <div class="tabs-Ugdckk tabsContainer-QAZ9xC" style="border:1px solid #121212; border-radius:6px; overflow:hidden; display:inline-flex;">
                                <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'ctrs' ? 'active-H9_pwE' : ''}" data-act="tab-ctrs" style="padding:0 24px; min-width:110px;">CTRs</div>
                                <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'drafts' ? 'active-H9_pwE' : ''}" data-act="tab-drafts" style="padding:0 24px; min-width:110px;">Drafts</div>
                            </div>
                        </div>

                        <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="request-ctr-creation" style="height:38px; padding:0 18px; font-weight:600; display:inline-flex; align-items:center; gap:8px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                            <span>Request CTR creation</span>
                        </button>
                    </div>
                    ` : ""}

                    <div class="rfx-toolbar" style="margin-bottom: 12px;">
                        <div class="rfx-search">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input placeholder="Search here" data-filter="search" value="${window.UI.esc(filterState.search)}" id="search-here-input">
                        </div>
                    </div>

                    <table class="rfx-table">
                        <thead>
                            <tr>
                                <th>Index</th>
                                <th>Project name</th>
                                <th>Status</th>
                                <th>Required Action By</th>
                                <th>Submission Deadline</th>
                                <th>${isCust ? "Supplier Name" : "Customer Name"}</th>
                                <th>Created At</th>
                                ${isCust ? "<th></th>" : ""}
                            </tr>
                        </thead>
                        <tbody>
                            ${pageRows.length === 0 ? `
                                <tr>
                                    <td colspan="${isCust ? 8 : 7}" style="text-align:center;padding:40px 20px;background:#fff;">
                                        ${window.UI.emptyFolder("No requests have been created yet.")}
                                    </td>
                                </tr>
                            ` : pageRows.map((r, idx) => {
                                const st = r.status || "Active";
                                let dotClass = "dot-awarded";
                                if (st.toLowerCase() === "expired" || st.toLowerCase() === "rejected") dotClass = "dot-cancelled";
                                else if (st.toLowerCase() === "pending review" || st.toLowerCase() === "upcoming") dotClass = "dot-open";

                                return `
                                    <tr>
                                        <td class="rt-no">${startIdx + idx + 1}</td>
                                        <td>
                                            <div class="rt-title" style="font-weight:600; color:#111827;">${window.UI.esc(r.project_name || r.item_desc || "test ctr")}</div>
                                            ${r.id ? `<div class="rt-sub">${window.UI.esc(r.id)}</div>` : ""}
                                        </td>
                                        <td>
                                            <span class="st-row"><span class="st-dot ${dotClass}"></span>${window.UI.esc(st)}</span>
                                        </td>
                                        <td>${window.UI.esc(r.required_action_by || "no_action_required")}</td>
                                        <td>${window.UI.esc(r.submission_deadline || "2026-05-25")}</td>
                                        <td style="font-weight:600;">${window.UI.esc(isCust ? r.supplier : (r.customer || "Delta Drilling LTD."))}</td>
                                        <td>${window.UI.esc(r.created_at || "2026-05-25")}</td>
                                        ${isCust ? `
                                        <td style="text-align:right;">
                                            <button class="icon-btn" data-act="ctr-req-options" data-id="${r.id}" style="display:inline-flex;padding:6px;font-size:16px;" title="Actions">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                                            </button>
                                        </td>
                                        ` : ""}
                                    </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>

                    <!-- Pagination matching demov2 -->
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

        const supSel = root.querySelector("select[data-filter='supplier']");
        if (supSel) {
            supSel.addEventListener("change", e => {
                filterState.supplier = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const custSel = root.querySelector("select[data-filter='customer']");
        if (custSel) {
            custSel.addEventListener("change", e => {
                filterState.customer = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const actionSel = root.querySelector("select[data-filter='actionBy']");
        if (actionSel) {
            actionSel.addEventListener("change", e => {
                filterState.actionBy = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        const sealSel = root.querySelector("select[data-filter='seal']");
        if (sealSel) {
            sealSel.addEventListener("change", e => {
                filterState.seal = e.target.value;
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
            "tab-ctrs": () => { activeTab = "ctrs"; render(root); },
            "tab-drafts": () => { activeTab = "drafts"; render(root); },
            "toggle-sidebar": () => {
                filterState.sidebarCollapsed = !filterState.sidebarCollapsed;
                render(root);
            },
            "clear-all-filters": () => {
                filterState.statuses = new Set();
                filterState.supplier = "";
                filterState.customer = "";
                filterState.actionBy = "";
                filterState.seal = "";
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
            "request-ctr-creation": () => {
                openCreateCTRModal(isCust, me, () => render(root));
            },
            "ctr-req-options": (t) => {
                const id = t.getAttribute("data-id");
                const r = (window.Store.get().ctr_requests || []).find(x => x.id === id);
                window.UI.showActionMenu(t, [
                    {
                        label: "View request spec",
                        icon: "📄",
                        onClick: () => {
                            window.UI.toast({ kind: "info", title: "CTR Request", body: `Viewing request specification for ${id}` });
                        }
                    },
                    {
                        label: "Approve change request",
                        icon: "✅",
                        onClick: () => {
                            window.Store.set(s => {
                                const target = (s.ctr_requests || []).find(x => x.id === id);
                                if (target) target.status = "Approved";
                            });
                            window.UI.toast({ kind: "success", title: "Status Updated", body: `Request ${id} approved.` });
                            render(root);
                        }
                    },
                    {
                        label: "Reject request",
                        icon: "🚫",
                        danger: true,
                        onClick: () => {
                            window.Store.set(s => {
                                const target = (s.ctr_requests || []).find(x => x.id === id);
                                if (target) target.status = "Rejected";
                            });
                            window.UI.toast({ kind: "info", title: "Status Updated", body: `Request ${id} rejected.` });
                            render(root);
                        }
                    },
                    {
                        label: "Download CTR PDF",
                        icon: "📥",
                        onClick: () => {
                            window.UI.toast({ kind: "success", title: "Download Started", body: `Downloading specification PDF for ${id}...` });
                        }
                    }
                ]);
            }
        });
    }

    function openCreateCTRModal(isCust, me, cb) {
        const contracts = window.Store.contracts() || [];
        const availableContracts = isCust ? contracts : contracts.filter(c => c.supplier === me.company);

        window.UI.openModal({
            title: "Request CTR Creation",
            wide: true,
            bodyHtml: `
                <form id="new-ctr-form" style="display:flex; flex-direction:column; gap:16px;">
                    <div>
                        <label class="label-uhdLaM" style="font-size:13px; font-weight:500; color:#374151; margin-bottom:6px; display:block;">Project Name <span style="color:#EF4444;">*</span></label>
                        <input type="text" class="input-YKgOhO w-full" name="project_name" placeholder="e.g. provision of MRO supplies CTR" required style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;" />
                    </div>

                    <div>
                        <label class="label-uhdLaM" style="font-size:13px; font-weight:500; color:#374151; margin-bottom:6px; display:block;">Select Associated Master Contract <span style="color:#EF4444;">*</span></label>
                        <select class="form-select" name="contract_id" id="ctr-contract-select" required style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;">
                            ${availableContracts.map(c => `
                                <option value="${c.id}">${c.id} — ${window.UI.esc(c.description)} (${window.UI.esc(c.supplier)})</option>
                            `).join("")}
                        </select>
                    </div>

                    <div style="display:grid; grid-template-columns: 1fr 1fr; gap:12px;">
                        <div>
                            <label class="label-uhdLaM" style="font-size:13px; font-weight:500; color:#374151; margin-bottom:6px; display:block;">Required Action By</label>
                            <select class="form-select" name="required_action_by" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;">
                                <option value="no_action_required">no_action_required</option>
                                <option value="customer">Customer</option>
                                <option value="supplier">Supplier</option>
                            </select>
                        </div>
                        <div>
                            <label class="label-uhdLaM" style="font-size:13px; font-weight:500; color:#374151; margin-bottom:6px; display:block;">Submission Deadline</label>
                            <input type="date" class="input-YKgOhO w-full" name="submission_deadline" value="" placeholder="YYYY-MM-DD" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;" />
                        </div>
                    </div>

                    <div>
                        <label class="label-uhdLaM" style="font-size:13px; font-weight:500; color:#374151; margin-bottom:6px; display:block;">Description / Justification <span style="color:#EF4444;">*</span></label>
                        <textarea name="justification" placeholder="Provide reason for CTR creation" required style="width:100%;height:80px;padding:8px 12px;border:1px solid #D9D9D9;border-radius:4px;font-family:inherit;font-size:13px;"></textarea>
                    </div>
                </form>
            `,
            buttons: [
                { label: "Cancel", cls: "button-z6sbMq solid-qA3WwL", onClick: ov => ov.remove() },
                {
                    label: "Submit Request",
                    cls: "button-z6sbMq solid-qA3WwL primary-wQbOYq",
                    onClick: ov => {
                        const form = ov.querySelector("#new-ctr-form");
                        const projName = form.project_name.value.trim();
                        const cid = form.contract_id.value;
                        const actionBy = form.required_action_by.value;
                        const deadline = form.submission_deadline.value;
                        const just = form.justification.value.trim();

                        if (!projName || !cid || !just) {
                            alert("Please fill in all required fields.");
                            return;
                        }

                        const targetContract = window.Store.contractById(cid);
                        const newReqId = `CTR-REQ-${new Date().getFullYear()}-${Math.floor(Math.random()*9000 + 1000)}`;

                        window.Store.set(s => {
                            if (!s.ctr_requests) s.ctr_requests = [];
                            s.ctr_requests.unshift({
                                id: newReqId,
                                project_name: projName,
                                contract_id: cid,
                                supplier: targetContract ? targetContract.supplier : me.company,
                                customer: targetContract ? (targetContract.customer || "Delta Drilling LTD.") : "Delta Drilling LTD.",
                                required_action_by: actionBy,
                                submission_deadline: deadline || "2026-06-30",
                                justification: just,
                                status: "Active",
                                created_at: new Date().toISOString().slice(0, 10)
                            });

                            if (!s.notifications) s.notifications = [];
                            s.notifications.unshift({
                                id: "ntf_" + Date.now().toString(36),
                                title: "CTR Request Created",
                                body: `CTR Request "${projName}" (${newReqId}) created.`,
                                contractId: cid,
                                read: false,
                                ts: Date.now()
                            });
                        });

                        window.UI.toast({ kind: "success", title: "CTR Created", body: `Request "${projName}" successfully created.` });
                        ov.remove();
                        cb();
                    }
                }
            ]
        });
    }

    return { render };
})();
