import { IMilestoneService } from "../abstract/IMilestoneService.js";
import MilestoneRepository from "../../data-access/concrete/MilestoneRepository.js";

export class MilestoneService extends IMilestoneService {
    constructor() {
        super();
        this.MilestoneRepository = MilestoneRepository;
    }

    create = async (milestoneData) => {
        return await this.MilestoneRepository.create(milestoneData);
    };

    getMilestoneById = async (id) => {
        return await this.MilestoneRepository.findById(id);
    };

    getAllMilestones = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.MilestoneRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    getMilestonesByContractId = async (contractId) => {
        return await this.MilestoneRepository.findByContractId(contractId);
    };

    getMilestonesByStatus = async (status) => {
        return await this.MilestoneRepository.findByStatus(status);
    };

    updateMilestone = async (id, updateData) => {
        return await this.MilestoneRepository.update(id, updateData);
    };

    updateMilestoneStatus = async (id, status) => {
        return await this.MilestoneRepository.updateStatus(id, status);
    };

    deleteMilestone = async (id) => {
        return await this.MilestoneRepository.delete(id);
    };
}

export default new MilestoneService();

