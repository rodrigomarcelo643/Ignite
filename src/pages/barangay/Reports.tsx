import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useLoading } from '@/context/LoadingContext';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Eye, MapPin, Calendar, User, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';

interface SymptomReport {
  id: string;
  userId: string;
  barangay: string;
  symptoms: string[];
  customSymptom?: string;
  location: string;
  latitude: number;
  longitude: number;
  status: string;
  createdAt: any;
}

export default function Reports() {
  const [reports, setReports] = useState<SymptomReport[]>([]);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { isLoading, setIsLoading } = useLoading();

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'symptomReports'));
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as SymptomReport));
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.barangay?.toLowerCase().includes(filter.toLowerCase()) ||
    report.location?.toLowerCase().includes(filter.toLowerCase()) ||
    report.userId?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = filteredReports.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Symptom Reports</h1>
        <div className="mb-4">
          <Input placeholder="Search..." disabled className="max-w-sm" />
        </div>
        <div className="border">
          <TableSkeleton rows={10} columns={6} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Symptom Reports</h1>
      
      <div className="mb-4">
        <Input
          placeholder="Search by barangay, location, or user ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User ID</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>Symptoms</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedReports.map((report) => (
              <TableRow key={report.id}>
                <TableCell className="font-medium">{report.userId}</TableCell>
                <TableCell>{report.barangay}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {report.symptoms?.slice(0, 2).map((symptom, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                    {report.symptoms?.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{report.symptoms.length - 2}
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate">{report.location}</TableCell>
                <TableCell>{formatDate(report.createdAt)}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      report.status === 'Resolved' ? 'default' :
                      report.status === 'Rejected' ? 'destructive' : 'secondary'
                    }
                    className={report.status === 'Resolved' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {report.status || 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl">Symptom Report Details</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Report Information */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <AlertCircle className="h-5 w-5" />
                            Report Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 mt-1 text-gray-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-600">User ID</p>
                                <p className="text-base">{report.userId}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 mt-1 text-gray-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Reported Date</p>
                                <p className="text-base">{formatDate(report.createdAt)}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Barangay</p>
                                <p className="text-base">{report.barangay}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <AlertCircle className="h-4 w-4 mt-1 text-gray-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Status</p>
                                <Badge 
                                  variant={
                                    report.status === 'Resolved' ? 'default' :
                                    report.status === 'Rejected' ? 'destructive' : 'secondary'
                                  }
                                  className={report.status === 'Resolved' ? 'bg-green-600' : ''}
                                >
                                  {report.status || 'Pending'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Symptoms */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Reported Symptoms</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex flex-wrap gap-2">
                              {report.symptoms?.map((symptom, idx) => (
                                <Badge key={idx} variant="outline" className="text-sm">
                                  {symptom}
                                </Badge>
                              ))}
                              {report.customSymptom && (
                                <Badge variant="outline" className="text-sm bg-blue-50">
                                  {report.customSymptom}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Location */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location Details
                          </h3>
                          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Address</p>
                              <p className="text-base">{report.location}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Latitude</p>
                                <p className="text-base">{report.latitude}</p>
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Longitude</p>
                                <p className="text-base">{report.longitude}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredReports.length)} of {filteredReports.length} reports
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(page)}
                className="w-10"
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
