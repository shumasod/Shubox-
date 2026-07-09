import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import UserAvatar from './UserAvatar';

interface Comment {
  id: number;
  body: string;
  user: { id: number; name: string; avatar_url?: string | null };
  created_at: string;
  is_own: boolean;
}

interface Props {
  expenseId: number;
  currentUserId: number;
}

async function fetchComments(expenseId: number): Promise<Comment[]> {
  const res = await fetch(`/api/v1/expenses/${expenseId}/comments`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to load comments');
  const data = await res.json();
  return data.data ?? data;
}

async function postComment(expenseId: number, body: string): Promise<Comment> {
  const res = await fetch(`/api/v1/expenses/${expenseId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ body }),
  });
  if (!res.ok) throw new Error('Failed to post comment');
  return res.json();
}

async function deleteComment(expenseId: number, commentId: number): Promise<void> {
  const res = await fetch(`/api/v1/expenses/${expenseId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to delete comment');
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function CommentItem({
  comment,
  expenseId,
  onDeleted,
}: {
  comment: Comment;
  expenseId: number;
  onDeleted: (id: number) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  const queryClient = useQueryClient();

  const { mutate: remove, isPending } = useMutation({
    mutationFn: () => deleteComment(expenseId, comment.id),
    onSuccess: () => {
      onDeleted(comment.id);
      queryClient.invalidateQueries({ queryKey: ['comments', expenseId] });
    },
  });

  return (
    <div className="flex gap-3 group">
      <UserAvatar name={comment.user.name} src={comment.user.avatar_url} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.user.name}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500">{formatDate(comment.created_at)}</span>
        </div>
        <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
          {comment.body}
        </p>
        {comment.is_own && (
          <div className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {!confirming ? (
              <button
                onClick={() => setConfirming(true)}
                className="text-xs text-red-500 hover:text-red-700 dark:hover:text-red-400"
              >
                Delete
              </button>
            ) : (
              <span className="text-xs">
                <span className="text-gray-500 dark:text-gray-400">Delete this comment? </span>
                <button
                  onClick={() => remove()}
                  disabled={isPending}
                  className="text-red-600 hover:underline disabled:opacity-50"
                >
                  {isPending ? 'Deleting...' : 'Yes'}
                </button>
                {' '}
                <button onClick={() => setConfirming(false)} className="text-gray-500 hover:underline">No</button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function ExpenseCommentThread({ expenseId, currentUserId }: Props) {
  const [draft, setDraft]   = useState('');
  const textareaRef         = useRef<HTMLTextAreaElement>(null);
  const queryClient         = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', expenseId],
    queryFn: () => fetchComments(expenseId),
  });

  const { mutate: submit, isPending } = useMutation({
    mutationFn: (body: string) => postComment(expenseId, body),
    onMutate: async (body) => {
      await queryClient.cancelQueries({ queryKey: ['comments', expenseId] });
      const previous = queryClient.getQueryData<Comment[]>(['comments', expenseId]);
      const optimistic: Comment = {
        id: -Date.now(),
        body,
        user: { id: currentUserId, name: 'You' },
        created_at: new Date().toISOString(),
        is_own: true,
      };
      queryClient.setQueryData<Comment[]>(['comments', expenseId], old => [...(old ?? []), optimistic]);
      return { previous };
    },
    onError: (_err, _body, ctx) => {
      queryClient.setQueryData(['comments', expenseId], ctx?.previous);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', expenseId] });
      setDraft('');
    },
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && draft.trim()) {
      e.preventDefault();
      submit(draft.trim());
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [draft]);

  return (
    <section aria-label="Comments">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Comments ({comments.length})
      </h3>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-5 mb-6">
          {comments.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-gray-500">No comments yet.</p>
          )}
          {comments.map(c => (
            <CommentItem
              key={c.id}
              comment={c}
              expenseId={expenseId}
              onDeleted={() => queryClient.invalidateQueries({ queryKey: ['comments', expenseId] })}
            />
          ))}
        </div>
      )}

      <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Add a comment... (Ctrl+Enter to send)"
          rows={2}
          className="w-full resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 overflow-hidden"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={() => draft.trim() && submit(draft.trim())}
            disabled={!draft.trim() || isPending}
            className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'Posting...' : 'Comment'}
          </button>
        </div>
      </div>
    </section>
  );
}
