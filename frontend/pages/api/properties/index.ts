// This API route handles requests for the properties collection (not individual properties)
// It can create new properties (POST) or get a list of all properties (GET)

import { NextApiRequest, NextApiResponse } from "next"; // Types for API requests and responses
import prisma from "../../../lib/prisma";              // Database connection tool

// Define what a property creation request should look like
interface CreatePropertyData {
  name: string;
  address: string;
  country: string;
  city: string;
  postal_code: string;
  type: string;
  total_units: number;    // This comes as a number from the frontend
  monthly_rent: number;   // This comes as a number from the frontend
  status: string;
  notes?: string | null;  // Optional field
}

// Main handler function that decides what to do based on the HTTP method
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log(`🏠 Received ${req.method} request to /api/properties`);
  console.log("📝 Request body:", req.body);

  if (req.method === "GET") {
    // GET requests are for getting a list of all properties
    await handleGetAllProperties(req, res);
    
  } else if (req.method === "POST") {
    // POST requests are for creating new properties
    await handleCreateProperty(req, res);
    
  } else {
    // If someone tries to use a method we don't support, tell them what we do support
    res.setHeader("Allow", ["GET", "POST"]);
    return res.status(405).json({ 
      error: `Method ${req.method} is not allowed. Supported methods: GET, POST` 
    });
  }
}

// Function to get all properties (your existing logic)
async function handleGetAllProperties(req: NextApiRequest, res: NextApiResponse) {
  console.log("📋 Fetching all properties...");

  try {
    // Get all properties with more fields for the property list
    const properties = await prisma.property.findMany({
      select: {
        id: true,
        name: true,
        city: true,
        monthly_rent: true,
        status: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' }, // Show newest properties first
    });

    console.log(`✅ Found ${properties.length} properties`);

    // Convert Decimal fields to numbers for JSON response
    const response = properties.map(property => ({
      ...property,
      monthly_rent: Number(property.monthly_rent), // Convert Decimal to number
    }));

    res.status(200).json(response);

  } catch (error) {
    console.error("💥 Error fetching properties:", error);
    res.status(500).json({ 
      error: "Failed to fetch properties" 
    });
  }
}

// Function to create a new property
async function handleCreateProperty(req: NextApiRequest, res: NextApiResponse) {
  console.log("🏗️ Creating new property...");
  
  // Get the data from the request body
  const data: CreatePropertyData = req.body;

  // Check if request body exists and has data
  if (!data || typeof data !== 'object') {
    console.error("❌ No data provided in request body");
    return res.status(400).json({ 
      error: "Request body is required and must be a valid JSON object" 
    });
  }

  console.log("📋 Validating property data...");

  // Required fields for creating a new property
  const requiredFields: (keyof CreatePropertyData)[] = [
    "name", "address", "country", "city", "postal_code", 
    "type", "total_units", "monthly_rent", "status"
  ];

  // Check that all required fields are provided
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null) {
      console.error(`❌ Missing required field: ${field}`);
      return res.status(400).json({ 
        error: `Missing required field: '${field}'. Required fields are: ${requiredFields.join(", ")}` 
      });
    }
    
    // Check for empty strings in string fields
    if (typeof data[field] === 'string' && (data[field] as string).trim() === '') {
      console.error(`❌ Empty value for required field: ${field}`);
      return res.status(400).json({ 
        error: `Field '${field}' cannot be empty` 
      });
    }
  }

  // Validate specific field types and ranges
  
  // Validate total_units is a positive integer
  if (!Number.isInteger(data.total_units) || data.total_units <= 0) {
    console.error("❌ Invalid total_units:", data.total_units);
    return res.status(400).json({ 
      error: "total_units must be a positive integer" 
    });
  }

  // Validate monthly_rent is a positive number
  if (typeof data.monthly_rent !== 'number' || data.monthly_rent < 0) {
    console.error("❌ Invalid monthly_rent:", data.monthly_rent);
    return res.status(400).json({ 
      error: "monthly_rent must be a positive number" 
    });
  }

  try {
    console.log("💾 Creating property in database...");

    // Create the new property in the database
    const newProperty = await prisma.property.create({
      data: {
        name: data.name.trim(),
        address: data.address.trim(),
        country: data.country.trim(),
        city: data.city.trim(),
        postal_code: data.postal_code.trim(),
        type: data.type.trim(),
        total_units: data.total_units,
        monthly_rent: data.monthly_rent,
        status: data.status.trim(),
        notes: data.notes?.trim() || null, // Convert empty string to null
      },
    });

    console.log("✅ Property created successfully:", newProperty.id, newProperty.name);

    // Convert Decimal fields to numbers for JSON response
    // (Prisma returns Decimal objects which can't be serialized to JSON)
    const response = {
      ...newProperty,
      monthly_rent: Number(newProperty.monthly_rent), // Convert Decimal to number
    };

    // Return the created property with 201 status (Created)
    res.status(201).json(response);

  } catch (error: unknown) {
    console.error("💥 Error creating property:", error);
    
    // Handle specific database errors
    if (isPrismaError(error)) {
      if (error.code === "P2002") {
        // P2002 means unique constraint violation
        return res.status(409).json({ 
          error: "A property with this information already exists" 
        });
      } else if (error.code === "P2025") {
        // P2025 means record not found (shouldn't happen for create, but just in case)
        return res.status(404).json({ 
          error: "Related record not found" 
        });
      }
    }

    // For any other error, return a generic server error
    return res.status(500).json({ 
      error: "Failed to create property. Please try again later." 
    });
  }
}

// Helper function to check if an error is a Prisma error with a code
// This is a "type guard" that helps TypeScript understand the error type
function isPrismaError(err: unknown): err is { code: string; message: string } {
  return (
    typeof err === "object" &&           // Must be an object
    err !== null &&                      // Must not be null
    "code" in err &&                     // Must have a 'code' property
    "message" in err &&                  // Must have a 'message' property
    typeof (err as any).code === "string" &&     // Code must be a string
    typeof (err as any).message === "string"     // Message must be a string
  );
}