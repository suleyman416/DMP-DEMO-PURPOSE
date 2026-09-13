/* ============================================================
   views/contract-detail.js — 1:1 Pixel-Perfect 5-Tab Contract Hub
   Pricebook, Supplier, KPI, Performance Report, Dashboards
   Matching demov2.dmpservice.ai/contract/26/pricebooks DOM & CSS
   ============================================================ */
window.ContractDetailView = (function () {

    let activeTab = "pricebook";
    let isHeroCollapsed = false;
    let pbSearchQuery = "";
    let pbStatusFilter = { active: true, disabled: false };

    function render(root, contractId, tabParam) {
        if (tabParam) activeTab = tabParam;

        const contract = window.Store.contractById(contractId);
        if (!contract) {
            root.innerHTML = `<div style="padding:40px;text-align:center;"><h3>Contract not found</h3><a href="#/contracts" class="btn btn-outline" style="margin-top:16px;">Back to Contracts</a></div>`;
            return;
        }

        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);

        const pricebooks = window.Store.pricebooksByContract(contractId);
        const kpis = window.Store.kpisByContract(contractId);
        const reports = window.Store.performanceReportsByContract(contractId);

        const contractNum = contract.contract_number || contract.id.replace(/^[A-Za-z]+-/, "");

        root.innerHTML = `
            ${window.UI.breadcrumb("Contract management", "Contract # " + contractNum)}
            <div class="flex-column h-full page-viewport pageWrapper-iFXGCW" style="padding: 16px 28px; width: 100%;">
                <div>
                    <!-- 3-Column Metadata Hero matching 03_contract_detail.png -->
                    <div>
                        <div class="verticalExtraSection-KdA1Jm" id="contract-metadata-section" style="${isHeroCollapsed ? 'display:none;' : 'display:block;'}">
                            <div>
                                <div class="flex-align-center list-WdlufD">
                                    <div class="container-ypalLs w-full">
                                        <ul>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Supplier name:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.supplier)}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Contract description:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.description)}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Contract approved value:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${contract.approved_value ? contract.approved_value.toLocaleString() : "18990"}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Customer ID:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${contract.customer_id || "5"}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">External contract #</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.external_id || "123123123")}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Valid from:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${contract.valid_from || "2026-04-27"}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">CAM name:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.cam_name || "Aisel Verdieva")}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Procurement contract owner:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.owner_name || contract.cam_name || "Aisel Verdieva")}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Valid to:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${contract.valid_to || "2026-04-30"}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Department:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.department_name || "Risk Management")}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Region:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.region || "ANG")}</span></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Expander toggle chevron ︽ -->
                        <div class="verticalExpanderToggle-WLNyNb" id="toggle-hero-btn" title="Toggle contract details">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="#3A3A3A" xmlns="http://www.w3.org/2000/svg" style="${isHeroCollapsed ? 'transform:rotate(180deg);' : ''}">
                                <path d="M14.2319 6.71766C14.3386 6.82506 14.3991 6.96986 14.4006 7.12123C14.4021 7.2726 14.3444 7.41858 14.2399 7.52806C14.1891 7.58167 14.128 7.62454 14.0604 7.65412C13.9927 7.68371 13.9198 7.69942 13.8459 7.70031C13.7721 7.70121 13.6988 7.68727 13.6304 7.65934C13.5621 7.6314 13.5 7.59002 13.4479 7.53766L8.0823 2.17766L2.5559 7.83366C2.50445 7.88664 2.44289 7.92876 2.37487 7.95752C2.30685 7.98628 2.23375 8.0011 2.1599 8.0011C2.08605 8.0011 2.01295 7.98628 1.94493 7.95752C1.87691 7.92876 1.81535 7.88664 1.7639 7.83366C1.65872 7.72515 1.59991 7.57997 1.59991 7.42886C1.59991 7.27774 1.65872 7.13256 1.7639 7.02406L7.6799 0.968058C7.73102 0.915428 7.79212 0.873517 7.85962 0.844776C7.92713 0.816034 7.99969 0.801039 8.07306 0.800666C8.14643 0.800294 8.21913 0.814552 8.28693 0.842607C8.35472 0.870661 8.41625 0.91195 8.4679 0.964058L14.2319 6.71766ZM14.2319 13.9177C14.3383 14.025 14.3987 14.1697 14.4002 14.3208C14.4017 14.472 14.3442 14.6178 14.2399 14.7273C14.1891 14.7809 14.128 14.8237 14.0604 14.8533C13.9927 14.8829 13.9198 14.8986 13.8459 14.8995C13.7721 14.9004 13.6988 14.8865 13.6304 14.8585C13.5621 14.8306 13.5 14.7892 13.4479 14.7369L8.0823 9.37686L2.5559 15.0329C2.50445 15.0858 2.44289 15.128 2.37487 15.1567C2.30685 15.1855 2.23375 15.2003 2.1599 15.2003C2.08605 15.2003 2.01295 15.1855 1.94493 15.1567C1.87691 15.128 1.81535 15.0858 1.7639 15.0329C1.65872 14.9244 1.59991 14.7792 1.59991 14.6281C1.59991 14.4769 1.65872 14.3318 1.7639 14.2233L7.6799 8.16806C7.73102 8.11543 7.79212 8.07352 7.85962 8.04478C7.92713 8.01603 7.99969 8.00104 8.07306 8.00067C8.14643 0.800294 8.21913 0.814552 8.28693 0.84261C8.35472 0.87066 8.41625 0.91195 8.4679 0.96406L14.2319 13.9177Z" fill="#3A3A3A"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- 5 Connected Segmented Tabs matching 03_contract_detail.png -->
                <div class="tabsWrapper-NSSGrZ">
                    <div>
                        <div class="tabs-Ugdckk tabsContainer-QAZ9xC">
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'pricebook' ? 'active-H9_pwE' : ''}" data-tab="pricebook">Pricebook</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'supplier' ? 'active-H9_pwE' : ''}" data-tab="supplier">Supplier</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'kpi' ? 'active-H9_pwE' : ''}" data-tab="kpi">KPI</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'performance' ? 'active-H9_pwE' : ''}" data-tab="performance">Performance Report</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'dashboards' ? 'active-H9_pwE' : ''}" data-tab="dashboards">Dashboards</div>
                        </div>
                    </div>

                    <!-- Tab Views -->
                    <div class="tabContent-kOFLBy tabContent-n_Wx8b">
                        ${activeTab === "pricebook" ? renderPricebookTab(contract, pricebooks, isCust) : ""}
                        ${activeTab === "supplier" ? renderSupplierTab(contract) : ""}
                        ${activeTab === "kpi" ? renderKPITab(contract, kpis, isCust) : ""}
                        ${activeTab === "performance" ? renderPerformanceTab(contract, reports, isCust) : ""}
                        ${activeTab === "dashboards" ? renderDashboardsTab(contract, pricebooks, kpis, reports) : ""}
                    </div>
                </div>
            </div>
        `;

        // Bind Hero Toggle
        const toggleBtn = root.querySelector("#toggle-hero-btn");
        const metaSection = root.querySelector("#contract-metadata-section");
        if (toggleBtn && metaSection) {
            toggleBtn.addEventListener("click", () => {
                isHeroCollapsed = !isHeroCollapsed;
                metaSection.style.display = isHeroCollapsed ? "none" : "block";
                const svg = toggleBtn.querySelector("svg");
                if (svg) {
                    svg.style.transform = isHeroCollapsed ? "rotate(180deg)" : "";
                }
            });
        }

        // Bind Sub-Tabs Switching
        root.querySelectorAll(".tab-iuHCpT").forEach(tabEl => {
            tabEl.addEventListener("click", () => {
                const target = tabEl.getAttribute("data-tab");
                if (target && target !== activeTab) {
                    activeTab = target;
                    render(root, contractId, target);
                }
            });
        });

        // Bind Tab-specific Actions
        bindEvents(root, contract, contractId);
    }

    /* -------------------------------------------------------------
       Tab 1: Pricebook Tab View matching 03_contract_detail.png
       ------------------------------------------------------------- */
    function renderPricebookTab(contract, pricebooks, isCust) {
        let filteredPbs = pricebooks;
        if (pbSearchQuery) {
            const q = pbSearchQuery.toLowerCase();
            filteredPbs = filteredPbs.filter(p =>
                (p.description && p.description.toLowerCase().includes(q)) ||
                (p.pricebook_number && p.pricebook_number.toLowerCase().includes(q)) ||
                (p.external_pricebook_number && p.external_pricebook_number.toLowerCase().includes(q))
            );
        }

        return `
            <div class="flex-column h-full tabView-HlFARP">
                <div class="motion-content filter-layout">
                    <!-- Left Sidebar matching 03_contract_detail.png -->
                    <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" data-minimized="false" style="width: 260px;">
                        <div class="flex-center filterArrow-jGyFr7">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 8.07275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                            </svg>
                        </div>
                        <div class="flex-column filterContent-YzzLD2" style="opacity: 1;">
                            <div class="flex-column filterFields-dIjaHp">
                                <div class="form-group">
                                    <div class="flex-row">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Status </label>
                                    </div>
                                    <div class="flex-column-gap-8">
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="checkbox" ${pbStatusFilter.active ? 'checked' : ''} name="pb_status_active">
                                            <span class="box-u07F6U"></span>
                                            <div class="label-UX1ihv">Active</div>
                                        </label>
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="checkbox" ${pbStatusFilter.disabled ? 'checked' : ''} name="pb_status_disabled">
                                            <span class="box-u07F6U"></span>
                                            <div class="label-UX1ihv">Disabled</div>
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="flex-row">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Currency </label>
                                    </div>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl ant-select-single ant-select-show-arrow">
                                            <div class="ant-select-selector">
                                                <span class="ant-select-selection-wrap">
                                                    <span class="ant-select-selection-placeholder">Select...</span>
                                                </span>
                                            </div>
                                            <span class="ant-select-arrow">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="inline-flex-center button-z6sbMq w-full link-xtI0I7 success-U99qXn" id="clear-pb-filters-btn">
                                <span class="flex-align-center label-FlMxDR">Clear All Filters</span>
                            </button>
                        </div>
                    </aside>

                    <!-- Table Card Container matching 03_contract_detail.png -->
                    <section class="content-table contentTable-_531TS contentTable-ZmxBPD">
                        <div class="flex-column tableContainer-GCJvcD">
                            <div class="flex-align-center tableHeader-aYWNqq" data-testid="table-header" style="justify-content: space-between;">
                                <div class="flex-justify-center inputContainer-Lxo7RH tableHeaderSearch-w9kvHg">
                                    <div class="searchInputWrapper-cEb63H">
                                        <div class="container-FyufBC">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" color="#666666">
                                                <path fill="currentColor" d="M4.5 10a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M10 3a7 7 0 1 0 4.391 12.452l5.329 5.328a.75.75 0 1 0 1.06-1.06l-5.328-5.329A7 7 0 0 0 10 3"></path>
                                            </svg>
                                            <input class="input-YKgOhO inputSearch-HCZijN hasIcon-usp3ch" id="pb-search-input" placeholder="Search here" type="text" value="${window.UI.esc(pbSearchQuery)}">
                                        </div>
                                    </div>
                                </div>
                                ${!isCust ? `
                                <div>
                                    <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="create-pricebook" style="height: 40px; padding: 0 16px;">
                                        <span class="flex-align-center label-FlMxDR">+ Add new pricebook</span>
                                    </button>
                                </div>
                                ` : ""}
                            </div>

                            <div class="tableWrapper-VDyaTh">
                                <table class="table-egCV_Z striped-S6C7kO hoverable-e_h2L2 table table-Y56XQQ">
                                    <thead>
                                        <tr>
                                            <th style="min-width: 60px; width: 60px;">No</th>
                                            <th style="min-width: 120px; width: 120px;">Pricebook #</th>
                                            <th># of Items</th>
                                            <th style="min-width: 100px; width: 100px;">Status</th>
                                            <th>Pricebook description</th>
                                            <th style="min-width: 180px; width: 180px;">External pricebook number</th>
                                            <th>Currency</th>
                                            <th style="min-width: 250px; width: 250px;">Creation date and time</th>
                                            <th style="min-width: 50px; width: 50px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${filteredPbs.length === 0 ? `
                                            <tr><td colspan="9" style="text-align:center;padding:36px;color:#6B7280;">No pricebooks attached to this contract.</td></tr>
                                        ` : filteredPbs.map((pb, idx) => {
                                            const pbNum = pb.pricebook_number ? pb.pricebook_number.replace(/^[A-Za-z]+-/, "") : (idx + 1);
                                            return `
                                                <tr>
                                                    <td style="min-width: 60px; width: 60px;">${idx + 1}</td>
                                                    <td style="min-width: 120px; width: 120px;">
                                                        <a href="#/contracts/${contract.id}/pricebooks/${pb.id}" class="link-h7l698" style="font-weight: 600; color: #111827;">
                                                            ${pbNum}
                                                        </a>
                                                    </td>
                                                    <td style="min-width: 120px;">${pb.items_count || 181}</td>
                                                    <td style="min-width: 100px; width: 100px;">
                                                        <div class="flex-center chip-Dqdeip ${pb.status === 'Active' ? 'success-BmS3ka' : 'danger-W_r0xP'}">${pb.status || 'Active'}</div>
                                                    </td>
                                                    <td style="min-width: 160px;">
                                                        <a href="#/contracts/${contract.id}/pricebooks/${pb.id}" class="link-h7l698" style="color: #111827;">
                                                            ${window.UI.esc(pb.description)}
                                                        </a>
                                                    </td>
                                                    <td style="min-width: 180px; width: 180px;">
                                                        <div class="flex-align-center cellWithIcon-aKqXE6" style="gap: 8px;">
                                                            <span>${window.UI.esc(pb.external_pricebook_number || "1234512")}</span>
                                                            <div class="flex-center editIconWrapper-ut4yEH" style="cursor: pointer;" title="Edit External Number">
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="#666666" xmlns="http://www.w3.org/2000/svg" class="editIcon-RqkAZC">
                                                                    <path d="M0.533333 10.1333L0.15621 9.75621L0 9.91242V10.1333H0.533333ZM10.1333 0.533333L10.5105 0.15621C10.3022 -0.05207 9.96449 -0.05207 9.75621 0.15621L10.1333 0.533333ZM15.4667 5.86667L15.8438 6.24379C16.0521 6.03551 16.0521 5.69782 15.8438 5.48955L15.4667 5.86667ZM5.86667 15.4667V16H6.08758L6.24379 15.8438L5.86667 15.4667ZM0.533333 15.4667H0C0 15.7612 0.238782 16 0.533333 16V15.4667ZM0.910457 10.5105L10.5105 0.910456L9.75621 0.15621L0.15621 9.75621L0.910457 10.5105ZM9.75621 0.910456L15.0895 6.24379L15.8438 5.48955L10.5105 0.15621L9.75621 0.910456ZM15.0895 5.48955L5.48955 15.0895L6.24379 15.8438L15.8438 6.24379L15.0895 5.48955ZM5.86667 14.9333H0.533333V16H5.86667V14.9333ZM1.06667 15.4667V10.1333H0V15.4667H1.06667ZM6.55621 4.11045L11.8895 9.44379L12.6438 8.68955L7.31045 3.35621L6.55621 4.11045ZM8.53333 16H16V14.9333H8.53333V16Z" fill="#666666"/>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style="min-width: 120px;">${pb.currency || "USD"}</td>
                                                    <td style="min-width: 250px; width: 250px;">${pb.created_at ? (pb.created_at.includes(" ") ? pb.created_at : `${pb.created_at} 07:00:37`) : "2026-04-27 07:00:37"}</td>
                                                    <td style="min-width: 50px; width: 50px;">
                                                        <div class="actionMenu-wrap" style="position:relative;">
                                                            <button class="inline-flex-center button-z6sbMq link-xtI0I7 primary-wQbOYq" data-act="pb-menu-toggle" data-id="${pb.id}" aria-label="More options">
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="#121212">
                                                                    <circle cx="8" cy="8" r="1.33" fill="#121212"/>
                                                                    <circle cx="8" cy="3.33" r="1.33" fill="#121212"/>
                                                                    <circle cx="8" cy="12.66" r="1.33" fill="#121212"/>
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>

                            <!-- Pagination matching 03_contract_detail.png -->
                            <div class="pagination-Qo0Zyp hasBackground-KRB3Nk" style="justify-content: flex-end;">
                                <div class="pagination-controls">
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Previous page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);">
                                            <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <button class="pageButton-Ltt_aD active-paX3W6" aria-current="page">1</button>
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Next page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);">
                                            <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <div class="flex-align-center selectorContainer-eqpsde">
                                        <span class="counter-H3K7Fj">Show</span>
                                        <div class="selector-jKTTze">
                                            <div class="ant-select select-l8uECl">
                                                <select id="pb-rows-per-page-select">
                                                    <option value="10" selected>10 rows</option>
                                                    <option value="25">25 rows</option>
                                                    <option value="50">50 rows</option>
                                                </select>
                                                <span>10 rows</span>
                                                <span class="ant-select-arrow">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Tab 2: Supplier Tab View matching tab_supplier.png
       ------------------------------------------------------------- */
    function renderSupplierTab(contract) {
        return `
            <div style="padding: 24px 32px; width: 100%; min-height: 480px; background: #FFFFFF; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px;">
                    <div style="width: 52px; height: 52px; border-radius: 50%; background: #FDE047; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #111827;">-</div>
                    <div>
                        <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 2px 0;">Unknown</h2>
                        <span style="font-size: 13px; color: #6B7280;">Score: - / 10</span>
                    </div>
                </div>

                <h3 style="font-size: 17px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Supplier Information</h3>

                <div class="supplierInfoList">
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Performance</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Due Diligence Status</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Supply Market Abundance/Scarcity</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Business Impact (if supply stops suddenly)</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Financial Health</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">HSE Quality Status</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Business Criticality</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Safety Criticality</span>
                        <span class="supplierInfoList-value">-</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Total Contract Value</span>
                        <span class="supplierInfoList-value" style="font-weight: 700;">${contract.approved_value ? contract.approved_value.toLocaleString() : "68234115"}</span>
                    </div>
                    <div class="supplierInfoList-item">
                        <span class="supplierInfoList-label">Weight in Spend (% of Contract Value in Annual Spend)</span>
                        <span class="supplierInfoList-value">0.21</span>
                    </div>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Tab 3: KPI Monthly Tracking View matching tab_kpi.png
       ------------------------------------------------------------- */
    function renderKPITab(contract, kpis, isCust) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return `
            <div class="flex-column h-full tabView-HlFARP">
                <div class="motion-content filter-layout">
                    <!-- Left Sidebar matching tab_kpi.png -->
                    <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" data-minimized="false" style="width: 260px;">
                        <div class="flex-center filterArrow-jGyFr7">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 8.07275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                            </svg>
                        </div>
                        <div class="flex-column filterContent-YzzLD2" style="opacity: 1;">
                            <div class="flex-column filterFields-dIjaHp">
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">View Mode</label>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl ant-select-single ant-select-show-arrow">
                                            <div class="ant-select-selector"><span class="ant-select-selection-placeholder">Select frequency</span></div>
                                            <span class="ant-select-arrow"><svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round"/></svg></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">KPI Categories</label>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl ant-select-single ant-select-show-arrow">
                                            <div class="ant-select-selector"><span class="ant-select-selection-placeholder">Select category</span></div>
                                            <span class="ant-select-arrow"><svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round"/></svg></span>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Date</label>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl ant-select-single ant-select-show-arrow">
                                            <div class="ant-select-selector"><span class="ant-select-selection-item">2026</span></div>
                                            <span class="ant-select-arrow"><svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round"/></svg></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button class="inline-flex-center button-z6sbMq w-full link-xtI0I7 success-U99qXn">
                                <span class="flex-align-center label-FlMxDR">Clear All Filters</span>
                            </button>
                        </div>
                    </aside>

                    <!-- Right Table Card matching tab_kpi.png -->
                    <section class="content-table contentTable-_531TS contentTable-ZmxBPD">
                        <div class="flex-column tableContainer-GCJvcD">
                            <div class="flex-align-center tableHeader-aYWNqq" style="justify-content: space-between; padding: 18px 20px;">
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">KPI Performance Tracking</h3>
                                    <div style="font-size: 12.5px; color: #6B7280; display: flex; align-items: center; gap: 6px;">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                        <span>All Performance Cells are Editable. Click on any colored cell to add or update items data.</span>
                                    </div>
                                </div>
                                <div>
                                    <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="create-kpi" style="height: 38px; padding: 0 16px;">
                                        <span class="flex-align-center label-FlMxDR">Create KPI</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tableWrapper-VDyaTh">
                                <table class="table-egCV_Z striped-S6C7kO hoverable-e_h2L2 table">
                                    <thead>
                                        <tr>
                                            <th style="text-align:left; min-width: 180px;">KPI</th>
                                            <th style="min-width: 120px;">Target/Agreed</th>
                                            ${months.map(m => `<th style="min-width: 48px; text-align: center;">${m}</th>`).join("")}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${kpis.length === 0 ? `
                                            <tr>
                                                <td style="font-weight: 600;">On-time delivery</td>
                                                <td>&lt;5</td>
                                                ${months.map(() => `<td style="text-align:center; color: #9CA3AF;">-</td>`).join("")}
                                            </tr>
                                        ` : kpis.map(k => `
                                            <tr>
                                                <td style="text-align:left; font-weight: 600; color: #111827;">${window.UI.esc(k.kpi_name)}</td>
                                                <td>&lt;${k.target_agreed || 5} ${window.UI.esc(k.unit || '')}</td>
                                                ${(k.monthly_values || [null, null, null, null, null, null, null, null, null, null, null, null]).map((v, mIdx) => `
                                                    <td style="text-align:center; cursor: pointer;" data-act="edit-kpi-cell" data-kpi="${k.id}" data-month="${mIdx}" data-val="${v}">
                                                        ${v !== null && v !== undefined ? `<span style="display:inline-block; padding: 2px 6px; border-radius: 4px; background: #DCFCE7; color: #166534; font-weight: 600;">${v}</span>` : `<span style="color: #9CA3AF;">-</span>`}
                                                    </td>
                                                `).join("")}
                                            </tr>
                                        `).join("")}
                                    </tbody>
                                </table>
                            </div>

                            <div class="pagination-Qo0Zyp hasBackground-KRB3Nk" style="justify-content: flex-end;">
                                <div class="pagination-controls">
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Previous page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);">
                                            <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <button class="pageButton-Ltt_aD active-paX3W6" aria-current="page">1</button>
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Next page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);">
                                            <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <div class="flex-align-center selectorContainer-eqpsde">
                                        <span class="counter-H3K7Fj">Show</span>
                                        <div class="selector-jKTTze">
                                            <div class="ant-select select-l8uECl">
                                                <select>
                                                    <option value="10" selected>10 rows</option>
                                                    <option value="25">25 rows</option>
                                                    <option value="50">50 rows</option>
                                                </select>
                                                <span>10 rows</span>
                                                <span class="ant-select-arrow">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Tab 4: Performance Report View matching tab_performance_report.png
       ------------------------------------------------------------- */
    function renderPerformanceTab(contract, reports, isCust) {
        const defaultReports = [
            { id: "26", type: "PIP", title: "sqsqs", status: "Open", priority: "Medium", actions: "0/0", progress: 0, issue_date: "2026-04-04", deadline: "2026-04-20", closed_date: "-" },
            { id: "25", type: "NCR", title: "Not right product", status: "Open", priority: "High", actions: "0/1", progress: 0, issue_date: "2026-04-02", deadline: "2026-04-22", closed_date: "-" },
            { id: "24", type: "NCR", title: "no dilivery", status: "Open", priority: "Medium", actions: "0/0", progress: 0, issue_date: "2026-04-13", deadline: "2026-04-21", closed_date: "-" },
            { id: "23", type: "NCR", title: "Issue", status: "Resolved", priority: "Medium", actions: "0/0", progress: 0, issue_date: "2026-04-02", deadline: "2026-04-22", closed_date: "2026-04-13" }
        ];

        const displayReports = (reports && reports.length > 0) ? reports : defaultReports;

        return `
            <div class="flex-column h-full tabView-HlFARP">
                <div class="motion-content filter-layout">
                    <!-- Left Sidebar matching tab_performance_report.png -->
                    <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" data-minimized="false" style="width: 260px;">
                        <div class="flex-center filterArrow-jGyFr7">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 8.07275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                            </svg>
                        </div>
                        <div class="flex-column filterContent-YzzLD2" style="opacity: 1;">
                            <div class="flex-column filterFields-dIjaHp">
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Report Type</label>
                                    <div class="flex-column-gap-8" style="margin-top: 6px;">
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="radio" name="rep_type" checked value="ALL">
                                            <span class="box-u07F6U" style="border-radius: 50%;"></span>
                                            <div class="label-UX1ihv">All</div>
                                        </label>
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="radio" name="rep_type" value="NCR">
                                            <span class="box-u07F6U" style="border-radius: 50%;"></span>
                                            <div class="label-UX1ihv">NCR</div>
                                        </label>
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="radio" name="rep_type" value="PIP">
                                            <span class="box-u07F6U" style="border-radius: 50%;"></span>
                                            <div class="label-UX1ihv">PIP</div>
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Status</label>
                                    <div class="flex-column-gap-8" style="margin-top: 6px;">
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">Draft</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">Open</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">Resolved</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">Withdrawn</div></label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Priority</label>
                                    <div class="flex-column-gap-8" style="margin-top: 6px;">
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">Critical</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">High</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">Medium</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox"><span class="box-u07F6U"></span><div class="label-UX1ihv">Low</div></label>
                                    </div>
                                </div>
                            </div>
                            <button class="inline-flex-center button-z6sbMq w-full link-xtI0I7 success-U99qXn">
                                <span class="flex-align-center label-FlMxDR">Clear All Filters</span>
                            </button>
                        </div>
                    </aside>

                    <!-- Right Table Card matching tab_performance_report.png -->
                    <section class="content-table contentTable-_531TS contentTable-ZmxBPD">
                        <div class="flex-column tableContainer-GCJvcD">
                            <div class="flex-align-center tableHeader-aYWNqq" style="justify-content: space-between; padding: 18px 20px;">
                                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Performance Report</h3>
                                <div>
                                    <button class="inline-flex-center button-z6sbMq solid-qA3WwL" data-act="create-report" style="height: 38px; padding: 0 16px; background: #E5E7EB; color: #9CA3AF; border-radius: 6px;">
                                        <span class="flex-align-center label-FlMxDR">Create Report</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tableWrapper-VDyaTh">
                                <table class="table-egCV_Z striped-S6C7kO hoverable-e_h2L2 table">
                                    <thead>
                                        <tr>
                                            <th style="min-width: 90px;">Report #</th>
                                            <th style="min-width: 80px;">Type</th>
                                            <th style="min-width: 160px;">Title / description</th>
                                            <th style="min-width: 90px;">Status</th>
                                            <th style="min-width: 90px;">Priority</th>
                                            <th style="min-width: 100px;"># of Actions</th>
                                            <th style="min-width: 130px;">Progress</th>
                                            <th style="min-width: 110px;">Issue date</th>
                                            <th style="min-width: 110px;">Deadline</th>
                                            <th style="min-width: 110px;">Closed date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${displayReports.map(rep => {
                                            const isPip = rep.type === 'PIP';
                                            const isOpen = rep.status === 'Open';
                                            const isHigh = rep.priority === 'High';
                                            return `
                                                <tr>
                                                    <td style="font-weight: 600;">${window.UI.esc(rep.id.replace(/^[A-Za-z]+-/, ""))}</td>
                                                    <td>
                                                        <span class="${isPip ? 'badge-pip' : 'badge-ncr'}">${rep.type}</span>
                                                    </td>
                                                    <td style="font-weight: 500; color: #111827;">${window.UI.esc(rep.title)}</td>
                                                    <td>
                                                        <span style="display:inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${isOpen ? '#EFF6FF' : '#DCFCE7'}; color: ${isOpen ? '#2563EB' : '#166534'};">${rep.status}</span>
                                                    </td>
                                                    <td>
                                                        <span style="display:inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${isHigh ? '#FEE2E2' : '#FEF3C7'}; color: ${isHigh ? '#DC2626' : '#D97706'};">${rep.priority}</span>
                                                    </td>
                                                    <td>${rep.actions || `${rep.actions_done || 0}/${rep.actions_total || 0}`}</td>
                                                    <td>
                                                        <div style="font-size: 12px; margin-bottom: 2px;">${rep.progress_pct || rep.progress || 0}%</div>
                                                        <div style="height: 4px; width: 100px; background: #6B7280; border-radius: 2px; overflow: hidden;">
                                                            <div style="height: 100%; width: ${rep.progress_pct || rep.progress || 0}%; background: #1E3A0F;"></div>
                                                        </div>
                                                    </td>
                                                    <td>${rep.issue_date || '-'}</td>
                                                    <td>${rep.deadline || '-'}</td>
                                                    <td>${rep.closed_date || '-'}</td>
                                                </tr>
                                            `;
                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>

                            <div class="pagination-Qo0Zyp hasBackground-KRB3Nk" style="justify-content: flex-end;">
                                <div class="pagination-controls">
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Previous page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);">
                                            <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <button class="pageButton-Ltt_aD active-paX3W6" aria-current="page">1</button>
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Next page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);">
                                            <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                        </svg>
                                    </button>
                                    <div class="flex-align-center selectorContainer-eqpsde">
                                        <span class="counter-H3K7Fj">Show</span>
                                        <div class="selector-jKTTze">
                                            <div class="ant-select select-l8uECl">
                                                <select>
                                                    <option value="10" selected>10 rows</option>
                                                    <option value="25">25 rows</option>
                                                    <option value="50">50 rows</option>
                                                </select>
                                                <span>10 rows</span>
                                                <span class="ant-select-arrow">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Tab 5: Dashboards & Analytics matching tab_dashboards.png
       ------------------------------------------------------------- */
    function renderDashboardsTab(contract, pricebooks, kpis, reports) {
        return `
            <div class="flex-column h-full tabView-HlFARP" style="padding-top: 6px;">
                <div style="margin-bottom: 24px; width: 220px;">
                    <div class="container-sIDwkX">
                        <div class="ant-select ant-select-outlined select-l8uECl ant-select-single ant-select-show-arrow">
                            <div class="ant-select-selector">
                                <span class="ant-select-selection-item">Action Level</span>
                            </div>
                            <span class="ant-select-arrow">
                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round"/></svg>
                            </span>
                        </div>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div class="card-eNpN6p" style="padding: 24px; background: #FFFFFF; border-radius: 8px;">
                        <span style="font-size: 13px; color: #6B7280; font-weight: 600;">APPROVED CONTRACT VALUE</span>
                        <div style="font-size: 28px; font-weight: 800; color: #1E3A0F; margin: 12px 0 8px 0;">
                            ${window.UI.money(contract.approved_value || 18990, contract.currency || "USD")}
                        </div>
                        <span style="font-size: 12px; color: #10B981; font-weight: 500;">✓ 100% committed ceiling</span>
                    </div>

                    <div class="card-eNpN6p" style="padding: 24px; background: #FFFFFF; border-radius: 8px;">
                        <span style="font-size: 13px; color: #6B7280; font-weight: 600;">ATTACHED PRICEBOOKS</span>
                        <div style="font-size: 28px; font-weight: 800; color: #111827; margin: 12px 0 8px 0;">
                            ${pricebooks.length || 1}
                        </div>
                        <span style="font-size: 12px; color: #6B7280;">181 total catalog items</span>
                    </div>

                    <div class="card-eNpN6p" style="padding: 24px; background: #FFFFFF; border-radius: 8px;">
                        <span style="font-size: 13px; color: #6B7280; font-weight: 600;">ACTIVE NCR / PIP INCIDENTS</span>
                        <div style="font-size: 28px; font-weight: 800; color: #D97706; margin: 12px 0 8px 0;">
                            3 Open
                        </div>
                        <span style="font-size: 12px; color: #6B7280;">1 Incident resolved this period</span>
                    </div>
                </div>
            </div>
        `;
    }

    function bindEvents(root, contract, contractId) {
        // Pricebook Search Input
        const searchInput = root.querySelector("#pb-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", (e) => {
                pbSearchQuery = e.target.value;
                const tbody = root.querySelector("table tbody");
                const pbs = window.Store.pricebooksByContract(contractId);
                const q = pbSearchQuery.toLowerCase();
                const filtered = pbs.filter(p =>
                    (p.description && p.description.toLowerCase().includes(q)) ||
                    (p.pricebook_number && p.pricebook_number.toLowerCase().includes(q))
                );
                if (tbody) {
                    if (filtered.length === 0) {
                        tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:36px;color:#6B7280;">No pricebooks match your search.</td></tr>`;
                    } else {
                        tbody.innerHTML = filtered.map((pb, idx) => `
                            <tr>
                                <td style="min-width: 60px; width: 60px;">${idx + 1}</td>
                                <td style="min-width: 120px; width: 120px;">
                                    <a href="#/contracts/${contract.id}/pricebooks/${pb.id}" class="link-h7l698" style="font-weight: 600; color: #111827;">${pb.pricebook_number.replace(/^[A-Za-z]+-/, "")}</a>
                                </td>
                                <td>${pb.items_count || 181}</td>
                                <td style="min-width: 100px; width: 100px;">
                                    <div class="flex-center chip-Dqdeip ${pb.status === 'Active' ? 'success-BmS3ka' : 'danger-W_r0xP'}">${pb.status || 'Active'}</div>
                                </td>
                                <td><a href="#/contracts/${contract.id}/pricebooks/${pb.id}" class="link-h7l698" style="color: #111827;">${window.UI.esc(pb.description)}</a></td>
                                <td>${window.UI.esc(pb.external_pricebook_number || "1234512")}</td>
                                <td>${pb.currency || "USD"}</td>
                                <td>${pb.created_at ? `${pb.created_at} 07:00:37` : "2026-04-27 07:00:37"}</td>
                                <td>
                                    <button class="inline-flex-center button-z6sbMq link-xtI0I7 primary-wQbOYq" data-act="pb-menu-toggle" data-id="${pb.id}">
                                        <svg width="16" height="16" viewBox="0 0 16 16" fill="#121212"><circle cx="8" cy="8" r="1.33"/><circle cx="8" cy="3.33" r="1.33"/><circle cx="8" cy="12.66" r="1.33"/></svg>
                                    </button>
                                </td>
                            </tr>
                        `).join("");
                    }
                }
            });
        }

        // Action Handlers
        window.UI.bindActions(root, {
            "create-pricebook": () => openCreatePricebookModal(contract, () => render(root, contractId, "pricebook")),
            "create-kpi": () => openCreateKPIModal(contract, () => render(root, contractId, "kpi")),
            "create-report": () => openCreateReportModal(contract, () => render(root, contractId, "performance")),
            "edit-kpi-cell": (t) => {
                const kpiId = t.getAttribute("data-kpi");
                const monthIdx = parseInt(t.getAttribute("data-month"), 10);
                const currentVal = t.getAttribute("data-val");
                const newVal = prompt(`Update KPI actual value for Month ${monthIdx + 1}:`, currentVal === "null" || !currentVal ? "" : currentVal);
                if (newVal !== null && newVal !== "") {
                    const num = parseFloat(newVal);
                    if (!isNaN(num)) {
                        window.Store.set(s => {
                            const k = (s.kpis || []).find(x => x.id === kpiId);
                            if (k && k.monthly_values) {
                                k.monthly_values[monthIdx] = num;
                            }
                        });
                        window.UI.toast({ kind: "success", title: "KPI Value Updated", body: `Recorded: ${num}` });
                        render(root, contractId, "kpi");
                    }
                }
            }
        });
    }

    /* Helper Modals */
    function openCreatePricebookModal(contract, cb) {
        window.UI.openModal({
            title: `Create New Pricebook — ${contract.id}`,
            bodyHtml: `
                <form id="pb-form" class="formGrid-PTja0j" style="display:grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="grid-column: span 2;">
                        <label class="label-uhdLaM">Pricebook Description <span style="color:#EF4444;">*</span></label>
                        <input type="text" class="input-YKgOhO w-full" name="description" placeholder="e.g. Moulded case circuit breaker" required>
                    </div>
                    <div>
                        <label class="label-uhdLaM">External Pricebook Number <span style="color:#EF4444;">*</span></label>
                        <input type="text" class="input-YKgOhO w-full" name="external_pricebook_number" placeholder="1234512" required>
                    </div>
                    <div>
                        <label class="label-uhdLaM">Currency <span style="color:#EF4444;">*</span></label>
                        <select class="input-YKgOhO w-full" name="currency">
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="AZN">AZN</option>
                        </select>
                    </div>
                </form>
            `,
            buttons: [
                { label: "Cancel", cls: "button-z6sbMq solid-qA3WwL", onClick: ov => ov.remove() },
                {
                    label: "Create Pricebook",
                    cls: "button-z6sbMq solid-qA3WwL primary-wQbOYq",
                    onClick: ov => {
                        const form = ov.querySelector("#pb-form");
                        const desc = form.description.value.trim();
                        const ext = form.external_pricebook_number.value.trim();
                        const cur = form.currency.value;
                        if (!desc || !ext) {
                            alert("Please fill in all required fields.");
                            return;
                        }
                        const newId = "PB-" + Date.now().toString(36).toUpperCase();
                        window.Store.set(s => {
                            if (!s.pricebooks) s.pricebooks = [];
                            s.pricebooks.push({
                                id: newId,
                                contract_id: contract.id,
                                pricebook_number: `PB-${(s.pricebooks.length + 1).toString().padStart(3, "0")}`,
                                external_pricebook_number: ext,
                                description: desc,
                                currency: cur,
                                status: "Active",
                                items_count: 181,
                                created_at: new Date().toISOString().slice(0, 10)
                            });
                            contract.pricebook_count = (contract.pricebook_count || 0) + 1;
                        });
                        window.UI.toast({ kind: "success", title: "Pricebook Created", body: `Pricebook ${ext} successfully added.` });
                        ov.remove();
                        cb();
                    }
                }
            ]
        });
    }

    function openCreateKPIModal(contract, cb) {
        window.UI.openModal({
            title: `Create Service Level KPI`,
            bodyHtml: `
                <form id="kpi-form" style="display:flex; flex-direction:column; gap: 14px;">
                    <div>
                        <label class="label-uhdLaM">KPI Name <span style="color:#EF4444;">*</span></label>
                        <input type="text" class="input-YKgOhO w-full" name="kpi_name" placeholder="e.g. On-time delivery" required>
                    </div>
                    <div>
                        <label class="label-uhdLaM">Target / Agreed Value <span style="color:#EF4444;">*</span></label>
                        <input type="number" step="0.1" class="input-YKgOhO w-full" name="target_agreed" placeholder="5.0" required>
                    </div>
                    <div>
                        <label class="label-uhdLaM">Unit</label>
                        <input type="text" class="input-YKgOhO w-full" name="unit" placeholder="%, days" value="%">
                    </div>
                </form>
            `,
            buttons: [
                { label: "Cancel", cls: "button-z6sbMq solid-qA3WwL", onClick: ov => ov.remove() },
                {
                    label: "Add KPI",
                    cls: "button-z6sbMq solid-qA3WwL primary-wQbOYq",
                    onClick: ov => {
                        const form = ov.querySelector("#kpi-form");
                        const name = form.kpi_name.value.trim();
                        const tgt = parseFloat(form.target_agreed.value);
                        const unit = form.unit.value.trim();
                        if (!name || isNaN(tgt)) {
                            alert("Please fill in valid KPI details.");
                            return;
                        }
                        const newId = "kpi_" + Date.now().toString(36);
                        window.Store.set(s => {
                            if (!s.kpis) s.kpis = [];
                            s.kpis.push({
                                id: newId,
                                contract_id: contract.id,
                                kpi_name: name,
                                target_agreed: tgt,
                                unit: unit,
                                monthly_values: [null, null, null, null, null, null, null, null, null, null, null, null]
                            });
                        });
                        window.UI.toast({ kind: "success", title: "KPI Added", body: `Assigned KPI: ${name}` });
                        ov.remove();
                        cb();
                    }
                }
            ]
        });
    }

    function openCreateReportModal(contract, cb) {
        window.UI.openModal({
            title: `Issue Performance Report (NCR / PIP)`,
            bodyHtml: `
                <form id="rep-form" style="display:flex; flex-direction:column; gap: 14px;">
                    <div>
                        <label class="label-uhdLaM">Report Type <span style="color:#EF4444;">*</span></label>
                        <select class="input-YKgOhO w-full" name="type">
                            <option value="NCR">NCR — Non-Conformance Report</option>
                            <option value="PIP">PIP — Performance Improvement Plan</option>
                        </select>
                    </div>
                    <div>
                        <label class="label-uhdLaM">Incident Title <span style="color:#EF4444;">*</span></label>
                        <input type="text" class="input-YKgOhO w-full" name="title" placeholder="e.g. Broken packaging or late delivery" required>
                    </div>
                    <div>
                        <label class="label-uhdLaM">Priority</label>
                        <select class="input-YKgOhO w-full" name="priority">
                            <option value="Medium">Medium</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                            <option value="Low">Low</option>
                        </select>
                    </div>
                </form>
            `,
            buttons: [
                { label: "Cancel", cls: "button-z6sbMq solid-qA3WwL", onClick: ov => ov.remove() },
                {
                    label: "Submit Report",
                    cls: "button-z6sbMq solid-qA3WwL primary-wQbOYq",
                    onClick: ov => {
                        const form = ov.querySelector("#rep-form");
                        const typ = form.type.value;
                        const tit = form.title.value.trim();
                        const pri = form.priority.value;
                        if (!tit) {
                            alert("Please enter a title.");
                            return;
                        }
                        const newId = `${Math.floor(Math.random() * 90 + 10)}`;
                        window.Store.set(s => {
                            if (!s.performance_reports) s.performance_reports = [];
                            s.performance_reports.unshift({
                                id: newId,
                                contract_id: contract.id,
                                type: typ,
                                title: tit,
                                status: "Open",
                                priority: pri,
                                actions: "0/0",
                                progress: 0,
                                issue_date: new Date().toISOString().slice(0, 10),
                                deadline: "2026-04-30",
                                closed_date: "-"
                            });
                        });
                        window.UI.toast({ kind: "success", title: "Report Submitted", body: `Report #${newId} logged.` });
                        ov.remove();
                        cb();
                    }
                }
            ]
        });
    }

    return { render };
})();

