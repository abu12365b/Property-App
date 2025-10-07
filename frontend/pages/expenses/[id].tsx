import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";

// This is what an expense looks like (all details)
interface Expense {
  id: number;
  property_id: number;
  description: string;
  category: string;
  amount: number;
  date: string;
  recurring: boolean;
  notes?: string;
}

const ExpenseDetailsPage: React.FC<{ expense: Expense | null }> = ({ expense }) => {
  const router = useRouter();

  if (router.isFallback) return <div>Loading...</div>;
  if (!expense) return <div className="p-8">Expense not found.</div>;

  // Show all expense details in a simple table
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl mt-8">
        <Link href="/expenses" className="text-blue-500 underline mb-4 block">&larr; Back to Expenses</Link>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">{expense.description}</h1>
          <table className="min-w-full border-collapse border border-gray-200">
            <tbody>
              <tr><td className="font-bold p-2">Category</td><td className="p-2">{expense.category}</td></tr>
              <tr><td className="font-bold p-2">Amount</td><td className="p-2">${expense.amount}</td></tr>
              <tr><td className="font-bold p-2">Date</td><td className="p-2">{new Date(expense.date).toLocaleDateString()}</td></tr>
              <tr><td className="font-bold p-2">Recurring</td><td className="p-2">{expense.recurring ? "Yes" : "No"}</td></tr>
              <tr><td className="font-bold p-2">Notes</td><td className="p-2">{expense.notes || "-"}</td></tr>
              <tr><td className="font-bold p-2">Property ID</td><td className="p-2">{expense.property_id}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ExpenseDetailsPage;

// This part gets the expense details from the database before the page loads
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string }; // Explicitly type `params`
  const prisma = new PrismaClient();

  const expense = await prisma.expense.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      property_id: true,
      description: true,
      category: true,
      amount: true,
      date: true,
      recurring: true,
      notes: true,
    },
  });

  // Convert date to string for Next.js
  return {
    props: {
      expense: expense
        ? { ...expense, date: expense.date.toISOString() }
        : null,
    },
  };
}