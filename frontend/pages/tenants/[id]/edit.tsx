import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import Link from "next/link";
import prisma from "@/lib/prisma";

// Enhanced DatePicker Component
interface DatePickerProps {
  id: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  label: string;
}

const DatePicker: React.FC<DatePickerProps> = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  label
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // Format the displayed date for better UX
  const getDisplayValue = () => {
    if (!value) return '';
    try {
      const date = new Date(value + 'T00:00:00'); // Ensure proper parsing
      if (isNaN(date.getTime())) return value;
      
      // Return the original value for the input (YYYY-MM-DD format)
      return value;
    } catch {
      return value;
    }
  };

  const getDisplayDate = () => {
    if (!value) return null;
    try {
      const date = new Date(value + 'T00:00:00');
      if (isNaN(date.getTime())) return null;
      
      return date.toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return null;
    }
  };
  
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-green-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <input
          type="date"
          id={id}
          name={name}
          value={getDisplayValue()}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={`w-full border-2 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 transition-all duration-200 ${
            error 
              ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-500' 
              : value 
                ? 'border-green-400 bg-green-50 focus:ring-green-300 focus:border-green-500'
                : 'border-gray-300 bg-white focus:ring-green-300 focus:border-green-500 hover:border-green-300'
          } ${isFocused || isHovered ? 'shadow-lg' : 'shadow-sm'}`}
          required={required}
        />
        
        {/* Calendar Icon with enhanced styling */}
        <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none transition-colors duration-200 ${
          isFocused ? 'text-green-600' : error ? 'text-red-500' : value ? 'text-green-500' : 'text-gray-400'
        }`}>
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
          </svg>
        </div>
        
        {/* Success checkmark for filled dates */}
        {value && !error && (
          <div className="absolute inset-y-0 right-10 pr-2 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>
      
      {/* Display formatted date below input when filled */}
      {value && !error && getDisplayDate() && (
        <p className="mt-1 text-sm text-green-600 flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Selected: {getDisplayDate()}
        </p>
      )}
      
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center bg-red-50 px-3 py-2 rounded-md">
          <svg className="w-4 h-4 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      
      {!error && !value && placeholder && (
        <p className="mt-1 text-sm text-gray-500 italic">
          {placeholder}
        </p>
      )}
    </div>
  );
};

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
  status?: string;
  general?: string;
}

// Success message state
interface SuccessState {
  show: boolean;
  message: string;
}

const EditTenantPage: React.FC<{ tenant: Tenant }> = ({ tenant }) => {
  const router = useRouter();

  // Debug logging
  console.log('Tenant data received:', tenant);

  // State for form fields (dates handled separately)
  const [formData, setFormData] = useState({
    name: tenant.name,
    email: tenant.email || "",
    phone: tenant.phone || "",
    monthly_rent: tenant.monthly_rent.toString(),
    status: tenant.status,
  });

  console.log('Form data initialized:', formData);

  // Debug: Log whenever formData changes
  useEffect(() => {
    console.log('FormData updated:', formData);
  }, [formData]);

  // Ensure form data is always synced with tenant data (dates handled separately)
  useEffect(() => {
    const initialData = {
      name: tenant.name,
      email: tenant.email || "",
      phone: tenant.phone || "",
      monthly_rent: tenant.monthly_rent.toString(),
      status: tenant.status,
    };
    
    console.log('Syncing form data with tenant data:', initialData);
    setFormData(initialData);
    
    // Initialize date data with proper formatting
    const initialDateData = {
      lease_start: formatDateForInput(tenant.lease_start),
      lease_end: formatDateForInput(tenant.lease_end),
    };
    console.log('Initializing date data:', initialDateData);
    setDateData(initialDateData);
    
    // Initialize validated fields for existing data
    const initialValidatedFields = new Set<string>();
    if (tenant.name && tenant.name.length >= 2) initialValidatedFields.add('name');
    if (tenant.monthly_rent > 0) initialValidatedFields.add('monthly_rent');
    if (tenant.status && Object.keys(TENANT_STATUSES).includes(tenant.status)) {
      initialValidatedFields.add('status');
    }
    // Email and phone are always valid since they're optional
    initialValidatedFields.add('email');
    initialValidatedFields.add('phone');
    
    setValidatedFields(initialValidatedFields);
  }, [tenant.id]); // Only run when tenant changes

  // State for form validation and UI
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [success, setSuccess] = useState<SuccessState>({ show: false, message: '' });
  const [validatedFields, setValidatedFields] = useState<Set<string>>(new Set());
  
  // State for date editing
  const [isEditingDates, setIsEditingDates] = useState(false);
  const [dateData, setDateData] = useState({
    lease_start: tenant.lease_start || "",
    lease_end: tenant.lease_end || "",
  });
  const [dateErrors, setDateErrors] = useState<{lease_start?: string; lease_end?: string}>({});
  const [isUpdatingDates, setIsUpdatingDates] = useState(false);
  const [isFetchingDates, setIsFetchingDates] = useState(false);
  
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

  // Helper function to format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: string | null | undefined) => {
    if (!date) return "";
    
    console.log('Formatting date for input:', date, 'Type:', typeof date);
    
    // If it's already in YYYY-MM-DD format, return as is
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
      console.log('Date is already in YYYY-MM-DD format:', date);
      return date;
    }
    
    // Handle ISO strings and other date formats by splitting at 'T'
    // This is more reliable than creating Date objects
    if (typeof date === 'string' && date.includes('T')) {
      const formatted = date.split('T')[0];
      console.log('Formatted ISO date:', formatted);
      return formatted;
    }
    
    // Fallback: try to create Date object and format
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        console.log('Invalid date object:', date);
        return "";
      }
      
      const formatted = dateObj.toISOString().split('T')[0];
      console.log('Formatted date via Date object:', formatted);
      return formatted;
    } catch (error) {
      console.log('Error formatting date:', error);
      return "";
    }
  };

  // Fetch fresh tenant data from API to prefill dates
  const fetchTenantData = async () => {
    try {
      console.log('Fetching fresh tenant data from API...');
      const response = await fetch(`/api/tenants/${tenant.id}`);
      
      if (response.ok) {
        const freshTenant = await response.json();
        console.log('Fresh tenant data received:', freshTenant);
        
        // Format dates for input fields (convert from API response to YYYY-MM-DD)
        const formattedData = {
          lease_start: freshTenant.lease_start ? formatDateForInput(freshTenant.lease_start) : "",
          lease_end: freshTenant.lease_end ? formatDateForInput(freshTenant.lease_end) : "",
        };
        
        console.log('Formatted date data:', formattedData);
        setDateData(formattedData);
      } else {
        console.error('Failed to fetch tenant data:', response.status);
        setDateErrors({ lease_start: "Failed to load current dates" });
      }
    } catch (error) {
      console.error('Error fetching tenant data:', error);
      setDateErrors({ lease_start: "Network error while loading dates" });
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

    // Note: Lease dates are handled separately and not validated here

    // Status validation
    if (!formData.status) {
      newErrors.status = "Status is required";
    } else if (!Object.keys(TENANT_STATUSES).includes(formData.status)) {
      newErrors.status = "Please select a valid status";
    }

    return newErrors;
  };

  // Real-time field validation
  const validateField = (name: string, value: string): string | null => {
    switch (name) {
      case 'name':
        if (!value.trim()) return "Name is required";
        if (value.trim().length < 2) return "Name must be at least 2 characters";
        return null;
      case 'email':
        if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return "Please enter a valid email address";
        }
        // Email is always considered "valid" for validation tracking since it's optional
        return null;
      case 'phone':
        if (value && !/^[\+]?[\d\s\-\(\)]{10,}$/.test(value.replace(/\s/g, ''))) {
          return "Please enter a valid phone number (at least 10 digits)";
        }
        // Phone is always considered "valid" for validation tracking since it's optional
        return null;
      case 'monthly_rent':
        const rent = parseFloat(value);
        if (!value || isNaN(rent)) return "Monthly rent is required";
        if (rent <= 0) return "Monthly rent must be greater than 0";
        if (rent > 1000000) return "Monthly rent seems too high";
        return null;
      case 'status':
        if (!value) return "Status is required";
        if (!Object.keys(TENANT_STATUSES).includes(value)) {
          return "Please select a valid status";
        }
        return null;
      default:
        return null;
    }
  };

  // Handle form field changes with real-time validation
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update form data
    setFormData(prev => ({ ...prev, [name]: value }));
    setIsDirty(true);
    
    // Hide success message when user starts editing
    if (success.show) {
      setSuccess({ show: false, message: '' });
    }
    
    // Real-time validation
    const fieldError = validateField(name, value);
    setErrors(prev => ({
      ...prev,
      [name]: fieldError,
      general: undefined // Clear general errors when user makes changes
    }));
    
    // Track validated fields
    if (!fieldError) {
      setValidatedFields(prev => new Set(prev).add(name));
    } else {
      setValidatedFields(prev => {
        const newSet = new Set(prev);
        newSet.delete(name);
        return newSet;
      });
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
      // Convert numeric fields to numbers and prepare data (dates handled separately)
      const dataToSend = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim() || null,
        monthly_rent: parseFloat(formData.monthly_rent),
        status: formData.status,
        // Keep existing lease dates unchanged - ensure they're not empty strings
        lease_start: tenant.lease_start || null,
        lease_end: tenant.lease_end || null,
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

      // Success - show success message and redirect after shorter delay
      setSuccess({ show: true, message: 'Tenant updated successfully! Redirecting...' });
      setIsDirty(false);
      
      // Redirect after showing success message (shorter delay)
      setTimeout(() => {
        router.push(`/tenants/${tenant.id}`);
      }, 800);
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

  // Date validation
  const validateDates = () => {
    const errors: {lease_start?: string; lease_end?: string} = {};
    
    if (!dateData.lease_start) {
      errors.lease_start = "Lease start date is required";
    } else {
      const startDate = new Date(dateData.lease_start);
      if (isNaN(startDate.getTime())) {
        errors.lease_start = "Please enter a valid start date";
      }
    }
    
    if (dateData.lease_end) {
      const endDate = new Date(dateData.lease_end);
      const startDate = new Date(dateData.lease_start);
      
      if (isNaN(endDate.getTime())) {
        errors.lease_end = "Please enter a valid end date";
      } else if (!isNaN(startDate.getTime()) && endDate <= startDate) {
        errors.lease_end = "Lease end date must be after start date";
      }
    }
    
    return errors;
  };

  // Handle date field changes
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setDateData(prev => ({ ...prev, [name]: value }));
    
    // Clear errors for this field
    setDateErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Handle date editing toggle
  const handleEditDates = async () => {
    if (!isEditingDates) {
      // Fetch fresh data from API when starting to edit
      setIsFetchingDates(true);
      setIsEditingDates(true);
      setDateErrors({});
      await fetchTenantData();
      setIsFetchingDates(false);
    } else {
      setIsEditingDates(false);
      setDateErrors({});
    }
  };

  // Handle date update submission
  const handleDateSubmit = async () => {
    const errors = validateDates();
    if (Object.keys(errors).length > 0) {
      setDateErrors(errors);
      return;
    }

    setIsUpdatingDates(true);
    try {
      const response = await fetch(`/api/tenants/${tenant.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lease_start: dateData.lease_start,
          lease_end: dateData.lease_end || null,
        }),
      });

      if (response.ok) {
        setSuccess({ show: true, message: 'Lease dates updated successfully! Redirecting...' });
        setIsEditingDates(false);
        setIsDirty(false);
        // Navigate back to tenant detail page after a short delay
        setTimeout(() => {
          router.push(`/tenants/${tenant.id}`);
        }, 800);
      } else {
        const result = await response.json();
        setDateErrors({ lease_start: result.error || "Failed to update dates" });
      }
    } catch (error) {
      console.error("Error updating dates:", error);
      setDateErrors({ lease_start: "Network error. Please try again." });
    } finally {
      setIsUpdatingDates(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <Link href={`/tenants/${tenant.id}`} className="text-blue-500 hover:text-blue-700 underline mb-4 inline-block">
          ← Back to Tenant Details
        </Link>
        
        <div className="bg-white p-8 rounded-lg shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Edit Tenant</h1>
            <div className="text-sm text-gray-500">
              ID: #{tenant.id}
            </div>
          </div>
          
          {/* Success Message */}
          {success.show && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-green-700 text-sm font-medium">{success.message}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Error Message */}
          {errors.general && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-red-700 text-sm">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Form Progress Indicator */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Form Completion</span>
              <span className="text-gray-800 font-medium">
                {Math.min(validatedFields.size, 3)}/3 required fields validated
              </span>
            </div>
            <div className="mt-2 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((validatedFields.size / 3) * 100, 100)}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Section */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                </svg>
                Basic Information
              </h3>
              
              {/* Name Field */}
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tenant Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter tenant name"
                    className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.name 
                        ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                        : validatedFields.has('name')
                        ? 'border-green-500 bg-green-50 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {/* Validation Icon */}
                  {validatedFields.has('name') && !errors.name && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.name}
                  </p>
                )}
              </div>

              {/* Email and Phone Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter email address"
                      className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.email 
                          ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                          : validatedFields.has('email')
                          ? 'border-green-500 bg-green-50 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validatedFields.has('email') && !errors.email && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                    </svg>
                    Phone Number
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="Enter phone number"
                      className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                        errors.phone 
                          ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                          : validatedFields.has('phone')
                          ? 'border-green-500 bg-green-50 focus:ring-green-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                    />
                    {validatedFields.has('phone') && !errors.phone && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                  {errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Financial Information Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"></path>
                </svg>
                Financial Information
              </h3>
              
              {/* Monthly Rent Field */}
              <div>
                <label htmlFor="monthly_rent" className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Rent <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500 font-semibold">$</span>
                  <input
                    type="number"
                    id="monthly_rent"
                    name="monthly_rent"
                    value={formData.monthly_rent}
                    onChange={handleChange}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className={`w-full border rounded-md pl-8 pr-10 py-2 focus:outline-none focus:ring-2 transition-colors duration-200 ${
                      errors.monthly_rent 
                        ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                        : validatedFields.has('monthly_rent')
                        ? 'border-green-500 bg-green-50 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    required
                  />
                  {validatedFields.has('monthly_rent') && !errors.monthly_rent && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.monthly_rent && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.monthly_rent}
                  </p>
                )}
              </div>
            </div>

            {/* Lease Dates Information - Read Only */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  Lease Dates
                </h3>
                <button
                  type="button"
                  onClick={handleEditDates}
                  disabled={isUpdatingDates || isFetchingDates}
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 flex items-center"
                >
                  {isFetchingDates ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Loading...
                    </>
                  ) : isEditingDates ? 'Cancel Edit' : 'Edit Dates'}
                </button>
              </div>
              
              {!isEditingDates ? (
                // Display Mode
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-green-700">Lease Start:</span>
                      <div className="bg-white p-3 rounded border mt-1 font-medium">
                        {tenant.lease_start ? formatDateForDisplay(tenant.lease_start) : "Not set"}
                      </div>
                    </div>
                    <div>
                      <span className="font-medium text-green-700">Lease End:</span>
                      <div className="bg-white p-3 rounded border mt-1 font-medium">
                        {tenant.lease_end ? formatDateForDisplay(tenant.lease_end) : "Not set"}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-green-100 rounded text-sm text-green-700">
                    📝 <strong>Note:</strong> Click "Edit Dates" to modify lease dates with database prefilling.
                  </div>
                </>
              ) : (
                // Edit Mode
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Lease Start Date Picker */}
                    <DatePicker
                      id="lease_start"
                      name="lease_start"
                      value={dateData.lease_start}
                      onChange={handleDateChange}
                      placeholder="Click to select lease start date"
                      required={true}
                      error={dateErrors.lease_start}
                      label="Lease Start Date"
                    />

                    {/* Lease End Date Picker */}
                    <DatePicker
                      id="lease_end"
                      name="lease_end"
                      value={dateData.lease_end}
                      onChange={handleDateChange}
                      placeholder="Click to select lease end date (optional)"
                      required={false}
                      error={dateErrors.lease_end}
                      label="Lease End Date"
                    />
                  </div>

                  {/* Date Edit Actions */}
                  <div className="flex gap-3 pt-3 border-t border-green-200">
                    <button
                      type="button"
                      onClick={handleDateSubmit}
                      disabled={isUpdatingDates}
                      className="bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50 font-medium flex items-center"
                    >
                      {isUpdatingDates ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Updating...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Update Dates
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingDates(false)}
                      disabled={isUpdatingDates}
                      className="border border-green-300 text-green-700 py-2 px-4 rounded-md hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                  </div>

                  <div className="mt-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="text-sm">
                        <p className="text-green-800 font-medium">Date Picker Tips:</p>
                        <ul className="mt-1 text-green-700 space-y-1">
                          <li>• Click the calendar icon or input field to select dates</li>
                          <li>• Dates are automatically fetched from the database when you start editing</li>
                          <li>• Lease end date is optional - leave blank for month-to-month leases</li>
                          <li>• Use keyboard shortcuts: Tab to navigate, Enter to select</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Section */}
            <div className="bg-purple-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Tenancy Status
              </h3>
              
              {/* Status Field */}
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className={`w-full border rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 transition-colors duration-200 appearance-none ${
                      errors.status 
                        ? 'border-red-500 bg-red-50 focus:ring-red-500' 
                        : validatedFields.has('status')
                        ? 'border-green-500 bg-green-50 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
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
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    {validatedFields.has('status') && !errors.status ? (
                      <svg className="h-5 w-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    )}
                  </div>
                </div>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.status}
                  </p>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="submit"
                  disabled={isSubmitting || success.show}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Saving Changes...
                    </>
                  ) : success.show ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Saved Successfully!
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      Save Changes
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center justify-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                  </svg>
                  Cancel
                </button>
              </div>
              
              {/* Form Tips */}
              <div className="mt-4 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <svg className="w-4 h-4 mt-0.5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="font-medium">Tips:</p>
                    <ul className="mt-1 space-y-1 text-xs">
                      <li>• Fields marked with <span className="text-red-500">*</span> are required</li>
                      <li>• Changes are saved to the database immediately when you submit</li>
                      <li>• Lease dates are managed separately for security</li>
                    </ul>
                  </div>
                </div>
              </div>
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