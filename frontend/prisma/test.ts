import { PrismaClient } from "./generated/prisma";

const prisma = new PrismaClient();

async function main() {
  const properties = await prisma.property.findMany();
  console.log("Properties:", properties);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
