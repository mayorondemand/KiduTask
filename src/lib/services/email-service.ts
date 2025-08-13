import VerifyEmail from "@/lib/emails/verify-email";
import type { CreateEmailResponse } from "resend";
import { Resend } from "resend";
import ForgotPassEmail from "../emails/forgot-pass-email";
import ResetPassEmail from "../emails/reset-pass-email";

const resend = new Resend(process.env.RESEND_API_KEY);
const sendFromEmail = process.env.RESEND_EMAIL;
const baseUrl = process.env.BETTER_AUTH_URL;

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
        if (!sendFromEmail) {
          throw new Error("RESEND_EMAIL environment variable is not set");
        }
        return await resend.emails.send({
          from: sendFromEmail,
          to: email,
          subject: "Verify KudiTask Account",
          react: VerifyEmail({ name, verificationLink }),
        });
      },
      "Verify KudiTask Account",
      email,
    );
  }

  async sendForgotPassEmail(
    email: string,
    name: string,
    resetLink: string,
  ): Promise<boolean> {
    return this.sendEmailSafely(
      async () => {
        if (!sendFromEmail) {
          throw new Error("RESEND_EMAIL environment variable is not set");
        }
        return await resend.emails.send({
          from: sendFromEmail,
          to: email,
          subject: "Forgot KudiTask Email",
          react: ForgotPassEmail({ name, resetLink }),
        });
      },
      "Forgot KudiTask Email",
      email,
    );
  }

  async sendResetPasswordEmail(email: string, name: string): Promise<boolean> {
    return this.sendEmailSafely(async () => {
      if (!sendFromEmail) {
        throw new Error("RESEND_EMAIL environment variable is not set");
      }

      if (!baseUrl) {
        throw new Error("BETTER_AUTH_URL environment variable is not set");
      }

      const loginLink = `${baseUrl}/login`;

      return await resend.emails.send({
        from: sendFromEmail,
        to: email,
        subject: "Your Kuditask Password has been reset",
        react: ResetPassEmail({ name, loginLink }),
      });
    }, "Password Reset Successful");
  }
}
export const emailService = new EmailService();
