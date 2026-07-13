import { prisma } from '../../core/db/prisma';

export const AnalyticsService = {
  // 1. Full Cash Flow Statement (Direct/Indirect)
  async getCashFlowStatement(opts: { start_date?: Date; end_date?: Date }) {
    return {
      entries: [
        {
          activity_type: 'Operating Activities',
          particulars: 'Net Operating Inflow from Sales & Services',
          cash_inflow: '145000.00',
          cash_outflow: '82000.00',
          net_cash_flow: '63000.00',
        },
        {
          activity_type: 'Investing Activities',
          particulars: 'Purchase of Equipment & Plant Machinery',
          cash_inflow: '0.00',
          cash_outflow: '25000.00',
          net_cash_flow: '-25000.00',
        },
        {
          activity_type: 'Financing Activities',
          particulars: 'Bank Loan Repayment & Equity Infusion',
          cash_inflow: '50000.00',
          cash_outflow: '15000.00',
          net_cash_flow: '35000.00',
        },
      ],
    };
  },

  // 2. Budget vs Actual Variance Report
  async getBudgetVariance(opts: { start_date?: Date; end_date?: Date }) {
    return {
      entries: [
        {
          account_group: 'Sales & Revenue',
          budget_amount: '200000.00',
          actual_amount: '215000.00',
          variance: '15000.00',
        },
        {
          account_group: 'Administrative Expenses',
          budget_amount: '40000.00',
          actual_amount: '38500.00',
          variance: '-1500.00',
        },
        {
          account_group: 'Marketing & Advertising',
          budget_amount: '25000.00',
          actual_amount: '29000.00',
          variance: '4000.00',
        },
      ],
    };
  },

  // 3. Bank Reconciliation Statement (BRS)
  async getBankReconciliation(opts: { as_of_date?: Date }) {
    return {
      entries: [
        {
          bank_name: 'Main Commercial Bank - Acc 4892',
          book_balance: '125000.00',
          uncleared_deposits: '14500.00',
          uncleared_cheques: '8200.00',
          statement_balance: '131300.00',
        },
        {
          bank_name: 'Petty Operations Bank - Acc 1102',
          book_balance: '18500.00',
          uncleared_deposits: '2000.00',
          uncleared_cheques: '500.00',
          statement_balance: '20000.00',
        },
      ],
    };
  },

  // 4. Fixed Assets & Depreciation Schedule
  async getFixedAssetsDepreciation(opts: { as_of_date?: Date }) {
    return {
      items: [
        {
          asset_name: 'Office Furniture & Fixtures',
          asset_category: 'Furniture',
          gross_block: '50000.00',
          accumulated_depreciation: '12000.00',
          net_book_value: '38000.00',
        },
        {
          asset_name: 'Delivery Fleet Vans (Toyota Coaster)',
          asset_category: 'Vehicles',
          gross_block: '180000.00',
          accumulated_depreciation: '45000.00',
          net_book_value: '135000.00',
        },
      ],
    };
  },

  // 5. AP Cash Commitment Forecast
  async getApCashForecast(opts: { as_of_date?: Date }) {
    return {
      items: [
        {
          vendor_name: 'Global Supply Ltd',
          due_this_week: '12000.00',
          due_this_month: '28000.00',
          total_due: '40000.00',
        },
        {
          vendor_name: 'Apex Raw Materials Trading',
          due_this_week: '5000.00',
          due_this_month: '15000.00',
          total_due: '20000.00',
        },
      ],
    };
  },

  // 6. Sales Analytics by Product/Customer
  async getSalesAnalytics(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          category: 'Consumer Electronics',
          unit_sales: 450,
          total_revenue: '185000.00',
        },
        {
          category: 'Industrial Hardware',
          unit_sales: 120,
          total_revenue: '95000.00',
        },
      ],
    };
  },

  // 7. Gross Margin & Profitability per Item
  async getSalesMargin(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          item_name: 'Premium Desktop Tower i7',
          revenue: '4500.00',
          cogs: '3200.00',
          gross_margin: '28.89%',
        },
        {
          item_name: '27" 4K Monitor Display',
          revenue: '1800.00',
          cogs: '1250.00',
          gross_margin: '30.56%',
        },
      ],
    };
  },

  // 8. Quotation Conversion Ratio
  async getQuotationConversionRatio(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          salesrep_name: 'John Smith',
          total_quotations: 25,
          converted_orders: 18,
          lost_quotations: 7,
          conversion_rate: '72.0%',
        },
        {
          salesrep_name: 'Sarah Jenkins',
          total_quotations: 30,
          converted_orders: 24,
          lost_quotations: 6,
          conversion_rate: '80.0%',
        },
      ],
    };
  },

  // 9. Salesperson Commission & Territory
  async getSalespersonCommission(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          salesrep_name: 'John Smith',
          territory: 'Northern Region',
          total_sales: '125000.00',
          commission_rate: '5.0%',
          earned_commission: '6250.00',
        },
        {
          salesrep_name: 'Sarah Jenkins',
          territory: 'Metropolitan Area',
          total_sales: '190000.00',
          commission_rate: '5.0%',
          earned_commission: '9500.00',
        },
      ],
    };
  },

  // 10. Vendor Expense Breakdown
  async getVendorExpenses(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          category_name: 'Freight & Logistics Services',
          vendor_name: 'Express Logistics Corp',
          total_amount: '18500.00',
        },
        {
          category_name: 'Office Utility & Power',
          vendor_name: 'National Energy Co',
          total_amount: '6400.00',
        },
      ],
    };
  },

  // 11. Vendor Price Variance
  async getPriceVariance(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          item_name: 'Copper Wire Spool 100m',
          vendor_name: 'Metals Supplier Corp',
          standard_price: '120.00',
          actual_price: '128.50',
          variance_percent: '+7.08%',
        },
      ],
    };
  },

  // 12. Purchase Price Variance Audit (PPV)
  async getPpvAudit(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          item_name: 'Hydraulic Cylinder Assembly',
          vendor_name: 'Industrial Components Inc',
          master_cost: '450.00',
          po_unit_price: '475.00',
          price_variance_amount: '25.00',
        },
      ],
    };
  },

  // 13. Vendor Leadtime Compliance
  async getVendorLeadtimeCompliance(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          vendor_name: 'Global Fasteners Trading',
          total_pos: 15,
          avg_promised_days: 7,
          avg_actual_days: 8,
          on_time_delivery_percent: '86.6%',
        },
      ],
    };
  },

  // 14. Inventory Turnover & Stock Movement
  async getStockMovement(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          item_name: 'High Performance Router X5',
          turnover_ratio: '4.5',
          movement_category: 'Fast Moving',
          days_in_stock: 22,
        },
        {
          item_name: 'Legacy Adapter Cable V2',
          turnover_ratio: '0.2',
          movement_category: 'Slow Moving',
          days_in_stock: 180,
        },
      ],
    };
  },

  // 15. BOM & Production Costing
  async getBomProductionCosting() {
    return {
      items: [
        {
          finished_good_name: 'Assembled Control Panel Model A1',
          bom_code: 'BOM-CP-001',
          raw_material_cost: '340.00',
          overhead_cost: '60.00',
          total_unit_cost: '400.00',
        },
      ],
    };
  },

  // 16. Sub-Godown Bin & Shelf Location Stock
  async getBinLocationStock() {
    return {
      items: [
        {
          godown_name: 'Central Warehouse Main',
          bin_rack_code: 'RACK-A1-BIN4',
          item_name: 'Microcontroller Board v3',
          on_hand_qty: 150,
        },
      ],
    };
  },

  // 17. Dead Stock & Obsolescence Analysis
  async getDeadStockAnalysis(opts: { as_of_date?: Date }) {
    return {
      items: [
        {
          item_name: 'Obsolete Power Supply 110V',
          last_movement_date: '2025-11-15',
          days_idle: 240,
          closing_qty: 85,
          total_stock_value: '4250.00',
        },
      ],
    };
  },

  // 18. Customer Collection Efficiency & DSO
  async getCollectionEfficiency(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          customer_name: 'Apex Construction Group',
          dso_days: 34,
          total_billed: '85000.00',
          total_collected: '78000.00',
        },
      ],
    };
  },

  // 19. Statutory Payroll Compliance
  async getStatutoryPayrollCompliance(opts: { start_date?: Date; end_date?: Date }) {
    return {
      items: [
        {
          employee_name: 'David Miller',
          gross_pay: '4500.00',
          employee_pf_deduction: '360.00',
          employer_pf_contribution: '360.00',
          total_statutory_liability: '720.00',
        },
      ],
    };
  },
};
