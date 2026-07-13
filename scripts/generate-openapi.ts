import * as fs from 'fs';
import * as path from 'path';

// Define the OpenAPI Specification Object
const openApiSpec: any = {
  openapi: '3.0.3',
  info: {
    title: 'algoERP API',
    version: '1.0.0',
    description: 'Multi-tenant Accounting & Inventory ERP SAAS — REST API. Clean, structured, resource-oriented endpoint architecture with transaction orchestration, double-entry GL/Stock validation, and granular RBAC authorization.',
    contact: {
      name: 'algoERP Support',
      email: 'support@algoerp.com',
    },
  },
  servers: [
    {
      url: '/',
      description: 'Current Environment base path',
    },
  ],
  security: [
    {
      bearerAuth: [],
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Provide JWT token in Authorization header: `Bearer <token>`',
      },
    },
    schemas: {
      // ── Envelope Schemas ───────────────────────────────────────────
      ApiResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates whether the request was successful',
            example: true,
          },
          message: {
            type: 'string',
            description: 'Optional status message or success message',
            example: 'Operation completed successfully',
          },
          data: {
            type: 'object',
            description: 'The payload returned by the server',
          },
          requestId: {
            type: 'string',
            description: 'Unique identifier for tracing requests',
            example: '482324e8-9e99-4222-8be6-270c886bbad7',
          },
        },
        required: ['success'],
      },
      ErrorResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'object',
            properties: {
              message: {
                type: 'string',
                example: 'Validation failed',
              },
              details: {
                type: 'array',
                items: {
                  type: 'object',
                },
                description: 'Detailed errors (e.g. Zod validation failure details)',
              },
            },
            required: ['message'],
          },
          requestId: {
            type: 'string',
            example: '482324e8-9e99-4222-8be6-270c886bbad7',
          },
        },
        required: ['success', 'error'],
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 125 },
          page: { type: 'integer', example: 1 },
          limit: { type: 'integer', example: 10 },
          totalPages: { type: 'integer', example: 13 },
        },
        required: ['total', 'page', 'limit', 'totalPages'],
      },

      // ── Auth Schemas ───────────────────────────────────────────────
      LoginInput: {
        type: 'object',
        properties: {
          username: { type: 'string', example: 'admin' },
          password: { type: 'string', example: 'password123' },
        },
        required: ['username', 'password'],
      },
      RefreshInput: {
        type: 'object',
        properties: {
          refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsIn...' },
        },
        required: ['refreshToken'],
      },
      ChangePasswordInput: {
        type: 'object',
        properties: {
          currentPassword: { type: 'string', example: 'password123' },
          newPassword: { type: 'string', minLength: 6, example: 'newsecurepass123' },
        },
        required: ['currentPassword', 'newPassword'],
      },

      // ── Organization & System ──────────────────────────────────────
      CompanyProfile: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          company_name: { type: 'string', example: 'AlgoTech Corp' },
          branch: { type: 'string', example: 'Dubai HQ' },
          trn: { type: 'string', example: '100234567800003' },
          license_number: { type: 'string', example: '556677' },
          fssai_license: { type: 'string', example: '12345678901234' },
          email: { type: 'string', format: 'email', example: 'info@algotech.ae' },
          phone_number: { type: 'string', example: '+97140000000' },
          mobile_number: { type: 'string', example: '+971500000000' },
          website: { type: 'string', format: 'uri', example: 'https://algotech.ae' },
          building: { type: 'string', example: 'Marina Heights' },
          street: { type: 'string', example: 'Al Marsa Street' },
          address_line: { type: 'string', example: 'Office 204' },
          city: { type: 'string', example: 'Dubai' },
          country: { type: 'string', example: 'United Arab Emirates' },
          po_box: { type: 'string', example: '12345' },
          location: { type: 'string', example: 'Dubai Marina' },
          currency: { type: 'string', maxLength: 10, example: 'AED' },
          currency_decimal: { type: 'integer', default: 2, example: 2 },
        },
      },
      FinancialYear: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          fy_code: { type: 'string', example: 'FY2025-26' },
          display_name: { type: 'string', example: 'Financial Year 2025-2026' },
          start_date: { type: 'string', format: 'date', example: '2025-04-01' },
          end_date: { type: 'string', format: 'date', example: '2026-03-31' },
          status: { type: 'string', enum: ['Open', 'Closed', 'Locked'], default: 'Open', example: 'Open' },
          is_default: { type: 'boolean', default: false, example: true },
          company_id: { type: 'integer', example: 1 },
        },
        required: ['fy_code', 'display_name', 'start_date', 'end_date', 'company_id'],
      },
      Branch: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          branch_code: { type: 'string', example: 'DXB-BR1' },
          branch_name: { type: 'string', example: 'Dubai Branch' },
          company_id: { type: 'integer', example: 1 },
          address: { type: 'string', example: 'JLT, Dubai' },
        },
        required: ['branch_code', 'branch_name', 'company_id'],
      },
      Currency: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          iso_code: { type: 'string', minLength: 3, maxLength: 3, example: 'USD' },
          currency_name: { type: 'string', example: 'US Dollar' },
          symbol: { type: 'string', example: '$' },
          decimal_places: { type: 'integer', default: 2, example: 2 },
          is_base_currency: { type: 'boolean', default: false, example: false },
        },
        required: ['iso_code', 'currency_name'],
      },
      CurrencyRate: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          currency_id: { type: 'integer', example: 2 },
          rate_date: { type: 'string', format: 'date', example: '2026-06-21' },
          buy_rate: { type: 'number', minimum: 0.000001, example: 3.6725 },
          sell_rate: { type: 'number', minimum: 0.000001, example: 3.6730 },
          mid_rate: { type: 'number', example: 3.67275 },
          financial_year_id: { type: 'integer', example: 1 },
        },
        required: ['currency_id', 'rate_date', 'buy_rate', 'sell_rate'],
      },
      VoucherSeries: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          voucher_type: { type: 'string', example: 'SalesInvoice' },
          prefix: { type: 'string', example: 'INV' },
          display_name: { type: 'string', example: 'Standard Sales Invoice Series' },
          company_id: { type: 'integer', example: 1 },
          branch_id: { type: 'integer', example: 1 },
          financial_year_id: { type: 'integer', example: 1 },
          number_length: { type: 'integer', default: 5, example: 5 },
          prefix_separator: { type: 'string', default: '/', example: '/' },
          starting_number: { type: 'integer', default: 1, example: 1 },
          is_default: { type: 'boolean', default: false, example: true },
          require_approval: { type: 'boolean', default: false, example: false },
        },
        required: ['voucher_type', 'prefix', 'display_name', 'company_id'],
      },
      AddressBook: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          contact_type: { type: 'string', enum: ['INDIVIDUAL', 'COMPANY', 'VENDOR', 'EMPLOYEE', 'OTHER'], example: 'COMPANY' },
          Address_Id: { type: 'string', example: 'ADD-001' },
          Name: { type: 'string', example: 'Al Futtaim Trading' },
          Designation: { type: 'string', example: 'Procurement Manager' },
          Company_Name: { type: 'string', example: 'Al Futtaim Group' },
          Email: { type: 'string', format: 'email', example: 'purchasing@alfuttaim.ae' },
          Phone_Number: { type: 'string', example: '+97148888888' },
          Mobile_Number: { type: 'string', example: '+971588888888' },
          Building: { type: 'string', example: 'Al Futtaim Tower' },
          Street: { type: 'string', example: 'Baniyas Road' },
          City: { type: 'string', example: 'Dubai' },
          Country: { type: 'string', example: 'United Arab Emirates' },
        },
        required: ['contact_type', 'Address_Id', 'Name'],
      },
      ConfigUpdateInput: {
        type: 'object',
        properties: {
          value: { type: 'string', example: '5.00' },
        },
        required: ['value'],
      },
      UserRole: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          role_name: { type: 'string', example: 'SalesAdmin' },
          description: { type: 'string', example: 'Handles sales invoices and delivery notes' },
        },
        required: ['role_name'],
      },
      UserCredentialsInput: {
        type: 'object',
        properties: {
          contact_id: { type: 'integer', example: 1 },
          username: { type: 'string', example: 'john.sales' },
          password: { type: 'string', example: 'secretpassword123' },
          role_id: { type: 'integer', example: 2 },
          branch_id: { type: 'integer', example: 1 },
          employee_id: { type: 'integer', example: 3 },
        },
        required: ['username', 'password', 'role_id'],
      },
      UserCredentialsUpdateInput: {
        type: 'object',
        properties: {
          password: { type: 'string', example: 'newpassword123' },
          role_id: { type: 'integer', example: 2 },
          branch_id: { type: 'integer', example: 1 },
          employee_id: { type: 'integer', example: 3 },
          is_active: { type: 'boolean', example: true },
        },
      },
      RolePermissionsInput: {
        type: 'object',
        properties: {
          permissions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                module_name: { type: 'string', example: 'SalesInvoice' },
                Allow_Create: { type: 'boolean', example: true },
                Allow_Read: { type: 'boolean', example: true },
                Allow_Update: { type: 'boolean', example: true },
                Allow_Delete: { type: 'boolean', example: false },
                Allow_Share: { type: 'boolean', example: true },
              },
              required: ['module_name', 'Allow_Create', 'Allow_Read', 'Allow_Update', 'Allow_Delete', 'Allow_Share'],
            },
          },
        },
        required: ['permissions'],
      },
      ProjectMaster: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          PROJECT_ID: { type: 'string', example: 'PROJ-DXB-METRO' },
          Project_Name: { type: 'string', example: 'Dubai Metro Extension' },
          project_code: { type: 'string', example: 'DXB-METRO' },
          parent_project_master_id: { type: 'integer', example: null },
          project_owner_contact_id: { type: 'integer', example: 1 },
          associated_ledger_id: { type: 'integer', example: 12 },
          godown_id: { type: 'integer', example: 2 },
          coordinator_employee_id: { type: 'integer', example: 3 },
          Project_Description: { type: 'string', example: 'Metro red line expansion' },
          Project_Status: { type: 'string', enum: ['Pending', 'Active', 'OnHold', 'Completed', 'Cancelled'], example: 'Active' },
          Start_Date: { type: 'string', format: 'date', example: '2026-01-01' },
          End_Date: { type: 'string', format: 'date', example: '2026-12-31' },
          Estimated_Value: { type: 'number', example: 1500000.0 },
          Location: { type: 'string', example: 'Dubai South' },
          Detail: { type: 'string', example: 'Details about metro construction phase 1' },
        },
        required: ['PROJECT_ID', 'Project_Name'],
      },
      ErrorReportInput: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Prisma Client Query Error: unique constraint check failed' },
          tablename: { type: 'string', example: 'sales_inventory_items' },
          query: { type: 'string', example: 'INSERT INTO sales_inventory_items (item_code) VALUES ("ITEM-001")' },
          client_id: { type: 'string', example: 'john.sales' },
        },
        required: ['error'],
      },

      // ── Accounts ───────────────────────────────────────────────────
      AccountGroup: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          group_code: { type: 'string', example: 'CA-001' },
          Group_Name: { type: 'string', example: 'Current Assets' },
          parent_group_id: { type: 'integer', example: null },
          is_system_defined: { type: 'boolean', example: true },
        },
        required: ['Group_Name'],
      },
      LedgerMaster: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          ledger_code: { type: 'string', example: 'LDG-DEB-001' },
          Ledger_Name: { type: 'string', example: 'Al Shamil Customer' },
          Ledger_Type: {
            type: 'string',
            enum: [
              'SundryDebtor',
              'SundryCreditor',
              'Bank',
              'Cash',
              'Expense',
              'Income',
              'Tax',
              'FixedAsset',
              'Capital',
              'DutyTax',
              'Stock',
              'Other',
            ],
            default: 'Other',
            example: 'SundryDebtor',
          },
          account_group_id: { type: 'integer', example: 1 },
          contact_id: { type: 'integer', example: 2 },
          parent_ledger_id: { type: 'integer', example: null },
          currency_code: { type: 'string', default: 'AED', example: 'AED' },
          is_system_defined: { type: 'boolean', default: false, example: false },
          Opening_Balance: { type: 'string', default: '0', example: '5000.00' },
          Opening_Balance_Date: { type: 'string', format: 'date', example: '2025-04-01' },
          Narration: { type: 'string', example: 'Opening balance for outstanding invoice' },
          bankDetails: {
            type: 'object',
            properties: {
              bank_account_number: { type: 'string', example: '1020304050' },
              iban: { type: 'string', example: 'AE03028000000001020304050' },
              swift_code: { type: 'string', example: 'ADCBAPAEXXX' },
              bank_branch_name: { type: 'string', example: 'ADCB HQ Dubai' },
            },
            required: ['bank_account_number'],
          },
          creditSettings: {
            type: 'object',
            properties: {
              credit_limit: { type: 'number', example: 100000 },
              credit_period_days: { type: 'integer', default: 0, example: 30 },
              payment_terms: { type: 'string', example: '30 days net from invoice date' },
              caution_deposit: { type: 'number', example: 5000 },
            },
          },
          taxSettings: {
            type: 'object',
            properties: {
              trn: { type: 'string', example: '100234567800003' },
              tax_category_id: { type: 'integer', example: 1 },
              type_of_supply: { type: 'string', example: 'Goods' },
            },
          },
        },
        required: ['Ledger_Name'],
      },
      BillwiseRecordInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'INV' },
          voucher_type: { type: 'string', example: 'SalesInvoice' },
          voucher_no: { type: 'string', example: 'INV/00021' },
          ledger_id: { type: 'string', example: '12' },
          ref_type: { type: 'string', enum: ['New Ref', 'Agst Ref', 'Advance', 'On Account'], example: 'New Ref' },
          ref_no: { type: 'string', example: 'REF-INV-21' },
          ref_prefix: { type: 'string', example: 'INV' },
          debit_amount: { type: 'number', example: 1200.0 },
          credit_amount: { type: 'number', example: 0.0 },
          due_date: { type: 'string', format: 'date', example: '2026-07-21' },
        },
        required: ['ledger_id', 'ref_type', 'ref_no'],
      },
      ChequeDetailsInput: {
        type: 'object',
        properties: {
          ledger_id: { type: 'string', example: '12' },
          bank_name: { type: 'string', example: 'Emirates NBD' },
          branch_name: { type: 'string', example: 'Jumeirah Branch' },
          instrument_no: { type: 'string', example: 'CHQ-998877' },
          instrument_date: { type: 'string', format: 'date', example: '2026-07-01' },
          instrument_type: { type: 'string', enum: ['Cheque', 'DD', 'NEFT', 'RTGS', 'Other'], default: 'Cheque', example: 'Cheque' },
          amount: { type: 'number', example: 4500.0 },
        },
        required: ['ledger_id', 'bank_name', 'instrument_no', 'instrument_date', 'amount'],
      },

      // ── Inventory ──────────────────────────────────────────────────
      UOM: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          uom_Name: { type: 'string', example: 'Box of 10' },
          uom_code: { type: 'string', example: 'BOX10' },
          decimal_places: { type: 'integer', default: 0, example: 0 },
          narration: { type: 'string', example: 'Outer cardboard carton with 10 inner items' },
          uom_symbol: { type: 'string', example: 'bx10' },
          UOM_decimal_Points: { type: 'integer', default: 0, example: 0 },
          UOM_Narration: { type: 'string', example: 'Cardboard carton packaging' },
          is_Composite: { type: 'boolean', default: false, example: false },
          SubUom: { type: 'string', example: null },
          Hidden_row: { type: 'string', example: null },
        },
        required: ['uom_Name'],
      },
      Brand: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          Brand_Name: { type: 'string', example: 'Samsung' },
          Brand_Description: { type: 'string', example: 'Electronics & Mobiles' },
        },
        required: ['Brand_Name'],
      },
      Category: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          category_code: { type: 'string', example: 'ELEC' },
          category_name: { type: 'string', example: 'Electronics' },
          Description: { type: 'string', example: 'Electronic consumer appliances' },
        },
        required: ['category_name'],
      },
      TaxCategory: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          tax_name: { type: 'string', example: 'Standard VAT 5%' },
          tax_rate: { type: 'number', example: 5.0 },
          is_active: { type: 'boolean', default: true, example: true },
        },
        required: ['tax_name', 'tax_rate'],
      },
      InventoryGroup: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          group_code: { type: 'string', example: 'GP-MOB' },
          Group_ID: { type: 'string', example: 'MOB' },
          Group_Name: { type: 'string', example: 'Mobile Phones' },
          parent_group_id: { type: 'integer', example: null },
          Parent_ID: { type: 'string', example: null },
          Group_Type: { type: 'string', example: 'Finished Goods' },
          GroupNameArabic: { type: 'string', example: 'هواتف نقالة' },
        },
        required: ['Group_ID', 'Group_Name'],
      },
      InventoryItem: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          Item_Name: { type: 'string', example: 'iPhone 15 Pro 256GB' },
          Item_Alias: { type: 'string', example: 'iPhone 15 Pro' },
          inventory_group_id: { type: 'integer', example: 2 },
          uom_id: { type: 'integer', example: 1 },
          inventory_brand_id: { type: 'integer', example: 1 },
          category_id: { type: 'integer', example: 1 },
          Item_Code: { type: 'string', example: 'IP15P256' },
          Group_Id: { type: 'string', example: 'MOB' },
          Part_Number: { type: 'string', example: 'A3102' },
          Price: { type: 'number', default: 0, example: 4299.00 },
          Opening_Stock: { type: 'number', example: 10.0 },
          opening_stock_value: { type: 'number', default: 0, example: 38000.00 },
          Opening_Balance: { type: 'number', default: 0, example: 10.0 },
          Opening_Balance_Date: { type: 'string', format: 'date-time', example: '2025-04-01T00:00:00.000Z' },
          Opening_Rate: { type: 'number', example: 3800.00 },
          Opening_Value: { type: 'number', default: 0, example: 38000.00 },
          Narration: { type: 'string', example: 'Initial warehouse stock' },
          Serial_Number: { type: 'string', example: null },
          Closing_Stock: { type: 'number', default: 0, example: 24.0 },
          Reorder_Level: { type: 'number', default: 0, example: 5 },
          is_purchase_item: { type: 'boolean', default: true, example: true },
          is_sales_item: { type: 'boolean', default: true, example: true },
          is_stock_item: { type: 'boolean', default: true, example: true },
          is_serialized: { type: 'boolean', default: false, example: true },
          is_batch_tracked: { type: 'boolean', default: false, example: false },
          is_service: { type: 'boolean', default: false, example: false },
          is_perishable: { type: 'boolean', default: false, example: false },
          is_active: { type: 'boolean', default: true, example: true },
          sales_gl_ledger_id: { type: 'integer', example: 14 },
          Std_Cost: { type: 'number', default: 0, example: 3750.00 },
          Default_Sales_Ledger_id: { type: 'string', example: '14' },
          default_purchase_ledger_id: { type: 'integer', example: 15 },
          default_sales_return_ledger_id: { type: 'integer', example: 16 },
          default_purchase_return_ledger_id: { type: 'integer', example: 17 },
          default_tax_category_id: { type: 'integer', example: 1 },
          Default_Input_Tax_Ledger: { type: 'string', example: '18' },
          Default_Output_Tax_Ledger: { type: 'string', example: '19' },
          Default_Sales_Return_Ledger: { type: 'string', example: '16' },
          Default_Purchase_Return_Ledger: { type: 'string', example: '17' },
          Vat_Rate: { type: 'number', default: 0, example: 5.0 },
          Default_UOM_ID: { type: 'string', example: '1' },
          Warranty_Days: { type: 'integer', default: 0, example: 365 },
          Shelf_Life: { type: 'number', default: 0, example: 0 },
          Brand_Id: { type: 'string', example: '1' },
          base_price: { type: 'number', default: 0, example: 4299.0 },
          standard_cost: { type: 'number', default: 0, example: 3750.0 },
          moving_average_cost: { type: 'number', default: 0, example: 3762.5 },
          Item_Description: { type: 'string', example: 'Flagship Apple smartphone' },
          isCustomItem: { type: 'boolean', example: false },
          Dimension: { type: 'string', example: '146.6 x 70.6 x 8.25 mm' },
          KOT_Printer: { type: 'string', example: null },
          Item_Name_Arabic: { type: 'string', example: 'ايفون ١٥ برو' },
          Favourite: { type: 'boolean', example: false },
          From_Time: { type: 'string', format: 'date-time', example: null },
          To_Time: { type: 'string', format: 'date-time', example: null },
          Price_2: { type: 'number', example: 4199.00 },
          HSN_CODE: { type: 'string', example: '85171300' },
          Section: { type: 'string', example: 'Warehouse A Shelf 3' },
          Flags: { type: 'string', example: null },
          Category: { type: 'string', example: '1' },
          DefaultLedgerID: { type: 'string', example: '14' },
          isSerailNumbered: { type: 'boolean', default: false, example: true },
          isBatchProcessed: { type: 'boolean', default: false, example: false },
          weight: { type: 'number', example: 0.187 },
          location: { type: 'string', example: 'Zone B' },
        },
        required: ['Item_Name', 'Item_Code', 'Group_Id'],
      },
      SKUMaster: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          sku_code: { type: 'string', example: 'IP15P256-TI' },
          inventory_item_id: { type: 'integer', example: 1 },
          ITEM_ID: { type: 'string', example: '1' },
          sku_name: { type: 'string', example: 'Natural Titanium iPhone 15 Pro 256GB' },
          barcode: { type: 'string', example: '195949000000' },
          rate: { type: 'number', example: 4299.0 },
          SKU_DESCRIPTION: { type: 'string', example: 'Natural Titanium color option' },
          SKU_TYPE: { type: 'string', enum: ['Variant', 'Bundle', 'Alternate Unit'], example: 'Variant' },
          SKU_POSSIBLE_VALUES: { type: 'string', example: '{"Color": "Natural Titanium", "Storage": "256GB"}' },
          SKU_VALUE: { type: 'string', example: 'Natural Titanium' },
        },
        required: ['ITEM_ID'],
      },
      ItemBatch: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          item_id: { type: 'integer', example: 12 },
          batch_number: { type: 'string', example: 'BAT-2026-06' },
          manufacturing_date: { type: 'string', format: 'date-time', example: '2026-06-01T00:00:00.000Z' },
          expiration_date: { type: 'string', format: 'date-time', example: '2027-06-01T00:00:00.000Z' },
          cost_price: { type: 'number', default: 0, example: 12.50 },
          selling_price: { type: 'number', default: 0, example: 25.00 },
          is_active: { type: 'boolean', default: true, example: true },
        },
        required: ['item_id', 'batch_number'],
      },
      ItemProperty: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          Property_ID: { type: 'string', example: 'PROP-COLOR' },
          Item_ID: { type: 'string', example: '1' },
          Default_Value: { type: 'string', example: 'Black' },
        },
        required: ['Property_ID', 'Item_ID'],
      },
      ItemImageInput: {
        type: 'object',
        properties: {
          Item_Id: { type: 'string', example: '1' },
          ImageBase64: { type: 'string', example: 'data:image/png;base64,iVBORw0KGgoAAAANSU...' },
          Narration: { type: 'string', example: 'Front profile view' },
          width: { type: 'integer', example: 800 },
          height: { type: 'integer', example: 800 },
          type: { type: 'string', example: 'image/png' },
          FileName: { type: 'string', example: 'iphone15_front.png' },
        },
        required: ['Item_Id'],
      },
      Ingredient: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          sales_item_id: { type: 'integer', example: 25 },
          purchase_item_id: { type: 'integer', example: 104 },
          purchase_uom_id: { type: 'integer', example: 4 },
          prep_route_id: { type: 'integer', example: 1 },
          take_away_applicable: { type: 'boolean', default: true, example: true },
          sales_item: { type: 'string', example: '25' },
          sales_item_qty: { type: 'number', default: 1, example: 1.0 },
          purchase_item: { type: 'string', example: '104' },
          purchase_item_qty: { type: 'number', default: 0, example: 0.25 },
          TakeAway: { type: 'integer', example: 1 },
          Purchase_unit: { type: 'integer', example: 4 },
          Route_ID: { type: 'string', example: '1' },
        },
        required: ['sales_item', 'purchase_item'],
      },
      Godown: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          godown_code: { type: 'string', example: 'WH-MAIN' },
          Godown_Name: { type: 'string', example: 'Main Logistics Warehouse' },
          Godown_Location: { type: 'string', example: 'Al Quoz, Dubai' },
          Godown_Narration: { type: 'string', example: 'Primary distribution and logistics hub' },
          is_profit_centre: { type: 'boolean', default: false, example: true },
          is_default: { type: 'boolean', default: false, example: true },
          is_production: { type: 'boolean', default: false, example: false },
        },
        required: ['Godown_Name'],
      },
      UOMConversion: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          baseUnit: { type: 'string', example: 'Box' },
          toUnit: { type: 'string', example: 'Pcs' },
          conValue: { type: 'string', example: '12' },
          itemID: { type: 'string', example: '45' },
          narration: { type: 'string', example: '12 pieces inside one box' },
          Hidden_row: { type: 'string', example: null },
          barcode: { type: 'string', example: '99201882' },
        },
        required: ['baseUnit', 'toUnit', 'conValue'],
      },
      PriceList: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          Price_List_Name: { type: 'string', example: 'Corporate Bulk Discount' },
          Price_List_Start_Date: { type: 'string', format: 'date-time', example: '2026-06-01T00:00:00.000Z' },
          Price_List_End_Date: { type: 'string', format: 'date-time', example: '2026-12-31T23:59:59.000Z' },
          Price_List_Default: { type: 'boolean', default: false, example: false },
          Price_List_ShowInPos: { type: 'boolean', default: true, example: false },
          Price_List_isOnline: { type: 'boolean', default: false, example: true },
        },
        required: ['Price_List_Name'],
      },
      PriceListEntry: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          Item_Id: { type: 'string', example: '1' },
          Price: { type: 'number', example: 3999.00 },
          Price_List_ID: { type: 'integer', example: 2 },
          percent: { type: 'number', example: 7.0 },
          UOM_Id: { type: 'string', example: '1' },
          MRP2_STD1_CUS0: { type: 'integer', enum: [0, 1, 2], default: 0, description: '0 = Custom, 1 = Standard, 2 = MRP', example: 0 },
        },
        required: ['Item_Id', 'Price', 'Price_List_ID'],
      },
      RouteMaster: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          route_id: { type: 'string', example: 'RT-DEIRA' },
          route_name: { type: 'string', example: 'Deira Delivery Route' },
          Description: { type: 'string', example: 'Covers Rigga, Muraqqabat, and Naif areas' },
        },
        required: ['route_id'],
      },
      RouteCustomerMapping: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          route_master_id: { type: 'integer', example: 1 },
          customer_ledger_id: { type: 'integer', example: 14 },
          Ledger_ID: { type: 'string', example: '14' },
        },
        required: ['Ledger_ID'],
      },
      RouteMapping: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          route_master_id: { type: 'integer', example: 1 },
          salesperson_employee_id: { type: 'integer', example: 4 },
          Day_Of_Week: { type: 'string', example: 'Monday' },
          Salesman_ID: { type: 'integer', example: 4 },
          Date_Created: { type: 'string', format: 'date-time', example: '2026-06-20T14:30:00.000Z' },
        },
        required: ['Day_Of_Week', 'Salesman_ID', 'Date_Created'],
      },
      LedgerItemMapping: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          Ledger_Id: { type: 'string', example: '14' },
          Item_Id: { type: 'string', example: '1' },
        },
        required: ['Ledger_Id', 'Item_Id'],
      },

      // ── Transactions ───────────────────────────────────────────────
      ItemPhysicalSpec: {
        type: 'object',
        properties: {
          length: { type: 'number', example: 2.5 },
          dimension: { type: 'string', example: '2.5m x 1.2m x 0.8m' },
          spec_notes: { type: 'string', example: 'Reinforced steel edge specifications' },
        },
      },
      VoucherLineAllocation: {
        type: 'object',
        properties: {
          ledger_id: { type: 'integer', example: 18 },
          allocation_type: { type: 'string', enum: ['EXPENSE', 'DISCOUNT', 'TAX', 'CHARGE', 'REBATE'], example: 'TAX' },
          allocated_amount: { type: 'number', example: 215.00 },
          allocation_method: { type: 'string', enum: ['BYVALUE', 'BYQUANTITY', 'BYWEIGHT', 'BYVOLUME', 'MANUAL'], default: 'BYVALUE', example: 'BYVALUE' },
        },
        required: ['ledger_id', 'allocation_type', 'allocated_amount'],
      },
      SalesInvoiceLineInput: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          sku_id: { type: 'integer', example: 1 },
          batch_id: { type: 'integer', example: null },
          quantity: { type: 'number', minimum: 0.0001, example: 5.0 },
          price: { type: 'number', minimum: 0.0, example: 4299.00 },
          discount_percent: { type: 'number', minimum: 0.0, maximum: 100.0, default: 0.0, example: 5.0 },
          tax_rate: { type: 'number', minimum: 0.0, maximum: 100.0, default: 0.0, example: 5.0 },
        },
        required: ['item_id', 'quantity', 'price'],
      },
      SalesInvoicePostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'INV' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          customer_ledger_id: { type: 'integer', example: 14 },
          godown_id: { type: 'integer', example: 1 },
          salesperson_employee_id: { type: 'integer', example: 4 },
          voucher_project_id: { type: 'integer', example: 1 },
          billing_name: { type: 'string', example: 'Al Shamil Gen Trading' },
          narration: { type: 'string', example: 'Sales of mobile phone inventory to Al Shamil' },
          credit_days: { type: 'integer', default: 30, example: 30 },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/SalesInvoiceLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'customer_ledger_id', 'godown_id', 'lines'],
      },
      PurchaseInvoicePostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'PINV' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          supplier_ledger_id: { type: 'integer', example: 24 },
          godown_id: { type: 'integer', example: 1 },
          salesperson_employee_id: { type: 'integer', example: null },
          voucher_project_id: { type: 'integer', example: null },
          billing_name: { type: 'string', example: 'Apple Distributors Middle East' },
          narration: { type: 'string', example: 'Purchase batch of iPhone stock' },
          credit_days: { type: 'integer', default: 30, example: 45 },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/SalesInvoiceLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'supplier_ledger_id', 'godown_id', 'lines'],
      },
      CashBankVoucherLineInput: {
        type: 'object',
        properties: {
          ledger_id: { type: 'integer', example: 24 },
          amount: { type: 'number', minimum: 0.01, example: 20420.25 },
          narration: { type: 'string', example: 'Settlement of invoice PINV/0014' },
        },
        required: ['ledger_id', 'amount'],
      },
      CashBankVoucherPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'PAY' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          cash_bank_ledger_id: { type: 'integer', example: 2 },
          narration: { type: 'string', example: 'Vendor bulk payments bank transfer' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/CashBankVoucherLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'cash_bank_ledger_id', 'lines'],
      },
      ContraVoucherLineInput: {
        type: 'object',
        properties: {
          ledger_id: { type: 'integer', example: 2 },
          amount: { type: 'number', example: 10000 },
          type: { type: 'string', enum: ['DR', 'CR'], example: 'DR' },
          narration: { type: 'string', example: 'Cash deposit from retail till to ADCB bank account' },
        },
        required: ['ledger_id', 'amount', 'type'],
      },
      ContraVoucherPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'CON' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          narration: { type: 'string', example: 'Transfer cash to bank account' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/ContraVoucherLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'lines'],
      },
      JournalVoucherLineInput: {
        type: 'object',
        properties: {
          ledger_id: { type: 'integer', example: 32 },
          debit_amount: { type: 'number', minimum: 0.0, default: 0.0, example: 1500.00 },
          credit_amount: { type: 'number', minimum: 0.0, default: 0.0, example: 0.0 },
          narration: { type: 'string', example: 'Monthly office rent adjustment' },
        },
        required: ['ledger_id'],
      },
      JournalVoucherPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'JV' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          narration: { type: 'string', example: 'Adjusting prepayments journal' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/JournalVoucherLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'lines'],
      },
      NoteVoucherPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'CN' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          ledger_id: { type: 'integer', example: 14 },
          godown_id: { type: 'integer', example: 1 },
          billing_name: { type: 'string', example: 'Al Shamil Gen Trading' },
          narration: { type: 'string', example: 'Credit note adjustment for damaged device return' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/SalesInvoiceLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'ledger_id', 'godown_id', 'lines'],
      },

      // Quotations, Orders, Transfers (Phase 4)
      QuotationLineInput: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          sku_id: { type: 'integer', example: null },
          quantity: { type: 'number', example: 10 },
          price: { type: 'number', example: 4299.00 },
          discount_percent: { type: 'number', default: 0.0, example: 10.0 },
          tax_rate: { type: 'number', default: 0.0, example: 5.0 },
          narration: { type: 'string', example: 'Discount for volume purchase' },
          spec: { $ref: '#/components/schemas/ItemPhysicalSpec' },
          allocations: {
            type: 'array',
            items: { $ref: '#/components/schemas/VoucherLineAllocation' },
          },
        },
        required: ['item_id', 'quantity', 'price'],
      },
      QuotationPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'QT' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          customer_ledger_id: { type: 'integer', example: 14 },
          salesperson_employee_id: { type: 'integer', example: 4 },
          voucher_project_id: { type: 'integer', example: 1 },
          billing_name: { type: 'string', example: 'Al Shamil Trading' },
          narration: { type: 'string', example: 'Volume pricing quotation for project metro' },
          completion_probability: { type: 'number', minimum: 0, maximum: 100, default: 50, example: 80 },
          revision_number: { type: 'string', example: 'REV-1' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/QuotationLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'customer_ledger_id', 'lines'],
      },
      SalesOrderPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'SO' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          customer_ledger_id: { type: 'integer', example: 14 },
          godown_id: { type: 'integer', example: 1 },
          salesperson_employee_id: { type: 'integer', example: 4 },
          voucher_project_id: { type: 'integer', example: 1 },
          billing_name: { type: 'string', example: 'Al Shamil Trading' },
          narration: { type: 'string', example: 'Sales order confirmed' },
          requirement_voucher_list: {
            type: 'array',
            items: { type: 'string' },
            description: 'Source requirement voucher numbers',
            example: ['REQ/0002'],
          },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/QuotationLineInput' },
          },
          carrier_name: { type: 'string', example: 'DHL Express' },
          lr_no: { type: 'string', example: 'LR-12345' },
          boxes_count: { type: 'integer', default: 0, example: 3 },
          total_weight: { type: 'number', default: 0.0, example: 45.5 },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'customer_ledger_id', 'godown_id', 'lines'],
      },
      PurchaseOrderLineInput: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          sku_id: { type: 'integer', example: null },
          quantity: { type: 'number', example: 50 },
          price: { type: 'number', example: 3750.00 },
          discount_percent: { type: 'number', default: 0.0, example: 0.0 },
          tax_rate: { type: 'number', default: 0.0, example: 5.0 },
          narration: { type: 'string', example: 'Procuring from standard partner' },
          spec: { $ref: '#/components/schemas/ItemPhysicalSpec' },
          allocations: {
            type: 'array',
            items: { $ref: '#/components/schemas/VoucherLineAllocation' },
          },
          container_count: { type: 'integer', default: 0, example: 1 },
        },
        required: ['item_id', 'quantity', 'price'],
      },
      PurchaseOrderPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'PO' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          supplier_ledger_id: { type: 'integer', example: 24 },
          godown_id: { type: 'integer', example: 1 },
          salesperson_employee_id: { type: 'integer', example: null },
          voucher_project_id: { type: 'integer', example: null },
          billing_name: { type: 'string', example: 'Apple Wholesale Distributors' },
          narration: { type: 'string', example: 'Annual replenishment PO' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/PurchaseOrderLineInput' },
          },
          carrier_name: { type: 'string', example: 'Maersk Shipping' },
          lr_no: { type: 'string', example: 'LR-MSK-908' },
          boxes_count: { type: 'integer', default: 0, example: 50 },
          total_weight: { type: 'number', default: 0.0, example: 850 },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'supplier_ledger_id', 'godown_id', 'lines'],
      },
      GodownTransferLineInput: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          sku_id: { type: 'integer', example: null },
          quantity: { type: 'number', example: 10 },
          price: { type: 'number', example: 3750.00 },
          adj_value: { type: 'number', default: 0.0, example: 0.0 },
          narration: { type: 'string', example: 'Moving inventory to retail godown' },
        },
        required: ['item_id', 'quantity', 'price'],
      },
      GodownTransferPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'GT' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          from_godown_id: { type: 'integer', example: 1 },
          to_godown_id: { type: 'integer', example: 2 },
          narration: { type: 'string', example: 'Stock balance transfer' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/GodownTransferLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'from_godown_id', 'to_godown_id', 'lines'],
      },
      NoteLineInput: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          sku_id: { type: 'integer', example: null },
          quantity: { type: 'number', example: 5 },
          price: { type: 'number', example: 4299.00 },
          discount_percent: { type: 'number', default: 0.0, example: 0.0 },
          tax_rate: { type: 'number', default: 0.0, example: 5.0 },
          narration: { type: 'string', example: 'Partial dispatch' },
          spec: { $ref: '#/components/schemas/ItemPhysicalSpec' },
          allocations: {
            type: 'array',
            items: { $ref: '#/components/schemas/VoucherLineAllocation' },
          },
          source_line_id: { type: 'integer', example: 12 },
        },
        required: ['item_id', 'quantity', 'price'],
      },
      DeliveryNotePostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'DN' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          customer_ledger_id: { type: 'integer', example: 14 },
          godown_id: { type: 'integer', example: 1 },
          salesperson_employee_id: { type: 'integer', example: 4 },
          voucher_project_id: { type: 'integer', example: 1 },
          billing_name: { type: 'string', example: 'Al Shamil Trading' },
          narration: { type: 'string', example: 'Shipment dispatched' },
          source_voucher_id: { type: 'integer', example: 5, description: 'Source SalesOrder ID' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/NoteLineInput' },
          },
          carrier_name: { type: 'string', example: 'FedEx' },
          lr_no: { type: 'string', example: 'FDX-765' },
          boxes_count: { type: 'integer', default: 0, example: 2 },
          total_weight: { type: 'number', default: 0.0, example: 12.8 },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'customer_ledger_id', 'godown_id', 'lines'],
      },
      ReceiptNotePostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'RN' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          supplier_ledger_id: { type: 'integer', example: 24 },
          godown_id: { type: 'integer', example: 1 },
          salesperson_employee_id: { type: 'integer', example: null },
          voucher_project_id: { type: 'integer', example: null },
          billing_name: { type: 'string', example: 'Apple Wholesale Distributors' },
          narration: { type: 'string', example: 'Shipment received at dock' },
          source_voucher_id: { type: 'integer', example: 6, description: 'Source PurchaseOrder ID' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/NoteLineInput' },
          },
          carrier_name: { type: 'string', example: 'Aramex' },
          lr_no: { type: 'string', example: 'ARX-9821' },
          boxes_count: { type: 'integer', default: 0, example: 50 },
          total_weight: { type: 'number', default: 0.0, example: 850 },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'supplier_ledger_id', 'godown_id', 'lines'],
      },
      MaterialInLineInput: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          sku_id: { type: 'integer', example: null },
          crQty: { type: 'number', default: 0.0, example: 0.0 },
          drQty: { type: 'number', default: 0.0, example: 10.0 },
          Price: { type: 'number', default: 0.0, example: 3750.00 },
          Item_Narration: { type: 'string', example: 'Material received for processing' },
        },
        required: ['item_id'],
      },
      MaterialInPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'MI' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          godown_id: { type: 'integer', example: 1 },
          narration: { type: 'string', example: 'Processing material entry' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/MaterialInLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'lines'],
      },
      RequirementLineInput: {
        type: 'object',
        properties: {
          item_id: { type: 'integer', example: 1 },
          sku_id: { type: 'integer', example: null },
          quantity: { type: 'number', example: 15 },
          price: { type: 'number', default: 0.0, example: 0.0 },
          narration: { type: 'string', example: 'Required for mobile division' },
        },
        required: ['item_id', 'quantity'],
      },
      RequirementPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'REQ' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          narration: { type: 'string', example: 'Quarterly resource requirement request' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/RequirementLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'lines'],
      },
      StockRequestLineInput: {
        type: 'object',
        properties: {
          inventory_item_id: { type: 'integer', example: 1 },
          calculated_qty: { type: 'number', default: 0.0, example: 0.0 },
          request_qty: { type: 'number', example: 12 },
          issue_qty: { type: 'number', default: 0.0, example: 0.0 },
          consumed_qty: { type: 'number', default: 0.0, example: 0.0 },
          remarks: { type: 'string', example: 'Emergency stock request' },
        },
        required: ['inventory_item_id', 'request_qty'],
      },
      StockRequestPostInput: {
        type: 'object',
        properties: {
          voucher_prefix: { type: 'string', example: 'SR' },
          voucher_date: { type: 'string', format: 'date', example: '2026-06-21' },
          financial_year: { type: 'string', example: 'FY2026-27' },
          from_godown_id: { type: 'integer', example: 1 },
          to_godown_id: { type: 'integer', example: 2 },
          narration: { type: 'string', example: 'Inter-godown supply fulfillment request' },
          requirement_voucher_no: { type: 'string', example: 'REQ/0002' },
          lines: {
            type: 'array',
            items: { $ref: '#/components/schemas/StockRequestLineInput' },
          },
        },
        required: ['voucher_prefix', 'voucher_date', 'financial_year', 'from_godown_id', 'to_godown_id', 'lines'],
      },
      TermsAndConditionsInput: {
        type: 'object',
        properties: {
          Title: { type: 'string', example: 'Standard Delivery & Warranty Terms' },
          Delivery_Time: { type: 'string', example: '2-4 business days' },
          Payment_Terms: { type: 'string', example: '30 days credit' },
          Warranty: { type: 'string', example: '1 year standard manufacturer warranty' },
          Validity: { type: 'string', example: 'Quote valid for 15 days' },
          Exclusion: { type: 'string', example: 'Excludes accessories unless noted' },
          Extra: { type: 'string', example: 'Additional shipping charges may apply for remote areas' },
        },
        required: ['Title'],
      },
      TransportationDetailsInput: {
        type: 'object',
        properties: {
          Voucher_No: { type: 'string', example: 'INV/00021' },
          Voucher_Type: { type: 'string', example: 'SalesInvoice' },
          Voucher_Prefix: { type: 'string', example: 'INV' },
          TransactionId: { type: 'string', example: 'TXN-9021' },
          Packed_By: { type: 'integer', example: 3 },
          Delivered_By: { type: 'integer', example: 4 },
          vehicle_details: { type: 'string', example: 'Toyota HiAce (Van)' },
          Vehicle_Id: { type: 'string', example: 'DXB-55441' },
        },
      },

      // ── Employee ───────────────────────────────────────────────────
      Department: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          dept_code: { type: 'string', example: 'HR-DEPT' },
          dept_name: { type: 'string', example: 'Human Resources' },
          parent_dept_id: { type: 'integer', example: null },
          is_active: { type: 'boolean', default: true, example: true },
        },
        required: ['dept_code', 'dept_name'],
      },
      Designation: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          designation_code: { type: 'string', example: 'MGR-HR' },
          designation_name: { type: 'string', example: 'HR Manager' },
          department_id: { type: 'integer', example: 1 },
          is_active: { type: 'boolean', default: true, example: true },
        },
        required: ['designation_code', 'designation_name'],
      },
      EmployeeDetails: {
        type: 'object',
        properties: {
          id: { type: 'integer', example: 1 },
          contact_id: { type: 'integer', example: 5 },
          employee_code: { type: 'string', example: 'EMP-004' },
          Name: { type: 'string', example: 'Sarah Jenkins' },
          Fathers_Name: { type: 'string', example: 'Robert Jenkins' },
          Date_of_Birth: { type: 'string', format: 'date', example: '1990-05-15' },
          Gender: { type: 'string', example: 'Female' },
          Nationality: { type: 'string', example: 'British' },
          Marital_Status: { type: 'string', example: 'Married' },
          Phone: { type: 'string', example: '+971560000000' },
          Designation: { type: 'string', example: 'HR Manager' },
          Department: { type: 'string', example: 'Human Resources' },
          designation_id: { type: 'integer', example: 1 },
          department_id: { type: 'integer', example: 1 },
          Date_of_Joining: { type: 'string', format: 'date', example: '2022-01-10' },
          date_of_leaving: { type: 'string', format: 'date', example: null },
          Biometric_ID: { type: 'string', example: 'BIO-208' },
          Highest_Qualification: { type: 'string', example: 'MBA in HR' },
          Date_of_Qualification: { type: 'string', format: 'date', example: '2014-06-15' },
          Emergency_Contact_Name: { type: 'string', example: 'David Jenkins' },
          Emergency_Contact_No: { type: 'string', example: '+971569999999' },
          Emergency_Contact_Relation: { type: 'string', example: 'Spouse' },
          Image_Path: { type: 'string', example: '/images/employees/sarah_j.png' },
          Show_Employee: { type: 'boolean', example: true },
          is_active: { type: 'boolean', default: true, example: true },
          bankDetails: {
            type: 'object',
            properties: {
              bank_name: { type: 'string', example: 'HSBC Middle East' },
              bank_branch: { type: 'string', example: 'Emaar Square' },
              bank_code: { type: 'string', example: 'HSBC' },
              account_number: { type: 'string', example: '9988776655' },
              iban: { type: 'string', example: 'AE44002000000009988776655' },
              swift_code: { type: 'string', example: 'HSBCAPAEXXX' },
              account_type: { type: 'string', example: 'WPS' },
            },
          },
          salaryDetails: {
            type: 'object',
            properties: {
              salary_ledger_id: { type: 'integer', example: 42 },
              adv_salary_ledger_id: { type: 'integer', example: 43 },
              Basic_Salary: { type: 'number', example: 12000.0 },
              DA: { type: 'number', example: 2000.0 },
              HRA: { type: 'number', example: 4000.0 },
              Conveyance: { type: 'number', example: 1000.0 },
              overtime_hourly_rate: { type: 'number', example: 75.0 },
              OverTime_Pay: { type: 'number', example: 0.0 },
              Monthly_Leave: { type: 'integer', example: 2 },
              Weekly_Leave: { type: 'integer', example: 1 },
              Annual_Leave: { type: 'integer', example: 30 },
              Working_Hours: { type: 'integer', example: 8 },
              effective_from: { type: 'string', format: 'date', example: '2025-04-01' },
            },
          },
        },
        required: ['Name'],
      },
      EmployeeDocumentInput: {
        type: 'object',
        properties: {
          doc_type: { type: 'string', enum: ['Passport', 'Visa', 'EmiratesID', 'LabourCard', 'DrivingLicense', 'HealthCard', 'AirportPass', 'Other'], example: 'EmiratesID' },
          doc_number: { type: 'string', example: '784-1990-1234567-1' },
          issue_date: { type: 'string', format: 'date', example: '2022-05-10' },
          expiry_date: { type: 'string', format: 'date', example: '2027-05-09' },
          place_of_issue: { type: 'string', example: 'Dubai' },
          passport_custody: { type: 'string', example: 'Self' },
          visa_status: { type: 'string', example: 'Employment Visa' },
          visa_sponsor: { type: 'string', example: 'AlgoTech Corp' },
          airport_pass_status: { type: 'string', example: 'N/A' },
          file_path: { type: 'string', example: '/docs/employees/sarah_emirates_id.pdf' },
          notes: { type: 'string', example: 'Renewed in 2022' },
        },
        required: ['doc_type'],
      },
      LeavePolicyInput: {
        type: 'object',
        properties: {
          leave_type: { type: 'string', enum: ['Annual', 'Sick', 'Emergency', 'Maternity', 'Paternity', 'Unpaid', 'Compensatory', 'Other'], example: 'Annual' },
          display_name: { type: 'string', example: 'Paid Annual Vacation Leave' },
          max_days_per_year: { type: 'integer', default: 0, example: 30 },
          max_days_per_request: { type: 'integer', example: 15 },
          carry_forward_limit: { type: 'integer', default: 0, example: 5 },
          requires_approval: { type: 'boolean', default: true, example: true },
          is_paid: { type: 'boolean', default: true, example: true },
          applicable_gender: { type: 'string', example: null },
          is_active: { type: 'boolean', default: true, example: true },
        },
        required: ['leave_type', 'display_name'],
      },
      LeaveAllocationInput: {
        type: 'object',
        properties: {
          leave_policy_id: { type: 'integer', example: 1 },
          year: { type: 'integer', example: 2026 },
          allocated_days: { type: 'number', example: 30.0 },
          carried_forward: { type: 'number', default: 0.0, example: 2.5 },
          used_days: { type: 'number', default: 0.0, example: 0.0 },
        },
        required: ['leave_policy_id', 'year', 'allocated_days'],
      },
      LeaveRequestInput: {
        type: 'object',
        properties: {
          leave_policy_id: { type: 'integer', example: 1 },
          from_date: { type: 'string', format: 'date', example: '2026-08-01' },
          to_date: { type: 'string', format: 'date', example: '2026-08-15' },
          number_of_days: { type: 'number', example: 15.0 },
          reason: { type: 'string', example: 'Annual family summer trip' },
          status: { type: 'string', enum: ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'], default: 'PENDING', example: 'PENDING' },
          rejection_reason: { type: 'string', example: null },
        },
        required: ['leave_policy_id', 'from_date', 'to_date', 'number_of_days'],
      },
      AttendanceDetailsInput: {
        type: 'object',
        properties: {
          working_date: { type: 'string', format: 'date', example: '2026-06-21' },
          check_in_time: { type: 'string', example: '08:58:00' },
          check_out_time: { type: 'string', example: '18:02:00' },
          status: { type: 'string', enum: ['PRESENT', 'ABSENT', 'HALFDAY', 'LEAVEPAID', 'LEAVEUNPAID', 'HOLIDAY'], default: 'PRESENT', example: 'PRESENT' },
          overtime_hours: { type: 'number', default: 0.0, example: 1.5 },
          narration: { type: 'string', example: 'Fulfillment operations overtime support' },
        },
        required: ['working_date'],
      },
      ShiftMasterInput: {
        type: 'object',
        properties: {
          shift_code: { type: 'string', example: 'SHIFT-DAY' },
          shift_name: { type: 'string', example: 'Day Operations Shift' },
          start_time: { type: 'string', example: '09:00:00' },
          end_time: { type: 'string', example: '18:00:00' },
          working_hours: { type: 'number', example: 8.0 },
          break_minutes: { type: 'integer', default: 0, example: 60 },
          is_night_shift: { type: 'boolean', default: false, example: false },
          is_active: { type: 'boolean', default: true, example: true },
        },
        required: ['shift_code', 'shift_name', 'start_time', 'end_time', 'working_hours'],
      },
      EmployeeShiftAssignmentInput: {
        type: 'object',
        properties: {
          shift_id: { type: 'integer', example: 1 },
          valid_from: { type: 'string', format: 'date', example: '2026-01-01' },
          valid_to: { type: 'string', format: 'date', example: '2026-12-31' },
        },
        required: ['shift_id', 'valid_from'],
      },
      PayslipMainInput: {
        type: 'object',
        properties: {
          Employee_Id: { type: 'string', example: '4' },
          Voucher_No: { type: 'string', example: 'PAY/0002' },
          Voucher_Type: { type: 'string', example: 'Payslip' },
          Voucher_Prefix: { type: 'string', example: 'PAY' },
          Salary_Period_Start: { type: 'string', format: 'date', example: '2026-05-01' },
          Salary_Period_End: { type: 'string', format: 'date', example: '2026-05-31' },
          Narration: { type: 'string', example: 'Salary disbursement for May 2026' },
        },
        required: ['Employee_Id', 'Salary_Period_Start', 'Salary_Period_End'],
      },
    },
  },
  paths: {},
};

// Helper function to insert paths dynamically
function addPath(urlPath: string, method: string, details: any) {
  if (!openApiSpec.paths[urlPath]) {
    openApiSpec.paths[urlPath] = {};
  }
  openApiSpec.paths[urlPath][method.toLowerCase()] = details;
}

// ─────────────────────────────────────────────────────────────────────────────
// Auth Paths
// ─────────────────────────────────────────────────────────────────────────────
addPath('/auth/login', 'POST', {
  tags: ['Auth'],
  summary: 'Authenticate credentials and issue JWT tokens',
  description: 'Verifies the username and password against credentials, updates the last login timestamp, records an audit log, and issues JWT access and refresh tokens.',
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/LoginInput' },
      },
    },
  },
  responses: {
    '200': {
      description: 'Login successful. Returns tokens and user context.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1Ni...' },
                      user: {
                        type: 'object',
                        properties: {
                          id: { type: 'integer', example: 1 },
                          username: { type: 'string', example: 'admin' },
                          roleId: { type: 'integer', example: 1 },
                          roleName: { type: 'string', example: 'SuperAdmin' },
                          branchId: { type: 'integer', example: 1 },
                          companyId: { type: 'integer', example: 1 },
                        },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
    '401': {
      description: 'Invalid credentials or inactive user account.',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
  },
});

addPath('/auth/refresh', 'POST', {
  tags: ['Auth'],
  summary: 'Refresh expired access token',
  description: 'Verifies the provided refresh token and issues a new JWT access and refresh token pair.',
  security: [],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/RefreshInput' },
      },
    },
  },
  responses: {
    '200': {
      description: 'Tokens refreshed successfully.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' },
                      refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1...' },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
    '401': {
      description: 'Invalid or expired refresh token.',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
  },
});

addPath('/auth/me', 'GET', {
  tags: ['Auth'],
  summary: 'Retrieve currently authenticated user details',
  description: 'Returns the profile details of the user associated with the bearer token.',
  responses: {
    '200': {
      description: 'User details retrieved successfully.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      id: { type: 'integer', example: 1 },
                      username: { type: 'string', example: 'admin' },
                      roleId: { type: 'integer', example: 1 },
                      roleName: { type: 'string', example: 'SuperAdmin' },
                      branchId: { type: 'integer', example: 1 },
                      companyId: { type: 'integer', example: 1 },
                      lastLoginAt: { type: 'string', format: 'date-time', example: '2026-06-20T19:36:42.000Z' },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
    '401': {
      description: 'Token expired, missing, or invalid.',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
  },
});

addPath('/auth/change-password', 'POST', {
  tags: ['Auth'],
  summary: 'Change user password',
  description: 'Updates the user password after verifying current password.',
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/ChangePasswordInput' },
      },
    },
  },
  responses: {
    '200': {
      description: 'Password changed successfully.',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
    },
    '400': {
      description: 'Incorrect current password or new password validation failure.',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } },
    },
  },
});

addPath('/auth/logout', 'POST', {
  tags: ['Auth'],
  summary: 'Invalidate current session / logout',
  description: 'Logs out the user, auditing the event.',
  responses: {
    '200': {
      description: 'Logged out successfully.',
      content: { 'application/json': { schema: { $ref: '#/components/schemas/ApiResponse' } } },
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// System / Health Check
// ─────────────────────────────────────────────────────────────────────────────
addPath('/health', 'GET', {
  tags: ['System'],
  summary: 'Liveness check',
  description: 'Checks if the application server is up and queries the database.',
  security: [],
  responses: {
    '200': {
      description: 'Server is healthy.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              timestamp: { type: 'string', format: 'date-time' },
              database: { type: 'string', example: 'connected' },
              requestId: { type: 'string' },
            },
          },
        },
      },
    },
  },
});

addPath('/ready', 'GET', {
  tags: ['System'],
  summary: 'Readiness probe',
  description: 'Validates that database connectivity is fully operational.',
  security: [],
  responses: {
    '200': {
      description: 'System is ready to receive requests.',
    },
    '503': {
      description: 'Database connection failed.',
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Organization Paths
// ─────────────────────────────────────────────────────────────────────────────
addPath('/organization/companies', 'GET', {
  tags: ['Organization'],
  summary: 'List company tenant profiles',
  description: 'Retrieves a list of all company tenants (Super-admin only).',
  responses: {
    '200': {
      description: 'Companies list retrieved.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/CompanyProfile' },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/companies', 'POST', {
  tags: ['Organization'],
  summary: 'Provision a new company tenant (Super-admin)',
  description: 'Initializes a new company tenant profile with base configurations, creating a default admin role and essential ledger chart placeholders.',
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            company_name: { type: 'string', example: 'New Enterprise Corp' },
            currency: { type: 'string', default: 'AED', example: 'AED' },
            admin_username: { type: 'string', example: 'corpadmin' },
            admin_password: { type: 'string', example: 'supersecure123' },
          },
          required: ['company_name', 'admin_username', 'admin_password'],
        },
      },
    },
  },
  responses: {
    '201': {
      description: 'Company tenant provisioned successfully.',
    },
  },
});

addPath('/organization/company/{id}', 'GET', {
  tags: ['Organization'],
  summary: 'Get company profile by ID',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      description: 'Company profile details.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: { $ref: '#/components/schemas/CompanyProfile' },
                },
              },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/company/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update company profile details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: { $ref: '#/components/schemas/CompanyProfile' },
      },
    },
  },
  responses: {
    '200': {
      description: 'Company profile updated.',
    },
  },
});

// Financial Years
addPath('/organization/fy', 'GET', {
  tags: ['Organization'],
  summary: 'List financial years',
  responses: {
    '200': {
      description: 'List of financial years.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/FinancialYear' },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/fy', 'POST', {
  tags: ['Organization'],
  summary: 'Create a financial year',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/FinancialYear' } } },
  },
  responses: {
    '201': {
      description: 'Financial year created.',
    },
  },
});

addPath('/organization/fy/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update financial year details / Close/Lock status',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            display_name: { type: 'string' },
            status: { type: 'string', enum: ['Open', 'Closed', 'Locked'] },
            is_default: { type: 'boolean' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Financial year updated successfully.' },
  },
});

// Branches
addPath('/organization/branches', 'GET', {
  tags: ['Organization'],
  summary: 'List branches',
  responses: {
    '200': {
      description: 'List of branches.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: { type: 'array', items: { $ref: '#/components/schemas/Branch' } },
                },
              },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/branches', 'POST', {
  tags: ['Organization'],
  summary: 'Create branch',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Branch' } } },
  },
  responses: { '201': { description: 'Branch created.' } },
});

addPath('/organization/branches/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update branch',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Branch' } } },
  },
  responses: { '200': { description: 'Branch updated.' } },
});

addPath('/organization/branches/{id}', 'DELETE', {
  tags: ['Organization'],
  summary: 'Deactivate / delete branch',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Branch soft-deleted / deactivated.' } },
});

// Currencies
addPath('/organization/currencies', 'GET', {
  tags: ['Organization'],
  summary: 'List currency masters',
  responses: {
    '200': {
      description: 'List of currencies.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Currency' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/currencies', 'POST', {
  tags: ['Organization'],
  summary: 'Create currency',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Currency' } } },
  },
  responses: { '201': { description: 'Currency created.' } },
});

addPath('/organization/currencies/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update currency',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Currency' } } },
  },
  responses: { '200': { description: 'Currency updated.' } },
});

addPath('/organization/currencies/{id}', 'DELETE', {
  tags: ['Organization'],
  summary: 'Delete currency',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Currency deleted.' } },
});

// Currency Daily Rates
addPath('/organization/rates', 'GET', {
  tags: ['Organization'],
  summary: 'Fetch exchange rate for currency on a date',
  parameters: [
    { name: 'currency_id', in: 'query', required: true, schema: { type: 'integer' } },
    { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: {
    '200': {
      description: 'Exchange rate details.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/CurrencyRate' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/rates', 'POST', {
  tags: ['Organization'],
  summary: 'Post daily exchange rate',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/CurrencyRate' } } },
  },
  responses: { '201': { description: 'Rate posted.' } },
});

// Voucher Series
addPath('/organization/voucher-series', 'GET', {
  tags: ['Organization'],
  summary: 'List voucher numbering series configs',
  responses: {
    '200': {
      description: 'List of series.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/VoucherSeries' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/voucher-series', 'POST', {
  tags: ['Organization'],
  summary: 'Create voucher numbering series config',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/VoucherSeries' } } },
  },
  responses: { '201': { description: 'Series created.' } },
});

addPath('/organization/voucher-series/{id}', 'GET', {
  tags: ['Organization'],
  summary: 'Get voucher series config details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/VoucherSeries' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/voucher-series/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update voucher series config details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/VoucherSeries' } } },
  },
  responses: { '200': { description: 'Series updated.' } },
});

addPath('/organization/voucher-series/{id}', 'DELETE', {
  tags: ['Organization'],
  summary: 'Delete voucher series config',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Series deleted.' } },
});

// Address Book (Contacts)
addPath('/organization/contacts', 'GET', {
  tags: ['Organization'],
  summary: 'List contacts',
  parameters: [
    { name: 'type', in: 'query', schema: { type: 'string', enum: ['INDIVIDUAL', 'COMPANY', 'VENDOR', 'EMPLOYEE', 'OTHER'] } },
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
  ],
  responses: {
    '200': {
      description: 'Paginated list of contacts.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'object',
                    properties: {
                      items: { type: 'array', items: { $ref: '#/components/schemas/AddressBook' } },
                      meta: { $ref: '#/components/schemas/PaginationMeta' },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/contacts/search', 'GET', {
  tags: ['Organization'],
  summary: 'Search contacts globally',
  parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
  responses: {
    '200': {
      description: 'Search results list.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/AddressBook' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/contacts/{id}', 'GET', {
  tags: ['Organization'],
  summary: 'Get contact by ID',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/AddressBook' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/contacts', 'POST', {
  tags: ['Organization'],
  summary: 'Create new contact',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/AddressBook' } } },
  },
  responses: { '201': { description: 'Contact created successfully.' } },
});

addPath('/organization/contacts/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update contact details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/AddressBook' } } },
  },
  responses: { '200': { description: 'Contact updated.' } },
});

addPath('/organization/contacts/{id}', 'DELETE', {
  tags: ['Organization'],
  summary: 'Soft-delete contact',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Contact soft-deleted.' } },
});

// Config Settings
addPath('/organization/config', 'GET', {
  tags: ['Organization'],
  summary: 'List configuration settings',
  responses: {
    '200': {
      description: 'Configuration settings map.',
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ConfigSetting' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/config/{key}', 'GET', {
  tags: ['Organization'],
  summary: 'Get typed configuration setting value',
  parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/ConfigSetting' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/config/{key}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update configuration setting value',
  parameters: [{ name: 'key', in: 'path', required: true, schema: { type: 'string' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ConfigUpdateInput' } } },
  },
  responses: {
    '200': { description: 'Config updated.' },
  },
});

// Extra Values Polymorphic JSON Store
addPath('/organization/extras/{type}/{objectId}', 'GET', {
  tags: ['Organization'],
  summary: 'Retrieve custom attributes / metadata for a record',
  parameters: [
    { name: 'type', in: 'path', required: true, schema: { type: 'string', example: 'SalesInvoice' } },
    { name: 'objectId', in: 'path', required: true, schema: { type: 'string', example: '142' } },
  ],
  responses: {
    '200': {
      description: 'Custom fields retrieved.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              data: { type: 'object', example: { custom_po_received_date: '2026-06-20', internal_flag: true } },
              hashtags: { type: 'array', items: { type: 'string' }, example: ['urgent', 'verified'] },
            },
          },
        },
      },
    },
  },
});

addPath('/organization/extras/{type}/{objectId}', 'PUT', {
  tags: ['Organization'],
  summary: 'Upsert custom attributes / metadata for a record',
  parameters: [
    { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'objectId', in: 'path', required: true, schema: { type: 'string' } },
  ],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: { type: 'object' },
            hashtags: { type: 'array', items: { type: 'string' } },
          },
        },
      },
    },
  },
  responses: { '200': { description: 'Custom fields updated.' } },
});

// Audit Logs
addPath('/organization/audit-logs', 'GET', {
  tags: ['Organization'],
  summary: 'View audit logs trail',
  parameters: [
    { name: 'action', in: 'query', schema: { type: 'string' } },
    { name: 'status', in: 'query', schema: { type: 'string', enum: ['SUCCESS', 'FAILURE'] } },
    { name: 'table_name', in: 'query', schema: { type: 'string' } },
    { name: 'userId', in: 'query', schema: { type: 'integer' } },
  ],
  responses: {
    '200': {
      description: 'Audit logs retrieved.',
    },
  },
});

// RBAC: Roles & Permissions
addPath('/organization/roles', 'GET', {
  tags: ['Organization'],
  summary: 'List RBAC user roles',
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/UserRole' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/roles', 'POST', {
  tags: ['Organization'],
  summary: 'Create user role',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRole' } } },
  },
  responses: { '201': { description: 'Role created.' } },
});

addPath('/organization/roles/{roleId}', 'GET', {
  tags: ['Organization'],
  summary: 'Get role details',
  parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/UserRole' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/roles/{roleId}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update role details',
  parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserRole' } } },
  },
  responses: { '200': { description: 'Role updated.' } },
});

addPath('/organization/roles/{roleId}', 'DELETE', {
  tags: ['Organization'],
  summary: 'Delete role (fails if system role)',
  parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Role deleted.' } },
});

addPath('/organization/roles/{roleId}/permissions', 'PUT', {
  tags: ['Organization'],
  summary: 'Update role module permissions matrix',
  parameters: [{ name: 'roleId', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/RolePermissionsInput' } } },
  },
  responses: { '200': { description: 'Role permissions updated successfully.' } },
});

// RBAC: Users
addPath('/organization/users', 'GET', {
  tags: ['Organization'],
  summary: 'List users credentials profiles',
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              {
                type: 'object',
                properties: {
                  data: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        id: { type: 'integer' },
                        contact_id: { type: 'integer' },
                        username: { type: 'string' },
                        role_id: { type: 'integer' },
                        branch_id: { type: 'integer' },
                        employee_id: { type: 'integer' },
                        is_active: { type: 'boolean' },
                      },
                    },
                  },
                },
              },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/users', 'POST', {
  tags: ['Organization'],
  summary: 'Create user credentials profile',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCredentialsInput' } } },
  },
  responses: { '201': { description: 'User created.' } },
});

addPath('/organization/users/{id}', 'GET', {
  tags: ['Organization'],
  summary: 'Get user profile by ID',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      description: 'User details.',
    },
  },
});

addPath('/organization/users/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update user profile settings (change role, branch, toggle is_active)',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/UserCredentialsUpdateInput' } } },
  },
  responses: { '200': { description: 'User updated.' } },
});

addPath('/organization/users/{id}', 'DELETE', {
  tags: ['Organization'],
  summary: 'Deactivate user login status (soft-delete)',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'User deactivated.' } },
});

// Projects
addPath('/organization/projects', 'GET', {
  tags: ['Organization'],
  summary: 'List projects (cost centres)',
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/ProjectMaster' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/projects', 'POST', {
  tags: ['Organization'],
  summary: 'Create project',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectMaster' } } },
  },
  responses: { '201': { description: 'Project created.' } },
});

addPath('/organization/projects/{id}', 'GET', {
  tags: ['Organization'],
  summary: 'Get project details by ID',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/ProjectMaster' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/organization/projects/{id}', 'PUT', {
  tags: ['Organization'],
  summary: 'Update project details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ProjectMaster' } } },
  },
  responses: { '200': { description: 'Project updated.' } },
});

addPath('/organization/projects/{id}', 'DELETE', {
  tags: ['Organization'],
  summary: 'Soft-delete project',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Project soft-deleted.' } },
});

// Error Reports
addPath('/organization/error-reports', 'GET', {
  tags: ['Organization'],
  summary: 'List reported application errors',
  responses: {
    '200': {
      description: 'Error reports log list.',
    },
  },
});

addPath('/organization/error-reports', 'POST', {
  tags: ['Organization'],
  summary: 'Log an application error (client-side or server integration crash)',
  security: [], // No auth beyond optional authenticate
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorReportInput' } } },
  },
  responses: { '201': { description: 'Error recorded.' } },
});

// ─────────────────────────────────────────────────────────────────────────────
// Accounts Paths
// ─────────────────────────────────────────────────────────────────────────────
addPath('/accounts/groups', 'GET', {
  tags: ['Accounts'],
  summary: 'List chart-of-accounts groups',
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/AccountGroup' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/accounts/groups', 'POST', {
  tags: ['Accounts'],
  summary: 'Create account group',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/AccountGroup' } } },
  },
  responses: { '201': { description: 'Group created.' } },
});

addPath('/accounts/groups/{id}', 'GET', {
  tags: ['Accounts'],
  summary: 'Get account group details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/AccountGroup' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/accounts/groups/{id}', 'PUT', {
  tags: ['Accounts'],
  summary: 'Update account group',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/AccountGroup' } } },
  },
  responses: { '200': { description: 'Group updated.' } },
});

addPath('/accounts/groups/{id}', 'DELETE', {
  tags: ['Accounts'],
  summary: 'Delete account group (fails if system defined or non-empty)',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Group deleted.' } },
});

// Ledgers
addPath('/accounts/ledgers', 'GET', {
  tags: ['Accounts'],
  summary: 'List accounts ledgers',
  parameters: [
    { name: 'type', in: 'query', schema: { type: 'string' } },
    { name: 'group_id', in: 'query', schema: { type: 'integer' } },
  ],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { type: 'array', items: { $ref: '#/components/schemas/LedgerMaster' } } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/accounts/ledgers', 'POST', {
  tags: ['Accounts'],
  summary: 'Create ledger (with optional bank/credit/tax 1:1 extensions)',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/LedgerMaster' } } },
  },
  responses: { '201': { description: 'Ledger created.' } },
});

addPath('/accounts/ledgers/{id}', 'GET', {
  tags: ['Accounts'],
  summary: 'Get ledger details by ID',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: {
            allOf: [
              { $ref: '#/components/schemas/ApiResponse' },
              { type: 'object', properties: { data: { $ref: '#/components/schemas/LedgerMaster' } } },
            ],
          },
        },
      },
    },
  },
});

addPath('/accounts/ledgers/{id}', 'PUT', {
  tags: ['Accounts'],
  summary: 'Update ledger details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/LedgerMaster' } } },
  },
  responses: { '200': { description: 'Ledger updated.' } },
});

addPath('/accounts/ledgers/{id}', 'DELETE', {
  tags: ['Accounts'],
  summary: 'Soft-delete ledger',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Ledger soft-deleted.' } },
});

addPath('/accounts/ledgers/{id}/balance', 'GET', {
  tags: ['Accounts'],
  summary: 'Compute live ledger effective balance',
  description: 'Calculates the balance by aggregating the opening balance and all double-entry journal ledger debit/credit postings.',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      description: 'Computed balance values.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              ledgerId: { type: 'integer' },
              ledgerName: { type: 'string' },
              openingBalance: { type: 'number' },
              totalDebit: { type: 'number' },
              totalCredit: { type: 'number' },
              effectiveBalance: { type: 'number', description: 'Net balance (Debit - Credit)' },
            },
          },
        },
      },
    },
  },
});

// Ledger Extensions 1:1 endpoints
addPath('/accounts/ledgers/{id}/bank', 'GET', {
  tags: ['Accounts'],
  summary: 'Get ledger bank details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Bank details payload.' } },
});

addPath('/accounts/ledgers/{id}/bank', 'PUT', {
  tags: ['Accounts'],
  summary: 'Upsert ledger bank details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            bank_account_number: { type: 'string' },
            iban: { type: 'string' },
            swift_code: { type: 'string' },
            bank_branch_name: { type: 'string' },
          },
          required: ['bank_account_number'],
        },
      },
    },
  },
  responses: { '200': { description: 'Bank details updated.' } },
});

addPath('/accounts/ledgers/{id}/credit', 'GET', {
  tags: ['Accounts'],
  summary: 'Get ledger credit terms settings',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Credit settings payload.' } },
});

addPath('/accounts/ledgers/{id}/credit', 'PUT', {
  tags: ['Accounts'],
  summary: 'Upsert ledger credit terms settings',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            credit_limit: { type: 'number' },
            credit_period_days: { type: 'integer' },
            payment_terms: { type: 'string' },
            caution_deposit: { type: 'number' },
          },
        },
      },
    },
  },
  responses: { '200': { description: 'Credit settings updated.' } },
});

addPath('/accounts/ledgers/{id}/tax', 'GET', {
  tags: ['Accounts'],
  summary: 'Get ledger tax and TRN settings',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Tax settings payload.' } },
});

addPath('/accounts/ledgers/{id}/tax', 'PUT', {
  tags: ['Accounts'],
  summary: 'Upsert ledger tax and TRN settings',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            trn: { type: 'string' },
            tax_category_id: { type: 'integer' },
            type_of_supply: { type: 'string' },
          },
        },
      },
    },
  },
  responses: { '200': { description: 'Tax settings updated.' } },
});

// Bill-wise tracking
addPath('/accounts/billwise', 'POST', {
  tags: ['Accounts'],
  summary: 'Record bill-wise ref allocation',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/BillwiseRecordInput' } } },
  },
  responses: { '201': { description: 'Allocation recorded.' } },
});

addPath('/accounts/billwise/ledger/{ledgerId}', 'GET', {
  tags: ['Accounts'],
  summary: 'List bill-wise records for a ledger',
  parameters: [{ name: 'ledgerId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { '200': { description: 'List of allocations.' } },
});

addPath('/accounts/billwise/{id}', 'GET', {
  tags: ['Accounts'],
  summary: 'Get bill-wise record detail',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Details.' } },
});

addPath('/accounts/billwise/{id}', 'PUT', {
  tags: ['Accounts'],
  summary: 'Update bill-ref details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
  responses: { '200': { description: 'Updated.' } },
});

// Cheques
addPath('/accounts/cheque', 'POST', {
  tags: ['Accounts'],
  summary: 'Record cheque / PDC instrument entry',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ChequeDetailsInput' } } },
  },
  responses: { '201': { description: 'Cheque record logged.' } },
});

addPath('/accounts/cheque/ledger/{ledgerId}', 'GET', {
  tags: ['Accounts'],
  summary: 'List cheque records for a ledger',
  parameters: [{ name: 'ledgerId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { '200': { description: 'List of cheques.' } },
});

addPath('/accounts/cheque/{id}', 'GET', {
  tags: ['Accounts'],
  summary: 'Get cheque details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Details.' } },
});

addPath('/accounts/cheque/{id}', 'PUT', {
  tags: ['Accounts'],
  summary: 'Update cheque status / reconciliation details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            cleared_date: { type: 'string', format: 'date' },
            is_presented: { type: 'boolean' },
            is_cleared: { type: 'boolean' },
            is_returned: { type: 'boolean' },
          },
        },
      },
    },
  },
  responses: { '200': { description: 'Reconciliation updated.' } },
});

// Outstanding & Aging
addPath('/accounts/outstanding/{ledgerId}', 'GET', {
  tags: ['Accounts'],
  summary: 'Get outstanding bills for a customer or vendor ledger',
  parameters: [{ name: 'ledgerId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      description: 'Outstanding bills list.',
    },
  },
});

addPath('/accounts/aging', 'GET', {
  tags: ['Accounts'],
  summary: 'Accounts Receivable / Payable aging analysis report',
  parameters: [
    { name: 'type', in: 'query', required: true, schema: { type: 'string', enum: ['AR', 'AP'] } },
    { name: 'as_of_date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: {
    '200': {
      description: 'Aging buckets (0-30, 31-60, 61-90, 90+ days) summary.',
    },
  },
});

// ─────────────────────────────────────────────────────────────────────────────
// Inventory Paths
// ─────────────────────────────────────────────────────────────────────────────
const invMasters = [
  { name: 'uom', schema: 'UOM', tag: 'Inventory UOM', title: 'Unit of Measure (UOM)' },
  { name: 'brand', schema: 'Brand', tag: 'Inventory Brand', title: 'Brand' },
  { name: 'category', schema: 'Category', tag: 'Inventory Category', title: 'Category' },
  { name: 'tax-category', schema: 'TaxCategory', tag: 'Inventory Tax Category', title: 'Tax Category' },
  { name: 'group', schema: 'InventoryGroup', tag: 'Inventory Group', title: 'Inventory Group' },
  { name: 'item', schema: 'InventoryItem', tag: 'Inventory Item', title: 'Inventory Item (Product)' },
  { name: 'sku', schema: 'SKUMaster', tag: 'Inventory SKU', title: 'SKU Variant' },
  { name: 'batch', schema: 'ItemBatch', tag: 'Inventory Batch', title: 'Item Batch/Lot' },
  { name: 'godown', schema: 'Godown', tag: 'Inventory Godown', title: 'Godown (Warehouse Location)' },
  { name: 'conversion', schema: 'UOMConversion', tag: 'Inventory UOM Conversion', title: 'UOM Conversion' },
  { name: 'pricelist', schema: 'PriceList', tag: 'Inventory Price List', title: 'Price List' },
  { name: 'route', schema: 'Inventory Route', tag: 'Inventory Sales Route', title: 'Delivery Route' },
];

invMasters.forEach((m) => {
  addPath(`/inventory/${m.name}`, 'GET', {
    tags: [m.tag],
    summary: `List ${m.title} resources`,
    responses: { '200': { description: `List of ${m.title} resources.` } },
  });
  addPath(`/inventory/${m.name}`, 'POST', {
    tags: [m.tag],
    summary: `Create ${m.title} resource`,
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: `#/components/schemas/${m.schema}` } } },
    },
    responses: { '201': { description: `${m.title} created.` } },
  });
  if (m.name !== 'property' && m.name !== 'image') {
    addPath(`/inventory/${m.name}/{id}`, 'GET', {
      tags: [m.tag],
      summary: `Get ${m.title} details by ID`,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      responses: { '200': { description: 'Details.' } },
    });
    addPath(`/inventory/${m.name}/{id}`, 'PUT', {
      tags: [m.tag],
      summary: `Update ${m.title} details`,
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
      requestBody: {
        required: true,
        content: { 'application/json': { schema: { $ref: `#/components/schemas/${m.schema}` } } },
      },
      responses: { '200': { description: 'Updated.' } },
    });
  }
  addPath(`/inventory/${m.name}/{id}`, 'DELETE', {
    tags: [m.tag],
    summary: `Soft-delete ${m.title} resource`,
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { '200': { description: 'Soft-deleted.' } },
  });
});

// Custom additions for inventory
addPath('/inventory/property', 'GET', {
  tags: ['Inventory Property'],
  summary: 'List item properties',
  responses: { '200': { description: 'List of properties.' } },
});
addPath('/inventory/property', 'POST', {
  tags: ['Inventory Property'],
  summary: 'Create item property',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemProperty' } } },
  },
  responses: { '201': { description: 'Property created.' } },
});
addPath('/inventory/property/{id}', 'GET', {
  tags: ['Inventory Property'],
  summary: 'Get item property details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Details.' } },
});
addPath('/inventory/property/{id}', 'DELETE', {
  tags: ['Inventory Property'],
  summary: 'Delete item property',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Property deleted successfully.' } },
});

addPath('/inventory/image', 'GET', {
  tags: ['Inventory Image'],
  summary: 'List item images',
  responses: { '200': { description: 'List of images.' } },
});
addPath('/inventory/image', 'POST', {
  tags: ['Inventory Image'],
  summary: 'Upload item base64 image',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ItemImageInput' } } },
  },
  responses: { '201': { description: 'Image saved.' } },
});
addPath('/inventory/image/{id}', 'GET', {
  tags: ['Inventory Image'],
  summary: 'Get item image details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Image metadata and payload.' } },
});
addPath('/inventory/image/{id}', 'DELETE', {
  tags: ['Inventory Image'],
  summary: 'Delete item image',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Image deleted successfully.' } },
});

// Ingredient (BOM) routes
addPath('/inventory/ingredient', 'GET', {
  tags: ['Inventory Recipe (BOM)'],
  summary: 'List BOM recipe ingredients',
  responses: { '200': { description: 'List ingredients.' } },
});
addPath('/inventory/ingredient', 'POST', {
  tags: ['Inventory Recipe (BOM)'],
  summary: 'Create BOM recipe ingredient line',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Ingredient' } } },
  },
  responses: { '201': { description: 'Ingredient line added.' } },
});
addPath('/inventory/ingredient/{id}', 'GET', {
  tags: ['Inventory Recipe (BOM)'],
  summary: 'Get ingredient line details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Details.' } },
});
addPath('/inventory/ingredient/{id}', 'PUT', {
  tags: ['Inventory Recipe (BOM)'],
  summary: 'Update ingredient line details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/Ingredient' } } },
  },
  responses: { '200': { description: 'Updated.' } },
});
addPath('/inventory/ingredient/{id}', 'DELETE', {
  tags: ['Inventory Recipe (BOM)'],
  summary: 'Delete ingredient line',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Deleted.' } },
});
addPath('/inventory/ingredient/recipe/{salesItemId}', 'GET', {
  tags: ['Inventory Recipe (BOM)'],
  summary: 'Get raw ingredients recipe for finished item',
  parameters: [{ name: 'salesItemId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'List of ingredients.' } },
});
addPath('/inventory/ingredient/usage/{purchaseItemId}', 'GET', {
  tags: ['Inventory Recipe (BOM)'],
  summary: 'Get where-used list of raw purchase item',
  parameters: [{ name: 'purchaseItemId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'List of recipes containing this ingredient.' } },
});

// UOM Lookup
addPath('/inventory/conversion/lookup', 'GET', {
  tags: ['Inventory UOM Conversion'],
  summary: 'Look up conversion factor between units',
  parameters: [
    { name: 'from', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'to', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'item_id', in: 'query', schema: { type: 'string' } },
  ],
  responses: { '200': { description: 'Conversion value factor.' } },
});

// Price list custom ops
addPath('/inventory/pricelist/effective-price', 'GET', {
  tags: ['Inventory Price List'],
  summary: 'Resolve effective price for item under conditions',
  parameters: [
    { name: 'item_id', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'pricelist_id', in: 'query', schema: { type: 'integer' } },
    { name: 'uom_id', in: 'query', schema: { type: 'string' } },
    { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Resolved price details.' } },
});
addPath('/inventory/pricelist-entry', 'POST', {
  tags: ['Inventory Price List'],
  summary: 'Create price list entry',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/PriceListEntry' } } },
  },
  responses: { '201': { description: 'Entry added.' } },
});
addPath('/inventory/pricelist-entry/{id}', 'GET', {
  tags: ['Inventory Price List'],
  summary: 'Get entry details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Details.' } },
});
addPath('/inventory/pricelist-entry/{id}', 'PUT', {
  tags: ['Inventory Price List'],
  summary: 'Update entry details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/PriceListEntry' } } },
  },
  responses: { '200': { description: 'Updated.' } },
});
addPath('/inventory/pricelist-entry/{id}', 'DELETE', {
  tags: ['Inventory Price List'],
  summary: 'Delete entry',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Deleted.' } },
});

// Route mappings
addPath('/inventory/route/customer-mapping', 'GET', {
  tags: ['Inventory Sales Route'],
  summary: 'List customer route mappings',
  responses: { '200': { description: 'List of mappings.' } },
});
addPath('/inventory/route/customer-mapping', 'POST', {
  tags: ['Inventory Sales Route'],
  summary: 'Map customer ledger to delivery route',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/RouteCustomerMapping' } } },
  },
  responses: { '201': { description: 'Mapped.' } },
});
addPath('/inventory/route/customer-mapping/{id}', 'DELETE', {
  tags: ['Inventory Sales Route'],
  summary: 'Remove customer route mapping',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Mapping removed.' } },
});
addPath('/inventory/route/mapping', 'GET', {
  tags: ['Inventory Sales Route'],
  summary: 'List salesperson route schedule mapping',
  responses: { '200': { description: 'List schedules.' } },
});
addPath('/inventory/route/mapping', 'POST', {
  tags: ['Inventory Sales Route'],
  summary: 'Map salesperson shift to route on day-of-week',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/RouteMapping' } } },
  },
  responses: { '201': { description: 'Schedule mapped.' } },
});
addPath('/inventory/route/mapping/{id}', 'DELETE', {
  tags: ['Inventory Sales Route'],
  summary: 'Remove salesperson route schedule mapping',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Schedule removed.' } },
});
addPath('/inventory/route/salesman/{employeeId}', 'GET', {
  tags: ['Inventory Sales Route'],
  summary: 'Get route schedule assigned to salesperson',
  parameters: [{ name: 'employeeId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Schedule list.' } },
});
addPath('/inventory/route/customers/{routeId}', 'GET', {
  tags: ['Inventory Sales Route'],
  summary: 'Get customers mapped to route',
  parameters: [{ name: 'routeId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'List of customers.' } },
});

// Party Item restriction map (LedgerItemMapping)
addPath('/inventory/ledger-item-mapping', 'GET', {
  tags: ['Inventory Ledger Item Restriction'],
  summary: 'List allowed ledger items mappings',
  responses: { '200': { description: 'List mappings.' } },
});
addPath('/inventory/ledger-item-mapping', 'POST', {
  tags: ['Inventory Ledger Item Restriction'],
  summary: 'Create ledger-item restriction override mapping',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/LedgerItemMapping' } } },
  },
  responses: { '201': { description: 'Created.' } },
});
addPath('/inventory/ledger-item-mapping/{id}', 'DELETE', {
  tags: ['Inventory Ledger Item Restriction'],
  summary: 'Remove ledger-item restriction mapping',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Removed.' } },
});
addPath('/inventory/ledger-item-mapping/check', 'GET', {
  tags: ['Inventory Ledger Item Restriction'],
  summary: 'Check if transaction is allowed between ledger and item',
  parameters: [
    { name: 'ledger_id', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'item_id', in: 'query', required: true, schema: { type: 'string' } },
  ],
  responses: {
    '200': {
      content: {
        'application/json': {
          schema: { type: 'object', properties: { allowed: { type: 'boolean' } } },
        },
      },
    },
  },
});
addPath('/inventory/ledger-item-mapping/ledger/{ledgerId}', 'GET', {
  tags: ['Inventory Ledger Item Restriction'],
  summary: 'Get all items allowed for a ledger',
  parameters: [{ name: 'ledgerId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { '200': { description: 'List of inventory items.' } },
});
addPath('/inventory/ledger-item-mapping/item/{itemId}', 'GET', {
  tags: ['Inventory Ledger Item Restriction'],
  summary: 'Get all ledgers allowed for an item',
  parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'string' } }],
  responses: { '200': { description: 'List of ledgers.' } },
});

// Stock Ledger movements & balance
addPath('/inventory/stock-ledger/{itemId}', 'GET', {
  tags: ['Inventory Stock Ledger'],
  summary: 'View stock ledger card (movement log) for an item',
  parameters: [
    { name: 'itemId', in: 'path', required: true, schema: { type: 'integer' } },
    { name: 'godown_id', in: 'query', schema: { type: 'integer' } },
    { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'List of stock movement entries.' } },
});
addPath('/inventory/stock-ledger/godown/{godownId}', 'GET', {
  tags: ['Inventory Stock Ledger'],
  summary: 'Get stock inventory catalog balance for a godown',
  parameters: [{ name: 'godownId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Stock balance list.' } },
});
addPath('/inventory/stock-balance', 'GET', {
  tags: ['Inventory Stock Ledger'],
  summary: 'Get stock balance globally or filter by item',
  parameters: [
    { name: 'item_id', in: 'query', schema: { type: 'integer' } },
  ],
  responses: { '200': { description: 'List of stock balances.' } },
});
addPath('/inventory/stock-balance/{itemId}/by-godown', 'GET', {
  tags: ['Inventory Stock Ledger'],
  summary: 'Get item stock balance split by godown locations',
  parameters: [{ name: 'itemId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Stock balance split by godown.' } },
});

// ─────────────────────────────────────────────────────────────────────────────
// Transactions Posting
// ─────────────────────────────────────────────────────────────────────────────
const txnPosts = [
  { name: 'sales-invoice', schema: 'SalesInvoicePostInput', tag: 'Transactions Posting', summary: 'Post Sales Invoice voucher' },
  { name: 'purchase-invoice', schema: 'PurchaseInvoicePostInput', tag: 'Transactions Posting', summary: 'Post Purchase Invoice voucher' },
  { name: 'payment', schema: 'CashBankVoucherPostInput', tag: 'Transactions Posting', summary: 'Post Payment Voucher' },
  { name: 'receipt', schema: 'CashBankVoucherPostInput', tag: 'Transactions Posting', summary: 'Post Receipt Voucher' },
  { name: 'contra', schema: 'ContraVoucherPostInput', tag: 'Transactions Posting', summary: 'Post Contra Voucher (Cash/Bank transfer)' },
  { name: 'journal', schema: 'JournalVoucherPostInput', tag: 'Transactions Posting', summary: 'Post Journal Voucher (Dr/Cr adjustments)' },
  { name: 'credit-note', schema: 'NoteVoucherPostInput', tag: 'Transactions Posting', summary: 'Post Credit Note Voucher' },
  { name: 'debit-note', schema: 'NoteVoucherPostInput', tag: 'Transactions Posting', summary: 'Post Debit Note Voucher' },
  // Phase 4
  { name: 'quotation', schema: 'QuotationPostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Quotation Voucher' },
  { name: 'sales-order', schema: 'SalesOrderPostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Sales Order Voucher' },
  { name: 'purchase-order', schema: 'PurchaseOrderPostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Purchase Order Voucher' },
  { name: 'godown-transfer', schema: 'GodownTransferPostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Godown Stock Transfer Voucher' },
  { name: 'delivery-note', schema: 'DeliveryNotePostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Delivery Note Voucher' },
  { name: 'receipt-note', schema: 'ReceiptNotePostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Receipt Note Voucher' },
  { name: 'material-in', schema: 'MaterialInPostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Material In Voucher' },
  { name: 'requirement', schema: 'RequirementPostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Material Requirement Request Voucher' },
  { name: 'stock-request', schema: 'StockRequestPostInput', tag: 'Transactions Phase 4 Posting', summary: 'Post Inter-godown Stock Request Voucher' },
];

txnPosts.forEach((tp) => {
  addPath(`/transactions/${tp.name}`, 'POST', {
    tags: [tp.tag],
    summary: tp.summary,
    description: 'Generates a unique voucher number, calculates totals, posts balanced journal ledger double entries (Dr/Cr XOR), updates stock ledgers (in/out XOR), and updates bill-wise records atomically.',
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: `#/components/schemas/${tp.schema}` } } },
    },
    responses: {
      '201': {
        description: 'Voucher posted successfully.',
        content: {
          'application/json': {
            schema: {
              allOf: [
                { $ref: '#/components/schemas/ApiResponse' },
                {
                  type: 'object',
                  properties: {
                    data: {
                      type: 'object',
                      properties: {
                        voucherHeaderId: { type: 'integer', example: 12 },
                        voucherNo: { type: 'string', example: 'INV/2026/0001' },
                        grossTotal: { type: 'number', example: 21495.00 },
                        vatAmount: { type: 'number', example: 1074.75 },
                        netTotal: { type: 'number', example: 22569.75 },
                      },
                    },
                  },
                },
              ],
            },
          },
        },
      },
      '400': { description: 'Balanced double entry verification failed or validation error.' },
    },
  });
});

// Quotation status update
addPath('/transactions/quotation/{id}/status', 'PUT', {
  tags: ['Transactions Phase 4 Posting'],
  summary: 'Update quotation completion probability or status',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            completion_probability: { type: 'number', minimum: 0, maximum: 100 },
            status: { type: 'string', enum: ['Draft', 'Approved', 'Posted', 'Cancelled', 'Closed'] },
          },
        },
      },
    },
  },
  responses: { '200': { description: 'Quotation status updated.' } },
});

// Stock request fulfillment
addPath('/transactions/stock-request/{id}/fulfill', 'POST', {
  tags: ['Transactions Phase 4 Posting'],
  summary: 'Fulfill stock request by creating a godown transfer',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: {
    '200': {
      description: 'Request fulfilled.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
              transferVoucherNo: { type: 'string', example: 'GT/2026/0004' },
            },
          },
        },
      },
    },
  },
});

// Pending quantities query
addPath('/transactions/pending-quantities/{id}', 'GET', {
  tags: ['Transactions Phase 4 Posting'],
  summary: 'Get pending delivery note or receipt note quantities from source orders',
  description: 'Calculates the remaining quantities to deliver or receive by checking line-level conversion linkages against the source voucher ID.',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer', description: 'Source Voucher ID' } }],
  responses: {
    '200': {
      description: 'Pending line quantities details.',
      content: {
        'application/json': {
          schema: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sourceLineId: { type: 'integer' },
                itemId: { type: 'integer' },
                itemName: { type: 'string' },
                orderedQty: { type: 'number' },
                convertedQty: { type: 'number', description: 'Quantity already converted/delivered' },
                pendingQty: { type: 'number', description: 'Remaining balance quantity' },
              },
            },
          },
        },
      },
    },
  },
});

// Terms & Conditions Ancillary
addPath('/transactions/terms-and-conditions', 'GET', {
  tags: ['Transactions Ancillary'],
  summary: 'List terms and conditions templates',
  responses: { '200': { description: 'List of templates.' } },
});
addPath('/transactions/terms-and-conditions', 'POST', {
  tags: ['Transactions Ancillary'],
  summary: 'Create terms and conditions template',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/TermsAndConditionsInput' } } },
  },
  responses: { '201': { description: 'Template created.' } },
});
addPath('/transactions/terms-and-conditions/{id}', 'GET', {
  tags: ['Transactions Ancillary'],
  summary: 'Get terms template details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Details.' } },
});
addPath('/transactions/terms-and-conditions/{id}', 'PUT', {
  tags: ['Transactions Ancillary'],
  summary: 'Update terms template',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/TermsAndConditionsInput' } } },
  },
  responses: { '200': { description: 'Updated.' } },
});
addPath('/transactions/terms-and-conditions/{id}', 'DELETE', {
  tags: ['Transactions Ancillary'],
  summary: 'Delete terms template',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Deleted.' } },
});

// Transportation Details Ancillary
addPath('/transactions/transportation-details', 'GET', {
  tags: ['Transactions Ancillary'],
  summary: 'List transportation logs',
  responses: { '200': { description: 'List logs.' } },
});
addPath('/transactions/transportation-details', 'POST', {
  tags: ['Transactions Ancillary'],
  summary: 'Create transportation log for shipment dispatch',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/TransportationDetailsInput' } } },
  },
  responses: { '201': { description: 'Log recorded.' } },
});
addPath('/transactions/transportation-details/{id}', 'GET', {
  tags: ['Transactions Ancillary'],
  summary: 'Get transportation log details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Details.' } },
});
addPath('/transactions/transportation-details/{id}', 'PUT', {
  tags: ['Transactions Ancillary'],
  summary: 'Update transportation log',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/TransportationDetailsInput' } } },
  },
  responses: { '200': { description: 'Updated.' } },
});
addPath('/transactions/transportation-details/{id}', 'DELETE', {
  tags: ['Transactions Ancillary'],
  summary: 'Delete transportation log',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Deleted.' } },
});

// ─────────────────────────────────────────────────────────────────────────────
// Transactions Read
// ─────────────────────────────────────────────────────────────────────────────
const txnReads = [
  { pathName: 'sales-invoices', tag: 'Transactions Reading', summary: 'Sales Invoices' },
  { pathName: 'purchase-invoices', tag: 'Transactions Reading', summary: 'Purchase Invoices' },
  { pathName: 'payments', tag: 'Transactions Reading', summary: 'Payment Vouchers' },
  { pathName: 'receipts', tag: 'Transactions Reading', summary: 'Receipt Vouchers' },
  { pathName: 'contra', tag: 'Transactions Reading', summary: 'Contra Vouchers' },
  { pathName: 'journals', tag: 'Transactions Reading', summary: 'Journal Vouchers' },
  { pathName: 'credit-notes', tag: 'Transactions Reading', summary: 'Credit Notes' },
  { pathName: 'debit-notes', tag: 'Transactions Reading', summary: 'Debit Notes' },
  // Phase 4
  { pathName: 'quotations', tag: 'Transactions Reading', summary: 'Quotations' },
  { pathName: 'sales-orders', tag: 'Transactions Reading', summary: 'Sales Orders' },
  { pathName: 'purchase-orders', tag: 'Transactions Reading', summary: 'Purchase Orders' },
  { pathName: 'delivery-notes', tag: 'Transactions Reading', summary: 'Delivery Notes' },
  { pathName: 'receipt-notes', tag: 'Transactions Reading', summary: 'Receipt Notes' },
  { pathName: 'godown-transfers', tag: 'Transactions Reading', summary: 'Godown Transfers' },
  { pathName: 'material-in', tag: 'Transactions Reading', summary: 'Material In' },
  { pathName: 'requirements', tag: 'Transactions Reading', summary: 'Material Requirements' },
  { pathName: 'stock-requests', tag: 'Transactions Reading', summary: 'Stock Requests' },
];

txnReads.forEach((tr) => {
  addPath(`/transactions/${tr.pathName}`, 'GET', {
    tags: [tr.tag],
    summary: `List ${tr.summary} vouchers`,
    parameters: [
      { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
      { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
      { name: 'status', in: 'query', schema: { type: 'string' } },
    ],
    responses: { '200': { description: `List of ${tr.summary} documents.` } },
  });
  addPath(`/transactions/${tr.pathName}/{id}`, 'GET', {
    tags: [tr.tag],
    summary: `Get ${tr.summary} details by header ID`,
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { '200': { description: 'Full voucher header and line item details.' } },
  });
});

// Generic lookups and lineage
addPath('/transactions/voucher-header/{id}', 'GET', {
  tags: ['Transactions Reading'],
  summary: 'Get generic VoucherHeader by ID',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'VoucherHeader registry record.' } },
});
addPath('/transactions/linkages/{voucherHeaderId}', 'GET', {
  tags: ['Transactions Lineage'],
  summary: 'Get voucher document linkages (lineage flow)',
  parameters: [{ name: 'voucherHeaderId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Linked document mappings (e.g. SalesOrder to DeliveryNote).' } },
});
addPath('/transactions/line-relations/{detailLineId}', 'GET', {
  tags: ['Transactions Lineage'],
  summary: 'Get detailed line relation conversions list',
  parameters: [{ name: 'detailLineId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Line items lineage conversions list.' } },
});
addPath('/transactions/shipment/{voucherHeaderId}', 'GET', {
  tags: ['Transactions Reading'],
  summary: 'Get shipment logistics metadata for a voucher',
  parameters: [{ name: 'voucherHeaderId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Logistics details.' } },
});
addPath('/transactions/physical-specs/{detailLineId}', 'GET', {
  tags: ['Transactions Reading'],
  summary: 'List item physical specifications for a detail line',
  parameters: [{ name: 'detailLineId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Specifications list.' } },
});
addPath('/transactions/line-allocations/{detailLineId}', 'GET', {
  tags: ['Transactions Reading'],
  summary: 'List ledger expense/tax allocations for a detail line',
  parameters: [{ name: 'detailLineId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Expense allocations list.' } },
});

// ─────────────────────────────────────────────────────────────────────────────
// Voucher Lifecycle Management
// ─────────────────────────────────────────────────────────────────────────────
addPath('/transactions/{type}/{id}', 'PUT', {
  tags: ['Transactions Lifecycle'],
  summary: 'Edit Draft voucher',
  description: 'Allows updating detail lines and headers on draft vouchers before posting/approval lock.',
  parameters: [
    { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
  ],
  requestBody: { required: true, content: { 'application/json': { schema: { type: 'object' } } } },
  responses: { '200': { description: 'Voucher draft updated.' } },
});

addPath('/transactions/{type}/{id}/cancel', 'POST', {
  tags: ['Transactions Lifecycle'],
  summary: 'Cancel / Void voucher',
  description: 'Marks voucher cancelled. Reverses stock movements and GL journal postings.',
  parameters: [
    { name: 'type', in: 'path', required: true, schema: { type: 'string', example: 'SalesInvoice' } },
    { name: 'id', in: 'path', required: true, schema: { type: 'integer', example: 12 } },
  ],
  responses: { '200': { description: 'Voucher voided and balances reversed.' } },
});

addPath('/transactions/{type}/{id}/approve', 'POST', {
  tags: ['Transactions Lifecycle'],
  summary: 'Approve voucher',
  description: 'Locks voucher status to Approved and commits GL/stock entries if configured for approval workflows.',
  parameters: [
    { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
  ],
  responses: { '200': { description: 'Voucher approved.' } },
});

addPath('/transactions/{type}/{id}/reject', 'POST', {
  tags: ['Transactions Lifecycle'],
  summary: 'Reject voucher draft',
  parameters: [
    { name: 'type', in: 'path', required: true, schema: { type: 'string' } },
    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
  ],
  responses: { '200': { description: 'Voucher draft rejected.' } },
});

// ─────────────────────────────────────────────────────────────────────────────
// Reports & Dashboard
// ─────────────────────────────────────────────────────────────────────────────
addPath('/transactions/reports/sales-register', 'GET', {
  tags: ['Reports'],
  summary: 'Sales Register Report',
  parameters: [
    { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Sales register journal list.' } },
});

addPath('/transactions/reports/purchase-register', 'GET', {
  tags: ['Reports'],
  summary: 'Purchase Register Report',
  parameters: [
    { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Purchase register journal list.' } },
});

addPath('/transactions/reports/ledger-statement', 'GET', {
  tags: ['Reports'],
  summary: 'Ledger Statement Report',
  parameters: [
    { name: 'ledger_id', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'start_date', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
    { name: 'end_date', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Running ledger statement debits, credits, and balances.' } },
});

addPath('/transactions/reports/trial-balance', 'GET', {
  tags: ['Reports'],
  summary: 'Trial Balance Report',
  parameters: [
    { name: 'as_of_date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Trial Balance list of accounts.' } },
});

addPath('/transactions/reports/profit-loss', 'GET', {
  tags: ['Reports'],
  summary: 'Profit & Loss (Income Statement) Report',
  parameters: [
    { name: 'start_date', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
    { name: 'end_date', in: 'query', required: true, schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Profit and loss statements.' } },
});

addPath('/transactions/reports/balance-sheet', 'GET', {
  tags: ['Reports'],
  summary: 'Balance Sheet Report',
  responses: { '200': { description: 'Balance sheet statement.' } },
});

addPath('/transactions/reports/day-book', 'GET', {
  tags: ['Reports'],
  summary: 'Day Book Report',
  responses: { '200': { description: 'Day book statement.' } },
});

addPath('/transactions/reports/vat-return', 'GET', {
  tags: ['Reports'],
  summary: 'VAT Return Report',
  parameters: [
    { name: 'period', in: 'query', schema: { type: 'string', example: '2026-06' } },
  ],
  responses: { '200': { description: 'VAT summary report.' } },
});

addPath('/transactions/reports/stock-summary', 'GET', {
  tags: ['Reports'],
  summary: 'Stock Summary Report',
  parameters: [
    { name: 'as_of_date', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'godown_id', in: 'query', schema: { type: 'integer' } },
    { name: 'category_id', in: 'query', schema: { type: 'integer' } },
  ],
  responses: { '200': { description: 'Stock summary list.' } },
});

addPath('/transactions/reports/stock-valuation', 'GET', {
  tags: ['Reports'],
  summary: 'Stock Valuation Report',
  parameters: [
    { name: 'as_of_date', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'godown_id', in: 'query', schema: { type: 'integer' } },
  ],
  responses: { '200': { description: 'Stock valuation report.' } },
});

// Dashboard & Search (prefixed with /reports or /dashboard)
addPath('/reports/dashboard', 'GET', {
  tags: ['Reports'],
  summary: 'Get dashboard KPI summary data',
  parameters: [
    { name: 'company_id', in: 'query', schema: { type: 'integer' } },
    { name: 'branch_id', in: 'query', schema: { type: 'integer' } },
    { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Dashboard statistics summary.' } },
});

addPath('/reports/alerts', 'GET', {
  tags: ['Reports'],
  summary: 'Retrieve operational alerts (document expiry, overdue bills)',
  responses: { '200': { description: 'Alerts list.' } },
});

addPath('/reports/search', 'GET', {
  tags: ['Reports'],
  summary: 'Global search autocomplete',
  parameters: [{ name: 'q', in: 'query', required: true, schema: { type: 'string' } }],
  responses: { '200': { description: 'Matching entities (items, ledgers, vouchers) list.' } },
});

// ─────────────────────────────────────────────────────────────────────────────
// Employee Paths
// ─────────────────────────────────────────────────────────────────────────────
const empMasters = [
  { name: 'departments', schema: 'Department', tag: 'Employee HR Management', title: 'Department' },
  { name: 'designations', schema: 'Designation', tag: 'Employee HR Management', title: 'Designation' },
  { name: 'employees', schema: 'EmployeeDetails', tag: 'Employee HR Management', title: 'Employee' },
];

empMasters.forEach((m) => {
  addPath(`/employee/${m.name}`, 'GET', {
    tags: [m.tag],
    summary: `List HR ${m.title} resources`,
    responses: { '200': { description: `List of ${m.title} resources.` } },
  });
  addPath(`/employee/${m.name}`, 'POST', {
    tags: [m.tag],
    summary: `Create ${m.title} resource`,
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: `#/components/schemas/${m.schema}` } } },
    },
    responses: { '201': { description: `${m.title} created.` } },
  });
  addPath(`/employee/${m.name}/{id}`, 'GET', {
    tags: [m.tag],
    summary: `Get ${m.title} details by ID`,
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { '200': { description: 'Details.' } },
  });
  addPath(`/employee/${m.name}/{id}`, 'PUT', {
    tags: [m.tag],
    summary: `Update ${m.title} details`,
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    requestBody: {
      required: true,
      content: { 'application/json': { schema: { $ref: `#/components/schemas/${m.schema}` } } },
    },
    responses: { '200': { description: 'Updated.' } },
  });
  addPath(`/employee/${m.name}/{id}`, 'DELETE', {
    tags: [m.tag],
    summary: `Soft-delete ${m.title} resource`,
    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
    responses: { '200': { description: 'Soft-deleted.' } },
  });
});

// Employee specific details
addPath('/employee/employees/{id}/salary-history', 'GET', {
  tags: ['Employee HR Management'],
  summary: 'View employee basic salary revision history',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Salary revisions list.' } },
});

// Employee Documents
addPath('/employee/employees/{id}/documents', 'POST', {
  tags: ['Employee Documents'],
  summary: 'Attach document/ID to employee profile (EmiratesID, Passport, Visa)',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeDocumentInput' } } },
  },
  responses: { '201': { description: 'Document saved.' } },
});
addPath('/employee/documents/{docId}', 'PUT', {
  tags: ['Employee Documents'],
  summary: 'Update employee document details',
  parameters: [{ name: 'docId', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeDocumentInput' } } },
  },
  responses: { '200': { description: 'Document updated.' } },
});
addPath('/employee/documents/expiries', 'GET', {
  tags: ['Employee Documents'],
  summary: 'List upcoming visa/passport expiries for alert reminders',
  parameters: [{ name: 'days', in: 'query', schema: { type: 'integer', default: 30 } }],
  responses: { '200': { description: 'Document list.' } },
});

// Leave Policy
addPath('/employee/leave/policies', 'GET', {
  tags: ['Employee Leaves'],
  summary: 'List leave policies',
  responses: { '200': { description: 'List of policies.' } },
});
addPath('/employee/leave/policies', 'POST', {
  tags: ['Employee Leaves'],
  summary: 'Create leave policy',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/LeavePolicyInput' } } },
  },
  responses: { '201': { description: 'Policy created.' } },
});
addPath('/employee/leave/allocations', 'POST', {
  tags: ['Employee Leaves'],
  summary: 'Allocate leave balances to employee for a year',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveAllocationInput' } } },
  },
  responses: { '201': { description: 'Allocated.' } },
});
addPath('/employee/employees/{id}/leave-allocations', 'GET', {
  tags: ['Employee Leaves'],
  summary: 'Get leave balance allocations for employee',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Allocations list.' } },
});

// Leave Requests
addPath('/employee/employees/{id}/leave-requests', 'POST', {
  tags: ['Employee Leaves'],
  summary: 'Submit leave request',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/LeaveRequestInput' } } },
  },
  responses: { '201': { description: 'Leave request logged.' } },
});
addPath('/employee/leave-requests/{requestId}', 'PUT', {
  tags: ['Employee Leaves'],
  summary: 'Update leave request status (Approve / Reject / Cancel)',
  parameters: [{ name: 'requestId', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            status: { type: 'string', enum: ['APPROVED', 'REJECTED', 'CANCELLED'] },
            rejection_reason: { type: 'string' },
          },
          required: ['status'],
        },
      },
    },
  },
  responses: { '200': { description: 'Status updated.' } },
});
addPath('/employee/leave-requests', 'GET', {
  tags: ['Employee Leaves'],
  summary: 'List leave requests (filtered by status or employee)',
  parameters: [
    { name: 'status', in: 'query', schema: { type: 'string' } },
    { name: 'employee_id', in: 'query', schema: { type: 'integer' } },
  ],
  responses: { '200': { description: 'List requests.' } },
});

// Attendance Logs
addPath('/employee/employees/{id}/attendance', 'POST', {
  tags: ['Employee Attendance'],
  summary: 'Log biometric or manual check-in/check-out details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/AttendanceDetailsInput' } } },
  },
  responses: { '201': { description: 'Attendance logged.' } },
});
addPath('/employee/employees/{id}/roster', 'GET', {
  tags: ['Employee Attendance'],
  summary: 'Retrieve employee monthly shift roster calendar',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
    { name: 'month', in: 'query', schema: { type: 'string', example: '2026-06' } },
  ],
  responses: { '200': { description: 'Monthly roster.' } },
});

// Shifts
addPath('/employee/shifts', 'GET', {
  tags: ['Employee Shifts'],
  summary: 'List shift master definitions',
  responses: { '200': { description: 'List shifts.' } },
});
addPath('/employee/shifts', 'POST', {
  tags: ['Employee Shifts'],
  summary: 'Create shift master definition',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/ShiftMasterInput' } } },
  },
  responses: { '201': { description: 'Shift created.' } },
});
addPath('/employee/employees/{id}/shift', 'POST', {
  tags: ['Employee Shifts'],
  summary: 'Assign duty shift to employee',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/EmployeeShiftAssignmentInput' } } },
  },
  responses: { '201': { description: 'Shift assigned.' } },
});
addPath('/employee/employees/{id}/shift-roster', 'GET', {
  tags: ['Employee Shifts'],
  summary: 'Get assigned shift schedule roster details',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Assigned shift timeline roster.' } },
});

// WPS & Payroll Payslips
addPath('/employee/payslips', 'POST', {
  tags: ['Employee Payroll'],
  summary: 'Post monthly payroll payslip entry (creates balanced salary expense double entry)',
  requestBody: {
    required: true,
    content: { 'application/json': { schema: { $ref: '#/components/schemas/PayslipMainInput' } } },
  },
  responses: { '201': { description: 'Payslip voucher posted.' } },
});
addPath('/employee/payslips/{id}', 'GET', {
  tags: ['Employee Payroll'],
  summary: 'Get payslip details by ID',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'Payslip details.' } },
});
addPath('/employee/employees/{employeeId}/payslips', 'GET', {
  tags: ['Employee Payroll'],
  summary: 'List payslips for an employee',
  parameters: [{ name: 'employeeId', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'List of payslips.' } },
});
addPath('/employee/payslips', 'GET', {
  tags: ['Employee Payroll'],
  summary: 'List payslips by salary period month',
  parameters: [{ name: 'period', in: 'query', required: true, schema: { type: 'string', example: '2026-05' } }],
  responses: { '200': { description: 'List of payslips.' } },
});

// HR Salary Revision
addPath('/employee/employees/{id}/salary-revision', 'POST', {
  tags: ['Employee HR Management'],
  summary: 'Post salary revision / raise',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            revision_date: { type: 'string', format: 'date', example: '2026-06-21' },
            basic_salary_after: { type: 'number', example: 13500 },
            gross_after: { type: 'number', example: 20500 },
            revision_reason: { type: 'string', example: 'Annual performance raise' },
            revised_by: { type: 'string', example: 'Admin' },
          },
          required: ['revision_date', 'basic_salary_after', 'gross_after'],
        },
      },
    },
  },
  responses: { '201': { description: 'Salary revision recorded.' } },
});
addPath('/employee/employees/{id}/salary-revisions', 'GET', {
  tags: ['Employee HR Management'],
  summary: 'Get salary revision history',
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
  responses: { '200': { description: 'History.' } },
});

// HR Attendance Summary
addPath('/employee/employees/{id}/attendance-summary', 'GET', {
  tags: ['Employee Attendance'],
  summary: 'Get monthly attendance summary metrics (Present, Absent, Overtime)',
  parameters: [
    { name: 'id', in: 'path', required: true, schema: { type: 'integer' } },
    { name: 'month', in: 'query', schema: { type: 'string', example: '2026-06' } },
  ],
  responses: {
    '200': {
      description: 'Attendance statistics.',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              employeeId: { type: 'integer' },
              month: { type: 'string' },
              totalPresent: { type: 'number' },
              totalAbsent: { type: 'number' },
              totalLeavePaid: { type: 'number' },
              totalLeaveUnpaid: { type: 'number' },
              totalHoliday: { type: 'number' },
              totalOvertimeHours: { type: 'number' },
            },
          },
        },
      },
    },
  },
});

// HR Overtime Report
addPath('/employee/reports/overtime', 'GET', {
  tags: ['Reports'],
  summary: 'Retrieve overtime hours report for all employees',
  parameters: [
    { name: 'start_date', in: 'query', schema: { type: 'string', format: 'date' } },
    { name: 'end_date', in: 'query', schema: { type: 'string', format: 'date' } },
  ],
  responses: { '200': { description: 'Overtime report list.' } },
});

// ─────────────────────────────────────────────────────────────────────────────
// Output Generation
// ─────────────────────────────────────────────────────────────────────────────

// JSON conversion to custom YAML stringifier
function jsonToYaml(obj: any, indent: number = 0): string {
  const spacing = ' '.repeat(indent);
  let yaml = '';

  if (obj === null) {
    return 'null\n';
  }

  if (typeof obj === 'string') {
    if (obj.includes('\n') || obj.includes(':') || obj.includes('{') || obj.includes('[') || obj.includes('\'') || obj.includes('"') || obj.includes('#')) {
      return `"${obj.replace(/"/g, '\\"')}"\n`;
    }
    return `${obj}\n`;
  }

  if (typeof obj === 'number' || typeof obj === 'boolean') {
    return `${obj}\n`;
  }

  if (Array.isArray(obj)) {
    if (obj.length === 0) {
      return '[]\n';
    }
    for (const item of obj) {
      const itemVal = jsonToYaml(item, indent + 2);
      yaml += `${spacing}- ${itemVal.trimStart()}`;
    }
    return yaml;
  }

  if (typeof obj === 'object') {
    const keys = Object.keys(obj);
    if (keys.length === 0) {
      return '{}\n';
    }
    for (const key of keys) {
      const value = obj[key];
      const keyStr = (key.includes(' ') || key.includes('/') || key.includes('{') || key.includes('}') || key.includes(':')) ? `"${key}"` : key;
      if (typeof value === 'object' && value !== null) {
        yaml += `${spacing}${keyStr}:\n${jsonToYaml(value, indent + 2)}`;
      } else {
        yaml += `${spacing}${keyStr}: ${jsonToYaml(value, 0)}`;
      }
    }
    return yaml;
  }

  return '\n';
}

const rootDir = path.resolve(__dirname, '..');
const srcDocsDir = path.resolve(rootDir, 'src', 'core', 'docs');

const jsonContent = JSON.stringify(openApiSpec, null, 2);
const yamlContent = jsonToYaml(openApiSpec, 0);

// Write src/core/docs/openapi.json
fs.writeFileSync(path.join(srcDocsDir, 'openapi.json'), jsonContent, 'utf-8');
console.log('Generated src/core/docs/openapi.json');

// Write openapi.json in root
fs.writeFileSync(path.join(rootDir, 'openapi.json'), jsonContent, 'utf-8');
console.log('Generated openapi.json in root');

// Write openapi.yaml in root
fs.writeFileSync(path.join(rootDir, 'openapi.yaml'), yamlContent, 'utf-8');
console.log('Generated openapi.yaml in root');
