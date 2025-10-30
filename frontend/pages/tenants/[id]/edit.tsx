import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";

interface Tenant {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  monthly_rent: number;
  lease_start: string | null;
  lease_end?: string | null;
  status: string;
}

// Status options for tenant management
const TENANT_STATUSES = {
  active: "Active",
  moved_out: "Moved Out",
  inactive: "Inactive", 
  evicted: "Evicted",
  pending: "Pending"
} as const;

// Form validation errors interface
interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  monthly_rent?: string;
  lease_start?: string;
  lease_end?: string;
  status?: string;
  general?: string;
}

const EditTenantPage: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const router = useRouter();

  // Simplified formatDate function for date inputs
  const formatDateForInput = (date: string | null | undefined) => {
    if (!date) return "";
    
    // If it's already in YYYY-MM-DD format, return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return date;
    }
    
    try {
      // Handle other formats by parsing and reformatting
      const dateObj = new Date(date);
      
      // Check if it's a valid date
      if (isNaN(dateObj.getTime())) {
        console.warn('Invalid date:', date);
        return "";
      }
      
      // Format as YYYY-MM-DD for date inputs
      const year = dateObj.getFullYear();
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const day = String(dateObj.getDate()).padStart(2, '0');
      
      return `${year}-${month}-${day}`;
    } catch (error) {
      console.error('Error formatting date:', date, error);
      return "";
    }
  };

  // Ensure dates are properly formatted for HTML date inputs
  console.log('Tenant data received:', tenant);
  console.log('Lease start raw:', tenant.lease_start);
  console.log('Lease end raw:', tenant.lease_end);

  // Helper function to ensure YYYY-MM-DD format
  const ensureDateFormat = (dateString: string | null | undefined): string => {
    if (!dateString) return "";
    
    // If it's already YYYY-MM-DD, return as-is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      console.log('Date already in correct format:', dateString);
      return dateString;
    }
    
    // Try to parse and reformat
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        console.log('Invalid date:', dateString);
        return "";
      }
      
      const formatted = date.toISOString().split('T')[0];
      console.log('Reformatted date:', dateString, '->', formatted);
      return formatted;
    } catch (error) {
      console.error('Date formatting error:', error);
      return "";
    }
  };

  // State for form fields with properly formatted dates
  const [formData, setFormData] = useState({
    name: tenant.name,
    email: tenant.email || "",
    phone: tenant.phone || "",
    monthly_rent: tenant.monthly_rent.toString(),
    lease_start: ensureDateFormat(tenant.lease_start),
    lease_end: ensureDateFormat(tenant.lease_end),
    status: tenant.status,
  });

  console.log('Form data initialized:', formData);

  // Debug: Log whenever formData changes
  useEffect(() => {
    console.log('FormData updated:', formData);
  }, [formData]);

  // Ensure form data is always synced with tenant data
  useEffect(() => {
    const initialData = {
      name: tenant.name,
      email: tenant.email || "",
      phone: tenant.phone || "",
      monthly_rent: tenant.monthly_rent.toString(),
      lease_start: ensureDateFormat(tenant.lease_start),
      lease_end: ensureDateFormat(tenant.lease_end),
      status: tenant.status,
    };
    
    console.log('Syncing form data with tenant data:', initialData);
    setFormData(initialData);
  }, [tenant.id]); // Only run when tenant changes

  // State for form validation and UI
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  // Helper function to format date for display
  const formatDateForDisplay = (date: string | null | undefined) => {
    if (!date) return "Not set";
    
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return "Invalid date";
      
      return dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return "Invalid date";
    }
  };

  // Warn user about unsaved changes when leaving the page
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handleRouteChange = () => {
      if (isDirty) {
        return 'You have unsaved changes. Are you sure you want to leave?';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    router.events.on('routeChangeStart', handleRouteChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [isDirty, router.events]);

  // Validation functions
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation (optional but must be valid if provided)
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation (optional but must be valid if provided)
    if (formData.phone && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number (at least 10 digits)";
    }

    // Monthly rent validation
    const rent = parseFloat(formData.monthly_rent);
    if (!formData.monthly_rent || isNaN(rent)) {
      newErrors.monthly_rent = "Monthly rent is required";
    } else if (rent <= 0) {
      newErrors.monthly_rent = "Monthly rent must be greater than 0";
    } else if (rent > 1000000) {
      newErrors.monthly_rent = "Monthly rent seems too high";
    }

    // Lease start validation - check both form data and original tenant data
    const leaseStartValue = formData.lease_start || tenant.lease_start;
    if (!leaseStartValue) {
      newErrors.lease_start = "Lease start date is required";
    } else {
      const startDate = new Date(leaseStartValue);
      if (isNaN(startDate.getTime())) {
        newErrors.lease_start = "Please enter a valid start date";
      }
    }

    // Lease end validation (optional but must be after start if provided)
    const leaseEndValue = formData.lease_end || tenant.lease_end;
    if (leaseEndValue) {
      const endDate = new Date(leaseEndValue);
      const startDate = leaseStartValue ? new Date(leaseStartValue) : null;
      
      if (isNaN(endDate.getTime())) {
        newErrors.lease_end = "Please enter a valid end date";
      } else if (startDate && !isNaN(startDate.getTime()) && endDate <= startDate) {
        newErrors.lease_end = "Lease end date must be after start date";
      }
    }

    // Status validation
    if (!formData.status) {
      newErrors.status = "Status is required";
    } else if (!Object.keys(TENANT_STATUSES).includes(formData.status)) {
      newErrors.status = "Please select a valid status";
    }

    return newErrors;
  };

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    console.log(`Field ${name} changed to:`, value);
    
    // Update form data - preserve existing values
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      console.log('Updated form data:', updated);
      return updated;
    });
    setIsDirty(true);
    
    // Clear specific field error when user starts typing
    if (errors[name as keyof FormErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      // Convert numeric fields to numbers and prepare data
      const dataToSend = {
        name: formData.name,
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        monthly_rent: parseFloat(formData.monthly_rent),
        lease_start: formData.lease_start || tenant.lease_start, // Fallback to original if empty
        lease_end: formData.lease_end || null,
        status: formData.status,
      };

      console.log("Form data being sent:", dataToSend);

      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      console.log("API response status:", response.status);
      console.log("API response body:", result);

      if (!response.ok) {
        // Handle different types of errors
        if (response.status === 400) {
          setErrors({ general: result.error || "Invalid data provided" });
        } else if (response.status === 404) {
          setErrors({ general: "Tenant not found" });
        } else if (response.status === 500) {
          setErrors({ general: "Server error. Please try again later." });
        } else {
          setErrors({ general: result.error || "Failed to update tenant" });
        }
        return;
      }

      // Success - redirect to tenant details page
      router.push(`/tenants/${tenant.id}`);
    } catch (error) {
      console.error("Network error:", error);
      setErrors({ general: "Network error. Please check your connection and try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with confirmation if form is dirty
  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        router.push(`/tenants/${tenant.id}`);
      }
    } else {
      router.push(`/tenants/${tenant.id}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href={`/tenants/${tenant.id}`} className="text-blue-500 hover:text-blue-700 underline mb-4 inline-block">
          ← Back to Tenant Details
        </Link>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <h1 className="text-2xl font-bold mb-6 text-gray-800">Edit Tenant: {tenant.name}</h1>
          
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-700 text-sm">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Tenant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter tenant name"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              />
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter email address"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            {/* Monthly Rent Field */}
            <div>
              <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Rent <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  id="monthly_rent"
                  name="monthly_rent"
                  value={formData.monthly_rent}
                  onChange={handleChange}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className={`w-full border rounded-md pl-8 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.monthly_rent ? 'border-red-500 bg-red-50' : 'border-gray-300'
                  }`}
                  required
                />
              </div>
              {errors.monthly_rent && <p className="mt-1 text-sm text-red-600">{errors.monthly_rent}</p>}
            </div>

            {/* Current Database Values Display */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-3">📋 Current Database Values</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-blue-700">Lease Start:</span>
                  <div className="bg-white p-2 rounded border mt-1">
                    {tenant.lease_start ? formatDateForDisplay(tenant.lease_start) : "Not set"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Raw value: {tenant.lease_start || "null"}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-blue-700">Lease End:</span>
                  <div className="bg-white p-2 rounded border mt-1">
                    {tenant.lease_end ? formatDateForDisplay(tenant.lease_end) : "Not set"}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Raw value: {tenant.lease_end || "null"}
                  </div>
                </div>
              </div>
              <div className="mt-3 text-xs text-blue-600">
                💡 These are the current values stored in the database. Use them as reference when editing the dates below.
              </div>
            </div>

            {/* Lease Dates - Simple Approach */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Lease Start */}
              <div>
                <label htmlFor="lease_start" className="block text-sm font-medium text-gray-700 mb-1">
                  Lease Start Date <span className="text-red-500">*</span>
                </label>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Expected format: YYYY-MM-DD (e.g., 2024-01-15)
                  </div>
                  <input
                    type="date"
                    id="lease_start"
                    name="lease_start"
                    value={formData.lease_start} // Use controlled value
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD"
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lease_start ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                    required
                  />
                  <div className="text-xs text-gray-500">
                    Current input value: "{formData.lease_start}"
                  </div>
                </div>
                {errors.lease_start && <p className="mt-1 text-sm text-red-600">{errors.lease_start}</p>}
              </div>

              {/* Lease End */}
              <div>
                <label htmlFor="lease_end" className="block text-sm font-medium text-gray-700 mb-1">
                  Lease End Date
                </label>
                <div className="space-y-2">
                  <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                    Expected format: YYYY-MM-DD (e.g., 2024-12-31)
                  </div>
                  <input
                    type="date"
                    id="lease_end"
                    name="lease_end"
                    value={formData.lease_end} // Use controlled value
                    onChange={handleChange}
                    placeholder="YYYY-MM-DD"
                    className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.lease_end ? 'border-red-500 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  <div className="text-xs text-gray-500">
                    Current input value: "{formData.lease_end}"
                  </div>
                </div>
                {errors.lease_end && <p className="mt-1 text-sm text-red-600">{errors.lease_end}</p>}
              </div>
            </div>

            {/* Status Field */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status <span className="text-red-500">*</span>
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.status ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                required
              >
                <option value="">Select Status</option>
                {Object.entries(TENANT_STATUSES).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </span>
                ) : (
                  'Save Changes'
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
            </div>
          </form>
          
          {/* Dirty form warning */}
          {isDirty && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-800 text-sm">
                ⚠️ You have unsaved changes. Don't forget to save your changes before leaving this page.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditTenantPage;

// Fetch the tenant details for the edit page
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string };

  try {
    // Validate ID
    const tenantId = Number(id);
    if (isNaN(tenantId)) {
      return {
        notFound: true,
      };
    }

    // Fetch the tenant details from the database
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
    });

    if (!tenant) {
      return {
        notFound: true,
      };
    }

    // Convert dates to strings for serialization - ensure proper format for HTML date inputs
    const serializedTenant = {
      ...tenant,
      monthly_rent: Number(tenant.monthly_rent), // Ensure it's a number
      lease_start: tenant.lease_start ? tenant.lease_start.toISOString().split('T')[0] : "",
      lease_end: tenant.lease_end ? tenant.lease_end.toISOString().split('T')[0] : "",
    };

    return {
      props: {
        tenant: serializedTenant,
      },
    };
  } catch (error) {
    console.error('Error fetching tenant:', error);
    return {
      notFound: true,
    };
  }
}