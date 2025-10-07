import { useState } from "react";
import { useRouter } from "next/router";
import prisma from "@/lib/prisma";

interface Property {
  id: number;
  name: string;
  address: string;
  country: string;
  city: string;
  postal_code: string;
  type: string;
  total_units: number;
  monthly_rent: number;
  status: string;
  notes?: string;
}

const EditPropertyPage: React.FC<{ property: Property }> = ({ property }) => {
  const router = useRouter();

  // State for form fields
  const [formData, setFormData] = useState({
    name: property.name,
    address: property.address,
    country: property.country,
    city: property.city,
    postal_code: property.postal_code,
    type: property.type,
    total_units: property.total_units,
    monthly_rent: property.monthly_rent,
    status: property.status,
    notes: property.notes || "",
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
      total_units: Number(formData.total_units), // Convert total_units to a number
      monthly_rent: Number(formData.monthly_rent), // Convert monthly_rent to a number
    };

    console.log("Form data being sent:", dataToSend); // Log the corrected form data

    const response = await fetch(`/api/properties/${property.id}`, {
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
      console.error("Failed to update property:", result.error); // Log the error message
      return;
    }

    router.push(`/properties/${property.id}`); // Redirect to the property details page
  };

  // Handle cancel button click
  const handleCancel = () => {
    router.push(`/properties/${property.id}`); // Redirect back to the property details page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Property Name"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="country"
            value={formData.country}
            onChange={handleChange}
            placeholder="Country"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="postal_code"
            value={formData.postal_code}
            onChange={handleChange}
            placeholder="Postal Code"
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            name="type"
            value={formData.type}
            onChange={handleChange}
            placeholder="Type"
            className="border p-2 rounded"
            required
          />
          <input
            type="number"
            name="total_units"
            value={formData.total_units}
            onChange={handleChange}
            placeholder="Total Units"
            className="border p-2 rounded"
            required
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
            type="text"
            name="status"
            value={formData.status}
            onChange={handleChange}
            placeholder="Status"
            className="border p-2 rounded"
            required
          />
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notes"
            className="border p-2 rounded"
          />
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPropertyPage;

// Fetch the property details for the edit page
export async function getServerSideProps(context: any) {
  const { id } = context.params;

  // Fetch the property details from the database
  const property = await prisma.property.findUnique({
    where: { id: Number(id) },
  });

  if (!property) {
    return {
      notFound: true, // Return 404 if the property is not found
    };
  }

  // Convert Date fields to strings
  return {
    props: {
      property: {
        ...property,
        created_at: property.created_at.toISOString(), // Convert created_at to a string
        updated_at: property.updated_at.toISOString(), // Convert updated_at to a string
      },
    },
  };
}