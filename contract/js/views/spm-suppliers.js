/* ============================================================
   views/spm-suppliers.js — Supplier Performance Management (SPM)
   1-to-1 match with demov2.dmpservice.ai live audit
   ============================================================ */
window.SPMSuppliersView = (function () {

    let activeTab = "directory"; // "directory" | "dashboard"
    let filterState = {
        search: "",
        performance: new Set(),
        sidebarCollapsed: false,
        rowsPerPage: 10,
        page: 1
    };

    function render(root) {
        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);

        // In demov2 live audit, supplier sees 0 suppliers with empty folder
        const suppliersList = isCust ? [
            { no: 1, spm_id: "1", supplier_id: "1", name: "Vendor A", email: "demosupplier1@dmpservice.org", address: "Baku, Azerbaijan", duns: "123456789", tax_id: "AZ12345678", contact: "+994 12 500 0001", compliance: "Compliant", status: "Inactive", perf: "Good (78%)" },
            { no: 2, spm_id: "2", supplier_id: "2", name: "Vendor B", email: "demosupplier2@dmpservice.org", address: "Sumgait, Azerbaijan", duns: "987654321", tax_id: "AZ87654321", contact: "+994 12 500 0002", compliance: "Compliant", status: "Active", perf: "High (92%)" },
            { no: 3, spm_id: "3", supplier_id: "3", name: "MRO AISEL", email: "aisel@mro-supplies.com", address: "Baku, Azerbaijan", duns: "456789123", tax_id: "AZ45678912", contact: "+994 12 500 0003", compliance: "Compliant", status: "Active", perf: "High (88%)" },
            { no: 4, spm_id: "4", supplier_id: "4", name: "DSC (demo supplier company)", email: "info@dsc.az", address: "Ganja, Azerbaijan", duns: "789123456", tax_id: "AZ78912345", contact: "+994 12 500 0004", compliance: "Under Review", status: "Active", perf: "Average (72%)" },
            { no: 5, spm_id: "5", supplier_id: "5", name: "Baku Industrial Supplies LLC", email: "contact@bakuindustrial.az", address: "Baku Port Zone", duns: "321654987", tax_id: "AZ32165498", contact: "+994 12 500 0005", compliance: "Compliant", status: "Active", perf: "High (95%)" }
        ] : [];

        const hasFilters = Boolean(filterState.search || filterState.performance.size > 0);

        const filtered = suppliersList.filter(s => {
            if (filterState.search) {
                const q = filterState.search.toLowerCase();
                const match = s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q);
                if (!match) return false;
            }
            if (filterState.performance.size > 0) {
                let matchPerf = false;
                filterState.performance.forEach(p => {
                    if (s.perf.toLowerCase().includes(p.toLowerCase())) matchPerf = true;
                });
                if (!matchPerf) return false;
            }
            return true;
        });

        const totalRows = filtered.length;
        const totalPages = Math.max(1, Math.ceil(totalRows / filterState.rowsPerPage));
        if (filterState.page > totalPages) filterState.page = totalPages;
        const startIdx = (filterState.page - 1) * filterState.rowsPerPage;
        const pageRows = filtered.slice(startIdx, startIdx + filterState.rowsPerPage);

        root.innerHTML = `
            ${window.UI.breadcrumb("Suppliers", "Suppliers")}

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
                            <div class="fc-label">Performance range</div>
                            ${[
                                { id: "high", label: "High (Above 85%)" },
                                { id: "good", label: "Good (75-84%)" },
                                { id: "average", label: "Average (60-74%)" },
                                { id: "low", label: "Low (Below 60%)" }
                            ].map(p => `
                                <label class="fc-check">
                                    <input type="checkbox" value="${p.id}" data-filter="perf" ${filterState.performance.has(p.id) ? "checked" : ""}>
                                    ${p.label}
                                </label>
                            `).join("")}
                        </div>
                        <div class="fc-clear" data-act="clear-all-filters" style="${hasFilters ? "opacity:1;cursor:pointer;" : "opacity:0.5;pointer-events:none;"}">Clear All Filters</div>
                    </aside>
                `}

                <!-- Main Content -->
                <div class="rfx-main">
                    ${isCust ? `
                    <!-- Customer Tabs and Invite Button -->
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                        <div class="tabsWrapper-NSSGrZ" style="margin-bottom:0;">
                            <div class="tabs-Ugdckk tabsContainer-QAZ9xC" style="border:1px solid #121212; border-radius:6px; overflow:hidden; display:inline-flex;">
                                <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'directory' ? 'active-H9_pwE' : ''}" data-act="tab-dir" style="padding:0 24px;">Supplier Directory</div>
                                <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'dashboard' ? 'active-H9_pwE' : ''}" data-act="tab-dash" style="padding:0 24px;">Overall Supplier Dashboard</div>
                            </div>
                        </div>

                        <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="invite-supplier" style="height:38px; padding:0 18px; font-weight:600;">
                            Invite supplier
                        </button>
                    </div>
                    ` : ""}

                    <div class="rfx-toolbar" style="margin-bottom:12px;">
                        <div class="rfx-search">
                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                            <input placeholder="Search here" data-filter="search" value="${window.UI.esc(filterState.search)}" id="search-here-input">
                        </div>
                    </div>

                    <table class="rfx-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>SPM ID</th>
                                <th>Supplier ID</th>
                                <th>Supplier name</th>
                                <th>Performance</th>
                                <th>Email</th>
                                <th>Address</th>
                                <th>DUNS #</th>
                                <th>TAX ID</th>
                                <th>Contact number</th>
                                <th>Compliance status</th>
                                <th>Supplier status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pageRows.length === 0 ? `
                                <tr>
                                    <td colspan="12" style="text-align:center;padding:40px 20px;background:#fff;">
                                        ${window.UI.emptyFolder("No suppliers have been added yet.")}
                                    </td>
                                </tr>
                            ` : pageRows.map(s => {
                                const isAct = s.status === "Active";
                                return `
                                    <tr>
                                        <td class="rt-no">${s.no}</td>
                                        <td>${s.spm_id}</td>
                                        <td>${s.supplier_id}</td>
                                        <td style="font-weight:600; color:#111827;">${window.UI.esc(s.name)}</td>
                                        <td><span class="st-row" style="font-weight:600; color:#2C4A15;">${s.perf}</span></td>
                                        <td>${window.UI.esc(s.email)}</td>
                                        <td>${window.UI.esc(s.address)}</td>
                                        <td>${window.UI.esc(s.duns)}</td>
                                        <td>${window.UI.esc(s.tax_id)}</td>
                                        <td>${window.UI.esc(s.contact)}</td>
                                        <td><span class="badge ${s.compliance === 'Compliant' ? 'badge-awarded' : 'badge-upcoming'}">${s.compliance}</span></td>
                                        <td>
                                            <span class="st-row"><span class="st-dot ${isAct ? 'dot-awarded' : 'dot-cancelled'}"></span>${window.UI.esc(s.status)}</span>
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

        // Bindings
        const searchInput = root.querySelector("#search-here-input");
        if (searchInput) {
            searchInput.addEventListener("input", e => {
                filterState.search = e.target.value;
                filterState.page = 1;
                render(root);
            });
        }

        root.querySelectorAll("input[data-filter='perf']").forEach(chk => {
            chk.addEventListener("change", e => {
                if (e.target.checked) filterState.performance.add(e.target.value);
                else filterState.performance.delete(e.target.value);
                filterState.page = 1;
                render(root);
            });
        });

        const rowsSel = root.querySelector("#rows-per-page-select");
        if (rowsSel) {
            rowsSel.addEventListener("change", e => {
                filterState.rowsPerPage = parseInt(e.target.value, 10) || 10;
                filterState.page = 1;
                render(root);
            });
        }

        window.UI.bindActions(root, {
            "tab-dir": () => { activeTab = "directory"; render(root); },
            "tab-dash": () => { activeTab = "dashboard"; render(root); },
            "toggle-sidebar": () => {
                filterState.sidebarCollapsed = !filterState.sidebarCollapsed;
                render(root);
            },
            "clear-all-filters": () => {
                filterState.performance = new Set();
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
            "invite-supplier": () => {
                window.UI.openModal({
                    title: "Invite Supplier to DMP Portal",
                    bodyHtml: `
                        <form id="invite-form" style="display:flex; flex-direction:column; gap:14px;">
                            <div>
                                <label class="label-uhdLaM" style="font-size:13px; font-weight:500; margin-bottom:4px; display:block;">Supplier Company Name <span style="color:#ef4444;">*</span></label>
                                <input type="text" class="input-YKgOhO w-full" name="company" placeholder="e.g. Caspian Energy Services" required style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;" />
                            </div>
                            <div>
                                <label class="label-uhdLaM" style="font-size:13px; font-weight:500; margin-bottom:4px; display:block;">Contact Email Address <span style="color:#ef4444;">*</span></label>
                                <input type="email" class="input-YKgOhO w-full" name="email" placeholder="vendor@caspianenergy.az" required style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:4px;" />
                            </div>
                            <div>
                                <label class="label-uhdLaM" style="font-size:13px; font-weight:500; margin-bottom:4px; display:block;">Invitation Message</label>
                                <textarea style="width:100%;height:70px;padding:8px 12px;border:1px solid #D9D9D9;border-radius:4px;font-family:inherit;font-size:13px;" placeholder="Please register your profile to participate in RFQs and pricebook execution."></textarea>
                            </div>
                        </form>`,
                    buttons: [
                        { label: "Cancel", cls: "button-z6sbMq solid-qA3WwL", onClick: ov => ov.remove() },
                        {
                            label: "Send Invitation",
                            cls: "button-z6sbMq solid-qA3WwL primary-wQbOYq",
                            onClick: ov => {
                                const form = ov.querySelector("#invite-form");
                                const c = form.company.value.trim();
                                const em = form.email.value.trim();
                                if (!c || !em) {
                                    alert("Please fill in required supplier information.");
                                    return;
                                }
                                window.UI.toast({ kind: "success", title: "Invitation Sent", body: `Invitation sent to ${em} (${c}).` });
                                ov.remove();
                            }
                        }
                    ]
                });
            }
        });
    }

    return { render };
})();

