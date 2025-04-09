import * as nodemailer from 'nodemailer';

export class MailerService {
  private transporter: nodemailer.Transporter;

  constructor() {
    // Create a transporter using Gmail service
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });
  }

  async sendInvitationEmail(
    to: string,
    token: string,
    workspaceId: string,
  ): Promise<void> {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const invitationUrl = `${baseUrl}/register?token=${token}&code=${workspaceId}`;

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: 'Atlas Referral Invitation - Join Our Team!',
      html: `
        <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px;">
          <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
            <div style="background-color: #4a90e2; padding: 20px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 24px;">Join Atlas</h1>
            </div>
            <div style="padding: 30px;">
              <p style="font-size: 16px; color: #333333;">Hello,</p>
              <p style="font-size: 16px; color: #333333;">
                You have been referred to join Atlas – the premier platform for team collaboration.
              </p>
              <p style="font-size: 16px; color: #333333;">
                Click the button below to register, set your password, and join your new workspace.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" 
                   style="background-color: #4a90e2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
                  Accept Your Invitation
                </a>
              </div>
              <p style="font-size: 14px; color: #777777;">
                If you did not request this invitation, please ignore this email.
              </p>
            </div>
            <div style="background-color: #f0f0f0; padding: 15px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">© ${new Date().getFullYear()} Atlas. All rights reserved.</p>
            </div>
          </div>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
