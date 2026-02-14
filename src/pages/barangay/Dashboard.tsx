import { useState, useEffect } from 'react';
import { Users, FileText, AlertTriangle, MapPin, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { db } from '@/config/firebase';
import { collection, getDocs } from 'firebase/firestore';

export default function BarangayDashboard() {
  const [stats, setStats] = useState({
    totalCitizens: 0,
    symptomReports: 0,
    emergencyReports: 0,
    totalReports: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch users count
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        
        // Fetch symptom reports count
        const symptomReportsRef = collection(db, 'symptomReports');
        const symptomReportsSnapshot = await getDocs(symptomReportsRef);
        
        // Fetch emergency reports count
        const emergencyReportsRef = collection(db, 'emergencyReports');
        const emergencyReportsSnapshot = await getDocs(emergencyReportsRef);

        const totalReports = symptomReportsSnapshot.size + emergencyReportsSnapshot.size;

        setStats({
          totalCitizens: usersSnapshot.size,
          symptomReports: symptomReportsSnapshot.size,
          emergencyReports: emergencyReportsSnapshot.size,
          totalReports: totalReports,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Citizens',
      value: loading ? '...' : stats.totalCitizens,
      icon: Users,
      color: 'text-[#51BDEB]',
      bgColor: 'bg-[#51BDEB]/10',
    },
    {
      title: 'Symptom Reports',
      value: loading ? '...' : stats.symptomReports,
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Emergency Reports',
      value: loading ? '...' : stats.emergencyReports,
      icon: AlertTriangle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
    {
      title: 'Total Reports',
      value: loading ? '...' : stats.totalReports,
      icon: Activity,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Barangay Dashboard</h1>
        <p className="text-gray-600 mt-2">Overview of your community health monitoring system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat, index) => (
          <Card key={index} className="border-2 border-gray-100 hover:shadow-lg transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#51BDEB]" />
              Health Map
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">View all health incidents on the interactive map</p>
            <a href="/barangay/map" className="text-[#51BDEB] hover:underline font-medium">Go to Map →</a>
          </CardContent>
        </Card>

        <Card className="border-2 border-gray-100">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-[#51BDEB]" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <a href="/barangay/citizens" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">Manage Citizens</p>
              <p className="text-sm text-gray-600">View and manage citizen records</p>
            </a>
            <a href="/barangay/reports" className="block p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <p className="font-medium text-gray-900">View Reports</p>
              <p className="text-sm text-gray-600">Check all health reports</p>
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
