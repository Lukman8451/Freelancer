import { IProposalService } from "../abstract/IProposalService.js";
import ProposalRepository from "../../data-access/concrete/ProposalRepository.js";

export class ProposalService extends IProposalService {
    constructor() {
        super();
        this.ProposalRepository = ProposalRepository;
    }

    create = async (proposalData) => {
        return await this.ProposalRepository.create(proposalData);
    };

    getProposalById = async (id) => {
        return await this.ProposalRepository.findById(id);
    };

    getAllProposals = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.ProposalRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    getProposalsByProjectId = async (projectId) => {
        return await this.ProposalRepository.findByProjectId(projectId);
    };

    getProposalsByFreelancerId = async (freelancerId) => {
        return await this.ProposalRepository.findByFreelancerId(freelancerId);
    };

    getProposalsByStatus = async (status) => {
        return await this.ProposalRepository.findByStatus(status);
    };

    updateProposal = async (id, updateData) => {
        return await this.ProposalRepository.update(id, updateData);
    };

    updateProposalStatus = async (id, status) => {
        return await this.ProposalRepository.updateStatus(id, status);
    };

    deleteProposal = async (id) => {
        return await this.ProposalRepository.delete(id);
    };
}

export default new ProposalService();

