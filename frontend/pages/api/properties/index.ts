import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "POST") {
    const data = req.body;

    // Validate required fields
    const requiredFields = ["name", "address", "country", "city", "postal_code", "type", "total_units", "monthly_rent", "status"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    try {
      // Create the property in the database
      const newProperty = await prisma.property.create({
        data,
      });

      res.status(201).json(newProperty);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ error: "Failed to create property" });
    }
  } else {
    res.setHeader("Allow", ["POST"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}