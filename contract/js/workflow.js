/* ============================================================
   workflow.js — Business rules, permissions & workflows (Contract)
   ============================================================ */
window.ContractWorkflow = (function () {

    function isCustomer(user) {
        return user && (user.type === "customer" || user.role === "Procurement Specialist" || user.role === "Category Manager (CAM)");
    }

    function isSupplier(user) {
        return user && (user.type === "supplier" || user.role === "Vendor Admin" || user.role === "Key Account Manager" || user.role === "Sales Director" || user.role === "Commercial Manager");
    }

    function canCreateContract(user) {
        return isCustomer(user);
    }

    function canEditContract(user, contract) {
        return isCustomer(user);
    }

    function canViewBudget(user) {
        return isCustomer(user);
    }

    function canViewInternalScorecard(user) {
        return isCustomer(user);
    }

    function canCreatePricebook(user, contract) {
        if (isCustomer(user)) return true;
        if (isSupplier(user)) {
            return user.company === contract.supplier;
        }
        return false;
    }

    function canCreateKPI(user) {
        return isCustomer(user);
    }

    function canCreateReport(user) {
        return isCustomer(user);
    }

    function canSubmitCTRRequest(user, contract) {
        if (isSupplier(user)) {
            return user.company === contract.supplier;
        }
        return false;
    }

    function canApproveCTRRequest(user) {
        return isCustomer(user);
    }

    function canApproveLineItem(user) {
        return isCustomer(user);
    }

    // Filter contracts accessible to user
    function filterContractsForUser(contracts, user) {
        if (isCustomer(user)) return contracts;
        // Supplier only sees contracts awarded to their company
        return contracts.filter(c => c.supplier === user.company);
    }

    // Filter pricebooks accessible to user
    function filterPricebooksForUser(pricebooks, user, contracts) {
        if (isCustomer(user)) return pricebooks;
        const myContractIds = new Set(contracts.filter(c => c.supplier === user.company).map(c => c.id));
        return pricebooks.filter(pb => myContractIds.has(pb.contract_id));
    }

    return {
        isCustomer,
        isSupplier,
        canCreateContract,
        canEditContract,
        canViewBudget,
        canViewInternalScorecard,
        canCreatePricebook,
        canCreateKPI,
        canCreateReport,
        canSubmitCTRRequest,
        canApproveCTRRequest,
        canApproveLineItem,
        filterContractsForUser,
        filterPricebooksForUser
    };
})();
