import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const data = req.body;

    console.log("Request body:", data); // Log the incoming data
    console.log("Property ID:", id); // Log the property ID

    // Validate the `id`
    if (isNaN(Number(id))) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    // Validate required fields
    const requiredFields = ["name", "address", "country", "city", "postal_code", "type", "total_units", "monthly_rent", "status"];
    for (const field of requiredFields) {
      if (!data[field]) {
        console.error(`Missing required field: ${field}`); // Log the missing field
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate the `data` object
    const allowedFields = [
      "name",
      "address",
      "country",
      "city",
      "postal_code",
      "type",
      "total_units",
      "monthly_rent",
      "status",
      "notes",
    ];
    const invalidFields = Object.keys(data).filter((key) => !allowedFields.includes(key));

    if (invalidFields.length > 0) {
      console.error(`Invalid fields: ${invalidFields.join(", ")}`); // Log invalid fields
      return res.status(400).json({ error: `Invalid fields: ${invalidFields.join(", ")}` });
    }

    try {
      console.log("Updating property with ID:", id); // Debugging
      console.log("Data being updated:", data); // Debugging

      // Update the property in the database
      const updatedProperty = await prisma.property.update({
        where: { id: Number(id) },
        data,
      });

      console.log("Updated property:", updatedProperty); // Debugging
      res.status(200).json(updatedProperty);
    } catch (error: any) {
      if (error.code === "P2025") {
        console.error("Property not found:", error); // Debugging
        res.status(404).json({ error: "Property not found" });
      } else {
        console.error("Error updating property:", error); // Debugging
        res.status(500).json({ error: "Failed to update property" });
      }
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}