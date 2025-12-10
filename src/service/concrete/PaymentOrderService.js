import { IPaymentOrderService } from "../abstract/IPaymentOrderService.js";
import PaymentOrderRepository from "../../data-access/concrete/PaymentOrderRepository.js";

export class PaymentOrderService extends IPaymentOrderService {
    constructor() {
        super();
        this.PaymentOrderRepository = PaymentOrderRepository;
    }

    create = async (paymentData) => {
        return await this.PaymentOrderRepository.create(paymentData);
    };

    getPaymentOrderById = async (id) => {
        return await this.PaymentOrderRepository.findById(id);
    };

    getAllPaymentOrders = async (offset, limit, keyword, orderBy, sortBy, filters) => {
        return await this.PaymentOrderRepository.findAll(offset, limit, keyword, orderBy, sortBy, filters);
    };

    getPaymentOrdersByUserId = async (userId) => {
        return await this.PaymentOrderRepository.findByUserId(userId);
    };

    getPaymentOrderByMilestoneId = async (milestoneId) => {
        return await this.PaymentOrderRepository.findByMilestoneId(milestoneId);
    };

    getPaymentOrdersByStatus = async (status) => {
        return await this.PaymentOrderRepository.findByStatus(status);
    };

    getPaymentOrderByRazorpayId = async (razorpayOrderId) => {
        return await this.PaymentOrderRepository.findByRazorpayOrderId(razorpayOrderId);
    };

    updatePaymentOrder = async (id, updateData) => {
        return await this.PaymentOrderRepository.update(id, updateData);
    };

    updatePaymentOrderStatus = async (id, status) => {
        return await this.PaymentOrderRepository.updateStatus(id, status);
    };

    deletePaymentOrder = async (id) => {
        return await this.PaymentOrderRepository.delete(id);
    };
}

export default new PaymentOrderService();

