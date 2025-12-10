import { IContractService } from "../abstract/IContractService.js";
import ContractRepository from "../../data-access/concrete/ContractRepository.js";

export class ContractService extends IContractService {
    constructor() {
        super();
        this.ContractRepository = ContractRepository;
    }

    create = async (contractData) => {
        return await this.ContractRepository.create(contractData);
    };

    getContractById = async (id) => {
        return await this.ContractRepository.findById(id);
    };

    getAllContracts = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.ContractRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    getContractByProjectId = async (projectId) => {
        return await this.ContractRepository.findByProjectId(projectId);
    };

    getContractsByClientId = async (clientId) => {
        return await this.ContractRepository.findByClientId(clientId);
    };

    getContractsByFreelancerId = async (freelancerId) => {
        return await this.ContractRepository.findByFreelancerId(freelancerId);
    };

    getContractsByStatus = async (status) => {
        return await this.ContractRepository.findByStatus(status);
    };

    updateContract = async (id, updateData) => {
        return await this.ContractRepository.update(id, updateData);
    };

    updateContractStatus = async (id, status) => {
        return await this.ContractRepository.updateStatus(id, status);
    };

    deleteContract = async (id) => {
        return await this.ContractRepository.delete(id);
    };
}

export default new ContractService();

