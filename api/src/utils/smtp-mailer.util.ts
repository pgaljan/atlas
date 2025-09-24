import * as nodemailer from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type SmtpSettings = {
  host: string;
  port?: number | string;
  encryption?: 'TLS' | 'SSL' | 'STARTTLS' | string;
  username?: string;
  password?: string;
  serverToken?: string;
  fromEmail?: string;
  fromName?: string;
  tlsRejectUnauthorized?: boolean;
  extraHeaders?: Record<string, string>;
  perRequestTransport?: boolean;
};

export class SmtpMailerService {
  private transporter: nodemailer.Transporter;
  private settings: SmtpSettings;

  constructor(smtpSettings: SmtpSettings) {
    this.settings = smtpSettings || ({} as SmtpSettings);

    if (!this.isValidHost(String(this.settings.host))) {
      throw new Error(
        'Invalid SMTP host format. Please provide a valid hostname, "localhost", or IP address.',
      );
    }

    const transportOptions = this.buildTransportOptions(this.settings);

    try {
      this.transporter = nodemailer.createTransport(transportOptions);
    } catch (err: any) {
      throw new Error(
        `Failed to initialize SMTP transport: ${err?.message || String(err)}`,
      );
    }
  }

  private buildTransportOptions(smtp: SmtpSettings): SMTPTransport.Options {
    const enc = (smtp.encryption || '').toLowerCase();

    const parsePort = (p?: number | string) => {
      if (p === undefined || p === null) return undefined;
      const parsed = typeof p === 'string' ? parseInt(p, 10) : Number(p);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined;
    };

    let port = parsePort(smtp.port) ?? (enc === 'ssl' ? 465 : 587);
    let secure = enc === 'ssl' || port === 465;
    const requireTLS = (enc === 'starttls' || enc === 'tls') && port !== 465;

    let auth: { user: string; pass: string } | undefined;
    if (smtp.username && smtp.password) {
      auth = { user: smtp.username, pass: smtp.password };
    } else if (smtp.serverToken) {
      auth = { user: smtp.serverToken, pass: smtp.serverToken };
      if (!smtp.port && smtp.host?.includes('postmarkapp.com')) {
        port = 587;
        secure = false;
      }
    }

    const tls: any = {};
    if (smtp.tlsRejectUnauthorized === false) {
      tls.rejectUnauthorized = false;
    }

    return {
      host: smtp.host,
      port,
      secure,
      auth,
      requireTLS,
      tls,
      connectionTimeout: 10_000,
      greetingTimeout: 10_000,
      socketTimeout: 10_000,
    };
  }

  private transientErrorCodes = new Set([
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
  ]);

  private isTransientError(err: any) {
    if (!err) return false;
    if (err.code && this.transientErrorCodes.has(err.code)) return true;
    if (err.responseCode && [421, 450, 451, 452].includes(err.responseCode))
      return true;
    return false;
  }

  private async sendEmailWithRetry(
    mailOptions: nodemailer.SendMailOptions,
    maxRetries = 3,
    baseDelayMs = 500,
  ): Promise<nodemailer.SentMessageInfo> {
    let lastErr: any = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.transporter.sendMail(mailOptions);
        return result;
      } catch (err) {
        lastErr = err;
        const transient = this.isTransientError(err);
        if (!transient || attempt === maxRetries) {
          throw err;
        }
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        const jitter = Math.floor(Math.random() * 200); // 0-199ms jitter
        await new Promise((res) => setTimeout(res, delay + jitter));
      }
    }

    throw lastErr || new Error('Unknown error sending email');
  }

  private isValidHost(host?: string): boolean {
    if (!host || typeof host !== 'string') return false;

    const clean = host
      .trim()
      .replace(/^(https?:\/\/|smtp:\/\/)/i, '')
      .replace(/:.*$/, '');

    if (clean === 'localhost') return true;

    // Strict IPv4 (0-255 per octet)
    const ipv4 =
      /^(25[0-5]|2[0-4]\d|1?\d{1,2})(\.(25[0-5]|2[0-4]\d|1?\d{1,2})){3}$/;
    // IPv6 (basic validation)
    const ipv6 = /^\[?([0-9a-fA-F]{1,4}:){2,7}[0-9a-fA-F]{1,4}\]?$/;
    // Hostname (allow single-label for dev if needed)
    const hostname =
      /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)(\.[a-zA-Z0-9\-]{2,63})*$/;

    return ipv4.test(clean) || ipv6.test(clean) || hostname.test(clean);
  }

  private isValidEmail(email?: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim();

    // If you have `validator` available, prefer: return isEmail(trimmed);
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(trimmed);
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

  async sendTestEmail(to: string, fromAddress: string, fromName?: string) {
    if (!this.isValidEmail(to)) {
      throw new Error('Invalid recipient email format');
    }
    if (!this.isValidEmail(fromAddress)) {
      throw new Error('Invalid sender email format');
    }

    const timestampISO = new Date().toISOString();

    const content = `
      <p style="font-size: 16px; color: #333333;">Hello,</p>
      <p style="font-size: 16px; color: #333333;">
        This is a test email from your Atlas application to verify your SMTP settings.
      </p>
      <p style="font-size: 16px; color: #333333;">
        If you're receiving this email, your SMTP configuration is working correctly!
      </p>
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <p style="margin: 0; font-size: 14px; color: #666666;">Email sent at:</p>
        <p style="margin: 5px 0 0 0; font-size: 16px; color: #333333; font-weight: bold;">${timestampISO}</p>
      </div>
    `;

    const textFallback = `Atlas — SMTP Test Email\n\nThis is a test email sent at ${timestampISO} to verify SMTP settings.`;

    const headers = this.settings.extraHeaders ?? {};

    const mailOptions: nodemailer.SendMailOptions = {
      from: fromName ? `"${fromName}" <${fromAddress}>` : fromAddress,
      to,
      subject: `${this.settings.fromName ?? 'Atlas'} — SMTP Test Email`,
      text: textFallback,
      html: this.getEmailTemplate('#4a90e2', 'SMTP Test Email', content),
      headers,
    };

    try {
      try {
        await this.transporter.verify();
      } catch (verifyErr: any) {
        const code = verifyErr?.code;
        if (code === 'EAUTH') {
          throw new Error(
            'Authentication failed when verifying SMTP credentials. Check username/password (or server token).',
          );
        }
        if (code === 'ECONNREFUSED' || code === 'ENOTFOUND') {
          throw new Error(
            'Unable to connect to SMTP server. Check host and port.',
          );
        }
        throw new Error(
          'Failed to verify SMTP connection. See server logs for details.',
        );
      }

      const info = await this.sendEmailWithRetry(mailOptions, 3, 500);

      if (
        this.settings.perRequestTransport !== false &&
        typeof this.transporter.close === 'function'
      ) {
        try {
          this.transporter.close();
        } catch {}
      }

      return info;
    } catch (err: any) {
      const code = err?.code;
      if (code === 'ECONNREFUSED') {
        throw new Error('Connection refused — check host and port.');
      }
      if (code === 'ETIMEDOUT') {
        throw new Error('Connection timed out — check host, port and network.');
      }
      if (code === 'EAUTH') {
        throw new Error(
          'Authentication failed — check username and password (or server token).',
        );
      }
      if (code === 'ENOTFOUND') {
        throw new Error('SMTP host not found — check the hostname.');
      }
      throw new Error(
        'Failed to send test email. See server logs for details.',
      );
    }
  }
}
