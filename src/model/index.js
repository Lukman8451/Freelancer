import { sequelize } from "../config/database.js";

import { User } from "./User.js";
import { Profile } from "./Profile.js";
import { Skill } from "./Skill.js";
import { ProfileSkill } from "./ProfileSkill.js";
import { PortfolioItem } from "./PortfolioItem.js";
import { Project } from "./Project.js";
import { Proposal } from "./Proposal.js";
import { Contract } from "./Contract.js";
import { Milestone } from "./Milestone.js";
import { PaymentOrder } from "./PaymentOrder.js";
import { Wallet } from "./Wallet.js";
import { WalletTransaction } from "./WalletTransaction.js";
import { WithdrawalRequest } from "./WithdrawalRequest.js";

Object.values(sequelize.models).forEach((model) => {
    if (typeof model.associate === "function") {
        model.associate();
    }
});

export { sequelize };

export { User } from "./User.js";

export { Profile } from "./Profile.js";

export { Skill } from "./Skill.js";

export { ProfileSkill } from "./ProfileSkill.js";

export { PortfolioItem } from "./PortfolioItem.js";

export { Project } from "./Project.js";

export { Proposal } from "./Proposal.js";

export { Contract } from "./Contract.js";

export { Milestone } from "./Milestone.js";

export { PaymentOrder } from "./PaymentOrder.js";
export { Wallet } from "./Wallet.js";
export { WalletTransaction } from "./WalletTransaction.js";
export { WithdrawalRequest } from "./WithdrawalRequest.js";
