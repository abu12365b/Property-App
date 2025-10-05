import Link from "next/link";
import { PrismaClient } from "@prisma/client";

// This is what a financial record looks like (just the important stuff)
interface Financial {
  id: number;
  category: string;
  amount: number;
  recurring: boolean;
}

// Table row for each financial record
const FinancialRow: React.FC<{ financial: Financial }> = ({ financial }) => (
  <tr key={financial.id} className="hover:bg-gray-50 cursor-pointer">
    <td className="border p-2">
      <Link href={`/financials/${financial.id}`}>{financial.category}</Link>
    </td>
    <td className="border p-2">${financial.amount}</td>
    <td className="border p-2">{financial.recurring ? "Yes" : "No"}</td>
  </tr>
);

// Main page for financials
const FinancialsPage: React.FC<{ financials: Financial[] }> = ({ financials }) => (
  <div className="p-8">
    {/* Add a link to go back to the home page */}
    <Link href="/" className="text-blue-500 underline mb-4 block">&larr; Back to Home</Link>
    <h1 className="text-2xl font-bold mb-4">Financials</h1>
    <table className="min-w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">Category</th>
          <th className="border p-2 text-left">Amount</th>
          <th className="border p-2 text-left">Recurring</th>
        </tr>
      </thead>
      <tbody>
        {financials.map((financial) => (
          <FinancialRow key={financial.id} financial={financial} />
        ))}
      </tbody>
    </table>
  </div>
);

export default FinancialsPage;

// This part gets the financials from the database before the page loads
export async function getServerSideProps() {
  const prisma = new PrismaClient();

  // Only get the 3 important columns
  const financials = await prisma.financial.findMany({
    select: {
      id: true,
      category: true,
      amount: true,
      recurring: true,
    },
  });

  return {
    props: { financials },
  };
}