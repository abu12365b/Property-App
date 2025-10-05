import React from "react";

type Props = {
  name: string;
  address: string;
  monthly_rent: number;
};

export default function PropertyCard({ name, address, monthly_rent }: Props) {
  return (
    <div className="border rounded p-4 shadow hover:shadow-lg transition">
      <h2 className="text-xl font-bold">{name}</h2>
      <p>{address}</p>
      <p className="text-green-600 font-semibold">${monthly_rent}</p>
    </div>
  );
}
