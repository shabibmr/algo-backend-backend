import { prisma } from '../../core/db/prisma';
import {
  DepartmentRepository,
  DesignationRepository,
  EmployeeDetailsRepository,
  EmployeeBankDetailsRepository,
  EmployeeSalaryDetailsRepository,
  EmployeeDocumentRepository,
  SalaryRevisionHistoryRepository,
  LeavePolicyRepository,
  LeaveAllocationRepository,
  LeaveRequestRepository,
  AttendanceDetailsRepository,
  ShiftMasterRepository,
  EmployeeShiftAssignmentRepository,
  PayslipMainRepository,
} from './employee.repository';
import { ForbiddenError, NotFoundError, ValidationError } from '../../core/errors/AppError';
import { toDecimal } from '../../core/utils/decimal';
import { Prisma } from '@prisma/client';

const departmentRepo = new DepartmentRepository();
const designationRepo = new DesignationRepository();
const employeeRepo = new EmployeeDetailsRepository();
const bankRepo = new EmployeeBankDetailsRepository();
const salaryRepo = new EmployeeSalaryDetailsRepository();
const docRepo = new EmployeeDocumentRepository();
const revisionRepo = new SalaryRevisionHistoryRepository();
const policyRepo = new LeavePolicyRepository();
const allocationRepo = new LeaveAllocationRepository();
const leaveRequestRepo = new LeaveRequestRepository();
const attendanceRepo = new AttendanceDetailsRepository();
const shiftRepo = new ShiftMasterRepository();
const assignmentRepo = new EmployeeShiftAssignmentRepository();
const payslipRepo = new PayslipMainRepository();

// Helper to calculate date range array
function getDatesInRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = [];
  const curr = new Date(startDate);
  curr.setUTCHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setUTCHours(0, 0, 0, 0);

  while (curr <= end) {
    dates.push(new Date(curr));
    curr.setUTCDate(curr.getUTCDate() + 1);
  }
  return dates;
}

export const DepartmentService = {
  // Returns the full department tree (not a real paginated page — `meta` just reflects
  // the fixed 1000-row cap so callers building a tree view get every node at once).
  async listDepartments() {
    const result = await departmentRepo.findMany({ limit: 1000 });
    const items = [];

    for (const dept of result.items) {
      const { fullPath, depth } = await this.computePathAndDepth(dept.id);
      items.push({
        ...dept,
        full_path: fullPath,
        depth,
      });
    }

    return { items, meta: result.meta };
  },

  async getDepartment(id: number) {
    const dept = await departmentRepo.findById(id);
    if (!dept) throw new NotFoundError('Department not found');

    const { fullPath, depth } = await this.computePathAndDepth(id);
    return {
      ...dept,
      full_path: fullPath,
      depth,
    };
  },

  async createDepartment(data: any, user?: string) {
    if (data.parent_dept_id) {
      const parent = await departmentRepo.findById(data.parent_dept_id);
      if (!parent) throw new ValidationError('Parent department does not exist');
    }
    return departmentRepo.create(data, { user });
  },

  async updateDepartment(id: number, data: any, user?: string) {
    const dept = await departmentRepo.findById(id);
    if (!dept) throw new NotFoundError('Department not found');

    if (data.parent_dept_id) {
      if (data.parent_dept_id === id) {
        throw new ValidationError('A department cannot be its own parent');
      }
      await this.assertNoCycle(data.parent_dept_id, id);
    }

    return departmentRepo.update(id, data, { user });
  },

  async deleteDepartment(id: number, user?: string) {
    const dept = await departmentRepo.findById(id);
    if (!dept) throw new NotFoundError('Department not found');
    return departmentRepo.delete(id, { user });
  },

  async assertNoCycle(parentId: number, selfId: number): Promise<void> {
    let currentId: number | null = parentId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (currentId === selfId) {
        throw new ValidationError('Circular dependency detected in Departments');
      }
      if (visited.has(currentId)) {
        break; // Guard against existing cycles in the DB
      }
      visited.add(currentId);

      const parent = await departmentRepo.findById(currentId);
      currentId = parent ? parent.parent_dept_id : null;
    }
  },

  async computePathAndDepth(deptId: number): Promise<{ fullPath: string; depth: number }> {
    const path: string[] = [];
    let currentId: number | null = deptId;
    const visited = new Set<number>();

    while (currentId !== null) {
      if (visited.has(currentId)) {
        break;
      }
      visited.add(currentId);

      const dept = await departmentRepo.findById(currentId);
      if (!dept) break;

      path.unshift(dept.dept_name);
      currentId = dept.parent_dept_id;
    }

    return {
      fullPath: path.join(' / '),
      depth: path.length - 1,
    };
  },
};

export const DesignationService = {
  async listDesignations() {
    return designationRepo.findMany({ limit: 1000 });
  },

  async getDesignation(id: number) {
    const des = await designationRepo.findById(id, { include: { department: true } });
    if (!des) throw new NotFoundError('Designation not found');
    return des;
  },

  async createDesignation(data: any, user?: string) {
    if (data.department_id) {
      const dept = await departmentRepo.findById(data.department_id);
      if (!dept) throw new ValidationError('Department does not exist');
    }
    return designationRepo.create(data, { user });
  },

  async updateDesignation(id: number, data: any, user?: string) {
    const des = await designationRepo.findById(id);
    if (!des) throw new NotFoundError('Designation not found');

    if (data.department_id) {
      const dept = await departmentRepo.findById(data.department_id);
      if (!dept) throw new ValidationError('Department does not exist');
    }

    return designationRepo.update(id, data, { user });
  },

  async deleteDesignation(id: number, user?: string) {
    const des = await designationRepo.findById(id);
    if (!des) throw new NotFoundError('Designation not found');
    return designationRepo.delete(id, { user });
  },
};

export const EmployeeService = {
  async getEmployee(id: number, tx?: any) {
    const client = tx || prisma;
    const employee = await client.employee_details.findUnique({
      where: { id },
      include: {
        department_rel: true,
        designation_rel: true,
        bank_details: true,
        employee_salary_details: {
          include: {
            ledger_master_employee_salary_details_salary_ledger_idToledger_master: true,
            ledger_master_employee_salary_details_adv_salary_ledger_idToledger_master: true,
          },
        },
        documents: true,
      },
    });

    if (!employee) throw new NotFoundError('Employee not found');

    // Resolve contact soft FK from address book
    let contact = null;
    if (employee.contact_id) {
      contact = await client.address_book.findUnique({
        where: { id: employee.contact_id },
      });
    }

    return {
      ...employee,
      contact,
    };
  },

  async listEmployees() {
    return employeeRepo.findMany({
      include: {
        department_rel: true,
        designation_rel: true,
      },
      limit: 100,
    });
  },

  async createEmployee(payload: any, user?: string) {
    const { bankDetails, salaryDetails, ...employeeData } = payload;

    if (employeeData.contact_id) {
      const contact = await prisma.address_book.findUnique({
        where: { id: employeeData.contact_id },
      });
      if (!contact) throw new ValidationError('Address Book contact does not exist');
    }

    return prisma.$transaction(async (tx) => {
      // Create master employee
      const employee = await employeeRepo.create(employeeData, { user, tx });
      const empId = employee.id;

      if (bankDetails) {
        await tx.employeebankdetails.create({
          data: {
            employee_id: empId,
            bank_name: bankDetails.bank_name || null,
            bank_branch: bankDetails.bank_branch || null,
            bank_code: bankDetails.bank_code || null,
            account_number: bankDetails.account_number || null,
            iban: bankDetails.iban || null,
            swift_code: bankDetails.swift_code || null,
            account_type: bankDetails.account_type || null,
            is_active: true,
            added_by: user || null,
            last_modified_by: user || null,
          },
        });
      }

      if (salaryDetails) {
        await tx.employee_salary_details.create({
          data: {
            salary_employee_id: empId,
            Employee_Id: String(empId),
            salary_ledger_id: salaryDetails.salary_ledger_id || null,
            adv_salary_ledger_id: salaryDetails.adv_salary_ledger_id || null,
            Basic_Salary: salaryDetails.Basic_Salary || 0,
            DA: salaryDetails.DA || 0,
            HRA: salaryDetails.HRA || 0,
            Conveyance: salaryDetails.Conveyance || 0,
            overtime_hourly_rate: new Prisma.Decimal(salaryDetails.overtime_hourly_rate || 0),
            OverTime_Pay: salaryDetails.OverTime_Pay || 1.0,
            Monthly_Leave: salaryDetails.Monthly_Leave || 0,
            Weekly_Leave: salaryDetails.Weekly_Leave || 0,
            Annual_Leave: salaryDetails.Annual_Leave || 0,
            Working_Hours: salaryDetails.Working_Hours || 8,
            isActive: true,
            salary_ledger: '', // Backwards compatibility legacy string
            adv_salary_ledger: '',
          },
        });

        const gross =
          (salaryDetails.Basic_Salary || 0) +
          (salaryDetails.DA || 0) +
          (salaryDetails.HRA || 0) +
          (salaryDetails.Conveyance || 0);

        await tx.salaryrevisionhistory.create({
          data: {
            employee_id: empId,
            revision_date: salaryDetails.effective_from
              ? new Date(salaryDetails.effective_from)
              : new Date(),
            basic_salary_before: null,
            basic_salary_after: new Prisma.Decimal(salaryDetails.Basic_Salary || 0),
            gross_before: null,
            gross_after: new Prisma.Decimal(gross),
            revision_reason: 'Initial salary setup',
            revised_by: user || 'System',
            added_by: user || null,
            last_modified_by: user || null,
          },
        });
      }

      return this.getEmployee(empId, tx);
    });
  },

  async updateEmployee(id: number, payload: any, user?: string) {
    const existing = await employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Employee not found');

    const { bankDetails, salaryDetails, ...employeeData } = payload;

    return prisma.$transaction(async (tx) => {
      await employeeRepo.update(id, employeeData, { user, tx });

      if (bankDetails) {
        await tx.employeebankdetails.upsert({
          where: { employee_id: id },
          create: {
            employee_id: id,
            bank_name: bankDetails.bank_name || null,
            bank_branch: bankDetails.bank_branch || null,
            bank_code: bankDetails.bank_code || null,
            account_number: bankDetails.account_number || null,
            iban: bankDetails.iban || null,
            swift_code: bankDetails.swift_code || null,
            account_type: bankDetails.account_type || null,
            is_active: true,
            added_by: user || null,
            last_modified_by: user || null,
          },
          update: {
            ...bankDetails,
            last_modified_by: user || null,
            updated_at: new Date(),
          },
        });
      }

      if (salaryDetails) {
        const currentSalary = await tx.employee_salary_details.findFirst({
          where: { salary_employee_id: id },
        });

        const newBasic =
          salaryDetails.Basic_Salary !== undefined
            ? salaryDetails.Basic_Salary
            : currentSalary?.Basic_Salary || 0;
        const newDA = salaryDetails.DA !== undefined ? salaryDetails.DA : currentSalary?.DA || 0;
        const newHRA =
          salaryDetails.HRA !== undefined ? salaryDetails.HRA : currentSalary?.HRA || 0;
        const newConveyance =
          salaryDetails.Conveyance !== undefined
            ? salaryDetails.Conveyance
            : currentSalary?.Conveyance || 0;
        const grossAfter = newBasic + newDA + newHRA + newConveyance;

        const basicBefore = currentSalary?.Basic_Salary || 0;
        const grossBefore = currentSalary
          ? Number(currentSalary.Basic_Salary || 0) +
            Number(currentSalary.DA || 0) +
            Number(currentSalary.HRA || 0) +
            Number(currentSalary.Conveyance || 0)
          : 0;

        const isRevised = basicBefore !== newBasic || grossBefore !== grossAfter;

        if (currentSalary) {
          await tx.employee_salary_details.update({
            where: { id: currentSalary.id },
            data: {
              salary_ledger_id: salaryDetails.salary_ledger_id,
              adv_salary_ledger_id: salaryDetails.adv_salary_ledger_id,
              Basic_Salary: salaryDetails.Basic_Salary,
              DA: salaryDetails.DA,
              HRA: salaryDetails.HRA,
              Conveyance: salaryDetails.Conveyance,
              overtime_hourly_rate:
                salaryDetails.overtime_hourly_rate !== undefined
                  ? new Prisma.Decimal(salaryDetails.overtime_hourly_rate)
                  : undefined,
              OverTime_Pay: salaryDetails.OverTime_Pay,
              Monthly_Leave: salaryDetails.Monthly_Leave,
              Weekly_Leave: salaryDetails.Weekly_Leave,
              Annual_Leave: salaryDetails.Annual_Leave,
              Working_Hours: salaryDetails.Working_Hours,
            },
          });
        } else {
          await tx.employee_salary_details.create({
            data: {
              salary_employee_id: id,
              Employee_Id: String(id),
              salary_ledger_id: salaryDetails.salary_ledger_id || null,
              adv_salary_ledger_id: salaryDetails.adv_salary_ledger_id || null,
              Basic_Salary: salaryDetails.Basic_Salary || 0,
              DA: salaryDetails.DA || 0,
              HRA: salaryDetails.HRA || 0,
              Conveyance: salaryDetails.Conveyance || 0,
              overtime_hourly_rate: new Prisma.Decimal(salaryDetails.overtime_hourly_rate || 0),
              OverTime_Pay: salaryDetails.OverTime_Pay || 1.0,
              Monthly_Leave: salaryDetails.Monthly_Leave || 0,
              Weekly_Leave: salaryDetails.Weekly_Leave || 0,
              Annual_Leave: salaryDetails.Annual_Leave || 0,
              Working_Hours: salaryDetails.Working_Hours || 8,
              isActive: true,
              salary_ledger: '',
              adv_salary_ledger: '',
            },
          });
        }

        if (isRevised) {
          await tx.salaryrevisionhistory.create({
            data: {
              employee_id: id,
              revision_date: salaryDetails.effective_from
                ? new Date(salaryDetails.effective_from)
                : new Date(),
              basic_salary_before: new Prisma.Decimal(basicBefore),
              basic_salary_after: new Prisma.Decimal(newBasic),
              gross_before: new Prisma.Decimal(grossBefore),
              gross_after: new Prisma.Decimal(grossAfter),
              revision_reason: 'Salary updated/revised',
              revised_by: user || 'System',
              added_by: user || null,
              last_modified_by: user || null,
            },
          });
        }
      }

      return this.getEmployee(id, tx);
    });
  },

  async deleteEmployee(id: number, user?: string) {
    const existing = await employeeRepo.findById(id);
    if (!existing) throw new NotFoundError('Employee not found');
    return employeeRepo.delete(id, { user });
  },

  async getSalaryHistory(employeeId: number) {
    return revisionRepo.findMany({
      where: { employee_id: employeeId },
      orderBy: { revision_date: 'desc' },
      limit: 100,
    });
  },
};

export const EmployeeDocumentService = {
  async addDocument(employeeId: number, data: any, user?: string) {
    const employee = await employeeRepo.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');

    const existing = await docRepo.findFirst({
      where: {
        employee_id: employeeId,
        doc_type: data.doc_type,
      },
    });

    if (existing) {
      throw new ValidationError(
        `Document of type ${data.doc_type} already exists for this employee. Use update.`,
      );
    }

    return docRepo.create(
      {
        employee_id: employeeId,
        ...data,
        issue_date: data.issue_date ? new Date(data.issue_date) : null,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : null,
      },
      { user },
    );
  },

  async updateDocument(docId: number, data: any, user?: string) {
    const doc = await docRepo.findById(docId);
    if (!doc) throw new NotFoundError('Document not found');

    return docRepo.update(
      docId,
      {
        ...data,
        issue_date: data.issue_date ? new Date(data.issue_date) : undefined,
        expiry_date: data.expiry_date ? new Date(data.expiry_date) : undefined,
      },
      { user },
    );
  },

  async getUpcomingExpiries(days = 30) {
    const expiryThreshold = new Date();
    expiryThreshold.setDate(expiryThreshold.getDate() + days);

    return prisma.employeedocuments.findMany({
      where: {
        expiry_date: {
          gte: new Date(),
          lte: expiryThreshold,
        },
      },
      include: {
        employee_details: true,
      },
      orderBy: {
        expiry_date: 'asc',
      },
    });
  },
};

export const LeaveService = {
  // ── Leave Policy ───────────────────────────────────────────
  async listPolicies() {
    return policyRepo.findMany({ limit: 100 });
  },

  async createPolicy(data: any, user?: string) {
    return policyRepo.create(data, { user });
  },

  // ── Leave Allocation ───────────────────────────────────────
  async allocateLeave(data: any, user?: string) {
    const employee = await employeeRepo.findById(data.employee_id);
    if (!employee) throw new NotFoundError('Employee not found');

    const policy = await policyRepo.findById(data.leave_policy_id);
    if (!policy) throw new NotFoundError('Leave policy not found');

    return allocationRepo.create(
      {
        employee_id: data.employee_id,
        leave_policy_id: data.leave_policy_id,
        year: data.year,
        allocated_days: new Prisma.Decimal(data.allocated_days),
        carried_forward: new Prisma.Decimal(data.carried_forward || 0),
        used_days: new Prisma.Decimal(0),
      },
      { user },
    );
  },

  async getLeaveAllocations(employeeId: number, year: number) {
    return allocationRepo.findMany({
      where: {
        employee_id: employeeId,
        year,
      },
      include: {
        leave_policy: true,
      },
      limit: 100,
    });
  },

  // ── Leave Request Approval Workflow ────────────────────────
  async createLeaveRequest(employeeId: number, data: any, user?: string) {
    const employee = await employeeRepo.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');

    const policy = await policyRepo.findById(data.leave_policy_id);
    if (!policy) throw new NotFoundError('Leave policy not found');

    const year = new Date(data.from_date).getFullYear();

    // Validate allocation exists for paid leave
    if (policy.is_paid) {
      const allocation = await prisma.leaveallocation.findFirst({
        where: {
          employee_id: employeeId,
          leave_policy_id: data.leave_policy_id,
          year,
        },
      });
      if (!allocation) {
        throw new ValidationError(
          `No leave allocation found for policy ${policy.display_name} in year ${year}`,
        );
      }

      const balance =
        Number(allocation.allocated_days) +
        Number(allocation.carried_forward) -
        Number(allocation.used_days);
      if (balance < data.number_of_days) {
        throw new ValidationError(`Insufficient leave balance. Remaining: ${balance} days.`);
      }
    }

    return leaveRequestRepo.create(
      {
        employee_id: employeeId,
        leave_policy_id: data.leave_policy_id,
        from_date: new Date(data.from_date),
        to_date: new Date(data.to_date),
        number_of_days: new Prisma.Decimal(data.number_of_days),
        reason: data.reason || null,
        status: 'Pending',
        applied_by: user || null,
      },
      { user },
    );
  },

  async updateLeaveRequestStatus(
    requestId: number,
    status: 'Approved' | 'Rejected' | 'Cancelled',
    reason?: string,
    user?: string,
  ) {
    return prisma.$transaction(async (tx) => {
      const request = await tx.leaverequest.findUnique({
        where: { id: requestId },
        include: { leave_policy: true },
      });

      if (!request) throw new NotFoundError('Leave request not found');
      if (request.status === status) return request;

      const previousStatus = request.status;
      const year = new Date(request.from_date).getFullYear();

      // Find allocation
      const allocation = await tx.leaveallocation.findFirst({
        where: {
          employee_id: request.employee_id,
          leave_policy_id: request.leave_policy_id,
          year,
        },
      });

      // Update status
      const updatedRequest = await tx.leaverequest.update({
        where: { id: requestId },
        data: {
          status,
          approved_by: status === 'Approved' ? user : undefined,
          approved_at: status === 'Approved' ? new Date() : undefined,
          rejection_reason: status === 'Rejected' ? reason : undefined,
        },
      });

      // ── Transition: Pending/Rejected/Cancelled ──> Approved ──
      if (status === 'Approved' && previousStatus !== 'Approved') {
        if (request.leave_policy.is_paid) {
          if (!allocation) {
            throw new ValidationError('No leave allocation found to deduct days from.');
          }
          const newUsedDays = Number(allocation.used_days) + Number(request.number_of_days);
          await tx.leaveallocation.update({
            where: { id: allocation.id },
            data: { used_days: new Prisma.Decimal(newUsedDays) },
          });
        }

        // Generate AttendanceDetails rows with LEAVEPAID/LEAVEUNPAID status
        const dates = getDatesInRange(request.from_date, request.to_date);
        const attStatus = request.leave_policy.is_paid ? 'LEAVE_PAID' : 'LEAVE_UNPAID';

        for (const date of dates) {
          const existing = await tx.attendance_details.findFirst({
            where: {
              attendance_employee_id: request.employee_id,
              Working_Day: date,
            },
          });

          if (existing) {
            await tx.attendance_details.update({
              where: { id: existing.id },
              data: {
                status: attStatus as any,
                leave_request_id: requestId,
                Narration: `Approved Leave: ${request.leave_policy.leave_type}`,
              },
            });
          } else {
            await tx.attendance_details.create({
              data: {
                attendance_employee_id: request.employee_id,
                working_date: date,
                Working_Day: date,
                check_in_time: null,
                check_out_time: null,
                Start_Time: date,
                End_Time: null,
                Employee_Id: String(request.employee_id),
                Working_Hours: 0,
                overtime_hours: new Prisma.Decimal(0),
                status: attStatus as any,
                OverTime: 0,
                HalfDay: false,
                leave_request_id: requestId,
                Narration: `Approved Leave: ${request.leave_policy.leave_type}`,
              },
            });
          }
        }
      }

      // ── Transition: Approved ──> Rejected/Cancelled ──
      if (previousStatus === 'Approved' && (status === 'Rejected' || status === 'Cancelled')) {
        if (request.leave_policy.is_paid && allocation) {
          const newUsedDays = Math.max(
            0,
            Number(allocation.used_days) - Number(request.number_of_days),
          );
          await tx.leaveallocation.update({
            where: { id: allocation.id },
            data: { used_days: new Prisma.Decimal(newUsedDays) },
          });
        }

        // Revert linked AttendanceDetails back to ABSENT or delete them if they were auto-generated
        // For security/cleanliness, we delete the rows we created
        await tx.attendance_details.deleteMany({
          where: {
            attendance_employee_id: request.employee_id,
            leave_request_id: requestId,
          },
        });
      }

      return updatedRequest;
    });
  },

  async listLeaveRequests(employeeId?: number) {
    const where = employeeId ? { employee_id: employeeId } : {};
    return leaveRequestRepo.findMany({
      where,
      include: {
        employee_details: true,
        leave_policy: true,
      },
      orderBy: { from_date: 'desc' },
      limit: 100,
    });
  },
};

export const AttendanceService = {
  async logAttendance(employeeId: number, data: any, user?: string) {
    const employee = await employeeRepo.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');

    const workingDate = new Date(data.working_date);
    workingDate.setUTCHours(0, 0, 0, 0);

    const existing = await prisma.attendance_details.findFirst({
      where: {
        attendance_employee_id: employeeId,
        Working_Day: workingDate,
      },
    });

    let checkIn = data.check_in_time ? new Date(data.check_in_time) : null;
    let checkOut = data.check_out_time ? new Date(data.check_out_time) : null;
    let workingHours = 0;

    if (checkIn && checkOut) {
      const diffMs = checkOut.getTime() - checkIn.getTime();
      workingHours = Math.round(diffMs / (1000 * 60 * 60)); // round to nearest hour
    }

    if (existing) {
      return attendanceRepo.update(
        existing.id,
        {
          check_in_time: checkIn || undefined,
          check_out_time: checkOut || undefined,
          Working_Hours: workingHours || undefined,
          status: data.status || undefined,
          overtime_hours:
            data.overtime_hours !== undefined ? new Prisma.Decimal(data.overtime_hours) : undefined,
          Narration: data.narration || undefined,
        },
        { user },
      );
    } else {
      return attendanceRepo.create(
        {
          attendance_employee_id: employeeId,
          working_date: workingDate,
          Working_Day: workingDate,
          check_in_time: checkIn,
          check_out_time: checkOut,
          Start_Time: checkIn || workingDate,
          End_Time: checkOut,
          Employee_Id: String(employeeId),
          Working_Hours: workingHours,
          overtime_hours: new Prisma.Decimal(data.overtime_hours || 0),
          status: data.status || 'PRESENT',
          OverTime: data.overtime_hours ? Math.round(data.overtime_hours * 60) : 0,
          HalfDay: data.status === 'HALF_DAY',
          Narration: data.narration || null,
        },
        { user },
      );
    }
  },

  async getMonthlyRoster(employeeId: number, month: number, year: number) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const result = await attendanceRepo.findMany({
      where: {
        attendance_employee_id: employeeId,
        Working_Day: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { Working_Day: 'asc' },
      limit: 100,
    });

    const summary = {
      present: 0,
      absent: 0,
      halfday: 0,
      leavePaid: 0,
      leaveUnpaid: 0,
      holiday: 0,
      overtimeHours: 0.0,
    };

    result.items.forEach((rec) => {
      if (rec.status === 'PRESENT') summary.present++;
      else if (rec.status === 'ABSENT') summary.absent++;
      else if (rec.status === 'HALF_DAY') summary.halfday++;
      else if (rec.status === 'LEAVE_PAID') summary.leavePaid++;
      else if (rec.status === 'LEAVE_UNPAID') summary.leaveUnpaid++;
      else if (rec.status === 'HOLIDAY') summary.holiday++;

      summary.overtimeHours += Number(rec.overtime_hours || 0);
    });

    return {
      employeeId,
      month,
      year,
      summary,
      records: result.items,
    };
  },
};

export const ShiftService = {
  // ── Shift Master ───────────────────────────────────────────
  async createShift(data: any, user?: string) {
    // Parse time strings '09:00:00' into full dates for Prisma DateTime mapping
    const baseDate = '1970-01-01T';
    const startTime = new Date(`${baseDate}${data.start_time}Z`);
    const endTime = new Date(`${baseDate}${data.end_time}Z`);

    return shiftRepo.create(
      {
        shift_code: data.shift_code,
        shift_name: data.shift_name,
        start_time: startTime,
        end_time: endTime,
        working_hours: new Prisma.Decimal(data.working_hours),
        break_minutes: data.break_minutes || 0,
        is_night_shift: data.is_night_shift || false,
        is_active: true,
      },
      { user },
    );
  },

  async listShifts() {
    return shiftRepo.findMany({ limit: 100 });
  },

  // ── Employee Shift Assignment ──────────────────────────────
  async assignShift(employeeId: number, data: any, user?: string) {
    const employee = await employeeRepo.findById(employeeId);
    if (!employee) throw new NotFoundError('Employee not found');

    const shift = await shiftRepo.findById(data.shift_id);
    if (!shift) throw new NotFoundError('Shift not found');

    return assignmentRepo.create(
      {
        employee_id: employeeId,
        shift_id: data.shift_id,
        valid_from: new Date(data.valid_from),
        valid_to: data.valid_to ? new Date(data.valid_to) : null,
        assigned_by: user || null,
      },
      { user },
    );
  },

  async getEmployeeShiftRoster(employeeId: number, date = new Date()) {
    const assignment = await prisma.employeeshiftassignment.findFirst({
      where: {
        employee_id: employeeId,
        valid_from: { lte: date },
        OR: [{ valid_to: null }, { valid_to: { gte: date } }],
      },
      include: { shift: true },
      orderBy: { valid_from: 'desc' },
    });

    return assignment ? assignment.shift : null;
  },
};

export const PayslipService = {
  async createPayslip(data: any, user?: string) {
    return payslipRepo.create(
      {
        Employee_Id: data.Employee_Id,
        Voucher_No: data.Voucher_No || null,
        Voucher_Type: data.Voucher_Type || null,
        Voucher_Prefix: data.Voucher_Prefix || null,
        Salary_Period_Start: new Date(data.Salary_Period_Start),
        Salary_Period_End: new Date(data.Salary_Period_End),
        Date_Created: new Date(),
        Created_By: user || 'System',
        Narration: data.Narration || null,
      },
      { user },
    );
  },

  async getPayslip(id: number) {
    const payslip = await payslipRepo.findById(id);
    if (!payslip) throw new NotFoundError('Payslip not found');
    return payslip;
  },

  async listByEmployee(employeeId: string) {
    return payslipRepo.findMany({
      where: { Employee_Id: employeeId },
      limit: 100,
    });
  },

  async listByPeriod(startDate: string, endDate: string) {
    return payslipRepo.findMany({
      where: {
        Salary_Period_Start: { gte: new Date(startDate) },
        Salary_Period_End: { lte: new Date(endDate) },
      },
      limit: 100,
    });
  },
};

// ── Task 57: Salary Revision ──────────────────────────────────────────────────
export const SalaryRevisionService = {
  async revise(
    employeeId: number,
    data: { new_basic: number; new_gross: number; reason: string },
    user?: string,
  ) {
    const salaryDetails = await prisma.employee_salary_details.findFirst({
      where: { salary_employee_id: employeeId },
    });
    if (!salaryDetails) throw new NotFoundError('Employee salary details not found');

    return prisma.$transaction(async (tx) => {
      // Append revision history
      await tx.salaryrevisionhistory.create({
        data: {
          employee_id: employeeId,
          revision_date: new Date(),
          basic_salary_before: salaryDetails.Basic_Salary ?? 0,
          basic_salary_after: data.new_basic,
          gross_before: null,
          gross_after: data.new_gross,
          revision_reason: data.reason,
          revised_by: user || 'System',
          added_by: user || 'System',
        },
      });

      // Update current salary details
      await tx.employee_salary_details.updateMany({
        where: { salary_employee_id: employeeId },
        data: { Basic_Salary: data.new_basic },
      });

      return { employee_id: employeeId, new_basic: data.new_basic, new_gross: data.new_gross };
    });
  },

  async getHistory(employeeId: number) {
    return prisma.salaryrevisionhistory.findMany({
      where: { employee_id: employeeId },
      orderBy: { revision_date: 'desc' },
    });
  },
};

// ── Task 58: Attendance Monthly Summary ───────────────────────────────────────
export const AttendanceSummaryService = {
  async getMonthlySummary(employeeId: number, month: string) {
    // month format: "2025-06"
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0); // last day of month

    const rows = await prisma.attendance_details.findMany({
      where: {
        attendance_employee_id: employeeId,
        Working_Day: { gte: start, lte: end },
      },
    });

    const summary = {
      present: 0,
      absent: 0,
      half_day: 0,
      leave_paid: 0,
      leave_unpaid: 0,
      overtime_hours_total: 0,
    };

    for (const r of rows) {
      const st = r.status.toString();
      if (st === 'PRESENT') summary.present++;
      else if (st === 'ABSENT') summary.absent++;
      else if (st === 'HALF_DAY') summary.half_day++;
      else if (st === 'LEAVE_PAID') summary.leave_paid++;
      else if (st === 'LEAVE_UNPAID') summary.leave_unpaid++;
      summary.overtime_hours_total += Number(r.overtime_hours ?? 0);
    }

    return { employee_id: employeeId, month, ...summary };
  },
};

// ── Task 59: Overtime Report ──────────────────────────────────────────────────
export const OvertimeReportService = {
  async getReport(opts: { month: string; department_id?: number }) {
    const { month, department_id } = opts;
    const [year, mon] = month.split('-').map(Number);
    const start = new Date(year, mon - 1, 1);
    const end = new Date(year, mon, 0);

    const employeeWhere: any = {};
    if (department_id) employeeWhere.department_id = department_id;

    const employees = await prisma.employee_details.findMany({
      where: employeeWhere,
      select: { id: true, employee_code: true, Name: true, department_id: true },
    });

    const empIds = employees.map((e) => e.id);
    const rows = await prisma.attendance_details.groupBy({
      by: ['attendance_employee_id'],
      where: {
        attendance_employee_id: { in: empIds },
        Working_Day: { gte: start, lte: end },
        overtime_hours: { gt: 0 },
      },
      _sum: { overtime_hours: true },
    });

    const empMap = new Map(employees.map((e) => [e.id, e]));
    return rows.map((r) => ({
      employee_id: r.attendance_employee_id,
      employee: empMap.get(r.attendance_employee_id ?? 0),
      total_overtime_hours: Number(r._sum.overtime_hours ?? 0),
    }));
  },
};
