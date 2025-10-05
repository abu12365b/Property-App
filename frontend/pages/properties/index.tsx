import { PrismaClient } from "../../generated/prisma";
import PropertyCard from "../../components/PropertyCard";

const prisma = new PrismaClient();

interface Property {
  id: number;
  name: string;
  address: string;
  monthly_rent: number;
}

interface PropertiesPageProps {
  properties: Property[];
}

export default function PropertiesPage({ properties }: PropertiesPageProps) {
  return (
    <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((p) => (
        <PropertyCard key={p.id} name={p.name} address={p.address} monthly_rent={p.monthly_rent} />
      ))}
    </div>
  );
}

export async function getServerSideProps() {
  const properties = await prisma.property.findMany();
  return {
    props: { properties: JSON.parse(JSON.stringify(properties)) },
  };
}
