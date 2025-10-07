import { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import prisma from "@/lib/prisma";

interface Tenant {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  monthly_rent: number;
  lease_start: string;
  lease_end?: string;
  status: string;
}

const EditTenantPage: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const router = useRouter();

  // Simplified formatDate function
  const formatDate = (date: string | null | undefined) => date || "";

  // State for form fields
  const [formData, setFormData] = useState({
    name: tenant.name,
    email: tenant.email || "",
    phone: tenant.phone || "",
    monthly_rent: tenant.monthly_rent,
    lease_start: formatDate(tenant.lease_start), // Use the date directly
    lease_end: formatDate(tenant.lease_end), // Use the date directly
    status: tenant.status,
  });

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Convert numeric fields to numbers
    const dataToSend = {
      ...formData,
      monthly_rent: Number(formData.monthly_rent), // Convert monthly_rent to a number
    };

    console.log("Form data being sent:", dataToSend); // Log the corrected form data

    const response = await fetch(`/api/tenants/${tenant.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataToSend),
    });

    const result = await response.json();
    console.log("API response status:", response.status); // Log the HTTP status code
    console.log("API response body:", result); // Log the response body

    if (!response.ok) {
      console.error("Failed to update tenant:", result.error); // Log the error message
      return;
    }

    router.push(`/tenants/${tenant.id}`); // Redirect to the tenant details page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Edit Tenant</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tenant Name"
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
            value={formData.lease_start} // Use the date directly
            onChange={handleChange}
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="lease_end"
            value={formData.lease_end} // Use the date directly
            onChange={handleChange}
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
            placeholder="Status"
            className="border p-2 rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditTenantPage;

// Fetch the tenant details for the edit page
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string }; // Explicitly type `params`

  // Fetch the tenant details from the database
  const tenant = await prisma.tenant.findUnique({
    where: { id: Number(id) },
  });

  if (!tenant) {
    return {
      notFound: true, // Return 404 if the tenant is not found
    };
  }

  // Return the tenant details as props
  return {
    props: {
      tenant,
    },
  };
}