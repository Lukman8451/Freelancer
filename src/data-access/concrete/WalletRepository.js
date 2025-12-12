import { Wallet } from "../../model/index.js";

class WalletRepository {
    create = async (walletData) => {
        return await Wallet.create(walletData);
    };

    findById = async (id) => {
        return await Wallet.findByPk(id, {
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
    };

    findByUserId = async (userId) => {
        return await Wallet.findOne({
            where: { userId: userId },
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ]
        });
    };

    update = async (id, updateData) => {
        const [updatedRowsCount] = await Wallet.update(updateData, {
            where: { id: id }
        });
        if (updatedRowsCount === 0) {
            return null;
        }
        return await this.findById(id);
    };

    updateBalance = async (id, newBalance) => {
        return await Wallet.update(
            { balance: newBalance },
            { where: { id: id } }
        );
    };

    incrementBalance = async (id, amount) => {
        const wallet = await Wallet.findByPk(id);
        if (!wallet) return null;
        
        const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
        const newTotalEarned = parseFloat(wallet.totalEarned) + parseFloat(amount);
        
        return await Wallet.update(
            { 
                balance: newBalance,
                totalEarned: newTotalEarned
            },
            { where: { id: id } }
        );
    };

    decrementBalance = async (id, amount) => {
        const wallet = await Wallet.findByPk(id);
        if (!wallet) return null;
        
        const currentBalance = parseFloat(wallet.balance);
        const amountToDeduct = parseFloat(amount);
        
        if (currentBalance < amountToDeduct) {
            throw new Error("Insufficient wallet balance");
        }
        
        const newBalance = currentBalance - amountToDeduct;
        const newTotalWithdrawn = parseFloat(wallet.totalWithdrawn) + amountToDeduct;
        
        return await Wallet.update(
            { 
                balance: newBalance,
                totalWithdrawn: newTotalWithdrawn
            },
            { where: { id: id } }
        );
    };

    findAll = async () => {
        return await Wallet.findAll({
            include: [
                { association: 'user', attributes: ['id', 'name', 'email'] }
            ],
            order: [['createdAt', 'DESC']]
        });
    };
}

export default new WalletRepository();

