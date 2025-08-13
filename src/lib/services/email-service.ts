import VerifyEmail from "@/lib/emails/verify-email";
import type { CreateEmailResponse } from "resend";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const onboardingEmail = process.env.RESEND_EMAIL;

class EmailService {
	private async sendEmailSafely(
		emailOperation: () => Promise<CreateEmailResponse>,
		type: string,
		recipient?: string,
	): Promise<boolean> {
		try {
			console.log(`🕧 Sending email: ${type} to ${recipient}`);
			await emailOperation();
			console.log(`✅ Sent: ${type} to ${recipient}`);
			return true;
		} catch (error) {
			console.error(`❌ Failed to send email:`, {
				type,
				recipient,
				error,
				timestamp: new Date().toISOString(),
			});
			return false;
		}
	}

	async sendVerifyEmail(
		email: string,
		name: string,
		verificationLink: string,
	): Promise<boolean> {
		return this.sendEmailSafely(
			async () => {
				if (!onboardingEmail) {
					throw new Error("RESEND_EMAIL environment variable is not set");
				}
				return await resend.emails.send({
					from: onboardingEmail,
					to: email,
					subject: "Welcome to MediConsult AI",
					react: VerifyEmail({ name, verificationLink }),
				});
			},
			"Welcome email",
			email,
		);
	}
}
export const emailService = new EmailService();
