import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';

const profileSchema = z.object({
  name:       z.string().min(1, '名前は必須です').max(100),
  department: z.string().max(100).optional(),
});

const passwordSchema = z.object({
  current_password:       z.string().min(1, '現在のパスワードを入力してください'),
  new_password:           z.string().min(8, 'パスワードは8文字以上にしてください'),
  new_password_confirmation: z.string(),
}).refine((d) => d.new_password === d.new_password_confirmation, {
  message: 'パスワードが一致しません',
  path: ['new_password_confirmation'],
});

type ProfileForm   = z.infer<typeof profileSchema>;
type PasswordForm  = z.infer<typeof passwordSchema>;

const token = () => localStorage.getItem('token') ?? '';

async function updateProfile(data: ProfileForm) {
  const res = await fetch('/api/v1/auth/me', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('更新に失敗しました');
  return res.json();
}

async function changePassword(data: PasswordForm) {
  const res = await fetch('/api/v1/auth/password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('パスワードの変更に失敗しました');
}

export function SettingsPage() {
  const { user, setAuth } = useAuthStore();
  const [profileSaved,  setProfileSaved]  = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', department: user?.department ?? '' },
  });

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const handleProfile = async (data: ProfileForm) => {
    const res = await updateProfile(data);
    if (user) setAuth(token(), { ...user, ...res.data });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handlePassword = async (data: PasswordForm) => {
    await changePassword(data);
    passwordForm.reset();
    setPasswordSaved(true);
    setTimeout(() => setPasswordSaved(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">アカウント設定</h1>

      {/* プロフィール */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">プロフィール情報</h2>
        <form onSubmit={profileForm.handleSubmit(handleProfile)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              {...profileForm.register('name')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {profileForm.formState.errors.name && (
              <p className="mt-1 text-xs text-red-600">{profileForm.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">部門</label>
            <input
              {...profileForm.register('department')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
            <input
              value={user?.email ?? ''}
              disabled
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500"
            />
            <p className="mt-1 text-xs text-gray-400">メールアドレスの変更は管理者にお問い合わせください</p>
          </div>
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={profileForm.formState.isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {profileForm.formState.isSubmitting ? '保存中...' : '保存'}
            </button>
            {profileSaved && <p className="text-sm text-green-600">保存しました</p>}
          </div>
        </form>
      </section>

      {/* パスワード変更 */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">パスワード変更</h2>
        <form onSubmit={passwordForm.handleSubmit(handlePassword)} className="space-y-4">
          {(['current_password', 'new_password', 'new_password_confirmation'] as const).map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {field === 'current_password' && '現在のパスワード'}
                {field === 'new_password' && '新しいパスワード'}
                {field === 'new_password_confirmation' && '新しいパスワード（確認）'}
                <span className="text-red-500 ml-1">*</span>
              </label>
              <input
                type="password"
                {...passwordForm.register(field)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {passwordForm.formState.errors[field] && (
                <p className="mt-1 text-xs text-red-600">
                  {passwordForm.formState.errors[field]?.message}
                </p>
              )}
            </div>
          ))}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={passwordForm.formState.isSubmitting}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {passwordForm.formState.isSubmitting ? '変更中...' : 'パスワードを変更'}
            </button>
            {passwordSaved && <p className="text-sm text-green-600">変更しました</p>}
          </div>
        </form>
      </section>
    </div>
  );
}
