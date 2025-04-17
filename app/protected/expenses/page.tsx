// app/protected/expenses/page.tsx
'use client';


import { useEffect, useState } from 'react';
import Link from "next/link";

function ExpenseList({ expenses }) {
  if (!expenses.length) return <p>No expenses yet.</p>;
  return (
    <ul>
      {expenses.map(exp => (
        <li key={exp.id}>
          <strong>{exp.name}</strong> — ${exp.amount}
          <br />
          Participants: {exp.users?.map(u => u.userId).join(', ') || 'None'}
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


// Core Page
export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    
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
  
    useEffect(() => {
      fetchExpenses();
    }, []);
  
    return (
      <div>
        <Link href="/" className="inline-block mt-4 px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition">Home</Link>
        <h1>Your Expenses</h1>
        <CreateExpenseForm onExpenseCreated={fetchExpenses} />
        {loading ? <p>Loading...</p> : <ExpenseList expenses={expenses} />}
      </div>
    );
}