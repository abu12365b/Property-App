import { useState } from "react";
import { useRouter } from "next/router";

const AddPropertyPage = () => {
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    country: "",
    city: "",
    postal_code: "",
    type: "",
    total_units: "", // Initialize as an empty string
    monthly_rent: "", // Initialize as an empty string
    status: "",
    notes: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: name === "total_units" || name === "monthly_rent" ? value : value, // Keep as string for now
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      total_units: Number(formData.total_units), // Convert to number
      monthly_rent: Number(formData.monthly_rent), // Convert to number
      notes: formData.notes.trim() === "" ? null : formData.notes, // Convert empty notes to null
    };

    const response = await fetch("/api/properties", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/properties"); // Redirect to the property list page
    } else {
      const error = await response.json();
      console.error("Failed to add property:", error);
    }
  };

  const handleCancel = () => {
    router.back(); // Navigate to the previous page
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Add Property</h1>
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
              Add Property
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPropertyPage;