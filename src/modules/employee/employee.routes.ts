import { Router } from 'express';
import { EmployeeController } from './employee.controller';
import { authenticate } from '../../core/middleware/authenticate';
import { authorize } from '../../core/middleware/authorize';
import { validate } from '../../core/middleware/validate';
import {
  departmentSchema,
  designationSchema,
  employeeDetailsSchema,
  employeeDocumentSchema,
  leavePolicySchema,
  leaveAllocationSchema,
  leaveRequestSchema,
  attendanceDetailsSchema,
  shiftMasterSchema,
  employeeShiftAssignmentSchema,
  payslipMainSchema,
} from './employee.schema';

const router = Router();

// Require authentication for all employee routes
router.use(authenticate);

// ── Department Routes ───────────────────────────────────────────
router.get('/departments', authorize('Employee', 'read'), EmployeeController.listDepartments);
router.get('/departments/:id', authorize('Employee', 'read'), EmployeeController.getDepartment);
router.post(
  '/departments',
  authorize('Employee', 'create'),
  validate(departmentSchema),
  EmployeeController.createDepartment,
);
router.put(
  '/departments/:id',
  authorize('Employee', 'update'),
  validate(departmentSchema),
  EmployeeController.updateDepartment,
);
router.delete(
  '/departments/:id',
  authorize('Employee', 'delete'),
  EmployeeController.deleteDepartment,
);

// ── Designation Routes ──────────────────────────────────────────
router.get('/designations', authorize('Employee', 'read'), EmployeeController.listDesignations);
router.get('/designations/:id', authorize('Employee', 'read'), EmployeeController.getDesignation);
router.post(
  '/designations',
  authorize('Employee', 'create'),
  validate(designationSchema),
  EmployeeController.createDesignation,
);
router.put(
  '/designations/:id',
  authorize('Employee', 'update'),
  validate(designationSchema),
  EmployeeController.updateDesignation,
);
router.delete(
  '/designations/:id',
  authorize('Employee', 'delete'),
  EmployeeController.deleteDesignation,
);

// ── EmployeeDetails Routes ─────────────────────────────────────
router.get('/employees', authorize('Employee', 'read'), EmployeeController.listEmployees);
router.get('/employees/:id', authorize('Employee', 'read'), EmployeeController.getEmployee);
router.post(
  '/employees',
  authorize('Employee', 'create'),
  validate(employeeDetailsSchema),
  EmployeeController.createEmployee,
);
router.put(
  '/employees/:id',
  authorize('Employee', 'update'),
  validate(employeeDetailsSchema),
  EmployeeController.updateEmployee,
);
router.delete('/employees/:id', authorize('Employee', 'delete'), EmployeeController.deleteEmployee);
router.get(
  '/employees/:id/salary-history',
  authorize('Employee', 'read'),
  EmployeeController.getSalaryHistory,
);

// ── Employee Documents Routes ──────────────────────────────────
router.post(
  '/employees/:id/documents',
  authorize('Employee', 'create'),
  validate(employeeDocumentSchema),
  EmployeeController.addDocument,
);
router.put(
  '/documents/:docId',
  authorize('Employee', 'update'),
  validate(employeeDocumentSchema),
  EmployeeController.updateDocument,
);
router.get(
  '/documents/expiries',
  authorize('Employee', 'read'),
  EmployeeController.getUpcomingExpiries,
);

// ── Leave Policy & Allocation Routes ───────────────────────────
router.get('/leave/policies', authorize('Employee', 'read'), EmployeeController.listPolicies);
router.post(
  '/leave/policies',
  authorize('Employee', 'create'),
  validate(leavePolicySchema),
  EmployeeController.createPolicy,
);
router.post(
  '/leave/allocations',
  authorize('Employee', 'create'),
  validate(leaveAllocationSchema),
  EmployeeController.allocateLeave,
);
router.get(
  '/employees/:id/leave-allocations',
  authorize('Employee', 'read'),
  EmployeeController.getLeaveAllocations,
);

// ── Leave Request Routes ───────────────────────────────────────
router.post(
  '/employees/:id/leave-requests',
  authorize('Employee', 'create'),
  validate(leaveRequestSchema),
  EmployeeController.createLeaveRequest,
);
router.put(
  '/leave-requests/:requestId',
  authorize('Employee', 'update'),
  EmployeeController.updateLeaveRequestStatus,
);
router.get('/leave-requests', authorize('Employee', 'read'), EmployeeController.listLeaveRequests);

// ── Attendance Details Routes ──────────────────────────────────
router.post(
  '/employees/:id/attendance',
  authorize('Employee', 'create'),
  validate(attendanceDetailsSchema),
  EmployeeController.logAttendance,
);
router.get(
  '/employees/:id/roster',
  authorize('Employee', 'read'),
  EmployeeController.getMonthlyRoster,
);

// ── Shift Master & Assignment Routes ───────────────────────────
router.post(
  '/shifts',
  authorize('Employee', 'create'),
  validate(shiftMasterSchema),
  EmployeeController.createShift,
);
router.get('/shifts', authorize('Employee', 'read'), EmployeeController.listShifts);
router.post(
  '/employees/:id/shift',
  authorize('Employee', 'create'),
  validate(employeeShiftAssignmentSchema),
  EmployeeController.assignShift,
);
router.get(
  '/employees/:id/shift-roster',
  authorize('Employee', 'read'),
  EmployeeController.getEmployeeShiftRoster,
);

// ── Payslip Routes ─────────────────────────────────────────────
router.post(
  '/payslips',
  authorize('Employee', 'create'),
  validate(payslipMainSchema),
  EmployeeController.createPayslip,
);
router.get('/payslips/:id', authorize('Employee', 'read'), EmployeeController.getPayslip);
router.get(
  '/employees/:employeeId/payslips',
  authorize('Employee', 'read'),
  EmployeeController.listByEmployee,
);
router.get('/payslips', authorize('Employee', 'read'), EmployeeController.listByPeriod);

// ── Salary Revision (task 57) ─────────────────────────────────
router.post(
  '/employees/:id/salary-revision',
  authorize('Employee', 'update'),
  EmployeeController.postSalaryRevision,
);
router.get(
  '/employees/:id/salary-revisions',
  authorize('Employee', 'read'),
  EmployeeController.getSalaryRevisionHistory,
);

// ── Attendance Summary (task 58) ──────────────────────────────
router.get(
  '/employees/:id/attendance-summary',
  authorize('Employee', 'read'),
  EmployeeController.getAttendanceSummary,
);

// ── Overtime Report (task 59) ─────────────────────────────────
router.get(
  '/reports/overtime',
  authorize('Employee', 'read'),
  EmployeeController.getOvertimeReport,
);

export const employeeRoutes = router;
export default router;
