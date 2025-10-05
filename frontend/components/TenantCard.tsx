type Props = {
  name: string;
  unit_number: string;
  monthly_rent: number;
};

export default function TenantCard({ name, unit_number, monthly_rent }: Props) {
  return (
    <div className="border rounded p-4 shadow">
      <h2 className="font-bold">{name}</h2>
      <p>Unit: {unit_number}</p>
      <p>Rent: ${monthly_rent}</p>
    </div>
  );
}
