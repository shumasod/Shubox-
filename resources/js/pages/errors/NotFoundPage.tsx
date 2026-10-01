import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950">
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-blue-600 dark:text-blue-400">
          404
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
          ページが見つかりません
        </h1>
        <p className="mt-4 text-base text-gray-500 dark:text-gray-400">
          お探しのページは存在しないか、移動または削除された可能性があります。
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            &larr; 前のページに戻る
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            ダッシュボードへ
          </button>
        </div>
      </div>
      <div className="mt-16 text-9xl font-black text-gray-100 dark:text-gray-800 select-none" aria-hidden="true">
        404
      </div>
    </main>
  );
}
