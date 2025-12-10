import { IProfileService } from "../abstract/IProfileService.js";
import ProfileRepository from "../../data-access/concrete/ProfileRepository.js";

export class ProfileService extends IProfileService {
    constructor() {
        super();
        this.ProfileRepository = ProfileRepository;
    }

    create = async (profileData) => {
        return await this.ProfileRepository.create(profileData);
    };

    getProfileById = async (id) => {
        return await this.ProfileRepository.findById(id);
    };

    getProfileByUserId = async (userId) => {
        return await this.ProfileRepository.findByUserId(userId);
    };

    getAllProfiles = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.ProfileRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    updateProfile = async (id, updateData) => {
        return await this.ProfileRepository.update(id, updateData);
    };

    deleteProfile = async (id) => {
        return await this.ProfileRepository.delete(id);
    };

    addSkill = async (profileId, skillId) => {
        return await this.ProfileRepository.addSkill(profileId, skillId);
    };

    removeSkill = async (profileId, skillId) => {
        return await this.ProfileRepository.removeSkill(profileId, skillId);
    };

    getAllProfilesForDropDown = async () => {
        return await this.ProfileRepository.getAllProfilesForDropDown();
    };
}

export default new ProfileService();

