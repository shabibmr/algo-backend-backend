import { prisma } from '../../core/db/prisma';
import { TransactionHelperService } from './transactionHelper.service';
import { ValidationError, NotFoundError } from '../../core/errors/AppError';
import { toDecimal, add, sub, mul, round, sum } from '../../core/utils/decimal';
import { auditService } from '../../core/audit/auditService';
import { Prisma } from '@prisma/client';

// Helper: check if a financial year is locked
async function assertFyNotLocked(fyCode: string) {
  const fy = await prisma.financialyear.findFirst({
    where: { fy_code: fyCode },
  });
  if (fy && fy.status === 'Locked') {
    throw new ValidationError(`Voucher action is blocked for Locked Financial Year: ${fyCode}`);
  }
}

export const QuotationService = {
  async createQuotation(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      // Resolve Customer Ledger
      const customerLedger = await tx.ledger_master.findUnique({
        where: { id: payload.customer_ledger_id },
      });
      if (!customerLedger) {
        throw new NotFoundError(`Customer ledger with ID ${payload.customer_ledger_id} not found`);
      }

      // Generate Voucher Number
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'Quotation',
        payload.voucher_prefix,
        payload.financial_year,
      );

      // Create VoucherHeader
      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'Quotation',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      // Calculate totals
      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const detailsToCreate = [];
      const specsToCreate: any[] = [];
      const allocationsToCreate: any[] = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        detailsToCreate.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
          Item_Narration: line.narration || null,
          spec: line.spec || null,
          allocations: line.allocations || null,
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      // Create QuotationMain
      await tx.quotation_main.create({
        data: {
          id: header.id,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          voucher_ledger_id: payload.customer_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || customerLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Draft',
          Added_By: user,
          Completion_Probability: payload.completion_probability || 50,
          Revision_Number: payload.revision_number || '1',
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
          Narration: payload.narration || null,
        },
      });

      // Insert QuotationDetails and handle specs & allocations
      for (const det of detailsToCreate) {
        const detailRow = await tx.quotation_details.create({
          data: {
            voucher_id: det.voucher_id,
            item_id: det.item_id,
            voucher_sku_id: det.voucher_sku_id,
            salesperson_employee_id: det.salesperson_employee_id,
            voucher_project_id: det.voucher_project_id,
            Quantity: det.Quantity,
            Price: det.Price,
            Discount_Percent: det.Discount_Percent,
            Discount_Amount: det.Discount_Amount,
            Subtotal: det.Subtotal,
            Item_Narration: det.Item_Narration,
          },
        });

        if (det.spec) {
          specsToCreate.push({
            detail_line_id: detailRow.id,
            detail_line_type: 'QuotationDetail',
            length: det.spec.length || null,
            dimension: det.spec.dimension || null,
            spec_notes: det.spec.spec_notes || null,
          });
        }

        if (det.allocations) {
          for (const alloc of det.allocations) {
            allocationsToCreate.push({
              detail_line_id: detailRow.id,
              ledger_id: alloc.ledger_id,
              allocation_type: alloc.allocation_type,
              allocated_amount: new Prisma.Decimal(alloc.allocated_amount),
              allocation_method: alloc.allocation_method,
            });
          }
        }
      }

      if (specsToCreate.length > 0) {
        await tx.itemphysicalspecs.createMany({ data: specsToCreate });
      }

      if (allocationsToCreate.length > 0) {
        await tx.voucher_line_allocations.createMany({ data: allocationsToCreate });
      }

      await auditService.log(
        'CREATE',
        'SUCCESS',
        { voucherNo, grossTotal: grossTotal.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: grossTotal.toNumber() };
    });
  },

  async updateQuotationStatus(id: number, status: string, reason: string | null, username: string) {
    const user = username || 'system';

    return prisma.$transaction(async (tx) => {
      const qMain = await tx.quotation_main.findUnique({ where: { id } });
      if (!qMain) {
        throw new NotFoundError(`Quotation with ID ${id} not found`);
      }

      const updateData: any = { VoucherStatus: status };
      if (status === 'Closed' && reason) {
        updateData.Quotation_Dropped = true;
        updateData.Quotation_Dropped_Reason = reason;
      }

      const updated = await tx.quotation_main.update({
        where: { id },
        data: updateData,
      });

      await auditService.log('UPDATE_STATUS', 'SUCCESS', { status, reason }, user, tx);

      return updated;
    });
  },
};

export const SalesOrderService = {
  async createSalesOrder(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const customerLedger = await tx.ledger_master.findUnique({
        where: { id: payload.customer_ledger_id },
      });
      if (!customerLedger) {
        throw new NotFoundError(`Customer ledger with ID ${payload.customer_ledger_id} not found`);
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'SalesOrder',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'SalesOrder',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const detailsToCreate = [];
      const specsToCreate: any[] = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        detailsToCreate.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
          Item_Narration: line.narration || null,
          spec: line.spec || null,
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      await tx.sales_order_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          voucher_ledger_id: payload.customer_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || customerLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Draft',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
          Narration: payload.narration || null,
          Requirement_Voucher_List: payload.requirement_voucher_list
            ? JSON.stringify(payload.requirement_voucher_list)
            : null,
        },
      });

      for (const det of detailsToCreate) {
        const detailRow = await tx.sales_order_details.create({
          data: {
            voucher_id: det.voucher_id,
            item_id: det.item_id,
            voucher_sku_id: det.voucher_sku_id,
            salesperson_employee_id: det.salesperson_employee_id,
            voucher_project_id: det.voucher_project_id,
            Quantity: det.Quantity,
            Price: det.Price,
            Discount_Percent: det.Discount_Percent,
            Discount_Amount: det.Discount_Amount,
            Subtotal: det.Subtotal,
            Tax_Rate: det.Tax_Rate,
            Tax_Amount: det.Tax_Amount,
            Item_Narration: det.Item_Narration,
          },
        });

        if (det.spec) {
          specsToCreate.push({
            detail_line_id: detailRow.id,
            detail_line_type: 'SalesOrderDetail',
            length: det.spec.length || null,
            dimension: det.spec.dimension || null,
            spec_notes: det.spec.spec_notes || null,
          });
        }
      }

      if (specsToCreate.length > 0) {
        await tx.itemphysicalspecs.createMany({ data: specsToCreate });
      }

      // Handle Shipment (if provided)
      if (payload.carrier_name || payload.lr_no) {
        await tx.shipments.create({
          data: {
            voucherheaderid: header.id,
            carrier_name: payload.carrier_name || null,
            lr_no: payload.lr_no || null,
            boxes_count: payload.boxes_count || 0,
            total_weight: payload.total_weight || 0.0,
            shipped_date: new Date(payload.voucher_date),
          },
        });
      }

      await auditService.log(
        'CREATE',
        'SUCCESS',
        { voucherNo, grossTotal: grossTotal.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: grossTotal.toNumber() };
    });
  },
};

export const PurchaseOrderService = {
  async createPurchaseOrder(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const supplierLedger = await tx.ledger_master.findUnique({
        where: { id: payload.supplier_ledger_id },
      });
      if (!supplierLedger) {
        throw new NotFoundError(`Supplier ledger with ID ${payload.supplier_ledger_id} not found`);
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'PurchaseOrder',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'PurchaseOrder',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const detailsToCreate = [];
      const specsToCreate: any[] = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        detailsToCreate.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
          Item_Narration: line.narration || null,
          container_count: line.container_count || 0,
          spec: line.spec || null,
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      await tx.purchase_order_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          voucher_ledger_id: payload.supplier_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || supplierLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Draft',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
          Narration: payload.narration || null,
        },
      });

      for (const det of detailsToCreate) {
        const detailRow = await tx.purchase_order_details.create({
          data: {
            voucher_id: det.voucher_id,
            item_id: det.item_id,
            voucher_sku_id: det.voucher_sku_id,
            salesperson_employee_id: det.salesperson_employee_id,
            voucher_project_id: det.voucher_project_id,
            Quantity: det.Quantity,
            Price: det.Price,
            Discount_Percent: det.Discount_Percent,
            Discount_Amount: det.Discount_Amount,
            Subtotal: det.Subtotal,
            Tax_Rate: det.Tax_Rate,
            Tax_Amount: det.Tax_Amount,
            Item_Narration: det.Item_Narration,
            ContainerCount: det.container_count,
          },
        });

        if (det.spec) {
          specsToCreate.push({
            detail_line_id: detailRow.id,
            detail_line_type: 'PurchaseOrderDetail',
            length: det.spec.length || null,
            dimension: det.spec.dimension || null,
            spec_notes: det.spec.spec_notes || null,
          });
        }
      }

      if (specsToCreate.length > 0) {
        await tx.itemphysicalspecs.createMany({ data: specsToCreate });
      }

      // Handle Shipment (if provided)
      if (payload.carrier_name || payload.lr_no) {
        await tx.shipments.create({
          data: {
            voucherheaderid: header.id,
            carrier_name: payload.carrier_name || null,
            lr_no: payload.lr_no || null,
            boxes_count: payload.boxes_count || 0,
            total_weight: payload.total_weight || 0.0,
            shipped_date: new Date(payload.voucher_date),
          },
        });
      }

      await auditService.log(
        'CREATE',
        'SUCCESS',
        { voucherNo, grossTotal: grossTotal.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: grossTotal.toNumber() };
    });
  },
};

export const GodownTransferService = {
  async createGodownTransfer(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const fromGodown = await tx.godown.findUnique({ where: { id: payload.from_godown_id } });
      const toGodown = await tx.godown.findUnique({ where: { id: payload.to_godown_id } });
      if (!fromGodown || !toGodown) {
        throw new NotFoundError('One or both godowns not found');
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'GodownTransfer',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'GodownTransfer',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      const linesToInsert = [];
      const stockLedgerEntries = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);
        subtotalSum = add(subtotalSum, lineSubtotal);

        linesToInsert.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: 0,
          Discount_Amount: 0,
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: 0,
          Tax_Amount: 0,
          adj_value: line.adj_value || 0.0,
          Item_Narration: line.narration || null,
        });

        // 1. Qty out from source godown
        stockLedgerEntries.push({
          voucher_header_id: header.id,
          item_id: line.item_id,
          sku_id: line.sku_id || null,
          godown_id: payload.from_godown_id,
          quantity_in: new Prisma.Decimal(0),
          quantity_out: new Prisma.Decimal(line.quantity),
          unit_cost: new Prisma.Decimal(line.price),
          total_cost: new Prisma.Decimal(line.quantity * line.price),
          posting_date: new Date(payload.voucher_date),
        });

        // 2. Qty in to target godown (plus adjustment value if any)
        const finalUnitCost = add(price, toDecimal(line.adj_value || 0.0));
        const finalTotalCost = mul(qty, finalUnitCost);

        stockLedgerEntries.push({
          voucher_header_id: header.id,
          item_id: line.item_id,
          sku_id: line.sku_id || null,
          godown_id: payload.to_godown_id,
          quantity_in: new Prisma.Decimal(line.quantity),
          quantity_out: new Prisma.Decimal(0),
          unit_cost: finalUnitCost,
          total_cost: finalTotalCost,
          posting_date: new Date(payload.voucher_date),
        });
      }

      await tx.godown_tranfer_main.create({
        data: {
          id: header.id,
          from_godown_id: payload.from_godown_id,
          to_godown_id: payload.to_godown_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: `Transfer ${fromGodown.Godown_Name} -> ${toGodown.Godown_Name}`,
          Total: subtotalSum.toNumber(),
          VoucherStatus: 'Posted',
          Added_By: user,
          Narration: payload.narration || null,
        },
      });

      await tx.godown_transfer_details.createMany({
        data: linesToInsert,
      });

      await tx.stock_ledger.createMany({
        data: stockLedgerEntries,
      });

      await auditService.log(
        'POST',
        'SUCCESS',
        { voucherNo, total: subtotalSum.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: subtotalSum.toNumber() };
    });
  },
};

export const DeliveryReceiptNoteService = {
  async createDeliveryNote(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const customerLedger = await tx.ledger_master.findUnique({
        where: { id: payload.customer_ledger_id },
      });
      if (!customerLedger) {
        throw new NotFoundError(`Customer ledger with ID ${payload.customer_ledger_id} not found`);
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'DeliveryNote',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'DeliveryNote',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const detailsToCreate = [];
      const stockLedgerEntries = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        detailsToCreate.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
          Item_Narration: line.narration || null,
          source_line_id: line.source_line_id || null,
        });

        // Stock Ledger Outward
        stockLedgerEntries.push({
          voucher_header_id: header.id,
          item_id: line.item_id,
          sku_id: line.sku_id || null,
          godown_id: payload.godown_id,
          quantity_in: new Prisma.Decimal(0),
          quantity_out: new Prisma.Decimal(line.quantity),
          unit_cost: new Prisma.Decimal(line.price),
          total_cost: new Prisma.Decimal(line.quantity * line.price),
          posting_date: new Date(payload.voucher_date),
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      await tx.delivery_note_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          voucher_ledger_id: payload.customer_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || customerLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Posted',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
          Narration: payload.narration || null,
        },
      });

      // Insert detail rows and line relations
      const relationRows = [];
      for (const det of detailsToCreate) {
        const detailRow = await tx.delivery_note_details.create({
          data: {
            voucher_id: det.voucher_id,
            item_id: det.item_id,
            voucher_sku_id: det.voucher_sku_id,
            salesperson_employee_id: det.salesperson_employee_id,
            voucher_project_id: det.voucher_project_id,
            Quantity: det.Quantity,
            Price: det.Price,
            Discount_Percent: det.Discount_Percent,
            Discount_Amount: det.Discount_Amount,
            Subtotal: det.Subtotal,
            Tax_Rate: det.Tax_Rate,
            Tax_Amount: det.Tax_Amount,
            Item_Narration: det.Item_Narration,
          },
        });

        if (det.source_line_id) {
          relationRows.push({
            source_line_id: det.source_line_id,
            target_line_id: detailRow.id,
            quantity_converted: new Prisma.Decimal(det.Quantity),
          });
        }
      }

      if (relationRows.length > 0) {
        await tx.voucher_line_relations.createMany({ data: relationRows });
      }

      await tx.stock_ledger.createMany({
        data: stockLedgerEntries,
      });

      // Voucher Linkage (if source_voucher_id provided)
      if (payload.source_voucher_id) {
        await tx.voucherlinkage.create({
          data: {
            source_voucher_id: payload.source_voucher_id,
            target_voucher_id: header.id,
            link_type: 'Conversion',
            added_by: user,
            narration: `Converted from Sales Order ${payload.source_voucher_id}`,
          },
        });
      }

      // Shipment details
      if (payload.carrier_name || payload.lr_no) {
        await tx.shipments.create({
          data: {
            voucherheaderid: header.id,
            carrier_name: payload.carrier_name || null,
            lr_no: payload.lr_no || null,
            boxes_count: payload.boxes_count || 0,
            total_weight: payload.total_weight || 0.0,
            shipped_date: new Date(payload.voucher_date),
          },
        });
      }

      await auditService.log(
        'POST',
        'SUCCESS',
        { voucherNo, total: grossTotal.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: grossTotal.toNumber() };
    });
  },

  async createReceiptNote(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const supplierLedger = await tx.ledger_master.findUnique({
        where: { id: payload.supplier_ledger_id },
      });
      if (!supplierLedger) {
        throw new NotFoundError(`Supplier ledger with ID ${payload.supplier_ledger_id} not found`);
      }

      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'ReceiptNote',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'ReceiptNote',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      let discountSum = toDecimal(0);
      let taxSum = toDecimal(0);

      const detailsToCreate = [];
      const stockLedgerEntries = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price);
        const lineSubtotal = mul(qty, price);

        const discPercent = toDecimal(line.discount_percent || 0);
        const lineDiscount = round(mul(lineSubtotal, discPercent.div(100)), 2);

        const netLineAmount = sub(lineSubtotal, lineDiscount);

        const taxRate = toDecimal(line.tax_rate || 0);
        const lineTax = round(mul(netLineAmount, taxRate.div(100)), 2);

        subtotalSum = add(subtotalSum, lineSubtotal);
        discountSum = add(discountSum, lineDiscount);
        taxSum = add(taxSum, lineTax);

        detailsToCreate.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          Quantity: line.quantity,
          Price: line.price,
          Discount_Percent: line.discount_percent || 0,
          Discount_Amount: lineDiscount.toNumber(),
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: line.tax_rate || 0,
          Tax_Amount: lineTax.toNumber(),
          Item_Narration: line.narration || null,
          source_line_id: line.source_line_id || null,
        });

        // Stock Ledger Inward
        stockLedgerEntries.push({
          voucher_header_id: header.id,
          item_id: line.item_id,
          sku_id: line.sku_id || null,
          godown_id: payload.godown_id,
          quantity_in: new Prisma.Decimal(line.quantity),
          quantity_out: new Prisma.Decimal(0),
          unit_cost: new Prisma.Decimal(line.price),
          total_cost: new Prisma.Decimal(line.quantity * line.price),
          posting_date: new Date(payload.voucher_date),
        });
      }

      const grossTotal = round(add(sub(subtotalSum, discountSum), taxSum), 2);
      const roundOff = sub(grossTotal, add(sub(subtotalSum, discountSum), taxSum)).toNumber();

      await tx.receipt_note_main.create({
        data: {
          id: header.id,
          godown_id: payload.godown_id,
          salesperson_employee_id: payload.salesperson_employee_id || null,
          voucher_project_id: payload.voucher_project_id || null,
          voucher_ledger_id: payload.supplier_ledger_id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: payload.billing_name || supplierLedger.Ledger_Name,
          Total: grossTotal.toNumber(),
          Discount_in_Amount: discountSum.toNumber(),
          Vat_Amount: taxSum.toNumber(),
          Gross_Total: grossTotal.toNumber(),
          VoucherStatus: 'Posted',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Round_Off: roundOff,
          Narration: payload.narration || null,
        },
      });

      const relationRows = [];
      for (const det of detailsToCreate) {
        const detailRow = await tx.receipt_note_details.create({
          data: {
            voucher_id: det.voucher_id,
            item_id: det.item_id,
            voucher_sku_id: det.voucher_sku_id,
            salesperson_employee_id: det.salesperson_employee_id,
            voucher_project_id: det.voucher_project_id,
            Quantity: det.Quantity,
            Price: det.Price,
            Discount_Percent: det.Discount_Percent,
            Discount_Amount: det.Discount_Amount,
            Subtotal: det.Subtotal,
            Tax_Rate: det.Tax_Rate,
            Tax_Amount: det.Tax_Amount,
            Item_Narration: det.Item_Narration,
          },
        });

        if (det.source_line_id) {
          relationRows.push({
            source_line_id: det.source_line_id,
            target_line_id: detailRow.id,
            quantity_converted: new Prisma.Decimal(det.Quantity),
          });
        }
      }

      if (relationRows.length > 0) {
        await tx.voucher_line_relations.createMany({ data: relationRows });
      }

      await tx.stock_ledger.createMany({
        data: stockLedgerEntries,
      });

      if (payload.source_voucher_id) {
        await tx.voucherlinkage.create({
          data: {
            source_voucher_id: payload.source_voucher_id,
            target_voucher_id: header.id,
            link_type: 'Conversion',
            added_by: user,
            narration: `Converted from Purchase Order ${payload.source_voucher_id}`,
          },
        });
      }

      if (payload.carrier_name || payload.lr_no) {
        await tx.shipments.create({
          data: {
            voucherheaderid: header.id,
            carrier_name: payload.carrier_name || null,
            lr_no: payload.lr_no || null,
            boxes_count: payload.boxes_count || 0,
            total_weight: payload.total_weight || 0.0,
            shipped_date: new Date(payload.voucher_date),
          },
        });
      }

      await auditService.log(
        'POST',
        'SUCCESS',
        { voucherNo, total: grossTotal.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: grossTotal.toNumber() };
    });
  },

  async getPendingQuantities(sourceVoucherId: number) {
    const header = await prisma.voucher_headers.findUnique({
      where: { id: sourceVoucherId },
    });

    if (!header) {
      throw new NotFoundError(`Source voucher ${sourceVoucherId} not found`);
    }

    const isSales = header.voucher_type === 'SalesOrder';
    const lines = isSales
      ? await prisma.sales_order_details.findMany({ where: { voucher_id: sourceVoucherId } })
      : await prisma.purchase_order_details.findMany({ where: { voucher_id: sourceVoucherId } });

    const result = [];
    for (const line of lines) {
      const relations = await prisma.voucher_line_relations.findMany({
        where: { source_line_id: line.id },
      });

      const convertedQty = relations.reduce(
        (sumVal, r) => sumVal.add(new Prisma.Decimal(r.quantity_converted)),
        new Prisma.Decimal(0),
      );

      const qty = new Prisma.Decimal(line.Quantity);
      const pendingQty = qty.sub(convertedQty);

      result.push({
        lineId: line.id,
        itemId: line.item_id,
        orderedQuantity: line.Quantity,
        convertedQuantity: convertedQty.toNumber(),
        pendingQuantity: pendingQty.toNumber(),
      });
    }

    return result;
  },
};

export const MaterialStockService = {
  async createMaterialIn(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'MaterialIn',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'MaterialIn',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      const detailsToCreate = [];

      for (const line of payload.lines) {
        const cr = toDecimal(line.crQty || 0);
        const dr = toDecimal(line.drQty || 0);
        const qty = cr.greaterThan(0) ? cr : dr;
        const price = toDecimal(line.Price || 0);
        const lineSubtotal = mul(qty, price);
        subtotalSum = add(subtotalSum, lineSubtotal);

        detailsToCreate.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_sku_id: line.sku_id || null,
          Quantity: qty.toNumber(),
          Price: line.Price || 0,
          Discount_Percent: 0,
          Discount_Amount: 0,
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: 0,
          Tax_Amount: 0,
          crQty: line.crQty || 0,
          drQty: line.drQty || 0,
          Item_Narration: line.Item_Narration || null,
        });
      }

      await tx.material_in_main.create({
        data: {
          id: header.id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: 'Material Inward Log',
          Total: subtotalSum.toNumber(),
          VoucherStatus: 'Posted',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Narration: payload.narration || null,
        },
      });

      await tx.material_in_details.createMany({
        data: detailsToCreate,
      });

      await auditService.log(
        'POST',
        'SUCCESS',
        { voucherNo, total: subtotalSum.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: subtotalSum.toNumber() };
    });
  },

  async createRequirement(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'Requirement',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'Requirement',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      let subtotalSum = toDecimal(0);
      const linesToInsert = [];

      for (const line of payload.lines) {
        const qty = toDecimal(line.quantity);
        const price = toDecimal(line.price || 0.0);
        const lineSubtotal = mul(qty, price);
        subtotalSum = add(subtotalSum, lineSubtotal);

        linesToInsert.push({
          voucher_id: header.id,
          item_id: line.item_id,
          voucher_uom_id: null,
          Quantity: line.quantity,
          Price: line.price || 0.0,
          Discount_Percent: 0,
          Discount_Amount: 0,
          Subtotal: lineSubtotal.toNumber(),
          Tax_Rate: 0,
          Tax_Amount: 0,
          Item_Narration: line.narration || null,
        });
      }

      await tx.requirement_main.create({
        data: {
          id: header.id,
          Date_Created: new Date(payload.voucher_date),
          Billing_Name: 'Material Requirement Request',
          Total: subtotalSum.toNumber(),
          Gross_Total: subtotalSum.toNumber(),
          VoucherStatus: 'Draft',
          Added_By: user,
          Voucher_No_Display: voucherNo,
          Narration: payload.narration || null,
        },
      });

      await tx.requirement_details.createMany({
        data: linesToInsert,
      });

      await auditService.log(
        'CREATE',
        'SUCCESS',
        { voucherNo, total: subtotalSum.toNumber() },
        user,
        tx,
      );

      return { headerId: header.id, voucherNo, total: subtotalSum.toNumber() };
    });
  },

  async createStockRequest(payload: any, username: string, userId?: number) {
    const user = username || 'system';
    await assertFyNotLocked(payload.financial_year);

    return prisma.$transaction(async (tx) => {
      const voucherNo = await TransactionHelperService.generateNextNumber(
        tx,
        'StockRequest',
        payload.voucher_prefix,
        payload.financial_year,
      );

      const header = await tx.voucher_headers.create({
        data: {
          voucher_type: 'StockRequest',
          voucher_prefix: payload.voucher_prefix,
          voucher_no: voucherNo,
          voucher_date: new Date(payload.voucher_date),
        },
      });

      const detailsToCreate = [];

      for (const line of payload.lines) {
        detailsToCreate.push({
          voucher_id: header.id,
          inventory_item_id: line.inventory_item_id,
          voucher_uom_id: null,
          voucher_sku_id: line.sku_id || null,
          Item_ID: String(line.inventory_item_id),
          Calulated_Qty: line.calculated_qty || 0.0,
          Request_Qty: line.request_qty,
          Issue_qty: line.issue_qty || 0.0,
          Consumed_Qty: line.consumed_qty || 0.0,
        });
      }

      await tx.stock_request_main.create({
        data: {
          id: header.id,
          from_godown_id: payload.from_godown_id,
          to_godown_id: payload.to_godown_id,
          Added_By: user,
          Narration: payload.narration || null,
          VoucherStatus: 'Draft',
          Requirement_Voucher_No: payload.requirement_voucher_no || null,
          Time_Stamp: new Date(payload.voucher_date),
        },
      });

      await tx.stock_request_details.createMany({
        data: detailsToCreate,
      });

      // Requirement Linkage if matching requirement voucher no is provided
      if (payload.requirement_voucher_no) {
        const reqHeader = await tx.voucher_headers.findFirst({
          where: {
            voucher_type: 'Requirement',
            voucher_no: payload.requirement_voucher_no,
          },
        });
        if (reqHeader) {
          await tx.voucherlinkage.create({
            data: {
              source_voucher_id: reqHeader.id,
              target_voucher_id: header.id,
              link_type: 'Reference',
              added_by: user,
              narration: `Stock request linked to Requirement ${payload.requirement_voucher_no}`,
            },
          });
        }
      }

      await auditService.log('CREATE', 'SUCCESS', { voucherNo }, user, tx);

      return { headerId: header.id, voucherNo };
    });
  },

  async fulfillStockRequest(
    id: number,
    issueQuantities: { lineId: number; issueQty: number }[],
    username: string,
  ) {
    const user = username || 'system';

    return prisma.$transaction(async (tx) => {
      const main = await tx.stock_request_main.findUnique({
        where: { id },
      });
      if (!main) {
        throw new NotFoundError(`Stock request ${id} not found`);
      }

      const details = await tx.stock_request_details.findMany({
        where: { voucher_id: id },
      });

      const stockLedgerEntries = [];

      for (const item of issueQuantities) {
        const detail = details.find((d) => d.id === item.lineId);
        if (!detail) {
          throw new ValidationError(`Detail line ${item.lineId} not found on this stock request`);
        }

        // Update the detail line issue quantity
        await tx.stock_request_details.update({
          where: { id: item.lineId },
          data: { Issue_qty: item.issueQty },
        });

        // Write Stock Ledger (issue represents inventory moving from_godown to to_godown)
        if (main.from_godown_id && main.to_godown_id && detail.inventory_item_id) {
          // Out of source
          stockLedgerEntries.push({
            voucher_header_id: main.id,
            item_id: detail.inventory_item_id,
            sku_id: detail.voucher_sku_id || null,
            godown_id: main.from_godown_id,
            quantity_in: new Prisma.Decimal(0),
            quantity_out: new Prisma.Decimal(item.issueQty),
            unit_cost: new Prisma.Decimal(0),
            total_cost: new Prisma.Decimal(0),
            posting_date: new Date(),
          });

          // Into target
          stockLedgerEntries.push({
            voucher_header_id: main.id,
            item_id: detail.inventory_item_id,
            sku_id: detail.voucher_sku_id || null,
            godown_id: main.to_godown_id,
            quantity_in: new Prisma.Decimal(item.issueQty),
            quantity_out: new Prisma.Decimal(0),
            unit_cost: new Prisma.Decimal(0),
            total_cost: new Prisma.Decimal(0),
            posting_date: new Date(),
          });
        }
      }

      await tx.stock_request_main.update({
        where: { id },
        data: { VoucherStatus: 'Posted' },
      });

      if (stockLedgerEntries.length > 0) {
        await tx.stock_ledger.createMany({ data: stockLedgerEntries });
      }

      await auditService.log(
        'POST_ISSUE',
        'SUCCESS',
        { fulfilledLinesCount: issueQuantities.length },
        user,
        tx,
      );

      return { success: true };
    });
  },
};

export const JournalLedgerReportService = {
  // Walks up the account group hierarchy to determine the accounting nature
  async getLedgerNature(
    ledgerId: number,
    txClient?: any,
  ): Promise<'Assets' | 'Liabilities' | 'Income' | 'Expense' | 'Capital' | 'Other'> {
    const tx = txClient || prisma;
    const ledger = await tx.ledger_master.findUnique({ where: { id: ledgerId } });
    if (!ledger) return 'Other';
    if (!ledger.account_group_id) {
      const type = ledger.Ledger_Type || '';
      if (['Income', 'Sales'].includes(type)) return 'Income';
      if (['Expense', 'Purchase'].includes(type)) return 'Expense';
      if (['Bank', 'Cash', 'SundryDebtor', 'FixedAsset', 'Stock'].includes(type)) return 'Assets';
      if (['SundryCreditor', 'Capital', 'DutyTax', 'Tax'].includes(type)) return 'Liabilities';
      return 'Other';
    }

    let groupId = ledger.account_group_id;
    const visited = new Set<number>();
    while (groupId) {
      if (visited.has(groupId)) break;
      visited.add(groupId);
      const group = await tx.account_groups.findUnique({ where: { id: groupId } });
      if (!group) break;
      if (!group.parent_group_id) {
        const name = group.Group_Name.toLowerCase();
        if (name.includes('asset')) return 'Assets';
        if (name.includes('liabilit')) return 'Liabilities';
        if (name.includes('income') || name.includes('revenue') || name.includes('sale'))
          return 'Income';
        if (name.includes('expense') || name.includes('purchase')) return 'Expense';
        if (name.includes('capital') || name.includes('equity')) return 'Capital';
        break;
      }
      groupId = group.parent_group_id;
    }

    const type = ledger.Ledger_Type || '';
    if (['Income', 'Sales'].includes(type)) return 'Income';
    if (['Expense', 'Purchase'].includes(type)) return 'Expense';
    if (['Bank', 'Cash', 'SundryDebtor', 'FixedAsset', 'Stock'].includes(type)) return 'Assets';
    if (['SundryCreditor', 'Capital', 'DutyTax', 'Tax'].includes(type)) return 'Liabilities';
    return 'Other';
  },

  async getLedgerStatement(ledgerId: number, startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const ledger = await prisma.ledger_master.findUnique({
      where: { id: ledgerId },
    });
    if (!ledger) {
      throw new NotFoundError(`Ledger ${ledgerId} not found`);
    }

    const nature = await this.getLedgerNature(ledgerId);

    // Get basic opening balance from master (stored as string in DB)
    const masterOpeningVal = toDecimal(ledger.Opening_Balance || '0');
    // If master opening balance nature isn't defined, assume assets/expenses are debit, liabilities/capital/revenue credit
    const isDebitNature = ['Assets', 'Expense'].includes(nature);

    // Compute transactions before start date
    const preTxSums = await prisma.journal_ledger.aggregate({
      where: {
        ledger_id: ledgerId,
        posting_date: { lt: start },
      },
      _sum: {
        debit_amount: true,
        credit_amount: true,
      },
    });

    const preDebits = toDecimal(preTxSums._sum.debit_amount || 0);
    const preCredits = toDecimal(preTxSums._sum.credit_amount || 0);

    // Net opening balance
    let netOpening = toDecimal(0);
    if (isDebitNature) {
      netOpening = add(masterOpeningVal, sub(preDebits, preCredits));
    } else {
      netOpening = add(masterOpeningVal, sub(preCredits, preDebits));
    }

    // Fetch transactions in date range
    const entries = await prisma.journal_ledger.findMany({
      where: {
        ledger_id: ledgerId,
        posting_date: {
          gte: start,
          lte: end,
        },
      },
      include: {
        voucher_headers: true,
      },
      orderBy: [{ posting_date: 'asc' }, { id: 'asc' }],
    });

    // Compute running balance
    let runningVal = netOpening;
    const formattedEntries = entries.map((entry) => {
      const dr = toDecimal(entry.debit_amount || 0);
      const cr = toDecimal(entry.credit_amount || 0);

      if (isDebitNature) {
        runningVal = add(runningVal, sub(dr, cr));
      } else {
        runningVal = add(runningVal, sub(cr, dr));
      }

      return {
        id: entry.id,
        postingDate: entry.posting_date.toISOString().split('T')[0],
        voucherType: entry.voucher_headers.voucher_type,
        voucherNo: entry.voucher_headers.voucher_no,
        voucherPrefix: entry.voucher_headers.voucher_prefix,
        narration: entry.narration,
        debit: dr.toNumber(),
        credit: cr.toNumber(),
        runningBalance: runningVal.toNumber(),
      };
    });

    return {
      ledgerId: ledger.id,
      ledgerName: ledger.Ledger_Name,
      ledgerType: ledger.Ledger_Type,
      nature,
      openingBalance: netOpening.toNumber(),
      entries: formattedEntries,
      closingBalance: runningVal.toNumber(),
    };
  },

  async getTrialBalance(asOfDateStr?: string) {
    const asOfDate = asOfDateStr ? new Date(asOfDateStr) : new Date();

    const ledgers = await prisma.ledger_master.findMany({
      where: { is_active: true },
    });

    const trialEntries = [];
    let totalDebitSum = toDecimal(0);
    let totalCreditSum = toDecimal(0);

    for (const led of ledgers) {
      const nature = await this.getLedgerNature(led.id);
      const isDebitNature = ['Assets', 'Expense'].includes(nature);

      const sums = await prisma.journal_ledger.aggregate({
        where: {
          ledger_id: led.id,
          posting_date: { lte: asOfDate },
        },
        _sum: {
          debit_amount: true,
          credit_amount: true,
        },
      });

      const dbDebits = toDecimal(sums._sum.debit_amount || 0);
      const dbCredits = toDecimal(sums._sum.credit_amount || 0);
      const opBal = toDecimal(led.Opening_Balance || '0');

      let finalDebit = toDecimal(0);
      let finalCredit = toDecimal(0);

      if (isDebitNature) {
        const bal = add(opBal, sub(dbDebits, dbCredits));
        if (bal.greaterThanOrEqualTo(0)) {
          finalDebit = bal;
        } else {
          finalCredit = bal.abs();
        }
      } else {
        const bal = add(opBal, sub(dbCredits, dbDebits));
        if (bal.greaterThanOrEqualTo(0)) {
          finalCredit = bal;
        } else {
          finalDebit = bal.abs();
        }
      }

      if (finalDebit.greaterThan(0) || finalCredit.greaterThan(0)) {
        trialEntries.push({
          ledgerId: led.id,
          ledgerName: led.Ledger_Name,
          ledgerType: led.Ledger_Type,
          nature,
          debit: finalDebit.toNumber(),
          credit: finalCredit.toNumber(),
        });

        totalDebitSum = add(totalDebitSum, finalDebit);
        totalCreditSum = add(totalCreditSum, finalCredit);
      }
    }

    return {
      asOfDate: asOfDate.toISOString().split('T')[0],
      entries: trialEntries,
      totalDebit: totalDebitSum.toNumber(),
      totalCredit: totalCreditSum.toNumber(),
      isBalanced: totalDebitSum.equals(totalCreditSum),
    };
  },

  async getProfitAndLoss(startDateStr: string, endDateStr: string) {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);

    const ledgers = await prisma.ledger_master.findMany({
      where: { is_active: true },
    });

    const incomeEntries = [];
    const expenseEntries = [];
    let revenueSum = toDecimal(0);
    let expenseSum = toDecimal(0);

    for (const led of ledgers) {
      const nature = await this.getLedgerNature(led.id);
      if (nature !== 'Income' && nature !== 'Expense') continue;

      const sums = await prisma.journal_ledger.aggregate({
        where: {
          ledger_id: led.id,
          posting_date: { gte: start, lte: end },
        },
        _sum: {
          debit_amount: true,
          credit_amount: true,
        },
      });

      const dr = toDecimal(sums._sum.debit_amount || 0);
      const cr = toDecimal(sums._sum.credit_amount || 0);

      if (nature === 'Income') {
        const netIncome = sub(cr, dr);
        if (netIncome.greaterThan(0)) {
          incomeEntries.push({
            ledgerId: led.id,
            name: led.Ledger_Name,
            amount: netIncome.toNumber(),
          });
          revenueSum = add(revenueSum, netIncome);
        }
      } else if (nature === 'Expense') {
        const netExpense = sub(dr, cr);
        if (netExpense.greaterThan(0)) {
          expenseEntries.push({
            ledgerId: led.id,
            name: led.Ledger_Name,
            amount: netExpense.toNumber(),
          });
          expenseSum = add(expenseSum, netExpense);
        }
      }
    }

    const netProfit = sub(revenueSum, expenseSum);

    return {
      period: { start: startDateStr, end: endDateStr },
      revenues: incomeEntries,
      expenses: expenseEntries,
      totalRevenue: revenueSum.toNumber(),
      totalExpense: expenseSum.toNumber(),
      netProfit: netProfit.toNumber(),
    };
  },

  async getBalanceSheet(endDateStr: string) {
    const end = new Date(endDateStr);

    const ledgers = await prisma.ledger_master.findMany({
      where: { is_active: true },
    });

    const assets = [];
    const liabilities = [];
    const capital = [];

    let assetsSum = toDecimal(0);
    let liabilitiesSum = toDecimal(0);
    let capitalSum = toDecimal(0);

    for (const led of ledgers) {
      const nature = await this.getLedgerNature(led.id);
      if (!['Assets', 'Liabilities', 'Capital'].includes(nature)) continue;

      const sums = await prisma.journal_ledger.aggregate({
        where: {
          ledger_id: led.id,
          posting_date: { lte: end },
        },
        _sum: {
          debit_amount: true,
          credit_amount: true,
        },
      });

      const dr = toDecimal(sums._sum.debit_amount || 0);
      const cr = toDecimal(sums._sum.credit_amount || 0);
      const op = toDecimal(led.Opening_Balance || '0');

      if (nature === 'Assets') {
        const bal = add(op, sub(dr, cr));
        if (bal.greaterThan(0)) {
          assets.push({ ledgerId: led.id, name: led.Ledger_Name, amount: bal.toNumber() });
          assetsSum = add(assetsSum, bal);
        }
      } else if (nature === 'Liabilities') {
        const bal = add(op, sub(cr, dr));
        if (bal.greaterThan(0)) {
          liabilities.push({ ledgerId: led.id, name: led.Ledger_Name, amount: bal.toNumber() });
          liabilitiesSum = add(liabilitiesSum, bal);
        }
      } else if (nature === 'Capital') {
        const bal = add(op, sub(cr, dr));
        if (bal.greaterThan(0)) {
          capital.push({ ledgerId: led.id, name: led.Ledger_Name, amount: bal.toNumber() });
          capitalSum = add(capitalSum, bal);
        }
      }
    }

    const allRevenues = await prisma.journal_ledger.aggregate({
      where: {
        ledger_master: {
          Ledger_Type: 'Income',
        },
        posting_date: { lte: end },
      },
      _sum: {
        debit_amount: true,
        credit_amount: true,
      },
    });

    const allExpenses = await prisma.journal_ledger.aggregate({
      where: {
        ledger_master: {
          Ledger_Type: 'Expense',
        },
        posting_date: { lte: end },
      },
      _sum: {
        debit_amount: true,
        credit_amount: true,
      },
    });

    const revDr = toDecimal(allRevenues._sum.debit_amount || 0);
    const revCr = toDecimal(allRevenues._sum.credit_amount || 0);
    const expDr = toDecimal(allExpenses._sum.debit_amount || 0);
    const expCr = toDecimal(allExpenses._sum.credit_amount || 0);

    const netProfit = sub(sub(revCr, revDr), sub(expDr, expCr));

    capitalSum = add(capitalSum, netProfit);

    return {
      asOfDate: endDateStr,
      assets,
      liabilities,
      capital,
      retainedEarnings: netProfit.toNumber(),
      totalAssets: assetsSum.toNumber(),
      totalLiabilitiesAndCapital: add(liabilitiesSum, capitalSum).toNumber(),
      isBalanced: assetsSum.equals(add(liabilitiesSum, capitalSum)),
    };
  },

  async getDayBook(dateStr: string) {
    const targetDate = new Date(dateStr);
    const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(targetDate.setHours(23, 59, 59, 999));

    const entries = await prisma.journal_ledger.findMany({
      where: {
        posting_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      include: {
        voucher_headers: true,
        ledger_master: true,
      },
      orderBy: [{ id: 'asc' }],
    });

    return entries.map((e) => ({
      id: e.id,
      ledgerName: e.ledger_master.Ledger_Name,
      voucherType: e.voucher_headers.voucher_type,
      voucherNo: e.voucher_headers.voucher_no,
      debit: new Prisma.Decimal(e.debit_amount).toNumber(),
      credit: new Prisma.Decimal(e.credit_amount).toNumber(),
      narration: e.narration,
    }));
  },
};

// ── Read-only query services for posting-owned entities ──────────────────────

export const ShipmentQueryService = {
  async getByVoucherHeader(voucherHeaderId: number) {
    const shipment = await prisma.shipments.findUnique({
      where: { voucherheaderid: voucherHeaderId },
    });
    if (!shipment)
      throw new NotFoundError(`No shipment found for voucher header ${voucherHeaderId}`);
    return shipment;
  },
};

export const ItemPhysicalSpecQueryService = {
  async listByDetailLine(detailLineId: number, detailLineType?: string) {
    const where: Record<string, any> = { detail_line_id: detailLineId };
    if (detailLineType) where.detail_line_type = detailLineType;
    return prisma.itemphysicalspecs.findMany({ where });
  },
};

export const VoucherLineAllocationQueryService = {
  async listByDetailLine(detailLineId: number) {
    return prisma.voucher_line_allocations.findMany({
      where: { detail_line_id: detailLineId },
      include: { ledger_master: { select: { id: true, Ledger_Name: true } } },
    });
  },
};
