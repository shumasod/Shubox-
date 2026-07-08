import React, { useRef } from 'react';

export interface PrintExpense {
  expense_number: string;
  title: string;
  status: string;
  total_amount: number;
  applicant_name: string;
  department_name?: string;
  category_name?: string;
  purpose?: string;
  created_at: string;
  applied_at?: string;
  items: Array<{
    description: string;
    vendor_name?: string;
    incurred_at: string;
    amount: number;
    quantity: number;
  }>;
  approvals: Array<{
    approver_name: string;
    action: string;
    comment?: string;
    approved_at: string;
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  draft:     '草稿',
  submitted: '承認待ち',
  approved:  '承認済',
  rejected:  '却下',
  paid:      '支払済',
};

export default function ExpensePrintView({ expense }: { expense: PrintExpense }) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => window.print();

  const fmt = (n: number) => `¥${n.toLocaleString('ja-JP')}`;
  const fmtDate = (s: string) => new Date(s).toLocaleDateString('ja-JP');

  return (
    <>
      {/* Print trigger — hidden in print */}
      <button
        onClick={handlePrint}
        className="print:hidden mb-4 flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
        </svg>
        印刺する
      </button>

      {/* Print-optimized content */}
      <div ref={printRef} className="print:block font-sans text-sm text-gray-900">
        <style>{`
          @media print {
            @page { size: A4 portrait; margin: 16mm; }
            body * { visibility: hidden; }
            .print-area, .print-area * { visibility: visible; }
            .print-area { position: absolute; left: 0; top: 0; width: 100%; }
            .no-print { display: none !important; }
          }
        `}</style>

        <div className="print-area">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 pb-4 border-b-2 border-gray-800">
            <div>
              <h1 className="text-xl font-bold">経費申請書</h1>
              <p className="text-xs text-gray-500 mt-1">第号: {expense.expense_number}</p>
            </div>
            <div className="text-right text-xs text-gray-500">
              <p>印刺日時: {new Date().toLocaleString('ja-JP')}</p>
              <p className="mt-1">ステータス: <strong>{STATUS_LABELS[expense.status] ?? expense.status}</strong></p>
            </div>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-6 text-xs">
            <div><span className="text-gray-500">件名: </span>{expense.title}</div>
            <div><span className="text-gray-500">申請者: </span>{expense.applicant_name}</div>
            <div><span className="text-gray-500">部門: </span>{expense.department_name ?? '—'}</div>
            <div><span className="text-gray-500">申請日: </span>{expense.applied_at ? fmtDate(expense.applied_at) : '—'}</div>
            <div><span className="text-gray-500">カテゴリ: </span>{expense.category_name ?? '—'}</div>
            <div><span className="text-gray-500">登録日: </span>{fmtDate(expense.created_at)}</div>
            {expense.purpose && <div className="col-span-2"><span className="text-gray-500">目的: </span>{expense.purpose}</div>}
          </div>

          {/* Line items */}
          <table className="w-full border-collapse mb-6 text-xs">
            <thead>
              <tr className="bg-gray-100">
                <th className="border px-2 py-1 text-left">内容</th>
                <th className="border px-2 py-1 text-left">販売店</th>
                <th className="border px-2 py-1 text-center">日付</th>
                <th className="border px-2 py-1 text-right">数量</th>
                <th className="border px-2 py-1 text-right">金額</th>
              </tr>
            </thead>
            <tbody>
              {expense.items.map((item, i) => (
                <tr key={i}>
                  <td className="border px-2 py-1">{item.description}</td>
                  <td className="border px-2 py-1">{item.vendor_name ?? ''}</td>
                  <td className="border px-2 py-1 text-center">{fmtDate(item.incurred_at)}</td>
                  <td className="border px-2 py-1 text-right">{item.quantity}</td>
                  <td className="border px-2 py-1 text-right">{fmt(item.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td className="border px-2 py-1" colSpan={4}>合計</td>
                <td className="border px-2 py-1 text-right">{fmt(expense.total_amount)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Approval records */}
          {expense.approvals.length > 0 && (
            <>
              <h2 className="text-sm font-bold mb-2">承認履歴</h2>
              <table className="w-full border-collapse text-xs mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 py-1 text-left">承認者</th>
                    <th className="border px-2 py-1 text-left">結果</th>
                    <th className="border px-2 py-1 text-left">日時</th>
                    <th className="border px-2 py-1 text-left">コメント</th>
                  </tr>
                </thead>
                <tbody>
                  {expense.approvals.map((a, i) => (
                    <tr key={i}>
                      <td className="border px-2 py-1">{a.approver_name}</td>
                      <td className="border px-2 py-1">{a.action}</td>
                      <td className="border px-2 py-1">{fmtDate(a.approved_at)}</td>
                      <td className="border px-2 py-1">{a.comment ?? ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}

          {/* Signature section */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            {['申請者', '承認者', '小切'].map(label => (
              <div key={label} className="border-t-2 border-gray-400 pt-2 text-center text-xs text-gray-500">{label}</div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
