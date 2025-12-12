import express from "express";
import walletController from "../controller/WalletController.js";
import isAuthenticated from "../middlewares/jwt.js";

const WalletRouter = express.Router();

// Get my wallet
WalletRouter.get(
    "/wallet",
    isAuthenticated,
    walletController.getMyWallet
);

// Get wallet transactions
WalletRouter.get(
    "/wallet/transactions",
    isAuthenticated,
    walletController.getWalletTransactions
);

// Create withdrawal request
WalletRouter.post(
    "/wallet/withdraw",
    isAuthenticated,
    walletController.createWithdrawalRequest
);

// Get my withdrawal requests
WalletRouter.get(
    "/wallet/withdrawals",
    isAuthenticated,
    walletController.getMyWithdrawalRequests
);

// Get all withdrawal requests (admin only)
WalletRouter.get(
    "/wallet/withdrawals/all",
    isAuthenticated,
    walletController.getAllWithdrawalRequests
);

// Process withdrawal request (admin only)
WalletRouter.put(
    "/wallet/withdrawals/:id/process",
    isAuthenticated,
    walletController.processWithdrawalRequest
);

export default WalletRouter;

