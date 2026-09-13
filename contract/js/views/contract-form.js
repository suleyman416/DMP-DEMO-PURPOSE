/* ============================================================
   views/contract-form.js — Contract creation form
   1-to-1 exact match with live DMP design reference
   ============================================================ */
window.ContractFormView = (function () {

    function render(root) {
        const me = window.Store.currentUser();
        if (!window.ContractWorkflow.canCreateContract(me)) {
            root.innerHTML = `<div style="padding:40px;text-align:center;"><h3>Access Restricted</h3><p>Only procurement customer roles can author new contracts.</p></div>`;
            return;
        }

        const users = window.Store.users() || [];
        const supplierUsers = users.filter(u => u.type === "supplier");
        const existingSuppliers = Array.from(new Set(
            (window.Store.contracts() || []).map(c => c.supplier)
            .concat(supplierUsers.map(u => u.company))
            .filter(Boolean)
        ));

        root.innerHTML = `
            <div class="content-TnO62i">
                <div class="backContainer-C5JwWn">
                    <button class="inline-flex-center button-z6sbMq backButton-rnKRBd link-xtI0I7 primary-wQbOYq" data-act="go-back">
                        <span class="inline-flex-center icon-RnIvzq prefix-LNGAsl">
                            <svg width="14" height="8" viewBox="0 0 16 8" fill="none" xmlns="http://www.w3.org/2000/svg" style="transform: rotate(90deg);">
                                <path d="M8.18605 6.59223L14.7311 0.223792C14.7839 0.171354 14.8465 0.129896 14.9154 0.101818C14.9842 0.0737404 15.058 0.0596004 15.1324 0.0602161C15.2067 0.0608319 15.2802 0.0761914 15.3486 0.105405C15.417 0.13462 15.479 0.177108 15.5308 0.230413C15.5827 0.283717 15.6235 0.34678 15.6508 0.41595C15.6782 0.48512 15.6915 0.559025 15.6901 0.633388C15.6887 0.707751 15.6725 0.781096 15.6426 0.849177C15.6126 0.917259 15.5695 0.978725 15.5156 1.03002L8.57833 7.78022C8.47332 7.88239 8.3326 7.93956 8.18609 7.93956C8.03958 7.93957 7.89885 7.88241 7.79383 7.78024L0.856138 1.03044C0.802276 0.97915 0.759123 0.917686 0.729173 0.849606C0.699222 0.781527 0.683072 0.708183 0.681653 0.63382C0.680235 0.559457 0.693579 0.485552 0.720912 0.41638C0.748245 0.347208 0.789024 0.284143 0.84089 0.230835C0.892757 0.177528 0.954682 0.135036 1.02308 0.105818C1.09147 0.0765998 1.16499 0.061236 1.23936 0.060616C1.31374 0.059996 1.38749 0.0741318 1.45637 0.102205C1.52524 0.130279 1.58787 0.171734 1.64061 0.224169L8.18605 6.59223Z" fill="currentColor"></path>
                            </svg>
                        </span>
                        <span class="flex-align-center label-FlMxDR">Back</span>
                    </button>
                </div>

                <form class="form-XpEBZm" id="new-contract-form" data-testid="contracts-create-form">
                    <span class="typography-URURkd h6-MQAZXu title-QhK2vn" data-testid="contracts-create-title">Create contract</span>
                    <div class="formGrid-PTja0j">
                        <!-- Col 1 -->
                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">Supplier</label>
                            <div class="w-full">
                                <div class="flex-align-center w-full container-QeH3tG" data-testid="contracts-create-supplier-autocomplete">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="searchIcon-RowzYk">
                                        <path fill="currentColor" d="M4.5 10a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M10 3a7 7 0 1 0 4.391 12.452l5.329 5.328a.75.75 0 1 0 1.06-1.06l-5.328-5.329A7 7 0 0 0 10 3"></path>
                                    </svg>
                                    <input placeholder="Search supplier" name="supplier" data-testid="contracts-create-supplier-autocomplete-input" class="autocomplete-wkwDMM" list="suppliers-datalist" value="${existingSuppliers[0] || "MRO AISEL"}" required>
                                    <datalist id="suppliers-datalist">
                                        ${existingSuppliers.map(s => `<option value="${window.UI.esc(s)}"></option>`).join("")}
                                    </datalist>
                                </div>
                            </div>
                        </div>

                        <!-- Col 2 -->
                        <div class="form-group">
                            <label class="label-ZMZNIV">Supplier ID</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO" placeholder="Enter supplier ID" disabled="" id="supplier-id-input" data-testid="contracts-create-supplier-id" type="text" value="SUP-001">
                            </div>
                        </div>

                        <!-- Col 3 -->
                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">Contract owner name</label>
                            <div class="w-full">
                                <div class="flex-align-center w-full container-QeH3tG" data-testid="contracts-create-contract-owner-autocomplete">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="searchIcon-RowzYk">
                                        <path fill="currentColor" d="M4.5 10a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M10 3a7 7 0 1 0 4.391 12.452l5.329 5.328a.75.75 0 1 0 1.06-1.06l-5.328-5.329A7 7 0 0 0 10 3"></path>
                                    </svg>
                                    <input placeholder="Search contract owner" name="procurement_contract_owner" data-testid="contracts-create-contract-owner-autocomplete-input" class="autocomplete-wkwDMM" type="text" value="${window.UI.esc(me.name)}" required>
                                </div>
                            </div>
                        </div>

                        <!-- Row 2 -->
                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">External contract #</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO" placeholder="Enter contract number" name="external_id" data-testid="contracts-create-external-id" type="text" value="${Math.floor(Math.random() * 899999 + 100000)}" required>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">CAM name</label>
                            <div class="w-full">
                                <div class="flex-align-center w-full container-QeH3tG" data-testid="contracts-create-cam-autocomplete">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" class="searchIcon-RowzYk">
                                        <path fill="currentColor" d="M4.5 10a5.5 5.5 0 1 1 11 0a5.5 5.5 0 0 1-11 0M10 3a7 7 0 1 0 4.391 12.452l5.329 5.328a.75.75 0 1 0 1.06-1.06l-5.328-5.329A7 7 0 0 0 10 3"></path>
                                    </svg>
                                    <input placeholder="Search CAM" name="cam_name" data-testid="contracts-create-cam-autocomplete-input" class="autocomplete-wkwDMM" type="text" value="${me.name === "Demo Customer" ? "Aisel Verdieva" : me.name}" required>
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">Contract description</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO" placeholder="Enter contract description" name="description" data-testid="contracts-create-description" type="text" value="Valve & Piping Framework Agreement" required>
                            </div>
                        </div>

                        <!-- Row 3 -->
                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">Contract start date</label>
                            <div class="datepicker-t5AVY9" data-testid="contracts-create-start-date">
                                <input type="text" name="valid_from" data-testid="contracts-create-start-date-input" value="2026-04-27" placeholder="YYYY-MM-DD" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'" required>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                                </svg>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">Contract end date</label>
                            <div class="datepicker-t5AVY9" data-testid="contracts-create-end-date">
                                <input type="text" name="valid_to" data-testid="contracts-create-end-date-input" value="2027-04-27" placeholder="YYYY-MM-DD" onfocus="(this.type='date')" onblur="if(!this.value)this.type='text'" required>
                                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M13.8 0L13.8 6M4.20003 0L4.20003 6M16.2 3L1.80003 3C1.13727 3 0.600025 3.53726 0.600025 4.2L0.600025 16.2C0.600025 16.8628 1.13727 17.4 1.80003 17.4L16.2 17.4C16.8628 17.4 17.4 16.8628 17.4 16.2L17.4 4.2C17.4 3.53726 16.8628 3 16.2 3Z" stroke="#666666"></path>
                                </svg>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">Contract approved value</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO" placeholder="Enter value" name="approved_value" data-testid="contracts-create-approved-value" type="number" step="0.01" value="18990" required>
                            </div>
                        </div>

                        <!-- Row 4 -->
                        <div class="form-group">
                            <label class="label-ZMZNIV required-uOw3_8">Region</label>
                            <div class="ant-select select-l8uECl" data-testid="contracts-create-region">
                                <select name="region" required>
                                    <option value="ANG" selected>ANG</option>
                                    <option value="AGT">AGT</option>
                                    <option value="AME">AME</option>
                                    <option value="APAC">APAC</option>
                                    <option value="EMEA">EMEA</option>
                                </select>
                                <span class="ant-select-selection-item">ANG</span>
                                <span class="ant-select-arrow">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="label-ZMZNIV">Department</label>
                            <div class="ant-select select-l8uECl" data-testid="contracts-create-department">
                                <select name="department_name">
                                    <option value="">Select department</option>
                                    <option value="Risk Management" selected>Risk Management</option>
                                    <option value="Maintenance & Reliability">Maintenance & Reliability</option>
                                    <option value="Drilling Operations">Drilling Operations</option>
                                    <option value="Mechanical & Piping">Mechanical & Piping</option>
                                    <option value="Electrical & Instrumentation">Electrical & Instrumentation</option>
                                    <option value="HSE & General Services">HSE & General Services</option>
                                </select>
                                <span class="ant-select-selection-item">Risk Management</span>
                                <span class="ant-select-arrow">
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1.5 1.75L6 6.25L10.5 1.75" stroke="#666666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div class="buttonGroup-G1YjMh">
                        <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" type="submit" data-testid="contracts-create-save-button">
                            <span class="flex-align-center label-FlMxDR">Save</span>
                        </button>
                        <button class="inline-flex-center button-z6sbMq outlined-BxCqIc primary-wQbOYq" type="button" data-act="go-back" data-testid="contracts-create-cancel-button">
                            <span class="flex-align-center label-FlMxDR">Cancel</span>
                        </button>
                    </div>
                </form>
            </div>
            ${window.UI.renderFeedbackBubble ? window.UI.renderFeedbackBubble() : ""}
        `;

        // Interactive select changes
        root.querySelectorAll(".ant-select select").forEach(sel => {
            sel.addEventListener("change", e => {
                const span = sel.parentElement.querySelector(".ant-select-selection-item");
                if (span) span.textContent = sel.options[sel.selectedIndex].text;
            });
        });

        // Autoupdate supplier ID if known
        const supInput = root.querySelector("input[name='supplier']");
        if (supInput) {
            supInput.addEventListener("input", e => {
                const s = e.target.value.trim();
                const supUser = (window.Store.users() || []).find(u => u.company === s);
                const idInput = root.querySelector("#supplier-id-input");
                if (idInput) idInput.value = supUser ? (supUser.id === "u_sup1" ? "5" : "7") : "5";
            });
        }

        const form = root.querySelector("#new-contract-form");
        form.addEventListener("submit", e => {
            e.preventDefault();
            const desc = form.description.value.trim();
            const ext = form.external_id.value.trim();
            const sup = form.supplier.value.trim();
            const cam = form.cam_name.value.trim();
            const dept = form.department_name.value;
            const reg = form.region.value.trim();
            const val = parseFloat(form.approved_value.value);
            const vf = form.valid_from.value;
            const vt = form.valid_to.value;
            const owner = form.procurement_contract_owner.value.trim();

            if (!desc || !ext || !sup || isNaN(val)) {
                alert("Please complete all required fields marked with *.");
                return;
            }

            const newId = `CTR-${new Date().getFullYear()}-${Math.floor(Math.random()*900 + 100)}`;
            const supUser = (window.Store.users() || []).find(u => u.company === sup);

            window.Store.set(s => {
                if (!s.contracts) s.contracts = [];
                s.contracts.unshift({
                    id: newId,
                    description: desc,
                    external_id: ext,
                    supplier: sup,
                    supplier_id: supUser ? supUser.id : "u_sup1",
                    customer: me.company || "DMP Demo Company",
                    customer_id: me.id,
                    procurement_contract_owner: owner || me.name,
                    cam_name: cam,
                    department: dept,
                    department_name: dept,
                    region: reg,
                    valid_from: vf,
                    valid_to: vt,
                    approved_value: val,
                    spent_value: 0,
                    currency: "USD",
                    status: "Active",
                    pricebook_count: 1,
                    pricebooks: [
                        {
                            id: "pb-" + Date.now().toString(36),
                            number: "PB-001",
                            description: "Master Pricebook for " + desc,
                            external_number: "EXT-" + Math.floor(Math.random()*9000+1000),
                            currency: "USD",
                            status: "Active",
                            items_count: 181,
                            created_at: new Date().toISOString()
                        }
                    ],
                    supplier_rating: {
                        overall: 9.0,
                        quality: 9.2,
                        delivery: 8.8,
                        commercial: 9.0,
                        hse: 9.5,
                        spend_weight: 0.1,
                        criticality: "Tier 1 - Critical",
                        due_diligence: "Approved"
                    }
                });

                if (!s.notifications) s.notifications = [];
                s.notifications.unshift({
                    id: "ntf_" + Date.now().toString(36),
                    title: "New Contract Created",
                    body: `${desc} (${newId}) created with ${sup}.`,
                    contractId: newId,
                    read: false,
                    ts: Date.now()
                });
            });

            window.UI.toast({
                kind: "success",
                title: "Contract Created",
                body: `Contract ${newId} saved successfully.`
            });
            window.location.hash = "#/contracts/" + newId;
        });

        window.UI.bindActions(root, {
            "go-back": () => { window.location.hash = "#/contracts"; }
        });
    }

    return { render };
})();

