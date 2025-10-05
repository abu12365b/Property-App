type Props = {
  description: string;
  category: string;
  amount: number;
};

export default function ExpenseCard({ description, category, amount }: Props) {
  return (
    <div className="border rounded p-4 shadow">
      <h2 className="font-bold">{description}</h2>
      <p>Category: {category}</p>
      <p>Amount: ${amount}</p>
    </div>
  );
}
