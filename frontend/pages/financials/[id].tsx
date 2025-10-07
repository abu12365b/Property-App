import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";

// This is what a financial record looks like (all details)
interface Financial {
  id: number;
  property_id: number;
  category: string;
  amount: number;
  recurring: boolean;
}

const FinancialDetailsPage: React.FC<{ financial: Financial | null }> = ({ financial }) => {
  const router = useRouter();

  if (router.isFallback) return <div>Loading...</div>;
  if (!financial) return <div className="p-8">Financial record not found.</div>;

  // Show all financial details in a simple table
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl mt-8">
        <Link href="/financials" className="text-blue-500 underline mb-4 block">&larr; Back to Financials</Link>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">{financial.category}</h1>
          <table className="min-w-full border-collapse border border-gray-200">
            <tbody>
              <tr><td className="font-bold p-2">Amount</td><td className="p-2">${financial.amount}</td></tr>
              <tr><td className="font-bold p-2">Recurring</td><td className="p-2">{financial.recurring ? "Yes" : "No"}</td></tr>
              <tr><td className="font-bold p-2">Property ID</td><td className="p-2">{financial.property_id}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FinancialDetailsPage;

// This part gets the financial details from the database before the page loads
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string }; // Explicitly type `params`
  const prisma = new PrismaClient();

  const financial = await prisma.financial.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      property_id: true,
      category: true,
      amount: true,
      recurring: true,
    },
  });

  return {
    props: {
      financial: financial ? financial : null,
    },
  };
}