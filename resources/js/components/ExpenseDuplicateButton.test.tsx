import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import ExpenseDuplicateButton from './ExpenseDuplicateButton';

const mockExpense = {
  id: 42,
  title: 'Team Lunch',
  description: 'Quarterly team lunch',
  category_id: 3,
  amount: 15000,
  currency: 'JPY',
  expense_date: '2024-01-10',
};

function Wrapper({ children }: { children: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return (
    <QueryClientProvider client={qc}>
      <MemoryRouter>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ExpenseDuplicateButton', () => {
  it('shows Duplicate button initially', () => {
    render(<ExpenseDuplicateButton expense={mockExpense} />, { wrapper: Wrapper });
    expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
  });

  it('shows confirmation UI on click', () => {
    render(<ExpenseDuplicateButton expense={mockExpense} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /duplicate/i }));
    expect(screen.getByText(/Copy as new draft\?/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /yes, duplicate/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
  });

  it('hides confirmation on Cancel', () => {
    render(<ExpenseDuplicateButton expense={mockExpense} />, { wrapper: Wrapper });
    fireEvent.click(screen.getByRole('button', { name: /duplicate/i }));
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(screen.getByRole('button', { name: /duplicate/i })).toBeInTheDocument();
  });
});
