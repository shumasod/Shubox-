type Locale = 'ja' | 'en';

type TranslationTree = Record<string, string | Record<string, string>>;

const translations: Record<Locale, TranslationTree> = {
  ja: {
    common: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除',
      edit: '編集',
      create: '作成',
      search: '検索',
      loading: '読み込み中...',
      error: 'エラーが発生しました',
      success: '保存しました',
      confirm: '確認',
      back: '戻る',
      next: '次へ',
      submit: '送信',
      close: '閉じる',
      noData: 'データがありません',
    },
    nav: {
      dashboard: 'ダッシュボード',
      expenses: '経費一覧',
      approvals: '承認',
      reports: 'レポート',
      settings: '設定',
      logout: 'ログアウト',
    },
    expense: {
      title: 'タイトル',
      amount: '金額',
      category: 'カテゴリ',
      date: '日付',
      status: 'ステータス',
      description: '説明',
      receipt: '領収書',
      submit: '申請する',
      approve: '承認',
      reject: '却下',
      draft: '下書き',
      pending: '申請中',
      approved: '承認済',
      rejected: '却下',
      paid: '支払済',
      archived: 'アーカイブ',
      newExpense: '新規経費申請',
      editExpense: '経費を編集',
      duplicateExpense: '経費をコピー',
    },
    approval: {
      pendingCount: '{{count}}件の承認待ち',
      approveConfirm: 'この経費を承認しますか？',
      rejectConfirm: '却下理由を入力してください',
      comment: 'コメント',
      approvedBy: '{{name}}が承認',
      rejectedBy: '{{name}}が却下',
    },
    report: {
      monthly: '月次レポート',
      quarterly: '四半期レポート',
      yearOverYear: '前年比',
      categoryBreakdown: 'カテゴリ別内訳',
      totalAmount: '合計金額',
      expenseCount: '件数',
      averageAmount: '平均金額',
    },
    auth: {
      login: 'ログイン',
      email: 'メールアドレス',
      password: 'パスワード',
      forgotPassword: 'パスワードを忘れた方',
      loginFailed: 'メールアドレスまたはパスワードが正しくありません',
      twoFactor: '二段階認証コード',
    },
    settings: {
      profile: 'プロフィール',
      notifications: '通知設定',
      security: 'セキュリティ',
      language: '言語',
      theme: 'テーマ',
    },
  },
  en: {
    common: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      create: 'Create',
      search: 'Search',
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Saved successfully',
      confirm: 'Confirm',
      back: 'Back',
      next: 'Next',
      submit: 'Submit',
      close: 'Close',
      noData: 'No data available',
    },
    nav: {
      dashboard: 'Dashboard',
      expenses: 'Expenses',
      approvals: 'Approvals',
      reports: 'Reports',
      settings: 'Settings',
      logout: 'Log out',
    },
    expense: {
      title: 'Title',
      amount: 'Amount',
      category: 'Category',
      date: 'Date',
      status: 'Status',
      description: 'Description',
      receipt: 'Receipt',
      submit: 'Submit for approval',
      approve: 'Approve',
      reject: 'Reject',
      draft: 'Draft',
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      paid: 'Paid',
      archived: 'Archived',
      newExpense: 'New Expense',
      editExpense: 'Edit Expense',
      duplicateExpense: 'Duplicate Expense',
    },
    approval: {
      pendingCount: '{{count}} pending approvals',
      approveConfirm: 'Approve this expense?',
      rejectConfirm: 'Enter rejection reason',
      comment: 'Comment',
      approvedBy: 'Approved by {{name}}',
      rejectedBy: 'Rejected by {{name}}',
    },
    report: {
      monthly: 'Monthly Report',
      quarterly: 'Quarterly Report',
      yearOverYear: 'Year over Year',
      categoryBreakdown: 'Category Breakdown',
      totalAmount: 'Total Amount',
      expenseCount: 'Count',
      averageAmount: 'Average Amount',
    },
    auth: {
      login: 'Log in',
      email: 'Email address',
      password: 'Password',
      forgotPassword: 'Forgot your password?',
      loginFailed: 'Invalid email or password',
      twoFactor: 'Two-factor code',
    },
    settings: {
      profile: 'Profile',
      notifications: 'Notifications',
      security: 'Security',
      language: 'Language',
      theme: 'Theme',
    },
  },
};

let currentLocale: Locale = (localStorage.getItem('locale') as Locale) ?? 'ja';

export function setLocale(locale: Locale): void {
  currentLocale = locale;
  localStorage.setItem('locale', locale);
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: string, vars?: Record<string, string | number>): string {
  const parts = key.split('.');
  let node: TranslationTree | string = translations[currentLocale];

  for (const part of parts) {
    if (typeof node === 'string') return key;
    node = node[part];
    if (node === undefined) return key;
  }

  let result = typeof node === 'string' ? node : key;

  if (vars) {
    result = result.replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ''));
  }

  return result;
}
