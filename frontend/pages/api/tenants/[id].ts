import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PUT") {
    const tenantId = Number(id);

    console.log("Request body:", req.body);
    console.log("Tenant ID:", tenantId);

    // Validate the `id`
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: "Invalid tenant ID" });
    }

    // Validate required fields
    const requiredFields = ["name", "phone", "monthly_rent", "lease_start", "status"];
    for (const field of requiredFields) {
      if (!req.body[field]) {
        console.error(`Missing required field: ${field}`);
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Validate allowed fields
    const allowedFields = [
      "name",
      "email",
      "phone",
      "monthly_rent",
      "lease_start",
      "lease_end",
      "status",
    ];
    const invalidFields = Object.keys(req.body).filter(
      (key) => !allowedFields.includes(key)
    );

    if (invalidFields.length > 0) {
      console.error(`Invalid fields: ${invalidFields.join(", ")}`);
      return res
        .status(400)
        .json({ error: `Invalid fields: ${invalidFields.join(", ")}` });
    }

    // Convert `lease_start` and `lease_end` to Date objects
    const data = {
      ...req.body,
      lease_start: req.body.lease_start ? new Date(req.body.lease_start) : null,
      lease_end: req.body.lease_end ? new Date(req.body.lease_end) : null,
    };

    try {
      console.log("Updating tenant with ID:", tenantId);
      console.log("Data being updated:", data);

      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data,
      });

      console.log("Updated tenant:", updatedTenant);
      res.status(200).json(updatedTenant);
    } catch (error: unknown) {
      // Type guard for Prisma errors (no `any`)
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
          console.error("Tenant not found:", error);
          res.status(404).json({ error: "Tenant not found" });
        } else {
          console.error("Error updating tenant:", error);
          res.status(500).json({ error: "Failed to update tenant" });
        }
      } else {
        console.error("Unknown error:", error);
        res.status(500).json({ error: "An unknown error occurred" });
      }
    }
  } else {
    res.setHeader("Allow", ["PUT"]);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
