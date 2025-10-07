export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white p-4 flex justify-between">
      <h1 className="text-lg font-bold">Property App</h1>
      <ul className="flex gap-4">
        <li><a href="/" className="hover:underline">Home</a></li>
        <li><a href="/about" className="hover:underline">About</a></li>
        <li><a href="/contact" className="hover:underline">Contact</a></li>
      </ul>
    </nav>
  );
}