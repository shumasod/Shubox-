import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpense, useApproveExpense, useRejectExpense, useCancelExpense, useSubmitExpense } from '../../hooks/useExpenses';
import { useAuthStore } from '../../stores/authStore';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/expense';

export function ExpenseDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const { data: expense, isLoading, isError } = useExpense(id!);
  const approveExpense = useApproveExpense();
  const rejectExpense = useRejectExpense();
  const cancelExpense = useCancelExpense();
  const submitExpense = useSubmitExpense();

  const [approveComment, setApproveComment] = useState('');
  const [rejectComment, setRejectComment] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (isError || !expense) {
    return (
      <div className="text-center py-12 text-red-500">
        申請データの取得に失敗しました
      </div>
    );
  }

  const isApplicant = expense.applicant?.id === user?.id;

  const handleApprove = async () => {
    await approveExpense.mutateAsync({ id: id!, comment: approveComment || undefined });
    setShowApproveModal(false);
    setApproveComment('');
  };

  const handleReject = async () => {
    if (rejectComment.length < 10) return;
    await rejectExpense.mutateAsync({ id: id!, comment: rejectComment });
    setShowRejectModal(false);
    setRejectComment('');
  };

  const handleCancel = async () => {
    if (!confirm('この申請を取り消しますか？')) return;
    await cancelExpense.mutateAsync(id!);
  };

  const handleSubmit = async () => {
    if (!confirm('この申請を提出しますか？')) return;
    await submitExpense.mutateAsync(id!);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* ページヘッダー */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 flex items-center gap-1"
          >
            ← 一覧に戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{expense.title}</h1>
          <p className="text-sm text-gray-500 mt-1 font-mono">{expense.expense_number}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[expense.status]}`}>
            {STATUS_LABELS[expense.status]}
          </span>
        </div>
      </div>

      {/* アクションボタン */}
      <div className="flex flex-wrap gap-2">
        {expense.can_submit && isApplicant && (
          <button
            onClick={handleSubmit}
            disabled={submitExpense.isPending}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            申請を提出する
          </button>
        )}
        {expense.can_edit && isApplicant && (
          <button
            onClick={() => navigate(`/expenses/${id}/edit`)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            編集
          </button>
        )}
        {expense.can_cancel && isApplicant && (
          <button
            onClick={handleCancel}
            disabled={cancelExpense.isPending}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 disabled:opacity-50"
          >
            取り消し
          </button>
        )}
        {/* 承認者向けボタン（承認中ステータスのみ） */}
        {['pending', 'partially_approved'].includes(expense.status) && !isApplicant && (
          <>
            <button
              onClick={() => setShowApproveModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              承認する
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              却下する
            </button>
          </>
        )}
      </div>

      {/* 基本情報 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h2>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm text-gray-500">申請者</dt>
            <dd className="mt-1 text-sm font-medium text-gray-900">
              {expense.applicant?.name}
              {expense.applicant?.department && (
                <span className="text-gray-500 font-normal ml-1">({expense.applicant.department})</span>
              )}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">合計金額</dt>
            <dd className="mt-1 text-xl font-bold text-gray-900">{expense.total_amount_formatted}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">申請日</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expense.applied_at ? new Date(expense.applied_at).toLocaleDateString('ja-JP') : '未申請'}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">承認日</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {expense.approved_at ? new Date(expense.approved_at).toLocaleDateString('ja-JP') : '-'}
            </dd>
          </div>
          {expense.description && (
            <div className="col-span-2">
              <dt className="text-sm text-gray-500">備考</dt>
              <dd className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{expense.description}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* 明細 */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">明細</h2>
        <div className="space-y-3">
          {expense.items.map((item, index) => (
            <div key={item.id} className="rounded-lg border border-gray-100 bg-gray-50 p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                      {item.category?.name ?? '未分類'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.expense_date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                  <p className="text-sm font-medium text-gray-900">{item.description}</p>
                  {item.vendor && (
                    <p className="text-xs text-gray-500 mt-0.5">支払先: {item.vendor}</p>
                  )}
                  {item.purpose && (
                    <p className="text-xs text-gray-500">目的: {item.purpose}</p>
                  )}
                </div>
                <div className="text-right ml-4">
                  {item.quantity > 1 && (
                    <p className="text-xs text-gray-500">¥{item.amount.toLocaleString()} × {item.quantity}</p>
                  )}
                  <p className="text-sm font-semibold text-gray-900">{item.line_total_formatted}</p>
                </div>
              </div>

              {/* 領収書 */}
              {item.receipts.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.receipts.map((receipt) => (
                    <a
                      key={receipt.id}
                      href={receipt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 border border-blue-200 rounded px-2 py-1 bg-blue-50"
                    >
                      <PaperClipIcon />
                      {receipt.original_filename}
                      <span className="text-gray-400">({receipt.file_size_formatted})</span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-4 pt-4 border-t">
          <div className="text-right">
            <p className="text-sm text-gray-500">合計</p>
            <p className="text-2xl font-bold text-gray-900">{expense.total_amount_formatted}</p>
          </div>
        </div>
      </div>

      {/* 承認履歴 */}
      {expense.approval_records.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">承認履歴</h2>
          <div className="space-y-3">
            {expense.approval_records.map((record) => (
              <div key={record.id} className="flex gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  record.action === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {record.action === 'approved' ? '✓' : '✗'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900">{record.approver.name}</span>
                    <span className={`text-xs px-1.5 py-0.5 rounded ${
                      record.action === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {record.action_label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(record.acted_at).toLocaleString('ja-JP')}
                    </span>
                  </div>
                  {record.comment && (
                    <p className="mt-1 text-sm text-gray-600 bg-gray-50 rounded p-2">{record.comment}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 承認モーダル */}
      {showApproveModal && (
        <Modal title="承認確認" onClose={() => setShowApproveModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">この申請を承認してよろしいですか？</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">コメント（任意）</label>
              <textarea
                value={approveComment}
                onChange={(e) => setApproveComment(e.target.value)}
                rows={3}
                placeholder="承認コメントを入力してください"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 text-sm text-gray-700 border rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleApprove}
                disabled={approveExpense.isPending}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
              >
                {approveExpense.isPending ? '処理中...' : '承認する'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* 却下モーダル */}
      {showRejectModal && (
        <Modal title="却下確認" onClose={() => setShowRejectModal(false)}>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">この申請を却下してよろしいですか？</p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                却下理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectComment}
                onChange={(e) => setRejectComment(e.target.value)}
                rows={4}
                placeholder="却下理由を入力してください（10文字以上）"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              {rejectComment.length > 0 && rejectComment.length < 10 && (
                <p className="mt-1 text-xs text-red-500">10文字以上入力してください</p>
              )}
            </div>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 text-sm text-gray-700 border rounded-md hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleReject}
                disabled={rejectExpense.isPending || rejectComment.length < 10}
                className="px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {rejectExpense.isPending ? '処理中...' : '却下する'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PaperClipIcon() {
  return (
    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  );
}
