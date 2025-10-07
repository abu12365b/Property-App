import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const data = req.body;

    // Validate required fields
    const requiredFields = ["property_id", "unit_number", "name", "monthly_rent", "lease_start", "status"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
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