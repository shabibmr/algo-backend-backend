import { z } from 'zod';

export const companyProfileSchema = z.object({
  body: z.object({
    company_name: z.string().optional(),
    branch: z.string().optional(),
    trn: z.string().optional(),
    license_number: z.string().optional(),
    fssai_license: z.string().optional(),
    email: z.string().email().optional().or(z.literal('')),
    phone_number: z.string().optional(),
    mobile_number: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    building: z.string().optional(),
    street: z.string().optional(),
    address_line: z.string().optional(),
    city: z.string().optional(),
    country: z.string().optional(),
    po_box: z.string().optional(),
    location: z.string().optional(),
    currency: z.string().max(10).optional(),
    currency_decimal: z.number().int().default(2),
  }),
});

export const financialYearSchema = z.object({
  body: z.object({
    fy_code: z.string().min(4, 'FY Code is required').max(20),
    display_name: z.string().min(4).max(50),
    start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    status: z.enum(['Open', 'Closed', 'Locked']).default('Open'),
    is_default: z.boolean().default(false),
    company_id: z.number().int(),
  }),
});

export const branchSchema = z.object({
  body: z.object({
    branch_code: z.string().min(2).max(50),
    branch_name: z.string().min(2).max(150),
    company_id: z.number().int(),
    address: z.string().optional(),
  }),
});

export const currencySchema = z.object({
  body: z.object({
    iso_code: z.string().length(3, 'ISO code must be exactly 3 characters'),
    currency_name: z.string().min(1).max(100),
    symbol: z.string().max(10).optional(),
    decimal_places: z.number().int().default(2),
    is_base_currency: z.boolean().default(false),
  }),
});

export const currencyRateSchema = z.object({
  body: z.object({
    currency_id: z.number().int(),
    rate_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be YYYY-MM-DD'),
    buy_rate: z.number().positive(),
    sell_rate: z.number().positive(),
    mid_rate: z.number().positive().optional(),
    financial_year_id: z.number().int().optional(),
  }),
});

export const voucherSeriesSchema = z.object({
  body: z.object({
    voucher_type: z.string().min(2).max(50),
    prefix: z.string().min(1).max(50),
    display_name: z.string().min(2).max(100),
    company_id: z.number().int(),
    branch_id: z.number().int().optional(),
    financial_year_id: z.number().int().optional(),
    number_length: z.number().int().default(5),
    prefix_separator: z.string().max(5).default('/'),
    starting_number: z.number().int().default(1),
    is_default: z.boolean().default(false),
    require_approval: z.boolean().default(false),
  }),
});

export const addressBookSchema = z.object({
  body: z.object({
    contact_type: z.enum(['INDIVIDUAL', 'COMPANY', 'VENDOR', 'EMPLOYEE', 'OTHER']),
    Address_Id: z.string().min(1),
    Name: z.string().min(1).max(1000),
    Designation: z.string().optional(),
    Company_Name: z.string().optional(),
    Email: z.string().email().optional().or(z.literal('')),
    Phone_Number: z.string().optional(),
    Mobile_Number: z.string().optional(),
    Building: z.string().optional(),
    Street: z.string().optional(),
    City: z.string().optional(),
    Country: z.string().optional(),
  }),
});

export const userRoleSchema = z.object({
  body: z.object({
    role_name: z.string().min(1).max(100),
    description: z.string().optional(),
  }),
});

export const userCredentialsSchema = z.object({
  body: z.object({
    contact_id: z.number().int().optional().nullable(),
    username: z.string().min(3).max(100),
    password: z.string().min(6),
    role_id: z.number().int(),
    branch_id: z.number().int().optional(),
    employee_id: z.number().int().optional(),
  }),
});

export const userUpdateCredentialsSchema = z.object({
  body: z.object({
    contact_id: z.number().int().optional().nullable(),
    password: z.string().min(6).optional(),
    role_id: z.number().int().optional(),
    branch_id: z.number().int().optional(),
    employee_id: z.number().int().optional(),
    is_active: z.boolean().optional(),
  }),
});

export const permissionsSchema = z.object({
  body: z.object({
    permissions: z.array(
      z.object({
        module_name: z.string().min(1),
        Allow_Create: z.boolean(),
        Allow_Read: z.boolean(),
        Allow_Update: z.boolean(),
        Allow_Delete: z.boolean(),
        Allow_Share: z.boolean(),
      }),
    ),
  }),
});

export const projectMasterSchema = z.object({
  body: z.object({
    PROJECT_ID: z.string().min(1).max(100),
    Project_Name: z.string().min(1).max(500),
    project_code: z.string().max(100).optional(),
    parent_project_master_id: z.number().int().optional(),
    project_owner_contact_id: z.number().int().optional(),
    associated_ledger_id: z.number().int().optional(),
    godown_id: z.number().int().optional(),
    coordinator_employee_id: z.number().int().optional(),
    Project_Description: z.string().max(1000).optional(),
    Project_Status: z.enum(['Pending', 'Active', 'OnHold', 'Completed', 'Cancelled']).optional(),
    Start_Date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    End_Date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional(),
    Estimated_Value: z.number().optional(),
    Location: z.string().max(100).optional(),
    Detail: z.string().max(5000).optional(),
  }),
});

export const errorReportSchema = z.object({
  body: z.object({
    error: z.string().min(1),
    tablename: z.string().default(''),
    query: z.string().default(''),
    client_id: z.string().optional(),
  }),
});

export const configUpdateSchema = z.object({
  body: z.object({
    value: z.string(),
  }),
});
