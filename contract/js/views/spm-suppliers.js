/* ============================================================
   views/spm-suppliers.js — Supplier Performance Management
   ============================================================ */
window.SPMSuppliersView = (function () {

    function render(root) {
        const contracts = window.Store.contracts();

        // Group contracts by supplier
        const suppliersMap = {};
        contracts.forEach(c => {
            if (!suppliersMap[c.supplier]) {
                suppliersMap[c.supplier] = {
                    name: c.supplier,
                    contracts: [],
                    totalApproved: 0,
                    totalSpent: 0,
                    rating: c.supplier_rating || { overall: 9.0, quality: 9.0, delivery: 9.0, commercial: 9.0, hse: 9.0 }
                };
            }
            suppliersMap[c.supplier].contracts.push(c);
            suppliersMap[c.supplier].totalApproved += (c.approved_value || 0);
            suppliersMap[c.supplier].totalSpent += (c.spent_value || 0);
        });

        const suppliersList = Object.values(suppliersMap);

        root.innerHTML = `
            ${window.UI.breadcrumb("Contract management", "SPM Suppliers")}

            <div class="main-content" style="max-width: 1400px; margin: 0 auto;">
                <div class="toolbar">
                    <div>
                        <h1 style="font-size:22px;font-weight:800;color:var(--text-dark);">Supplier Performance Management (SPM)</h1>
                        <p style="color:var(--text-muted);font-size:13px;">Aggregated vendor scorecards, compliance audits, and total committed spend.</p>
                    </div>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Supplier Partner</th>
                                <th>Active Contracts</th>
                                <th style="text-align:right;">Total Portfolio Value</th>
                                <th style="text-align:right;">Total Executed Spend</th>
                                <th>Overall Score</th>
                                <th>Quality</th>
                                <th>Delivery (OTIF)</th>
                                <th>Commercial</th>
                                <th>HSE Standard</th>
                                <th>Due Diligence</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${suppliersList.map(s => `
                                <tr>
                                    <td><strong>${window.UI.esc(s.name)}</strong></td>
                                    <td><span class="badge badge-draft">${s.contracts.length} Contract${s.contracts.length === 1 ? "" : "s"}</span></td>
                                    <td style="text-align:right;font-weight:700;">${window.UI.money(s.totalApproved, "USD")}</td>
                                    <td style="text-align:right;color:var(--primary-green);font-weight:700;">${window.UI.money(s.totalSpent, "USD")}</td>
                                    <td>
                                        <span style="font-size:15px;font-weight:800;color:var(--primary-green);">${s.rating.overall}</span>
                                        <span class="cell-muted">/ 10</span>
                                    </td>
                                    <td>${s.rating.quality}</td>
                                    <td>${s.rating.delivery}</td>
                                    <td>${s.rating.commercial}</td>
                                    <td>${s.rating.hse}</td>
                                    <td>${window.UI.statusBadge(s.rating.due_diligence || "Approved")}</td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    return { render };
})();
