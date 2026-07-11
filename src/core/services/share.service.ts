import nodemailer from 'nodemailer';

export interface EmailShareOptions {
  to: string;
  subject: string;
  body: string;
  attachments?: {
    filename: string;
    content: Buffer;
    contentType?: string;
  }[];
}

export class ShareService {
  private static getTransporter() {
    // Configured via SMTP variables in the environment settings
    const host = process.env.SMTP_HOST || 'smtp.mailtrap.io';
    const port = parseInt(process.env.SMTP_PORT || '2525', 10);
    const user = process.env.SMTP_USER || '';
    const pass = process.env.SMTP_PASS || '';
    const secure = process.env.SMTP_SECURE === 'true';

    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass,
      },
    });
  }

  /**
   * Dispatches an email with attached files (such as PDF invoices or Excel statements).
   */
  static async sendEmail(options: EmailShareOptions): Promise<void> {
    const transporter = this.getTransporter();
    const from = process.env.SMTP_FROM || '"algoERP" <noreply@algoerp.org>';

    await transporter.sendMail({
      from,
      to: options.to,
      subject: options.subject,
      text: options.body,
      html: `<p>${options.body.replace(/\n/g, '<br>')}</p>`,
      attachments: options.attachments?.map(att => ({
        filename: att.filename,
        content: att.content,
        contentType: att.contentType,
      })),
    });
  }
}
