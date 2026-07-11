import { BaseRepository } from '../../core/repository/BaseRepository';
import {
  department,
  designation,
  employee_details,
  employeebankdetails,
  employee_salary_details,
  employeedocuments,
  salaryrevisionhistory,
  leavepolicy,
  leaveallocation,
  leaverequest,
  attendance_details,
  shiftmaster,
  employeeshiftassignment,
  payslip_main,
} from '@prisma/client';

export class DepartmentRepository extends BaseRepository<department> {
  constructor() {
    super({
      modelName: 'department',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class DesignationRepository extends BaseRepository<designation> {
  constructor() {
    super({
      modelName: 'designation',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class EmployeeDetailsRepository extends BaseRepository<employee_details> {
  constructor() {
    super({
      modelName: 'employee_details',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        createdAt: 'created_at',
        lastModified: 'updated_at',
      },
    });
  }
}

export class EmployeeBankDetailsRepository extends BaseRepository<employeebankdetails> {
  constructor() {
    super({
      modelName: 'employeebankdetails',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class EmployeeSalaryDetailsRepository extends BaseRepository<employee_salary_details> {
  constructor() {
    super({
      modelName: 'employee_salary_details',
      primaryKeyField: 'id',
      softDeleteField: 'isActive',
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class EmployeeDocumentRepository extends BaseRepository<employeedocuments> {
  constructor() {
    super({
      modelName: 'employeedocuments',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class SalaryRevisionHistoryRepository extends BaseRepository<salaryrevisionhistory> {
  constructor() {
    super({
      modelName: 'salaryrevisionhistory',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'last_modified',
      },
    });
  }
}

export class LeavePolicyRepository extends BaseRepository<leavepolicy> {
  constructor() {
    super({
      modelName: 'leavepolicy',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class LeaveAllocationRepository extends BaseRepository<leaveallocation> {
  constructor() {
    super({
      modelName: 'leaveallocation',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class LeaveRequestRepository extends BaseRepository<leaverequest> {
  constructor() {
    super({
      modelName: 'leaverequest',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class AttendanceDetailsRepository extends BaseRepository<attendance_details> {
  constructor() {
    super({
      modelName: 'attendance_details',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: null,
      },
    });
  }
}

export class ShiftMasterRepository extends BaseRepository<shiftmaster> {
  constructor() {
    super({
      modelName: 'shiftmaster',
      primaryKeyField: 'id',
      softDeleteField: 'is_active',
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class EmployeeShiftAssignmentRepository extends BaseRepository<employeeshiftassignment> {
  constructor() {
    super({
      modelName: 'employeeshiftassignment',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        addedBy: 'added_by',
        createdAt: 'created_at',
        lastModifiedBy: 'last_modified_by',
        lastModified: 'updated_at',
      },
    });
  }
}

export class PayslipMainRepository extends BaseRepository<payslip_main> {
  constructor() {
    super({
      modelName: 'payslip_main',
      primaryKeyField: 'id',
      softDeleteField: null,
      auditFieldMap: {
        lastModified: 'last_modified',
      },
    });
  }
}
