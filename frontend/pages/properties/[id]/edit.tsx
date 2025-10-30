import { useState } from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import prisma from "@/lib/prisma";

// Status options for property management
const PROPERTY_STATUSES = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Under Maintenance",
  renovation: "Under Renovation", 
  vacant: "Vacant",
  sold: "Sold"
} as const;

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // State for form submission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
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
        setError(result.error || "Failed to update property");
        return;
      }

      // Show success message
      setSuccess(true);
      
      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/properties/${property.id}`);
      }, 1000);

    } catch (error) {
      console.error("Network error:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel button click
  const handleCancel = () => {
    router.push(`/properties/${property.id}`); // Redirect back to the property details page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <div className="mb-4">
          <a 
            href={`/properties/${property.id}`}
            className="text-blue-500 hover:text-blue-700 underline text-sm"
          >
            ← Back to Property Details
          </a>
        </div>
        <h1 className="text-2xl font-bold mb-6">Edit Property</h1>
        
        {/* Success Message */}
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 font-medium">Property updated successfully! Redirecting...</p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

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
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="border p-2 rounded"
            required
          >
            <option value="">Select Status</option>
            {Object.entries(PROPERTY_STATUSES).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
              disabled={isSubmitting || success}
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : success ? (
                <>
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Saved!
                </>
              ) : (
                'Save Changes'
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
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
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string }; // Explicitly type `params`

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