import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";

// This is what a tenant looks like (all details)
interface Tenant {
  id: number;
  property_id: number;
  unit_number: string;
  name: string;
  email?: string;
  phone?: string;
  monthly_rent: number;
  lease_start: string;
  lease_end?: string;
  status: string;
}

const TenantDetailsPage: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  const router = useRouter();

  if (router.isFallback) return <div>Loading...</div>;
  if (!tenant) return <div className="p-8">Tenant not found.</div>;

  // Show all tenant details in a simple table
  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl mt-8">
        <Link href="/tenants" className="text-blue-500 underline mb-4 block">&larr; Back to Tenants</Link>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">{tenant.name}</h1>
          <table className="min-w-full border-collapse border border-gray-200">
            <tbody>
              <tr><td className="font-bold p-2">Unit Number</td><td className="p-2">{tenant.unit_number}</td></tr>
              <tr><td className="font-bold p-2">Email</td><td className="p-2">{tenant.email || "-"}</td></tr>
              <tr><td className="font-bold p-2">Phone</td><td className="p-2">{tenant.phone || "-"}</td></tr>
              <tr><td className="font-bold p-2">Monthly Rent</td><td className="p-2">${tenant.monthly_rent}</td></tr>
              <tr><td className="font-bold p-2">Lease Start</td><td className="p-2">{new Date(tenant.lease_start).toLocaleDateString()}</td></tr>
              <tr><td className="font-bold p-2">Lease End</td><td className="p-2">{tenant.lease_end ? new Date(tenant.lease_end).toLocaleDateString() : "-"}</td></tr>
              <tr><td className="font-bold p-2">Status</td><td className="p-2">{tenant.status}</td></tr>
              <tr><td className="font-bold p-2">Property ID</td><td className="p-2">{tenant.property_id}</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TenantDetailsPage;

// This part gets the tenant details from the database before the page loads
export async function getServerSideProps(context: any) {
  const { id } = context.params;
  const prisma = new PrismaClient();

  const tenant = await prisma.tenant.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      property_id: true,
      unit_number: true,
      name: true,
      email: true,
      phone: true,
      monthly_rent: true,
      lease_start: true,
      lease_end: true,
      status: true,
    },
  });

  // Convert dates to strings for Next.js
  return {
    props: {
      tenant: tenant
        ? {
            ...tenant,
            lease_start: tenant.lease_start?.toISOString(),
            lease_end: tenant.lease_end ? tenant.lease_end.toISOString() : null,
          }
        : null,
    },
  };
}