// app/dashboard/layout.js
export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen flex">
      <aside className="w-64 bg-gray-700 text-white p-4">
        <h2 className="text-xl font-bold">User Dashboard</h2>
        <ul>
          <li>
            <a href="/dashboard" className="block py-2">
              Home
            </a>
          </li>
          <li>
            <a href="/dashboard/profile" className="block py-2">
              Profile
            </a>
          </li>
        </ul>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
