import type {
  CreateExpenseInput,
  Expense,
  ExpenseSearchParams,
  PaginatedResponse,
  Category,
} from '../types/expense';

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api/v1';

class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('access_token');
  const tenantSlug = localStorage.getItem('tenant_slug');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {}),
    ...options.headers,
  };

  const response = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: 'Unknown error' }));
    throw new ApiError(response.status, body.message ?? 'Request failed', body.errors);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ===== Auth =====
export const authApi = {
  login: (email: string, password: string, tenantSlug: string) =>
    request<{ access_token: string; user: object }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, tenant_slug: tenantSlug }),
    }),

  logout: () => request<void>('/auth/logout', { method: 'POST' }),

  me: () => request<object>('/me'),
};

// ===== Expenses =====
export const expenseApi = {
  list: (params: ExpenseSearchParams = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined && v !== null && v !== '')
        .map(([k, v]) => [k, String(v)])
    ).toString();
    return request<PaginatedResponse<Expense>>(`/expenses${qs ? `?${qs}` : ''}`);
  },

  get: (id: string) => request<Expense>(`/expenses/${id}`),

  create: (data: CreateExpenseInput) =>
    request<Expense>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: CreateExpenseInput) =>
    request<Expense>(`/expenses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) => request<void>(`/expenses/${id}`, { method: 'DELETE' }),

  submit: (id: string) =>
    request<Expense>(`/expenses/${id}/submit`, { method: 'POST' }),

  approve: (id: string, comment?: string) =>
    request<Expense>(`/expenses/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  reject: (id: string, comment: string) =>
    request<Expense>(`/expenses/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ comment }),
    }),

  cancel: (id: string) =>
    request<Expense>(`/expenses/${id}/cancel`, { method: 'POST' }),

  history: (id: string) =>
    request<{ data: object[] }>(`/expenses/${id}/history`),

  exportCsv: async (params: ExpenseSearchParams = {}) => {
    const token = localStorage.getItem('access_token');
    const qs = new URLSearchParams(
      Object.entries(params)
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => [k, String(v)])
    ).toString();

    const response = await fetch(`${BASE_URL}/expenses/export${qs ? `?${qs}` : ''}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `expenses_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  },
};

// ===== Categories =====
export const categoryApi = {
  list: () => request<Category[]>('/categories'),
};

// ===== Receipts =====
export const receiptApi = {
  upload: (expenseId: string, itemId: string, file: File) => {
    const token = localStorage.getItem('access_token');
    const formData = new FormData();
    formData.append('file', file);

    return fetch(`${BASE_URL}/expenses/${expenseId}/items/${itemId}/receipts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      body: formData,
    }).then(async (res) => {
      if (!res.ok) throw new ApiError(res.status, 'Upload failed');
      return res.json();
    });
  },

  delete: (expenseId: string, itemId: string, receiptId: string) =>
    request<void>(`/expenses/${expenseId}/items/${itemId}/receipts/${receiptId}`, {
      method: 'DELETE',
    }),
};

export { ApiError };
