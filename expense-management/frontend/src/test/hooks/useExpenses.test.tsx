import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useExpenses } from '../../hooks/useExpenses';

const mockExpenseData = {
  data: [
    {
      id: 'expense-1',
      expense_number: 'EXP-2401-000001',
      title: 'テスト経費',
      status: 'draft',
      status_label: '下書き',
      total_amount: 5000,
      total_amount_formatted: '¥5,000',
      currency: 'JPY',
      applicant: { id: 'user-1', name: 'テスト太郎', department: '営業部' },
      items: [],
      receipts: [],
      approval_records: [],
      can_edit: true,
      can_submit: true,
      can_cancel: false,
      applied_at: null,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    },
  ],
  meta: { current_page: 1, last_page: 1, per_page: 20, total: 1 },
};

vi.mock('../../lib/api', () => ({
  expenseApi: {
    list:  vi.fn().mockResolvedValue(mockExpenseData),
    get:   vi.fn().mockResolvedValue(mockExpenseData.data[0]),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    submit: vi.fn(),
    approve: vi.fn(),
    reject: vi.fn(),
    cancel: vi.fn(),
    exportCsv: vi.fn(),
  },
  categoryApi: { list: vi.fn().mockResolvedValue([]) },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

describe('useExpenses', () => {
  it('経費一覧を取得できる', async () => {
    const { result } = renderHook(
      () => useExpenses({ page: 1, per_page: 20 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.data).toHaveLength(1);
    expect(result.current.data?.data[0].title).toBe('テスト経費');
    expect(result.current.data?.meta.total).toBe(1);
  });

  it('ローディング状態を正しく返す', () => {
    const { result } = renderHook(
      () => useExpenses({ page: 1, per_page: 20 }),
      { wrapper: createWrapper() },
    );
    expect(result.current.isLoading).toBe(true);
  });
});
