/* ============================================================
   views/contract-detail.js — 1:1 Pixel-Perfect 5-Tab Contract Hub
   Pricebook, Supplier, KPI, Performance Report, Dashboards
   Matching demov2.dmpservice.ai/contract/26/pricebooks DOM & CSS
   ============================================================ */
window.ContractDetailView = (function () {

    let activeTab = "pricebook";
    let isHeroCollapsed = false;

    // Pricebook Tab filters & pagination
    let pbSearchQuery = "";
    let pbStatusFilter = { active: true, disabled: false };
    let pbCurrencyFilter = "";
    let pbPage = 1;
    let pbPageSize = 10;

    // KPI Tab filters
    let kpiFrequencyFilter = "";
    let kpiCategoryFilter = "";
    let kpiYearFilter = "2026";
    let kpiPage = 1;
    let kpiPageSize = 10;

    // Performance Report Tab filters
    let perfTypeFilter = "ALL";
    let perfStatusFilter = { Draft: true, Open: true, Resolved: true, Withdrawn: true };
    let perfPriorityFilter = { Critical: true, High: true, Medium: true, Low: true };
    let perfPage = 1;
    let perfPageSize = 10;

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
            ${window.UI.breadcrumb("Contracts", `Contract # ${contractNum}`)}
            <div class="flex-column h-full page-viewport pageWrapper-iFXGCW" style="padding: 16px 28px; width: 100%;">
                <div>
                    <!-- 3-Column Metadata Hero matching demov2 -->
                    <div>
                        <div class="verticalExtraSection-KdA1Jm" id="contract-metadata-section" style="${isHeroCollapsed ? 'display:none;' : 'display:block;'}">
                            <div>
                                <div class="flex-align-center list-WdlufD">
                                    <div class="container-ypalLs w-full">
                                        <ul>
                                            <li>
                                                <span class="itemLabel-sCP6mE">${isCust ? "Supplier name:" : "Customer name:"}</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(isCust ? contract.supplier : (contract.customer || "Delta Drilling LTD."))}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Contract description:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract.description)}</span></span>
                                            </li>
                                            ${isCust ? `
                                            <li>
                                                <span class="itemLabel-sCP6mE">Contract approved value:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${contract.approved_value ? contract.approved_value.toLocaleString() : "18,990"}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Customer ID:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${contract.customer_id || "5"}</span></span>
                                            </li>` : `
                                            <li>
                                                <span class="itemLabel-sCP6mE">Supplier ID:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${contract.supplier_id || "7"}</span></span>
                                            </li>`}
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

                        <!-- Expander toggle chevron -->
                        <div class="verticalExpanderToggle-WLNyNb" id="toggle-hero-btn" title="Toggle contract details" style="cursor: pointer;">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="#3A3A3A" xmlns="http://www.w3.org/2000/svg" style="${isHeroCollapsed ? 'transform:rotate(180deg);' : ''}; transition: transform 0.2s;">
                                <path d="M14.2319 6.71766C14.3386 6.82506 14.3991 6.96986 14.4006 7.12123C14.4021 7.2726 14.3444 7.41858 14.2399 7.52806C14.1891 7.58167 14.128 7.62454 14.0604 7.65412C13.9927 7.68371 13.9198 7.69942 13.8459 7.70031C13.7721 7.70121 13.6988 7.68727 13.6304 7.65934C13.5621 7.6314 13.5 7.59002 13.4479 7.53766L8.0823 2.17766L2.5559 7.83366C2.50445 7.88664 2.44289 7.92876 2.37487 7.95752C2.30685 7.98628 2.23375 8.0011 2.1599 8.0011C2.08605 8.0011 2.01295 7.98628 1.94493 7.95752C1.87691 7.92876 1.81535 7.88664 1.7639 7.83366C1.65872 7.72515 1.59991 7.57997 1.59991 7.42886C1.59991 7.27774 1.65872 7.13256 1.7639 7.02406L7.6799 0.968058C7.73102 0.915428 7.79212 0.873517 7.85962 0.844776C7.92713 0.816034 7.99969 0.801039 8.07306 0.800666C8.14643 0.800294 8.21913 0.814552 8.28693 0.842607C8.35472 0.870661 8.41625 0.91195 8.4679 0.964058L14.2319 6.71766ZM14.2319 13.9177C14.3383 14.025 14.3987 14.1697 14.4002 14.3208C14.4017 14.472 14.3442 14.6178 14.2399 14.7273C14.1891 14.7809 14.128 14.8237 14.0604 14.8533C13.9927 14.8829 13.9198 14.8986 13.8459 14.8995C13.7721 14.9004 13.6988 14.8865 13.6304 14.8585C13.5621 14.8306 13.5 14.7892 13.4479 14.7369L8.0823 9.37686L2.5559 15.0329C2.50445 15.0858 2.44289 15.128 2.37487 15.1567C2.30685 15.1855 2.23375 15.2003 2.1599 15.2003C2.08605 15.2003 2.01295 15.1855 1.94493 15.1567C1.87691 15.128 1.81535 15.0858 1.7639 15.0329C1.65872 14.9244 1.59991 14.7792 1.59991 14.6281C1.59991 14.4769 1.65872 14.3318 1.7639 14.2233L7.6799 8.16806C7.73102 8.11543 7.79212 8.07352 7.85962 8.04478C7.92713 8.01603 7.99969 8.00104 8.07306 8.00067C8.14643 0.800294 8.21913 0.814552 8.28693 0.84261C8.35472 0.87066 8.41625 0.91195 8.4679 0.96406L14.2319 13.9177Z" fill="#3A3A3A"/>
                            </svg>
                        </div>
                    </div>
                </div>

                ${isCust ? `
                <!-- 5 Connected Segmented Tabs for Customer matching demov2 -->
                <div class="tabsWrapper-NSSGrZ">
                    <div>
                        <div class="tabs-Ugdckk tabsContainer-QAZ9xC">
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'pricebook' ? 'active-H9_pwE' : ''}" data-tab="pricebook" style="cursor:pointer;">Pricebook</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'supplier' ? 'active-H9_pwE' : ''}" data-tab="supplier" style="cursor:pointer;">Supplier</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'kpi' ? 'active-H9_pwE' : ''}" data-tab="kpi" style="cursor:pointer;">KPI</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'performance' ? 'active-H9_pwE' : ''}" data-tab="performance" style="cursor:pointer;">Performance Report</div>
                            <div class="tab-_vau_a tab-iuHCpT ${activeTab === 'dashboards' ? 'active-H9_pwE' : ''}" data-tab="dashboards" style="cursor:pointer;">Dashboards</div>
                        </div>
                    </div>

                    <!-- Tab Views -->
                    <div class="tabContent-kOFLBy tabContent-n_Wx8b">
                        ${activeTab === "pricebook" ? renderPricebookTab(contract, pricebooks, isCust) : ""}
                        ${activeTab === "supplier" ? renderSupplierTab(contract) : ""}
                        ${activeTab === "kpi" ? renderKPITab(contract, kpis, isCust) : ""}
                        ${activeTab === "performance" ? renderPerformanceTab(contract, reports, isCust) : ""}
                        ${activeTab === "dashboards" ? renderDashboardsTab(contract) : ""}
                    </div>
                </div>
                ` : `
                <!-- Supplier View: Direct Pricebooks table matching 09_supplier_contract_detail.png -->
                <div class="tabContent-kOFLBy tabContent-n_Wx8b" style="margin-top: 16px;">
                    ${renderPricebookTab(contract, pricebooks, isCust)}
                </div>
                `}
            </div>
            ${window.UI.renderFeedbackBubble ? window.UI.renderFeedbackBubble() : ""}
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

        // Bind Sub-Tabs Switching via URL Hash
        root.querySelectorAll(".tab-iuHCpT").forEach(tabEl => {
            tabEl.addEventListener("click", () => {
                const target = tabEl.getAttribute("data-tab");
                if (target) {
                    window.location.hash = `#/contracts/${contractId}/${target}`;
                }
            });
        });

        // Bind Tab-specific Actions & Filters
        bindEvents(root, contract, contractId);
    }

    /* -------------------------------------------------------------
       Tab 1: Pricebook Tab View matching 05_contract_detail_pricebooks.png
       ------------------------------------------------------------- */
    function filterPricebooks(pricebooks) {
        return pricebooks.filter(pb => {
            const isActive = pb.status === "Active";
            const isDisabled = pb.status === "Disabled" || pb.status === "Inactive";

            if (pbStatusFilter.active && !pbStatusFilter.disabled && !isActive) return false;
            if (!pbStatusFilter.active && pbStatusFilter.disabled && !isDisabled) return false;
            if (!pbStatusFilter.active && !pbStatusFilter.disabled) return false;

            if (pbCurrencyFilter && pb.currency !== pbCurrencyFilter) return false;

            if (pbSearchQuery) {
                const q = pbSearchQuery.toLowerCase();
                const matchDesc = pb.description && pb.description.toLowerCase().includes(q);
                const matchNum = pb.pricebook_number && pb.pricebook_number.toLowerCase().includes(q);
                const matchExt = pb.external_pricebook_number && pb.external_pricebook_number.toLowerCase().includes(q);
                if (!matchDesc && !matchNum && !matchExt) return false;
            }
            return true;
        });
    }

    function renderPricebookTab(contract, pricebooks, isCust) {
        const filteredPbs = filterPricebooks(pricebooks);

        return `
            <div class="flex-column h-full tabView-HlFARP">
                <div class="motion-content filter-layout">
                    <!-- Left Sidebar matching demov2 -->
                    <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" data-minimized="false">
                        <div class="flex-center filterArrow-jGyFr7" title="Collapse sidebar">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 0.87275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                            </svg>
                        </div>
                        <div class="flex-column filterContent-YzzLD2">
                            <div class="flex-column filterFields-dIjaHp">
                                <div class="form-group">
                                    <div class="flex-row">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Status</label>
                                    </div>
                                    <div class="flex-column-gap-8">
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="checkbox" id="pb-filter-active" ${pbStatusFilter.active ? 'checked' : ''} name="pb_status_active">
                                            <span class="box-u07F6U"></span>
                                            <div class="label-UX1ihv">Active</div>
                                        </label>
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="checkbox" id="pb-filter-disabled" ${pbStatusFilter.disabled ? 'checked' : ''} name="pb_status_disabled">
                                            <span class="box-u07F6U"></span>
                                            <div class="label-UX1ihv">Disabled</div>
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <div class="flex-row">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Currency</label>
                                    </div>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl css-1r50iqp ant-select-single ant-select-show-arrow" style="width: 100%; position: relative;">
                                            <div class="ant-select-selector" style="display:flex;align-items:center;width:100%;height:100%;">
                                                <span class="ant-select-selection-wrap" style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                                                    <span id="pb-currency-display" class="${pbCurrencyFilter ? 'ant-select-selection-item' : 'ant-select-selection-placeholder'}" style="font-size:13.5px;color:${pbCurrencyFilter ? '#111827' : '#9CA3AF'};">
                                                        ${pbCurrencyFilter || 'Select...'}
                                                    </span>
                                                </span>
                                                <span class="ant-select-arrow" style="margin-left:8px;pointer-events:none;">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                        <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                    </svg>
                                                </span>
                                            </div>
                                            <select id="pb-currency-select" aria-label="Currency" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:2;">
                                                <option value="" ${pbCurrencyFilter === "" ? "selected" : ""}>Select...</option>
                                                <option value="USD" ${pbCurrencyFilter === "USD" ? "selected" : ""}>USD</option>
                                                <option value="EUR" ${pbCurrencyFilter === "EUR" ? "selected" : ""}>EUR</option>
                                                <option value="GBP" ${pbCurrencyFilter === "GBP" ? "selected" : ""}>GBP</option>
                                                <option value="AZN" ${pbCurrencyFilter === "AZN" ? "selected" : ""}>AZN</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="inline-flex-center button-z6sbMq w-full link-xtI0I7 success-U99qXn" id="clear-pb-filters-btn" style="cursor: pointer;">
                                <span class="flex-align-center label-FlMxDR">Clear All Filters</span>
                            </button>
                        </div>
                    </aside>

                    <!-- Table Card Container matching demov2 -->
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
                                <div>
                                    <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="create-pricebook" style="height: 40px; padding: 0 16px; background: #111827; color: #FFFFFF; border: none; border-radius: 6px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
                                        <span class="flex-align-center label-FlMxDR">Create pricebook</span>
                                    </button>
                                </div>
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
                                            <th style="width: 48px; min-width: 48px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="pb-table-body">
                                        ${filteredPbs.length === 0 ? `
                                            <tr><td colspan="9" style="text-align:center;padding:40px 20px;background:#fff;">${window.UI.emptyFolder("No pricebooks match the selected filters.")}</td></tr>
                                        ` : filteredPbs.map((pb, idx) => {
                                            const pbNum = pb.pricebook_number ? pb.pricebook_number.replace(/^[A-Za-z]+-/, "") : (idx + 1);
                                            return `
                                                <tr data-act="open-pb" data-cid="${contract.id}" data-pbid="${pb.id}" style="cursor: pointer;">
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
                                                        <div class="flex-align-center cellWithIcon-aKqXE6" style="gap: 8px; justify-content: space-between;">
                                                            <span>${window.UI.esc(pb.external_pricebook_number || "1234512")}</span>
                                                            <div class="flex-center editIconWrapper-ut4yEH" data-act="edit-external-pb-num" data-cid="${contract.id}" data-pbid="${pb.id}" style="cursor: pointer; padding: 4px;" title="Edit External Number">
                                                                <svg width="16" height="16" viewBox="0 0 16 16" fill="#666666" xmlns="http://www.w3.org/2000/svg" class="editIcon-RqkAZC">
                                                                    <path d="M0.533333 10.1333L0.15621 9.75621L0 9.91242V10.1333H0.533333ZM10.1333 0.533333L10.5105 0.15621C10.3022 -0.05207 9.96449 -0.05207 9.75621 0.15621L10.1333 0.533333ZM15.4667 5.86667L15.8438 6.24379C16.0521 6.03551 16.0521 5.69782 15.8438 5.48955L15.4667 5.86667ZM5.86667 15.4667V16H6.08758L6.24379 15.8438L5.86667 15.4667ZM0.533333 15.4667H0C0 15.7612 0.238782 16 0.533333 16V15.4667ZM0.910457 10.5105L10.5105 0.910456L9.75621 0.15621L0.15621 9.75621L0.910457 10.5105ZM9.75621 0.910456L15.0895 6.24379L15.8438 5.48955L10.5105 0.15621L9.75621 0.910456ZM15.0895 5.48955L5.48955 15.0895L6.24379 15.8438L15.8438 6.24379L15.0895 5.48955ZM5.86667 14.9333H0.533333V16H5.86667V14.9333ZM1.06667 15.4667V10.1333H0V15.4667H1.06667ZM6.55621 4.11045L11.8895 9.44379L12.6438 8.68955L7.31045 3.35621L6.55621 4.11045ZM8.53333 16H16V14.9333H8.53333V16Z" fill="#666666"/>
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td style="min-width: 120px;">${pb.currency || "USD"}</td>
                                                    <td style="min-width: 250px; width: 250px;">${pb.created_at ? (pb.created_at.includes(" ") ? pb.created_at : `${pb.created_at} 07:00:37`) : "2026-04-27 07:00:37"}</td>
                                                    <td style="text-align: right; width: 48px; min-width: 48px;">
                                                        <button type="button" class="inline-flex-center button-z6sbMq ant-dropdown-trigger trigger-Z_D8XQ link-xtI0I7 primary-wQbOYq" data-act="pb-options" data-cid="${contract.id}" data-pbid="${pb.id}" aria-label="More options" style="width: 32px; height: 32px; border-radius: 50%; border: none; background: #F3F4F6; cursor: pointer; display: inline-flex; align-items: center; justify-content: center;" title="More options">
                                                            <svg width="16" height="16" viewBox="0 0 16 16" fill="#121212" xmlns="http://www.w3.org/2000/svg">
                                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.66675 7.99996C6.66675 7.26358 7.2637 6.66663 8.00008 6.66663C8.73646 6.66663 9.33341 7.26358 9.33341 7.99996C9.33341 8.73634 8.73646 9.33329 8.00008 9.33329C7.2637 9.33329 6.66675 8.73634 6.66675 7.99996Z" fill="#121212"></path>
                                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.66675 3.33333C6.66675 2.59695 7.2637 2 8.00008 2C8.73646 2 9.33341 2.59695 9.33341 3.33333C9.33341 4.06971 8.73646 4.66667 8.00008 4.66667C7.2637 4.66667 6.66675 4.06971 6.66675 3.33333Z" fill="#121212"></path>
                                                                <path fill-rule="evenodd" clip-rule="evenodd" d="M6.66675 12.6667C6.66675 11.9303 7.2637 11.3334 8.00008 11.3334C8.73646 11.3334 9.33341 11.9303 9.33341 12.6667C9.33341 13.4031 8.73646 14 8.00008 14C7.2637 14 6.66675 13.4031 6.66675 12.6667Z" fill="#121212"></path>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>

                            <!-- Pagination matching demov2 -->
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
       Tab 2: Supplier Tab View matching 11_tab_supplier.png
       ------------------------------------------------------------- */
    function renderSupplierTab(contract) {
        return `
            <div style="padding: 24px 32px; width: 100%; min-height: 480px; background: #FFFFFF; border-radius: 8px;">
                <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 28px;">
                    <div style="width: 52px; height: 52px; border-radius: 50%; background: #FDE047; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: 700; color: #111827;">
                        ${(contract.supplier || "M").charAt(0).toUpperCase()}
                    </div>
                    <div>
                        <h2 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 2px 0;">${window.UI.esc(contract.supplier || "Unknown")}</h2>
                        <span style="font-size: 13px; color: #6B7280;">Score: 9.2 / 10</span>
                    </div>
                </div>

                <h3 style="font-size: 17px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Supplier Information</h3>

                <div class="supplierInfoList">
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">Performance</span>
                        <span style="color:#111827; font-weight:500;">9.2 (Exemplary)</span>
                    </div>
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">Due Diligence Status</span>
                        <span style="color:#166534; font-weight:600; background:#DCFCE7; padding:2px 8px; border-radius:4px;">Approved</span>
                    </div>
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">Supply Market Abundance/Scarcity</span>
                        <span style="color:#111827; font-weight:500;">Abundant</span>
                    </div>
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">Business Impact (if supply stops suddenly)</span>
                        <span style="color:#111827; font-weight:500;">Moderate</span>
                    </div>
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">Financial Health</span>
                        <span style="color:#111827; font-weight:500;">Strong (Low Risk)</span>
                    </div>
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">HSE Quality Status</span>
                        <span style="color:#111827; font-weight:500;">ISO 9001 / ISO 14001 / ISO 45001 Certified</span>
                    </div>
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">Business Criticality</span>
                        <span style="color:#111827; font-weight:500;">Tier 1 - Critical</span>
                    </div>
                    <div class="supplierInfoList-item" style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #F3F4F6; font-size:14px;">
                        <span style="color:#374151;">Safety Criticality</span>
                        <span style="color:#111827; font-weight:500;">High</span>
                    </div>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Tab 3: KPI Tracking View matching 12_tab_kpi.png
       ------------------------------------------------------------- */
    function filterKPIs(kpis) {
        return kpis.filter(k => {
            if (kpiFrequencyFilter && k.frequency && k.frequency.toLowerCase() !== kpiFrequencyFilter.toLowerCase()) return false;
            if (kpiCategoryFilter && k.category && !k.category.toLowerCase().includes(kpiCategoryFilter.toLowerCase())) return false;
            return true;
        });
    }

    function renderKPITab(contract, kpis, isCust) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const filteredKPIs = filterKPIs(kpis);

        return `
            <div class="flex-column h-full tabView-HlFARP">
                <div class="motion-content filter-layout">
                    <!-- Left Sidebar matching 12_tab_kpi.png -->
                    <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" data-minimized="false">
                        <div class="flex-center filterArrow-jGyFr7" title="Collapse sidebar">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 0.87275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                            </svg>
                        </div>
                        <div class="flex-column filterContent-YzzLD2">
                            <div class="flex-column filterFields-dIjaHp">
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">View Mode</label>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl css-1r50iqp ant-select-single ant-select-show-arrow" style="width: 100%; position: relative;">
                                            <div class="ant-select-selector" style="display:flex;align-items:center;width:100%;height:100%;">
                                                <span class="ant-select-selection-wrap" style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                                                    <span class="${kpiFrequencyFilter ? 'ant-select-selection-item' : 'ant-select-selection-placeholder'}" style="font-size:13px;color:${kpiFrequencyFilter ? '#111827' : '#9CA3AF'};">
                                                        ${kpiFrequencyFilter || 'All Frequencies'}
                                                    </span>
                                                </span>
                                                <span class="ant-select-arrow" style="margin-left:8px;pointer-events:none;">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                </span>
                                            </div>
                                            <select id="kpi-frequency-select" aria-label="View Mode" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:2;">
                                                <option value="" ${kpiFrequencyFilter === "" ? "selected" : ""}>All Frequencies</option>
                                                <option value="Monthly" ${kpiFrequencyFilter === "Monthly" ? "selected" : ""}>Monthly</option>
                                                <option value="Quarterly" ${kpiFrequencyFilter === "Quarterly" ? "selected" : ""}>Quarterly</option>
                                                <option value="Annually" ${kpiFrequencyFilter === "Annually" ? "selected" : ""}>Annually</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">KPI Categories</label>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl css-1r50iqp ant-select-single ant-select-show-arrow" style="width: 100%; position: relative;">
                                            <div class="ant-select-selector" style="display:flex;align-items:center;width:100%;height:100%;">
                                                <span class="ant-select-selection-wrap" style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                                                    <span class="${kpiCategoryFilter ? 'ant-select-selection-item' : 'ant-select-selection-placeholder'}" style="font-size:13px;color:${kpiCategoryFilter ? '#111827' : '#9CA3AF'};">
                                                        ${kpiCategoryFilter ? (kpiCategoryFilter === 'Delivery' ? 'Delivery Performance' : (kpiCategoryFilter === 'Quality' ? 'Quality Performance' : kpiCategoryFilter)) : 'All Categories'}
                                                    </span>
                                                </span>
                                                <span class="ant-select-arrow" style="margin-left:8px;pointer-events:none;">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                </span>
                                            </div>
                                            <select id="kpi-category-select" aria-label="KPI Categories" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:2;">
                                                <option value="" ${kpiCategoryFilter === "" ? "selected" : ""}>All Categories</option>
                                                <option value="Delivery" ${kpiCategoryFilter === "Delivery" ? "selected" : ""}>Delivery Performance</option>
                                                <option value="Quality" ${kpiCategoryFilter === "Quality" ? "selected" : ""}>Quality Performance</option>
                                                <option value="Commercial" ${kpiCategoryFilter === "Commercial" ? "selected" : ""}>Commercial</option>
                                                <option value="Safety" ${kpiCategoryFilter === "Safety" ? "selected" : ""}>Safety</option>
                                                <option value="Compliance" ${kpiCategoryFilter === "Compliance" ? "selected" : ""}>Compliance</option>
                                                <option value="Operational" ${kpiCategoryFilter === "Operational" ? "selected" : ""}>Operational</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Date</label>
                                    <div class="container-sIDwkX">
                                        <div class="ant-select ant-select-outlined select-l8uECl css-1r50iqp ant-select-single ant-select-show-arrow" style="width: 100%; position: relative;">
                                            <div class="ant-select-selector" style="display:flex;align-items:center;width:100%;height:100%;">
                                                <span class="ant-select-selection-wrap" style="flex:1;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;">
                                                    <span class="ant-select-selection-item" style="font-size:13px;color:#111827;">
                                                        ${kpiYearFilter || '2026'}
                                                    </span>
                                                </span>
                                                <span class="ant-select-arrow" style="margin-left:8px;pointer-events:none;">
                                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none"><path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                                                </span>
                                            </div>
                                            <select id="kpi-year-select" aria-label="Date" style="position:absolute;inset:0;width:100%;height:100%;opacity:0;cursor:pointer;z-index:2;">
                                                <option value="2026" ${kpiYearFilter === "2026" ? "selected" : ""}>2026</option>
                                                <option value="2025" ${kpiYearFilter === "2025" ? "selected" : ""}>2025</option>
                                                <option value="2024" ${kpiYearFilter === "2024" ? "selected" : ""}>2024</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="inline-flex-center button-z6sbMq w-full link-xtI0I7 success-U99qXn" id="clear-kpi-filters-btn" style="cursor: pointer;">
                                <span class="flex-align-center label-FlMxDR">Clear All Filters</span>
                            </button>
                        </div>
                    </aside>

                    <!-- Right Table Card matching 12_tab_kpi.png -->
                    <section class="content-table contentTable-_531TS contentTable-ZmxBPD">
                        <div class="flex-column tableContainer-GCJvcD">
                            <div class="flex-align-center tableHeader-aYWNqq" style="justify-content: space-between; padding: 18px 20px;">
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">KPI Performance Tracking</h3>
                                    <div style="font-size: 12.5px; color: #6B7280; display: flex; align-items: center; gap: 6px;">
                                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                                        <span>Click on any KPI row or cell to open the interactive Performance Matrix Manager.</span>
                                    </div>
                                </div>
                                <div>
                                    <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="create-kpi" style="height: 38px; padding: 0 16px; background: #111827; color: #FFFFFF; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
                                        <span class="flex-align-center label-FlMxDR">Create KPI</span>
                                    </button>
                                </div>
                            </div>

                            <div class="tableWrapper-VDyaTh">
                                <table class="table-egCV_Z striped-S6C7kO hoverable-e_h2L2 table">
                                    <thead>
                                        <tr>
                                            <th style="text-align:left; min-width: 200px;">KPI</th>
                                            <th style="min-width: 120px;">Target/Agreed</th>
                                            ${months.map(m => `<th style="min-width: 48px; text-align: center;">${m}</th>`).join("")}
                                            <th style="min-width: 90px; text-align: center;">YTD Avg</th>
                                            <th style="min-width: 90px; text-align: center;">Status</th>
                                            <th style="width: 44px; min-width: 44px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="kpi-table-body">
                                        ${filteredKPIs.length === 0 ? `
                                            <tr><td colspan="17" style="text-align:center;padding:40px 20px;background:#fff;">${window.UI.emptyFolder("No KPIs match the selected filters.")}</td></tr>
                                        ` : filteredKPIs.map(k => {
                                            const vals = k.monthly_values || [null, null, null, null, null, null, null, null, null, null, null, null];
                                            const statusColor = k.status === 'Achieved' ? '#166534' : (k.status === 'At Risk' ? '#DC2626' : '#6B7280');
                                            const statusBg = k.status === 'Achieved' ? '#DCFCE7' : (k.status === 'At Risk' ? '#FEE2E2' : '#F3F4F6');
                                            return `
                                                <tr data-act="open-kpi" data-kpi="${k.id}" style="cursor: pointer;">
                                                    <td style="text-align:left; font-weight: 600; color: #111827;">
                                                        <div style="display:flex; flex-direction:column; gap:2px;">
                                                            <span>${window.UI.esc(k.kpi_name)}</span>
                                                            <span style="font-size:11px; color:#6B7280; font-weight:normal;">${window.UI.esc(k.category || "General")}</span>
                                                        </div>
                                                    </td>
                                                    <td>${k.operator || "<="}${k.target_agreed || 5} ${window.UI.esc(k.unit || '')}</td>
                                                    ${vals.map((v, mIdx) => `
                                                        <td style="text-align:center;" data-act="edit-kpi-cell" data-kpi="${k.id}" data-month="${mIdx}" data-val="${v}">
                                                            ${v !== null && v !== undefined ? `<span style="display:inline-block; padding: 2px 6px; border-radius: 4px; background: #DCFCE7; color: #166534; font-weight: 600; font-size: 12px;">${v}</span>` : `<span style="color: #9CA3AF;">-</span>`}
                                                        </td>
                                                    `).join("")}
                                                    <td style="text-align:center; font-weight: 700; color: #111827;">
                                                        ${k.ytd_average !== null && k.ytd_average !== undefined ? `${k.ytd_average}${k.unit || ''}` : '-'}
                                                    </td>
                                                    <td style="text-align:center;">
                                                        <span style="display:inline-block; padding:2px 8px; border-radius:4px; font-size:11.5px; font-weight:600; background:${statusBg}; color:${statusColor};">
                                                            ${k.status || 'Active'}
                                                        </span>
                                                    </td>
                                                    <td style="text-align: right; width: 44px;">
                                                        <button type="button" class="inline-flex-center button-z6sbMq" data-act="kpi-options" data-kpi="${k.id}" style="width: 28px; height: 28px; border-radius: 50%; border: none; background: #F3F4F6; cursor: pointer;" title="KPI Options">
                                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="#121212"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>

                            <div class="pagination-Qo0Zyp hasBackground-KRB3Nk" style="justify-content: flex-end;">
                                <div class="pagination-controls">
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Previous page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);"><path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path></svg>
                                    </button>
                                    <button class="pageButton-Ltt_aD active-paX3W6" aria-current="page">1</button>
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Next page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);"><path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Tab 4: Performance Report View matching 13_tab_performance_report.png
       ------------------------------------------------------------- */
    function filterPerformanceReports(reports) {
        return reports.filter(r => {
            if (perfTypeFilter !== "ALL" && r.type !== perfTypeFilter) return false;
            if (perfStatusFilter[r.status] === false) return false;
            if (perfPriorityFilter[r.priority] === false) return false;
            return true;
        });
    }

    function renderPerformanceTab(contract, reports, isCust) {
        const defaultReports = [
            { id: "26", type: "PIP", title: "sqsqs", status: "Open", priority: "Medium", actions: "0/0", progress: 0, issue_date: "2026-04-04", deadline: "2026-04-20", closed_date: "-" },
            { id: "25", type: "NCR", title: "Not right product", status: "Open", priority: "High", actions: "0/1", progress: 0, issue_date: "2026-04-02", deadline: "2026-04-22", closed_date: "-" },
            { id: "24", type: "NCR", title: "no dilivery", status: "Open", priority: "Medium", actions: "0/0", progress: 0, issue_date: "2026-04-13", deadline: "2026-04-21", closed_date: "-" },
            { id: "23", type: "NCR", title: "Issue", status: "Resolved", priority: "Medium", actions: "0/0", progress: 0, issue_date: "2026-04-02", deadline: "2026-04-22", closed_date: "2026-04-13" }
        ];

        const sourceReports = (reports && reports.length > 0) ? reports : defaultReports;
        const filteredReports = filterPerformanceReports(sourceReports);

        return `
            <div class="flex-column h-full tabView-HlFARP">
                <div class="motion-content filter-layout">
                    <!-- Left Sidebar matching 13_tab_performance_report.png -->
                    <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" data-minimized="false">
                        <div class="flex-center filterArrow-jGyFr7" title="Collapse sidebar">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 0.87275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                            </svg>
                        </div>
                        <div class="flex-column filterContent-YzzLD2">
                            <div class="flex-column filterFields-dIjaHp">
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Report Type</label>
                                    <div class="flex-column-gap-8" style="margin-top: 6px;">
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="radio" name="rep_type" value="ALL" ${perfTypeFilter === 'ALL' ? 'checked' : ''}>
                                            <span class="box-u07F6U" style="border-radius: 50%;"></span>
                                            <div class="label-UX1ihv">All</div>
                                        </label>
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="radio" name="rep_type" value="NCR" ${perfTypeFilter === 'NCR' ? 'checked' : ''}>
                                            <span class="box-u07F6U" style="border-radius: 50%;"></span>
                                            <div class="label-UX1ihv">NCR</div>
                                        </label>
                                        <label class="inline-flex-center checkbox-UKyIAt">
                                            <input class="input-fERTBq" type="radio" name="rep_type" value="PIP" ${perfTypeFilter === 'PIP' ? 'checked' : ''}>
                                            <span class="box-u07F6U" style="border-radius: 50%;"></span>
                                            <div class="label-UX1ihv">PIP</div>
                                        </label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Status</label>
                                    <div class="flex-column-gap-8" style="margin-top: 6px;">
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_status" value="Draft" ${perfStatusFilter.Draft ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">Draft</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_status" value="Open" ${perfStatusFilter.Open ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">Open</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_status" value="Resolved" ${perfStatusFilter.Resolved ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">Resolved</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_status" value="Withdrawn" ${perfStatusFilter.Withdrawn ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">Withdrawn</div></label>
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label class="label-uhdLaM minWidth-d4JjCT">Priority</label>
                                    <div class="flex-column-gap-8" style="margin-top: 6px;">
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_priority" value="Critical" ${perfPriorityFilter.Critical ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">Critical</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_priority" value="High" ${perfPriorityFilter.High ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">High</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_priority" value="Medium" ${perfPriorityFilter.Medium ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">Medium</div></label>
                                        <label class="inline-flex-center checkbox-UKyIAt"><input class="input-fERTBq" type="checkbox" name="perf_priority" value="Low" ${perfPriorityFilter.Low ? 'checked' : ''}><span class="box-u07F6U"></span><div class="label-UX1ihv">Low</div></label>
                                    </div>
                                </div>
                            </div>
                            <button type="button" class="inline-flex-center button-z6sbMq w-full link-xtI0I7 success-U99qXn" id="clear-perf-filters-btn" style="cursor: pointer;">
                                <span class="flex-align-center label-FlMxDR">Clear All Filters</span>
                            </button>
                        </div>
                    </aside>

                    <!-- Right Table Card matching 13_tab_performance_report.png -->
                    <section class="content-table contentTable-_531TS contentTable-ZmxBPD">
                        <div class="flex-column tableContainer-GCJvcD">
                            <div class="flex-align-center tableHeader-aYWNqq" style="justify-content: space-between; padding: 18px 20px;">
                                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Performance Report</h3>
                                <div>
                                    <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="create-perf-report" style="height: 38px; padding: 0 16px; background: #111827; color: #FFFFFF; border: none; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">
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
                                            <th style="width: 44px; min-width: 44px;"></th>
                                        </tr>
                                    </thead>
                                    <tbody id="perf-table-body">
                                        ${filteredReports.length === 0 ? `
                                            <tr><td colspan="11" style="text-align:center;padding:40px 20px;background:#fff;">${window.UI.emptyFolder("No performance reports match the selected filters.")}</td></tr>
                                        ` : filteredReports.map(rep => {
                                            const isPip = rep.type === 'PIP';
                                            const isOpen = rep.status === 'Open';
                                            const isResolved = rep.status === 'Resolved';
                                            const isWithdrawn = rep.status === 'Withdrawn';
                                            const isHigh = rep.priority === 'High' || rep.priority === 'Critical';

                                            const statusBg = isResolved ? '#DCFCE7' : (isOpen ? '#EFF6FF' : (isWithdrawn ? '#F3F4F6' : '#FEF3C7'));
                                            const statusColor = isResolved ? '#166534' : (isOpen ? '#2563EB' : (isWithdrawn ? '#6B7280' : '#D97706'));

                                            return `
                                                <tr data-act="open-perf-report" data-repid="${rep.id}" style="cursor: pointer;">
                                                    <td style="font-weight: 600; color: #111827;">${window.UI.esc(rep.id.replace(/^[A-Za-z]+-/, ""))}</td>
                                                    <td>
                                                        <span class="${isPip ? 'badge-pip' : 'badge-ncr'}" style="display:inline-block; padding:2px 8px; border-radius:4px; font-weight:600; font-size:12px; ${isPip ? 'border:1px solid #F59E0B; color:#D97706; background:#FFFBEB;' : 'border:1px solid #EF4444; color:#DC2626; background:#FEF2F2;'}">${rep.type}</span>
                                                    </td>
                                                    <td style="font-weight: 500; color: #111827;">${window.UI.esc(rep.title)}</td>
                                                    <td>
                                                        <span style="display:inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${statusBg}; color: ${statusColor};">${rep.status}</span>
                                                    </td>
                                                    <td>
                                                        <span style="display:inline-flex; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; background: ${isHigh ? '#FEE2E2' : '#FEF3C7'}; color: ${isHigh ? '#DC2626' : '#D97706'};">${rep.priority}</span>
                                                    </td>
                                                    <td>${rep.actions || `${rep.actions_done || 0}/${rep.actions_total || 0}`}</td>
                                                    <td>
                                                        <div style="font-size: 12px; margin-bottom: 2px;">${rep.progress_pct !== undefined ? rep.progress_pct : (rep.progress || 0)}%</div>
                                                        <div style="height: 4px; width: 100px; background: #E5E7EB; border-radius: 2px; overflow: hidden;">
                                                            <div style="height: 100%; width: ${rep.progress_pct !== undefined ? rep.progress_pct : (rep.progress || 0)}%; background: #1E3A0F;"></div>
                                                        </div>
                                                    </td>
                                                    <td>${rep.issue_date || '-'}</td>
                                                    <td>${rep.deadline || '-'}</td>
                                                    <td>${rep.closed_date || '-'}</td>
                                                    <td style="text-align: right; width: 44px;">
                                                        <button type="button" class="inline-flex-center button-z6sbMq" data-act="perf-options" data-repid="${rep.id}" style="width: 28px; height: 28px; border-radius: 50%; border: none; background: #F3F4F6; cursor: pointer;" title="Report Options">
                                                            <svg width="14" height="14" viewBox="0 0 16 16" fill="#121212"><circle cx="8" cy="3" r="1.5"/><circle cx="8" cy="8" r="1.5"/><circle cx="8" cy="13" r="1.5"/></svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>

                            <div class="pagination-Qo0Zyp hasBackground-KRB3Nk" style="justify-content: flex-end;">
                                <div class="pagination-controls">
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Previous page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);"><path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path></svg>
                                    </button>
                                    <button class="pageButton-Ltt_aD active-paX3W6" aria-current="page">1</button>
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Next page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);"><path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path></svg>
                                    </button>
                                    <button class="pageButton-Ltt_aD active-paX3W6" aria-current="page">1</button>
                                    <button class="inline-flex-center navButton-ifUhzO" disabled="" aria-label="Next page">
                                        <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);"><path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path></svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Tab 5: Dashboards matching 14_tab_dashboards.png
       ------------------------------------------------------------- */
    function renderDashboardsTab(contract) {
        return `
            <div class="flex-column h-full tabView-HlFARP" style="padding: 24px 28px; background: #FFFFFF; border-radius: 8px; min-height: 480px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 24px;">
                    <div>
                        <h3 style="font-size: 18px; font-weight: 700; color: #111827; margin: 0 0 4px 0;">Contract Analytics & SPM Dashboard</h3>
                        <p style="font-size: 13px; color: #6B7280; margin: 0;">Performance trends, spend indexation, and KPI compliance benchmarks.</p>
                    </div>
                    <div style="width: 200px;">
                        <select id="dash-view-select" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid #D9D9D9; border-radius: 6px; font-size: 13.5px; background: #FFF; color: #111827;">
                            <option value="action" selected>Action Level</option>
                            <option value="kpi">KPI Level</option>
                            <option value="spend">Spend & Saving</option>
                        </select>
                    </div>
                </div>

                <!-- KPI Metric Cards Grid -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 28px;">
                    <div style="padding: 16px 20px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
                        <div style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase;">Approved Value</div>
                        <div style="font-size: 22px; font-weight: 700; color: #111827; margin-top: 6px;">$18,990</div>
                        <div style="font-size: 12px; color: #10B981; margin-top: 4px;">100% committed</div>
                    </div>
                    <div style="padding: 16px 20px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
                        <div style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase;">Active Pricebooks</div>
                        <div style="font-size: 22px; font-weight: 700; color: #111827; margin-top: 6px;">2</div>
                        <div style="font-size: 12px; color: #3B82F6; margin-top: 4px;">181 Catalog Items</div>
                    </div>
                    <div style="padding: 16px 20px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
                        <div style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase;">Average OTIF Rate</div>
                        <div style="font-size: 22px; font-weight: 700; color: #166534; margin-top: 6px;">96.1%</div>
                        <div style="font-size: 12px; color: #10B981; margin-top: 4px;">Target: &gt; 95% (Achieved)</div>
                    </div>
                    <div style="padding: 16px 20px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px;">
                        <div style="font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase;">Open Issues (NCR/PIP)</div>
                        <div style="font-size: 22px; font-weight: 700; color: #D97706; margin-top: 6px;">3</div>
                        <div style="font-size: 12px; color: #6B7280; margin-top: 4px;">1 Resolved this month</div>
                    </div>
                </div>

                <!-- Chart representation -->
                <div style="border: 1px solid #E5E7EB; border-radius: 8px; padding: 24px; background: #FFF;">
                    <h4 style="font-size: 15px; font-weight: 600; color: #111827; margin: 0 0 16px 0;">Monthly Delivery Performance Trend (2026)</h4>
                    <div style="display: flex; align-items: flex-end; gap: 24px; height: 180px; padding: 20px 0 0 0; border-bottom: 1px solid #E5E7EB;">
                        ${["Jan: 96%", "Feb: 94%", "Mar: 97%", "Apr: 95%", "May: 96%", "Jun: 95%", "Jul: 97%", "Aug: 96%"].map(point => {
                            const [month, pct] = point.split(": ");
                            const val = parseInt(pct, 10);
                            const h = Math.round((val / 100) * 140);
                            return `
                                <div style="flex: 1; display: flex; flex-direction: column; align-items: center; gap: 6px;">
                                    <span style="font-size: 11px; font-weight: 600; color: #166534;">${pct}</span>
                                    <div style="width: 100%; max-width: 44px; height: ${h}px; background: #1E3A0F; border-radius: 4px 4px 0 0;"></div>
                                    <span style="font-size: 12px; color: #6B7280;">${month}</span>
                                </div>
                            `;
                        }).join("")}
                    </div>
                </div>
            </div>
        `;
    }

    /* -------------------------------------------------------------
       Event Binding & Interactivity
       ------------------------------------------------------------- */
    function bindEvents(root, contract, contractId) {
        // 1. Sidebar Minimize Toggle (<< / >>)
        root.querySelectorAll(".filterArrow-jGyFr7").forEach(arrow => {
            arrow.style.cursor = "pointer";
            arrow.onclick = (e) => {
                e.stopPropagation();
                const aside = arrow.closest("aside.sidebar-AY7Hhf");
                if (aside) {
                    const isMin = aside.getAttribute("data-minimized") === "true";
                    aside.setAttribute("data-minimized", isMin ? "false" : "true");
                }
            };
        });

        // 2. Pricebook Tab Event Listeners
        const pbSearchInput = root.querySelector("#pb-search-input");
        if (pbSearchInput) {
            pbSearchInput.addEventListener("input", (e) => {
                pbSearchQuery = e.target.value;
                render(root, contractId, "pricebook");
            });
        }

        const pbActiveChk = root.querySelector("#pb-filter-active");
        if (pbActiveChk) {
            pbActiveChk.addEventListener("change", (e) => {
                pbStatusFilter.active = e.target.checked;
                render(root, contractId, "pricebook");
            });
        }

        const pbDisabledChk = root.querySelector("#pb-filter-disabled");
        if (pbDisabledChk) {
            pbDisabledChk.addEventListener("change", (e) => {
                pbStatusFilter.disabled = e.target.checked;
                render(root, contractId, "pricebook");
            });
        }

        const pbCurrSelect = root.querySelector("#pb-currency-select");
        if (pbCurrSelect) {
            pbCurrSelect.addEventListener("change", (e) => {
                pbCurrencyFilter = e.target.value;
                render(root, contractId, "pricebook");
            });
        }

        const clearPbFiltersBtn = root.querySelector("#clear-pb-filters-btn");
        if (clearPbFiltersBtn) {
            clearPbFiltersBtn.addEventListener("click", () => {
                pbSearchQuery = "";
                pbStatusFilter = { active: true, disabled: false };
                pbCurrencyFilter = "";
                render(root, contractId, "pricebook");
            });
        }

        // 3. KPI Tab Event Listeners
        const kpiFreqSelect = root.querySelector("#kpi-frequency-select");
        if (kpiFreqSelect) {
            kpiFreqSelect.addEventListener("change", (e) => {
                kpiFrequencyFilter = e.target.value;
                render(root, contractId, "kpi");
            });
        }

        const kpiCatSelect = root.querySelector("#kpi-category-select");
        if (kpiCatSelect) {
            kpiCatSelect.addEventListener("change", (e) => {
                kpiCategoryFilter = e.target.value;
                render(root, contractId, "kpi");
            });
        }

        const kpiYrSelect = root.querySelector("#kpi-year-select");
        if (kpiYrSelect) {
            kpiYrSelect.addEventListener("change", (e) => {
                kpiYearFilter = e.target.value;
                render(root, contractId, "kpi");
            });
        }

        const clearKpiFiltersBtn = root.querySelector("#clear-kpi-filters-btn");
        if (clearKpiFiltersBtn) {
            clearKpiFiltersBtn.addEventListener("click", () => {
                kpiFrequencyFilter = "";
                kpiCategoryFilter = "";
                kpiYearFilter = "2026";
                render(root, contractId, "kpi");
            });
        }

        // 4. Performance Tab Event Listeners
        root.querySelectorAll("input[name='rep_type']").forEach(radio => {
            radio.addEventListener("change", (e) => {
                perfTypeFilter = e.target.value;
                render(root, contractId, "performance");
            });
        });

        root.querySelectorAll("input[name='perf_status']").forEach(chk => {
            chk.addEventListener("change", (e) => {
                perfStatusFilter[e.target.value] = e.target.checked;
                render(root, contractId, "performance");
            });
        });

        root.querySelectorAll("input[name='perf_priority']").forEach(chk => {
            chk.addEventListener("change", (e) => {
                perfPriorityFilter[e.target.value] = e.target.checked;
                render(root, contractId, "performance");
            });
        });

        const clearPerfFiltersBtn = root.querySelector("#clear-perf-filters-btn");
        if (clearPerfFiltersBtn) {
            clearPerfFiltersBtn.addEventListener("click", () => {
                perfTypeFilter = "ALL";
                perfStatusFilter = { Draft: true, Open: true, Resolved: true, Withdrawn: true };
                perfPriorityFilter = { Critical: true, High: true, Medium: true, Low: true };
                render(root, contractId, "performance");
            });
        }

        // Initialize datepickers
        window.UI.initAllDatePickers(root);

        // 5. Action Handlers
        window.UI.bindActions(root, {
            "create-pricebook": () => window.UI.openPricebookModal({ contract, onSuccess: () => render(root, contractId, "pricebook") }),

            "open-pb": (t) => {
                const cid = t.getAttribute("data-cid");
                const pbid = t.getAttribute("data-pbid");
                window.location.hash = `#/contracts/${cid}/pricebooks/${pbid}`;
            },

            "edit-external-pb-num": (t, e) => {
                if (e) e.stopPropagation();
                const cid = t.getAttribute("data-cid");
                const pbid = t.getAttribute("data-pbid");
                const pb = window.Store.pricebooks().find(x => x.id === pbid);
                const currVal = pb ? (pb.external_pricebook_number || "") : "";
                window.UI.openEditExternalPbModal({
                    pricebookId: pbid,
                    currentValue: currVal,
                    contract,
                    onSuccess: () => render(root, cid, "pricebook")
                });
            },

            "pb-options": (t, e) => {
                if (e) e.stopPropagation();
                const cid = t.getAttribute("data-cid");
                const pbid = t.getAttribute("data-pbid");
                const pb = window.Store.pricebooks().find(x => x.id === pbid);
                window.UI.showActionMenu(t, [
                    {
                        label: "Open pricebook",
                        onClick: () => { window.location.hash = `#/contracts/${cid}/pricebooks/${pbid}`; }
                    },
                    {
                        label: "Download pricebook",
                        onClick: () => {
                            window.UI.toast({ kind: "success", title: "Download Started", body: `Downloading pricebook #${pb ? (pb.pricebook_number || pbid) : pbid}...` });
                        }
                    },
                    {
                        label: "Benchmark",
                        onClick: () => {
                            window.UI.toast({ kind: "info", title: "Benchmark Initiated", body: `Pricebook benchmarking request submitted.` });
                        }
                    },
                    {
                        label: pb && pb.status === 'Active' ? "Disable pricebook" : "Activate pricebook",
                        onClick: () => {
                            const newStatus = pb && pb.status === 'Active' ? 'Disabled' : 'Active';
                            window.Store.updatePricebook(pbid, { status: newStatus });
                            window.UI.toast({ kind: "success", title: "Status Updated", body: `Pricebook is now ${newStatus}` });
                            render(root, cid, "pricebook");
                        }
                    }
                ]);
            },

            "create-kpi": () => openCreateKPIModal(contract, () => render(root, contractId, "kpi")),

            "open-kpi": (t) => {
                const kpiId = t.getAttribute("data-kpi");
                const k = window.Store.kpiById(kpiId);
                if (k) {
                    openKPIDetailModal(k, contract, () => render(root, contractId, "kpi"));
                }
            },

            "edit-kpi-cell": (t, e) => {
                if (e) e.stopPropagation();
                const kpiId = t.getAttribute("data-kpi");
                const k = window.Store.kpiById(kpiId);
                if (k) {
                    openKPIDetailModal(k, contract, () => render(root, contractId, "kpi"));
                }
            },

            "kpi-options": (t, e) => {
                if (e) e.stopPropagation();
                const kpiId = t.getAttribute("data-kpi");
                const k = window.Store.kpiById(kpiId);
                window.UI.showActionMenu(t, [
                    {
                        label: "Open KPI Manager",
                        onClick: () => { if (k) openKPIDetailModal(k, contract, () => render(root, contractId, "kpi")); }
                    },
                    {
                        label: "Delete KPI",
                        onClick: () => {
                            if (confirm(`Are you sure you want to delete KPI "${k ? k.kpi_name : kpiId}"?`)) {
                                window.Store.deleteKPI(kpiId);
                                window.UI.toast({ kind: "success", title: "KPI Deleted", body: "KPI has been removed." });
                                render(root, contractId, "kpi");
                            }
                        }
                    }
                ]);
            },

            "create-perf-report": () => openCreatePerformanceReportModal(contract, () => render(root, contractId, "performance")),

            "open-perf-report": (t) => {
                const repId = t.getAttribute("data-repid");
                const rep = window.Store.performanceReportById(repId) || { id: repId, type: "PIP", title: "Report #" + repId, status: "Open", priority: "Medium", issue_date: "2026-04-04", deadline: "2026-04-20" };
                openPerformanceReportDetailModal(rep, contract, () => render(root, contractId, "performance"));
            },

            "perf-options": (t, e) => {
                if (e) e.stopPropagation();
                const repId = t.getAttribute("data-repid");
                const rep = window.Store.performanceReportById(repId) || { id: repId, type: "PIP", title: "Report #" + repId, status: "Open", priority: "Medium" };
                const isOpen = rep.status === "Open";
                const isWithdrawn = rep.status === "Withdrawn";
                const isResolved = rep.status === "Resolved";

                const items = [
                    {
                        label: "View details",
                        onClick: () => openPerformanceReportDetailModal(rep, contract, () => render(root, contractId, "performance"))
                    },
                    {
                        label: "Edit report",
                        onClick: () => openEditPerformanceReportModal(rep, contract, () => render(root, contractId, "performance"))
                    }
                ];

                if (isOpen) {
                    items.push({
                        label: "Resolve report",
                        onClick: () => {
                            window.Store.updatePerformanceReport(repId, {
                                status: "Resolved",
                                closed_date: new Date().toISOString().slice(0, 10),
                                progress: 100,
                                progress_pct: 100
                            });
                            window.UI.toast({ kind: "success", title: "Report Resolved", body: `Report #${repId} marked as Resolved.` });
                            render(root, contractId, "performance");
                        }
                    });
                    items.push({
                        label: rep.type === "PIP" ? "Withdraw PIP" : "Withdraw NCR",
                        onClick: () => {
                            if (confirm(`Are you sure you want to withdraw ${rep.type} #${repId}?`)) {
                                window.Store.updatePerformanceReport(repId, { status: "Withdrawn" });
                                window.UI.toast({ kind: "info", title: "Report Withdrawn", body: `${rep.type} #${repId} has been withdrawn.` });
                                render(root, contractId, "performance");
                            }
                        }
                    });
                } else if (isResolved || isWithdrawn) {
                    items.push({
                        label: "Reopen report",
                        onClick: () => {
                            window.Store.updatePerformanceReport(repId, { status: "Open", closed_date: "-" });
                            window.UI.toast({ kind: "info", title: "Report Reopened", body: `Report #${repId} is now Open.` });
                            render(root, contractId, "performance");
                        }
                    });
                }

                items.push({
                    label: "Delete report",
                    onClick: () => {
                        if (confirm(`Are you sure you want to delete report #${repId}?`)) {
                            window.Store.deletePerformanceReport(repId);
                            window.UI.toast({ kind: "success", title: "Report Deleted", body: "Performance report deleted." });
                            render(root, contractId, "performance");
                        }
                    }
                });

                window.UI.showActionMenu(t, items);
            }
        });
    }

    /* -------------------------------------------------------------
       Modal: Create KPI Modal
       ------------------------------------------------------------- */
    function openCreateKPIModal(contract, cb) {
        const modalHtml = `
            <div class="dmp-modal-backdrop" id="kpi-modal-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="dmp-modal-box" style="background:#FFF;border-radius:10px;width:640px;max-width:94vw;box-shadow:0 12px 36px rgba(0,0,0,0.18);padding:24px 30px;position:relative;max-height:92vh;overflow-y:auto;box-sizing:border-box;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="font-size:18px;font-weight:600;color:#111827;margin:0;">Add New KPI</h2>
                        <button type="button" id="kpi-modal-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;line-height:1;padding:0 4px;">✕</button>
                    </div>
                    <form id="kpi-create-form">
                        <div style="margin-bottom:18px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;"><span style="color:#EF4444;margin-right:2px;">*</span>KPI Category</label>
                            <select id="kpi-category" required style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;background:#FFF;color:#111827;outline:none;">
                                <option value="" disabled selected>Select category</option>
                                <option value="Delivery Performance">Delivery Performance</option>
                                <option value="Supplier Quality Performance">Supplier Quality Performance</option>
                                <option value="Cost Savings">Cost Savings</option>
                                <option value="HSE Compliance">HSE Compliance</option>
                                <option value="Commercial">Commercial</option>
                                <option value="Operational">Operational</option>
                            </select>
                        </div>

                        <div style="margin-bottom:18px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;"><span style="color:#EF4444;margin-right:2px;">*</span>KPI Name / Indicator</label>
                            <input type="text" id="kpi-name" required placeholder="e.g., On-Time Delivery Rate" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;background:#FFF;color:#111827;box-sizing:border-box;">
                        </div>

                        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:16px; margin-bottom:18px;">
                            <div>
                                <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Frequency</label>
                                <select id="kpi-frequency" style="width:100%;height:38px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;background:#FFF;">
                                    <option value="Monthly" selected>Monthly</option>
                                    <option value="Quarterly">Quarterly</option>
                                    <option value="Annually">Annually</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Unit of Measure</label>
                                <select id="kpi-unit" style="width:100%;height:38px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;background:#FFF;">
                                    <option value="%" selected>%</option>
                                    <option value="Hours">Hours</option>
                                    <option value="Days">Days</option>
                                    <option value="USD">USD</option>
                                    <option value="Count">Count</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Target Agreed</label>
                                <div style="display:flex; gap:6px;">
                                    <select id="kpi-operator" style="width:64px;height:38px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;background:#FFF;">
                                        <option value=">=" selected>&gt;=</option>
                                        <option value="<=">&lt;=</option>
                                        <option value=">">&gt;</option>
                                        <option value="<">&lt;</option>
                                    </select>
                                    <input type="number" id="kpi-target" required value="95" style="flex:1;height:38px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;">
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom:20px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;"><span style="color:#EF4444;margin-right:2px;">*</span>Score Ranges Definition</label>
                            <div style="border:1px solid #E5E7EB;border-radius:8px;padding:16px;background:#FFF;display:flex;flex-direction:column;gap:12px;">
                                <div style="display:grid;grid-template-columns:140px 1fr 1fr;gap:16px;align-items:center;">
                                    <div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#DC2626;"><span style="font-size:16px;">●</span> Low Score</div>
                                    <div><input type="number" id="kpi-low-min" value="0" placeholder="Min" style="width:100%;height:34px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;" /></div>
                                    <div><input type="number" id="kpi-low-max" value="70" placeholder="Max" style="width:100%;height:34px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;" /></div>
                                </div>
                                <div style="display:grid;grid-template-columns:140px 1fr 1fr;gap:16px;align-items:center;">
                                    <div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#D97706;"><span style="font-size:16px;">●</span> Middle Score</div>
                                    <div><input type="number" id="kpi-mid-min" value="71" placeholder="Min" style="width:100%;height:34px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;" /></div>
                                    <div><input type="number" id="kpi-mid-max" value="89" placeholder="Max" style="width:100%;height:34px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;" /></div>
                                </div>
                                <div style="display:grid;grid-template-columns:140px 1fr 1fr;gap:16px;align-items:center;">
                                    <div style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:500;color:#166534;"><span style="font-size:16px;">●</span> High Score</div>
                                    <div><input type="number" id="kpi-high-min" value="90" placeholder="Min" style="width:100%;height:34px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;" /></div>
                                    <div><input type="number" id="kpi-high-max" value="100" placeholder="Max" style="width:100%;height:34px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;" /></div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom:24px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;"><span style="color:#EF4444;margin-right:2px;">*</span>Description & Measurement Criteria</label>
                            <textarea id="kpi-description" required placeholder="Provide a detailed description of this KPI and measurement criteria..." style="width:100%;height:72px;padding:10px 12px;border:1px solid #D9D9D9;border-radius:6px;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;color:#111827;"></textarea>
                        </div>

                        <div style="display:flex;justify-content:flex-end;gap:12px;">
                            <button type="button" id="kpi-cancel-btn" style="height:38px;padding:0 20px;border:1px solid #D9D9D9;background:#FFF;color:#374151;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;">Cancel</button>
                            <button type="submit" style="height:38px;padding:0 20px;border:none;background:#111827;color:#FFF;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Create KPI</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const div = document.createElement("div");
        div.id = "kpi-modal-container";
        div.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;";
        div.innerHTML = modalHtml;
        document.body.appendChild(div);

        const close = () => { div.remove(); };
        div.querySelector("#kpi-modal-close").onclick = close;
        div.querySelector("#kpi-cancel-btn").onclick = close;
        div.querySelector("#kpi-modal-backdrop").onclick = e => { if (e.target.id === "kpi-modal-backdrop") close(); };

        div.querySelector("#kpi-create-form").onsubmit = e => {
            e.preventDefault();
            const cat = div.querySelector("#kpi-category").value;
            const name = div.querySelector("#kpi-name").value.trim();
            const freq = div.querySelector("#kpi-frequency").value;
            const unit = div.querySelector("#kpi-unit").value;
            const op = div.querySelector("#kpi-operator").value;
            const target = parseFloat(div.querySelector("#kpi-target").value) || 95;
            const desc = div.querySelector("#kpi-description").value.trim();

            const lowMin = parseFloat(div.querySelector("#kpi-low-min").value) || 0;
            const lowMax = parseFloat(div.querySelector("#kpi-low-max").value) || 70;
            const midMin = parseFloat(div.querySelector("#kpi-mid-min").value) || 71;
            const midMax = parseFloat(div.querySelector("#kpi-mid-max").value) || 89;
            const highMin = parseFloat(div.querySelector("#kpi-high-min").value) || 90;
            const highMax = parseFloat(div.querySelector("#kpi-high-max").value) || 100;

            window.Store.addKPI({
                contract_id: contract.id,
                kpi_name: name,
                category: cat,
                frequency: freq,
                unit: unit,
                operator: op,
                target_agreed: target,
                description: desc,
                ranges: {
                    low: [lowMin, lowMax],
                    middle: [midMin, midMax],
                    high: [highMin, highMax]
                },
                monthly_values: [null, null, null, null, null, null, null, null, null, null, null, null]
            });

            window.UI.toast({ kind: "success", title: "KPI Created", body: `Assigned KPI: ${name} (${cat})` });
            close();
            if (cb) cb();
        };
    }

    /* -------------------------------------------------------------
       Modal: KPI Detail & Performance Matrix Manager
       ------------------------------------------------------------- */
    function openKPIDetailModal(kpi, contract, cb) {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const values = (kpi.monthly_values || [null, null, null, null, null, null, null, null, null, null, null, null]).slice();

        const modalHtml = `
            <div class="dmp-modal-backdrop" id="kpi-manager-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="dmp-modal-box" style="background:#FFF;border-radius:12px;width:760px;max-width:95vw;box-shadow:0 16px 40px rgba(0,0,0,0.22);padding:24px 30px;position:relative;max-height:92vh;overflow-y:auto;box-sizing:border-box;">
                    <!-- Header -->
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;border-bottom:1px solid #F3F4F6;padding-bottom:14px;">
                        <div>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0;">${window.UI.esc(kpi.kpi_name)}</h2>
                                <span style="font-size:12px;font-weight:600;padding:2px 8px;border-radius:4px;background:#F3F4F6;color:#374151;">${window.UI.esc(kpi.category || "KPI")}</span>
                                <span id="kpi-modal-status-badge" style="font-size:12px;font-weight:600;padding:2px 8px;border-radius:4px;background:${kpi.status === 'Achieved' ? '#DCFCE7' : '#FEE2E2'};color:${kpi.status === 'Achieved' ? '#166534' : '#DC2626'};">${kpi.status || 'Active'}</span>
                            </div>
                            <div style="font-size:13px;color:#6B7280;margin-top:4px;">
                                Target: <strong>${kpi.operator || '<='}${kpi.target_agreed || 5} ${window.UI.esc(kpi.unit || '')}</strong> &nbsp;|&nbsp; Frequency: <strong>${kpi.frequency || 'Monthly'}</strong> &nbsp;|&nbsp; Year: <strong>2026</strong>
                            </div>
                        </div>
                        <button type="button" id="kpi-manager-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;line-height:1;">✕</button>
                    </div>

                    <!-- Meta Strip -->
                    <div style="display:grid;grid-template-columns:repeat(3, 1fr);gap:12px;margin-bottom:20px;background:#F9FAFB;padding:12px 16px;border-radius:8px;border:1px solid #E5E7EB;">
                        <div>
                            <div style="font-size:11.5px;color:#6B7280;text-transform:uppercase;font-weight:600;">Current YTD Average</div>
                            <div id="kpi-modal-ytd" style="font-size:20px;font-weight:700;color:#111827;margin-top:2px;">${kpi.ytd_average !== null && kpi.ytd_average !== undefined ? `${kpi.ytd_average}${kpi.unit || ''}` : '-'}</div>
                        </div>
                        <div>
                            <div style="font-size:11.5px;color:#6B7280;text-transform:uppercase;font-weight:600;">Overall Target</div>
                            <div style="font-size:20px;font-weight:700;color:#111827;margin-top:2px;">${kpi.operator || '<='}${kpi.target_agreed || 5} ${kpi.unit || ''}</div>
                        </div>
                        <div>
                            <div style="font-size:11.5px;color:#6B7280;text-transform:uppercase;font-weight:600;">Score Thresholds</div>
                            <div style="font-size:12px;color:#374151;margin-top:4px;display:flex;gap:6px;">
                                <span style="color:#DC2626;font-weight:600;">Low &lt;${kpi.ranges ? kpi.ranges.low[1] : 70}</span>
                                <span style="color:#D97706;font-weight:600;">Mid ${kpi.ranges ? kpi.ranges.middle[0] + '-' + kpi.ranges.middle[1] : '71-89'}</span>
                                <span style="color:#166534;font-weight:600;">High &gt;${kpi.ranges ? kpi.ranges.high[0] : 90}</span>
                            </div>
                        </div>
                    </div>

                    ${kpi.description ? `<p style="font-size:13px;color:#4B5563;margin:0 0 16px 0;line-height:1.5;">${window.UI.esc(kpi.description)}</p>` : ''}

                    <h4 style="font-size:14px;font-weight:600;color:#111827;margin:0 0 10px 0;">12-Month Performance Matrix Editor</h4>
                    <p style="font-size:12px;color:#6B7280;margin:0 0 12px 0;">Enter or update actual performance figures. YTD average and compliance status update dynamically.</p>

                    <!-- Monthly Grid Form -->
                    <div style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                        <table style="width:100%;border-collapse:collapse;font-size:13px;">
                            <thead>
                                <tr style="background:#F9FAFB;border-bottom:1px solid #E5E7EB;text-align:left;">
                                    <th style="padding:10px 14px;font-weight:600;color:#374151;width:120px;">Month</th>
                                    <th style="padding:10px 14px;font-weight:600;color:#374151;width:140px;">Target</th>
                                    <th style="padding:10px 14px;font-weight:600;color:#374151;">Actual Value</th>
                                    <th style="padding:10px 14px;font-weight:600;color:#374151;width:130px;text-align:center;">Evaluation</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${months.map((m, idx) => {
                                    const v = values[idx];
                                    return `
                                        <tr style="border-bottom:1px solid #F3F4F6;">
                                            <td style="padding:8px 14px;font-weight:600;color:#111827;">${m} 2026</td>
                                            <td style="padding:8px 14px;color:#6B7280;">${kpi.operator || '<='}${kpi.target_agreed || 5} ${kpi.unit || ''}</td>
                                            <td style="padding:8px 14px;">
                                                <input type="number" step="any" class="kpi-month-input" data-month="${idx}" value="${v !== null && v !== undefined ? v : ''}" placeholder="Enter value" style="width:140px;height:32px;padding:0 10px;border:1px solid #D9D9D9;border-radius:4px;font-size:13px;color:#111827;box-sizing:border-box;">
                                            </td>
                                            <td style="padding:8px 14px;text-align:center;" id="kpi-eval-month-${idx}">
                                                ${v !== null && v !== undefined ? `<span style="display:inline-block;padding:2px 8px;border-radius:4px;font-size:11.5px;font-weight:600;background:#DCFCE7;color:#166534;">Achieved</span>` : `<span style="color:#9CA3AF;">-</span>`}
                                            </td>
                                        </tr>
                                    `;
                                }).join("")}
                            </tbody>
                        </table>
                    </div>

                    <!-- Footer Actions -->
                    <div style="display:flex;justify-content:space-between;align-items:center;">
                        <button type="button" id="kpi-delete-btn" style="height:38px;padding:0 16px;border:1px solid #FCA5A5;background:#FEF2F2;color:#DC2626;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Delete KPI</button>
                        <div style="display:flex;gap:12px;">
                            <button type="button" id="kpi-manager-cancel" style="height:38px;padding:0 20px;border:1px solid #D9D9D9;background:#FFF;color:#374151;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;">Cancel</button>
                            <button type="button" id="kpi-save-values-btn" style="height:38px;padding:0 22px;border:none;background:#111827;color:#FFF;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Save Performance Data</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement("div");
        div.id = "kpi-manager-container";
        div.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;";
        div.innerHTML = modalHtml;
        document.body.appendChild(div);

        const close = () => { div.remove(); };
        div.querySelector("#kpi-manager-close").onclick = close;
        div.querySelector("#kpi-manager-cancel").onclick = close;
        div.querySelector("#kpi-manager-backdrop").onclick = e => { if (e.target.id === "kpi-manager-backdrop") close(); };

        // Delete KPI handler
        div.querySelector("#kpi-delete-btn").onclick = () => {
            if (confirm(`Are you sure you want to permanently delete KPI "${kpi.kpi_name}"?`)) {
                window.Store.deleteKPI(kpi.id);
                window.UI.toast({ kind: "success", title: "KPI Deleted", body: "KPI was removed from contract." });
                close();
                if (cb) cb();
            }
        };

        // Live calculation as values are edited
        const recalculate = () => {
            const inputs = div.querySelectorAll(".kpi-month-input");
            const curVals = [];
            inputs.forEach(inp => {
                const val = inp.value.trim();
                curVals.push(val === "" ? null : parseFloat(val));
            });

            const valid = curVals.filter(v => v !== null && !isNaN(v));
            if (valid.length > 0) {
                const sum = valid.reduce((a, b) => a + Number(b), 0);
                const avg = Math.round((sum / valid.length) * 10) / 10;
                div.querySelector("#kpi-modal-ytd").textContent = `${avg}${kpi.unit || ''}`;

                const tgt = parseFloat(kpi.target_agreed) || 95;
                const op = kpi.operator || "<=";
                let achieved = false;
                if (op === "<=" || op === "<") achieved = avg <= tgt;
                else achieved = avg >= tgt;

                const badge = div.querySelector("#kpi-modal-status-badge");
                badge.textContent = achieved ? "Achieved" : "At Risk";
                badge.style.background = achieved ? "#DCFCE7" : "#FEE2E2";
                badge.style.color = achieved ? "#166534" : "#DC2626";
            } else {
                div.querySelector("#kpi-modal-ytd").textContent = "-";
            }
        };

        div.querySelectorAll(".kpi-month-input").forEach(inp => {
            inp.addEventListener("input", recalculate);
        });

        // Save values handler
        div.querySelector("#kpi-save-values-btn").onclick = () => {
            const inputs = div.querySelectorAll(".kpi-month-input");
            const newVals = [];
            inputs.forEach(inp => {
                const val = inp.value.trim();
                newVals.push(val === "" ? null : parseFloat(val));
            });

            window.Store.updateKPI(kpi.id, { monthly_values: newVals });
            window.UI.toast({ kind: "success", title: "KPI Updated", body: `Performance scores saved for ${kpi.kpi_name}.` });
            close();
            if (cb) cb();
        };
    }

    /* -------------------------------------------------------------
       Modal: Create Performance Report Modal
       ------------------------------------------------------------- */
    function openCreatePerformanceReportModal(contract, cb) {
        const modalHtml = `
            <div class="dmp-modal-backdrop" id="perf-create-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="dmp-modal-box" style="background:#FFF;border-radius:10px;width:620px;max-width:94vw;box-shadow:0 12px 36px rgba(0,0,0,0.18);padding:24px 30px;position:relative;max-height:92vh;overflow-y:auto;box-sizing:border-box;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="font-size:18px;font-weight:600;color:#111827;margin:0;">Create Performance Report</h2>
                        <button type="button" id="perf-create-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;line-height:1;padding:0 4px;">✕</button>
                    </div>
                    <form id="perf-create-form">
                        <div style="margin-bottom:18px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;"><span style="color:#EF4444;margin-right:2px;">*</span>Report Type</label>
                            <div style="display:flex;gap:20px;">
                                <label style="display:flex;align-items:center;gap:6px;font-size:13.5px;cursor:pointer;">
                                    <input type="radio" name="new_rep_type" value="NCR" checked>
                                    <span style="font-weight:600;color:#DC2626;">NCR</span> (Non-Conformance Report)
                                </label>
                                <label style="display:flex;align-items:center;gap:6px;font-size:13.5px;cursor:pointer;">
                                    <input type="radio" name="new_rep_type" value="PIP">
                                    <span style="font-weight:600;color:#D97706;">PIP</span> (Performance Improvement Plan)
                                </label>
                            </div>
                        </div>

                        <div style="margin-bottom:18px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;"><span style="color:#EF4444;margin-right:2px;">*</span>Title / Subject</label>
                            <input type="text" id="perf-title" required placeholder="Brief description of the issue or improvement requirement..." style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;">
                        </div>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">
                            <div>
                                <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Priority</label>
                                <select id="perf-priority" style="width:100%;height:38px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;background:#FFF;">
                                    <option value="Critical">Critical</option>
                                    <option value="High">High</option>
                                    <option value="Medium" selected>Medium</option>
                                    <option value="Low">Low</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Resolution Deadline</label>
                                <div class="ant-picker ant-picker-outlined datepicker-t5AVY9" data-datepicker="1" style="width:100%;height:38px;">
                                    <div class="ant-picker-input">
                                        <input type="text" id="perf-deadline" value="${new Date(Date.now() + 14 * 86400000).toISOString().slice(0, 10)}" placeholder="YYYY-MM-DD" autocomplete="off" style="width:100%;height:100%;">
                                        <span class="ant-picker-suffix">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom:18px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Root Cause Description</label>
                            <textarea id="perf-root-cause" placeholder="Identify the preliminary or identified root cause..." style="width:100%;height:68px;padding:8px 12px;border:1px solid #D9D9D9;border-radius:6px;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;color:#111827;"></textarea>
                        </div>

                        <div style="margin-bottom:24px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Required Corrective Action Plan</label>
                            <textarea id="perf-corrective-action" placeholder="Detail the corrective actions required from the supplier..." style="width:100%;height:68px;padding:8px 12px;border:1px solid #D9D9D9;border-radius:6px;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;color:#111827;"></textarea>
                        </div>

                        <div style="display:flex;justify-content:flex-end;gap:12px;">
                            <button type="button" id="perf-create-cancel" style="height:38px;padding:0 20px;border:1px solid #D9D9D9;background:#FFF;color:#374151;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;">Cancel</button>
                            <button type="submit" style="height:38px;padding:0 20px;border:none;background:#111827;color:#FFF;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Submit Report</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const div = document.createElement("div");
        div.id = "perf-create-container";
        div.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;";
        div.innerHTML = modalHtml;
        document.body.appendChild(div);
        window.UI.initAllDatePickers(div);

        const close = () => { div.remove(); };
        div.querySelector("#perf-create-close").onclick = close;
        div.querySelector("#perf-create-cancel").onclick = close;
        div.querySelector("#perf-create-backdrop").onclick = e => { if (e.target.id === "perf-create-backdrop") close(); };

        div.querySelector("#perf-create-form").onsubmit = e => {
            e.preventDefault();
            const type = div.querySelector("input[name='new_rep_type']:checked").value;
            const title = div.querySelector("#perf-title").value.trim();
            const priority = div.querySelector("#perf-priority").value;
            const deadline = div.querySelector("#perf-deadline").value;
            const rootCause = div.querySelector("#perf-root-cause").value.trim();
            const corrAction = div.querySelector("#perf-corrective-action").value.trim();

            window.Store.addPerformanceReport({
                contract_id: contract.id,
                type: type,
                title: title,
                priority: priority,
                deadline: deadline,
                root_cause: rootCause,
                corrective_action: corrAction
            });

            window.UI.toast({ kind: "success", title: "Report Created", body: `${type} report submitted successfully.` });
            close();
            if (cb) cb();
        };
    }

    /* -------------------------------------------------------------
       Modal: Performance Report Detail & Action Workflow
       (Edit, Resolve, Withdraw PIP / Withdraw NCR, Action Checklist)
       ------------------------------------------------------------- */
    function openPerformanceReportDetailModal(report, contract, cb) {
        // Ensure default action list if empty
        if (!report.actions_list || report.actions_list.length === 0) {
            report.actions_list = [
                { id: "1", description: "Root cause review meeting with quality engineer", assignee: "Supplier QA", due_date: "2026-04-10", status: "Completed" },
                { id: "2", description: "Deliver calibrated replacement batch with EN 10204 3.1 certs", assignee: "Supply Manager", due_date: "2026-04-18", status: "Pending" }
            ];
            const total = report.actions_list.length;
            const done = report.actions_list.filter(a => a.status === "Completed").length;
            report.actions = `${done}/${total}`;
            report.progress = Math.round((done / total) * 100);
            report.progress_pct = report.progress;
        }

        const isPip = report.type === "PIP";
        const isOpen = report.status === "Open";
        const isResolved = report.status === "Resolved";
        const isWithdrawn = report.status === "Withdrawn";

        const statusBg = isResolved ? "#DCFCE7" : (isOpen ? "#EFF6FF" : (isWithdrawn ? "#F3F4F6" : "#FEF3C7"));
        const statusColor = isResolved ? "#166534" : (isOpen ? "#2563EB" : (isWithdrawn ? "#6B7280" : "#D97706"));

        const modalHtml = `
            <div class="dmp-modal-backdrop" id="perf-detail-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="dmp-modal-box" style="background:#FFF;border-radius:12px;width:780px;max-width:95vw;box-shadow:0 16px 40px rgba(0,0,0,0.22);padding:24px 32px;position:relative;max-height:92vh;overflow-y:auto;box-sizing:border-box;">
                    <!-- Header -->
                    <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:16px;border-bottom:1px solid #F3F4F6;padding-bottom:14px;">
                        <div>
                            <div style="display:flex;align-items:center;gap:10px;">
                                <span class="${isPip ? 'badge-pip' : 'badge-ncr'}" style="display:inline-block;padding:3px 10px;border-radius:4px;font-weight:700;font-size:12px;${isPip ? 'border:1px solid #F59E0B;color:#D97706;background:#FFFBEB;' : 'border:1px solid #EF4444;color:#DC2626;background:#FEF2F2;'}">${report.type}</span>
                                <h2 style="font-size:18px;font-weight:700;color:#111827;margin:0;">Report #${report.id.replace(/^[A-Za-z]+-/, "")} — ${window.UI.esc(report.title)}</h2>
                            </div>
                            <div style="display:flex;gap:10px;align-items:center;margin-top:6px;">
                                <span style="font-size:12px;font-weight:600;padding:2px 10px;border-radius:4px;background:${statusBg};color:${statusColor};">${report.status}</span>
                                <span style="font-size:12px;font-weight:600;padding:2px 10px;border-radius:4px;background:#FEE2E2;color:#DC2626;">Priority: ${report.priority}</span>
                                <span style="font-size:12.5px;color:#6B7280;">Contract: ${contract.contract_number || contract.id}</span>
                            </div>
                        </div>
                        <button type="button" id="perf-detail-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;line-height:1;">✕</button>
                    </div>

                    <!-- Meta Grid -->
                    <div style="display:grid;grid-template-columns:repeat(4, 1fr);gap:12px;margin-bottom:20px;background:#F9FAFB;padding:12px 16px;border-radius:8px;border:1px solid #E5E7EB;font-size:13px;">
                        <div>
                            <span style="color:#6B7280;font-size:11.5px;text-transform:uppercase;font-weight:600;display:block;">Issue Date</span>
                            <strong style="color:#111827;">${report.issue_date || '-'}</strong>
                        </div>
                        <div>
                            <span style="color:#6B7280;font-size:11.5px;text-transform:uppercase;font-weight:600;display:block;">Deadline</span>
                            <strong style="color:#DC2626;">${report.deadline || '-'}</strong>
                        </div>
                        <div>
                            <span style="color:#6B7280;font-size:11.5px;text-transform:uppercase;font-weight:600;display:block;">Closed Date</span>
                            <strong style="color:#111827;">${report.closed_date || '-'}</strong>
                        </div>
                        <div>
                            <span style="color:#6B7280;font-size:11.5px;text-transform:uppercase;font-weight:600;display:block;">Progress</span>
                            <strong style="color:#166534;">${report.progress_pct !== undefined ? report.progress_pct : (report.progress || 0)}% (${report.actions || '0/0'})</strong>
                        </div>
                    </div>

                    <!-- Progress Bar -->
                    <div style="height:6px;width:100%;background:#E5E7EB;border-radius:3px;overflow:hidden;margin-bottom:20px;">
                        <div style="height:100%;width:${report.progress_pct !== undefined ? report.progress_pct : (report.progress || 0)}%;background:#1E3A0F;transition:width 0.3s;"></div>
                    </div>

                    <!-- Root Cause & Corrective Action -->
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:22px;">
                        <div style="padding:14px;border:1px solid #E5E7EB;border-radius:8px;background:#FFF;">
                            <h4 style="font-size:13px;font-weight:700;color:#111827;margin:0 0 6px 0;">Root Cause Analysis</h4>
                            <p style="font-size:13px;color:#4B5563;margin:0;line-height:1.5;">${window.UI.esc(report.root_cause || "Detailed failure analysis completed by engineering inspector.")}</p>
                        </div>
                        <div style="padding:14px;border:1px solid #E5E7EB;border-radius:8px;background:#FFF;">
                            <h4 style="font-size:13px;font-weight:700;color:#111827;margin:0 0 6px 0;">Corrective Action Plan</h4>
                            <p style="font-size:13px;color:#4B5563;margin:0;line-height:1.5;">${window.UI.esc(report.corrective_action || "Supplier requested to implement containment and provide replacement stock.")}</p>
                        </div>
                    </div>

                    <!-- Action Items Checklist -->
                    <div style="margin-bottom:24px;">
                        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                            <h4 style="font-size:14px;font-weight:700;color:#111827;margin:0;">Corrective Action Items (${report.actions_list.filter(a => a.status === 'Completed').length}/${report.actions_list.length})</h4>
                            <button type="button" id="perf-add-action-btn" style="background:#F3F4F6;border:1px solid #D1D5DB;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600;cursor:pointer;color:#374151;">+ Add Action Item</button>
                        </div>

                        <!-- Inline Add Action Item Form -->
                        <div id="perf-add-action-form" style="display:none;background:#F9FAFB;border:1px solid #E5E7EB;border-radius:6px;padding:12px;margin-bottom:12px;">
                            <div style="display:grid;grid-template-columns:2fr 1fr 1fr auto;gap:10px;align-items:center;">
                                <input type="text" id="new-act-desc" placeholder="Action description..." style="height:32px;padding:0 8px;border:1px solid #D9D9D9;border-radius:4px;font-size:12.5px;">
                                <input type="text" id="new-act-assignee" placeholder="Assignee" value="Supplier QA" style="height:32px;padding:0 8px;border:1px solid #D9D9D9;border-radius:4px;font-size:12.5px;">
                                <div class="ant-picker ant-picker-outlined datepicker-t5AVY9" data-datepicker="1" style="height:32px;display:flex;align-items:center;">
                                    <div class="ant-picker-input">
                                        <input type="text" id="new-act-date" value="${new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)}" placeholder="YYYY-MM-DD" autocomplete="off" style="font-size:12px;">
                                        <span class="ant-picker-suffix">
                                            <svg width="14" height="14" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                                <div style="display:flex;gap:6px;">
                                    <button type="button" id="save-new-act-btn" style="height:32px;padding:0 12px;background:#111827;color:#FFF;border:none;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer;">Save</button>
                                    <button type="button" id="cancel-new-act-btn" style="height:32px;padding:0 8px;background:#FFF;border:1px solid #D9D9D9;border-radius:4px;font-size:12px;cursor:pointer;">✕</button>
                                </div>
                            </div>
                        </div>

                        <div style="border:1px solid #E5E7EB;border-radius:8px;overflow:hidden;">
                            ${report.actions_list.map((act, aIdx) => {
                                const isDone = act.status === 'Completed';
                                return `
                                    <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-bottom:${aIdx === report.actions_list.length - 1 ? 'none' : '1px solid #F3F4F6'};background:${isDone ? '#F9FAFB' : '#FFF'};">
                                        <div style="display:flex;align-items:center;gap:12px;">
                                            <input type="checkbox" class="perf-action-chk" data-actid="${act.id}" ${isDone ? 'checked' : ''} style="width:16px;height:16px;cursor:pointer;">
                                            <span style="font-size:13px;color:${isDone ? '#6B7280' : '#111827'};text-decoration:${isDone ? 'line-through' : 'none'};font-weight:500;">${window.UI.esc(act.description)}</span>
                                        </div>
                                        <div style="display:flex;align-items:center;gap:16px;font-size:12px;">
                                            <span style="color:#6B7280;">${window.UI.esc(act.assignee || 'Assigned')}</span>
                                            <span style="color:#374151;font-weight:500;">Due: ${act.due_date || '-'}</span>
                                            <span style="display:inline-block;padding:2px 8px;border-radius:4px;font-weight:600;background:${isDone ? '#DCFCE7' : '#FEF3C7'};color:${isDone ? '#166534' : '#D97706'};">${act.status}</span>
                                        </div>
                                    </div>
                                `;
                            }).join("")}
                        </div>
                    </div>

                    <!-- Action Buttons Bar (Edit, Resolve, Withdraw PIP / NCR, Reopen) -->
                    <div style="display:flex;justify-content:space-between;align-items:center;border-top:1px solid #F3F4F6;padding-top:16px;">
                        <button type="button" id="perf-edit-btn" style="height:38px;padding:0 18px;border:1px solid #D9D9D9;background:#FFF;color:#374151;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">
                            Edit Report
                        </button>
                        <div style="display:flex;gap:10px;">
                            ${isOpen ? `
                                <button type="button" id="perf-withdraw-btn" style="height:38px;padding:0 18px;border:1px solid #FCA5A5;background:#FEF2F2;color:#DC2626;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">
                                    ${isPip ? "Withdraw PIP" : "Withdraw NCR"}
                                </button>
                                <button type="button" id="perf-resolve-btn" style="height:38px;padding:0 22px;border:none;background:#166534;color:#FFF;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">
                                    Resolve Report
                                </button>
                            ` : `
                                <button type="button" id="perf-reopen-btn" style="height:38px;padding:0 18px;border:1px solid #93C5FD;background:#EFF6FF;color:#2563EB;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">
                                    Reopen Report
                                </button>
                            `}
                            <button type="button" id="perf-detail-done" style="height:38px;padding:0 20px;border:none;background:#111827;color:#FFF;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const div = document.createElement("div");
        div.id = "perf-detail-container";
        div.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;";
        div.innerHTML = modalHtml;
        document.body.appendChild(div);
        window.UI.initAllDatePickers(div);

        const close = () => { div.remove(); };
        div.querySelector("#perf-detail-close").onclick = close;
        div.querySelector("#perf-detail-done").onclick = close;
        div.querySelector("#perf-detail-backdrop").onclick = e => { if (e.target.id === "perf-detail-backdrop") close(); };

        // Toggle Action Checkboxes
        div.querySelectorAll(".perf-action-chk").forEach(chk => {
            chk.addEventListener("change", (e) => {
                const actId = chk.getAttribute("data-actid");
                const isChecked = chk.checked;
                window.Store.updatePerformanceAction(report.id, actId, {
                    status: isChecked ? "Completed" : "Pending"
                });
                const updated = window.Store.performanceReportById(report.id) || report;
                close();
                openPerformanceReportDetailModal(updated, contract, cb);
                if (cb) cb();
            });
        });

        // Toggle Inline Add Action Form
        const addBtn = div.querySelector("#perf-add-action-btn");
        const addForm = div.querySelector("#perf-add-action-form");
        if (addBtn && addForm) {
            addBtn.onclick = () => { addForm.style.display = "block"; };
            div.querySelector("#cancel-new-act-btn").onclick = () => { addForm.style.display = "none"; };
            div.querySelector("#save-new-act-btn").onclick = () => {
                const desc = div.querySelector("#new-act-desc").value.trim();
                const assignee = div.querySelector("#new-act-assignee").value.trim();
                const due = div.querySelector("#new-act-date").value;
                if (!desc) {
                    window.UI.toast({ kind: "error", title: "Validation Error", body: "Please enter an action description." });
                    return;
                }
                window.Store.addPerformanceAction(report.id, {
                    description: desc,
                    assignee: assignee || "Supplier Representative",
                    due_date: due,
                    status: "Pending"
                });
                window.UI.toast({ kind: "success", title: "Action Added", body: `Action item created: ${desc}` });
                const updated = window.Store.performanceReportById(report.id) || report;
                close();
                openPerformanceReportDetailModal(updated, contract, cb);
                if (cb) cb();
            };
        }

        // Edit Report Button
        div.querySelector("#perf-edit-btn").onclick = () => {
            close();
            openEditPerformanceReportModal(report, contract, cb);
        };

        // Resolve Button
        const resolveBtn = div.querySelector("#perf-resolve-btn");
        if (resolveBtn) {
            resolveBtn.onclick = () => {
                const today = new Date().toISOString().slice(0, 10);
                window.Store.updatePerformanceReport(report.id, {
                    status: "Resolved",
                    closed_date: today,
                    progress: 100,
                    progress_pct: 100
                });
                // Mark all actions as Completed
                if (report.actions_list) {
                    report.actions_list.forEach(a => {
                        window.Store.updatePerformanceAction(report.id, a.id, { status: "Completed" });
                    });
                }
                window.UI.toast({ kind: "success", title: "Report Resolved", body: `${report.type} #${report.id.replace(/^[A-Za-z]+-/, "")} marked as Resolved.` });
                close();
                const updated = window.Store.performanceReportById(report.id) || Object.assign({}, report, { status: "Resolved", closed_date: today, progress_pct: 100 });
                openPerformanceReportDetailModal(updated, contract, cb);
                if (cb) cb();
            };
        }

        // Withdraw Button (PIP / NCR)
        const withdrawBtn = div.querySelector("#perf-withdraw-btn");
        if (withdrawBtn) {
            withdrawBtn.onclick = () => {
                const reportName = `${report.type} #${report.id.replace(/^[A-Za-z]+-/, "")}`;
                if (confirm(`Are you sure you want to withdraw ${reportName}?`)) {
                    window.Store.updatePerformanceReport(report.id, { status: "Withdrawn" });
                    window.UI.toast({ kind: "info", title: "Report Withdrawn", body: `${reportName} has been withdrawn.` });
                    close();
                    const updated = window.Store.performanceReportById(report.id) || Object.assign({}, report, { status: "Withdrawn" });
                    openPerformanceReportDetailModal(updated, contract, cb);
                    if (cb) cb();
                }
            };
        }

        // Reopen Button
        const reopenBtn = div.querySelector("#perf-reopen-btn");
        if (reopenBtn) {
            reopenBtn.onclick = () => {
                window.Store.updatePerformanceReport(report.id, { status: "Open", closed_date: "-" });
                window.UI.toast({ kind: "info", title: "Report Reopened", body: `Report #${report.id.replace(/^[A-Za-z]+-/, "")} is now Open.` });
                close();
                const updated = window.Store.performanceReportById(report.id) || Object.assign({}, report, { status: "Open", closed_date: "-" });
                openPerformanceReportDetailModal(updated, contract, cb);
                if (cb) cb();
            };
        }
    }

    /* -------------------------------------------------------------
       Modal: Edit Performance Report
       ------------------------------------------------------------- */
    function openEditPerformanceReportModal(report, contract, cb) {
        const modalHtml = `
            <div class="dmp-modal-backdrop" id="perf-edit-backdrop" style="position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.45);z-index:9999;display:flex;align-items:center;justify-content:center;">
                <div class="dmp-modal-box" style="background:#FFF;border-radius:10px;width:600px;max-width:94vw;box-shadow:0 12px 36px rgba(0,0,0,0.18);padding:24px 30px;position:relative;max-height:92vh;overflow-y:auto;box-sizing:border-box;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
                        <h2 style="font-size:18px;font-weight:600;color:#111827;margin:0;">Edit Report #${report.id.replace(/^[A-Za-z]+-/, "")}</h2>
                        <button type="button" id="perf-edit-close" style="background:none;border:none;font-size:22px;cursor:pointer;color:#6B7280;line-height:1;padding:0 4px;">✕</button>
                    </div>
                    <form id="perf-edit-form">
                        <div style="margin-bottom:18px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Title / Subject</label>
                            <input type="text" id="edit-perf-title" required value="${window.UI.esc(report.title)}" style="width:100%;height:38px;padding:0 12px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;box-sizing:border-box;">
                        </div>

                        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:18px;">
                            <div>
                                <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Priority</label>
                                <select id="edit-perf-priority" style="width:100%;height:38px;padding:0 10px;border:1px solid #D9D9D9;border-radius:6px;font-size:13px;background:#FFF;">
                                    <option value="Critical" ${report.priority === 'Critical' ? 'selected' : ''}>Critical</option>
                                    <option value="High" ${report.priority === 'High' ? 'selected' : ''}>High</option>
                                    <option value="Medium" ${report.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                                    <option value="Low" ${report.priority === 'Low' ? 'selected' : ''}>Low</option>
                                </select>
                            </div>
                            <div>
                                <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Resolution Deadline</label>
                                <div class="ant-picker ant-picker-outlined datepicker-t5AVY9" data-datepicker="1" style="width:100%;height:38px;">
                                    <div class="ant-picker-input">
                                        <input type="text" id="edit-perf-deadline" value="${report.deadline || ''}" placeholder="YYYY-MM-DD" autocomplete="off" style="width:100%;height:100%;">
                                        <span class="ant-picker-suffix">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                                            </svg>
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style="margin-bottom:18px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Root Cause Analysis</label>
                            <textarea id="edit-perf-root-cause" style="width:100%;height:68px;padding:8px 12px;border:1px solid #D9D9D9;border-radius:6px;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;color:#111827;">${window.UI.esc(report.root_cause || "")}</textarea>
                        </div>

                        <div style="margin-bottom:24px;">
                            <label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px;">Corrective Action Plan</label>
                            <textarea id="edit-perf-corrective-action" style="width:100%;height:68px;padding:8px 12px;border:1px solid #D9D9D9;border-radius:6px;font-family:inherit;font-size:13px;resize:vertical;box-sizing:border-box;color:#111827;">${window.UI.esc(report.corrective_action || "")}</textarea>
                        </div>

                        <div style="display:flex;justify-content:flex-end;gap:12px;">
                            <button type="button" id="perf-edit-cancel" style="height:38px;padding:0 20px;border:1px solid #D9D9D9;background:#FFF;color:#374151;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;">Cancel</button>
                            <button type="submit" style="height:38px;padding:0 20px;border:none;background:#111827;color:#FFF;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        const div = document.createElement("div");
        div.id = "perf-edit-container";
        div.style.cssText = "position:fixed;top:0;left:0;right:0;bottom:0;z-index:9999;";
        div.innerHTML = modalHtml;
        document.body.appendChild(div);
        window.UI.initAllDatePickers(div);

        const close = () => { div.remove(); };
        div.querySelector("#perf-edit-close").onclick = close;
        div.querySelector("#perf-edit-cancel").onclick = close;
        div.querySelector("#perf-edit-backdrop").onclick = e => { if (e.target.id === "perf-edit-backdrop") close(); };

        div.querySelector("#perf-edit-form").onsubmit = e => {
            e.preventDefault();
            const title = div.querySelector("#edit-perf-title").value.trim();
            const priority = div.querySelector("#edit-perf-priority").value;
            const deadline = div.querySelector("#edit-perf-deadline").value;
            const rootCause = div.querySelector("#edit-perf-root-cause").value.trim();
            const corrAction = div.querySelector("#edit-perf-corrective-action").value.trim();

            window.Store.updatePerformanceReport(report.id, {
                title,
                priority,
                deadline,
                root_cause: rootCause,
                corrective_action: corrAction
            });

            window.UI.toast({ kind: "success", title: "Report Updated", body: `Report #${report.id.replace(/^[A-Za-z]+-/, "")} updated successfully.` });
            close();
            const updated = window.Store.performanceReportById(report.id) || Object.assign({}, report, { title, priority, deadline, root_cause: rootCause, corrective_action: corrAction });
            openPerformanceReportDetailModal(updated, contract, cb);
            if (cb) cb();
        };
    }

    return { render };
})();
