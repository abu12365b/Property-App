import Link from "next/link";
import { PrismaClient } from "@prisma/client";

// This is what a tenant looks like (just the important stuff)
interface Tenant {
  id: number;
  name: string;
  unit_number: string;
  status: string;
}

const TenantRow: React.FC<{ tenant: Tenant }> = ({ tenant }) => (
  <tr key={tenant.id} className="hover:bg-gray-50 cursor-pointer">
    <td className="border p-2">
      <Link href={`/tenants/${tenant.id}`}>{tenant.name}</Link>
    </td>
    <td className="border p-2">{tenant.unit_number}</td>
    <td className="border p-2">{tenant.status}</td>
  </tr>
);

const TenantsPage: React.FC<{ tenants: Tenant[] }> = ({ tenants }) => (
  <div className="p-8">
    {/* Add a link to go back to the home page */}
    <Link href="/" className="text-blue-500 underline mb-4 block">
      &larr; Back to Home
    </Link>
    <h1 className="text-2xl font-bold mb-4">Tenants</h1>
    <table className="min-w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">Unit Number</th>
          <th className="border p-2 text-left">Status</th>
        </tr>
      </thead>
      <tbody>
        {tenants.map((tenant) => (
          <TenantRow key={tenant.id} tenant={tenant} />
        ))}
      </tbody>
    </table>
  </div>
);

export default TenantsPage;

// This part gets the tenants from the database before the page loads
export async function getServerSideProps() {
  const prisma = new PrismaClient();

  // Only get the 3 important columns
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      unit_number: true,
      status: true,
    },
  });

  return {
    props: { tenants },
  };
}