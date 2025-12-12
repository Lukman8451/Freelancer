import axios from 'axios';
import { env } from '../../config/config.js';

/**
 * Razorpay X Service
 * Handles payout operations using Razorpay X API
 */
class RazorpayXService {
    constructor() {
        this.baseURL = 'https://api.razorpay.com/v1';
        this.keyId = env.RAZORPAY_X_KEY_ID || env.RAZORPAY_KEY_ID; // Fallback to regular Razorpay key if X key not available
        this.keySecret = env.RAZORPAY_X_KEY_SECRET || env.RAZORPAY_KEY_SECRET;
        this.accountNumber = env.RAZORPAY_X_ACCOUNT_NUMBER;
    }

    /**
     * Get axios instance with authentication
     */
    getAxiosInstance() {
        return axios.create({
            baseURL: this.baseURL,
            auth: {
                username: this.keyId,
                password: this.keySecret
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Create or get Razorpay Contact
     * @param {Object} contactData - Contact details
     * @returns {Promise<Object>} Contact object with id
     */
    async createOrGetContact(contactData) {
        try {
            const { name, email, contact: phone, type = 'vendor' } = contactData;
            
            if (!this.keyId || !this.keySecret) {
                throw new Error('Razorpay X credentials not configured');
            }

            const api = this.getAxiosInstance();

            // First, try to find existing contact by email
            try {
                const searchResponse = await api.get('/contacts', {
                    params: { email }
                });
                
                if (searchResponse.data.items && searchResponse.data.items.length > 0) {
                    const existingContact = searchResponse.data.items.find(c => c.email === email);
                    if (existingContact) {
                        console.log('Using existing Razorpay contact:', existingContact.id);
                        return existingContact;
                    }
                }
            } catch (searchError) {
                // If search fails, continue to create new contact
                console.log('Contact search failed, creating new contact');
            }

            // Create new contact
            const response = await api.post('/contacts', {
                name,
                email,
                contact: phone,
                type // 'vendor' for freelancers, 'customer' for clients
            });

            console.log('Created new Razorpay contact:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('Error creating/getting Razorpay contact:', error.response?.data || error.message);
            throw new Error(`Failed to create/get Razorpay contact: ${error.response?.data?.error?.description || error.message}`);
        }
    }

    /**
     * Create or get Fund Account (bank account linked to contact)
     * @param {Object} fundAccountData - Fund account details
     * @returns {Promise<Object>} Fund account object with id
     */
    async createOrGetFundAccount(fundAccountData) {
        try {
            const { contactId, accountNumber, ifsc, accountHolderName, accountType = 'savings' } = fundAccountData;
            
            if (!this.keyId || !this.keySecret) {
                throw new Error('Razorpay X credentials not configured');
            }

            const api = this.getAxiosInstance();

            // First, try to get existing fund accounts for this contact
            try {
                const listResponse = await api.get(`/fund_accounts`, {
                    params: { contact_id: contactId }
                });
                
                if (listResponse.data.items && listResponse.data.items.length > 0) {
                    // Check if a fund account with matching bank details exists
                    const existingFundAccount = listResponse.data.items.find(
                        fa => fa.bank_account && 
                              fa.bank_account.account_number === accountNumber &&
                              fa.bank_account.ifsc === ifsc
                    );
                    
                    if (existingFundAccount) {
                        console.log('Using existing Razorpay fund account:', existingFundAccount.id);
                        return existingFundAccount;
                    }
                }
            } catch (listError) {
                // If list fails, continue to create new fund account
                console.log('Fund account list failed, creating new fund account');
            }

            // Create new fund account
            const response = await api.post('/fund_accounts', {
                contact_id: contactId,
                account_type: 'bank_account',
                bank_account: {
                    name: accountHolderName,
                    ifsc: ifsc,
                    account_number: accountNumber
                }
            });

            console.log('Created new Razorpay fund account:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('Error creating/getting Razorpay fund account:', error.response?.data || error.message);
            throw new Error(`Failed to create/get Razorpay fund account: ${error.response?.data?.error?.description || error.message}`);
        }
    }

    /**
     * Create payout to freelancer
     * @param {Object} payoutData - Payout details
     * @returns {Promise<Object>} Payout object with id and status
     */
    async createPayout(payoutData) {
        try {
            const {
                accountNumber, // Razorpay X account number (platform account)
                fundAccountId,
                amount, // Amount in smallest unit (paise for INR)
                currency = 'INR',
                mode = 'IMPS', // IMPS, NEFT, RTGS, UPI
                purpose = 'payout',
                referenceId,
                narration,
                queueIfLowBalance = true
            } = payoutData;

            if (!this.keyId || !this.keySecret) {
                throw new Error('Razorpay X credentials not configured');
            }

            if (!accountNumber || !fundAccountId || !amount) {
                throw new Error('Missing required payout parameters');
            }

            const api = this.getAxiosInstance();

            const response = await api.post('/payouts', {
                account_number: accountNumber,
                fund_account_id: fundAccountId,
                amount: amount,
                currency: currency,
                mode: mode,
                purpose: purpose,
                queue_if_low_balance: queueIfLowBalance,
                reference_id: referenceId,
                narration: narration || `Payout for ${referenceId}`
            });

            console.log('Created Razorpay payout:', response.data.id);
            return response.data;
        } catch (error) {
            console.error('Error creating Razorpay payout:', error.response?.data || error.message);
            throw new Error(`Failed to create Razorpay payout: ${error.response?.data?.error?.description || error.message}`);
        }
    }

    /**
     * Get payout status
     * @param {string} payoutId - Razorpay payout ID
     * @returns {Promise<Object>} Payout object with status
     */
    async getPayoutStatus(payoutId) {
        try {
            if (!this.keyId || !this.keySecret) {
                throw new Error('Razorpay X credentials not configured');
            }

            const api = this.getAxiosInstance();
            const response = await api.get(`/payouts/${payoutId}`);
            
            return response.data;
        } catch (error) {
            console.error('Error getting Razorpay payout status:', error.response?.data || error.message);
            throw new Error(`Failed to get payout status: ${error.response?.data?.error?.description || error.message}`);
        }
    }

    /**
     * Verify if Razorpay X is configured
     * @returns {boolean}
     */
    isConfigured() {
        return !!(this.keyId && this.keySecret && this.accountNumber);
    }
}

export default new RazorpayXService();

