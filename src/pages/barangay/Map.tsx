import { useEffect, useState } from 'react';
import { GoogleMap, useJsApiLoader, OverlayView } from '@react-google-maps/api';
import { db } from '@/config/firebase';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MapPin, Calendar, User, AlertTriangle, FileText, Brain, TrendingUp, Bell, Plus, X, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const mapContainerStyle = {
  width: '100%',
  height: 'calc(100vh - 280px)',
};

const center = {
  lat: 10.3157,
  lng: 123.8854,
};

interface MarkerData {
  id: string;
  lat: number;
  lng: number;
  type: 'symptom' | 'emergency';
  location: string;
  barangay?: string;
  contactNumber?: string;
  name?: string;
  description?: string;
  symptoms?: string[];
  customSymptom?: string;
  status?: string;
  createdAt?: any;
  severity: 'high' | 'medium' | 'low';
  userId?: string;
}

interface AIAnalysis {
  possibleDiseases: Array<{ name: string; accuracy: string }>;
  confidence: string;
  recommendations: string[];
  patterns: string;
  loading: boolean;
  citizensReported?: number;
  citizensNotReported?: number;
  totalCitizens?: number;
  emergencyReports?: number;
}

interface OutbreakAlert {
  barangay: string;
  affectedPercentage: number;
  totalPopulation: number;
  reportCount: number;
  commonSymptoms: string[];
  aiAnalysis: string;
  possibleDiseases: Array<{ name: string; accuracy: string }>;
  severity: 'critical' | 'high' | 'moderate';
}

export default function Map() {
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [filteredMarkers, setFilteredMarkers] = useState<MarkerData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMarker, setSelectedMarker] = useState<MarkerData | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [analyzingProgress, setAnalyzingProgress] = useState(0);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [outbreakAlert, setOutbreakAlert] = useState<OutbreakAlert | null>(null);
  const [showOutbreakAlert, setShowOutbreakAlert] = useState(false);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseData, setResponseData] = useState({
    announcement: '',
    procedures: [''],
    preventiveMeasures: ['']
  });

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_PUBLIC_GOOGLE_MAPS_API_KEY,
    preventGoogleFontsLoading: true,
  });

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const symptomReportsRef = collection(db, 'symptomReports');
        const emergencyReportsRef = collection(db, 'emergencyReports');
        
        const [symptomSnapshot, emergencySnapshot] = await Promise.all([
          getDocs(symptomReportsRef),
          getDocs(emergencyReportsRef),
        ]);
        
        const markerData: MarkerData[] = [];
        const symptomCounts: { [key: string]: number } = {};
        
        symptomSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.symptoms && Array.isArray(data.symptoms)) {
            data.symptoms.forEach((symptom: string) => {
              symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
            });
          }
        });
        
        const counts = Object.values(symptomCounts);
        const maxCount = Math.max(...counts, 1);
        const highThreshold = maxCount * 0.6;
        const mediumThreshold = maxCount * 0.3;
        
        symptomSnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.latitude && data.longitude) {
            let severity: 'high' | 'medium' | 'low' = 'low';
            
            if (data.symptoms && Array.isArray(data.symptoms)) {
              const maxSymptomCount = Math.max(...data.symptoms.map((s: string) => symptomCounts[s] || 0));
              if (maxSymptomCount >= highThreshold) severity = 'high';
              else if (maxSymptomCount >= mediumThreshold) severity = 'medium';
            }
            
            markerData.push({
              id: doc.id,
              lat: data.latitude,
              lng: data.longitude,
              type: 'symptom',
              location: data.location || 'Unknown Location',
              barangay: data.barangay,
              symptoms: data.symptoms,
              customSymptom: data.customSymptom,
              status: data.status,
              createdAt: data.createdAt,
              severity,
              userId: data.userId,
            });
          }
        });
        
        emergencySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data.latitude && data.longitude) {
            markerData.push({
              id: doc.id,
              lat: data.latitude,
              lng: data.longitude,
              type: 'emergency',
              location: data.location || 'Unknown Location',
              barangay: data.barangay,
              contactNumber: data.contactNumber,
              name: data.name,
              description: data.description,
              symptoms: data.symptoms,
              customSymptom: data.customSymptom,
              status: data.status,
              createdAt: data.createdAt,
              severity: 'high',
              userId: data.userId,
            });
          }
        });
        
        setMarkers(markerData);
        setFilteredMarkers(markerData);
        
        // Check for outbreak patterns and save to database
        await checkOutbreakPatterns(markerData);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const checkOutbreakPatterns = async (markerData: MarkerData[]) => {
    try {
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      const barangayPopulation: { [key: string]: number } = {};
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId && data.userId.startsWith('USER_') && data.barangay && data.status === 'Approved') {
          barangayPopulation[data.barangay] = (barangayPopulation[data.barangay] || 0) + 1;
        }
      });

      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      // Fetch ALL reports including those without coordinates
      const symptomReportsRef = collection(db, 'symptomReports');
      const emergencyReportsRef = collection(db, 'emergencyReports');
      const [symptomSnapshot, emergencySnapshot] = await Promise.all([
        getDocs(symptomReportsRef),
        getDocs(emergencyReportsRef),
      ]);

      const allReports: any[] = [];
      symptomSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          try {
            const reportDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            if (reportDate >= oneWeekAgo) {
              allReports.push({ id: doc.id, ...data });
            }
          } catch {}
        }
      });
      
      emergencySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.createdAt) {
          try {
            const reportDate = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt);
            if (reportDate >= oneWeekAgo) {
              allReports.push({ id: doc.id, ...data });
            }
          } catch {}
        }
      });

      const barangayReports: { [key: string]: any[] } = {};
      allReports.forEach((report) => {
        if (report.barangay) {
          if (!barangayReports[report.barangay]) {
            barangayReports[report.barangay] = [];
          }
          barangayReports[report.barangay].push(report);
        }
      });

      for (const [barangay, reports] of Object.entries(barangayReports)) {
        const population = barangayPopulation[barangay];
        
        if (!population || population === 0 || reports.length === 0) continue;
        
        const uniqueUserIds = new Set(
          reports.map(r => r.userId || r.id)
        );
        const affectedCitizens = uniqueUserIds.size;
        
        if (affectedCitizens === 0) continue;
        
        const affectedPercentage = (affectedCitizens / population) * 100;

        // Dynamic threshold based on population size
        let populationThreshold = 70;
        if (population <= 10) {
          populationThreshold = 60; // Lower threshold for small populations
        } else if (population <= 50) {
          populationThreshold = 65;
        }

        const symptomCounts: { [key: string]: number } = {};
        reports.forEach(report => {
          report.symptoms?.forEach((symptom: string) => {
            symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
          });
        });
        
        const sortedSymptoms = Object.entries(symptomCounts).sort((a, b) => b[1] - a[1]);
        const mostCommonSymptomCount = sortedSymptoms[0]?.[1] || 0;
        const symptomPatternPercentage = (mostCommonSymptomCount / reports.length) * 100;
        
        console.log(`[Outbreak Check] ${barangay}: ${affectedCitizens}/${population} (${affectedPercentage.toFixed(1)}%) | Pattern: ${symptomPatternPercentage.toFixed(1)}% | Threshold: ${populationThreshold}%`);
        
        // Only consider pattern if affected rate > 50%
        const isOutbreak = affectedPercentage >= populationThreshold || 
                          (affectedPercentage > 50 && symptomPatternPercentage >= 85);

        if (isOutbreak) {
          const commonSymptoms = sortedSymptoms
            .slice(0, 5)
            .map(([symptom]) => symptom);

          const aiAnalysisText = await getOutbreakAnalysis(barangay, commonSymptoms, affectedCitizens, population);
          const diseases = await getPossibleDiseases(commonSymptoms);

          const alertData = {
            barangay,
            affectedPercentage: Math.round(affectedPercentage * 10) / 10,
            totalPopulation: population,
            reportCount: affectedCitizens,
            commonSymptoms,
            aiAnalysis: aiAnalysisText,
            possibleDiseases: diseases,
            severity: affectedPercentage >= 90 || symptomPatternPercentage >= 95 ? 'critical' : 'high',
          };

          // Show modal - don't save to database yet
          setOutbreakAlert(alertData);
          setShowOutbreakAlert(true);
          break;
        }
      }
    } catch (error) {
      console.error('Outbreak check error:', error);
    }
  };

  const getOutbreakAnalysis = async (barangay: string, symptoms: string[], reportCount: number, population: number): Promise<string> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a public health expert. Provide a brief outbreak analysis in 2-3 sentences focusing on urgency and immediate actions needed.'
            },
            {
              role: 'user',
              content: `OUTBREAK ALERT: ${barangay} has ${reportCount} affected out of ${population} citizens (${Math.min(Math.round((reportCount/population)*100), 100)}%). Common symptoms: ${symptoms.join(', ')}. Provide immediate analysis.`
            }
          ],
          temperature: 0.7,
          max_tokens: 150,
        }),
      });

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error) {
      return 'Immediate health intervention required. Contact DOH for outbreak response protocol.';
    }
  };

  const getPossibleDiseases = async (symptoms: string[]): Promise<Array<{ name: string; accuracy: string }>> => {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a medical expert. Respond ONLY with valid JSON, no markdown. Format: [{"name":"Disease Name","accuracy":"85%"},{"name":"Disease Name 2","accuracy":"70%"}]. List top 3 most likely diseases.'
            },
            {
              role: 'user',
              content: `Based on these outbreak symptoms: ${symptoms.join(', ')}, what are the most likely diseases with accuracy percentages?`
            }
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      });

      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      return JSON.parse(content);
    } catch (error) {
      return [{ name: 'Unknown', accuracy: 'N/A' }];
    }
  };

  useEffect(() => {
    if (severityFilter === 'all') {
      setFilteredMarkers(markers);
    } else {
      setFilteredMarkers(markers.filter(m => m.severity === severityFilter));
    }
  }, [severityFilter, markers]);

  const analyzePatterns = async () => {
    setIsAnalyzing(true);
    setShowAnalysis(true);
    setAnalyzingProgress(0);
    setAiAnalysis(null);

    const progressInterval = setInterval(() => {
      setAnalyzingProgress(prev => prev >= 90 ? 90 : prev + 10);
    }, 300);

    try {
      // Get total approved citizens
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);
      let totalCitizens = 0;
      
      usersSnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.userId && data.userId.startsWith('USER_') && data.status === 'Approved') {
          totalCitizens++;
        }
      });

      // Count unique citizens who reported and emergency reports
      const uniqueReporters = new Set(
        markers
          .filter(m => m.userId)
          .map(m => m.userId)
      );
      const citizensReported = uniqueReporters.size;
      const citizensNotReported = totalCitizens - citizensReported;
      const emergencyReports = markers.filter(m => m.type === 'emergency').length;

      // Check for outbreak after getting citizen data
      await checkOutbreakPatterns(markers);

      const symptomsList = markers
        .filter(m => m.symptoms && m.symptoms.length > 0)
        .map(m => m.symptoms?.join(', '))
        .join('; ');

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_PUBLIC_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a public health expert. Respond ONLY with valid JSON, no markdown formatting. Format: {"possibleDiseases":[{"name":"disease1","accuracy":"85%"},{"name":"disease2","accuracy":"70%"}],"confidence":"overall percentage","recommendations":["rec1","rec2","rec3"],"patterns":"description"}'
            },
            {
              role: 'user',
              content: `Analyze these community health symptoms and identify disease patterns: ${symptomsList}. Total reports: ${markers.length}, Emergency reports: ${emergencyReports}`
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        }),
      });

      const data = await response.json();
      let content = data.choices[0].message.content.trim();
      content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const analysis = JSON.parse(content);
      
      clearInterval(progressInterval);
      setAnalyzingProgress(100);
      
      setTimeout(() => {
        setAiAnalysis({ 
          ...analysis, 
          loading: false,
          citizensReported,
          citizensNotReported,
          totalCitizens,
          emergencyReports
        });
        setIsAnalyzing(false);
      }, 500);
    } catch (error) {
      console.error('AI Analysis Error:', error);
      clearInterval(progressInterval);
      setAnalyzingProgress(100);
      setIsAnalyzing(false);
      setAiAnalysis({
        possibleDiseases: [{ name: 'Analysis unavailable', accuracy: 'N/A' }],
        confidence: 'Unable to analyze',
        recommendations: ['Please try again later'],
        patterns: 'Error occurred during analysis',
        loading: false
      });
    }
  };

  const handleMarkerClick = (marker: MarkerData) => {
    setSelectedMarker(marker);
    setDialogOpen(true);
  };

  const exportAnalysisReport = () => {
    if (!aiAnalysis) return;

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const reportContent = `
HEALTH PATTERN ANALYSIS REPORT
Generated: ${reportDate}

========================================
CITIZEN STATISTICS
========================================
Total Citizens: ${aiAnalysis.totalCitizens || 'N/A'}
Citizens Reported: ${aiAnalysis.citizensReported || 'N/A'}
Citizens Not Reported: ${aiAnalysis.citizensNotReported || 'N/A'}
Total Reports: ${markers.length}
Emergency Reports (Anonymous): ${aiAnalysis.emergencyReports || 0}

========================================
POSSIBLE DISEASES
========================================
${aiAnalysis.possibleDiseases.map((d, i) => `${i + 1}. ${d.name} - ${d.accuracy}`).join('\n')}

========================================
ANALYSIS DETAILS
========================================
Confidence Level: ${aiAnalysis.confidence}
Pattern Description: ${aiAnalysis.patterns}

========================================
RECOMMENDATIONS
========================================
${aiAnalysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

========================================
END OF REPORT
========================================
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Health_Pattern_Analysis_${new Date().getTime()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getColorForSymptoms = (symptoms?: string[], type?: string) => {
    if (type === 'emergency') return '#EF4444';
    if (!symptoms || symptoms.length === 0) return '#51BDEB';
    
    const symptomStr = symptoms.join(' ').toLowerCase();
    
    if (symptomStr.includes('fever') || symptomStr.includes('temperature')) return '#FF6B6B';
    if (symptomStr.includes('cough') || symptomStr.includes('breathing')) return '#4ECDC4';
    if (symptomStr.includes('headache') || symptomStr.includes('dizziness')) return '#9B59B6';
    if (symptomStr.includes('chest') || symptomStr.includes('heart')) return '#E74C3C';
    if (symptomStr.includes('fatigue') || symptomStr.includes('weakness')) return '#F39C12';
    
    return '#51BDEB';
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  const saveOutbreakAlert = async (status: 'pending' | 'processing' | 'completed') => {
    if (!outbreakAlert) return;

    try {
      const alertData = {
        barangay: outbreakAlert.barangay,
        affectedPercentage: outbreakAlert.affectedPercentage,
        totalPopulation: outbreakAlert.totalPopulation,
        reportCount: outbreakAlert.reportCount,
        commonSymptoms: outbreakAlert.commonSymptoms,
        possibleDiseases: outbreakAlert.possibleDiseases,
        aiAnalysis: outbreakAlert.aiAnalysis,
        severity: outbreakAlert.severity,
        status,
        createdAt: new Date().toISOString(),
        ...(status !== 'pending' && {
          announcement: responseData.announcement,
          procedures: responseData.procedures.filter(p => p.trim() !== ''),
          preventiveMeasures: responseData.preventiveMeasures.filter(p => p.trim() !== ''),
          ...(status === 'completed' && { completedAt: new Date().toISOString() })
        })
      };

      const alertsRef = collection(db, 'barangayAlerts');
      await addDoc(alertsRef, alertData);
      
      alert(`Outbreak alert ${status === 'pending' ? 'acknowledged' : status === 'processing' ? 'initiated' : 'completed'} successfully!`);
    } catch (error) {
      console.error('Error saving outbreak alert:', error);
      alert('Failed to save outbreak alert');
    }
  };

  return (
    <div className="h-full w-full">
      <style>{`
        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
        .animate-ping {
          animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
      <div className="p-6 border-b bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Health Map</h1>
            <p className="text-sm text-gray-600 mt-1">Filter by severity and click markers for details</p>
          </div>
          <button
            onClick={analyzePatterns}
            disabled={markers.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-[#51BDEB] text-white rounded-lg hover:bg-[#20A0D8] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Brain className="h-4 w-4" />
            AI Pattern Analysis
          </button>
        </div>
        
        <div className="mt-4 mb-3">
          <p className="text-sm font-medium text-gray-700 mb-2">Severity Filter:</p>
          <Select value={severityFilter} onValueChange={setSeverityFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="high">High Severity</SelectItem>
              <SelectItem value="medium">Medium Severity</SelectItem>
              <SelectItem value="low">Low Severity</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" style={{ color: '#FF6B6B' }} />
            <span className="text-xs text-gray-600">Fever</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" style={{ color: '#4ECDC4' }} />
            <span className="text-xs text-gray-600">Respiratory</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" style={{ color: '#EF4444' }} />
            <span className="text-xs text-gray-600">Emergency</span>
          </div>
        </div>
      </div>

      {showAnalysis && (
        <Dialog open={showAnalysis} onOpenChange={setShowAnalysis}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6 text-[#51BDEB]" />
                AI Pattern Analysis
              </DialogTitle>
            </DialogHeader>

            {isAnalyzing ? (
              <div className="py-8 space-y-6">
                <div className="flex flex-col items-center gap-4">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle cx="64" cy="64" r="56" stroke="#E5E7EB" strokeWidth="8" fill="none" />
                      <circle
                        cx="64" cy="64" r="56" stroke="#51BDEB" strokeWidth="8" fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - analyzingProgress / 100)}`}
                        className="transition-all duration-300"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-[#51BDEB]">{analyzingProgress}%</span>
                    </div>
                  </div>
                  <p className="text-lg font-medium text-gray-700">Analyzing symptom patterns...</p>
                  <p className="text-sm text-gray-500">Processing {markers.length} health reports</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-6 py-4">
                {/* Export Button */}
                <div className="flex justify-end">
                  <Button
                    onClick={exportAnalysisReport}
                    className="bg-[#51BDEB] hover:bg-[#20A0D8]"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export Report
                  </Button>
                </div>

                {/* Citizen Statistics */}
                {aiAnalysis.totalCitizens !== undefined && (
                  <div>
                    <div className="grid grid-cols-4 gap-4 mb-3">
                      <div className="bg-[#51BDEB]/10 rounded-lg p-4 text-center border border-[#51BDEB]/30">
                        <p className="text-3xl font-bold text-[#51BDEB]">{aiAnalysis.totalCitizens}</p>
                        <p className="text-xs text-gray-600 mt-1">Total Citizens</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                        <p className="text-3xl font-bold text-green-600">{aiAnalysis.citizensReported}</p>
                        <p className="text-xs text-gray-600 mt-1">Reported Symptoms</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
                        <p className="text-3xl font-bold text-gray-600">{aiAnalysis.citizensNotReported}</p>
                        <p className="text-xs text-gray-600 mt-1">No Reports</p>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                        <p className="text-3xl font-bold text-red-600">{aiAnalysis.emergencyReports || 0}</p>
                        <p className="text-xs text-gray-600 mt-1">Emergency (Anonymous)</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 italic mb-4">
                      Note: {aiAnalysis.citizensReported} {aiAnalysis.citizensReported === 1 ? 'citizen has' : 'citizens have'} submitted {markers.length} total {markers.length === 1 ? 'report' : 'reports'} (some citizens may have multiple reports). Emergency reports are anonymous and not linked to specific citizens.
                    </p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <TrendingUp className="h-5 w-5 text-[#51BDEB]" />
                        <h4 className="font-semibold text-gray-800 text-lg">Possible Diseases</h4>
                      </div>
                      <div className="space-y-2">
                        {aiAnalysis.possibleDiseases.map((disease, idx) => (
                          <div key={idx} className="flex items-center justify-between bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
                            <span className="font-semibold text-gray-800">{disease.name}</span>
                            <Badge className="bg-[#51BDEB]">{disease.accuracy}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-[#51BDEB]/10 p-4 rounded-lg border border-[#51BDEB]/30">
                      <p className="text-sm text-gray-700"><span className="font-semibold">Confidence:</span> {aiAnalysis.confidence}</p>
                      <p className="text-sm text-gray-700 mt-2"><span className="font-semibold">Pattern:</span> {aiAnalysis.patterns}</p>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800 text-lg mb-3">Recommendations</h4>
                    <ul className="space-y-3">
                      {aiAnalysis.recommendations.map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-gray-50 p-3 rounded-lg border border-gray-200">
                          <span className="text-[#51BDEB] font-bold mt-0.5">{idx + 1}.</span>
                          <span className="text-sm text-gray-700">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ) : null}
          </DialogContent>
        </Dialog>
      )}

      <div className="p-6">
        <div className="w-full rounded-lg border-2 border-gray-300 overflow-hidden">
          {!isLoaded ? (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] bg-gray-100">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-[#51BDEB]/30 border-t-[#51BDEB] rounded-full animate-spin"></div>
              </div>
              <p className="text-gray-600 mt-4 font-medium">Loading map...</p>
            </div>
          ) : (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={center}
              zoom={13}
            >
              {filteredMarkers.map((marker, index) => {
                  const color = getColorForSymptoms(marker.symptoms, marker.type);
                  
                  return (
                    <OverlayView
                      key={index}
                      position={{ lat: marker.lat, lng: marker.lng }}
                      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
                    >
                      <div 
                        className="relative cursor-pointer"
                        onClick={() => handleMarkerClick(marker)}
                        style={{ transform: 'translate(-50%, -100%)' }}
                      >
                        <div 
                          className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full animate-ping"
                          style={{ 
                            backgroundColor: color,
                            opacity: 0.75
                          }}
                        />
                        <div className="relative">
                          <MapPin 
                            className="w-8 h-8 drop-shadow-lg" 
                            style={{ 
                              color: color,
                              fill: color,
                              stroke: 'white',
                              strokeWidth: 1
                            }}
                          />
                        </div>
                      </div>
                    </OverlayView>
                  );
                })}
            </GoogleMap>
          )}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedMarker?.type === 'emergency' ? (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              ) : (
                <FileText className="h-5 w-5 text-[#51BDEB]" />
              )}
              {selectedMarker?.type === 'emergency' ? 'Emergency Report' : 'Symptom Report'}
              <Badge 
                className={`ml-auto ${
                  selectedMarker?.severity === 'high' ? 'bg-red-500' :
                  selectedMarker?.severity === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                }`}
              >
                {selectedMarker?.severity?.toUpperCase()}
              </Badge>
            </DialogTitle>
          </DialogHeader>
          {selectedMarker && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                <div>
                  <p className="text-sm font-medium text-gray-700">Location</p>
                  <p className="text-sm text-gray-600">{selectedMarker.location}</p>
                  {selectedMarker.barangay && (
                    <p className="text-xs text-gray-500">Barangay: {selectedMarker.barangay}</p>
                  )}
                </div>
              </div>

              {selectedMarker.name && (
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-gray-500 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">Reporter</p>
                    <p className="text-sm text-gray-600">{selectedMarker.name}</p>
                    {selectedMarker.contactNumber && (
                      <p className="text-xs text-gray-500">Contact: {selectedMarker.contactNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedMarker.description && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Description</p>
                  <p className="text-sm text-gray-600">{selectedMarker.description}</p>
                </div>
              )}

              {selectedMarker.symptoms && selectedMarker.symptoms.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Symptoms</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedMarker.symptoms.map((symptom, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {symptom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedMarker.customSymptom && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Additional Symptoms</p>
                  <p className="text-sm text-gray-600">{selectedMarker.customSymptom}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <p className="text-xs text-gray-500">{formatDate(selectedMarker.createdAt)}</p>
                </div>
                {selectedMarker.status && (
                  <Badge 
                    variant={selectedMarker.status === 'Pending' ? 'outline' : 'default'}
                    className={selectedMarker.status === 'Pending' ? 'text-yellow-600 border-yellow-600' : ''}
                  >
                    {selectedMarker.status}
                  </Badge>
                )}
              </div>
            </motion.div>
          )}
        </DialogContent>
      </Dialog>

      {/* Outbreak Alert Modal */}
      <Dialog open={showOutbreakAlert} onOpenChange={setShowOutbreakAlert}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-4 border-red-500">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: [0.9, 1.05, 1] }}
            transition={{ duration: 0.5, repeat: 3 }}
          >
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3 text-2xl">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 10, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
                >
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </motion.div>
                <span className="text-red-600">POTENTIAL OUTBREAK ALERT</span>
              </DialogTitle>
            </DialogHeader>
            {outbreakAlert && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 mt-4 pb-4"
              >
                <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{outbreakAlert.barangay}</h3>
                    <Badge className={`text-lg px-4 py-1 ${
                      outbreakAlert.severity === 'critical' ? 'bg-red-600' :
                      outbreakAlert.severity === 'high' ? 'bg-orange-600' : 'bg-yellow-600'
                    }`}>
                      {outbreakAlert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-red-600">{outbreakAlert.affectedPercentage}%</p>
                      <p className="text-xs text-gray-600">Affected Rate</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-gray-800">{outbreakAlert.reportCount}</p>
                      <p className="text-xs text-gray-600">Reports</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 text-center">
                      <p className="text-3xl font-bold text-gray-800">{outbreakAlert.totalPopulation}</p>
                      <p className="text-xs text-gray-600">Citizens</p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Common Symptoms:</p>
                    <div className="flex flex-wrap gap-2">
                      {outbreakAlert.commonSymptoms.map((symptom, idx) => (
                        <Badge key={idx} className="bg-red-500">{symptom}</Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-800 mb-2">Possible Diseases:</p>
                    <div className="space-y-2">
                      {outbreakAlert.possibleDiseases.map((disease, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white rounded-lg p-3">
                          <span className="font-semibold text-gray-800">{disease.name}</span>
                          <Badge className="bg-orange-600">{disease.accuracy}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className="h-5 w-5 text-[#51BDEB]" />
                      <p className="font-semibold text-gray-800">AI Analysis:</p>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{outbreakAlert.aiAnalysis}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={async () => {
                      if (outbreakAlert) {
                        await saveOutbreakAlert('pending');
                        setShowOutbreakAlert(false);
                      }
                    }}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Acknowledge Alert
                  </button>
                  <button
                    onClick={() => {
                      setShowOutbreakAlert(false);
                      setShowResponseModal(true);
                    }}
                    className="flex-1 px-4 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                  >
                    Initiate Response
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </DialogContent>
      </Dialog>

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
                  await saveOutbreakAlert('processing');
                  setShowResponseModal(false);
                }}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                Save as Processing
              </Button>
              <Button
                onClick={async () => {
                  if (!responseData.announcement.trim()) {
                    alert('Please enter an announcement');
                    return;
                  }
                  if (responseData.procedures.filter(p => p.trim()).length === 0) {
                    alert('Please add at least one procedure step');
                    return;
                  }
                  if (responseData.preventiveMeasures.filter(p => p.trim()).length === 0) {
                    alert('Please add at least one preventive measure');
                    return;
                  }
                  await saveOutbreakAlert('completed');
                  setShowResponseModal(false);
                  setResponseData({ announcement: '', procedures: [''], preventiveMeasures: [''] });
                }}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Complete Response
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
