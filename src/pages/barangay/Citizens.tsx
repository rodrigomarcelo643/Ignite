import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
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
import { Eye, User, Mail, Phone, Calendar, MapPin, CreditCard, FileImage, Camera, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { TableSkeleton } from '@/components/ui/table-skeleton';

interface Citizen {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  contactNumber: string;
  barangay: string;
  city: string;
  province: string;
  birthdate: string;
  idType: string;
  idImageUrl?: string;
  selfieUrl?: string;
  sitioPurok?: string;
  status: string;
  createdAt: string;
  role?: string;
}

export default function Citizens() {
  const [citizens, setCitizens] = useState<Citizen[]>([]);
  const [filter, setFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const { isLoading, setIsLoading } = useLoading();

  useEffect(() => {
    fetchCitizens();
  }, []);

  const fetchCitizens = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const citizensData = querySnapshot.docs
        .map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Citizen))
        .filter(user => !user.role || user.role === 'citizen');
      setCitizens(citizensData);
    } catch (error) {
      console.error('Error fetching citizens:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (citizenId: string) => {
    try {
      await updateDoc(doc(db, 'users', citizenId), { status: 'Approved' });
      setCitizens(citizens.map(c => c.id === citizenId ? { ...c, status: 'Approved' } : c));
    } catch (error) {
      console.error('Error approving citizen:', error);
    }
  };

  const handleReject = async (citizenId: string) => {
    try {
      await updateDoc(doc(db, 'users', citizenId), { status: 'Rejected' });
      setCitizens(citizens.map(c => c.id === citizenId ? { ...c, status: 'Rejected' } : c));
    } catch (error) {
      console.error('Error rejecting citizen:', error);
    }
  };

  const handleCancel = async (citizenId: string) => {
    try {
      await updateDoc(doc(db, 'users', citizenId), { status: 'Pending' });
      setCitizens(citizens.map(c => c.id === citizenId ? { ...c, status: 'Pending' } : c));
    } catch (error) {
      console.error('Error canceling approval:', error);
    }
  };

  const filteredCitizens = citizens.filter(citizen =>
    citizen.fullName?.toLowerCase().includes(filter.toLowerCase()) ||
    citizen.email?.toLowerCase().includes(filter.toLowerCase()) ||
    citizen.barangay?.toLowerCase().includes(filter.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCitizens.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCitizens = filteredCitizens.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  if (isLoading) {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Citizens Management</h1>
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
      <h1 className="text-3xl font-bold mb-6">Citizens Management</h1>
      
      <div className="mb-4">
        <Input
          placeholder="Search by name, email, or barangay..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <div className="border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Full Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Barangay</TableHead>
              <TableHead>ID Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCitizens.map((citizen) => (
              <TableRow key={citizen.id}>
                <TableCell className="font-medium">{citizen.fullName}</TableCell>
                <TableCell>{citizen.email}</TableCell>
                <TableCell>{citizen.contactNumber}</TableCell>
                <TableCell>{citizen.barangay}</TableCell>
                <TableCell>{citizen.idType}</TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      citizen.status === 'Approved' ? 'default' :
                      citizen.status === 'Rejected' ? 'destructive' : 'secondary'
                    }
                    className={citizen.status === 'Approved' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {citizen.status || 'Pending'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto" style={{ width: '95vw' }}>
                        <DialogHeader>
                          <DialogTitle className="text-2xl">Citizen Registration Details</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-6">
                          {/* Personal Information */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <User className="h-5 w-5" />
                              Personal Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start gap-2">
                                <User className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Full Name</p>
                                  <p className="text-base">{citizen.fullName}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Calendar className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Birthdate</p>
                                  <p className="text-base">{citizen.birthdate}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Email</p>
                                  <p className="text-base">{citizen.email}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Contact Number</p>
                                  <p className="text-base">{citizen.contactNumber}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Address Information */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <MapPin className="h-5 w-5" />
                              Address Information
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Barangay</p>
                                  <p className="text-base">{citizen.barangay}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">City</p>
                                  <p className="text-base">{citizen.city}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">Province</p>
                                  <p className="text-base">{citizen.province}</p>
                                </div>
                              </div>
                              <div className="flex items-start gap-2">
                                <CreditCard className="h-4 w-4 mt-1 text-gray-500" />
                                <div>
                                  <p className="text-sm font-semibold text-gray-600">ID Type</p>
                                  <p className="text-base">{citizen.idType}</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Documents */}
                          <div>
                            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                              <FileImage className="h-5 w-5" />
                              Submitted Documents
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                              {citizen.idImageUrl && (
                                <div className="border rounded-lg p-4">
                                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <CreditCard className="h-4 w-4" />
                                    ID Image
                                  </p>
                                  <img src={citizen.idImageUrl} alt="ID" className="w-full rounded border" />
                                </div>
                              )}
                              {citizen.selfieUrl && (
                                <div className="border rounded-lg p-4">
                                  <p className="text-sm font-semibold mb-2 flex items-center gap-2">
                                    <Camera className="h-4 w-4" />
                                    Selfie Photo
                                  </p>
                                  <img src={citizen.selfieUrl} alt="Selfie" className="w-full rounded border" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          {(!citizen.status || citizen.status === 'Pending') && (
                            <div className="flex gap-3 pt-4 border-t">
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button className="flex-1">
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Approve Registration
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to approve the registration for {citizen.fullName}? This action will grant them access to the system.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleApprove(citizen.id)}>
                                      Approve
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                              <Button
                                variant="destructive"
                                onClick={() => handleReject(citizen.id)}
                                className="flex-1"
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject Registration
                              </Button>
                            </div>
                          )}
                        </div>
                      </DialogContent>
                    </Dialog>
                    {(!citizen.status || citizen.status === 'Pending') ? (
                      <>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm">
                              Approve
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirm Approval</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to approve {citizen.fullName}'s registration?
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleApprove(citizen.id)}>
                                Approve
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(citizen.id)}
                        >
                          Reject
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCancel(citizen.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4">
        <p className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(endIndex, filteredCitizens.length)} of {filteredCitizens.length} citizens
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
