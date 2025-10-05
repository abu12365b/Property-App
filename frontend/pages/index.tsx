// pages/index.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Property Dashboard</h1>
      <div className="flex gap-4">
        <Link href="/properties" className="p-4 bg-blue-500 text-white rounded">Properties</Link>
        <Link href="/tenants" className="p-4 bg-green-500 text-white rounded">Tenants</Link>
        <Link href="/expenses" className="p-4 bg-red-500 text-white rounded">Expenses</Link>
        <Link href="/payments" className="p-4 bg-yellow-500 text-white rounded">Payments</Link>
      </div>
    </main>
  );
}
