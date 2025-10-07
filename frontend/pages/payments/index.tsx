import Link from "next/link";
import { PrismaClient } from "@prisma/client";

// This is what a payment looks like (just the important stuff)
interface Payment {
  id: number;
  tenant_id: number;
  amount: number;
  date: string;
}

// Table row for each payment
const PaymentRow: React.FC<{ payment: Payment }> = ({ payment }) => (
  <tr key={payment.id} className="hover:bg-gray-50 cursor-pointer">
    <td className="border p-2">
      <Link href={`/payments/${payment.id}`}>Payment #{payment.id}</Link>
    </td>
    <td className="border p-2">${payment.amount}</td>
    <td className="border p-2">{new Date(payment.date).toLocaleDateString()}</td>
  </tr>
);

// Main page for payments
const PaymentsPage: React.FC<{ payments: Payment[] }> = ({ payments }) => (
  <div className="p-8">
    {/* Add a link to go back to the home page */}
    <Link href="/signin" className="text-blue-500 underline mb-4 block">&larr; Back to Home</Link>
    <h1 className="text-2xl font-bold mb-4">Payments</h1>
    <table className="min-w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">Payment</th>
          <th className="border p-2 text-left">Amount</th>
          <th className="border p-2 text-left">Date</th>
        </tr>
      </thead>
      <tbody>
        {payments.map((payment) => (
          <PaymentRow key={payment.id} payment={payment} />
        ))}
      </tbody>
    </table>
  </div>
);

export default PaymentsPage;

// This part gets the payments from the database before the page loads
export async function getServerSideProps() {
  const prisma = new PrismaClient();

  // Only get the important columns
  const payments = await prisma.payment.findMany({
    select: {
      id: true,
      tenant_id: true,
      amount: true,
      date: true,
    },
  });

  // Convert date to string for Next.js
  const formattedPayments = payments.map(pay => ({
    ...pay,
    date: pay.date.toISOString(),
  }));

  return {
    props: { payments: formattedPayments },
  };
}