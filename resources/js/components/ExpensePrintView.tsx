import React, { useRef } from 'react';

interface LineItem {
  description: string;
  quantity:    number;
  unit_price:  number;
  amount:      number;
}

interface ApprovalStep {
  approver_name: string;
  approver_role: string;
  status:        string;
  decided_at:    string | null;
  comment:       string | null;
}

interface ExpenseDetail {
  id:               number;
  title:            string;
  description:      string;
  amount:           number;
  currency:         string;
  status:           string;
  category:         string;
  submitted_by:     string;
  department:       string;
  created_at:       string;
  approved_at:      string | null;
  paid_at:          string | null;
  line_items:       LineItem[];
  approval_steps:   ApprovalStep[];
}

interface Props {
  expense: ExpenseDetail;
}

const formatCurrency = (amount: number, currency = 'JPY') =>
  new Intl.NumberFormat('ja-JP', { style: 'currency', currency }).format(amount / 100);

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric' }) : '-';

export const ExpensePrintView: React.FC<Props> = ({ expense }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  return (
    <div>
      {/* Screen-only print button */}
      <div className="print:hidden mb-4 flex justify-end">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-sm hover:bg-gray-200 dark:hover:bg-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Print
        </button>
      </div>

      {/* Print content */}
      <div
        ref={printRef}
        className="bg-white text-gray-900 p-8 max-w-2xl mx-auto print:p-0 print:max-w-none print:shadow-none"
        style={{ fontFamily: 'serif' }}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-4 border-b-2 border-gray-900">
          <div>
            <h1 className="text-2xl font-bold">Expense Report</h1>
            <p className="text-sm text-gray-500 mt-1">#{expense.id}</p>
          </div>
          <div className="text-right text-sm">
            <p className="font-semibold">{expense.submitted_by}</p>
            <p className="text-gray-500">{expense.department}</p>
            <p className="text-gray-500">{formatDate(expense.created_at)}</p>
          </div>
        </div>

        {/* Title & status */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-1">{expense.title}</h2>
          <p className="text-sm text-gray-500">{expense.description}</p>
          <div className="flex gap-4 mt-2 text-sm">
            <span><span className="font-medium">Category:</span> {expense.category}</span>
            <span><span className="font-medium">Status:</span> {expense.status.toUpperCase()}</span>
          </div>
        </div>

        {/* Line items */}
        {expense.line_items.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide">Line Items</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-900">
                  <th className="text-left py-1 pr-2">Description</th>
                  <th className="text-right py-1 px-2">Qty</th>
                  <th className="text-right py-1 px-2">Unit Price</th>
                  <th className="text-right py-1 pl-2">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expense.line_items.map((item, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-1 pr-2">{item.description}</td>
                    <td className="text-right py-1 px-2">{item.quantity}</td>
                    <td className="text-right py-1 px-2">{formatCurrency(item.unit_price, expense.currency)}</td>
                    <td className="text-right py-1 pl-2">{formatCurrency(item.amount, expense.currency)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-900 font-bold">
                  <td colSpan={3} className="text-right py-2 pr-2">Total</td>
                  <td className="text-right py-2 pl-2">{formatCurrency(expense.amount, expense.currency)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}

        {/* Approval trail */}
        {expense.approval_steps.length > 0 && (
          <div className="mb-6">
            <h3 className="font-semibold mb-2 text-sm uppercase tracking-wide">Approval History</h3>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-gray-900">
                  <th className="text-left py-1">Approver</th>
                  <th className="text-left py-1">Role</th>
                  <th className="text-left py-1">Decision</th>
                  <th className="text-left py-1">Date</th>
                </tr>
              </thead>
              <tbody>
                {expense.approval_steps.map((step, i) => (
                  <tr key={i} className="border-b border-gray-200">
                    <td className="py-1">{step.approver_name}</td>
                    <td className="py-1">{step.approver_role}</td>
                    <td className="py-1 font-medium">{step.status}</td>
                    <td className="py-1">{formatDate(step.decided_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Signature block */}
        <div className="mt-12 grid grid-cols-3 gap-8">
          {['Submitted by', 'Approved by', 'Finance'].map(label => (
            <div key={label}>
              <div className="border-b border-gray-400 h-8 mb-1" />
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
