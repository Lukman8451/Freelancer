import { IProjectService } from "../abstract/IProjectService.js";
import ProjectRepository from "../../data-access/concrete/ProjectRepository.js";

export class ProjectService extends IProjectService {
    constructor() {
        super();
        this.ProjectRepository = ProjectRepository;
    }

    create = async (projectData) => {
        return await this.ProjectRepository.create(projectData);
    };

    getProjectById = async (id) => {
        return await this.ProjectRepository.findById(id);
    };

    getAllProjects = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.ProjectRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    getProjectsByClientId = async (clientId) => {
        return await this.ProjectRepository.findByClientId(clientId);
    };

    getProjectsByStatus = async (status) => {
        return await this.ProjectRepository.findByStatus(status);
    };

    updateProject = async (id, updateData) => {
        return await this.ProjectRepository.update(id, updateData);
    };

    updateProjectStatus = async (id, status) => {
        return await this.ProjectRepository.updateStatus(id, status);
    };

    deleteProject = async (id) => {
        return await this.ProjectRepository.delete(id);
    };

    getAllProjectsForDropDown = async () => {
        return await this.ProjectRepository.getAllProjectsForDropDown();
    };
}

export default new ProjectService();

