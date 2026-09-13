/* ============================================================
   views/ctr-requests.js — Catalogue & Price Change Requests
   Full two-way lifecycle: Submit, Review, Approve/Reject, Notify
   ============================================================ */
window.CTRRequestsView = (function () {

    let statusFilter = "All";

    function render(root) {
        const me = window.Store.currentUser();
        const isCust = window.ContractWorkflow.isCustomer(me);
        let allRequests = window.Store.ctrRequests() || [];

        // Scoping
        if (!isCust) {
            allRequests = allRequests.filter(r => r.supplier === me.company);
        }

        // Status Filter
        const filtered = allRequests.filter(r => {
            if (statusFilter === "All") return true;
            return r.status === statusFilter;
        });

        const pendingCount = allRequests.filter(r => r.status === "Pending Review").length;
        const approvedCount = allRequests.filter(r => r.status === "Approved").length;
        const rejectedCount = allRequests.filter(r => r.status === "Rejected").length;

        root.innerHTML = `
            ${window.UI.renderBreadcrumbs([
                { label: "Contract", hash: "#/contracts" },
                { label: "CTR Requests", hash: "#/ctr-requests" }
            ])}

            <div class="main-content" style="max-width: 1400px; margin: 0 auto; padding: 20px 24px 40px;">
                <div class="toolbar" style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;">
                    <div>
                        <h1 style="font-size:22px;font-weight:700;color:#111827;">Catalogue & Price Change Requests (CTR)</h1>
                        <p style="color:#6b7280;font-size:13.5px;margin-top:3px;">Manage supplier-initiated price adjustments, indexation clauses, and line item revisions.</p>
                    </div>
                    <div style="display:flex;gap:10px;">
                        <button class="btn-black-add" data-act="open-new-ctr" style="font-size:13px;padding:0 18px;height:38px;">
                            + New CTR Request
                        </button>
                    </div>
                </div>

                <!-- Status Filter Tabs -->
                <div class="tabs-nav" style="margin-bottom:20px;">
                    <button class="tab-btn ${statusFilter === "All" ? "active" : ""}" data-status="All">
                        <span>All Requests</span>
                        <span class="tab-pill">${allRequests.length}</span>
                    </button>
                    <button class="tab-btn ${statusFilter === "Pending Review" ? "active" : ""}" data-status="Pending Review">
                        <span>Pending Review</span>
                        <span class="tab-pill" style="${pendingCount > 0 ? "background:#fef3c7;color:#92400e;border-color:#fde68a;" : ""}">${pendingCount}</span>
                    </button>
                    <button class="tab-btn ${statusFilter === "Approved" ? "active" : ""}" data-status="Approved">
                        <span>Approved</span>
                        <span class="tab-pill">${approvedCount}</span>
                    </button>
                    <button class="tab-btn ${statusFilter === "Rejected" ? "active" : ""}" data-status="Rejected">
                        <span>Rejected</span>
                        <span class="tab-pill">${rejectedCount}</span>
                    </button>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Request ID</th>
                                <th>Contract</th>
                                <th>Item Description</th>
                                <th>Supplier</th>
                                <th>Request Type</th>
                                <th style="text-align:right;">Current Price</th>
                                <th style="text-align:right;">Requested Price</th>
                                <th>Variance</th>
                                <th>Justification</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th style="text-align:center;">Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${filtered.length === 0 ? `
                                <tr><td colspan="12" style="text-align:center;padding:50px 20px;color:#6b7280;background:#fff;">No change requests match this filter.</td></tr>
                            ` : filtered.map(req => {
                                const diff = req.requested_price - req.current_price;
                                const pct = req.current_price > 0 ? ((diff / req.current_price) * 100).toFixed(1) : 0;
                                return `
                                <tr>
                                    <td><strong>${req.id}</strong></td>
                                    <td><a href="#/contracts/${req.contract_id}" class="cell-link" style="color:#111827;font-weight:600;text-decoration:none;">${req.contract_id}</a></td>
                                    <td style="font-weight:600;color:#111827;">${window.UI.esc(req.item_desc)}</td>
                                    <td>${window.UI.esc(req.supplier)}</td>
                                    <td><span class="badge badge-upcoming">${window.UI.esc(req.request_type)}</span></td>
                                    <td style="text-align:right;color:#6b7280;">${window.UI.money(req.current_price, req.currency)}</td>
                                    <td style="text-align:right;font-weight:700;color:${diff > 0 ? "var(--danger)" : "var(--primary-green)"};">
                                        ${window.UI.money(req.requested_price, req.currency)}
                                    </td>
                                    <td>
                                        <span class="status-pill ${diff > 0 ? "declined" : "active"}" style="font-size:11.5px;padding:2px 8px;">
                                            ${diff > 0 ? "+" : ""}${pct}%
                                        </span>
                                    </td>
                                    <td class="cell-muted" style="max-width:240px;white-space:normal;font-size:12.5px;">${window.UI.esc(req.justification)}</td>
                                    <td>${window.UI.statusBadge(req.status)}</td>
                                    <td><span class="cell-muted">${req.created_at}</span></td>
                                    <td style="text-align:center;">
                                        ${isCust && req.status === "Pending Review" ? `
                                            <div style="display:flex;gap:6px;justify-content:center;">
                                                <button class="btn btn-primary btn-sm" data-act="approve-req" data-id="${req.id}" style="background:var(--primary-green);color:#fff;border:none;border-radius:4px;padding:4px 12px;font-weight:600;cursor:pointer;">Approve</button>
                                                <button class="btn btn-outline btn-sm" data-act="reject-req" data-id="${req.id}" style="border:1px solid #ef4444;color:#ef4444;background:#fff;border-radius:4px;padding:4px 12px;font-weight:600;cursor:pointer;">Reject</button>
                                            </div>
                                        ` : `
                                            <span class="cell-muted" style="font-size:12px;">${req.status === "Approved" ? "✓ Applied" : (req.status === "Rejected" ? "✕ Declined" : "Awaiting Review")}</span>
                                        `}
                                    </td>
                                </tr>
                                `;
                            }).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        // Tab click events
        root.querySelectorAll(".tab-btn[data-status]").forEach(btn => {
            btn.addEventListener("click", () => {
                statusFilter = btn.getAttribute("data-status");
                render(root);
            });
        });

        window.UI.bindActions(root, {
            "open-new-ctr": () => {
                openCreateCTRModal(isCust, me, () => render(root));
            },
            "approve-req": (t) => {
                const rid = t.getAttribute("data-id");
                window.Store.set(s => {
                    const r = (s.ctr_requests || []).find(x => x.id === rid);
                    if (r) {
                        r.status = "Approved";
                        // update line item price in store
                        const it = (s.line_items || []).find(x => x.id === r.item_id);
                        if (it) it.unit_price = r.requested_price;

                        if (!s.notifications) s.notifications = [];
                        s.notifications.unshift({
                            id: "ntf_" + Date.now().toString(36),
                            title: "CTR Price Change Approved",
                            body: `Price for ${r.item_desc} updated to ${r.requested_price} ${r.currency}.`,
                            contractId: r.contract_id,
                            read: false,
                            ts: Date.now()
                        });
                    }
                });
                window.UI.toast({ kind: "success", title: "CTR Approved", body: "New catalogue price published and live." });
                render(root);
            },
            "reject-req": (t) => {
                const rid = t.getAttribute("data-id");
                const reason = prompt("Enter rejection rationale for supplier:", "Market benchmark exceeds target cap.");
                if (reason === null) return;

                window.Store.set(s => {
                    const r = (s.ctr_requests || []).find(x => x.id === rid);
                    if (r) {
                        r.status = "Rejected";
                        r.rejection_reason = reason;

                        if (!s.notifications) s.notifications = [];
                        s.notifications.unshift({
                            id: "ntf_" + Date.now().toString(36),
                            title: "CTR Price Change Declined",
                            body: `Price request for ${r.item_desc} was declined: ${reason}`,
                            contractId: r.contract_id,
                            read: false,
                            ts: Date.now()
                        });
                    }
                });
                window.UI.toast({ kind: "error", title: "CTR Declined", body: "Rejection notification sent to supplier partner." });
                render(root);
            }
        });
    }

    function openCreateCTRModal(isCust, me, cb) {
        const contracts = window.Store.contracts() || [];
        const availableContracts = isCust ? contracts : contracts.filter(c => c.supplier === me.company);
        const lineItems = window.Store.lineItems() || [];

        window.UI.openModal({
            title: "Submit Catalogue Price Revision Request (CTR)",
            wide: true,
            bodyHtml: `
                <form id="new-ctr-form" class="form-grid">
                    <div class="form-group col-span-2">
                        <label class="form-label">Select Associated Master Contract <span class="req">*</span></label>
                        <select class="form-select" name="contract_id" id="ctr-contract-select" required>
                            ${availableContracts.map(c => `
                                <option value="${c.id}">${c.id} — ${window.UI.esc(c.description)} (${window.UI.esc(c.supplier)})</option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="form-group col-span-2">
                        <label class="form-label">Select Catalogue Item <span class="req">*</span></label>
                        <select class="form-select" name="item_id" id="ctr-item-select" required>
                            ${lineItems.map(it => `
                                <option value="${it.id}" data-price="${it.unit_price}" data-cur="${it.currency}" data-pbid="${it.pricebook_id}">
                                    ${it.dmp_id} — ${window.UI.esc(it.customer_short_description)} (Current: ${it.unit_price} ${it.currency})
                                </option>
                            `).join("")}
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Request Type <span class="req">*</span></label>
                        <select class="form-select" name="request_type">
                            <option value="Price Revision Request">Price Revision Request</option>
                            <option value="Indexation Adjustment">Indexation Adjustment</option>
                            <option value="Raw Material Surcharge">Raw Material Surcharge</option>
                            <option value="Specification Update">Specification Update</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label class="form-label">Proposed New Unit Price <span class="req">*</span></label>
                        <input type="number" step="0.01" class="form-input" name="requested_price" placeholder="e.g. 520.00" required>
                    </div>

                    <div class="form-group col-span-2">
                        <label class="form-label">Commercial Rationale & Justification <span class="req">*</span></label>
                        <textarea class="form-textarea" name="justification" placeholder="Provide vendor cost breakdown, raw material index shift, or tariff adjustments" required style="height:80px;"></textarea>
                    </div>
                </form>
            `,
            buttons: [
                { label: "Cancel", cls: "btn-outline", onClick: ov => ov.remove() },
                {
                    label: "Submit Request",
                    cls: "btn-primary",
                    onClick: ov => {
                        const form = ov.querySelector("#new-ctr-form");
                        const cid = form.contract_id.value;
                        const iid = form.item_id.value;
                        const reqType = form.request_type.value;
                        const newP = parseFloat(form.requested_price.value);
                        const just = form.justification.value.trim();

                        if (!cid || !iid || isNaN(newP) || !just) {
                            alert("Please fill in all required fields.");
                            return;
                        }

                        const targetContract = window.Store.contractById(cid);
                        const targetItem = (window.Store.lineItems() || []).find(x => x.id === iid);

                        const newReqId = `CTR-REQ-${new Date().getFullYear()}-${Math.floor(Math.random()*9000 + 1000)}`;

                        window.Store.set(s => {
                            if (!s.ctr_requests) s.ctr_requests = [];
                            s.ctr_requests.unshift({
                                id: newReqId,
                                contract_id: cid,
                                pricebook_id: targetItem ? targetItem.pricebook_id : "PB-001",
                                item_id: iid,
                                item_desc: targetItem ? targetItem.customer_short_description : "MRO Part",
                                supplier: targetContract ? targetContract.supplier : me.company,
                                request_type: reqType,
                                requested_by: me.name,
                                current_price: targetItem ? targetItem.unit_price : 0,
                                requested_price: newP,
                                currency: targetItem ? targetItem.currency : "USD",
                                justification: just,
                                status: "Pending Review",
                                created_at: new Date().toISOString().slice(0, 10)
                            });

                            if (!s.notifications) s.notifications = [];
                            s.notifications.unshift({
                                id: "ntf_" + Date.now().toString(36),
                                title: "New CTR Request Submitted",
                                body: `${me.name} submitted a price revision (${newP} USD) for ${targetItem ? targetItem.customer_short_description : "part"}.`,
                                contractId: cid,
                                read: false,
                                ts: Date.now()
                            });
                        });

                        window.UI.toast({ kind: "success", title: "CTR Submitted", body: `Request ${newReqId} registered for customer review.` });
                        ov.remove();
                        cb();
                    }
                }
            ]
        });
    }

    return { render };
})();
