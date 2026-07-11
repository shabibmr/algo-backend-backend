import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../core/db/prisma';
import { ShareService } from '../../core/services/share.service';
import { NotFoundError } from '../../core/errors/AppError';

export const VoucherExportController = {
  // Renders a high-fidelity print-ready template
  async printSalesInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const main = await prisma.sales_invoice_main.findUnique({
        where: { id },
        include: { voucher_headers: true },
      });

      if (!main) {
        throw new NotFoundError(`SalesInvoice #${id} not found`);
      }

      const details = await prisma.sales_invoice_details.findMany({
        where: { voucher_id: id },
      });

      // Simple, beautiful invoice layout with printing auto-trigger
      const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>Invoice - ${main.voucher_headers?.voucher_no || id}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 40px; line-height: 1.5; }
            .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.15); font-size: 14px; }
            .header-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .header-table td { padding: 5px; vertical-align: top; }
            .title { font-size: 28px; font-weight: bold; color: #1F497D; margin: 0; }
            .company-details { text-align: right; }
            .billing-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            .billing-table td { width: 50%; padding: 5px; vertical-align: top; }
            .details-box { background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #e3e3e3; }
            .grid-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .grid-table th { background: #1F497D; color: white; padding: 10px; text-align: left; font-size: 13px; font-weight: 600; }
            .grid-table td { padding: 10px; border-bottom: 1px solid #eee; }
            .grid-table tr.total-row td { font-weight: bold; border-top: 2px solid #1F497D; }
            .totals-container { width: 100%; margin-top: 30px; }
            .totals-table { float: right; width: 300px; border-collapse: collapse; }
            .totals-table td { padding: 8px; border-bottom: 1px solid #ddd; }
            .totals-table tr.grand-total { font-size: 16px; font-weight: bold; color: #1F497D; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #777; border-top: 1px solid #eee; padding-top: 15px; }
            @media print {
              body { margin: 0; padding: 0; }
              .invoice-box { border: none; box-shadow: none; padding: 10px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body onload="window.print()">
          <div class="invoice-box">
            <table class="header-table">
              <tr>
                <td>
                  <h1 class="title">TAX INVOICE</h1>
                  <span style="font-size: 12px; color: #666;">Original Copy</span>
                </td>
                <td class="company-details">
                  <div style="font-size: 18px; font-weight: bold; color: #1F497D;">algoERP Solutions</div>
                  <div>TRN: 100234567800003</div>
                  <div>Dubai, United Arab Emirates</div>
                </td>
              </tr>
            </table>

            <table class="billing-table">
              <tr>
                <td>
                  <div class="details-box">
                    <strong>Invoice Details:</strong><br>
                    Invoice No: ${main.voucher_headers?.voucher_prefix || ''}${main.voucher_headers?.voucher_no || ''}<br>
                    Date: ${main.voucher_headers?.voucher_date ? new Date(main.voucher_headers?.voucher_date).toLocaleDateString() : ''}<br>
                    Status: ${main.VoucherStatus || 'Draft'}
                  </div>
                </td>
                <td>
                  <div class="details-box">
                    <strong>Bill To:</strong><br>
                    Customer ID: ${main.voucher_ledger_id}<br>
                    Terms: Net 30 Days
                  </div>
                </td>
              </tr>
            </table>

            <table class="grid-table">
              <thead>
                <tr>
                  <th>Line Item Description</th>
                  <th style="text-align: right;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Tax Amount</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${details.map((line, idx) => {
                  const qty = Number(line.Quantity || 0);
                  const price = Number(line.Price || 0);
                  const tax = Number(line.Tax_Amount || 0);
                  const lineTotal = qty * price + tax;
                  return `
                    <tr>
                      <td>Line Item #${idx + 1} (Item SKU ID: ${line.item_id})</td>
                      <td style="text-align: right;">${qty.toFixed(2)}</td>
                      <td style="text-align: right;">${price.toFixed(2)}</td>
                      <td style="text-align: right;">${tax.toFixed(2)}</td>
                      <td style="text-align: right;">${lineTotal.toFixed(2)}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>

            <div class="totals-container">
              <table class="totals-table">
                <tr>
                  <td>Sub Total</td>
                  <td style="text-align: right;">${Number(main.Gross_Total || 0).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>VAT Amount (5%)</td>
                  <td style="text-align: right;">${Number(main.Vat_Amount || 0).toFixed(2)}</td>
                </tr>
                <tr class="grand-total">
                  <td>Grand Total</td>
                  <td style="text-align: right;">AED ${Number(main.Total || 0).toFixed(2)}</td>
                </tr>
              </table>
              <div style="clear: both;"></div>
            </div>

            <div class="footer">
              Thank you for business with us!<br>
              Generated by algoERP. Subject to Terms & Conditions.
            </div>
          </div>
        </body>
        </html>
      `;
      res.setHeader('Content-Type', 'text/html');
      return res.status(200).send(html);
    } catch (err) {
      return next(err);
    }
  },

  // Share voucher via Email
  async shareSalesInvoice(req: Request, res: Response, next: NextFunction) {
    try {
      const id = parseInt(req.params.id, 10);
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email address is required' });
      }

      const main = await prisma.sales_invoice_main.findUnique({
        where: { id },
        include: { voucher_headers: true },
      });

      if (!main) {
        throw new NotFoundError(`SalesInvoice #${id} not found`);
      }

      const invoiceNo = `${main.voucher_headers?.voucher_prefix || ''}${main.voucher_headers?.voucher_no || ''}`;
      const subject = `Sales Invoice Receipt - ${invoiceNo}`;
      const body = `Dear Customer,

Please find the summary of your Tax Invoice below:

Invoice Number: ${invoiceNo}
Invoice Date: ${main.voucher_headers?.voucher_date ? new Date(main.voucher_headers?.voucher_date).toLocaleDateString() : ''}
Sub Total: AED ${Number(main.Gross_Total || 0).toFixed(2)}
VAT Amount (5%): AED ${Number(main.Vat_Amount || 0).toFixed(2)}
Grand Total: AED ${Number(main.Total || 0).toFixed(2)}

Thank you for your business.

Best regards,
algoERP Accounts Team`;

      await ShareService.sendEmail({ to: email, subject, body });
      return res.status(200).json({ success: true, message: 'Invoice shared successfully' });
    } catch (err) {
      return next(err);
    }
  },
};
