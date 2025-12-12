import express from 'express';
import { UserRouter } from './UserRoutes.js';
import { ProfileRouter } from './ProfileRoutes.js';
import { ProjectRouter } from './ProjectRoutes.js';
import { ProposalRouter } from './ProposalRoutes.js';
import { ContractRouter } from './ContractRoutes.js';
import { MilestoneRouter } from './MilestoneRoutes.js';
import { PaymentOrderRouter } from './PaymentOrderRoutes.js';
import { SkillRouter } from './SkillRoutes.js';
import { PortfolioItemRouter } from './PortfolioItemRoutes.js';
import WalletRouter from './WalletRoutes.js';

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'API is running',
        timestamp: new Date().toISOString()
    });
});

// API Routes
router.use('/', UserRouter);
router.use('/', ProfileRouter);
router.use('/', ProjectRouter);
router.use('/', ProposalRouter);
router.use('/', ContractRouter);
router.use('/', MilestoneRouter);
router.use('/', PaymentOrderRouter);
router.use('/', SkillRouter);
router.use('/', PortfolioItemRouter);
router.use('/', WalletRouter);

export default router;

