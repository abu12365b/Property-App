import Link from "next/link";
import { PrismaClient } from "@prisma/client";

// This is what an expense looks like (just the important stuff)
interface Expense {
  id: number;
  description: string;
  amount: number;
  date: string;
}

// Table row for each expense
const ExpenseRow: React.FC<{ expense: Expense }> = ({ expense }) => (
  <tr key={expense.id} className="hover:bg-gray-50 cursor-pointer">
    <td className="border p-2">
      <Link href={`/expenses/${expense.id}`}>{expense.description}</Link>
    </td>
    <td className="border p-2">${expense.amount}</td>
    <td className="border p-2">{new Date(expense.date).toLocaleDateString()}</td>
  </tr>
);

// Main page for expenses
const ExpensesPage: React.FC<{ expenses: Expense[] }> = ({ expenses }) => (
  <div className="p-8">
    {/* Add a link to go back to the home page */}
    <Link href="/" className="text-blue-500 underline mb-4 block">&larr; Back to Home</Link>
    <h1 className="text-2xl font-bold mb-4">Expenses</h1>
    <table className="min-w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">Description</th>
          <th className="border p-2 text-left">Amount</th>
          <th className="border p-2 text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        {expenses.map((expense) => (
          <ExpenseRow key={expense.id} expense={expense} />
        ))}
      </tbody>
    </table>
  </div>
);

export default ExpensesPage;

// This part gets the expenses from the database before the page loads
export async function getServerSideProps() {
  const prisma = new PrismaClient();

  // Only get the 3 important columns
  const expenses = await prisma.expense.findMany({
    select: {
      id: true,
      description: true,
      amount: true,
      date: true,
    },
  });

  // Convert date to string for Next.js
  const formattedExpenses = expenses.map(exp => ({
    ...exp,
    date: exp.date.toISOString(),
  }));

  return {
    props: { expenses: formattedExpenses },
  };
}