import { GetServerSidePropsContext } from "next";
import { PrismaClient } from "@prisma/client";
import Link from "next/link";
import { useRouter } from "next/router";
import { useState } from "react";

// Status options for tenant management
const TENANT_STATUSES = {
  active: "Active",
  moved_out: "Moved Out",
  inactive: "Inactive", 
  evicted: "Evicted",
  pending: "Pending"
} as const;

// Updated Tenant interface
interface Tenant {
  id: number;
  property: {
    id: number;
    name: string; // Include the property name
  };
  unit_number: string;
  name: string;
  email?: string;
  phone?: string;
  monthly_rent: number;
  lease_start: string;
  lease_end?: string;
  status: string;
}

// Get status badge color
const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'moved_out':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'inactive':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'evicted':
      return 'bg-red-100 text-red-800 border-red-200';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

// Quick Status Change Component
const QuickStatusChange: React.FC<{
  tenantId: number;
  currentStatus: string;
  onStatusChange: () => void;
}> = ({ tenantId, currentStatus, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/tenants/${tenantId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      });

      if (response.ok) {
        onStatusChange();
      } else {
        const errorData = await response.json();
        alert(`Failed to update tenant status: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error updating tenant status:', error);
      alert('Error updating tenant status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium">Quick Status:</span>
      <select
        value={currentStatus}
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating}
        className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      >
        {Object.entries(TENANT_STATUSES).map(([value, label]) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {isUpdating && <span className="text-xs text-blue-600">Updating...</span>}
    </div>
  );
};

const TenantDetailsPage: React.FC<{ tenant: Tenant | null }> = ({ tenant }) => {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false); // Toggle between view and edit mode
  const [formData, setFormData] = useState({
    name: tenant?.name || "",
    email: tenant?.email || "",
    phone: tenant?.phone || "",
    monthly_rent: tenant?.monthly_rent || 0,
    lease_start: tenant?.lease_start || "",
    lease_end: tenant?.lease_end || "",
    status: tenant?.status || "",
  });

  if (router.isFallback) return <div>Loading...</div>;
  if (!tenant) return <div className="p-8">Tenant not found.</div>;

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await fetch(`/api/tenants/${tenant.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
    });

    if (response.ok) {
      router.reload(); // Reload the page to show updated details
    } else {
      console.error("Failed to update tenant");
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-xl mt-8">
        <Link href="/tenants" className="text-blue-500 underline mb-4 block">
          &larr; Back to Tenants
        </Link>
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">
            {isEditing ? "Edit Tenant" : tenant.name}
          </h1>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Name"
                className="border p-2 rounded"
                required
              />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Email"
                className="border p-2 rounded"
              />
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Phone"
                className="border p-2 rounded"
              />
              <input
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleChange}
                placeholder="Monthly Rent"
                className="border p-2 rounded"
                required
              />
              <input
                type="date"
                name="lease_start"
                value={formData.lease_start}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              />
              <input
                type="date"
                name="lease_end"
                value={formData.lease_end || ""}
                onChange={handleChange}
                className="border p-2 rounded"
              />
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="border p-2 rounded"
                required
              >
                <option value="">Select Status</option>
                {Object.entries(TENANT_STATUSES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-500 text-white py-2 rounded hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </form>
          ) : (
            <table className="min-w-full border-collapse border border-gray-200">
              <tbody>
                <tr>
                  <td className="font-bold p-2">Unit Number</td>
                  <td className="p-2">{tenant.unit_number}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2">Email</td>
                  <td className="p-2">{tenant.email || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2">Phone</td>
                  <td className="p-2">{tenant.phone || "-"}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2">Monthly Rent</td>
                  <td className="p-2">${tenant.monthly_rent}</td>
                </tr>
                <tr>
                  <td className="font-bold p-2">Lease Start</td>
                  <td className="p-2">
                    {new Date(tenant.lease_start).toLocaleDateString()}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold p-2">Lease End</td>
                  <td className="p-2">
                    {tenant.lease_end
                      ? new Date(tenant.lease_end).toLocaleDateString()
                      : "-"}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold p-2">Status</td>
                  <td className="p-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusBadgeColor(tenant.status)}`}>
                      {TENANT_STATUSES[tenant.status as keyof typeof TENANT_STATUSES] || tenant.status}
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="font-bold p-2">Property</td>
                  <td className="p-2">{tenant.property.name}</td>
                </tr>
              </tbody>
            </table>
          )}

          {!isEditing && (
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
              >
                Edit Tenant
              </button>
              <QuickStatusChange 
                tenantId={tenant.id} 
                currentStatus={tenant.status}
                onStatusChange={() => router.reload()}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenantDetailsPage;

// Fetch tenant details
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string }; // Explicitly type `params`
  const prisma = new PrismaClient();

  const tenant = await prisma.tenant.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      property: {
        select: {
          id: true,
          name: true, // Fetch the property name
        },
      },
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