export class IProposalService {
    create(proposalData) { }
    getProposalById(id) { }
    getAllProposals(offset, limit, keyword, orderBy, sortBy, filters) { }
    getProposalsByProjectId(projectId) { }
    getProposalsByFreelancerId(freelancerId) { }
    getProposalsByStatus(status) { }
    updateProposal(id, updateData) { }
    updateProposalStatus(id, status) { }
    deleteProposal(id) { }
}

