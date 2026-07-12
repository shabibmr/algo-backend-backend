import { Request, Response, NextFunction } from 'express';
import {
  DepartmentService,
  DesignationService,
  EmployeeService,
  EmployeeDocumentService,
  LeaveService,
  AttendanceService,
  ShiftService,
  PayslipService,
  SalaryRevisionService,
  AttendanceSummaryService,
  OvertimeReportService,
} from './employee.service';
import { ApiResponse } from '../../core/types';

export const EmployeeController = {
  // ── Department ──────────────────────────────────────────────
  async listDepartments(req: Request, res: Response, next: NextFunction) {
    try {
      const departments = await DepartmentService.listDepartments();
      const response: ApiResponse<typeof departments> = {
        success: true,
        data: departments,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const dept = await DepartmentService.getDepartment(Number(id));
      const response: ApiResponse<typeof dept> = {
        success: true,
        data: dept,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await DepartmentService.createDepartment(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Department created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await DepartmentService.updateDepartment(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Department updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteDepartment(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await DepartmentService.deleteDepartment(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Department deleted successfully (soft delete)',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Designation ─────────────────────────────────────────────
  async listDesignations(req: Request, res: Response, next: NextFunction) {
    try {
      const designations = await DesignationService.listDesignations();
      const response: ApiResponse<typeof designations> = {
        success: true,
        data: designations,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getDesignation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const des = await DesignationService.getDesignation(Number(id));
      const response: ApiResponse<typeof des> = {
        success: true,
        data: des,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createDesignation(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await DesignationService.createDesignation(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Designation created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateDesignation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await DesignationService.updateDesignation(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Designation updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteDesignation(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await DesignationService.deleteDesignation(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Designation deleted successfully (soft delete)',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── EmployeeDetails ─────────────────────────────────────────
  async listEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const employees = await EmployeeService.listEmployees();
      const response: ApiResponse<typeof employees> = {
        success: true,
        data: employees,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async lookupEmployees(req: Request, res: Response, next: NextFunction) {
    try {
      const search = req.query.search ? String(req.query.search) : undefined;
      const result = await EmployeeService.lookupEmployees(search);
      const response: ApiResponse<typeof result> = {
        success: true,
        data: result,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const employee = await EmployeeService.getEmployee(Number(id));
      const response: ApiResponse<typeof employee> = {
        success: true,
        data: employee,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await EmployeeService.createEmployee(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Employee created successfully w/ integrated bank and salary setup',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const updated = await EmployeeService.updateEmployee(Number(id), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Employee details updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async deleteEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      await EmployeeService.deleteEmployee(Number(id), user);
      const response: ApiResponse<null> = {
        success: true,
        message: 'Employee deleted successfully (soft delete)',
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getSalaryHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const history = await EmployeeService.getSalaryHistory(Number(id));
      const response: ApiResponse<typeof history> = {
        success: true,
        data: history,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Employee Documents ──────────────────────────────────────
  async addDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const created = await EmployeeDocumentService.addDocument(Number(id), req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Employee document added successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { docId } = req.params;
      const user = req.user?.username;
      const updated = await EmployeeDocumentService.updateDocument(Number(docId), req.body, user);
      const response: ApiResponse<typeof updated> = {
        success: true,
        message: 'Document updated successfully',
        data: updated,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getUpcomingExpiries(req: Request, res: Response, next: NextFunction) {
    try {
      const days = req.query.days ? Number(req.query.days) : 30;
      const docs = await EmployeeDocumentService.getUpcomingExpiries(days);
      const response: ApiResponse<typeof docs> = {
        success: true,
        data: docs,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Leave Policy & Allocation ──────────────────────────────
  async listPolicies(req: Request, res: Response, next: NextFunction) {
    try {
      const policies = await LeaveService.listPolicies();
      const response: ApiResponse<typeof policies> = {
        success: true,
        data: policies,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async createPolicy(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await LeaveService.createPolicy(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Leave policy created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async allocateLeave(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await LeaveService.allocateLeave(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Leave allocated successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getLeaveAllocations(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();
      const allocations = await LeaveService.getLeaveAllocations(Number(id), year);
      const response: ApiResponse<typeof allocations> = {
        success: true,
        data: allocations,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Leave Request ──────────────────────────────────────────
  async createLeaveRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const request = await LeaveService.createLeaveRequest(Number(id), req.body, user);
      const response: ApiResponse<typeof request> = {
        success: true,
        message: 'Leave request submitted successfully (Pending)',
        data: request,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async updateLeaveRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { requestId } = req.params;
      const { status, reason } = req.body;
      const user = req.user?.username;
      const request = await LeaveService.updateLeaveRequestStatus(
        Number(requestId),
        status,
        reason,
        user,
      );
      const response: ApiResponse<typeof request> = {
        success: true,
        message: `Leave request status updated to ${status} successfully`,
        data: request,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async listLeaveRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const employeeId = req.query.employeeId ? Number(req.query.employeeId) : undefined;
      const requests = await LeaveService.listLeaveRequests(employeeId);
      const response: ApiResponse<typeof requests> = {
        success: true,
        data: requests,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Attendance Details ──────────────────────────────────────
  async logAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const record = await AttendanceService.logAttendance(Number(id), req.body, user);
      const response: ApiResponse<typeof record> = {
        success: true,
        message: 'Attendance logged successfully',
        data: record,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getMonthlyRoster(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const month = req.query.month ? Number(req.query.month) : new Date().getMonth() + 1;
      const year = req.query.year ? Number(req.query.year) : new Date().getFullYear();

      const roster = await AttendanceService.getMonthlyRoster(Number(id), month, year);
      const response: ApiResponse<typeof roster> = {
        success: true,
        data: roster,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Shift Master & Assignments ──────────────────────────────
  async createShift(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const created = await ShiftService.createShift(req.body, user);
      const response: ApiResponse<typeof created> = {
        success: true,
        message: 'Shift created successfully',
        data: created,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async listShifts(req: Request, res: Response, next: NextFunction) {
    try {
      const shifts = await ShiftService.listShifts();
      const response: ApiResponse<typeof shifts> = {
        success: true,
        data: shifts,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async assignShift(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const user = req.user?.username;
      const assignment = await ShiftService.assignShift(Number(id), req.body, user);
      const response: ApiResponse<typeof assignment> = {
        success: true,
        message: 'Shift assigned successfully to employee',
        data: assignment,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getEmployeeShiftRoster(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const date = req.query.date ? new Date(req.query.date as string) : new Date();
      const currentShift = await ShiftService.getEmployeeShiftRoster(Number(id), date);
      const response: ApiResponse<typeof currentShift> = {
        success: true,
        data: currentShift,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Payslip ─────────────────────────────────────────────────
  async createPayslip(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user?.username;
      const payslip = await PayslipService.createPayslip(req.body, user);
      const response: ApiResponse<typeof payslip> = {
        success: true,
        message: 'Payslip created successfully',
        data: payslip,
        requestId: req.requestId,
      };
      return res.status(201).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async getPayslip(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const payslip = await PayslipService.getPayslip(Number(id));
      const response: ApiResponse<typeof payslip> = {
        success: true,
        data: payslip,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async listByEmployee(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId } = req.params;
      const payslips = await PayslipService.listByEmployee(employeeId);
      const response: ApiResponse<typeof payslips> = {
        success: true,
        data: payslips,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  async listByPeriod(req: Request, res: Response, next: NextFunction) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) {
        throw new Error('startDate and endDate query parameters are required');
      }
      const payslips = await PayslipService.listByPeriod(startDate as string, endDate as string);
      const response: ApiResponse<typeof payslips> = {
        success: true,
        data: payslips,
        requestId: req.requestId,
      };
      return res.status(200).json(response);
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 57: Salary Revision ──────────────────────────────────
  async postSalaryRevision(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SalaryRevisionService.revise(
        Number(req.params.id),
        req.body,
        req.user?.username,
      );
      return res
        .status(201)
        .json({ success: true, message: 'Salary revised', data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
  async getSalaryRevisionHistory(req: Request, res: Response, next: NextFunction) {
    try {
      const data = await SalaryRevisionService.getHistory(Number(req.params.id));
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 58: Attendance Monthly Summary ───────────────────────
  async getAttendanceSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const month = String(req.query.month || new Date().toISOString().slice(0, 7));
      const data = await AttendanceSummaryService.getMonthlySummary(Number(req.params.id), month);
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },

  // ── Task 59: Overtime Report ──────────────────────────────────
  async getOvertimeReport(req: Request, res: Response, next: NextFunction) {
    try {
      const month = String(req.query.month || new Date().toISOString().slice(0, 7));
      const department_id = req.query.department_id ? Number(req.query.department_id) : undefined;
      const data = await OvertimeReportService.getReport({ month, department_id });
      return res.status(200).json({ success: true, data, requestId: req.requestId });
    } catch (err) {
      return next(err);
    }
  },
};
export default EmployeeController;
