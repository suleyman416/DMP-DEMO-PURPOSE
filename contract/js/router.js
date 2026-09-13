/* ============================================================
   router.js — Hash routing for Contract module
   ============================================================ */
window.Router = (function () {

    function parseHash() {
        const h = window.location.hash || "#/contracts";
        const parts = h.slice(2).split("?")[0].split("/");
        const queryParams = new URLSearchParams(h.includes("?") ? h.split("?")[1] : "");
        return { parts, queryParams };
    }

    function render() {
        const root = document.getElementById("view");
        if (!root) return;

        const { parts, queryParams } = parseHash();
        const base = parts[0] || "contracts";

        window.UI.renderHeader();

        if (base === "contracts") {
            if (parts[1] === "new") {
                window.ContractFormView.render(root);
            } else if (parts[1] && parts[2] === "pricebooks" && parts[3]) {
                window.PricebookDetailView.render(root, parts[1], parts[3]);
            } else if (parts[1]) {
                const tab = queryParams.get("tab") || "pricebook";
                window.ContractDetailView.render(root, parts[1], tab);
            } else {
                window.ContractsListView.render(root);
            }
        } else if (base === "pricebooks") {
            if (parts[1]) {
                window.PricebookDetailView.render(root, null, parts[1]);
            } else {
                // Global pricebooks view shows list of all pricebooks
                renderGlobalPricebooks(root);
            }
        } else if (base === "ctr-requests") {
            window.CTRRequestsView.render(root);
        } else if (base === "spm") {
            window.SPMSuppliersView.render(root);
        } else {
            window.ContractsListView.render(root);
        }
    }

    function renderGlobalPricebooks(root) {
        const me = window.Store.currentUser();
        const allPbs = window.Store.pricebooks();
        const pbs = window.ContractWorkflow.filterPricebooksForUser(allPbs, me, window.Store.contracts());

        root.innerHTML = `
            ${window.UI.renderBreadcrumbs([
                { label: "Contract", hash: "#/contracts" },
                { label: "Global Pricebooks", hash: "#/pricebooks" }
            ])}

            <div class="main-content" style="max-width: 1400px; margin: 0 auto;">
                <div class="toolbar">
                    <div>
                        <h1 style="font-size:22px;font-weight:800;color:var(--text-dark);">Global Pricebooks Directory</h1>
                        <p style="color:var(--text-muted);font-size:13px;">Master pricebook agreements across all active vendor supply lines.</p>
                    </div>
                </div>

                <div class="table-container">
                    <table class="data-table">
                        <thead>
                            <tr>
                                <th>Pricebook #</th>
                                <th>External Ref</th>
                                <th>Description</th>
                                <th>Associated Contract</th>
                                <th>Currency</th>
                                <th>Line Items</th>
                                <th>Status</th>
                                <th>Created Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${pbs.map(pb => `
                                <tr>
                                    <td><a href="#/contracts/${pb.contract_id}/pricebooks/${pb.id}" class="cell-link" style="font-weight:700;">${window.UI.esc(pb.pricebook_number)}</a></td>
                                    <td><span style="font-family:monospace;font-size:12px;">${window.UI.esc(pb.external_pricebook_number)}</span></td>
                                    <td>${window.UI.esc(pb.description)}</td>
                                    <td><a href="#/contracts/${pb.contract_id}" class="cell-link">${window.UI.esc(pb.contract_id)}</a></td>
                                    <td><strong>${window.UI.esc(pb.currency)}</strong></td>
                                    <td><span class="badge badge-draft">${pb.items_count || 0} items</span></td>
                                    <td>${window.UI.statusBadge(pb.status)}</td>
                                    <td><span class="cell-muted">${pb.created_at}</span></td>
                                    <td><a href="#/contracts/${pb.contract_id}/pricebooks/${pb.id}" class="btn btn-outline btn-sm">View Items &rarr;</a></td>
                                </tr>
                            `).join("")}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
    }

    function init() {
        window.addEventListener("hashchange", render);
        render();
    }

    return { init, render };
})();
