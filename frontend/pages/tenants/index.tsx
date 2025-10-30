import Link from "next/link";
import { PrismaClient } from "@prisma/client";
import { useRouter } from "next/router";
import { useState } from "react";

// Updated Tenant interface
interface Tenant {
  id: number;
  name: string;
  phone: string; // Add phone number
  status: string; // Add status
  property: {
    id: number;
    name: string; // Add property name
  };
}

// Status options for filtering and display
const TENANT_STATUSES = {
  active: "Active",
  moved_out: "Moved Out",
  inactive: "Inactive", 
  evicted: "Evicted",
  pending: "Pending"
} as const;

// Get status badge color
const getStatusBadgeColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'active':
      return 'bg-green-100 text-green-800';
    case 'moved_out':
      return 'bg-blue-100 text-blue-800';
    case 'inactive':
      return 'bg-gray-100 text-gray-800';
    case 'evicted':
      return 'bg-red-100 text-red-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Updated TenantRow component
const TenantRow: React.FC<{ tenant: Tenant; onStatusChange: (tenantId: number, newStatus: string) => Promise<void> }> = ({ tenant, onStatusChange }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus !== tenant.status) {
      setIsUpdating(true);
      try {
        await onStatusChange(tenant.id, newStatus);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <tr key={tenant.id} className="hover:bg-gray-50">
      <td className="border p-2">
        <Link href={`/tenants/${tenant.id}`} className="text-blue-600 hover:text-blue-800 font-medium">
          {tenant.name}
        </Link>
      </td>
      <td className="border p-2">{tenant.phone}</td>
      <td className="border p-2">
        {tenant.property.name} (ID: {tenant.property.id})
      </td>
      <td className="border p-2">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeColor(tenant.status)}`}>
          {TENANT_STATUSES[tenant.status as keyof typeof TENANT_STATUSES] || tenant.status}
        </span>
      </td>
      <td className="border p-2">
        <select
          value={tenant.status}
          onChange={handleStatusChange}
          disabled={isUpdating}
          className="border rounded px-2 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {Object.entries(TENANT_STATUSES).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {isUpdating && <span className="ml-2 text-xs text-blue-600">Updating...</span>}
      </td>
    </tr>
  );
};

// Updated TenantsPage component
const TenantsPage: React.FC<{ tenants: Tenant[] }> = ({ tenants: initialTenants }) => {
  const router = useRouter();
  const [tenants, setTenants] = useState(initialTenants);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleAddTenant = () => {
    router.push("/tenants/add"); // Navigate to the add tenant page
  };

  const handleStatusChange = async (tenantId: number, newStatus: string) => {
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
        // Update the local state
        setTenants(prev =>
          prev.map(tenant =>
            tenant.id === tenantId ? { ...tenant, status: newStatus } : tenant
          )
        );
      } else {
        const errorData = await response.json();
        console.error('Failed to update tenant status:', errorData);
        alert(`Failed to update tenant status: ${errorData.error || 'Please try again.'}`);
      }
    } catch (error) {
      console.error('Error updating tenant status:', error);
      alert('Error updating tenant status. Please try again.');
    }
  };

  // Filter tenants based on status
  const filteredTenants = statusFilter === 'all' 
    ? tenants 
    : tenants.filter(tenant => tenant.status === statusFilter);

  // Get status counts for display
  const statusCounts = tenants.reduce((acc, tenant) => {
    acc[tenant.status] = (acc[tenant.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-8">
      <Link href="/signin" className="text-blue-500 underline mb-4 block">
        &larr; Back to Home
      </Link>
      <h1 className="text-2xl font-bold mb-4">Tenants</h1>
      
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handleAddTenant}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Add Tenant
        </button>
        
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium">Filter by status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-3 py-1 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All ({tenants.length})</option>
            {Object.entries(TENANT_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label} ({statusCounts[value] || 0})
              </option>
            ))}
          </select>
        </div>
      </div>

      <table className="min-w-full border-collapse border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2 text-left">Name</th>
            <th className="border p-2 text-left">Phone Number</th>
            <th className="border p-2 text-left">Property</th>
            <th className="border p-2 text-left">Status</th>
            <th className="border p-2 text-left">Change Status</th>
          </tr>
        </thead>
        <tbody>
          {filteredTenants.map((tenant) => (
            <TenantRow key={tenant.id} tenant={tenant} onStatusChange={handleStatusChange} />
          ))}
        </tbody>
      </table>
      
      {filteredTenants.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No tenants found with the selected status.
        </div>
      )}
    </div>
  );
};

export default TenantsPage;

// Updated getServerSideProps function
export async function getServerSideProps() {
  const prisma = new PrismaClient();

  // Fetch tenants with their phone number, status, and related property name
  const tenants = await prisma.tenant.findMany({
    select: {
      id: true,
      name: true,
      phone: true, // Include the phone number
      status: true, // Include the status
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