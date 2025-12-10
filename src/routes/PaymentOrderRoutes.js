import { Router } from "express";
import PaymentOrderController from "../controller/PaymentOrderController.js";
import isAuthenticated from "../middlewares/jwt.js";

const PaymentOrderRouter = Router();

const paymentOrderController = PaymentOrderController;

PaymentOrderRouter.post(
  "/payments",
  isAuthenticated,
  paymentOrderController.createPaymentOrder
);

PaymentOrderRouter.get(
  "/payments/user/:userId",
  isAuthenticated,
  paymentOrderController.getPaymentOrdersByUserId
);

PaymentOrderRouter.get(
  "/payments/:id",
  isAuthenticated,
  paymentOrderController.getPaymentOrderById
);

PaymentOrderRouter.get(
  "/payments",
  isAuthenticated,
  paymentOrderController.getAllPaymentOrders
);

PaymentOrderRouter.put(
  "/payments/status",
  paymentOrderController.updatePaymentOrderStatus
);

PaymentOrderRouter.delete(
  "/payments/:id",
  isAuthenticated,
  paymentOrderController.deletePaymentOrder
);

export { PaymentOrderRouter };

