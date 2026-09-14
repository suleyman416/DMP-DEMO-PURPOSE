/* ============================================================
   views/pricebook-detail.js — 1:1 Pixel-Perfect MRO Pricebook Detail
   38-Column MRO Line Items Grid, Filter Sidebar, Top Stats,
   List/Grid View Toggle, and Exact DMP Reference DOM/CSS
   Matching 09_pricebook_items_detail.png
   ============================================================ */
window.PricebookDetailView = (function () {

    let activeViewMode = "list"; // "list" or "grid"
    let isHeroCollapsed = false;
    let isSidebarCollapsed = false;

    // Filters
    let filterSearch = "";
    let filterStatusApproved = false;
    let filterStatusDisabled = false;
    let filterUOM = "";
    let filterManufacturer = "";
    let filterPriceMin = "";
    let filterPriceMax = "";
    let filterLeadtime = "";
    let filterIncoterms = "";
    let filterIncotermsLocation = "";
    let filterUNSPSC = "";
    let filterValidDate = "";

    // Pagination
    let currentPage = 1;
    let rowsPerPage = 10;

    // Standard baseline catalog items matching screenshot 09_pricebook_items_detail.png
    const REFERENCE_ITEMS = [
        { dmp_id: "2873", supplier_part_no: "CW290057_138", mat_no: "11040970", status: "Approved", desc: "MOULDED CASE CIRCUIT BREAKER, 3P, 250A, 36kA", mfr: "ABB", price: 412.50, uom: "EA", lead: 14, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2874", supplier_part_no: "CW290057_139", mat_no: "11040968", status: "Approved", desc: "MOULDED CASE CIRCUIT BREAKER, 3P, 160A, 36kA", mfr: "ABB", price: 325.00, uom: "EA", lead: 14, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2875", supplier_part_no: "CW290057_14", mat_no: "36105055", status: "Approved", desc: "MOULDED CASE CIRCUIT BREAKER, 4P, 250A, 50kA", mfr: "Schneider Electric", price: 680.00, uom: "EA", lead: 21, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2876", supplier_part_no: "CW290057_140", mat_no: "315609", status: "Approved", desc: "MOULDED CASE CIRCUIT BREAKER, 3P, 100A, 36kA", mfr: "ABB", price: 215.00, uom: "EA", lead: 10, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2885", supplier_part_no: "CW290057_15", mat_no: "36034516", status: "Approved", desc: "MOULDED CASE CIRCUIT BREAKER, 3P, 400A, 50kA", mfr: "Schneider Electric", price: 950.00, uom: "EA", lead: 28, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2886", supplier_part_no: "CW290057_150", mat_no: "36105056", status: "Approved", desc: "MOULDED CASE CIRCUIT BREAKER, 3P, 630A, 50kA", mfr: "Schneider Electric", price: 1216.00, uom: "EA", lead: 30, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2887", supplier_part_no: "CW290057_151", mat_no: "36105057", status: "Approved", desc: "CIRCUIT BREAKER AUXILIARY CONTACT 1NO+1NC", mfr: "ABB", price: 34.50, uom: "PC", lead: 7, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2888", supplier_part_no: "CW290057_152", mat_no: "36105058", status: "Approved", desc: "SHUNT TRIP RELEASE 220-240V AC/DC FOR XT1-XT4", mfr: "ABB", price: 88.00, uom: "PC", lead: 14, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2889", supplier_part_no: "CW290057_153", mat_no: "36105059", status: "Approved", desc: "UNDERVOLTAGE RELEASE 24V DC FOR XT1-XT4", mfr: "ABB", price: 92.50, uom: "PC", lead: 14, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2890", supplier_part_no: "CW290057_154", mat_no: "36105060", status: "Approved", desc: "MOTOR OPERATOR MOE 220-250V AC/DC FOR XT2-XT4", mfr: "ABB", price: 540.00, uom: "EA", lead: 21, incoterms: "DDP", location: "Baku Central Warehouse", unspsc: "39121601" },
        { dmp_id: "2891", supplier_part_no: "CW290057_155", mat_no: "36105061", status: "Disabled", desc: "LEGACY DISCONTINUED TRIP UNIT TM-D 125A", mfr: "Schneider Electric", price: 1.50, uom: "EA", lead: 30, incoterms: "EXW", location: "Baku Central Warehouse", unspsc: "39121601" }
    ];

    function getEnrichedItems(pricebookId, rawItems) {
        // If the pricebook is the primary one (#28 / PB-2026-001-A), ensure all 181 items exist
        if (pricebookId === "PB-2026-001-A" || pricebookId === "28" || pricebookId === "PB-001-ROTATING") {
            if (rawItems.length < 181) {
                const combined = [];
                // First 11 reference items
                REFERENCE_ITEMS.forEach((ref, idx) => {
                    const existing = rawItems[idx];
                    combined.push({
                        id: existing ? existing.id : `itm_ref_${idx+1}`,
                        pricebook_id: pricebookId,
                        dmp_id: ref.dmp_id,
                        photo: existing ? existing.photo : "",
                        status: ref.status,
                        supplier_part_no: ref.supplier_part_no,
                        material_service_no: ref.mat_no,
                        part_no_extension: "",
                        product_type: "MATERIAL",
                        uom: ref.uom,
                        customer_short_description: ref.desc,
                        customer_long_description: `${ref.desc}, INDUSTRIAL GRADE COMPLIANT WITH IEC 60947-2`,
                        supplier_description: `${ref.mfr} OEM ${ref.desc}`,
                        manufacturer_name: ref.mfr,
                        manufacturer_part_no: ref.supplier_part_no,
                        unit_price: ref.price,
                        currency: "USD",
                        lead_time_days: ref.lead,
                        incoterms_key: ref.incoterms,
                        incoterms_location: ref.location,
                        unspsc: ref.unspsc,
                        unspsc_title: "Circuit breakers",
                        valid_from: "2026-01-01",
                        valid_to: "2028-12-31",
                        moq: 1,
                        order_multiple: 1,
                        price_validity: "Fixed",
                        country_of_origin: "Germany",
                        customs_tariff_hs: "8536.20.10",
                        hazardous_material: "No",
                        shelf_life_months: 120,
                        warranty_months: 24,
                        spec_sheet_url: "docs/spec_mccb.pdf",
                        sds_url: "",
                        discount_tier: "None",
                        indexation_clause: "Fixed",
                        price_type: "Firm Fixed",
                        created_date: "2026-04-27",
                        modified_by: "Demo Customer"
                    });
                });

                // Generate items 12 through 181 to exactly reach 181 total items (180 Approved, 0 Pending, 1 Disabled)
                for (let i = 12; i <= 181; i++) {
                    const idNum = 2890 + i;
                    combined.push({
                        id: `itm_gen_${i}`,
                        pricebook_id: pricebookId,
                        dmp_id: String(idNum),
                        photo: "",
                        status: "Approved",
                        supplier_part_no: `CW290057_${140 + i}`,
                        material_service_no: String(36105060 + i),
                        part_no_extension: "",
                        product_type: "MATERIAL",
                        uom: i % 4 === 0 ? "PC" : (i % 7 === 0 ? "SET" : "EA"),
                        customer_short_description: `CIRCUIT BREAKER ACCESSORY KIT TYPE ${i}`,
                        customer_long_description: `CIRCUIT BREAKER ACCESSORY KIT TYPE ${i} FOR XT AND COMPACT NSX SERIES`,
                        supplier_description: `OEM Kit ${i} for Industrial Switchgear`,
                        manufacturer_name: i % 2 === 0 ? "ABB" : "Schneider Electric",
                        manufacturer_part_no: `CW290057_${140 + i}`,
                        unit_price: parseFloat((15.0 + (i * 3.75) % 850).toFixed(2)),
                        currency: "USD",
                        lead_time_days: 14 + (i % 14),
                        incoterms_key: "DDP",
                        incoterms_location: "Baku Central Warehouse",
                        unspsc: "39121601",
                        unspsc_title: "Circuit breakers",
                        valid_from: "2026-01-01",
                        valid_to: "2028-12-31",
                        moq: 1,
                        order_multiple: 1,
                        price_validity: "Fixed",
                        country_of_origin: "Germany",
                        customs_tariff_hs: "8536.20.10",
                        hazardous_material: "No",
                        shelf_life_months: 120,
                        warranty_months: 24,
                        spec_sheet_url: "docs/spec_mccb.pdf",
                        sds_url: "",
                        discount_tier: "None",
                        indexation_clause: "Fixed",
                        price_type: "Firm Fixed",
                        created_date: "2026-04-27",
                        modified_by: "Demo Customer"
                    });
                }
                return combined;
            }
        }
        return rawItems;
    }

    function render(root, contractId, pricebookId) {
        let contract = window.Store.contractById(contractId);
        let pricebook = window.Store.pricebookById(pricebookId);

        // Fallbacks if only one id was passed or id aliases are used
        if (!pricebook && contractId) {
            pricebook = window.Store.pricebookById(contractId);
        }
        if (!pricebook) {
            const allPbs = window.Store.pricebooks();
            pricebook = allPbs.find(p => p.id === pricebookId || p.pricebook_number === pricebookId || p.pricebook_number === "28") || allPbs[0];
        }
        if (pricebook && !contract) {
            contract = window.Store.contractById(pricebook.contract_id);
        }
        if (!contract) {
            const allCtrs = window.Store.contracts();
            contract = allCtrs.find(c => c.id === "CTR-2026-001" || c.contract_number === "26") || allCtrs[0];
        }

        if (!pricebook) {
            root.innerHTML = `<div style="padding:40px;text-align:center;"><h3>Pricebook not found</h3><a href="#/contracts" class="btn btn-outline" style="margin-top:16px;">Back to Contracts</a></div>`;
            return;
        }

        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);

        const rawItems = window.Store.lineItemsByPricebook(pricebook.id);
        const allItems = getEnrichedItems(pricebook.id, rawItems);

        // Compute aggregate stats across all items for this pricebook
        const totalItemsCount = allItems.length;
        const approvedCount = allItems.filter(i => (i.status || "").toLowerCase() === "approved").length;
        const disabledCount = allItems.filter(i => (i.status || "").toLowerCase() === "disabled").length;
        const pendingCount = allItems.filter(i => (i.status || "").toLowerCase() === "pending").length;

        // Apply filters
        let filteredItems = allItems;

        if (filterSearch) {
            const q = filterSearch.toLowerCase().trim();
            filteredItems = filteredItems.filter(i =>
                (i.customer_short_description && i.customer_short_description.toLowerCase().includes(q)) ||
                (i.supplier_part_no && i.supplier_part_no.toLowerCase().includes(q)) ||
                (i.material_service_no && i.material_service_no.toLowerCase().includes(q)) ||
                (i.dmp_id && i.dmp_id.toLowerCase().includes(q)) ||
                (i.manufacturer_name && i.manufacturer_name.toLowerCase().includes(q))
            );
        }

        if (filterStatusApproved && !filterStatusDisabled) {
            filteredItems = filteredItems.filter(i => (i.status || "").toLowerCase() === "approved");
        } else if (filterStatusDisabled && !filterStatusApproved) {
            filteredItems = filteredItems.filter(i => (i.status || "").toLowerCase() === "disabled");
        }

        if (filterUOM) {
            filteredItems = filteredItems.filter(i => i.uom === filterUOM);
        }

        if (filterManufacturer) {
            filteredItems = filteredItems.filter(i => i.manufacturer_name === filterManufacturer);
        }

        if (filterPriceMin !== "" && !isNaN(parseFloat(filterPriceMin))) {
            const minP = parseFloat(filterPriceMin);
            filteredItems = filteredItems.filter(i => (i.unit_price || 0) >= minP);
        }

        if (filterPriceMax !== "" && !isNaN(parseFloat(filterPriceMax))) {
            const maxP = parseFloat(filterPriceMax);
            filteredItems = filteredItems.filter(i => (i.unit_price || 0) <= maxP);
        }

        if (filterLeadtime) {
            filteredItems = filteredItems.filter(i => String(i.lead_time_days) === filterLeadtime);
        }

        if (filterIncoterms) {
            filteredItems = filteredItems.filter(i => i.incoterms_key === filterIncoterms);
        }

        if (filterIncotermsLocation) {
            filteredItems = filteredItems.filter(i => i.incoterms_location === filterIncotermsLocation);
        }

        if (filterUNSPSC) {
            filteredItems = filteredItems.filter(i => i.unspsc === filterUNSPSC);
        }

        // Pagination calculation
        const totalFiltered = filteredItems.length;
        const totalPages = Math.max(1, Math.ceil(totalFiltered / rowsPerPage));
        if (currentPage > totalPages) currentPage = totalPages;
        const startIndex = (currentPage - 1) * rowsPerPage;
        const pageItems = filteredItems.slice(startIndex, startIndex + rowsPerPage);

        // Display numbers
        const contractNum = contract ? (contract.contract_number || contract.id.replace(/^[A-Za-z]+-/, "")) : "26";
        const pbNum = pricebook.pricebook_number || "28";

        root.innerHTML = `
            ${window.UI.breadcrumb("Contract management", "Contract # " + contractNum, "Pricebook # " + pbNum)}
            <div class="flex-column h-full page-viewport pageWrapper-iFXGCW" style="padding: 16px 28px; width: 100%;">
                <div>
                    <!-- 3-Column Metadata Hero matching 09_pricebook_items_detail.png -->
                    <div>
                        <div class="verticalExtraSection-KdA1Jm" id="pb-hero-section" style="${isHeroCollapsed ? 'display:none;' : 'display:block;'}">
                            <div>
                                <div class="flex-align-center list-WdlufD">
                                    <div class="container-ypalLs w-full">
                                        <ul>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Contract description:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(contract ? contract.description : "test contract")}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Pricebook #</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${pbNum}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Currency:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${pricebook.currency || "USD"}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">External contract #</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc((contract && contract.external_id) || "123123123")}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Pricebook description:</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc(pricebook.description || "Moulded case circuit breaker")}</span></span>
                                            </li>
                                            <li>
                                                <span class="itemLabel-sCP6mE">Supplier</span>
                                                <span class="root-Vr2pV6"><span class="itemValue-D2N7I4">${window.UI.esc((contract && contract.supplier) || "MRO AISEL")}</span></span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Expander toggle chevron ︽ -->
                        <div class="verticalExpanderToggle-WLNyNb" id="toggle-pb-hero-btn" title="Toggle pricebook details">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="#3A3A3A" xmlns="http://www.w3.org/2000/svg" style="${isHeroCollapsed ? 'transform:rotate(180deg);' : ''}">
                                <path d="M14.2319 6.71766C14.3386 6.82506 14.3991 6.96986 14.4006 7.12123C14.4021 7.2726 14.3444 7.41858 14.2399 7.52806C14.1891 7.58167 14.128 7.62454 14.0604 7.65412C13.9927 7.68371 13.9198 7.69942 13.8459 7.70031C13.7721 7.70121 13.6988 7.68727 13.6304 7.65934C13.5621 7.6314 13.5 7.59002 13.4479 7.53766L8.0823 2.17766L2.5559 7.83366C2.50445 7.88664 2.44289 7.92876 2.37487 7.95752C2.30685 7.98628 2.23375 8.0011 2.1599 8.0011C2.08605 8.0011 2.01295 7.98628 1.94493 7.95752C1.87691 7.92876 1.81535 7.88664 1.7639 7.83366C1.65872 7.72515 1.59991 7.57997 1.59991 7.42886C1.59991 7.27774 1.65872 7.13256 1.7639 7.02406L7.6799 0.968058C7.73102 0.915428 7.79212 0.873517 7.85962 0.844776C7.92713 0.816034 7.99969 0.801039 8.07306 0.800666C8.14643 0.800294 8.21913 0.814552 8.28693 0.842607C8.35472 0.870661 8.41625 0.91195 8.4679 0.964058L14.2319 6.71766ZM14.2319 13.9177C14.3383 14.025 14.3987 14.1697 14.4002 14.3208C14.4017 14.472 14.3442 14.6178 14.2399 14.7273C14.1891 14.7809 14.128 14.8237 14.0604 14.8533C13.9927 14.8829 13.9198 14.8986 13.8459 14.8995C13.7721 14.9004 13.6988 14.8865 13.6304 14.8585C13.5621 14.8306 13.5 14.7892 13.4479 14.7369L8.0823 9.37686L2.5559 15.0329C2.50445 15.0858 2.44289 15.128 2.37487 15.1567C2.30685 15.1855 2.23375 15.2003 2.1599 15.2003C2.08605 15.2003 2.01295 15.1855 1.94493 15.1567C1.87691 15.128 1.81535 15.0858 1.7639 15.0329C1.65872 14.9244 1.59991 14.7792 1.59991 14.6281C1.59991 14.4769 1.65872 14.3318 1.7639 14.2233L7.6799 8.16806C7.73102 8.11543 7.79212 8.07352 7.85962 8.04478C7.92713 8.01603 7.99969 8.00104 8.07306 8.00067C8.14643 0.800294 8.21913 0.814552 8.28693 0.84261C8.35472 0.87066 8.41625 0.91195 8.4679 0.96406L14.2319 13.9177Z" fill="#3A3A3A"/>
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Two-Column Container: Left Filter Sidebar + Right Enterprise Table -->
                <div class="motion-content filter-layout" style="margin-top: 8px;">
                    
                    <!-- 260px Left Filter Sidebar matching 09_pricebook_items_detail.png -->
                    <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" id="pb-sidebar" ${isSidebarCollapsed ? 'data-minimized="true"' : ''} style="width: 260px;">
                        <div class="flex-center filterArrow-jGyFr7" id="sidebar-toggle-btn" title="${isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 8.07275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"/>
                            </svg>
                        </div>

                        <div class="filterContent-YzzLD2">
                            <div class="filterFields-dIjaHp">
                                
                                <!-- Status Filter -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">Status</label>
                                    <div class="flex-column-gap-8">
                                        <label class="checkbox-UKyIAt">
                                            <input type="checkbox" id="filter-chk-approved" ${filterStatusApproved ? 'checked' : ''}>
                                            <span class="box-u07F6U"></span>
                                            <span>Approved</span>
                                        </label>
                                        <label class="checkbox-UKyIAt">
                                            <input type="checkbox" id="filter-chk-disabled" ${filterStatusDisabled ? 'checked' : ''}>
                                            <span class="box-u07F6U"></span>
                                            <span>Disabled</span>
                                        </label>
                                    </div>
                                </div>

                                <!-- UOM Filter -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">UOM</label>
                                    <div class="ant-select">
                                        <select id="filter-select-uom">
                                            <option value="">Select...</option>
                                            <option value="EA" ${filterUOM === 'EA' ? 'selected' : ''}>EA &mdash; Each</option>
                                            <option value="PC" ${filterUOM === 'PC' ? 'selected' : ''}>PC &mdash; Piece</option>
                                            <option value="SET" ${filterUOM === 'SET' ? 'selected' : ''}>SET &mdash; Set</option>
                                            <option value="M" ${filterUOM === 'M' ? 'selected' : ''}>M &mdash; Meter</option>
                                            <option value="KG" ${filterUOM === 'KG' ? 'selected' : ''}>KG &mdash; Kilogram</option>
                                        </select>
                                        <span class="ant-select-selection-placeholder" id="placeholder-uom">${filterUOM || 'Select...'}</span>
                                        <span class="ant-select-arrow">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </div>

                                <!-- Manufacturer Name Filter -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">Manufacturer Name</label>
                                    <div class="ant-select">
                                        <select id="filter-select-mfr">
                                            <option value="">Select...</option>
                                            <option value="ABB" ${filterManufacturer === 'ABB' ? 'selected' : ''}>ABB</option>
                                            <option value="Schneider Electric" ${filterManufacturer === 'Schneider Electric' ? 'selected' : ''}>Schneider Electric</option>
                                            <option value="SKF AB" ${filterManufacturer === 'SKF AB' ? 'selected' : ''}>SKF AB</option>
                                            <option value="EagleBurgmann" ${filterManufacturer === 'EagleBurgmann' ? 'selected' : ''}>EagleBurgmann</option>
                                            <option value="Rexnord / Falk" ${filterManufacturer === 'Rexnord / Falk' ? 'selected' : ''}>Rexnord / Falk</option>
                                            <option value="Optibelt GmbH" ${filterManufacturer === 'Optibelt GmbH' ? 'selected' : ''}>Optibelt GmbH</option>
                                        </select>
                                        <span class="ant-select-selection-placeholder" id="placeholder-mfr">${filterManufacturer || 'Select...'}</span>
                                        <span class="ant-select-arrow">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </div>

                                <!-- Price Range Filter matching 09_pricebook_items_detail.png: $ [ 1.5 ] $ [ 1216 ] [ Go ] -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">Price Range</label>
                                    <div class="priceRangeGroup-n8sB">
                                        <div class="priceInputContainer-pL9s">
                                            <span class="currencyPrefix">$</span>
                                            <input type="text" id="price-min-input" placeholder="1.5" value="${filterPriceMin}">
                                        </div>
                                        <div class="priceInputContainer-pL9s">
                                            <span class="currencyPrefix">$</span>
                                            <input type="text" id="price-max-input" placeholder="1216" value="${filterPriceMax}">
                                        </div>
                                        <button class="btnGo-r81a" id="btn-apply-price" title="Apply price range filter">Go</button>
                                    </div>
                                </div>

                                <!-- Leadtime Filter -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">Leadtime</label>
                                    <div class="ant-select">
                                        <select id="filter-select-lead">
                                            <option value="">Select...</option>
                                            <option value="7" ${filterLeadtime === '7' ? 'selected' : ''}>7 days</option>
                                            <option value="10" ${filterLeadtime === '10' ? 'selected' : ''}>10 days</option>
                                            <option value="14" ${filterLeadtime === '14' ? 'selected' : ''}>14 days</option>
                                            <option value="21" ${filterLeadtime === '21' ? 'selected' : ''}>21 days</option>
                                            <option value="28" ${filterLeadtime === '28' ? 'selected' : ''}>28 days</option>
                                            <option value="30" ${filterLeadtime === '30' ? 'selected' : ''}>30 days</option>
                                        </select>
                                        <span class="ant-select-selection-placeholder">${filterLeadtime ? filterLeadtime + ' days' : 'Select...'}</span>
                                        <span class="ant-select-arrow">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </div>

                                <!-- Incoterms key Filter -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">Incoterms key</label>
                                    <div class="ant-select">
                                        <select id="filter-select-incoterms">
                                            <option value="">Select...</option>
                                            <option value="DDP" ${filterIncoterms === 'DDP' ? 'selected' : ''}>DDP &mdash; Delivered Duty Paid</option>
                                            <option value="CIF" ${filterIncoterms === 'CIF' ? 'selected' : ''}>CIF &mdash; Cost, Insurance, Freight</option>
                                            <option value="EXW" ${filterIncoterms === 'EXW' ? 'selected' : ''}>EXW &mdash; Ex Works</option>
                                            <option value="FOB" ${filterIncoterms === 'FOB' ? 'selected' : ''}>FOB &mdash; Free on Board</option>
                                        </select>
                                        <span class="ant-select-selection-placeholder">${filterIncoterms || 'Select...'}</span>
                                        <span class="ant-select-arrow">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </div>

                                <!-- Incoterms Location Filter -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">Incoterms Location</label>
                                    <div class="ant-select">
                                        <select id="filter-select-location">
                                            <option value="">Select...</option>
                                            <option value="Baku Central Warehouse" ${filterIncotermsLocation === 'Baku Central Warehouse' ? 'selected' : ''}>Baku Central Warehouse</option>
                                            <option value="Shah Deniz Platform" ${filterIncotermsLocation === 'Shah Deniz Platform' ? 'selected' : ''}>Shah Deniz Platform</option>
                                            <option value="Sangachal Terminal" ${filterIncotermsLocation === 'Sangachal Terminal' ? 'selected' : ''}>Sangachal Terminal</option>
                                        </select>
                                        <span class="ant-select-selection-placeholder">${filterIncotermsLocation || 'Select...'}</span>
                                        <span class="ant-select-arrow">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </div>

                                <!-- UNSPSC Code Filter -->
                                <div class="form-group" style="margin-bottom: 16px;">
                                    <label class="label-uhdLaM">UNSPSC Code</label>
                                    <div class="ant-select">
                                        <select id="filter-select-unspsc">
                                            <option value="">Select...</option>
                                            <option value="39121601" ${filterUNSPSC === '39121601' ? 'selected' : ''}>39121601 &mdash; Circuit breakers</option>
                                            <option value="31171504" ${filterUNSPSC === '31171504' ? 'selected' : ''}>31171504 &mdash; Ball bearings</option>
                                            <option value="31181502" ${filterUNSPSC === '31181502' ? 'selected' : ''}>31181502 &mdash; Gaskets</option>
                                        </select>
                                        <span class="ant-select-selection-placeholder">${filterUNSPSC || 'Select...'}</span>
                                        <span class="ant-select-arrow">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
                                        </span>
                                    </div>
                                </div>

                                <!-- Valid From/To Date Filter -->
                                <div class="form-group" style="margin-bottom: 20px;">
                                    <label class="label-uhdLaM">Valid From/To</label>
                                    <div class="datepicker-t5AVY9">
                                        <input type="text" id="filter-valid-date" placeholder="YYYY-MM-DD" value="${filterValidDate}">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                            <line x1="16" y1="2" x2="16" y2="6"/>
                                            <line x1="8" y1="2" x2="8" y2="6"/>
                                            <line x1="3" y1="10" x2="21" y2="10"/>
                                        </svg>
                                    </div>
                                </div>

                                <!-- Clear All Filters Link Button -->
                                <div style="text-align: center;">
                                    <button class="clear-all-link-btn" id="btn-clear-filters">Clear All Filters</button>
                                </div>

                            </div>
                        </div>
                    </aside>

                    <!-- Right White Content Card (.contentTable-_531TS) -->
                    <div class="contentTable-_531TS">
                        
                        <!-- Top Stats / View Toggle Bar matching 09_pricebook_items_detail.png -->
                        <div class="itemsStatsRow-qP90">
                            <div class="viewModeToggle-btN8">
                                <button class="viewModeBtn ${activeViewMode === 'list' ? 'active' : ''}" id="btn-view-list" title="List view">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                                        <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
                                    </svg>
                                </button>
                                <button class="viewModeBtn ${activeViewMode === 'grid' ? 'active' : ''}" id="btn-view-grid" title="Grid view">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                                        <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                                    </svg>
                                </button>
                            </div>

                            <div class="statsCountersGroup">
                                <span class="statsCounterItem"># of items: <strong>${totalItemsCount}</strong></span>
                                <span class="statsCounterItem">Approved items: <strong>${approvedCount}</strong></span>
                                <span class="statsCounterItem">Pending items: <strong>${pendingCount}</strong></span>
                                <span class="statsCounterItem">Disabled items: <strong>${disabledCount}</strong></span>
                            </div>
                        </div>

                        <!-- Search Bar Row matching 09_pricebook_items_detail.png -->
                        <div style="padding: 12px 16px; display: flex; justify-content: space-between; align-items: center;">
                            <div class="container-FyufBC" style="max-width: 320px;">
                                <svg class="searchIcon-RowzYk" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                </svg>
                                <input type="text" class="inputSearch-HCZijN" id="item-search-input" placeholder="Search here" value="${window.UI.esc(filterSearch)}">
                            </div>

                            <div style="display: flex; gap: 8px;">
                                <button class="btn btn-outline btn-sm" data-act="export-csv">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                    <span>Export CSV</span>
                                </button>
                                <button class="btn-black-add" data-act="add-item" style="padding: 6px 14px; font-size: 13px;">
                                    <span>+ Add Item</span>
                                </button>
                            </div>
                        </div>

                        <!-- Main Items Content: List Mode (38-Column Table) or Grid Mode -->
                        ${activeViewMode === 'list' ? `
                            <div class="tableWrapper-VDyaTh" style="max-height: calc(100vh - 350px); overflow-y: auto;">
                                <table class="table-egCV_Z striped-S6C7kO hoverable-e_h2L2">
                                    <thead>
                                        <tr>
                                            <th style="width: 40px; text-align: left;">No</th>
                                            <th style="width: 60px; text-align: center;">Photo</th>
                                            <th style="min-width: 90px;">dmp ID</th>
                                            <th style="min-width: 100px;">Status</th>
                                            <th style="min-width: 140px;">Supplier Part #</th>
                                            <th style="min-width: 140px;">Material/Service #</th>
                                            <th style="min-width: 130px;">Part # Extension</th>
                                            <th style="min-width: 120px;">Product Type</th>
                                            <th style="min-width: 70px;">UOM</th>
                                            <th style="min-width: 240px;">Customer Short Description</th>
                                            <th style="min-width: 300px;">Customer Long Description</th>
                                            <th style="min-width: 240px;">Supplier Description</th>
                                            <th style="min-width: 140px;">Manufacturer Name</th>
                                            <th style="min-width: 140px;">Manufacturer Part #</th>
                                            <th style="min-width: 100px; text-align: right;">Unit Price</th>
                                            <th style="min-width: 80px;">Currency</th>
                                            <th style="min-width: 120px;">Lead Time (Days)</th>
                                            <th style="min-width: 90px;">Incoterms</th>
                                            <th style="min-width: 160px;">Incoterms Location</th>
                                            <th style="min-width: 100px;">UNSPSC Code</th>
                                            <th style="min-width: 140px;">UNSPSC Title</th>
                                            <th style="min-width: 100px;">Valid From</th>
                                            <th style="min-width: 100px;">Valid To</th>
                                            <th style="min-width: 70px;">MOQ</th>
                                            <th style="min-width: 90px;">Order Multiple</th>
                                            <th style="min-width: 100px;">Price Validity</th>
                                            <th style="min-width: 120px;">Country of Origin</th>
                                            <th style="min-width: 120px;">Customs Tariff HS</th>
                                            <th style="min-width: 120px;">Hazardous Material</th>
                                            <th style="min-width: 120px;">Shelf Life (Months)</th>
                                            <th style="min-width: 120px;">Warranty (Months)</th>
                                            <th style="min-width: 90px;">Spec Sheet</th>
                                            <th style="min-width: 80px;">SDS</th>
                                            <th style="min-width: 100px;">Discount Tier</th>
                                            <th style="min-width: 120px;">Indexation Clause</th>
                                            <th style="min-width: 100px;">Price Type</th>
                                            <th style="min-width: 100px;">Creation Date</th>
                                            <th style="min-width: 50px; text-align: center;"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${pageItems.length === 0 ? `
                                            <tr>
                                                <td colspan="38" style="text-align: center; padding: 48px; color: #6B7280;">
                                                    No line items found matching active filters.
                                                </td>
                                            </tr>
                                        ` : pageItems.map((it, idx) => {
                                            const itemNum = startIndex + idx + 1;
                                            const isApproved = (it.status || "").toLowerCase() === "approved";
                                            const isDisabled = (it.status || "").toLowerCase() === "disabled";
                                            const statusChip = isApproved
                                                ? `<span class="chip-Dqdeip success-BmS3ka" style="background:#DCFCE7;color:#166534;border-radius:4px;padding:3px 12px;font-weight:500;">Approved</span>`
                                                : (isDisabled
                                                    ? `<span class="chip-Dqdeip" style="background:#F3F4F6;color:#6B7280;border-radius:4px;padding:3px 12px;font-weight:500;">Disabled</span>`
                                                    : `<span class="chip-Dqdeip warning-status" style="background:#FEF3C7;color:#D97706;border-radius:4px;padding:3px 12px;font-weight:500;">Pending</span>`);

                                            return `
                                                <tr>
                                                    <td>${itemNum}</td>
                                                    <td style="text-align:center;">
                                                        <div class="photoPlaceholder-x81B" data-act="view-photo" data-url="${it.photo || ''}" title="View item image">
                                                            ${it.photo ? `<img src="${it.photo}" alt="Thumb">` : `
                                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
                                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                                    <circle cx="8.5" cy="8.5" r="1.5"/>
                                                                    <polyline points="21 15 16 10 5 21"/>
                                                                </svg>
                                                            `}
                                                        </div>
                                                    </td>
                                                    <td style="font-weight: 500; color: #111827;">${window.UI.esc(it.dmp_id)}</td>
                                                    <td>${statusChip}</td>
                                                    <td style="font-family: inherit; font-size: 13.5px; color: #111827;">${window.UI.esc(it.supplier_part_no)}</td>
                                                    <td style="color: #111827;">${window.UI.esc(it.material_service_no || "")}</td>
                                                    <td style="color: #6B7280;">${window.UI.esc(it.part_no_extension || "")}</td>
                                                    <td style="color: #111827; font-weight: 500;">${window.UI.esc(it.product_type || "MATERIAL")}</td>
                                                    <td>${window.UI.esc(it.uom || "EA")}</td>
                                                    <td style="font-weight: 500; color: #111827;">${window.UI.esc(it.customer_short_description || "")}</td>
                                                    <td style="color: #6B7280; font-size: 13px;">${window.UI.esc(it.customer_long_description || "")}</td>
                                                    <td style="color: #6B7280; font-size: 13px;">${window.UI.esc(it.supplier_description || "")}</td>
                                                    <td>${window.UI.esc(it.manufacturer_name || "")}</td>
                                                    <td>${window.UI.esc(it.manufacturer_part_no || "")}</td>
                                                    <td style="text-align: right; font-weight: 600; color: #111827;">${Number(it.unit_price || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                    <td>${window.UI.esc(it.currency || pricebook.currency || "USD")}</td>
                                                    <td>${it.lead_time_days || 14}</td>
                                                    <td>${window.UI.esc(it.incoterms_key || "DDP")}</td>
                                                    <td>${window.UI.esc(it.incoterms_location || "Baku Central Warehouse")}</td>
                                                    <td>${window.UI.esc(it.unspsc || "39121601")}</td>
                                                    <td>${window.UI.esc(it.unspsc_title || "Circuit breakers")}</td>
                                                    <td>${it.valid_from || "2026-01-01"}</td>
                                                    <td>${it.valid_to || "2028-12-31"}</td>
                                                    <td>${it.moq || 1}</td>
                                                    <td>${it.order_multiple || 1}</td>
                                                    <td>${window.UI.esc(it.price_validity || "Fixed")}</td>
                                                    <td>${window.UI.esc(it.country_of_origin || "Germany")}</td>
                                                    <td>${window.UI.esc(it.customs_tariff_hs || "8536.20.10")}</td>
                                                    <td>${window.UI.esc(it.hazardous_material || "No")}</td>
                                                    <td>${it.shelf_life_months || 120}</td>
                                                    <td>${it.warranty_months || 24}</td>
                                                    <td><a href="#" class="cell-link" onclick="event.preventDefault();alert('Opening specification document for ' + '${window.UI.esc(it.supplier_part_no)}');">Spec</a></td>
                                                    <td>${it.sds_url ? `<a href="#" class="cell-link" onclick="event.preventDefault();alert('Opening SDS document');">SDS</a>` : '&mdash;'}</td>
                                                    <td>${window.UI.esc(it.discount_tier || "None")}</td>
                                                    <td>${window.UI.esc(it.indexation_clause || "Fixed")}</td>
                                                    <td>${window.UI.esc(it.price_type || "Firm Fixed")}</td>
                                                    <td>${it.created_date || "2026-04-27"}</td>
                                                    <td style="text-align: center;">
                                                        <button class="trigger-Z_D8XQ" data-act="item-actions" data-id="${it.id}">
                                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                                                <circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="19" r="1.5"/>
                                                            </svg>
                                                        </button>
                                                    </td>
                                                </tr>
                                            `;
                                        }).join("")}
                                    </tbody>
                                </table>
                            </div>
                        ` : `
                            <!-- Grid View Mode -->
                            <div class="itemsGridWrapper-gR9p">
                                ${pageItems.map((it, idx) => {
                                    const isApproved = (it.status || "").toLowerCase() === "approved";
                                    return `
                                        <div class="itemGridCard-kL01">
                                            <div style="display: flex; gap: 12px; align-items: center;">
                                                <div class="photoPlaceholder-x81B" style="width:56px; height:56px;">
                                                    ${it.photo ? `<img src="${it.photo}">` : `
                                                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5">
                                                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                                            <circle cx="8.5" cy="8.5" r="1.5"/>
                                                            <polyline points="21 15 16 10 5 21"/>
                                                        </svg>
                                                    `}
                                                </div>
                                                <div style="flex: 1; min-width: 0;">
                                                    <div style="font-size: 11px; color: #6B7280;">DMP ID: ${window.UI.esc(it.dmp_id)}</div>
                                                    <div style="font-weight: 700; font-size: 14px; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${window.UI.esc(it.supplier_part_no)}</div>
                                                    <div style="font-size: 12px; color: #4B5563;">${window.UI.esc(it.manufacturer_name)}</div>
                                                </div>
                                                <span class="chip-Dqdeip ${isApproved ? 'success-BmS3ka' : ''}" style="background:${isApproved ? '#DCFCE7' : '#F3F4F6'};color:${isApproved ? '#166534' : '#6B7280'};border-radius:4px;padding:2px 8px;font-size:11px;">
                                                    ${it.status}
                                                </span>
                                            </div>
                                            <div style="font-size: 13px; font-weight: 600; color: #111827; line-height: 1.3;">
                                                ${window.UI.esc(it.customer_short_description)}
                                            </div>
                                            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px solid #F3F4F6; padding-top: 10px; margin-top: auto;">
                                                <span style="font-size: 12px; color: #6B7280;">Lead: ${it.lead_time_days || 14} days</span>
                                                <span style="font-size: 16px; font-weight: 700; color: #111827;">${window.UI.money(it.unit_price, pricebook.currency)}</span>
                                            </div>
                                        </div>
                                    `;
                                }).join("")}
                            </div>
                        `}

                        <!-- Pagination Footer matching 09_pricebook_items_detail.png: < [ 1 ] 2 3 ... 19 > Show [ 10 rows v ] -->
                        <div class="pagination-Qo0Zyp hasBackground-KRB3Nk">
                            <div></div>
                            <div class="pagination-controls">
                                <button class="navButton-ifUhzO" id="btn-prev-page" ${currentPage <= 1 ? 'disabled' : ''} title="Previous page">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="15 18 9 12 15 6"/>
                                    </svg>
                                </button>

                                <!-- Page Number Buttons -->
                                ${renderPaginationNumbers(currentPage, totalPages)}

                                <button class="navButton-ifUhzO" id="btn-next-page" ${currentPage >= totalPages ? 'disabled' : ''} title="Next page">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="9 18 15 12 9 6"/>
                                    </svg>
                                </button>

                                <div class="selectorContainer-eqpsde">
                                    <span>Show</span>
                                    <div class="selector-jKTTze">
                                        <select class="ant-select" id="select-rows-per-page">
                                            <option value="10" ${rowsPerPage === 10 ? 'selected' : ''}>10 rows</option>
                                            <option value="25" ${rowsPerPage === 25 ? 'selected' : ''}>25 rows</option>
                                            <option value="50" ${rowsPerPage === 50 ? 'selected' : ''}>50 rows</option>
                                            <option value="100" ${rowsPerPage === 100 ? 'selected' : ''}>100 rows</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>

                <!-- Floating Feedback Bubble in bottom right matching reference -->
                ${window.UI.renderFeedbackBubble()}

            </div>
        `;

        // Event listeners & Handlers
        attachEvents(root, contract, pricebook, allItems, () => render(root, contractId, pricebookId));
    }

    function renderPaginationNumbers(curr, total) {
        let html = "";
        const maxVisible = 5;

        if (total <= 7) {
            for (let p = 1; p <= total; p++) {
                html += `<button class="pageButton-Ltt_aD ${p === curr ? 'active-paX3W6' : ''}" data-page="${p}">${p}</button>`;
            }
        } else {
            // First page
            html += `<button class="pageButton-Ltt_aD ${1 === curr ? 'active-paX3W6' : ''}" data-page="1">1</button>`;

            if (curr > 3) {
                html += `<button class="pageButton-Ltt_aD ${2 === curr ? 'active-paX3W6' : ''}" data-page="2">2</button>`;
                html += `<button class="pageButton-Ltt_aD ${3 === curr ? 'active-paX3W6' : ''}" data-page="3">3</button>`;
                html += `<span style="color:#9CA3AF; padding: 0 4px; line-height:32px;">...</span>`;
            } else {
                html += `<button class="pageButton-Ltt_aD ${2 === curr ? 'active-paX3W6' : ''}" data-page="2">2</button>`;
                html += `<button class="pageButton-Ltt_aD ${3 === curr ? 'active-paX3W6' : ''}" data-page="3">3</button>`;
                html += `<span style="color:#9CA3AF; padding: 0 4px; line-height:32px;">...</span>`;
            }

            // Last page
            html += `<button class="pageButton-Ltt_aD ${total === curr ? 'active-paX3W6' : ''}" data-page="${total}">${total}</button>`;
        }
        return html;
    }

    function attachEvents(root, contract, pricebook, items, rerender) {
        // Toggle hero
        const toggleHeroBtn = root.querySelector("#toggle-pb-hero-btn");
        if (toggleHeroBtn) {
            toggleHeroBtn.addEventListener("click", () => {
                isHeroCollapsed = !isHeroCollapsed;
                const sec = root.querySelector("#pb-hero-section");
                const svg = toggleHeroBtn.querySelector("svg");
                if (sec) sec.style.display = isHeroCollapsed ? "none" : "block";
                if (svg) svg.style.transform = isHeroCollapsed ? "rotate(180deg)" : "";
            });
        }

        // Toggle left filter sidebar
        const sidebarToggleBtn = root.querySelector("#sidebar-toggle-btn");
        if (sidebarToggleBtn) {
            sidebarToggleBtn.addEventListener("click", () => {
                isSidebarCollapsed = !isSidebarCollapsed;
                const sb = root.querySelector("#pb-sidebar");
                if (sb) {
                    if (isSidebarCollapsed) {
                        sb.setAttribute("data-minimized", "true");
                    } else {
                        sb.removeAttribute("data-minimized");
                    }
                }
            });
        }

        // Search Input
        const searchInput = root.querySelector("#item-search-input");
        if (searchInput) {
            searchInput.addEventListener("input", e => {
                filterSearch = e.target.value;
                currentPage = 1;
                rerender();
            });
        }

        // Status filters
        const chkApp = root.querySelector("#filter-chk-approved");
        if (chkApp) {
            chkApp.addEventListener("change", e => {
                filterStatusApproved = e.target.checked;
                currentPage = 1;
                rerender();
            });
        }
        const chkDis = root.querySelector("#filter-chk-disabled");
        if (chkDis) {
            chkDis.addEventListener("change", e => {
                filterStatusDisabled = e.target.checked;
                currentPage = 1;
                rerender();
            });
        }

        // Select filters
        const selUom = root.querySelector("#filter-select-uom");
        if (selUom) {
            selUom.addEventListener("change", e => {
                filterUOM = e.target.value;
                currentPage = 1;
                rerender();
            });
        }
        const selMfr = root.querySelector("#filter-select-mfr");
        if (selMfr) {
            selMfr.addEventListener("change", e => {
                filterManufacturer = e.target.value;
                currentPage = 1;
                rerender();
            });
        }
        const selLead = root.querySelector("#filter-select-lead");
        if (selLead) {
            selLead.addEventListener("change", e => {
                filterLeadtime = e.target.value;
                currentPage = 1;
                rerender();
            });
        }
        const selInco = root.querySelector("#filter-select-incoterms");
        if (selInco) {
            selInco.addEventListener("change", e => {
                filterIncoterms = e.target.value;
                currentPage = 1;
                rerender();
            });
        }
        const selLoc = root.querySelector("#filter-select-location");
        if (selLoc) {
            selLoc.addEventListener("change", e => {
                filterIncotermsLocation = e.target.value;
                currentPage = 1;
                rerender();
            });
        }
        const selUnspsc = root.querySelector("#filter-select-unspsc");
        if (selUnspsc) {
            selUnspsc.addEventListener("change", e => {
                filterUNSPSC = e.target.value;
                currentPage = 1;
                rerender();
            });
        }

        // Price Go Button
        const btnGo = root.querySelector("#btn-apply-price");
        if (btnGo) {
            btnGo.addEventListener("click", () => {
                const minInput = root.querySelector("#price-min-input");
                const maxInput = root.querySelector("#price-max-input");
                filterPriceMin = minInput ? minInput.value.trim() : "";
                filterPriceMax = maxInput ? maxInput.value.trim() : "";
                currentPage = 1;
                rerender();
            });
        }

        // Clear All Filters
        const btnClear = root.querySelector("#btn-clear-filters");
        if (btnClear) {
            btnClear.addEventListener("click", () => {
                filterSearch = "";
                filterStatusApproved = false;
                filterStatusDisabled = false;
                filterUOM = "";
                filterManufacturer = "";
                filterPriceMin = "";
                filterPriceMax = "";
                filterLeadtime = "";
                filterIncoterms = "";
                filterIncotermsLocation = "";
                filterUNSPSC = "";
                filterValidDate = "";
                currentPage = 1;
                rerender();
            });
        }

        // View Mode Toggles
        const btnList = root.querySelector("#btn-view-list");
        if (btnList) {
            btnList.addEventListener("click", () => {
                if (activeViewMode !== "list") {
                    activeViewMode = "list";
                    rerender();
                }
            });
        }
        const btnGrid = root.querySelector("#btn-view-grid");
        if (btnGrid) {
            btnGrid.addEventListener("click", () => {
                if (activeViewMode !== "grid") {
                    activeViewMode = "grid";
                    rerender();
                }
            });
        }

        // Pagination buttons
        const btnPrev = root.querySelector("#btn-prev-page");
        if (btnPrev) {
            btnPrev.addEventListener("click", () => {
                if (currentPage > 1) {
                    currentPage--;
                    rerender();
                }
            });
        }
        const btnNext = root.querySelector("#btn-next-page");
        if (btnNext) {
            btnNext.addEventListener("click", () => {
                currentPage++;
                rerender();
            });
        }
        root.querySelectorAll("[data-page]").forEach(btn => {
            btn.addEventListener("click", () => {
                const p = parseInt(btn.getAttribute("data-page"), 10);
                if (p && p !== currentPage) {
                    currentPage = p;
                    rerender();
                }
            });
        });
        const selRows = root.querySelector("#select-rows-per-page");
        if (selRows) {
            selRows.addEventListener("change", e => {
                rowsPerPage = parseInt(e.target.value, 10) || 10;
                currentPage = 1;
                rerender();
            });
        }

        // View Photo Modal
        root.querySelectorAll("[data-act='view-photo']").forEach(el => {
            el.addEventListener("click", () => {
                const u = el.getAttribute("data-url");
                window.UI.openPhotoModal(u || "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800");
            });
        });

        // Item Actions (3-dots menu)
        root.querySelectorAll("[data-act='item-actions']").forEach(btn => {
            btn.addEventListener("click", e => {
                e.stopPropagation();
                const id = btn.getAttribute("data-id");
                const it = items.find(x => x.id === id);
                if (!it) return;

                const me = window.Store.currentUser();
                const isCust = window.ContractWorkflow.isCustomer(me);
                const currentStatus = (it.status || "").toLowerCase();
                const isApproved = currentStatus === "approved";

                window.UI.showActionMenu(btn, [
                    {
                        label: isApproved ? "Disable item" : "Approve item",
                        icon: isApproved ? "🚫" : "✅",
                        danger: isApproved,
                        onClick: () => {
                            window.Store.set(s => {
                                const target = (s.line_items || []).find(x => x.id === id);
                                if (target) {
                                    target.status = isApproved ? "Disabled" : "Approved";
                                }
                            });
                            window.UI.toast({ kind: "success", title: "Item Status Updated", body: `Item set to ${isApproved ? "Disabled" : "Approved"}.` });
                            rerender();
                        }
                    },
                    {
                        label: "Request CTR price revision",
                        icon: "📝",
                        onClick: () => {
                            const newPrice = prompt(`Enter new requested unit price (Current: $${it.unit_price}):`, it.unit_price);
                            if (newPrice && !isNaN(parseFloat(newPrice))) {
                                const np = parseFloat(newPrice);
                                window.Store.set(s => {
                                    if (!s.ctr_requests) s.ctr_requests = [];
                                    s.ctr_requests.push({
                                        id: "CTR-REQ-" + Date.now().toString(36).toUpperCase(),
                                        contract_id: contract ? contract.id : pricebook.contract_id,
                                        pricebook_id: pricebook.id,
                                        item_id: it.id,
                                        item_desc: it.customer_short_description,
                                        supplier: contract ? contract.supplier : me.company,
                                        request_type: "Price Revision Request",
                                        requested_by: me.name,
                                        current_price: it.unit_price,
                                        requested_price: np,
                                        currency: it.currency || pricebook.currency || "USD",
                                        justification: "Submitted via Pricebook Item portal.",
                                        status: "Pending Review",
                                        created_at: new Date().toISOString().slice(0, 10)
                                    });
                                });
                                window.UI.toast({ kind: "success", title: "CTR Request Submitted", body: "Submitted price revision request to procurement." });
                            }
                        }
                    },
                    {
                        label: "View technical datasheet",
                        icon: "📑",
                        onClick: () => {
                            window.UI.toast({ kind: "info", title: "Datasheet", body: `Viewing technical datasheet for Part #${it.supplier_part_no}` });
                        }
                    },
                    {
                        label: "Copy part number",
                        icon: "📋",
                        onClick: () => {
                            navigator.clipboard?.writeText(it.supplier_part_no);
                            window.UI.toast({ kind: "success", title: "Copied", body: `Part number ${it.supplier_part_no} copied to clipboard.` });
                        }
                    }
                ]);
            });
        });

        // Global actions (Export CSV, Add Item)
        window.UI.bindActions(root, {
            "export-csv": () => {
                exportItemsCSV(items, pricebook.pricebook_number || "pricebook");
            },
            "add-item": () => {
                openAddItemModal(pricebook, contract, rerender);
            }
        });
    }

    function exportItemsCSV(items, pbNum) {
        if (items.length === 0) {
            alert("No line items available to export.");
            return;
        }
        const headers = ["dmp ID", "Status", "Supplier Part #", "Material/Service #", "Product Type", "UOM", "Customer Short Description", "Unit Price", "Currency", "Lead Time", "Incoterms"];
        const rows = items.map(i => [
            i.dmp_id, i.status, i.supplier_part_no, i.material_service_no, i.product_type, i.uom,
            `"${(i.customer_short_description || "").replace(/"/g, '""')}"`,
            i.unit_price, i.currency, i.lead_time_days, i.incoterms_key
        ]);
        const csv = [headers.join(",")].concat(rows.map(r => r.join(","))).join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${pbNum}_MRO_Items.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function openAddItemModal(pb, contract, cb) {
        window.UI.openModal({
            title: `Add Item to Pricebook #${pb.pricebook_number || pb.id}`,
            wide: true,
            bodyHtml: `
                <form id="add-item-form" class="formGrid-PTja0j" style="grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="grid-column: 1 / -1;">
                        <label class="label-ZMZNIV required-uOw3_8">Customer Short Description</label>
                        <div class="container-FyufBC">
                            <input type="text" name="short_desc" placeholder="NOUN,QUALIFIER:IDENTIFIER (e.g. MOULDED CASE CIRCUIT BREAKER, 3P, 250A)" required>
                        </div>
                    </div>
                    <div>
                        <label class="label-ZMZNIV required-uOw3_8">Supplier Part #</label>
                        <div class="container-FyufBC">
                            <input type="text" name="part_no" placeholder="e.g. CW290057_999" required>
                        </div>
                    </div>
                    <div>
                        <label class="label-ZMZNIV">Material/Service #</label>
                        <div class="container-FyufBC">
                            <input type="text" name="mat_no" placeholder="36109999">
                        </div>
                    </div>
                    <div>
                        <label class="label-ZMZNIV">Manufacturer Name</label>
                        <div class="container-FyufBC">
                            <input type="text" name="mfr_name" placeholder="ABB">
                        </div>
                    </div>
                    <div>
                        <label class="label-ZMZNIV required-uOw3_8">Unit Price (${pb.currency || 'USD'})</label>
                        <div class="container-FyufBC">
                            <input type="number" step="0.01" name="unit_price" placeholder="450.00" required>
                        </div>
                    </div>
                    <div>
                        <label class="label-ZMZNIV required-uOw3_8">UOM</label>
                        <div class="container-FyufBC">
                            <select name="uom" style="width:100%; border:none; outline:none; font-size:13.5px; background:transparent;">
                                <option value="EA">EA &mdash; Each</option>
                                <option value="PC">PC &mdash; Piece</option>
                                <option value="SET">SET &mdash; Set</option>
                                <option value="M">M &mdash; Meter</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label class="label-ZMZNIV">Lead Time (Days)</label>
                        <div class="container-FyufBC">
                            <input type="number" name="lead_time" value="14">
                        </div>
                    </div>
                </form>
            `,
            buttons: [
                { label: "Cancel", cls: "outlined-BxCqIc", onClick: ov => ov.remove() },
                {
                    label: "Add Item",
                    cls: "btn-black-add",
                    onClick: ov => {
                        const f = ov.querySelector("#add-item-form");
                        const desc = f.short_desc.value.trim();
                        const pn = f.part_no.value.trim();
                        const pr = parseFloat(f.unit_price.value);
                        if (!desc || !pn || isNaN(pr)) {
                            alert("Please fill in required fields.");
                            return;
                        }
                        const newId = "itm_" + Date.now().toString(36);
                        window.Store.set(s => {
                            if (!s.line_items) s.line_items = [];
                            s.line_items.unshift({
                                id: newId,
                                pricebook_id: pb.id,
                                dmp_id: String(Math.floor(Math.random() * 9000 + 1000)),
                                photo: "",
                                status: "Approved",
                                supplier_part_no: pn,
                                material_service_no: f.mat_no.value.trim() || "36109999",
                                part_no_extension: "",
                                product_type: "MATERIAL",
                                uom: f.uom.value,
                                customer_short_description: desc,
                                customer_long_description: desc,
                                supplier_description: desc,
                                manufacturer_name: f.mfr_name.value.trim() || "OEM",
                                manufacturer_part_no: pn,
                                unit_price: pr,
                                currency: pb.currency || "USD",
                                lead_time_days: parseInt(f.lead_time.value, 10) || 14,
                                incoterms_key: "DDP",
                                incoterms_location: "Baku Central Warehouse",
                                unspsc: "39121601",
                                unspsc_title: "Circuit breakers",
                                valid_from: "2026-01-01",
                                valid_to: "2028-12-31",
                                moq: 1,
                                order_multiple: 1,
                                price_validity: "Fixed",
                                country_of_origin: "Germany",
                                customs_tariff_hs: "8536.20.10",
                                hazardous_material: "No",
                                shelf_life_months: 120,
                                warranty_months: 24,
                                spec_sheet_url: "",
                                sds_url: "",
                                discount_tier: "None",
                                indexation_clause: "Fixed",
                                price_type: "Firm Fixed",
                                created_date: new Date().toISOString().slice(0, 10),
                                modified_by: window.Store.currentUser().name
                            });
                            pb.items_count = (pb.items_count || 0) + 1;
                        });
                        window.UI.toast({ kind: "success", title: "Item Created", body: `Added ${desc} to pricebook.` });
                        ov.remove();
                        cb();
                    }
                }
            ]
        });
    }

    return { render };
})();
