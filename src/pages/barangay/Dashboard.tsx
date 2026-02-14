

export default function BarangayDashboard() {
  return (
    <div className="flex h-screen">

      <main className="flex-1 p-8 overflow-auto">
        <h1 className="text-3xl font-bold mb-6">Barangay Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Citizens</h3>
            <p className="text-3xl font-bold text-[#51BDEB]">1,234</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Active Reports</h3>
            <p className="text-3xl font-bold text-[#51BDEB]">56</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Health Alerts</h3>
            <p className="text-3xl font-bold text-[#51BDEB]">12</p>
          </div>
        </div>
      </main>
    </div>
  );
}
