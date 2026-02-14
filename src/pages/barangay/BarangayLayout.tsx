import { Routes, Route } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import Sidebar from '@/components/Barangay/SidebarBarangay';
import Dashboard from './Dashboard';
import Citizens from './Citizens';
import Reports from './Reports';
import EmergencyReports from './EmergencyReports';
import Map from './Map';
import Alerts from './Alerts';

export default function BarangayLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <div className="lg:hidden p-4 border-b">
            <SidebarTrigger />
          </div>
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/citizens" element={<Citizens />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/emergency-reports" element={<EmergencyReports />} />
            <Route path="/analytics" element={<div className="p-8"><h1 className="text-3xl font-bold">Analytics</h1></div>} />
            <Route path="/map" element={<Map />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/settings" element={<div className="p-8"><h1 className="text-3xl font-bold">Settings</h1></div>} />
          </Routes>
        </main>
      </div>
    </SidebarProvider>
  );
}
