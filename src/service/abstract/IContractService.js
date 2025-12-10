export class IContractService {
    create(contractData) { }
    getContractById(id) { }
    getAllContracts(offset, limit, keyword, orderBy, sortBy, filters) { }
    getContractByProjectId(projectId) { }
    getContractsByClientId(clientId) { }
    getContractsByFreelancerId(freelancerId) { }
    getContractsByStatus(status) { }
    updateContract(id, updateData) { }
    updateContractStatus(id, status) { }
    deleteContract(id) { }
}

