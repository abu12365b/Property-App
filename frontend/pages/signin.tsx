import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="flex flex-col items-center min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8">
      {/* Big dashboard title with a little shadow */}
      <h1 className="text-4xl font-extrabold mb-8 text-gray-800 drop-shadow-lg tracking-tight">
        🏡 Property Dashboard
      </h1>

      {/* Card container for navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 w-full max-w-4xl">
        <DashboardCard
          href="/properties"
          color="bg-blue-500"
          icon="🏠"
          label="Properties"
        />
        <DashboardCard
          href="/tenants"
          color="bg-green-500"
          icon="🧑‍💼"
          label="Tenants"
        />
        <DashboardCard
          href="/expenses"
          color="bg-red-500"
          icon="💸"
          label="Expenses"
        />
        <DashboardCard
          href="/payments"
          color="bg-yellow-500"
          icon="💳"
          label="Payments"
        />
        <DashboardCard
          href="/financials"
          color="bg-purple-500"
          icon="📊"
          label="Financials"
        />
      </div>

      {/* Footer for extra style */}
      <footer className="mt-16 text-gray-500 text-sm opacity-80">
        Made with{" "}
        <span className="text-pink-500" aria-label="heart" role="img">
          ♥
        </span>{" "}
        for property management
      </footer>
    </main>
  );
}

// Card component for dashboard links
function DashboardCard({
  href,
  color,
  icon,
  label,
}: {
  href: string;
  color: string;
  icon: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center justify-center ${color} text-white rounded-xl shadow-lg hover:scale-105 transition-transform duration-200 p-8 cursor-pointer`}
      style={{ minHeight: "140px" }}
    >
      <span className="text-4xl mb-2" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xl font-semibold">{label}</span>
    </Link>
  );
}