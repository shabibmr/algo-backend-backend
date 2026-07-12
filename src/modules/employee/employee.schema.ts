import { z } from 'zod';
import { DocType, LeaveType, LeaveRequestStatus, AttendanceStatus } from './enums';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
const timeRegex = /^\d{2}:\d{2}:\d{2}$/;

export const departmentSchema = z.object({
  body: z.object({
    dept_code: z.string().min(1).max(20),
    dept_name: z.string().min(1).max(100),
    parent_dept_id: z.number().int().optional().nullable(),
    is_active: z.boolean().default(true),
  }),
});

export const designationSchema = z.object({
  body: z.object({
    designation_code: z.string().min(1).max(20),
    designation_name: z.string().min(1).max(100),
    department_id: z.number().int().optional().nullable(),
    is_active: z.boolean().default(true),
  }),
});

export const employeeDetailsSchema = z.object({
  body: z.object({
    contact_id: z.number().int().optional().nullable(),
    employee_code: z.string().max(50).optional().nullable(),
    Name: z.string().min(1).max(100),
    Fathers_Name: z.string().max(100).optional().nullable(),
    Date_of_Birth: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
    Gender: z.string().max(100).optional().nullable(),
    Nationality: z.string().max(100).optional().nullable(),
    Marital_Status: z.string().max(100).optional().nullable(),
    Phone: z.string().max(100).optional().nullable(),
    Designation: z.string().max(100).optional().nullable(), // Legacy string field
    Department: z.string().max(100).optional().nullable(), // Legacy string field
    designation_id: z.number().int().optional().nullable(),
    department_id: z.number().int().optional().nullable(),
    Date_of_Joining: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
    date_of_leaving: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
    Biometric_ID: z.string().max(50).optional().nullable(),
    Highest_Qualification: z.string().max(100).optional().nullable(),
    Date_of_Qualification: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
    Emergency_Contact_Name: z.string().max(100).optional().nullable(),
    Emergency_Contact_No: z.string().max(100).optional().nullable(),
    Emergency_Contact_Relation: z.string().max(100).optional().nullable(),
    Image_Path: z.string().max(500).optional().nullable(),
    Show_Employee: z.boolean().optional().nullable(),
    is_active: z.boolean().default(true),

    // WPS/Bank Details 1:1 integration
    bankDetails: z
      .object({
        bank_name: z.string().max(100).optional().nullable(),
        bank_branch: z.string().max(100).optional().nullable(),
        bank_code: z.string().max(50).optional().nullable(),
        account_number: z.string().max(100).optional().nullable(),
        iban: z.string().max(50).optional().nullable(),
        swift_code: z.string().max(20).optional().nullable(),
        account_type: z.string().max(30).optional().nullable(),
      })
      .optional(),

    // Salary Details 1:1 integration
    salaryDetails: z
      .object({
        salary_ledger_id: z.number().int().optional().nullable(),
        adv_salary_ledger_id: z.number().int().optional().nullable(),
        Basic_Salary: z.number().optional().nullable(),
        DA: z.number().optional().nullable(),
        HRA: z.number().optional().nullable(),
        Conveyance: z.number().optional().nullable(),
        overtime_hourly_rate: z.number().optional().nullable(),
        OverTime_Pay: z.number().optional().nullable(),
        Monthly_Leave: z.number().int().optional().nullable(),
        Weekly_Leave: z.number().int().optional().nullable(),
        Annual_Leave: z.number().int().optional().nullable(),
        Working_Hours: z.number().int().optional().nullable(),
        effective_from: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
      })
      .optional(),
  }),
});

export const employeeDocumentSchema = z.object({
  body: z.object({
    doc_type: z.nativeEnum(DocType),
    doc_number: z.string().max(200).optional().nullable(),
    issue_date: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
    expiry_date: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
    place_of_issue: z.string().max(200).optional().nullable(),
    passport_custody: z.string().max(100).optional().nullable(),
    visa_status: z.string().max(200).optional().nullable(),
    visa_sponsor: z.string().max(200).optional().nullable(),
    airport_pass_status: z.string().max(200).optional().nullable(),
    file_path: z.string().max(500).optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
  }),
});

export const salaryRevisionHistorySchema = z.object({
  body: z.object({
    revision_date: z.string().regex(dateRegex, 'Must be YYYY-MM-DD'),
    basic_salary_before: z.number().optional().nullable(),
    basic_salary_after: z.number(),
    gross_before: z.number().optional().nullable(),
    gross_after: z.number(),
    revision_reason: z.string().max(500).optional().nullable(),
    revised_by: z.string().max(100).optional().nullable(),
  }),
});

export const leavePolicySchema = z.object({
  body: z.object({
    leave_type: z.nativeEnum(LeaveType),
    display_name: z.string().min(1).max(100),
    max_days_per_year: z.number().int().nonnegative().default(0),
    max_days_per_request: z.number().int().nonnegative().optional().nullable(),
    carry_forward_limit: z.number().int().nonnegative().default(0),
    requires_approval: z.boolean().default(true),
    is_paid: z.boolean().default(true),
    applicable_gender: z.string().max(10).optional().nullable(),
    is_active: z.boolean().default(true),
  }),
});

export const leaveAllocationSchema = z.object({
  body: z.object({
    // Required by LeaveService.allocateLeave — was stripped by Zod before this fix.
    employee_id: z.number().int(),
    leave_policy_id: z.number().int(),
    year: z.number().int(),
    allocated_days: z.number().nonnegative(),
    carried_forward: z.number().nonnegative().default(0),
    // Service always stores used_days as 0 on create; accept but ignore client value.
    used_days: z.number().nonnegative().default(0).optional(),
  }),
});

export const leaveRequestSchema = z.object({
  body: z.object({
    leave_policy_id: z.number().int(),
    from_date: z.string().regex(dateRegex, 'Must be YYYY-MM-DD'),
    to_date: z.string().regex(dateRegex, 'Must be YYYY-MM-DD'),
    number_of_days: z.number().positive(),
    reason: z.string().max(1000).optional().nullable(),
    status: z.nativeEnum(LeaveRequestStatus).default(LeaveRequestStatus.PENDING),
    rejection_reason: z.string().max(500).optional().nullable(),
  }),
});

export const attendanceDetailsSchema = z.object({
  body: z.object({
    working_date: z.string().regex(dateRegex, 'Must be YYYY-MM-DD'),
    check_in_time: z.string().optional().nullable(),
    check_out_time: z.string().optional().nullable(),
    status: z.nativeEnum(AttendanceStatus).default(AttendanceStatus.PRESENT),
    overtime_hours: z.number().nonnegative().default(0),
    narration: z.string().max(200).optional().nullable(),
  }),
});

export const shiftMasterSchema = z.object({
  body: z.object({
    shift_code: z.string().min(1).max(20),
    shift_name: z.string().min(1).max(100),
    start_time: z.string().regex(timeRegex, 'Must be HH:mm:ss'),
    end_time: z.string().regex(timeRegex, 'Must be HH:mm:ss'),
    working_hours: z.number().positive(),
    break_minutes: z.number().int().nonnegative().default(0),
    is_night_shift: z.boolean().default(false),
    is_active: z.boolean().default(true),
  }),
});

export const employeeShiftAssignmentSchema = z.object({
  body: z.object({
    shift_id: z.number().int(),
    valid_from: z.string().regex(dateRegex, 'Must be YYYY-MM-DD'),
    valid_to: z.string().regex(dateRegex, 'Must be YYYY-MM-DD').optional().nullable(),
  }),
});

export const payslipMainSchema = z.object({
  body: z.object({
    Employee_Id: z.string().min(1).max(50),
    Voucher_No: z.string().max(20).optional().nullable(),
    Voucher_Type: z.string().max(20).optional().nullable(),
    Voucher_Prefix: z.string().max(20).optional().nullable(),
    Salary_Period_Start: z.string().regex(dateRegex, 'Must be YYYY-MM-DD'),
    Salary_Period_End: z.string().regex(dateRegex, 'Must be YYYY-MM-DD'),
    Narration: z.string().max(200).optional().nullable(),
  }),
});
