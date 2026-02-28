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
}

export default new EmailService();
