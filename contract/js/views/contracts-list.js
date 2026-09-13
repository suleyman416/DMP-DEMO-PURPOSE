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
        const ownersList = Array.from(new Set(allContracts.map(c => c.procurement_contract_owner).filter(Boolean)));
        const camList = Array.from(new Set(allContracts.map(c => c.cam_name).filter(Boolean)));

        const hasFilters = Boolean(
            filterState.search ||
            filterState.statuses.size > 0 ||
            filterState.supplier ||
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
            <div class="content-TnO62i">
                <div class="page-wrapper page-viewport">
                    <div class="motion-content-header contentHeader-SOWwbQ">
                        <nav class="flex-align-center breadcrumbs-mhE9Ok">
                            <span class="flex-align-center item-Vrkft2">
                                <a href="#/contracts" class="link-h7l698">Contracts</a>
                            </span>
                        </nav>
                    </div>

                    <div class="motion-content filter-layout" data-testid="contracts-content">
                        <!-- Sidebar Filter Card -->
                        <aside class="card-eNpN6p flex-column sidebar-AY7Hhf fillHeight-gnyNzB" data-minimized="${filterState.sidebarCollapsed ? "true" : "false"}">
                            <div class="flex-center filterArrow-jGyFr7" data-act="toggle-sidebar" title="Toggle Filters">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M6.71754 1.76798C6.82494 1.6613 6.96974 1.60077 7.12111 1.59927C7.27248 1.59778 7.41845 1.65544 7.52794 1.75998C7.58155 1.81078 7.62441 1.87183 7.654 1.9395C7.68359 2.00718 7.6993 2.0801 7.70019 2.15395C7.70109 2.2278 7.68715 2.30108 7.65921 2.36945C7.63127 2.43782 7.5899 2.49989 7.53754 2.55198L2.17754 7.91758L7.83354 13.444C7.88652 13.4954 7.92863 13.557 7.9574 13.625C7.98616 13.693 8.00097 13.7661 8.00097 13.84C8.00097 13.9138 7.98616 13.9869 7.9574 14.055C7.92863 14.123 7.88652 14.1845 7.83354 14.236C7.72503 14.3412 7.57985 14.4 7.42874 14.4C7.27762 14.4 7.13244 14.3412 7.02394 14.236L0.967936 8.31998C0.915306 8.26886 0.873395 8.20776 0.844654 8.14025C0.815912 8.07275 0.800917 8.00019 0.800544 7.92682C0.800172 7.85345 0.81443 7.78074 0.842485 7.71295C0.870539 7.64515 0.911828 7.58363 0.963936 7.53198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                                </svg>
                            </div>
                            <div class="flex-column filterContent-YzzLD2" style="${filterState.sidebarCollapsed ? "display:none;" : ""}">
                                <div class="flex-column filterFields-dIjaHp">
                                    <div class="form-group">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Status</label>
                                        <div class="flex-column-gap-8">
                                            ${["Active", "Expired", "Upcoming"].map(st => `
                                                <label class="inline-flex-center checkbox-UKyIAt">
                                                    <input class="input-fERTBq" type="checkbox" value="${st}" data-filter="status" ${filterState.statuses.has(st) ? "checked" : ""}>
                                                    <span class="box-u07F6U"></span>
                                                    <div class="label-UX1ihv">${st}</div>
                                                </label>
                                            `).join("")}
                                        </div>
                                    </div>

                                    ${isCust ? `
                                    <div class="form-group">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Supplier Name</label>
                                        <div class="ant-select select-l8uECl">
                                            <select data-filter="supplier">
                                                <option value="">Select...</option>
                                                ${suppliersList.map(s => `<option value="${window.UI.esc(s)}" ${filterState.supplier === s ? "selected" : ""}>${window.UI.esc(s)}</option>`).join("")}
                                            </select>
                                            <span class="${filterState.supplier ? "ant-select-selection-item" : "ant-select-selection-placeholder"}">${filterState.supplier ? window.UI.esc(filterState.supplier) : "Select..."}</span>
                                            <span class="ant-select-arrow">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>` : ""}

                                    <div class="form-group">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Contract Owner</label>
                                        <div class="ant-select select-l8uECl">
                                            <select data-filter="owner">
                                                <option value="">Select...</option>
                                                ${ownersList.map(o => `<option value="${window.UI.esc(o)}" ${filterState.owner === o ? "selected" : ""}>${window.UI.esc(o)}</option>`).join("")}
                                            </select>
                                            <span class="${filterState.owner ? "ant-select-selection-item" : "ant-select-selection-placeholder"}">${filterState.owner ? window.UI.esc(filterState.owner) : "Select..."}</span>
                                            <span class="ant-select-arrow">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label class="label-uhdLaM minWidth-d4JjCT">CAM Name</label>
                                        <div class="ant-select select-l8uECl">
                                            <select data-filter="cam">
                                                <option value="">Select...</option>
                                                ${camList.map(c => `<option value="${window.UI.esc(c)}" ${filterState.cam === c ? "selected" : ""}>${window.UI.esc(c)}</option>`).join("")}
                                            </select>
                                            <span class="${filterState.cam ? "ant-select-selection-item" : "ant-select-selection-placeholder"}">${filterState.cam ? window.UI.esc(filterState.cam) : "Select..."}</span>
                                            <span class="ant-select-arrow">
                                                <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                                </svg>
                                            </span>
                                        </div>
                                    </div>

                                    <div class="form-group">
                                        <label class="label-uhdLaM minWidth-d4JjCT">Valid From/To</label>
                                        <div class="datepicker-t5AVY9">
                                            <input type="text" data-filter="validFrom" value="${filterState.validFrom}" placeholder="YYYY-MM-DD" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                                            </svg>
                                        </div>
                                        <div class="datepicker-t5AVY9">
                                            <input type="text" data-filter="validTo" value="${filterState.validTo}" placeholder="YYYY-MM-DD" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'">
                                            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                <button class="clear-all-link-btn" data-act="clear-all-filters" ${hasFilters ? "" : "disabled"}>
                                    Clear All Filters
                                </button>
                            </div>
                        </aside>

                        <!-- Main Content Unified Card -->
                        <section class="content-table contentTable-_531TS">
                            <div class="flex-column tableContainer-GCJvcD">
                                <div class="flex-align-center tableHeader-aYWNqq" data-testid="table-header">
                                    <div class="flex-justify-center inputContainer-Lxo7RH tableHeaderSearch-w9kvHg">
                                        <div class="searchInputWrapper-cEb63H">
                                            <div class="container-FyufBC">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" color="#666666">
                                                    <path fill="currentColor" d="M4.5 10a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M10 3a7 7 0 1 0 4.391 12.452l5.329 5.328a.75.75 0 1 0 1.06-1.06l-5.328-5.329A7 7 0 0 0 10 3"></path>
                                                </svg>
                                                <input class="input-YKgOhO inputSearch-HCZijN hasIcon-usp3ch" placeholder="Search here" type="text" value="${window.UI.esc(filterState.search)}" id="search-here-input">
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex-align-center tableHeaderActions-UTWWUF" data-testid="table-header-actions">
                                        ${isCust ? `
                                            <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="create-contract" data-testid="contracts-add-button">
                                                <span class="flex-align-center label-FlMxDR">+ Add new contract</span>
                                            </button>
                                        ` : ""}
                                    </div>
                                </div>

                                <div class="tableWrapper-VDyaTh">
                                    <table class="table-egCV_Z striped-S6C7kO hoverable-e_h2L2 table table-cRCr7j">
                                        <thead>
                                            <tr>
                                                <th style="min-width: 50px; width: 50px;">No</th>
                                                <th># of Pricebooks</th>
                                                <th style="min-width: 200px; width: 200px;">Contract Description</th>
                                                <th style="min-width: 200px; width: 200px;">Contract owner name</th>
                                                <th>${isCust ? "Supplier" : "Customer"}</th>
                                                <th>CAM name</th>
                                                <th style="min-width: 200px; width: 200px;">External contract #</th>
                                                <th>Region</th>
                                                <th>Department</th>
                                                <th>Valid to</th>
                                                <th>Status</th>
                                                <th style="min-width: 50px; width: 50px;"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${pageRows.length === 0 ? `
                                                <tr>
                                                    <td colspan="12" style="text-align:center;padding:60px 20px;color:#6b7280;background:#fff;">
                                                        No contracts match the selected filter criteria.
                                                    </td>
                                                </tr>
                                            ` : pageRows.map((c, idx) => {
                                                const st = (c.status || "Active").toLowerCase();
                                                let chipClass = "chip-Dqdeip success-BmS3ka";
                                                if (st === "expired" || st === "disabled") chipClass = "chip-Dqdeip error-yVmMN_";
                                                else if (st === "upcoming") chipClass = "chip-Dqdeip warning-status";

                                                return `
                                                    <tr data-act="open-ctr" data-id="${c.id}">
                                                        <td style="min-width: 50px; width: 50px;">${startIdx + idx + 1}</td>
                                                        <td style="min-width: 140px; width: 140px;">${c.pricebook_count || 1}</td>
                                                        <td style="min-width: 200px; width: 200px; font-weight: 500; color: #111827;">${window.UI.esc(c.description || "—")}</td>
                                                        <td style="min-width: 200px; width: 200px;">${window.UI.esc(c.procurement_contract_owner || "—")}</td>
                                                        <td style="min-width: 150px; width: 150px; color: #111827; font-weight: 500;">${window.UI.esc(isCust ? c.supplier : c.customer)}</td>
                                                        <td style="min-width: 150px; width: 150px;">${window.UI.esc(c.cam_name || "—")}</td>
                                                        <td style="min-width: 200px; width: 200px;">${window.UI.esc(c.external_id || "—")}</td>
                                                        <td style="min-width: 120px; width: 120px;">${window.UI.esc(c.region || "—")}</td>
                                                        <td style="min-width: 150px; width: 150px;">${window.UI.esc(c.department || "—")}</td>
                                                        <td style="min-width: 140px; width: 140px;">${window.UI.esc(c.valid_to || "—")}</td>
                                                        <td style="min-width: 130px; width: 130px;">
                                                            <div class="${chipClass}">${window.UI.esc(c.status || "Active")}</div>
                                                        </td>
                                                        <td style="min-width: 50px; width: 50px;" onclick="event.stopPropagation();">
                                                            <div class="flex-center columnIcon-bNHQ11">
                                                                <button class="trigger-Z_D8XQ" data-act="ctr-options" data-id="${c.id}" aria-label="More options">
                                                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="#121212" xmlns="http://www.w3.org/2000/svg">
                                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.66675 7.99996C6.66675 7.26358 7.2637 6.66663 8.00008 6.66663C8.73646 6.66663 9.33341 7.26358 9.33341 7.99996C9.33341 8.73634 8.73646 9.33329 8.00008 9.33329C7.2637 9.33329 6.66675 8.73634 6.66675 7.99996Z" fill="#121212"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.66675 3.33333C6.66675 2.59695 7.2637 2 8.00008 2C8.73646 2 9.33341 2.59695 9.33341 3.33333C9.33341 4.06971 8.73646 4.66667 8.00008 4.66667C7.2637 4.66667 6.66675 4.06971 6.66675 3.33333Z" fill="#121212"></path>
                                                                        <path fill-rule="evenodd" clip-rule="evenodd" d="M6.66675 12.6667C6.66675 11.9303 7.2637 11.3334 8.00008 11.3334C8.73646 11.3334 9.33341 11.9303 9.33341 12.6667C9.33341 13.4031 8.73646 14 8.00008 14C7.2637 14 6.66675 13.4031 6.66675 12.6667Z" fill="#121212"></path>
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

                                <!-- Pagination Row -->
                                <div class="pagination-Qo0Zyp hasBackground-KRB3Nk" style="justify-content: flex-end;">
                                    <div class="pagination-controls">
                                        <button class="inline-flex-center navButton-ifUhzO" ${filterState.page <= 1 ? "disabled" : ""} data-act="prev-page" aria-label="Previous page">
                                            <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);">
                                                <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                                            </svg>
                                        </button>
                                        ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                                            <button class="pageButton-Ltt_aD ${p === filterState.page ? "active-paX3W6" : ""}" data-act="set-page" data-page="${p}">${p}</button>
                                        `).join("")}
                                        <button class="inline-flex-center navButton-ifUhzO" ${filterState.page >= totalPages ? "disabled" : ""} data-act="next-page" aria-label="Next page">
                                            <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(-90deg);">
                                                <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.800917 0.80019 0.800544 0.792682C0.800172 0.785345 0.81443 0.78074 0.842485 0.771295C0.870539 0.764515 0.911828 0.758363 0.963936 0.753198L6.71754 1.76798ZM13.9175 1.76798C14.0249 1.66154 14.1695 1.60115 14.3207 1.59966C14.4719 1.59817 14.6177 1.65568 14.7271 1.75998C14.7807 1.81078 14.8236 1.87183 14.8532 1.9395C14.8828 2.00718 14.8985 2.0801 14.8994 2.15395C14.9003 2.2278 14.8864 2.30108 14.8584 2.36945C14.8305 2.43782 14.7891 2.49989 14.7367 2.55198L9.37674 7.91758L15.0327 13.444C15.0857 13.4954 15.1278 13.557 15.1566 13.625C15.1854 13.693 15.2002 13.7661 15.2002 13.84C15.2002 13.9138 15.1854 13.9869 15.1566 14.055C15.1278 14.123 15.0857 14.1845 15.0327 14.236C14.9242 14.3412 14.779 14.4 14.6279 14.4C14.4768 14.4 14.3316 14.3412 14.2231 14.236L8.16794 8.31998C8.11531 8.26886 8.0734 8.20776 8.04465 8.14025C8.01591 8.07275 8.00092 8.00019 8.00055 7.92682C8.00017 7.85345 8.01443 7.78074 8.04249 7.71295C8.07054 7.64515 8.11183 7.58363 8.16394 7.53198L13.9175 1.76798Z" fill="#3A3A3A"></path>
                                            </svg>
                                        </button>
                                        <div class="flex-align-center selectorContainer-eqpsde">
                                            <span class="counter-H3K7Fj">Show</span>
                                            <div class="selector-jKTTze">
                                                <div class="ant-select select-l8uECl">
                                                    <select id="rows-per-page-select">
                                                        <option value="10" ${filterState.rowsPerPage === 10 ? "selected" : ""}>10 rows</option>
                                                        <option value="25" ${filterState.rowsPerPage === 25 ? "selected" : ""}>25 rows</option>
                                                        <option value="50" ${filterState.rowsPerPage === 50 ? "selected" : ""}>50 rows</option>
                                                    </select>
                                                    <span>${filterState.rowsPerPage} rows</span>
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
                window.UI.openModal({
                    title: "Contract Actions (" + id + ")",
                    bodyHtml: `
                        <div style="display:flex;flex-direction:column;gap:12px;">
                            <button class="btn btn-outline" style="text-align:left;padding:12px 16px;" onclick="window.location.hash='#/contracts/${id}';window.UI.closeModals();">
                                <strong>View Contract Details</strong>
                                <div style="font-size:12px;color:#6B7280;">Inspect pricebooks, KPIs, SPM supplier data, and reports</div>
                            </button>
                            <button class="btn btn-outline" style="text-align:left;padding:12px 16px;" onclick="window.ContractsListView.toggleContractStatus('${id}');window.UI.closeModals();">
                                <strong>Toggle Contract Status</strong>
                                <div style="font-size:12px;color:#6B7280;">Switch between Active and Disabled/Expired</div>
                            </button>
                        </div>`,
                    buttons: [{ label: "Close", cls: "btn-black", onClick: ov => ov.remove() }]
                });
            }
        });
    }

    function toggleContractStatus(id) {
        const contracts = window.Store.contracts();
        const c = contracts.find(x => x.id === id);
        if (c) {
            c.status = (c.status === "Active" ? "Expired" : "Active");
            window.Store.setContracts(contracts);
            window.UI.toast({ kind: "success", title: "Status Updated", body: `Contract ${id} status set to ${c.status}.` });
            window.Router.render();
        }
    }

    return { render, toggleContractStatus };
})();
