import { describe, it, expect, beforeEach } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../../stores/authStore';

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null });
  });

  it('初期状態はtoken/userがnull', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('setAuthでtokenとuserを設定できる', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: '1', name: 'テスト太郎', email: 'test@example.com', role: 'employee', permissions: [] };

    act(() => {
      result.current.setAuth('test-token', mockUser);
    });

    expect(result.current.token).toBe('test-token');
    expect(result.current.user).toEqual(mockUser);
  });

  it('logoutでtokenとuserがクリアされる', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = { id: '1', name: 'テスト太郎', email: 'test@example.com', role: 'employee', permissions: [] };

    act(() => {
      result.current.setAuth('test-token', mockUser);
    });
    act(() => {
      result.current.logout();
    });

    expect(result.current.token).toBeNull();
    expect(result.current.user).toBeNull();
  });

  it('hasPermissionで権限チェックができる', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: '1', name: 'Test', email: 'test@example.com', role: 'approver',
      permissions: ['expense.view.all', 'expense.approve'],
    };

    act(() => {
      result.current.setAuth('token', mockUser);
    });

    expect(result.current.hasPermission('expense.approve')).toBe(true);
    expect(result.current.hasPermission('expense.view.all')).toBe(true);
    expect(result.current.hasPermission('user.manage')).toBe(false);
  });

  it('未ログイン時はhasPermissionがfalseを返す', () => {
    const { result } = renderHook(() => useAuthStore());
    expect(result.current.hasPermission('expense.view.all')).toBe(false);
  });
});
