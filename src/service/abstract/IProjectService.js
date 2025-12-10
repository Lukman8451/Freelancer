export class IProjectService {
    create(projectData) { }
    getProjectById(id) { }
    getAllProjects(offset, limit, keyword, orderBy, sortBy, filters) { }
    getProjectsByClientId(clientId) { }
    getProjectsByStatus(status) { }
    updateProject(id, updateData) { }
    updateProjectStatus(id, status) { }
    deleteProject(id) { }
    getAllProjectsForDropDown() { }
}

