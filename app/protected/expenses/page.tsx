// app/protected/expenses/page.tsx
'use client';


import { useEffect, useState } from 'react';
import Link from "next/link";

function ExpenseList({ expenses, onEdit, onDelete }) {
  if (!expenses.length) return <p>No expenses yet.</p>;
  return (
    <ul>
      {expenses.map(exp => (
        <li key={exp.id}>
          <strong>{exp.name}</strong> — ${exp.amount}
          <br />
          Participants: {exp.users?.map(u => u.userId).join(', ') || 'None'}
          <br />
          <button onClick={() => onEdit(exp)} className="mr-2 text-blue-600">Edit</button>
          <button onClick={() => onDelete(exp.id)} className="text-red-600">Delete</button>
        </li>
      ))}
    </ul>
  );
}


function CreateExpenseForm({ onExpenseCreated }) {
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [paid, setPaid] = useState(false);
    const [participantIds, setParticipantIds] = useState('');
  
    const handleSubmit = async (e) => {
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
      <form onSubmit={handleSubmit} className="mb-6">
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Expense Name" required />
        <input value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" type="number" required />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description" />
        <label>
          Paid:
          <input type="checkbox" checked={paid} onChange={e => setPaid(e.target.checked)} />
        </label>
        <input
          value={participantIds}
          onChange={e => setParticipantIds(e.target.value)}
          placeholder="Participant User IDs (comma separated)"
        />
        <button type="submit">Add Expense</button>
      </form>
    );
}

function EditExpenseForm({ expense, onCancel, onSave }) {
    // Initialize local state for each editable field
    const [name, setName] = useState(expense.name);
    const [amount, setAmount] = useState(expense.amount);
    const [description, setDescription] = useState(expense.description);
    const [paid, setPaid] = useState(expense.paid);
    const [participantIds, setParticipantIds] = useState(
      expense.users.map(u => u.userId).join(',')
    );
  
    const handleSubmit = (e) => {
      e.preventDefault();
      onSave({
        id: expense.id,
        name,
        amount: parseFloat(amount),
        description,
        paid,
        participantIds: participantIds.split(',').map(s => s.trim()).filter(Boolean),
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
              onChange={e => setPaid(e.target.checked)}
              className="ml-2"
            />
          </label>
          <input
            value={participantIds}
            onChange={e => setParticipantIds(e.target.value)}
            placeholder="Participant User IDs (comma separated)"
            className="block mb-2 p-1 border rounded w-full"
          />
          <button type="submit" className="mr-2 bg-blue-600 text-white px-3 py-1 rounded">Save</button>
          <button type="button" onClick={onCancel} className="bg-gray-400 text-white px-3 py-1 rounded">Cancel</button>
        </form>
    );
}



// Core Page
export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingExpense, setEditingExpense] = useState(null);
    
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
    const handleEdit = (expense) => {
        setEditingExpense(expense);
    };

    // button handler for onDelete
    const handleDelete = async (id) => {
        await fetch('/api/expenses', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        });
        fetchExpenses();
    };

    // onSave prop for EditExpenseForm
    const handleUpdate = async (updatedExpense) => {
        await fetch('/api/expenses', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedExpense),
        });
        setEditingExpense(null); // Hide edit form
        fetchExpenses();
    };

  
    useEffect(() => {
      fetchExpenses();
    }, []);

  
    return (
        <div>
        <Link href="/" className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Home</Link>
        <h1>Your Expenses</h1>
        <CreateExpenseForm onExpenseCreated={fetchExpenses} />
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