// This page allows users to add new properties to the system
// It's like a digital form for collecting property information

import { useState } from "react";      // For managing form data that changes
import { useRouter } from "next/router"; // For navigating between pages

// Property status options - matching the API validation
const PROPERTY_STATUSES = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Under Maintenance",
  renovation: "Under Renovation", 
  vacant: "Vacant",
  sold: "Sold"
} as const;

// Define the structure of our form data with proper TypeScript typing
interface PropertyFormData {
  name: string;
  address: string;
  country: string;
  city: string;
  postal_code: string;
  type: string;
  total_units: string;    // Keep as string for form input, convert to number when submitting
  monthly_rent: string;   // Keep as string for form input, convert to number when submitting
  status: string;
  notes: string;
}

// Main component for the Add Property page
const AddPropertyPage = () => {
  // Hook to navigate between pages (like clicking browser back/forward buttons)
  const router = useRouter();

  // State to track loading status while form is being submitted
  const [isLoading, setIsLoading] = useState(false);
  
  // State to track any error messages we need to show the user
  const [error, setError] = useState<string | null>(null);
  
  // State to track success message
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State to store all the form data
  // We initialize with empty strings so the form fields start empty
  const [formData, setFormData] = useState<PropertyFormData>({
    name: "",
    address: "",
    country: "",
    city: "",
    postal_code: "",
    type: "",
    total_units: "", // Initialize as an empty string
    monthly_rent: "", // Initialize as an empty string
    status: "available", // Set a default status using our constants
    notes: "",
  });

  // Function that runs every time user types in any form field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    // Extract the field name and value from the input that changed
    const { name, value } = e.target;

    console.log(`📝 User changed ${name} to: ${value}`);

    // Clear any previous error when user starts typing
    if (error) {
      setError(null);
    }

    // Update the form data with the new value
    setFormData({
      ...formData,           // Keep all existing data
      [name]: value,         // Update only the field that changed
    });
  };

  // Function to validate the form before submitting
  const validateForm = (): boolean => {
    console.log("🔍 Validating form data...");

    // Check if required fields are filled
    const requiredFields: (keyof PropertyFormData)[] = [
      "name", "address", "country", "city", "postal_code", "type", "total_units", "monthly_rent", "status"
    ];

    for (const field of requiredFields) {
      if (!formData[field] || formData[field].toString().trim() === "") {
        setError(`Please fill in the ${field.replace('_', ' ')} field`);
        return false;
      }
    }

    // Validate total_units is a positive integer
    const totalUnits = Number(formData.total_units);
    if (isNaN(totalUnits) || totalUnits <= 0 || !Number.isInteger(totalUnits)) {
      setError("Total units must be a positive whole number");
      return false;
    }

    // Validate monthly_rent is a positive number
    const monthlyRent = Number(formData.monthly_rent);
    if (isNaN(monthlyRent) || monthlyRent < 0) {
      setError("Monthly rent must be a valid positive number");
      return false;
    }

    console.log("✅ Form validation passed");
    return true;
  };

  // Function that runs when user submits the form
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the page from reloading (default form behavior)
    e.preventDefault();

    console.log("🚀 Starting form submission...");
    
    // Clear any previous messages
    setError(null);
    setSuccessMessage(null);

    // Validate the form first
    if (!validateForm()) {
      console.log("❌ Form validation failed");
      return; // Stop if validation fails
    }

    // Show loading state to user
    setIsLoading(true);

    try {
      // Prepare the data to send to the API
      const payload = {
        ...formData,
        total_units: Number(formData.total_units), // Convert to number
        monthly_rent: Number(formData.monthly_rent), // Convert to number
        notes: formData.notes.trim() === "" ? null : formData.notes, // Convert empty notes to null
      };

      console.log("📤 Sending data to API:", payload);

      // Send the data to our API endpoint
      const response = await fetch("/api/properties", {
        method: "POST",                             // We're creating new data
        headers: {
          "Content-Type": "application/json",       // Tell API we're sending JSON
        },
        body: JSON.stringify(payload),              // Convert JavaScript object to JSON string
      });

      console.log("📥 API Response status:", response.status);

      // Check if the request was successful
      if (response.ok) {
        // Success! Parse the response data
        const newProperty = await response.json();
        console.log("✅ Property created successfully:", newProperty);
        
        // Show success message
        setSuccessMessage("Property added successfully!");
        
        // Wait a moment for user to see success message, then navigate
        setTimeout(() => {
          router.push("/properties"); // Go back to the property list page
        }, 1500);
        
      } else {
        // Something went wrong, get the error details
        const errorData = await response.json();
        console.error("❌ API Error:", errorData);
        
        // Show user-friendly error message
        setError(errorData.error || "Failed to add property. Please try again.");
      }

    } catch (err) {
      // Handle network errors or other unexpected issues
      console.error("💥 Network error:", err);
      setError("Network error. Please check your connection and try again.");
    } finally {
      // Always stop loading, regardless of success or failure
      setIsLoading(false);
    }
  };

  // Function to handle when user clicks Cancel button
  const handleCancel = () => {
    console.log("🔙 User cancelled, going back");
    router.back(); // Navigate to the previous page
  };

  // This is what gets displayed on the page
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-2xl border border-gray-200">
        
        {/* Page title with decorative emoji */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl" role="img" aria-label="house">🏠</span>
          <h1 className="text-3xl font-bold text-gray-800">Add New Property</h1>
        </div>

        {/* Error message display (only shows when there's an error) */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <span className="font-medium">Error: </span>
            {error}
          </div>
        )}

        {/* Success message display (only shows when successful) */}
        {successMessage && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            <span className="font-medium">Success: </span>
            {successMessage}
          </div>
        )}

        {/* The main form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Property Name Field */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Property Name *
            </label>
            <input
              id="name"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Sunset Apartments"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Address Field */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Street Address *
            </label>
            <input
              id="address"
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="e.g., 123 Main Street"
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            />
          </div>

          {/* Country and City in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                Country *
              </label>
              <input
                id="country"
                type="text"
                name="country"
                value={formData.country}
                onChange={handleChange}
                placeholder="e.g., United States"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                City *
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g., New York"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Postal Code and Type in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                Postal Code *
              </label>
              <input
                id="postal_code"
                type="text"
                name="postal_code"
                value={formData.postal_code}
                onChange={handleChange}
                placeholder="e.g., 10001"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Property Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              >
                <option value="">Select Type</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="condo">Condo</option>
                <option value="townhouse">Townhouse</option>
                <option value="commercial">Commercial</option>
              </select>
            </div>
          </div>

          {/* Total Units and Monthly Rent in a row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="total_units" className="block text-sm font-medium text-gray-700 mb-1">
                Total Units *
              </label>
              <input
                id="total_units"
                type="number"
                name="total_units"
                value={formData.total_units}
                onChange={handleChange}
                placeholder="e.g., 12"
                min="1"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
            <div>
              <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent ($) *
              </label>
              <input
                id="monthly_rent"
                type="number"
                name="monthly_rent"
                value={formData.monthly_rent}
                onChange={handleChange}
                placeholder="e.g., 1500"
                min="0"
                step="0.01"
                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Status Field */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status *
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              disabled={isLoading}
            >
              <option value="">Select Status</option>
              {Object.entries(PROPERTY_STATUSES).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes Field (Optional) */}
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information about the property..."
              rows={3}
              className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
              disabled={isLoading}
            />
          </div>

          {/* Form Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" opacity="0.75"/>
                  </svg>
                  Adding Property...
                </span>
              ) : (
                "Add Property"
              )}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
              disabled={isLoading}
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Required fields note */}
        <p className="text-sm text-gray-500 mt-4 text-center">
          * Required fields
        </p>
      </div>
    </div>
  );
};

export default AddPropertyPage;