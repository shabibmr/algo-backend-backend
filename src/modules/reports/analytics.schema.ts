import { z } from 'zod';

export const analyticsDateRangeSchema = z.object({
  query: z.object({
    start_date: z.string().optional(),
    end_date: z.string().optional(),
    company_id: z.string().optional(),
    branch_id: z.string().optional(),
  }),
});

export const analyticsAsOfDateSchema = z.object({
  query: z.object({
    as_of_date: z.string().optional(),
    company_id: z.string().optional(),
    branch_id: z.string().optional(),
    days_inactive: z.string().optional(),
  }),
});
