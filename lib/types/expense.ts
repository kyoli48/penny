// types/expense.ts
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
    users?: UserExpense[];
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