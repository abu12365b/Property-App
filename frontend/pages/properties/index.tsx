import Link from "next/link";
import { PrismaClient } from "@prisma/client";

// Define the type of a single property
interface Property {
  id: number;
  name: string;
  city: string;
  monthly_rent: number;
}

// Table row as a functional component
const PropertyRow: React.FC<{ property: Property }> = ({ property }) => (
  <tr key={property.id} className="hover:bg-gray-50 cursor-pointer">
    <td className="border p-2">
      <Link href={`/properties/${property.id}`}>{property.name}</Link>
    </td>
    <td className="border p-2">{property.city}</td>
    <td className="border p-2">${property.monthly_rent}</td>
  </tr>
);

// Main page as a functional component
const PropertiesPage: React.FC<{ properties: Property[] }> = ({ properties }) => (
  <div className="p-8">
    {/* Add a link to go back to the home page */}
    <Link href="/" className="text-blue-500 underline mb-4 block">&larr; Back to Home</Link>
    <h1 className="text-2xl font-bold mb-4">Properties</h1>
    <table className="min-w-full border-collapse border border-gray-200">
      <thead>
        <tr className="bg-gray-100">
          <th className="border p-2 text-left">Name</th>
          <th className="border p-2 text-left">City</th>
          <th className="border p-2 text-left">Monthly Rent</th>
        </tr>
      </thead>
      <tbody>
        {properties.map((property) => (
          <PropertyRow key={property.id} property={property} />
        ))}
      </tbody>
    </table>
  </div>
);

export default PropertiesPage;

// SERVER-SIDE FETCHING
export async function getServerSideProps() {
  // Correct PrismaClient import
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  const properties = await prisma.property.findMany({
    select: {
      id: true,
      name: true,
      city: true,
      monthly_rent: true,
    },
  });

  return {
    props: { properties },
  };
}