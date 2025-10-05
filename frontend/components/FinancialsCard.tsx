type Props = {
  category: string;
  amount: number;
};

export default function FinancialCard({ category, amount }: Props) {
  return (
    <div className="border rounded p-4 shadow">
      <h2 className="font-bold">{category}</h2>
      <p>Amount: ${amount}</p>
    </div>
  );
}
