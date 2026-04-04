export type ExpenseStatus =
  | 'draft'
  | 'pending'
  | 'partially_approved'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'paid';

export const STATUS_LABELS: Record<ExpenseStatus, string> = {
  draft: '下書き',
  pending: '申請中',
  partially_approved: '一部承認',
  approved: '承認済み',
  rejected: '却下',
  cancelled: '取り消し',
  paid: '支払済み',
};

export const STATUS_COLORS: Record<ExpenseStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  pending: 'bg-blue-100 text-blue-700',
  partially_approved: 'bg-yellow-100 text-yellow-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-500',
  paid: 'bg-purple-100 text-purple-700',
};

export interface Category {
  id: string;
  name: string;
  code: string | null;
  parent_id: string | null;
  max_amount: number | null;
  requires_receipt: boolean;
}

export interface ExpenseItemInput {
  category_id: string;
  description: string;
  amount: number;
  quantity: number;
  expense_date: string;
  vendor: string | null;
  purpose: string | null;
  sort_order: number;
}

export interface CreateExpenseInput {
  title: string;
  description: string | null;
  currency: 'JPY' | 'USD' | 'EUR';
  items: ExpenseItemInput[];
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  department: string | null;
}

export interface Receipt {
  id: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  file_size_formatted: string;
  url: string;
  ocr: {
    text: string;
    amount: number | null;
    date: string | null;
    vendor: string | null;
  } | null;
  created_at: string;
}

export interface ExpenseItem {
  id: string;
  category_id: string;
  category: { id: string; name: string; code: string | null } | null;
  description: string;
  amount: number;
  quantity: number;
  line_total: number;
  line_total_formatted: string;
  expense_date: string;
  vendor: string | null;
  purpose: string | null;
  sort_order: number;
  receipts: Receipt[];
}

export interface ApprovalRecord {
  id: string;
  action: 'approved' | 'rejected' | 'delegated';
  action_label: string;
  comment: string | null;
  approver: UserSummary;
  acted_at: string;
}

export interface Comment {
  id: string;
  body: string;
  is_edited: boolean;
  user: { id: string; name: string };
  replies: Comment[];
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: string;
  expense_number: string;
  title: string;
  description: string | null;
  total_amount: number;
  total_amount_formatted: string;
  currency: string;
  status: ExpenseStatus;
  status_label: string;
  current_step: number;
  applied_at: string | null;
  approved_at: string | null;
  paid_at: string | null;
  applicant: UserSummary | null;
  items: ExpenseItem[];
  approval_records: ApprovalRecord[];
  comments: Comment[];
  can_edit: boolean;
  can_submit: boolean;
  can_cancel: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
  };
}

export interface ExpenseSearchParams {
  status?: ExpenseStatus;
  applicant_id?: string;
  date_from?: string;
  date_to?: string;
  keyword?: string;
  per_page?: number;
  page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}
