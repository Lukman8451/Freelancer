import nodemailer from "nodemailer";
import { env } from "../../config/config.js";

class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: env.SMTP_HOST,
            port: env.SMTP_PORT,
            secure: false,
            auth: {
                user: env.SMTP_USER,
                pass: env.SMTP_PASS
            }
        });
    }

    sendWelcomeEmail = async (name, email, role) => {
        try {
            const roleMessage = role === "client"
                ? "You can now post projects and find talented freelancers to bring your ideas to life."
                : "You can now browse projects, submit proposals, and start earning.";

            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome to FreelanceHub!</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hi ${name},</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Thank you for joining FreelanceHub! Your account has been created successfully as a <strong>${role}</strong>.
                    </p>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        ${roleMessage}
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Getting Started:</h3>
                        <ul style="color: #555; font-size: 14px; line-height: 1.8;">
                            <li>Complete your profile to stand out</li>
                            <li>Add your skills and portfolio items</li>
                            <li>${role === "client" ? "Post your first project" : "Browse available projects and submit proposals"}</li>
                        </ul>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${env.SERVER_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                            Get Started
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This email was sent by FreelanceHub. If you did not create an account, please ignore this email.
                    </p>
                </div>
            </div>`;

            await this.transporter.sendMail({
                from: env.SMTP_FROM,
                to: email,
                subject: "Welcome to FreelanceHub! 🎉",
                html
            });

            console.log(`Welcome email sent to ${email}`);
        } catch (error) {
            console.error("Failed to send welcome email:", error.message);
        }
    };

    sendProposalSubmittedEmail = async (freelancerName, freelancerEmail, projectTitle, bidAmount) => {
        try {
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Proposal Submitted!</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hi ${freelancerName},</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Your proposal has been successfully submitted. The client will review it and get back to you.
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Proposal Details:</h3>
                        <p style="color: #555; margin: 8px 0;"><strong>Project:</strong> ${projectTitle}</p>
                        <p style="color: #555; margin: 8px 0;"><strong>Your Bid:</strong> $${bidAmount}</p>
                        <p style="color: #555; margin: 8px 0;"><strong>Status:</strong> <span style="color: #f59e0b;">Pending Review</span></p>
                    </div>
                    <p style="color: #555; font-size: 14px; line-height: 1.6;">
                        You will be notified by email once the client makes a decision on your proposal.
                    </p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This email was sent by FreelanceHub.
                    </p>
                </div>
            </div>`;

            await this.transporter.sendMail({
                from: env.SMTP_FROM,
                to: freelancerEmail,
                subject: `Proposal Submitted – ${projectTitle}`,
                html
            });

            console.log(`Proposal submitted email sent to ${freelancerEmail}`);
        } catch (error) {
            console.error("Failed to send proposal submitted email:", error.message);
        }
    };

    sendNewProposalNotificationEmail = async (clientName, clientEmail, freelancerName, projectTitle, bidAmount) => {
        try {
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Proposal Received!</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hi ${clientName},</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        You have received a new proposal for your project.
                    </p>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #333; margin-top: 0;">Proposal Details:</h3>
                        <p style="color: #555; margin: 8px 0;"><strong>Project:</strong> ${projectTitle}</p>
                        <p style="color: #555; margin: 8px 0;"><strong>Freelancer:</strong> ${freelancerName}</p>
                        <p style="color: #555; margin: 8px 0;"><strong>Bid Amount:</strong> $${bidAmount}</p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${env.SERVER_URL}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                            Review Proposal
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This email was sent by FreelanceHub.
                    </p>
                </div>
            </div>`;

            await this.transporter.sendMail({
                from: env.SMTP_FROM,
                to: clientEmail,
                subject: `New Proposal on "${projectTitle}"`,
                html
            });

            console.log(`New proposal notification email sent to ${clientEmail}`);
        } catch (error) {
            console.error("Failed to send new proposal notification email:", error.message);
        }
    };

    sendProposalAcceptedEmail = async (freelancerName, freelancerEmail, projectTitle, bidAmount) => {
        try {
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">🎉 Proposal Accepted!</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Congratulations, ${freelancerName}!</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Your proposal has been <strong style="color: #22c55e;">accepted</strong> by the client. A contract has been created automatically — you can now start working on the project.
                    </p>
                    <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #15803d; margin-top: 0;">Contract Details:</h3>
                        <p style="color: #555; margin: 8px 0;"><strong>Project:</strong> ${projectTitle}</p>
                        <p style="color: #555; margin: 8px 0;"><strong>Agreed Amount:</strong> $${bidAmount}</p>
                        <p style="color: #555; margin: 8px 0;"><strong>Status:</strong> <span style="color: #22c55e;">Active</span></p>
                    </div>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${env.SERVER_URL}" style="background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                            View Contract
                        </a>
                    </div>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="color: #999; font-size: 12px; text-align: center;">
                        This email was sent by FreelanceHub.
                    </p>
                </div>
            </div>`;

            await this.transporter.sendMail({
                from: env.SMTP_FROM,
                to: freelancerEmail,
                subject: `Your Proposal Was Accepted – ${projectTitle}`,
                html
            });

            console.log(`Proposal accepted email sent to ${freelancerEmail}`);
        } catch (error) {
            console.error("Failed to send proposal accepted email:", error.message);
        }
    };

    sendVerificationEmail = async (name, email, verificationUrl) => {
        try {
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Verify Your Email</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hi ${name},</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        Thanks for registering on FreelanceHub! Please verify your email address by clicking the button below.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationUrl}" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                            Verify Email
                        </a>
                    </div>
                    <p style="color: #888; font-size: 14px;">This link expires in <strong>24 hours</strong>. If you did not create an account, you can ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="color: #aaa; font-size: 12px; text-align: center;">
                        Or copy this link: <a href="${verificationUrl}" style="color: #667eea;">${verificationUrl}</a>
                    </p>
                </div>
            </div>`;

            await this.transporter.sendMail({
                from: env.SMTP_FROM,
                to: email,
                subject: "Verify your FreelanceHub email",
                html
            });

            console.log(`Verification email sent to ${email}`);
        } catch (error) {
            console.error("Failed to send verification email:", error.message);
        }
    };

    sendPasswordResetEmail = async (name, email, resetUrl) => {
        try {
            const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 10px 10px 0 0; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Password Reset</h1>
                </div>
                <div style="background: #ffffff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 10px 10px;">
                    <h2 style="color: #333;">Hi ${name},</h2>
                    <p style="color: #555; font-size: 16px; line-height: 1.6;">
                        We received a request to reset your password. Click the button below to set a new password.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetUrl}" style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #888; font-size: 14px;">This link expires in <strong>1 hour</strong>. If you did not request a password reset, you can safely ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
                    <p style="color: #aaa; font-size: 12px; text-align: center;">
                        Or copy this link: <a href="${resetUrl}" style="color: #f59e0b;">${resetUrl}</a>
                    </p>
                </div>
            </div>`;

            await this.transporter.sendMail({
                from: env.SMTP_FROM,
                to: email,
                subject: "Reset your FreelanceHub password",
                html
            });

            console.log(`Password reset email sent to ${email}`);
        } catch (error) {
            console.error("Failed to send password reset email:", error.message);
        }
    };
}

export default new EmailService();
