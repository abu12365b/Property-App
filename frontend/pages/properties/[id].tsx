// pages/properties/[id].tsx
// This file shows all the details for ONE property when you click its name

import Link from "next/link";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";
import { PrismaClient } from "@prisma/client";

// This is what a property looks like (all its details)
interface Property {
  id: number;
  name: string;
  address: string;
  country: string;
  city: string;
  postal_code: string;
  type: string;
  total_units: number;
  monthly_rent: number;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// This is the main part that shows the property details on the page
const PropertyDetailsPage: React.FC<{ property: Property | null }> = ({ property }) => {
  const router = useRouter();

  if (router.isFallback) return <div>Loading...</div>;
  if (!property) return <div className="p-8">Property not found.</div>;

  // "Cool" layout with a hero header, icons, and a glassmorphism card
  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      {/* Hero header */}
      <div className="w-full max-w-2xl mt-10 mb-6">
        <Link href="/properties" className="text-blue-600 hover:text-blue-800 underline mb-4 block text-sm">&larr; Back to Properties</Link>
        <div className="flex items-center gap-4 mb-4">
          <div className="bg-gradient-to-br from-blue-400 to-purple-400 rounded-full p-4 shadow-lg">
            {/* Home icon SVG */}
            <svg width="40" height="40" fill="none" viewBox="0 0 24 24">
              <path fill="#fff" d="M12 3l9 8h-3v7h-4v-5H10v5H6v-7H3l9-8z"/>
            </svg>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight">{property.name}</h1>
        </div>
      </div>
      {/* Glassmorphism card */}
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-lg shadow-2xl rounded-2xl p-10 border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
          <Detail label="🏠 Address" value={property.address} />
          <Detail label="🌍 Country" value={property.country} />
          <Detail label="🏙️ City" value={property.city} />
          <Detail label="📮 Postal Code" value={property.postal_code} />
          <Detail label="🏢 Type" value={property.type} />
          <Detail label="🔢 Total Units" value={property.total_units} />
          <Detail label="💵 Monthly Rent" value={`$${property.monthly_rent}`} />
          <Detail label="📊 Status" value={property.status} />
          <Detail label="📝 Notes" value={property.notes || "-"} />
          <Detail label="📅 Created At" value={new Date(property.created_at).toLocaleString()} />
          <Detail label="⏰ Updated At" value={new Date(property.updated_at).toLocaleString()} />
        </div>
        <Link
          href={`/properties/${property.id}/edit`}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Edit Property
        </Link>
      </div>
    </div>
  );
};

// Helper component for each detail row
function Detail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col bg-white/80 rounded-lg shadow-sm p-4 border border-gray-100">
      <span className="text-xs text-gray-500 mb-1">{label}</span>
      <span className="text-lg text-gray-700 font-semibold">{value}</span>
    </div>
  );
}

export default PropertyDetailsPage;

// This part runs on the server BEFORE the page loads
export async function getServerSideProps(context: GetServerSidePropsContext) {
  const { id } = context.params as { id: string }; // Explicitly type `params`
  const prisma = new PrismaClient();

  const property = await prisma.property.findUnique({
    where: { id: Number(id) },
    select: {
      id: true,
      name: true,
      address: true,
      country: true,
      city: true,
      postal_code: true,
      type: true,
      total_units: true,
      monthly_rent: true,
      status: true,
      notes: true,
      created_at: true,
      updated_at: true,
    },
  });

  return {
    props: {
      property: property
        ? {
            ...property,
            created_at: property.created_at.toISOString(),
            updated_at: property.updated_at.toISOString(),
          }
        : null,
    },
  };
}
