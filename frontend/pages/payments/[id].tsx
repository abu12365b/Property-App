import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";

// This is what a payment looks like (all details)
interface Payment {
  id: number;
  tenant_id: number;
  amount: number;
  method?: string;
  date: string;
}

const PaymentDetailsPage: React.FC<{ payment: Payment | null }> = ({ payment }) => {
  const router = useRouter();

  if (router.isFallback) return <div>Loading...</div>;
  if (!payment) return <div className="p-8">Payment not found.</div>;

  // Show all payment details in a simple table
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl mt-8">
        <Link href="/payments" className="text-blue-500 underline mb-4 block">&larr; Back to Payments</Link>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Payment #{payment.id}</h1>
          <table className="min-w-full border-collapse border border-gray-200">
            <tbody>
              <tr><td className="font-bold p-2">Tenant ID</td><td className="p-2">{payment.tenant_id}</td></tr>
              <tr><td className="font-bold p-2">Amount</td><td className="p-2">${payment.amount}</td></tr>
              <tr><td className="font-bold p-2">Method</td><td className="p-2">{payment.method || "-"}</td></tr>
              <tr><td className="font-bold p-2">Date</td><td className="p-2">{new Date(payment.date).toLocaleDateString()}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailsPage;

// This part gets the payment details from the database before the page loads
export async function getServerSideProps(context: any) {
  const { id } = context.params;
  const prisma = new PrismaClient();

  const payment = await prisma.payment.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      tenant_id: true,
      amount: true,
      method: true,
      date: true,
    },
  });

  // Convert date to string for Next.js
  return {
    props: {
      payment: payment
        ? { ...payment, date: payment.date.toISOString() }
        : null,
    },
  };
}