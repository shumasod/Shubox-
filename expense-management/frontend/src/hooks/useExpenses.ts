import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseApi } from '../lib/api';
import type { CreateExpenseInput, ExpenseSearchParams } from '../types/expense';

export const expenseKeys = {
  all: ['expenses'] as const,
  lists: () => [...expenseKeys.all, 'list'] as const,
  list: (params: ExpenseSearchParams) => [...expenseKeys.lists(), params] as const,
  details: () => [...expenseKeys.all, 'detail'] as const,
  detail: (id: string) => [...expenseKeys.details(), id] as const,
};

export function useExpenses(params: ExpenseSearchParams = {}) {
  return useQuery({
    queryKey: expenseKeys.list(params),
    queryFn: () => expenseApi.list(params),
    placeholderData: (prev) => prev,
  });
}

export function useExpense(id: string) {
  return useQuery({
    queryKey: expenseKeys.detail(id),
    queryFn: () => expenseApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expenseApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useUpdateExpense(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateExpenseInput) => expenseApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useSubmitExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.submit(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useApproveExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment?: string }) =>
      expenseApi.approve(id, comment),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useRejectExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, comment }: { id: string; comment: string }) =>
      expenseApi.reject(id, comment),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}

export function useCancelExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.cancel(id),
    onSuccess: (_, id) => {
      qc.invalidateQueries({ queryKey: expenseKeys.detail(id) });
      qc.invalidateQueries({ queryKey: expenseKeys.lists() });
    },
  });
}
