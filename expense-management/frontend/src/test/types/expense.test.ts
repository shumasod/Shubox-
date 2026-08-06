import { describe, it, expect } from 'vitest';
import { STATUS_LABELS, STATUS_COLORS } from '../../types/expense';
import type { ExpenseStatus } from '../../types/expense';

describe('expense types', () => {
  const expectedStatuses: ExpenseStatus[] = [
    'draft', 'submitted', 'partially_approved', 'approved', 'rejected', 'cancelled', 'paid',
  ];

  it('STATUS_LABELSが全ステータスを網羅している', () => {
    expectedStatuses.forEach((status) => {
      expect(STATUS_LABELS[status]).toBeDefined();
      expect(typeof STATUS_LABELS[status]).toBe('string');
    });
  });

  it('STATUS_COLORSが全ステータスを網羅している', () => {
    expectedStatuses.forEach((status) => {
      expect(STATUS_COLORS[status]).toBeDefined();
      expect(STATUS_COLORS[status]).toContain('bg-');
    });
  });

  it('STATUS_LABELSが日本語ラベルを返す', () => {
    expect(STATUS_LABELS['draft']).toBe('下書き');
    expect(STATUS_LABELS['submitted']).toBe('申請中');
    expect(STATUS_LABELS['approved']).toBe('承認済み');
    expect(STATUS_LABELS['rejected']).toBe('却下');
    expect(STATUS_LABELS['paid']).toBe('支払済み');
  });
});
