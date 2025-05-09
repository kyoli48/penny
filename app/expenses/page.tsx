// app/expenses/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Select from 'react-select';
import type { Expense, ExpenseListProps, CreateExpenseFormProps, EditExpenseFormProps } from '@/lib/types/expense';

// TODO: Dropdown menu w user names

function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  if (!expenses.length) return <p>No expenses yet.</p>;
  return (
    <ul>
      {expenses.map(exp => (
        <li key={exp.id}>
          <strong>{exp.name}</strong> — ${exp.amount}
          <br />
          {exp.description && <span> Description: {exp.description} </span>}
          <br />
          Paid: {exp.paid ? 'Yes' : 'No'}
          <br />
          Participants: {exp.participantIds.join(', ')}
          <br />
          <button onClick={() => onEdit(exp)} className="mr-2 text-blue-600">Edit</button>
          <button onClick={() => onDelete(exp.id)} className="text-red-600">Delete</button>
        </li>
      ))}
    </ul>
  );
}


function CreateExpenseForm({ onExpenseCreated }: CreateExpenseFormProps) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paid, setPaid] = useState(false);
    const [participantIds, setParticipantIds] = useState('');
    const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([]);

    // get users on mount
    useEffect(() => {
      fetch('/api/users')
        .then(res => res.json())
        .then(users => {
          setAvailableUsers(users.map((u: any) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`
          })));
        });
    }, []);
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          amount: parseFloat(amount),
          description,
          paid,
          participantIds: participantIds
            .split(',')
            .map(s => s.trim())
            .filter(Boolean),
        }),
      });
      setName('');
      setAmount('');
      setDescription('');
      setPaid(false);
      setParticipantIds('');
      if (onExpenseCreated) onExpenseCreated(); // Call fetchExpenses after POST call to update expenses
    };
  
    return (
      <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
          <div className="flex items-center gap-x-2 flex-wrap">
            <input 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Expense Name" 
                required
                className="p-1 border rounded w-36"
            />
            <input 
                value={amount} 
                onChange={e => setAmount(e.target.value)} 
                placeholder="Amount" type="number" 
                required 
                className="p-1 border rounded w-24"
            />
            <input 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Description" 
                className="p-1 border rounded w-48"
            />
            <label className="flex items-center gap-x-1 text-green-600 font-semibold">
                Paid:
                <input 
                    type="checkbox" 
                    checked={paid}
                    onChange={e => setPaid(e.target.checked)} 
                />
            </label>
            <Select
              isMulti
              options={availableUsers.map(user => ({
                value: user.id,
                label: user.name?.trim() || user.id
              }))}
              value={participantIds.split(',').map(id => {
                const user = availableUsers.find(u => u.id === id);
                return user ? { value: user.id, label: user.name?.trim() || user.id } : null;
              }).filter(Boolean)}
              onChange={(selectedOptions) => {
                const ids = selectedOptions.map((opt) => opt.value);
                setParticipantIds(ids.join(','));
              }}
              className="border rounded flex-1"
              placeholder="Select participants..."
            />
            <button type="submit" className="text-blue-600 font-semibold px-3 py-1 rounded border border-blue-600">Add Expense</button>
          </div>
      </form>
    );
}

function EditExpenseForm({ expense, onCancel, onSave }: EditExpenseFormProps) {
    // Initialize local state for each editable field
    const [name, setName] = useState(expense.name);
    const [amount, setAmount] = useState(expense.amount.toString());
    const [description, setDescription] = useState(expense.description);
    const [paid, setPaid] = useState<boolean>(expense.paid);
    const [participantIds, setParticipantIds] = useState(
      expense.participantIds.join(',')
    );
    const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([]);

    // get users on mount
    useEffect(() => {
      fetch('/api/users')
        .then(res => res.json())
        .then(users => {
          setAvailableUsers(users.map((u: any) => ({
            id: u.id,
            name: `${u.first_name} ${u.last_name}`
          })));
        });
    }, []);
  
    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        id: expense.id,
        name,
        amount: parseFloat(amount),
        description,
        paid,
        participantIds: participantIds.split(',').map((s: string) => s.trim()).filter(Boolean),
      });
    };
  
    return (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded bg-gray-50">
          <h2 className="mb-2 font-semibold">Edit Expense</h2>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Expense Name"
            required
            className="block mb-2 p-1 border rounded w-full"
          />
          <input
            value={amount}
            onChange={e => setAmount(e.target.value)}
            placeholder="Amount"
            type="number"
            required
            className="block mb-2 p-1 border rounded w-full"
          />
          <input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            className="block mb-2 p-1 border rounded w-full"
          />
          <label className="block mb-2">
            Paid:
            <input
              type="checkbox"
              checked={paid}
              onChange={(e) => {
                setPaid(e.target.checked) 
                console.log(paid)
              }}
              className="ml-2"
            />
          </label>
          <Select
              isMulti
              options={availableUsers.map(user => ({
                value: user.id,
                label: user.name?.trim() || user.id
              }))}
              value={participantIds.split(',').map(id => {
                const user = availableUsers.find(u => u.id === id);
                return user ? { value: user.id, label: user.name?.trim() || user.id } : null;
              }).filter(Boolean)}
              onChange={(selectedOptions) => {
                const ids = selectedOptions.map((opt) => opt.value);
                setParticipantIds(ids.join(','));
              }}
              className="block mb-2 border rounded w-full"
              placeholder="Select participants..."
            />
          <button type="submit" className="mr-2 bg-blue-600 text-white px-3 py-1 rounded">Save</button>
          <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
        </form>
    );
}



// Core Page
export default function ExpensesPage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
    
    // Fetch expenses from API and update expenses & loading
    const fetchExpenses = () => {
      setLoading(true);
      fetch('/api/expenses')
        .then(res => res.json())
        .then(data => {
          setExpenses(data);
          setLoading(false);
        });
    };

    // button handler for onEdit
    const handleEdit = (expense: Expense) => {
        setEditingExpense(expense);
    };

    // button handler for onDelete
    const handleDelete = async (id: string) => {
        await fetch('/api/expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        }).then((res) => {
          if (res.ok) {
            setExpenses(expenses.filter(e => e.id !== id))
          }
        });
        
    };

    // button handler for onSave 
    const handleUpdate = async (updatedExpense: Expense) => {
      console.log(updatedExpense)  
      await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExpense),
        }).then((res) => {
          if (res.ok) {
        }}).finally(() => {
          setEditingExpense(null)
        });
    };

  
    useEffect(() => {
      fetchExpenses();
    }, []);

  
    return (
        <div>
        <CreateExpenseForm onExpenseCreated={fetchExpenses} />
        <h1 className="text-2xl font-bold bg-gray-200">Your Expenses</h1>
        {editingExpense && (
          <EditExpenseForm
            expense={editingExpense}
            onCancel={() => setEditingExpense(null)}
            onSave={handleUpdate}
          />
        )}
        {loading ? <p>Loading...</p> : (
          <ExpenseList
            expenses={expenses}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}
      </div>
    );
}