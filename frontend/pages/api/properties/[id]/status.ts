import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

// Valid property status options
const PROPERTY_STATUSES = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Under Maintenance",
  renovation: "Under Renovation", 
  vacant: "Vacant",
  sold: "Sold"
} as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const propertyId = Number(id);

    // Validate the `id`
    if (isNaN(propertyId)) {
      return res.status(400).json({ error: "Invalid property ID" });
    }

    const { status } = req.body;

    // Validate status
    const allowedStatuses = Object.keys(PROPERTY_STATUSES);
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` 
      });
    }

    try {
      const updatedProperty = await prisma.property.update({
        where: { id: propertyId },
        data: { status },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      res.status(200).json(updatedProperty);
    } catch (error: unknown) {
      // Type guard for Prisma errors
      function isPrismaError(err: unknown): err is { code: string } {
        return (
          typeof err === "object" &&
          err !== null &&
          "code" in err &&
          typeof (err as { code?: unknown }).code === "string"
        );
      }

      if (error instanceof Error) {
        if (isPrismaError(error) && error.code === "P2025") {
          res.status(404).json({ error: "Property not found" });
        } else {
          console.error("Error updating property status:", error);
          res.status(500).json({ error: "Failed to update property status" });
        }
      } else {
        console.error("Unknown error:", error);
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  } else {
    res.setHeader("Allow", ["PATCH"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}