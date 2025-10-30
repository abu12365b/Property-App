import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

// Valid tenant status options
const TENANT_STATUSES = {
  active: "Active",
  moved_out: "Moved Out",
  inactive: "Inactive", 
  evicted: "Evicted",
  pending: "Pending"
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const data = req.body;

    // Validate required fields
    const requiredFields = ["property_id", "unit_number", "name", "monthly_rent", "lease_start", "status"];
    for (const field of requiredFields) {
      if (!data[field] && data[field] !== 0) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate status is valid
    const validStatuses = Object.keys(TENANT_STATUSES);
    if (!validStatuses.includes(data.status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` 
      });
    }

    // Validate monthly rent
    const monthlyRent = parseFloat(data.monthly_rent);
    if (isNaN(monthlyRent) || monthlyRent < 0 || monthlyRent > 1000000) {
      return res.status(400).json({ 
        error: "Monthly rent must be a positive number between $0 and $1,000,000" 
      });
    }

    // Validate property_id
    const propertyId = Number(data.property_id);
    if (isNaN(propertyId) || propertyId <= 0) {
      return res.status(400).json({ 
        error: "Property ID must be a valid positive number" 
      });
    }

    try {
      // Create the tenant in the database
      const newTenant = await prisma.tenant.create({
        data: {
          property_id: Number(data.property_id), // Ensure property_id is a number
          unit_number: data.unit_number,
          name: data.name,
          email: data.email || null,
          phone: data.phone || null,
          monthly_rent: parseFloat(data.monthly_rent), // Ensure monthly_rent is a number
          lease_start: new Date(data.lease_start),
          lease_end: data.lease_end ? new Date(data.lease_end) : null,
          status: data.status,
        },
      });

      res.status(201).json(newTenant);
    } catch (error) {
      console.error("Error creating tenant:", error);
      res.status(500).json({ error: "Failed to create tenant" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}