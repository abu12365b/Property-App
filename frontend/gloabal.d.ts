// filepath: c:\Users\abuba\OneDrive\Desktop\Github\Property-App\frontend\global.d.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // Extend the global object to include the `prisma` property
  var prisma: PrismaClient | undefined;
}