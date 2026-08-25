import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <main className="min-h-screen bg-gray-950 text-gray-100 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">APM SYN</h1>
        <p className="text-gray-400 mb-8">Assets Portfolio Manager Synchronization</p>
        <Link
          to="/app"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Open App
        </Link>
      </div>
    </main>
  );
}
