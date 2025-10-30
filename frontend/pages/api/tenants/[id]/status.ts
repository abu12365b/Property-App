import { NextApiRequest, NextApiResponse } from "next";
import prisma from "../../../../lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "PATCH") {
    const tenantId = Number(id);

    // Validate the `id`
    if (isNaN(tenantId)) {
      return res.status(400).json({ error: "Invalid tenant ID" });
    }

    const { status } = req.body;

    // Validate status
    const allowedStatuses = ["active", "moved_out", "inactive", "evicted", "pending"];
    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        error: `Invalid status. Must be one of: ${allowedStatuses.join(", ")}` 
      });
    }

    try {
      const updatedTenant = await prisma.tenant.update({
        where: { id: tenantId },
        data: { status },
        select: {
          id: true,
          name: true,
          status: true,
        },
      });

      res.status(200).json(updatedTenant);
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
          res.status(404).json({ error: "Tenant not found" });
        } else {
          console.error("Error updating tenant status:", error);
          res.status(500).json({ error: "Failed to update tenant status" });
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