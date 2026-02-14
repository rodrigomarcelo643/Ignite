import { useEffect, useState } from 'react';
import { db } from '@/config/firebase';
import { collection, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AlertTriangle, Calendar, TrendingUp, Plus, X, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface Alert {
  id: string;
  barangay: string;
  affectedPercentage: number;
  totalPopulation: number;
  reportCount: number;
  commonSymptoms: string[];
  possibleDiseases: Array<{ name: string; accuracy: string }>;
  aiAnalysis: string;
  severity: 'critical' | 'high' | 'moderate';
  status: 'pending' | 'processing' | 'completed';
  createdAt: string;
  announcement?: string;
  procedures?: string[];
  preventiveMeasures?: string[];
  completedAt?: string;
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'processing' | 'completed'>('all');
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [responseData, setResponseData] = useState({
    announcement: '',
    procedures: [''],
    preventiveMeasures: ['']
  });
  const [editData, setEditData] = useState({
    announcement: '',
    procedures: [''],
    preventiveMeasures: ['']
  });

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const alertsRef = collection(db, 'barangayAlerts');
      const q = query(alertsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const alertsData: Alert[] = [];
      snapshot.forEach((doc) => {
        alertsData.push({ id: doc.id, ...doc.data() } as Alert);
      });
      
      setAlerts(alertsData);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAlertStatus = async (alertId: string, status: 'processing' | 'completed', data?: any) => {
    try {
      const alertRef = doc(db, 'barangayAlerts', alertId);
      await updateDoc(alertRef, {
        status,
        ...data,
        ...(status === 'completed' && { completedAt: new Date().toISOString() })
      });
      await fetchAlerts();
      setSuccessMessage(`${status} successfully!`);
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error updating alert:', error);
      setSuccessMessage('Failed to update alert');
      setShowSuccessDialog(true);
    }
  };

  const updateAlertData = async () => {
    if (!selectedAlert) return;
    try {
      const alertRef = doc(db, 'barangayAlerts', selectedAlert.id);
      await updateDoc(alertRef, {
        announcement: editData.announcement,
        procedures: editData.procedures.filter(p => p.trim() !== ''),
        preventiveMeasures: editData.preventiveMeasures.filter(p => p.trim() !== '')
      });
      await fetchAlerts();
      setShowEditModal(false);
      setSuccessMessage('updated successfully!');
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error updating alert:', error);
      setSuccessMessage('Failed to update alert');
      setShowSuccessDialog(true);
    }
  };

  const deleteAlert = async () => {
    if (!selectedAlert) return;
    try {
      await deleteDoc(doc(db, 'barangayAlerts', selectedAlert.id));
      await fetchAlerts();
      setShowDeleteDialog(false);
      setSuccessMessage('deleted successfully!');
      setShowSuccessDialog(true);
    } catch (error) {
      console.error('Error deleting alert:', error);
      setSuccessMessage('Failed to delete alert');
      setShowSuccessDialog(true);
    }
  };

  const filteredAlerts = filter === 'all' ? alerts : alerts.filter(a => a.status === filter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'processing': return 'bg-orange-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'high': return 'bg-orange-600';
      case 'moderate': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Potential Outbreak Alerts</h1>
        <p className="text-sm text-gray-600">Monitor and manage outbreak alerts across barangays</p>
      </div>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'all' ? 'bg-[#51BDEB] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({alerts.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({alerts.filter(a => a.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('processing')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'processing' ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Processing ({alerts.filter(a => a.status === 'processing').length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            filter === 'completed' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed ({alerts.filter(a => a.status === 'completed').length})
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-8 h-8 border-4 border-[#51BDEB]/30 border-t-[#51BDEB] rounded-full animate-spin"></div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No {filter !== 'all' ? filter : ''} alerts found
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAlerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg border-2 border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-6 w-6 text-red-500" />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{alert.barangay}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">
                        {new Date(alert.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Badge className={getSeverityColor(alert.severity)}>
                    {alert.severity.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(alert.status)}>
                    {alert.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-red-600">{alert.affectedPercentage}%</p>
                  <p className="text-xs text-gray-600">Affected Rate</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-800">{alert.reportCount}</p>
                  <p className="text-xs text-gray-600">Reports</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <p className="text-2xl font-bold text-gray-800">{alert.totalPopulation}</p>
                  <p className="text-xs text-gray-600">Citizens</p>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-semibold text-gray-800 mb-2">Common Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {alert.commonSymptoms.map((symptom, idx) => (
                    <Badge key={idx} variant="secondary">{symptom}</Badge>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-[#51BDEB]" />
                  <p className="text-sm font-semibold text-gray-800">Possible Diseases:</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {alert.possibleDiseases.map((disease, idx) => (
                    <div key={idx} className="bg-gray-50 px-3 py-1 rounded-lg border border-gray-200">
                      <span className="font-semibold text-sm">{disease.name}</span>
                      <span className="text-[#51BDEB] text-sm ml-2">{disease.accuracy}</span>
                    </div>
                  ))}
                </div>
              </div>

              {alert.status !== 'pending' && (
                <div className="border-t pt-4 mt-4 space-y-3">
                  {alert.announcement && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">Announcement:</p>
                      <p className="text-sm text-gray-700">{alert.announcement}</p>
                    </div>
                  )}
                  {alert.procedures && alert.procedures.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">Procedures:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {alert.procedures.map((proc, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{proc}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  {alert.preventiveMeasures && alert.preventiveMeasures.length > 0 && (
                    <div>
                      <p className="text-sm font-semibold text-gray-800 mb-1">Preventive Measures:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        {alert.preventiveMeasures.map((measure, idx) => (
                          <li key={idx} className="text-sm text-gray-700">{measure}</li>
                        ))}
                      </ol>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setEditData({
                          announcement: alert.announcement || '',
                          procedures: alert.procedures || [''],
                          preventiveMeasures: alert.preventiveMeasures || ['']
                        });
                        setShowEditModal(true);
                      }}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      onClick={() => {
                        setSelectedAlert(alert);
                        setShowDeleteDialog(true);
                      }}
                      variant="destructive"
                      size="sm"
                      className="flex-1"
                    >
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              )}

              {alert.status === 'pending' && (
                <div className="border-t pt-4 mt-4">
                  <Button
                    onClick={() => {
                      setSelectedAlert(alert);
                      setShowResponseModal(true);
                    }}
                    className="w-full bg-[#51BDEB] hover:bg-[#20A0D8]"
                  >
                    Initiate Response
                  </Button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Response Modal */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <AlertTriangle className="h-6 w-6 text-orange-600" />
              Outbreak Response Procedures
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="announcement" className="text-base font-semibold">Public Announcement</Label>
              <textarea
                id="announcement"
                value={responseData.announcement}
                onChange={(e) => setResponseData({ ...responseData, announcement: e.target.value })}
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51BDEB] focus:border-transparent"
                placeholder="Enter public announcement message..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Response Procedures</Label>
                <Button
                  type="button"
                  onClick={() => setResponseData({ ...responseData, procedures: [...responseData.procedures, ''] })}
                  size="sm"
                  className="bg-[#51BDEB] hover:bg-[#20A0D8]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
              {responseData.procedures.map((procedure, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 block">Step {index + 1}</Label>
                    <Input
                      value={procedure}
                      onChange={(e) => {
                        const newProcedures = [...responseData.procedures];
                        newProcedures[index] = e.target.value;
                        setResponseData({ ...responseData, procedures: newProcedures });
                      }}
                      placeholder={`Enter step ${index + 1}...`}
                    />
                  </div>
                  {responseData.procedures.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const newProcedures = responseData.procedures.filter((_, i) => i !== index);
                        setResponseData({ ...responseData, procedures: newProcedures });
                      }}
                      variant="destructive"
                      size="icon"
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Preventive Measures</Label>
                <Button
                  type="button"
                  onClick={() => setResponseData({ ...responseData, preventiveMeasures: [...responseData.preventiveMeasures, ''] })}
                  size="sm"
                  className="bg-[#51BDEB] hover:bg-[#20A0D8]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Measure
                </Button>
              </div>
              {responseData.preventiveMeasures.map((measure, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 block">Measure {index + 1}</Label>
                    <Input
                      value={measure}
                      onChange={(e) => {
                        const newMeasures = [...responseData.preventiveMeasures];
                        newMeasures[index] = e.target.value;
                        setResponseData({ ...responseData, preventiveMeasures: newMeasures });
                      }}
                      placeholder={`Enter measure ${index + 1}...`}
                    />
                  </div>
                  {responseData.preventiveMeasures.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const newMeasures = responseData.preventiveMeasures.filter((_, i) => i !== index);
                        setResponseData({ ...responseData, preventiveMeasures: newMeasures });
                      }}
                      variant="destructive"
                      size="icon"
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={async () => {
                  if (selectedAlert) {
                    await updateAlertStatus(selectedAlert.id, 'processing', {
                      announcement: responseData.announcement,
                      procedures: responseData.procedures.filter(p => p.trim() !== ''),
                      preventiveMeasures: responseData.preventiveMeasures.filter(p => p.trim() !== '')
                    });
                    setShowResponseModal(false);
                    setResponseData({ announcement: '', procedures: [''], preventiveMeasures: [''] });
                  }
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Save as Processing
              </Button>
              <Button
                onClick={async () => {
                  if (!responseData.announcement.trim()) {
                    setSuccessMessage('Please enter an announcement');
                    setShowSuccessDialog(true);
                    return;
                  }
                  if (responseData.procedures.filter(p => p.trim()).length === 0) {
                    setSuccessMessage('Please add at least one procedure step');
                    setShowSuccessDialog(true);
                    return;
                  }
                  if (responseData.preventiveMeasures.filter(p => p.trim()).length === 0) {
                    setSuccessMessage('Please add at least one preventive measure');
                    setShowSuccessDialog(true);
                    return;
                  }
                  if (selectedAlert) {
                    await updateAlertStatus(selectedAlert.id, 'completed', {
                      announcement: responseData.announcement,
                      procedures: responseData.procedures.filter(p => p.trim() !== ''),
                      preventiveMeasures: responseData.preventiveMeasures.filter(p => p.trim() !== '')
                    });
                    setShowResponseModal(false);
                    setResponseData({ announcement: '', procedures: [''], preventiveMeasures: [''] });
                  }
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Complete Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Edit className="h-6 w-6 text-[#51BDEB]" />
              Edit Outbreak Alert
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-announcement" className="text-base font-semibold">Public Announcement</Label>
              <textarea
                id="edit-announcement"
                value={editData.announcement}
                onChange={(e) => setEditData({ ...editData, announcement: e.target.value })}
                className="w-full min-h-[100px] p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#51BDEB] focus:border-transparent"
                placeholder="Enter public announcement message..."
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Response Procedures</Label>
                <Button
                  type="button"
                  onClick={() => setEditData({ ...editData, procedures: [...editData.procedures, ''] })}
                  size="sm"
                  className="bg-[#51BDEB] hover:bg-[#20A0D8]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Step
                </Button>
              </div>
              {editData.procedures.map((procedure, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 block">Step {index + 1}</Label>
                    <Input
                      value={procedure}
                      onChange={(e) => {
                        const newProcedures = [...editData.procedures];
                        newProcedures[index] = e.target.value;
                        setEditData({ ...editData, procedures: newProcedures });
                      }}
                      placeholder={`Enter step ${index + 1}...`}
                    />
                  </div>
                  {editData.procedures.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const newProcedures = editData.procedures.filter((_, i) => i !== index);
                        setEditData({ ...editData, procedures: newProcedures });
                      }}
                      variant="destructive"
                      size="icon"
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-base font-semibold">Preventive Measures</Label>
                <Button
                  type="button"
                  onClick={() => setEditData({ ...editData, preventiveMeasures: [...editData.preventiveMeasures, ''] })}
                  size="sm"
                  className="bg-[#51BDEB] hover:bg-[#20A0D8]"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Measure
                </Button>
              </div>
              {editData.preventiveMeasures.map((measure, index) => (
                <div key={index} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <Label className="text-sm text-gray-600 mb-1 block">Measure {index + 1}</Label>
                    <Input
                      value={measure}
                      onChange={(e) => {
                        const newMeasures = [...editData.preventiveMeasures];
                        newMeasures[index] = e.target.value;
                        setEditData({ ...editData, preventiveMeasures: newMeasures });
                      }}
                      placeholder={`Enter measure ${index + 1}...`}
                    />
                  </div>
                  {editData.preventiveMeasures.length > 1 && (
                    <Button
                      type="button"
                      onClick={() => {
                        const newMeasures = editData.preventiveMeasures.filter((_, i) => i !== index);
                        setEditData({ ...editData, preventiveMeasures: newMeasures });
                      }}
                      variant="destructive"
                      size="icon"
                      className="mt-6"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 pt-4 border-t">
              <Button
                onClick={() => setShowEditModal(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={updateAlertData}
                className="flex-1 bg-[#51BDEB] hover:bg-[#20A0D8]"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Potential Outbreak Alert
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">
            Are you sure you want to delete this outbreak alert? This action cannot be undone.
            All data including announcement, procedures, and preventive measures will be permanently removed.
          </p>
          <div className="flex gap-3 justify-end">
            <Button onClick={() => setShowDeleteDialog(false)} variant="outline">
              Cancel
            </Button>
            <Button onClick={deleteAlert} className="bg-red-600 hover:bg-red-700">
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Notification
            </DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600 py-4">{successMessage}</p>
          <div className="flex justify-end">
            <Button onClick={() => setShowSuccessDialog(false)} className="bg-[#51BDEB] hover:bg-[#20A0D8]">
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
