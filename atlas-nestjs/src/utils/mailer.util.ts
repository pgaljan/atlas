import * as nodemailer from 'nodemailer';

export class MailerService {
  private transporter: nodemailer.Transporter;
  private baseUrl: string;
  private permissionLabels = {
    owner: 'Full access',
    collaborator: 'Can edit',
    commenter: 'Can comment',
    viewer: 'Can view',
  };

  constructor() {
    this.baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
      // Email sending configuration
      pool: true,
      maxConnections: 5,
      maxMessages: 10,
      rateDelta: 20000, // 20 seconds
      rateLimit: 5, // 5 emails per rateDelta
    });
  }

  // Retry mechanism for email sending
  private async sendEmailWithRetry(
    mailOptions: nodemailer.SendMailOptions,
    maxRetries: number = 3,
    delay: number = 1000,
  ): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.transporter.sendMail(mailOptions);
        return result;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise((resolve) =>
          setTimeout(resolve, delay * Math.pow(2, attempt - 1)),
        );
      }
    }
  }

  private getEmailTemplate(
    headerColor: string,
    title: string,
    content: string,
  ): string {
    return `
      <div style="font-family: Arial, sans-serif; background-color: #f7f7f7; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden;">
          <div style="background-color: ${headerColor}; padding: 20px; text-align: center;">
            <h1 style="margin: 0; color: #ffffff; font-size: 24px;">${title}</h1>
          </div>
          <div style="padding: 30px;">
            ${content}
          </div>
          <div style="background-color: #f0f0f0; padding: 15px; text-align: center;">
            <p style="margin: 0; font-size: 12px; color: #999999;">© ${new Date().getFullYear()} Atlas. All rights reserved.</p>
          </div>
        </div>
      </div>
    `;
  }

  async sendInvitationEmail(
    to: string,
    token: string,
    workspaceId: string,
  ): Promise<void> {
    const invitationUrl = `${this.baseUrl}/register?token=${token}&code=${workspaceId}&email=${to}`;

    const content = `
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
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: 'Atlas Referral Invitation - Join Our Team!',
      html: this.getEmailTemplate('#4a90e2', 'Join Atlas', content),
    };

    await this.sendEmailWithRetry(mailOptions);
  }

  async sendForgotPasswordEmail(to: string, token: string): Promise<void> {
    const resetUrl = `${this.baseUrl}/reset-password?token=${token}&email=${to}`;

    const content = `
      <p style="font-size: 16px; color: #333333;">Hi there,</p>
      <p style="font-size: 16px; color: #333333;">
        We received a request to reset your Atlas account password.
      </p>
      <p style="font-size: 16px; color: #333333;">
        Click the button below to set a new password.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" 
           style="background-color: #e94e77; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Reset Password
        </a>
      </div>
      <p style="font-size: 14px; color: #777777;">
        If you did not request a password reset, please ignore this email.
      </p>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: 'Reset Your Atlas Password',
      html: this.getEmailTemplate('#e94e77', 'Reset Your Password', content),
    };

    await this.sendEmailWithRetry(mailOptions);
  }

  async sendStructureShareInvitation(
    to: string,
    structureName: string,
    ownerName: string,
    token: string,
    permission: string,
    message?: string,
  ): Promise<void> {
    const acceptUrl = `${this.baseUrl}/app/share-callback/accept-invitation?token=${token}&email=${encodeURIComponent(to)}`;
    const permissionLabel = this.permissionLabels[permission] || permission;

    const content = `
      <p style="font-size: 16px; color: #333333;">Hello,</p>
      <p style="font-size: 16px; color: #333333;">
        <strong>${ownerName}</strong> has shared the structure <strong>"${structureName}"</strong> with you.
      </p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666666;">Permission Level:</p>
        <p style="margin: 5px 0 0 0; font-size: 16px; color: #333333; font-weight: bold;">${permissionLabel}</p>
      </div>
      ${
        message
          ? `
        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4a90e2;">
          <p style="margin: 0; font-size: 14px; color: #333333;"><strong>Message from ${ownerName}:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666666;">${message}</p>
        </div>
      `
          : ''
      }
      <div style="text-align: center; margin: 30px 0;">
        <a href="${acceptUrl}" 
           style="background-color: #4a90e2; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Accept Invitation
        </a>
      </div>
      <p style="font-size: 14px; color: #777777;">
      Please log in to accept this invitation. If you are logged out, log back in and then accept the invitation.
      </p>
      <p style="font-size: 12px; color: #999999; margin-top: 20px;">
        If you don't want to accept this invitation, you can simply ignore this email.
      </p>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: `${ownerName} shared "${structureName}" with you`,
      html: this.getEmailTemplate('#4a90e2', 'Structure Shared', content),
    };

    await this.sendEmailWithRetry(mailOptions);
  }

  async sendStructureShareNotification(
    to: string,
    structureName: string,
    ownerName: string,
    permission: string,
    message?: string,
  ): Promise<void> {
    const dashboardUrl = `${this.baseUrl}/app/dashboard`;
    const permissionLabel = this.permissionLabels[permission] || permission;

    const content = `
      <p style="font-size: 16px; color: #333333;">Hello,</p>
      <p style="font-size: 16px; color: #333333;">
        <strong>${ownerName}</strong> has shared the structure <strong>"${structureName}"</strong> with you.
      </p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666666;">Permission Level:</p>
        <p style="margin: 5px 0 0 0; font-size: 16px; color: #333333; font-weight: bold;">${permissionLabel}</p>
      </div>
      ${
        message
          ? `
        <div style="background-color: #e8f4fd; padding: 15px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #4a90e2;">
          <p style="margin: 0; font-size: 14px; color: #333333;"><strong>Message from ${ownerName}:</strong></p>
          <p style="margin: 10px 0 0 0; font-size: 14px; color: #666666;">${message}</p>
        </div>
      `
          : ''
      }
      <p style="font-size: 16px; color: #333333;">
        You can now access this structure from your dashboard.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${dashboardUrl}" 
           style="background-color: #28a745; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-size: 16px;">
          Go to Dashboard
        </a>
      </div>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: process.env.GMAIL_USER,
      to,
      subject: `${ownerName} shared "${structureName}" with you`,
      html: this.getEmailTemplate('#28a745', 'Structure Shared', content),
    };

    await this.sendEmailWithRetry(mailOptions);
  }
}
