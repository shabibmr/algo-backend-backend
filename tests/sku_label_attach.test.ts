import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../src/core/db/prisma', () => ({
  prisma: {
    sales_invoice_main: { findUnique: vi.fn() },
    sales_invoice_details: { findMany: vi.fn() },
    sku_master: { findMany: vi.fn() },
  },
}));

import { prisma } from '../src/core/db/prisma';
import { mergeSkuLabels, SalesInvoiceReadService } from '../src/modules/transactions/voucherRead.service';

const p = prisma as any;

describe('mergeSkuLabels', () => {
  it('adds label fields to lines with a sku and leaves others unchanged', () => {
    const out = mergeSkuLabels(
      [{ voucher_sku_id: 7, qty: 1 }, { voucher_sku_id: null, qty: 2 }, { qty: 3 }],
      [{ id: 7, sku_code: 'X-L', attribute_summary: 'Size: L' }],
    );
    expect(out[0]).toMatchObject({ sku_code: 'X-L', attribute_summary: 'Size: L', qty: 1 });
    expect(out[1]).toEqual({ voucher_sku_id: null, qty: 2 });
    expect('sku_code' in out[1]).toBe(false);
    expect('attribute_summary' in out[2]).toBe(false);
  });

  it('leaves a line alone when its sku row is missing', () => {
    const out = mergeSkuLabels([{ voucher_sku_id: 9 }], []);
    expect('sku_code' in out[0]).toBe(false);
  });
});

describe('SalesInvoiceReadService.getById', () => {
  beforeEach(() => vi.clearAllMocks());

  it('labels details using a single sku_master query', async () => {
    p.sales_invoice_main.findUnique.mockResolvedValue({ id: 1 });
    p.sales_invoice_details.findMany.mockResolvedValue([
      { id: 1, voucher_sku_id: 5 },
      { id: 2, voucher_sku_id: 5 },
      { id: 3, voucher_sku_id: 6 },
      { id: 4, voucher_sku_id: null },
    ]);
    p.sku_master.findMany.mockResolvedValue([
      { id: 5, sku_code: 'A', attribute_summary: 'Size: M' },
      { id: 6, sku_code: 'B', attribute_summary: 'Size: L' },
    ]);

    const res: any = await SalesInvoiceReadService.getById(1);

    expect(p.sku_master.findMany).toHaveBeenCalledTimes(1);
    expect(res.details[0].attribute_summary).toBe('Size: M');
    expect(res.details[2].sku_code).toBe('B');
    expect('sku_code' in res.details[3]).toBe(false);
  });

  it('skips the sku query when no line has a sku', async () => {
    p.sales_invoice_main.findUnique.mockResolvedValue({ id: 1 });
    p.sales_invoice_details.findMany.mockResolvedValue([{ id: 1, voucher_sku_id: null }]);
    await SalesInvoiceReadService.getById(1);
    expect(p.sku_master.findMany).not.toHaveBeenCalled();
  });
});
