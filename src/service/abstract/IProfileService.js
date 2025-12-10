export class IProfileService {
    create(profileData) { }
    getProfileById(id) { }
    getProfileByUserId(userId) { }
    getAllProfiles(offset, limit, keyword, orderBy, sortBy, filters) { }
    updateProfile(id, updateData) { }
    deleteProfile(id) { }
    addSkill(profileId, skillId) { }
    removeSkill(profileId, skillId) { }
    getAllProfilesForDropDown() { }
}

