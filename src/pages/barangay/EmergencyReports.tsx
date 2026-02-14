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
import { Eye, MapPin, Calendar, User, AlertCircle, Phone, FileImage, ChevronLeft, ChevronRight } from 'lucide-react';
import { TableSkeleton } from '@/components/ui/table-skeleton';

interface EmergencyReport {
  id: string;
  name: string;
  contactNumber: string;
  barangay: string;
  location: string;
  symptoms: string[];
  customSymptom?: string;
  description: string;
  proofImageUrl?: string;
  status: string;
  createdAt: any;
}

export default function EmergencyReports() {
  const [reports, setReports] = useState<EmergencyReport[]>([]);
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
      const querySnapshot = await getDocs(collection(db, 'emergencyReports'));
      const reportsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as EmergencyReport));
      setReports(reportsData);
    } catch (error) {
      console.error('Error fetching emergency reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredReports = reports.filter(report =>
    report.name?.toLowerCase().includes(filter.toLowerCase()) ||
    report.barangay?.toLowerCase().includes(filter.toLowerCase()) ||
    report.contactNumber?.includes(filter)
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
        <h1 className="text-3xl font-bold mb-6 text-red-600 flex items-center gap-2">
          <AlertCircle className="h-8 w-8" />
          Emergency Reports
        </h1>
        <div className="mb-4">
          <Input placeholder="Search..." disabled className="max-w-sm" />
        </div>
        <div className="border">
          <TableSkeleton rows={10} columns={7} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6 text-red-600 flex items-center gap-2">
        <AlertCircle className="h-8 w-8" />
        Emergency Reports
      </h1>
      
      <div className="mb-4">
        <Input
          placeholder="Search by name, barangay, or contact number..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
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
                <TableCell className="font-medium">{report.name}</TableCell>
                <TableCell>{report.contactNumber}</TableCell>
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
                    className={report.status === 'Resolved' ? 'bg-green-600 hover:bg-green-700' : report.status === 'Pending' ? 'bg-red-600 hover:bg-red-700 text-white' : ''}
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
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-6 w-6" />
                          Emergency Report Details
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-6">
                        {/* Reporter Information */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Reporter Information
                          </h3>
                          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                            <div className="flex items-start gap-2">
                              <User className="h-4 w-4 mt-1 text-gray-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Name</p>
                                <p className="text-base">{report.name}</p>
                              </div>
                            </div>
                            <div className="flex items-start gap-2">
                              <Phone className="h-4 w-4 mt-1 text-gray-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Contact Number</p>
                                <p className="text-base">+63 {report.contactNumber}</p>
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
                              <AlertCircle className="h-4 w-4 mt-1 text-gray-500" />
                              <div>
                                <p className="text-sm font-semibold text-gray-600">Status</p>
                                <Badge 
                                  variant={
                                    report.status === 'Resolved' ? 'default' :
                                    report.status === 'Rejected' ? 'destructive' : 'secondary'
                                  }
                                  className={report.status === 'Resolved' ? 'bg-green-600' : report.status === 'Pending' ? 'bg-red-600 text-white' : ''}
                                >
                                  {report.status || 'Pending'}
                                </Badge>
                              </div>
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
                              <p className="text-sm font-semibold text-gray-600">Barangay</p>
                              <p className="text-base">{report.barangay}</p>
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-gray-600">Location</p>
                              <p className="text-base">{report.location}</p>
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

                        {/* Description */}
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Description</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-base">{report.description}</p>
                          </div>
                        </div>

                        {/* Proof Image */}
                        {report.proofImageUrl && (
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <FileImage className="h-5 w-5" />
                              Proof Image
                            </h3>
                            <div className="border rounded-lg p-4">
                              <img 
                                src={report.proofImageUrl} 
                                alt="Proof" 
                                className="w-full rounded border max-h-96 object-contain"
                              />
                            </div>
                          </div>
                        )}
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
