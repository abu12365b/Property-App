import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Select, { SingleValue, ActionMeta } from "react-select";

interface PropertyOption {
  value: number;
  label: string;
}

const AddTenantPage = () => {
  const router = useRouter();

  const [properties, setProperties] = useState<PropertyOption[]>([]); // Explicitly define the type
  const [formData, setFormData] = useState({
    property_id: "" as number | "", // Allow property_id to be a number or an empty string
    unit_number: "",
    name: "",
    email: "",
    phone: "",
    monthly_rent: "",
    lease_start: "",
    lease_end: "",
    status: "",
  });

  // Fetch the list of properties when the component mounts
  useEffect(() => {
    const fetchProperties = async () => {
      const response = await fetch("/api/properties"); // API to fetch all properties
      const data = await response.json();
      setProperties(
        data.map((property: { id: number; name: string }) => ({
          value: property.id,
          label: property.name,
        }))
      );
    };

    fetchProperties();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handlePropertyChange = (newValue: SingleValue<PropertyOption>, actionMeta: ActionMeta<PropertyOption>) => {
    if (newValue) {
      setFormData({ ...formData, property_id: newValue.value }); // Set property_id if a value is selected
    } else {
      setFormData({ ...formData, property_id: "" }); // Reset property_id if no value is selected
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      ...formData,
      property_id: Number(formData.property_id),
      monthly_rent: Number(formData.monthly_rent),
    };

    const response = await fetch("/api/tenants", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      router.push("/tenants");
    } else {
      const error = await response.json();
      console.error("Failed to add tenant:", error);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-6">Add Tenant</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Select
            options={properties}
            onChange={handlePropertyChange} // Updated handler
            placeholder="Select Property"
            className="border p-2 rounded"
          />
          <input
            type="text"
            name="unit_number"
            value={formData.unit_number}
            onChange={handleChange}
            placeholder="Unit Number"
            className="border p-2 rounded"
            required
          />
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
            value={formData.lease_start}
            onChange={handleChange}
            placeholder="Lease Start"
            className="border p-2 rounded"
            required
          />
          <input
            type="date"
            name="lease_end"
            value={formData.lease_end}
            onChange={handleChange}
            placeholder="Lease End"
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
          <div className="flex gap-4">
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
            >
              Add Tenant
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

export default AddTenantPage;