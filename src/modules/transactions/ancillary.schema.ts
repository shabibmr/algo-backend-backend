import { z } from 'zod';

export const termsAndConditionsSchema = z.object({
  body: z.object({
    Title: z.string().min(1).max(100),
    Delivery_Time: z.string().max(2000).optional().nullable(),
    Payment_Terms: z.string().max(2000).optional().nullable(),
    Warranty: z.string().max(2000).optional().nullable(),
    Validity: z.string().max(2000).optional().nullable(),
    Exclusion: z.string().max(2000).optional().nullable(),
    Extra: z.string().max(2000).optional().nullable(),
  }),
});

export const transportationDetailsSchema = z.object({
  body: z.object({
    Voucher_No: z.string().max(20).optional().nullable(),
    Voucher_Type: z.string().max(50).optional().nullable(),
    Voucher_Prefix: z.string().max(20).optional().nullable(),
    TransactionId: z.string().max(100).optional().nullable(),
    Packed_By: z.number().int().positive().optional().nullable(),
    Delivered_By: z.number().int().positive().optional().nullable(),
    vehicle_details: z.string().optional().nullable(),
    Vehicle_Id: z.string().max(50).optional().nullable(),
  }),
});

export type TermsAndConditionsInput = z.infer<typeof termsAndConditionsSchema>['body'];
export type TransportationDetailsInput = z.infer<typeof transportationDetailsSchema>['body'];
