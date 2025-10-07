import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/router";

// Updated Tenant interface
interface Tenant {
  id: number;
  name: string;
  phone: string; // Add phone number
  property: {
    id: number;
    name: string; // Add property name
  };
}

// Updated TenantRow component
const TenantRow: React.FC<{ tenant: Tenant }> = ({ tenant }) => (
  <tr key={tenant.id} className="hover:bg-gray-50 cursor-pointer">
    <td className="border p-2">
      <Link href={`/tenants/${tenant.id}`}>{tenant.name}</Link>
    </td>
    <td className="border p-2">{tenant.phone}</td>
    <td className="border p-2">
      {tenant.property.name} (ID: {tenant.property.id})
    </td>
  </tr>
);

// Updated TenantsPage component
const TenantsPage: React.FC<{ tenants: Tenant[] }> = ({ tenants }) => {
  const router = useRouter();

  const handleAddTenant = () => {
    router.push("/tenants/add"); // Navigate to the add tenant page
  };

  return (
    <div className="p-8">
      <Link href="/signin" className="text-blue-500 underline mb-4 block">
        &larr; Back to Home
      </Link>
      <h1 className="text-2xl font-bold mb-4">Tenants</h1>
      <button
        onClick={handleAddTenant}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mb-4"
      >
        Add Tenant
      </button>
      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Phone Number</th>
            <th className="border p-2 text-left">Property</th>
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
};

export default TenantsPage;

// Updated getServerSideProps function
export async function getServerSideProps() {
  const prisma = new PrismaClient();

  // Fetch tenants with their phone number and related property name
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      phone: true, // Include the phone number
      property: {
        select: {
          id: true,
          name: true, // Include the property name
        },
      },
    },
  });

  return {
    props: { tenants },
  };
}