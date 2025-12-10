export class IPaymentOrderService {
    create(paymentData) { }
    getPaymentOrderById(id) { }
    getAllPaymentOrders(offset, limit, keyword, orderBy, sortBy, filters) { }
    getPaymentOrdersByUserId(userId) { }
    getPaymentOrderByMilestoneId(milestoneId) { }
    getPaymentOrdersByStatus(status) { }
    getPaymentOrderByRazorpayId(razorpayOrderId) { }
    updatePaymentOrder(id, updateData) { }
    updatePaymentOrderStatus(id, status) { }
    deletePaymentOrder(id) { }
}

