import { useRouter } from "next/router";

export default function SignupPage() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back(); // Navigate to the previous page
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white p-8 rounded-lg shadow-lg text-center">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Sign Up</h1>
        <p className="text-gray-600 mb-6">Currently not accepting signups.</p>
        <button
          onClick={handleGoBack}
          className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    </main>
  );
}