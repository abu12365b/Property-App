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
  <tr
    key={property.id}
    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer"
  >
    <td className="border p-4 font-semibold text-blue-700">
      <Link
        href={`/properties/${property.id}`}
        className="hover:underline flex items-center gap-2"
      >
        <span role="img" aria-label="home">🏠</span>
        {property.name}
      </Link>
    </td>
    <td className="border p-4 text-gray-600">{property.city}</td>
    <td className="border p-4 text-green-600 font-bold">${property.monthly_rent}</td>
  </tr>
);

// Main page as a functional component
const PropertiesPage: React.FC<{ properties: Property[] }> = ({ properties }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center">
    <div className="w-full max-w-4xl mt-10 bg-white/80 rounded-2xl shadow-2xl p-10 border border-gray-200">
      {/* Add a link to go back to the home page */}
      <Link href="/" className="text-blue-500 underline mb-6 block text-lg hover:text-blue-700 transition-colors">&larr; Back to Home</Link>
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🏡</span>
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-lg">Properties</h1>
      </div>
      <table className="min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-blue-100">
            <th className="border p-4 text-left text-blue-800 font-bold text-lg">Name</th>
            <th className="border p-4 text-left text-blue-800 font-bold text-lg">City</th>
            <th className="border p-4 text-left text-blue-800 font-bold text-lg">Monthly Rent</th>
          </tr>
        </thead>
        <tbody>
          {properties.map((property) => (
            <PropertyRow key={property.id} property={property} />
          ))}
        </tbody>
      </table>
      {/* Add a little footer for style */}
      <div className="mt-8 text-gray-400 text-sm text-center">
        <span role="img" aria-label="sparkles">✨</span> Manage your properties with style!
      </div>
    </div>
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