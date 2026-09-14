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

        // Clean up floating action menus / popovers on navigation
        document.querySelectorAll(".dmp-floating-action-menu").forEach(el => el.remove());

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
        const isCust = window.ContractWorkflow.isCustomer(me);
        const allPbs = window.Store.pricebooks();
        const pbs = window.ContractWorkflow.filterPricebooksForUser(allPbs, me, window.Store.contracts());

        root.innerHTML = `
            ${window.UI.breadcrumb("Contracts", "Pricebooks")}

            <div class="main-content" style="max-width: 1400px; margin: 0 auto; padding: 20px 28px;">
                <div class="toolbar" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <div>
                        <h1 style="font-size:22px;font-weight:700;color:#111827;">Pricebooks</h1>
                        <p style="color:#6B7280;font-size:13.5px;margin-top:2px;">Master pricebook agreements across active contracts.</p>
                    </div>
                    ${!isCust ? `
                    <button class="inline-flex-center button-z6sbMq solid-qA3WwL primary-wQbOYq" data-act="global-create-pb" style="height:38px; padding:0 18px; font-weight:600;">
                        Create pricebook
                    </button>
                    ` : ""}
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
                            ${pbs.length === 0 ? `
                                <tr>
                                    <td colspan="9" style="text-align:center;padding:40px 20px;background:#fff;">
                                        ${window.UI.emptyFolder("No pricebooks have been created yet.")}
                                    </td>
                                </tr>
                            ` : pbs.map(pb => `
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
            ${window.UI.renderFeedbackBubble ? window.UI.renderFeedbackBubble() : ""}
        `;

        window.UI.bindActions(root, {
            "global-create-pb": () => {
                const myContracts = window.Store.contracts().filter(c => c.supplier === me.company);
                const firstCtr = myContracts[0] || window.Store.contracts()[0];
                window.UI.openPricebookModal({
                    contract: firstCtr,
                    onSuccess: () => renderGlobalPricebooks(root)
                });
            }
        });
    }

    function init() {
        window.addEventListener("hashchange", render);
        render();
    }

    return { init, render };
})();
