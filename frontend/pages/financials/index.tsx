// components/Financials/Financials.tsx
import React from "react";

type Financial = {
  id: number;
  category: string;
  amount: number;
  recurring: boolean;
};

type Props = {
  financials: Financial[];
};

export default function Financials({ financials }: Props) {
  return (
    <div className="bg-white shadow rounded p-4">
      <h2 className="text-xl font-bold mb-4">Financials</h2>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b">
            <th className="p-2">Category</th>
            <th className="p-2">Amount</th>
            <th className="p-2">Recurring</th>
          </tr>
        </thead>
        <tbody>
          {financials.map((f) => (
            <tr key={f.id} className="border-b">
              <td className="p-2">{f.category}</td>
              <td className="p-2">${f.amount.toFixed(2)}</td>
              <td className="p-2">{f.recurring ? "Yes" : "No"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
