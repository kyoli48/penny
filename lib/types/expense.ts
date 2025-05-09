import { Prisma } from '@prisma/client';

// defines the type returned by Prisma with the users relation
type ExpenseWithUsers = Prisma.ExpensesGetPayload<{
  include: { users: true };
}>;
// helper function to convert Prisma type to client type
export function formatExpenseForClient(expense: ExpenseWithUsers) {
  return {
    id: expense.id,
    name: expense.name,
    amount: expense.amount,
    description: expense.description ?? undefined,
    paid: expense.paid,
    participantIds: expense.users.map(u => u.userId),
  };
}

export function formatExpenseArrayForClient(expenses: ExpenseWithUsers[]) {
  return expenses.map(formatExpenseForClient);
}

export type UserExpense = {
    userId: string;
    // more fields if needed
};

export type Expense = {
    id: string;
    name: string;
    amount: number;
    description?: string;
    paid: boolean;
    participantIds: string[];
  };

  export type ExpenseListProps = {
    expenses: Expense[];
    onEdit: (expense: Expense) => void;
    onDelete: (id: string) => void;
};

export type CreateExpenseFormProps = {
    onExpenseCreated: () => void;
};

export type EditExpenseFormProps = {
    expense: Expense;
    onCancel: () => void;
    onSave: (expense: Expense) => void;
};