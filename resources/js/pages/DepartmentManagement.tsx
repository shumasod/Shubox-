import { useState, useId } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Department {
  id: number;
  name: string;
  code: string;
  parent_id: number | null;
  manager_name: string | null;
  member_count: number;
  sort_order: number;
  children?: Department[];
}

const api = {
  get: async (url: string) => { const r = await fetch(url); if (!r.ok) throw new Error(); return r.json(); },
  post: (url: string, body: object) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
  put:  (url: string, body: object) => fetch(url, { method: 'PUT',  headers: { 'Content-Type': 'application/json', Accept: 'application/json' }, body: JSON.stringify(body) }).then(r => { if (!r.ok) throw new Error(); return r.json(); }),
  delete: (url: string) => fetch(url, { method: 'DELETE', headers: { Accept: 'application/json' } }).then(r => { if (!r.ok) throw new Error(); }),
};

function DepartmentRow({
  dept,
  depth,
  onEdit,
  onDelete,
  onAddChild,
}: {
  dept: Department;
  depth: number;
  onEdit: (d: Department) => void;
  onDelete: (id: number) => void;
  onAddChild: (parentId: number) => void;
}) {
  const [expanded, setExpanded] = useState(depth < 1);
  const hasChildren = (dept.children?.length ?? 0) > 0;

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 group">
        <td className="px-4 py-3">
          <div className="flex items-center" style={{ paddingLeft: `${depth * 20}px` }}>
            {hasChildren ? (
              <button
                onClick={() => setExpanded(e => !e)}
                aria-expanded={expanded}
                aria-label={expanded ? '折りたたむ' : '展開'}
                className="mr-2 rounded p-0.5 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <svg className={`h-3.5 w-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <span className="mr-2 w-5" aria-hidden="true" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">{dept.name}</span>
          </div>
        </td>
        <td className="px-4 py-3 font-mono text-sm text-gray-500">{dept.code}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{dept.manager_name ?? '未設定'}</td>
        <td className="px-4 py-3 text-sm text-gray-500">{dept.member_count}人</td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            {depth < 1 && (
              <button onClick={() => onAddChild(dept.id)}
                className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                + 子部門
              </button>
            )}
            <button onClick={() => onEdit(dept)}
              className="text-xs text-gray-600 hover:underline dark:text-gray-400">編集</button>
            {dept.member_count === 0 && (
              <button onClick={() => onDelete(dept.id)}
                className="text-xs text-red-600 hover:underline dark:text-red-400">削除</button>
            )}
          </div>
        </td>
      </tr>
      {expanded && hasChildren && dept.children!.map(child => (
        <DepartmentRow
          key={child.id}
          dept={child}
          depth={depth + 1}
          onEdit={onEdit}
          onDelete={onDelete}
          onAddChild={onAddChild}
        />
      ))}
    </>
  );
}

function DepartmentModal({
  initial,
  parentId,
  onClose,
}: {
  initial: Department | null;
  parentId: number | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const nameId = useId();
  const codeId = useId();

  const [form, setForm] = useState({
    name: initial?.name ?? '',
    code: initial?.code ?? '',
  });

  const mutation = useMutation({
    mutationFn: (data: typeof form) => {
      if (initial) return api.put(`/api/departments/${initial.id}`, data);
      return api.post('/api/departments', { ...data, parent_id: parentId });
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); onClose(); },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dept-modal-title"
        className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl dark:bg-gray-800"
        onClick={e => e.stopPropagation()}
      >
        <h2 id="dept-modal-title" className="text-lg font-semibold text-gray-900 dark:text-white">
          {initial ? '部門を編集' : parentId ? '子部門を追加' : '部門を追加'}
        </h2>
        <div className="mt-4 space-y-4">
          <div>
            <label htmlFor={nameId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">部門名</label>
            <input id={nameId} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
          <div>
            <label htmlFor={codeId} className="block text-sm font-medium text-gray-700 dark:text-gray-300">部門コード</label>
            <input id={codeId} value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              placeholder="ENG"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white" />
          </div>
        </div>
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onClose}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300">
            キャンセル
          </button>
          <button
            onClick={() => mutation.mutate(form)}
            disabled={!form.name.trim() || !form.code.trim() || mutation.isPending}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50">
            {mutation.isPending ? '保存中…' : initial ? '更新' : '追加'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DepartmentManagement() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Department | null | undefined>(undefined);
  const [addingChildTo, setAddingChildTo] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery<Department[]>({
    queryKey: ['departments'],
    queryFn: async () => (await api.get('/api/departments?tree=true')).data,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/departments/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['departments'] }),
  });

  const departments = (data ?? []).filter(d =>
    !search || d.name.toLowerCase().includes(search.toLowerCase()) || d.code.toLowerCase().includes(search.toLowerCase())
  );

  const showModal = editing !== undefined || addingChildTo !== null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">部門管理</h1>
        <button
          onClick={() => setEditing(null)}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + 部門を追加
        </button>
      </div>

      <div className="mt-4">
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="部門名またはコードで検索"
          className="w-full max-w-xs rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="space-y-3 p-4">
            {[0, 1, 2, 3].map(i => <div key={i} className="h-10 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />)}
          </div>
        ) : departments.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-gray-500">
            {search ? '検索結果がありません' : '部門が登録されていません'}
          </p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                {['部門名', 'コード', 'マネージャー', '人数', '操作'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white dark:divide-gray-700 dark:bg-gray-900">
              {departments.map(dept => (
                <DepartmentRow
                  key={dept.id}
                  dept={dept}
                  depth={0}
                  onEdit={d => { setAddingChildTo(null); setEditing(d); }}
                  onDelete={id => {
                    if (confirm('この部門を削除しますか？')) deleteMutation.mutate(id);
                  }}
                  onAddChild={parentId => { setEditing(undefined); setAddingChildTo(parentId); }}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <DepartmentModal
          initial={editing ?? null}
          parentId={addingChildTo}
          onClose={() => { setEditing(undefined); setAddingChildTo(null); }}
        />
      )}
    </div>
  );
}
