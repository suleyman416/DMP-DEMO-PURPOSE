/* ============================================================
   ctr-detail.js — 1:1 CTR Request Detail view (Customer & Supplier)
   Matching https://demov2.dmpservice.ai/contract/requests/procurement/:id
   ============================================================ */
window.CTRDetailView = (function () {

    const filterState = {
        sidebarCollapsed: false,
        heroCollapsed: false,
        requestTypes: new Set(),
        reviews: new Set(),
        uom: "",
        manufacturer: "",
        unspsc: "",
        priceChange: "",
        priceMin: "",
        priceMax: "",
        page: 1,
        rowsPerPage: 10,
        selectedItemIds: new Set()
    };

    function render(root, reqId, role) {
        if (!root) return;
        const id = String(reqId || "83");
        const r = window.Store.ctrRequestById(id) || {
            id: id,
            status: "Closed",
            supplier_name: "MRO AISEL",
            requested_by: "Aisel TEST",
            contract_description: "test contract",
            pricebook_number: "28",
            external_pricebook_number: "1234512",
            currency: "USD",
            cam_name: "Aisel Verdieva",
            contract_owner_name: "Aisel Verdieva",
            items_count: 81,
            approved_count: 81,
            pending_count: 0,
            disabled_count: 0,
            declined_count: 0
        };

        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);

        // Get items for this request
        let allItems = window.Store.ctrItemsByRequest(id);
        if (allItems.length === 0) {
            allItems = [
                { id: "ctr_itm_1", request_id: id, item_no: 1, request_type: "NEW", review: "Approved", has_comments: true, has_attachments: true, supplier_part_no: "CW290057_206", material_service_no: "11075489", part_extension: "", product_type: "MATERIAL", uom: "EA", manufacturer_name: "Schneider Electric", unspsc_code: "39121601", unit_price: 185.00 },
                { id: "ctr_itm_2", request_id: id, item_no: 2, request_type: "NEW", review: "Approved", has_comments: true, has_attachments: true, supplier_part_no: "CW290057_208", material_service_no: "36116960", part_extension: "", product_type: "MATERIAL", uom: "EA", manufacturer_name: "Schneider Electric", unspsc_code: "39121601", unit_price: 240.00 },
                { id: "ctr_itm_3", request_id: id, item_no: 3, request_type: "NEW", review: "Approved", has_comments: true, has_attachments: true, supplier_part_no: "CW290057_209", material_service_no: "11044906", part_extension: "", product_type: "MATERIAL", uom: "EA", manufacturer_name: "ABB", unspsc_code: "39121601", unit_price: 310.00 },
                { id: "ctr_itm_4", request_id: id, item_no: 4, request_type: "NEW", review: "Approved", has_comments: true, has_attachments: true, supplier_part_no: "CW290057_21", material_service_no: "11027996", part_extension: "", product_type: "MATERIAL", uom: "EA", manufacturer_name: "ABB", unspsc_code: "39121601", unit_price: 95.00 },
                { id: "ctr_itm_5", request_id: id, item_no: 5, request_type: "NEW", review: "Approved", has_comments: true, has_attachments: true, supplier_part_no: "CW290057_210", material_service_no: "36070852", part_extension: "", product_type: "MATERIAL", uom: "EA", manufacturer_name: "Siemens", unspsc_code: "39121601", unit_price: 520.00 }
            ];
        }

        // Apply filters
        let filteredItems = allItems.filter(item => {
            if (filterState.requestTypes.size > 0 && !filterState.requestTypes.has(item.request_type)) return false;
            if (filterState.reviews.size > 0 && !filterState.reviews.has(item.review)) return false;
            if (filterState.uom && item.uom !== filterState.uom) return false;
            if (filterState.manufacturer && item.manufacturer_name !== filterState.manufacturer) return false;
            if (filterState.unspsc && item.unspsc_code !== filterState.unspsc) return false;
            if (filterState.priceMin && Number(item.unit_price) < Number(filterState.priceMin)) return false;
            if (filterState.priceMax && Number(item.unit_price) > Number(filterState.priceMax)) return false;
            return true;
        });

        const totalItems = filteredItems.length;
        const totalPages = Math.max(1, Math.ceil(totalItems / filterState.rowsPerPage));
        if (filterState.page > totalPages) filterState.page = totalPages;
        const startIdx = (filterState.page - 1) * filterState.rowsPerPage;
        const paginatedItems = filteredItems.slice(startIdx, startIdx + filterState.rowsPerPage);

        const allSelected = paginatedItems.length > 0 && paginatedItems.every(i => filterState.selectedItemIds.has(i.id));

        root.innerHTML = `
            <div style="background:#FFFFFF; min-height:calc(100vh - 60px); font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
                
                <!-- Top Header Actions: < Back and Comments -->
                <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 28px 10px 28px;">
                    <button class="inline-flex-center button-z6sbMq backButton-rnKRBd link-xtI0I7 primary-wQbOYq" data-act="go-back" style="background:none; border:none; color:#111827; font-size:14px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:0;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
                        Back
                    </button>
                    <button class="inline-flex-center button-z6sbMq backButton-ciRELI solid-qA3WwL primary-wQbOYq" data-act="open-comments" style="background:none; border:none; color:#111827; font-size:14px; font-weight:500; cursor:pointer; display:inline-flex; align-items:center; gap:6px; padding:0;">
                        Comments
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                    </button>
                </div>

                <!-- Summary Metadata Hero -->
                <div style="padding:0 28px 12px 28px;">
                    <div style="background:#FFFFFF; border:none; padding:16px 20px; position:relative;">
                        ${!filterState.heroCollapsed ? `
                        <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:16px 40px; font-size:14px; color:#111827;">
                            <div>
                                <div style="margin-bottom:8px;"><strong>Request #:</strong> ${window.UI.esc(r.id)}</div>
                                <div style="margin-bottom:8px;"><strong>Supplier:</strong> ${window.UI.esc(r.supplier_name)}</div>
                                <div><strong>Requested by:</strong> ${window.UI.esc(r.requested_by || "Aisel TEST")}</div>
                            </div>
                            <div>
                                <div style="margin-bottom:8px;"><strong>Contract description:</strong> ${window.UI.esc(r.contract_description || "test contract")}</div>
                                <div style="margin-bottom:8px;"><strong>Pricebook #:</strong> ${window.UI.esc(r.pricebook_number || "28")}</div>
                                <div><strong>External pricebook number:</strong> ${window.UI.esc(r.external_pricebook_number || "1234512")}</div>
                            </div>
                            <div>
                                <div style="margin-bottom:8px;"><strong>Currency:</strong> ${window.UI.esc(r.currency || "USD")}</div>
                                <div style="margin-bottom:8px;"><strong>CAM name:</strong> ${window.UI.esc(r.cam_name || "Aisel Verdieva")}</div>
                                <div><strong>Contract owner name:</strong> ${window.UI.esc(r.contract_owner_name || "Aisel Verdieva")}</div>
                            </div>
                        </div>
                        ` : ""}
                        <!-- Collapse Chevron -->
                        <div style="text-align:center; margin-top:8px;">
                            <button data-act="toggle-hero" style="background:none; border:none; cursor:pointer; color:#6B7280; padding:4px;" title="${filterState.heroCollapsed ? "Expand" : "Collapse"}">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="transform:${filterState.heroCollapsed ? "rotate(180deg)" : "none"}; transition:transform 0.2s;"><polyline points="18 15 12 9 6 15"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                <div style="height:1px; background:#E5E7EB; width:100%;"></div>

                <!-- Body Layout: Sidebar + Main Content -->
                <div style="display:flex; min-height:550px;">
                    
                    <!-- Filter Sidebar -->
                    <aside style="width:${filterState.sidebarCollapsed ? "44px" : "260px"}; min-width:${filterState.sidebarCollapsed ? "44px" : "260px"}; border-right:1px solid #E5E7EB; padding:${filterState.sidebarCollapsed ? "12px 6px" : "20px 18px"}; box-sizing:border-box; transition:width 0.2s; position:relative;">
                        <div style="display:flex; justify-content:${filterState.sidebarCollapsed ? "center" : "flex-end"}; margin-bottom:14px;">
                            <button class="fc-collapse" data-act="toggle-sidebar" style="background:none; border:none; cursor:pointer; color:#6B7280; font-size:16px; padding:2px;" title="${filterState.sidebarCollapsed ? "Expand filters" : "Collapse filters"}">
                                ${filterState.sidebarCollapsed ? "»" : "«"}
                            </button>
                        </div>

                        ${!filterState.sidebarCollapsed ? `
                        <div style="display:flex; flex-direction:column; gap:18px;">
                            <!-- Request Type -->
                            <div>
                                <label style="font-size:13px; font-weight:600; color:#111827; display:block; margin-bottom:8px;">Request Type</label>
                                <div style="display:flex; flex-direction:column; gap:6px; font-size:13px; color:#374151;">
                                    ${["New", "Updated", "Disable"].map(rt => `
                                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                                            <input type="checkbox" data-filter="req-type" value="${rt.toUpperCase()}" ${filterState.requestTypes.has(rt.toUpperCase()) ? "checked" : ""}>
                                            ${rt}
                                        </label>
                                    `).join("")}
                                </div>
                            </div>

                            <!-- Review -->
                            <div>
                                <label style="font-size:13px; font-weight:600; color:#111827; display:block; margin-bottom:8px;">Review</label>
                                <div style="display:flex; flex-direction:column; gap:6px; font-size:13px; color:#374151;">
                                    ${["Approved", "Pending", "Disabled", "Declined"].map(rev => `
                                        <label style="display:flex; align-items:center; gap:8px; cursor:pointer;">
                                            <input type="checkbox" data-filter="review" value="${rev}" ${filterState.reviews.has(rev) ? "checked" : ""}>
                                            ${rev}
                                        </label>
                                    `).join("")}
                                </div>
                            </div>

                            <!-- UOM -->
                            <div>
                                <label style="font-size:13px; font-weight:600; color:#111827; display:block; margin-bottom:6px;">UOM</label>
                                <select data-filter="uom" style="width:100%; height:36px; border:1px solid #D1D5DB; border-radius:4px; padding:0 10px; font-size:13px; color:#374151; background:#FFF;">
                                    <option value="">Select...</option>
                                    <option value="EA" ${filterState.uom === "EA" ? "selected" : ""}>EA</option>
                                    <option value="SET" ${filterState.uom === "SET" ? "selected" : ""}>SET</option>
                                </select>
                            </div>

                            <!-- Manufacturer Name -->
                            <div>
                                <label style="font-size:13px; font-weight:600; color:#111827; display:block; margin-bottom:6px;">Manufacturer Name</label>
                                <select data-filter="manufacturer" style="width:100%; height:36px; border:1px solid #D1D5DB; border-radius:4px; padding:0 10px; font-size:13px; color:#374151; background:#FFF;">
                                    <option value="">Select...</option>
                                    <option value="Schneider Electric" ${filterState.manufacturer === "Schneider Electric" ? "selected" : ""}>Schneider Electric</option>
                                    <option value="ABB" ${filterState.manufacturer === "ABB" ? "selected" : ""}>ABB</option>
                                    <option value="Siemens" ${filterState.manufacturer === "Siemens" ? "selected" : ""}>Siemens</option>
                                </select>
                            </div>

                            <!-- UNSPSC Code -->
                            <div>
                                <label style="font-size:13px; font-weight:600; color:#111827; display:block; margin-bottom:6px;">UNSPSC Code</label>
                                <select data-filter="unspsc" style="width:100%; height:36px; border:1px solid #D1D5DB; border-radius:4px; padding:0 10px; font-size:13px; color:#374151; background:#FFF;">
                                    <option value="">Select...</option>
                                    <option value="39121601" ${filterState.unspsc === "39121601" ? "selected" : ""}>39121601</option>
                                </select>
                            </div>

                            <!-- Price Change -->
                            <div>
                                <label style="font-size:13px; font-weight:600; color:#111827; display:block; margin-bottom:6px;">Price Change</label>
                                <select data-filter="price-change" style="width:100%; height:36px; border:1px solid #D1D5DB; border-radius:4px; padding:0 10px; font-size:13px; color:#374151; background:#FFF;">
                                    <option value="">Select...</option>
                                    <option value="0%" ${filterState.priceChange === "0%" ? "selected" : ""}>0%</option>
                                    <option value="increase" ${filterState.priceChange === "increase" ? "selected" : ""}>Price Increase</option>
                                    <option value="decrease" ${filterState.priceChange === "decrease" ? "selected" : ""}>Price Decrease</option>
                                </select>
                            </div>

                            <!-- Price Range -->
                            <div>
                                <label style="font-size:13px; font-weight:600; color:#111827; display:block; margin-bottom:6px;">Price Range</label>
                                <div style="display:flex; align-items:center; gap:6px;">
                                    <input type="text" placeholder="$ 38.44" value="${filterState.priceMin}" id="ctr-price-min" style="width:70px; height:36px; border:1px solid #D1D5DB; border-radius:4px; padding:0 8px; font-size:13px;">
                                    <input type="text" placeholder="$ 1216" value="${filterState.priceMax}" id="ctr-price-max" style="width:70px; height:36px; border:1px solid #D1D5DB; border-radius:4px; padding:0 8px; font-size:13px;">
                                    <button class="inline-flex-center button-z6sbMq priceRangeBtn-_vUgoG solid-qA3WwL primary-wQbOYq" data-act="apply-price-range" style="height:36px; padding:0 14px; background:#111827; color:#FFF; border:none; border-radius:4px; font-size:13px; font-weight:500; cursor:pointer;">Go</button>
                                </div>
                            </div>

                            <!-- Clear All Filters -->
                            <div style="margin-top:10px;">
                                <button class="inline-flex-center button-z6sbMq w-full link-xtI0I7 success-U99qXn" data-act="clear-all-filters" style="background:none; border:none; color:#10B981; font-size:13px; font-weight:600; cursor:pointer; padding:8px 0; width:100%; text-align:center;">
                                    Clear All Filters
                                </button>
                            </div>
                        </div>
                        ` : ""}
                    </aside>

                    <!-- Main Table Area -->
                    <main style="flex:1; padding:20px 28px; overflow-x:auto;">
                        
                        <!-- Header Action Bar: Disable button + Counts badges -->
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                            <div>
                                <button class="inline-flex-center button-z6sbMq disabledButtonDisable-Ao7e0j solid-qA3WwL primary-wQbOYq" data-act="disable-selected" style="height:34px; padding:0 14px; background:#F9FAFB; border:1px solid #D1D5DB; border-radius:6px; color:${filterState.selectedItemIds.size > 0 ? "#111827" : "#9CA3AF"}; font-size:13px; font-weight:500; cursor:${filterState.selectedItemIds.size > 0 ? "pointer" : "default"}; display:inline-flex; align-items:center; gap:6px;">
                                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    Disable
                                </button>
                            </div>
                            <div style="display:flex; align-items:center; gap:20px; font-size:12.5px; color:#4B5563;">
                                <span># of items: <strong>${r.items_count || 81}</strong></span>
                                <span>Approved items: <strong>${r.approved_count || 81}</strong></span>
                                <span>Pending items: <strong>${r.pending_count || 0}</strong></span>
                                <span>Disabled items: <strong>${r.disabled_count || 0}</strong></span>
                                <span>Declined items: <strong>${r.declined_count || 0}</strong></span>
                            </div>
                        </div>

                        <!-- Table -->
                        <div style="border:1px solid #E5E7EB; border-radius:6px; overflow:hidden; background:#FFFFFF;">
                            <table class="data-table" style="width:100%; border-collapse:collapse; font-size:13px; text-align:left;">
                                <thead>
                                    <tr style="background:#FAFAFA; border-bottom:1px solid #E5E7EB; height:44px;">
                                        <th style="width:40px; padding:0 12px; text-align:center;">
                                            <input type="checkbox" data-act="select-all" ${allSelected ? "checked" : ""}>
                                        </th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">No</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Request Type</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Review</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Comments & Attachments</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Supplier Part #</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Material/Service #</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Part # Extension</th>
                                        <th style="padding:0 12px; font-weight:600; color:#374151;">Product Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${paginatedItems.map(itm => {
                                        const isSelected = filterState.selectedItemIds.has(itm.id);
                                        return `
                                            <tr style="border-bottom:1px solid #F3F4F6; height:54px; background:${isSelected ? "#F9FAFB" : "transparent"};">
                                                <td style="padding:0 12px; text-align:center;">
                                                    <input type="checkbox" data-act="toggle-item-select" data-id="${itm.id}" ${isSelected ? "checked" : ""}>
                                                </td>
                                                <td style="padding:0 12px; color:#374151;">${itm.item_no}</td>
                                                <td style="padding:0 12px;">
                                                    <span style="background:#DCFCE7; color:#15803D; font-size:11.5px; font-weight:700; padding:4px 10px; border-radius:4px; letter-spacing:0.5px;">${itm.request_type || "NEW"}</span>
                                                </td>
                                                <td style="padding:0 12px;">
                                                    <span style="display:inline-flex; align-items:center; gap:6px; font-weight:500; color:#111827;">
                                                        <span style="width:8px; height:8px; border-radius:50%; background:#10B981; display:inline-block;"></span>
                                                        ${itm.review || "Approved"}
                                                    </span>
                                                </td>
                                                <td style="padding:0 12px;">
                                                    <div style="display:flex; align-items:center; gap:10px;">
                                                        <button class="icon-btn" data-act="view-item-comment" data-id="${itm.id}" style="background:none; border:none; cursor:pointer; color:#6B7280; padding:4px;" title="View comments">
                                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                                                        </button>
                                                        <button class="icon-btn" data-act="view-item-attachment" data-id="${itm.id}" style="background:none; border:none; cursor:pointer; color:#6B7280; padding:4px;" title="View attachments">
                                                            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                                <td style="padding:0 12px; font-weight:500; color:#111827;">${window.UI.esc(itm.supplier_part_no)}</td>
                                                <td style="padding:0 12px; color:#374151;">${window.UI.esc(itm.material_service_no)}</td>
                                                <td style="padding:0 12px; color:#6B7280;">${window.UI.esc(itm.part_extension || "—")}</td>
                                                <td style="padding:0 12px; color:#374151;">${window.UI.esc(itm.product_type || "MATERIAL")}</td>
                                            </tr>
                                        `;
                                    }).join("")}
                                </tbody>
                            </table>
                        </div>

                        <!-- Bottom Action Bar: Accept / Decline, Pagination, Proceed further -->
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:20px; flex-wrap:wrap; gap:16px;">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <button class="inline-flex-center button-z6sbMq buttonBase-FUP1np buttonDisabled-CZ9e_m solid-qA3WwL primary-wQbOYq" data-act="accept-selected" style="height:38px; padding:0 20px; border-radius:6px; font-size:13px; font-weight:500; cursor:${filterState.selectedItemIds.size > 0 ? "pointer" : "default"}; background:${filterState.selectedItemIds.size > 0 ? "#111827" : "#F3F4F6"}; color:${filterState.selectedItemIds.size > 0 ? "#FFFFFF" : "#9CA3AF"}; border:none;">
                                    Accept
                                </button>
                                <button class="inline-flex-center button-z6sbMq buttonBase-FUP1np buttonDisabled-CZ9e_m outlined-BxCqIc primary-wQbOYq" data-act="decline-selected" style="height:38px; padding:0 20px; border-radius:6px; font-size:13px; font-weight:500; cursor:${filterState.selectedItemIds.size > 0 ? "pointer" : "default"}; background:#FFFFFF; color:${filterState.selectedItemIds.size > 0 ? "#EF4444" : "#9CA3AF"}; border:1px solid ${filterState.selectedItemIds.size > 0 ? "#FCA5A5" : "#E5E7EB"};">
                                    Decline
                                </button>
                            </div>

                            <!-- Pagination -->
                            <div style="display:flex; align-items:center; gap:8px;">
                                <button class="inline-flex-center button-z6sbMq flex-center navButton-ifUhzO solid-qA3WwL primary-wQbOYq" data-act="prev-page" ${filterState.page <= 1 ? "disabled" : ""} style="background:none; border:none; cursor:${filterState.page <= 1 ? "default" : "pointer"}; color:${filterState.page <= 1 ? "#D1D5DB" : "#111827"}; font-size:16px; padding:4px 8px;">‹</button>
                                ${Array.from({ length: Math.min(5, totalPages) }, (_, idx) => idx + 1).map(p => `
                                    <button class="inline-flex-center button-z6sbMq flex-center pageButton-Ltt_aD ${p === filterState.page ? "active-paX3W6" : ""} solid-qA3WwL primary-wQbOYq" data-act="set-page" data-page="${p}" style="min-width:32px; height:32px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; border:1px solid ${p === filterState.page ? "#84CC16" : "transparent"}; background:${p === filterState.page ? "#ECFCCB" : "transparent"}; color:${p === filterState.page ? "#3F6212" : "#374151"};">
                                        ${p}
                                    </button>
                                `).join("")}
                                ${totalPages > 5 ? `<span style="color:#6B7280; font-size:13px;">...</span><button class="inline-flex-center button-z6sbMq flex-center pageButton-Ltt_aD solid-qA3WwL primary-wQbOYq" data-act="set-page" data-page="${totalPages}" style="min-width:32px; height:32px; border-radius:4px; font-size:13px; font-weight:600; cursor:pointer; border:none; background:transparent; color:#374151;">${totalPages}</button>` : ""}
                                <button class="inline-flex-center button-z6sbMq flex-center navButton-ifUhzO solid-qA3WwL primary-wQbOYq" data-act="next-page" ${filterState.page >= totalPages ? "disabled" : ""} style="background:none; border:none; cursor:${filterState.page >= totalPages ? "default" : "pointer"}; color:${filterState.page >= totalPages ? "#D1D5DB" : "#111827"}; font-size:16px; padding:4px 8px;">›</button>
                                <span style="font-size:12.5px; color:#6B7280; margin-left:8px;">Show
                                    <select id="ctr-detail-rows-select" style="height:32px; border:1px solid #D1D5DB; border-radius:4px; padding:0 8px; font-size:12.5px; color:#374151; margin-left:4px; background:#FFF;">
                                        ${[10, 25, 50].map(n => `<option value="${n}" ${filterState.rowsPerPage === n ? "selected" : ""}>${n} rows</option>`).join("")}
                                    </select>
                                </span>
                            </div>

                            <div>
                                <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="proceed-further" style="height:38px; padding:0 20px; background:#111827; color:#FFFFFF; border:none; border-radius:6px; font-size:13px; font-weight:600; cursor:pointer;">
                                    Proceed further
                                </button>
                            </div>
                        </div>

                    </main>
                </div>
            </div>
            ${window.UI.renderFeedbackBubble ? window.UI.renderFeedbackBubble() : ""}
        `;

        // Event Bindings
        root.querySelectorAll("input[data-filter='req-type']").forEach(chk => {
            chk.addEventListener("change", e => {
                if (e.target.checked) filterState.requestTypes.add(e.target.value);
                else filterState.requestTypes.delete(e.target.value);
                filterState.page = 1;
                render(root, reqId, role);
            });
        });

        root.querySelectorAll("input[data-filter='review']").forEach(chk => {
            chk.addEventListener("change", e => {
                if (e.target.checked) filterState.reviews.add(e.target.value);
                else filterState.reviews.delete(e.target.value);
                filterState.page = 1;
                render(root, reqId, role);
            });
        });

        const uomSel = root.querySelector("select[data-filter='uom']");
        if (uomSel) {
            uomSel.addEventListener("change", e => {
                filterState.uom = e.target.value;
                filterState.page = 1;
                render(root, reqId, role);
            });
        }

        const mfgSel = root.querySelector("select[data-filter='manufacturer']");
        if (mfgSel) {
            mfgSel.addEventListener("change", e => {
                filterState.manufacturer = e.target.value;
                filterState.page = 1;
                render(root, reqId, role);
            });
        }

        const unspscSel = root.querySelector("select[data-filter='unspsc']");
        if (unspscSel) {
            unspscSel.addEventListener("change", e => {
                filterState.unspsc = e.target.value;
                filterState.page = 1;
                render(root, reqId, role);
            });
        }

        const pcSel = root.querySelector("select[data-filter='price-change']");
        if (pcSel) {
            pcSel.addEventListener("change", e => {
                filterState.priceChange = e.target.value;
                filterState.page = 1;
                render(root, reqId, role);
            });
        }

        const rowsSelect = root.querySelector("#ctr-detail-rows-select");
        if (rowsSelect) {
            rowsSelect.addEventListener("change", e => {
                filterState.rowsPerPage = parseInt(e.target.value, 10) || 10;
                filterState.page = 1;
                render(root, reqId, role);
            });
        }

        window.UI.bindActions(root, {
            "go-back": () => {
                window.location.hash = "#/requests";
            },
            "open-comments": () => {
                openCommentsModal(id);
            },
            "toggle-hero": () => {
                filterState.heroCollapsed = !filterState.heroCollapsed;
                render(root, reqId, role);
            },
            "toggle-sidebar": () => {
                filterState.sidebarCollapsed = !filterState.sidebarCollapsed;
                render(root, reqId, role);
            },
            "apply-price-range": () => {
                const min = root.querySelector("#ctr-price-min");
                const max = root.querySelector("#ctr-price-max");
                filterState.priceMin = min ? min.value.replace(/[^0-9.]/g, "") : "";
                filterState.priceMax = max ? max.value.replace(/[^0-9.]/g, "") : "";
                filterState.page = 1;
                render(root, reqId, role);
            },
            "clear-all-filters": () => {
                filterState.requestTypes.clear();
                filterState.reviews.clear();
                filterState.uom = "";
                filterState.manufacturer = "";
                filterState.unspsc = "";
                filterState.priceChange = "";
                filterState.priceMin = "";
                filterState.priceMax = "";
                filterState.page = 1;
                render(root, reqId, role);
            },
            "select-all": (t) => {
                if (allSelected) {
                    paginatedItems.forEach(i => filterState.selectedItemIds.delete(i.id));
                } else {
                    paginatedItems.forEach(i => filterState.selectedItemIds.add(i.id));
                }
                render(root, reqId, role);
            },
            "toggle-item-select": (t) => {
                const itmId = t.getAttribute("data-id");
                if (filterState.selectedItemIds.has(itmId)) {
                    filterState.selectedItemIds.delete(itmId);
                } else {
                    filterState.selectedItemIds.add(itmId);
                }
                render(root, reqId, role);
            },
            "view-item-comment": (t) => {
                const itmId = t.getAttribute("data-id");
                openItemCommentModal(itmId);
            },
            "view-item-attachment": (t) => {
                const itmId = t.getAttribute("data-id");
                window.UI.toast({ kind: "info", title: "Attachment", body: `Viewing technical datasheet attachment for item ${itmId}...` });
            },
            "disable-selected": () => {
                if (filterState.selectedItemIds.size === 0) return;
                const count = filterState.selectedItemIds.size;
                filterState.selectedItemIds.forEach(id => {
                    window.Store.updateCtrItem(id, { review: "Disabled" });
                });
                filterState.selectedItemIds.clear();
                window.UI.toast({ kind: "success", title: "Items Disabled", body: `${count} item(s) marked as Disabled.` });
                render(root, reqId, role);
            },
            "accept-selected": () => {
                if (filterState.selectedItemIds.size === 0) return;
                const count = filterState.selectedItemIds.size;
                filterState.selectedItemIds.forEach(id => {
                    window.Store.updateCtrItem(id, { review: "Approved" });
                });
                filterState.selectedItemIds.clear();
                window.UI.toast({ kind: "success", title: "Items Approved", body: `${count} item(s) approved.` });
                render(root, reqId, role);
            },
            "decline-selected": () => {
                if (filterState.selectedItemIds.size === 0) return;
                const count = filterState.selectedItemIds.size;
                filterState.selectedItemIds.forEach(id => {
                    window.Store.updateCtrItem(id, { review: "Declined" });
                });
                filterState.selectedItemIds.clear();
                window.UI.toast({ kind: "info", title: "Items Declined", body: `${count} item(s) declined.` });
                render(root, reqId, role);
            },
            "proceed-further": () => {
                window.UI.toast({ kind: "success", title: "Proceed Further", body: `Changes for Request #${id} submitted successfully.` });
                setTimeout(() => {
                    window.location.hash = "#/requests";
                }, 1000);
            },
            "prev-page": () => {
                if (filterState.page > 1) {
                    filterState.page -= 1;
                    render(root, reqId, role);
                }
            },
            "next-page": () => {
                if (filterState.page < totalPages) {
                    filterState.page += 1;
                    render(root, reqId, role);
                }
            },
            "set-page": (t) => {
                const p = parseInt(t.getAttribute("data-page"), 10);
                if (p && p !== filterState.page) {
                    filterState.page = p;
                    render(root, reqId, role);
                }
            }
        });
    }

    function openCommentsModal(reqId) {
        window.UI.openModal({
            title: `Request #${reqId} Comments`,
            bodyHtml: `
                <div style="font-size:13.5px; color:#374151;">
                    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:6px; padding:12px; margin-bottom:12px;">
                        <div style="font-weight:600; color:#111827; margin-bottom:4px;">Aisel TEST (Supplier) <span style="font-weight:400; font-size:12px; color:#6B7280;">• 2026-04-27 07:02:02</span></div>
                        <div>Please review the proposed contract pricebook revision including Schneider Electric and ABB material additions.</div>
                    </div>
                    <div style="background:#F0FDF4; border:1px solid #BBF7D0; border-radius:6px; padding:12px; margin-bottom:16px;">
                        <div style="font-weight:600; color:#166534; margin-bottom:4px;">Aisel Verdieva (Procurement) <span style="font-weight:400; font-size:12px; color:#16a34a;">• 2026-04-27 07:06:48</span></div>
                        <div>Prices accepted as per framework escalation clauses. Proceeding with system update.</div>
                    </div>
                    <textarea placeholder="Write a response comment..." style="width:100%; height:70px; border:1px solid #D1D5DB; border-radius:6px; padding:8px 10px; font-size:13px; box-sizing:border-box;"></textarea>
                </div>
            `,
            footerHtml: `
                <div style="display:flex; justify-content:flex-end; gap:8px;">
                    <button class="modal-close" style="height:36px; padding:0 16px; border:1px solid #D1D5DB; background:#FFF; border-radius:4px; font-size:13px; cursor:pointer;">Close</button>
                    <button id="btn-post-comment" style="height:36px; padding:0 16px; border:none; background:#111827; color:#FFF; border-radius:4px; font-size:13px; font-weight:500; cursor:pointer;">Post Comment</button>
                </div>
            `
        });
        const postBtn = document.getElementById("btn-post-comment");
        if (postBtn) {
            postBtn.onclick = () => {
                window.UI.closeModal();
                window.UI.toast({ kind: "success", title: "Comment Posted", body: "Your comment was recorded." });
            };
        }
    }

    function openItemCommentModal(itemId) {
        window.UI.openModal({
            title: `Item ${itemId} Notes & Discussion`,
            bodyHtml: `
                <div style="font-size:13px; color:#374151;">
                    <p style="margin-bottom:8px;">Item-level technical specifications, warranty terms, and price verification remarks.</p>
                    <div style="background:#F9FAFB; border:1px solid #E5E7EB; border-radius:4px; padding:10px; margin-bottom:12px;">
                        <strong>Technical Compliance:</strong> Meets Class 1 Div 2 hazardous area specifications.
                    </div>
                </div>
            `,
            footerHtml: `
                <div style="display:flex; justify-content:flex-end;">
                    <button class="modal-close" style="height:34px; padding:0 14px; border:1px solid #D1D5DB; background:#FFF; border-radius:4px; font-size:13px; cursor:pointer;">Close</button>
                </div>
            `
        });
    }

    return { render };
})();
