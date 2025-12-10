import { IPortfolioItemService } from "../abstract/IPortfolioItemService.js";
import PortfolioItemRepository from "../../data-access/concrete/PortfolioItemRepository.js";

export class PortfolioItemService extends IPortfolioItemService {
    constructor() {
        super();
        this.PortfolioItemRepository = PortfolioItemRepository;
    }

    create = async (portfolioData) => {
        return await this.PortfolioItemRepository.create(portfolioData);
    };

    getPortfolioItemById = async (id) => {
        return await this.PortfolioItemRepository.findById(id);
    };

    getAllPortfolioItems = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.PortfolioItemRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    getPortfolioItemsByProfileId = async (profileId) => {
        return await this.PortfolioItemRepository.findByProfileId(profileId);
    };

    updatePortfolioItem = async (id, updateData) => {
        return await this.PortfolioItemRepository.update(id, updateData);
    };

    deletePortfolioItem = async (id) => {
        return await this.PortfolioItemRepository.delete(id);
    };

    bulkCreatePortfolioItems = async (portfolioDataArray) => {
        return await this.PortfolioItemRepository.bulkCreate(portfolioDataArray);
    };
}

export default new PortfolioItemService();

