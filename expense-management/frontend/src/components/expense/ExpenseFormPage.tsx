import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { expenseApi } from '../../lib/api';
import { useCreateExpense } from '../../hooks/useExpenses';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { expenseKeys } from '../../hooks/useExpenses';
import { ExpenseForm } from './ExpenseForm';
import type { CreateExpenseInput } from '../../types/expense';

export function ExpenseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const { data: expense, isLoading: isFetching } = useQuery({
    queryKey: expenseKeys.detail(id!),
    queryFn: () => expenseApi.get(id!),
    enabled: isEdit,
  });

  const createMutation = useCreateExpense();

  const updateMutation = useMutation({
    mutationFn: (data: CreateExpenseInput) => expenseApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      queryClient.invalidateQueries({ queryKey: expenseKeys.detail(id!) });
      navigate(`/expenses/${id}`);
    },
  });

  const saveDraftMutation = useMutation({
    mutationFn: (data: CreateExpenseInput) =>
      isEdit ? expenseApi.update(id!, data) : expenseApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: expenseKeys.lists() });
      navigate(`/expenses/${res.id}`);
    },
  });

  const handleSubmit = async (data: CreateExpenseInput) => {
    if (isEdit) {
      await updateMutation.mutateAsync(data);
    } else {
      const res = await createMutation.mutateAsync(data);
      navigate(`/expenses/${res.id}`);
    }
  };

  const handleSaveDraft = async (data: CreateExpenseInput) => {
    await saveDraftMutation.mutateAsync(data);
  };

  if (isEdit && isFetching) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const isLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    saveDraftMutation.isPending;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? '経費申請を編集' : '新規経費申請'}
        </h1>
      </div>

      {(createMutation.isError || updateMutation.isError) && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-700">
          保存に失敗しました。入力内容を確認してください。
        </div>
      )}

      <ExpenseForm
        defaultValues={expense}
        onSubmit={handleSubmit}
        onSaveDraft={handleSaveDraft}
        isLoading={isLoading}
      />
    </div>
  );
}
