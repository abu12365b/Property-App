// This API route handles requests for individual properties (identified by ID)
// It can update existing properties (PUT) or create new properties with a specific ID (POST)

import { NextApiRequest, NextApiResponse } from "next"; // Types for API requests and responses
import prisma from "../../../lib/prisma";              // Database connection tool

// Define what a valid property data should look like
interface PropertyData {
  name: string;         // Property name (required)
  address: string;      // Street address (required)
  country: string;      // Country name (required)
  city: string;         // City name (required)
  postal_code: string;  // ZIP/postal code (required)
  type: string;         // Property type - apartment, house, etc. (required)
  total_units: number;  // Number of units in the property (required)
  monthly_rent: number; // Monthly rent amount (required)
  status: string;       // Property status - occupied, vacant, etc. (required)
  notes?: string;       // Optional notes about the property
  // Add index signature to allow string-based property access
  [key: string]: any;   // This tells TypeScript that any string key is allowed
}

// Type for partial updates (when we don't need all fields)
interface PropertyUpdateData {
  name?: string;
  address?: string;
  country?: string;
  city?: string;
  postal_code?: string;
  type?: string;
  total_units?: number;
  monthly_rent?: number;
  status?: string;
  notes?: string;
  // Add index signature for dynamic property access
  [key: string]: any;
}

// Main handler function that decides what to do based on the HTTP method
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Extract the property ID from the URL
  // For example, if someone visits /api/properties/123, id will be "123"
  const { id } = req.query;

  console.log(`🏠 Received ${req.method} request for property ID: ${id}`);
  console.log("📝 Request body:", req.body);

  // First, let's validate that the ID is a valid number
  const propertyId = Number(id);
  if (isNaN(propertyId) || propertyId <= 0) {
    console.error("❌ Invalid property ID received:", id);
    return res.status(400).json({ 
      error: "Invalid property ID. Must be a positive number." 
    });
  }

  // Check what type of HTTP request this is and handle accordingly
  if (req.method === "PUT") {
    // PUT requests are for updating existing properties
    await handleUpdateProperty(req, res, propertyId);
    
  } else if (req.method === "POST") {
    // POST requests are for creating a new property with a specific ID
    // Note: This is unusual - typically POST is used without an ID
    // But we'll support it for flexibility
    await handleCreateProperty(req, res, propertyId);
    
  } else {
    // If someone tries to use a method we don't support, tell them what we do support
    res.setHeader("Allow", ["PUT", "POST"]);
    return res.status(405).json({ 
      error: `Method ${req.method} is not allowed. Supported methods: PUT, POST` 
    });
  }
}

// Function to handle updating an existing property
async function handleUpdateProperty(req: NextApiRequest, res: NextApiResponse, propertyId: number) {
  console.log("🔄 Starting property update for ID:", propertyId);
  
  // Get the data from the request body (the new information to save)
  // Use PropertyUpdateData type for partial updates
  const data: PropertyUpdateData = req.body;

  // Check if the request body is empty
  if (!data || Object.keys(data).length === 0) {
    console.error("❌ No data provided in request body");
    return res.status(400).json({ error: "No data provided for update" });
  }

  // For updates, we require all these fields to be present
  // This ensures we don't accidentally clear important data
  const requiredFields: (keyof PropertyUpdateData)[] = [
    "name", "address", "country", "city", "postal_code", 
    "type", "total_units", "monthly_rent", "status"
  ];

  // Check each required field using type-safe property access
  for (const field of requiredFields) {
    // Type assertion to tell TypeScript we know this field exists
    const value = data[field];
    if (!value && value !== 0) { // Allow 0 as a valid value
      console.error(`❌ Missing required field: ${field}`);
      return res.status(400).json({ 
        error: `Missing required field: ${field}` 
      });
    }
  }

  // List of fields that are allowed to be updated
  const allowedFields: string[] = [
    "name", "address", "country", "city", "postal_code", 
    "type", "total_units", "monthly_rent", "status", "notes"
  ];

  // Check if someone is trying to update fields that don't exist or aren't allowed
  const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));
  if (invalidFields.length > 0) {
    console.error(`❌ Invalid fields detected: ${invalidFields.join(", ")}`);
    return res.status(400).json({ 
      error: `Invalid fields: ${invalidFields.join(", ")}` 
    });
  }

  // Validate data types and ranges
  if (!validatePropertyData(data, res)) {
    return; // validatePropertyData already sent the error response
  }

  try {
    console.log("💾 Attempting to update property in database...");

    // Try to update the property in the database
    const updatedProperty = await prisma.property.update({
      where: { id: propertyId },  // Find the property with this ID
      data,                       // Update it with the new data
    });

    console.log("✅ Property updated successfully:", updatedProperty.name);
    
    // Convert Decimal fields to numbers for JSON response
    const response = {
      ...updatedProperty,
      monthly_rent: Number(updatedProperty.monthly_rent),
    };

    res.status(200).json(response);

  } catch (error: unknown) {
    console.error("💥 Error during property update:", error);
    handleDatabaseError(error, res, propertyId, "update");
  }
}

// Function to handle creating a new property with a specific ID
async function handleCreateProperty(req: NextApiRequest, res: NextApiResponse, propertyId: number) {
  console.log("🏗️ Creating new property with ID:", propertyId);
  
  // Get the data from the request body
  const data: PropertyData = req.body;

  // Check if the request body is empty
  if (!data || Object.keys(data).length === 0) {
    console.error("❌ No data provided in request body");
    return res.status(400).json({ error: "No data provided for property creation" });
  }

  // For creating new properties, all these fields are absolutely required
  const requiredFields: (keyof PropertyData)[] = [
    "name", "address", "country", "city", "postal_code", 
    "type", "total_units", "monthly_rent", "status"
  ];

  // Check each required field using type-safe property access
  for (const field of requiredFields) {
    const value = data[field];
    if (!value && value !== 0) { // Allow 0 as a valid value
      console.error(`❌ Missing required field for creation: ${field}`);
      return res.status(400).json({ 
        error: `Missing required field: ${field}. All required fields: ${requiredFields.join(", ")}` 
      });
    }
  }

  // Validate data types and ranges
  if (!validatePropertyData(data, res)) {
    return; // validatePropertyData already sent the error response
  }

  try {
    // First, check if a property with this ID already exists
    console.log("🔍 Checking if property ID is already taken...");
    const existingProperty = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (existingProperty) {
      console.error("❌ Property ID already exists:", propertyId);
      return res.status(409).json({ 
        error: `Property with ID ${propertyId} already exists. Use PUT to update existing properties.` 
      });
    }

    console.log("💾 Creating property in database...");

    // Create the new property with the specified ID
    // Note: This requires your database to allow manual ID assignment
    const newProperty = await prisma.property.create({
      data: {
        id: propertyId,         // Explicitly set the ID
        name: data.name,
        address: data.address,
        country: data.country,
        city: data.city,
        postal_code: data.postal_code,
        type: data.type,
        total_units: data.total_units,
        monthly_rent: data.monthly_rent,
        status: data.status,
        notes: data.notes || null,
      },
    });

    console.log("✅ Property created successfully:", newProperty.name);

    // Convert Decimal fields to numbers for JSON response
    const response = {
      ...newProperty,
      monthly_rent: Number(newProperty.monthly_rent),
    };

    // Return the created property with 201 status (Created)
    res.status(201).json(response);

  } catch (error: unknown) {
    console.error("💥 Error during property creation:", error);
    handleDatabaseError(error, res, propertyId, "create");
  }
}

// Helper function to validate property data
// Returns true if valid, false if invalid (and sends error response)
function validatePropertyData(data: PropertyUpdateData | PropertyData, res: NextApiResponse): boolean {
  // Validate total_units is a positive integer
  if (data.total_units !== undefined) {
    const totalUnits = Number(data.total_units);
    if (isNaN(totalUnits) || totalUnits < 1 || totalUnits > 10000 || !Number.isInteger(totalUnits)) {
      res.status(400).json({ 
        error: "total_units must be a positive integer between 1 and 10,000" 
      });
      return false;
    }
  }

  // Validate monthly_rent is a positive number
  if (data.monthly_rent !== undefined) {
    const monthlyRent = Number(data.monthly_rent);
    if (isNaN(monthlyRent) || monthlyRent < 0 || monthlyRent > 1000000) {
      res.status(400).json({ 
        error: "monthly_rent must be a positive number between $0 and $1,000,000" 
      });
      return false;
    }
  }

  // Validate string fields are not empty
  // Define the string fields we want to validate
  const stringFields: (keyof (PropertyUpdateData | PropertyData))[] = [
    "name", "address", "country", "city", "postal_code", "type", "status"
  ];
  
  for (const field of stringFields) {
    const value = data[field];
    if (value !== undefined && typeof value === "string" && value.trim() === "") {
      res.status(400).json({ 
        error: `${String(field)} cannot be empty` 
      });
      return false;
    }
  }

  return true; // All validations passed
}

// Helper function to handle database errors consistently
function handleDatabaseError(error: unknown, res: NextApiResponse, propertyId: number, operation: string) {
  // Handle different types of errors
  if (isPrismaError(error)) {
    if (error.code === "P2025") {
      // P2025 means "Record not found"
      console.error("❌ Property not found with ID:", propertyId);
      return res.status(404).json({ 
        error: `Property with ID ${propertyId} not found` 
      });
    } else if (error.code === "P2002") {
      // P2002 means "Unique constraint violation"
      console.error("❌ Duplicate property data");
      return res.status(409).json({ 
        error: "A property with this information already exists" 
      });
    }
  }

  // For any other error, return a generic server error
  return res.status(500).json({ 
    error: `Failed to ${operation} property. Please try again later.` 
  });
}

// Helper function to check if an error is a Prisma error with a code
// This is a "type guard" - it helps TypeScript understand what type of error we're dealing with
function isPrismaError(err: unknown): err is { code: string } {
  return (
    typeof err === "object" &&           // Must be an object
    err !== null &&                      // Must not be null
    "code" in err &&                     // Must have a 'code' property
    typeof (err as { code?: unknown }).code === "string"  // Code must be a string
  );
}
