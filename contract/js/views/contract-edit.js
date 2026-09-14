/* ============================================================
   views/contract-edit.js — Contract edit form
   1-to-1 exact match with live demov2 (/contract/contracts/edit/:id)
   ============================================================ */
window.ContractEditView = (function () {

    function render(root, contractId) {
        const me = window.Store.currentUser();
        const allContracts = window.Store.contracts() || [];
        const contract = allContracts.find(c => String(c.id) === String(contractId)) || allContracts[0];

        if (!contract) {
            root.innerHTML = `<div style="padding:40px;text-align:center;"><h3>Contract Not Found</h3><p>Could not find contract with ID ${window.UI.esc(contractId)}</p></div>`;
            return;
        }

        const regions = ["ANG", "AGT", "AME", "APAC", "EMEA"];
        const departments = [
            "Risk Management",
            "Maintenance & Reliability",
            "Drilling Operations",
            "Mechanical & Piping",
            "Electrical & Instrumentation",
            "HSE & General Services"
        ];

        root.innerHTML = `
            <div class="content-TnO62i" style="padding: 24px 32px; max-width: 1400px; margin: 0 auto;">
                <div class="backContainer-C5JwWn" style="margin-bottom: 24px;">
                    <button class="inline-flex-center button-z6sbMq backButton-rnKRBd link-xtI0I7 primary-wQbOYq" data-act="go-back" style="background:none;border:none;cursor:pointer;display:inline-flex;align-items:center;gap:8px;font-size:14px;color:#111827;padding:0;font-weight:500;">
                        <span class="inline-flex-center icon-RnIvzq prefix-LNGAsl">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M15 18l-6-6 6-6"/>
                            </svg>
                        </span>
                        <span class="flex-align-center label-FlMxDR">Back</span>
                    </button>
                </div>

                <form class="form-XpEBZm" id="edit-contract-form" data-testid="contracts-edit-form">
                    <h1 class="typography-URURkd h6-MQAZXu title-QhK2vn" data-testid="contracts-edit-title" style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 28px 0;">Edit contract</h1>
                    
                    <div class="formGrid-PTja0j" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px 32px;">
                        <!-- Row 1 -->
                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV" style="font-size:13px;font-weight:500;color:#374151;">Supplier Name</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO form-input" style="width:100%;height:40px;background:#F5F5F5;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;color:#595959;cursor:not-allowed;" disabled type="text" name="supplier" value="${window.UI.esc(contract.supplier || '')}">
                            </div>
                        </div>

                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* Contract approved value</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO form-input" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;" placeholder="Enter value" name="approved_value" type="number" step="0.01" value="${contract.approved_value || 18990}" required>
                            </div>
                        </div>

                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* Contract owner name</label>
                            <div class="w-full">
                                <div class="flex-align-center w-full container-QeH3tG" style="position:relative;display:flex;align-items:center;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" style="position:absolute;left:12px;">
                                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                    <input placeholder="Search contract owner" name="procurement_contract_owner" class="autocomplete-wkwDMM form-input" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 36px 0 36px;" type="text" value="${window.UI.esc(contract.procurement_contract_owner || '')}" required>
                                    <button type="button" style="position:absolute;right:10px;background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:14px;" onclick="this.previousElementSibling.value='';">✕</button>
                                </div>
                            </div>
                        </div>

                        <!-- Row 2 -->
                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* External contract #</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO form-input" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;" placeholder="Enter contract number" name="external_id" type="text" value="${window.UI.esc(contract.external_id || '')}" required>
                            </div>
                        </div>

                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* CAM name</label>
                            <div class="w-full">
                                <div class="flex-align-center w-full container-QeH3tG" style="position:relative;display:flex;align-items:center;">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" style="position:absolute;left:12px;">
                                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                                    </svg>
                                    <input placeholder="Search CAM" name="cam_name" class="autocomplete-wkwDMM form-input" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 36px 0 36px;" type="text" value="${window.UI.esc(contract.cam_name || '')}" required>
                                    <button type="button" style="position:absolute;right:10px;background:none;border:none;cursor:pointer;color:#9CA3AF;font-size:14px;" onclick="this.previousElementSibling.value='';">✕</button>
                                </div>
                            </div>
                        </div>

                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* Contract description</label>
                            <div class="container-FyufBC">
                                <input class="input-YKgOhO form-input" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;" placeholder="Enter contract description" name="description" type="text" value="${window.UI.esc(contract.description || '')}" required>
                            </div>
                        </div>

                        <!-- Row 3 -->
                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* Contract start date</label>
                            <div class="datepicker-t5AVY9" style="position:relative;display:flex;align-items:center;">
                                <input type="date" name="valid_from" class="form-input" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;" value="${window.UI.esc(contract.valid_from || '')}" required>
                            </div>
                        </div>

                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* Contract end date</label>
                            <div class="datepicker-t5AVY9" style="position:relative;display:flex;align-items:center;">
                                <input type="date" name="valid_to" class="form-input" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;" value="${window.UI.esc(contract.valid_to || '')}" required>
                            </div>
                        </div>

                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV required-uOw3_8" style="font-size:13px;font-weight:500;color:#374151;">* Region</label>
                            <div class="select-wrapper" style="position:relative;">
                                <select name="region" class="form-select" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;background:#fff;" required>
                                    ${regions.map(r => `<option value="${r}" ${contract.region === r ? 'selected' : ''}>${r}</option>`).join('')}
                                </select>
                            </div>
                        </div>

                        <!-- Row 4 -->
                        <div class="form-group" style="display:flex;flex-direction:column;gap:8px;">
                            <label class="label-ZMZNIV" style="font-size:13px;font-weight:500;color:#374151;">Department</label>
                            <div class="select-wrapper" style="position:relative;">
                                <select name="department_name" class="form-select" style="width:100%;height:40px;border:1px solid #D9D9D9;border-radius:6px;padding:0 12px;background:#fff;">
                                    ${departments.map(d => `<option value="${d}" ${(contract.department || contract.department_name) === d ? 'selected' : ''}>${d}</option>`).join('')}
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Action Buttons -->
                    <div class="buttonGroup-G1YjMh" style="display:flex;align-items:center;gap:12px;margin-top:36px;">
                        <button class="inline-flex-center button-z6sbMq solid-qA3WwL" type="submit" data-testid="contracts-edit-save-button" style="background:#111827;color:#fff;border:none;border-radius:6px;padding:10px 24px;font-size:14px;font-weight:500;cursor:pointer;">
                            Save
                        </button>
                        <button class="inline-flex-center button-z6sbMq outlined-BxCqIc" type="button" data-act="go-back" data-testid="contracts-edit-cancel-button" style="background:#fff;color:#111827;border:1px solid #D1D5DB;border-radius:6px;padding:10px 24px;font-size:14px;font-weight:500;cursor:pointer;">
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
            ${window.UI.renderFeedbackBubble ? window.UI.renderFeedbackBubble() : ""}
        `;

        // Event handling
        const form = root.querySelector("#edit-contract-form");
        if (form) {
            form.addEventListener("submit", e => {
                e.preventDefault();
                const desc = form.description.value.trim();
                const ext = form.external_id.value.trim();
                const cam = form.cam_name.value.trim();
                const dept = form.department_name.value;
                const reg = form.region.value.trim();
                const val = parseFloat(form.approved_value.value);
                const vf = form.valid_from.value;
                const vt = form.valid_to.value;
                const owner = form.procurement_contract_owner.value.trim();

                window.Store.set(s => {
                    const idx = (s.contracts || []).findIndex(c => String(c.id) === String(contract.id));
                    if (idx !== -1) {
                        s.contracts[idx] = {
                            ...s.contracts[idx],
                            description: desc,
                            external_id: ext,
                            procurement_contract_owner: owner,
                            cam_name: cam,
                            department: dept,
                            department_name: dept,
                            region: reg,
                            approved_value: val,
                            valid_from: vf,
                            valid_to: vt
                        };
                    }
                });

                window.UI.toast({ kind: "success", title: "Contract Saved", body: `Contract ${contract.id} updated successfully.` });
                window.location.hash = "#/contracts";
            });
        }

        window.UI.bindActions(root, {
            "go-back": () => {
                window.location.hash = "#/contracts";
            }
        });
    }

    return { render };
})();
