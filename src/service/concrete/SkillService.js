import { ISkillService } from "../abstract/ISkillService.js";
import SkillRepository from "../../data-access/concrete/SkillRepository.js";

export class SkillService extends ISkillService {
    constructor() {
        super();
        this.SkillRepository = SkillRepository;
    }

    create = async (skillData) => {
        return await this.SkillRepository.create(skillData);
    };

    getSkillById = async (id) => {
        return await this.SkillRepository.findById(id);
    };

    getSkillByName = async (name) => {
        return await this.SkillRepository.findByName(name);
    };

    getAllSkills = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.SkillRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    updateSkill = async (id, updateData) => {
        return await this.SkillRepository.update(id, updateData);
    };

    deleteSkill = async (id) => {
        return await this.SkillRepository.delete(id);
    };

    getAllSkillsForDropDown = async () => {
        return await this.SkillRepository.getAllSkillsForDropDown();
    };
}

export default new SkillService();

