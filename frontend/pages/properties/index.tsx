// Importing necessary modules
// `Link` is used for navigation between pages in Next.js
// `PrismaClient` is used to interact with the database
import Link from "next/link";
import { PrismaClient } from "@prisma/client";

// Define the structure of a single property
// This interface ensures that each property has an `id`, `name`, `city`, and `monthly_rent`
interface Property {
  id: number; // Unique identifier for the property
  name: string; // Name of the property
  city: string; // City where the property is located
  monthly_rent: number; // Monthly rent for the property
}

// Create a reusable component for a single row in the properties table
// This component takes a `property` object as a prop and displays its details in a table row
const PropertyRow: React.FC<{ property: Property }> = ({ property }) => (
  <tr
    key={property.id} // Unique key for React to track this row
    className="hover:bg-blue-50 transition-colors duration-150 cursor-pointer" // Add hover effect and pointer cursor
  >
    {/* Property name with a link to the property details page */}
    <td className="border p-4 font-semibold text-blue-700">
      <Link
        href={`/properties/${property.id}`} // Navigate to the property details page
        className="hover:underline flex items-center gap-2"
      >
        <span role="img" aria-label="home">🏠</span> {/* Emoji for visual appeal */}
        {property.name} {/* Display the property name */}
      </Link>
    </td>
    {/* Display the city where the property is located */}
    <td className="border p-4 text-gray-600">{property.city}</td>
    {/* Display the monthly rent for the property */}
    <td className="border p-4 text-green-600 font-bold">${property.monthly_rent}</td>
  </tr>
);

// Main page component for displaying the list of properties
// This component receives a list of properties as a prop
const PropertiesPage: React.FC<{ properties: Property[] }> = ({ properties }) => (
  <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center">
    <div className="w-full max-w-4xl mt-10 bg-white/80 rounded-2xl shadow-2xl p-10 border border-gray-200">
      {/* Link to go back to the sign-in page */}
      <Link
        href="/signin" // Navigate to the sign-in page
        className="text-blue-500 underline mb-6 block text-lg hover:text-blue-700 transition-colors"
      >
        &larr; Back to Sign In {/* Text for the link */}
      </Link>

      {/* Title for the properties page */}
      <div className="flex items-center gap-3 mb-8">
        <span className="text-3xl">🏡</span> {/* Emoji for visual appeal */}
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight drop-shadow-lg">
          Properties
        </h1>
      </div>

      {/* Table to display the list of properties */}
      <table className="min-w-full border-collapse border border-gray-200 rounded-lg overflow-hidden shadow">
        <thead>
          <tr className="bg-blue-100">
            {/* Table headers */}
            <th className="border p-4 text-left text-blue-800 font-bold text-lg">Name</th>
            <th className="border p-4 text-left text-blue-800 font-bold text-lg">City</th>
            <th className="border p-4 text-left text-blue-800 font-bold text-lg">Monthly Rent</th>
          </tr>
        </thead>
        <tbody>
          {/* Map through the properties array and render a `PropertyRow` for each property */}
          {properties.map((property) => (
            <PropertyRow key={property.id} property={property} />
          ))}
        </tbody>
      </table>

      {/* Footer for additional style */}
      <div className="mt-8 text-gray-400 text-sm text-center">
        <span role="img" aria-label="sparkles">✨</span> Manage your properties with style!
      </div>
    </div>
  </div>
);

export default PropertiesPage;

// Server-side function to fetch the list of properties from the database
// This function runs on the server and fetches data before rendering the page
export async function getServerSideProps() {
  // Import PrismaClient dynamically to avoid issues with server-side rendering
  const { PrismaClient } = await import('@prisma/client');
  const prisma = new PrismaClient();

  // Fetch the list of properties from the database
  const properties = await prisma.property.findMany({
    select: {
      id: true, // Include the property ID
      name: true, // Include the property name
      city: true, // Include the city
      monthly_rent: true, // Include the monthly rent
    },
  });

  // Return the properties as props to the page component
  return {
    props: { properties },
  };
}