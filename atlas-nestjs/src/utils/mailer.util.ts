import * as nodemailer from 'nodemailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MailerUtil {
  private transporter: {
    sendMail: (arg0: {
      from: string;
      to: string;
      subject: string;
      text: string;
      html: string;
    }) => any;
  };

  constructor() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Send an email
  async sendMail(to: string, subject: string, text: string, html?: string) {
    try {
      const info = await this.transporter.sendMail({
        from: process.env.EMAIL_USER,
        to,
        subject,
        text,
        html,
      });
      return info;
    } catch (error) {
      throw new Error(`Error sending email: ${error.message}`);
    }
  }
}
