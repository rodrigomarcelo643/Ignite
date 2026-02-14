import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger 
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useAuth } from '@/context/AuthContext';
import { AlertCircle } from 'lucide-react';
import Logo from "@/assets/logo/logo.png";
import PhFlag from "@/assets/flags/ph.svg";

export default function LoginDialog({ children }: { children: React.ReactNode }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSignIn = async (role: 'barangay' | 'citizen') => {
        if (!username || !password) return;
        
        setError('');
        try {
            await login(username, password, role);
            setOpen(false);
            
            if (role === 'barangay') {
                navigate('/barangay/dashboard');
            } else {
                navigate('/citizen/dashboard');
            }
        } catch (error) {
            setError((error as Error).message);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <img src={Logo} alt="Logo" className="w-40 h-40 mx-auto mb-2" />
                    <DialogTitle className="text-center text-2xl font-bold">Welcome Back</DialogTitle>
                    <p className="text-center text-sm text-muted-foreground">Sign in to your account</p>
                </DialogHeader>
                
                <Tabs defaultValue="citizen" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="citizen">Citizen</TabsTrigger>
                        <TabsTrigger value="barangay">Barangay</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="citizen" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="citizen-phone">Mobile Number</Label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                    <img src={PhFlag} alt="PH" className="w-6 h-4 rounded-sm" />
                                    <span className="text-sm font-medium">+63</span>
                                    <span className="text-gray-300">|</span>
                                </div>
                                <Input 
                                    id="citizen-phone" 
                                    placeholder="9319887714" 
                                    value={username}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, '');
                                        if (value.length <= 10) setUsername(value);
                                        setError('');
                                    }}
                                    maxLength={10}
                                    className="pl-24"
                                />
                            </div>
                            <p className="text-xs text-muted-foreground">Enter 10-digit mobile number</p>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="citizen-password">Password</Label>
                            <Input 
                                id="citizen-password" 
                                type="password" 
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                        <Button 
                            className="w-full bg-[#51BDEB] hover:bg-[#51BDEB]/90" 
                            onClick={() => handleSignIn('citizen')}
                        >
                            Sign In as Citizen
                        </Button>
                    </TabsContent>
                    
                    <TabsContent value="barangay" className="space-y-4 mt-4">
                        <div className="space-y-2">
                            <Label htmlFor="barangay-username">Username</Label>
                            <Input 
                                id="barangay-username" 
                                placeholder="Enter your username" 
                                value={username}
                                onChange={(e) => {
                                    setUsername(e.target.value);
                                    setError('');
                                }}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="barangay-password">Password</Label>
                            <Input 
                                id="barangay-password" 
                                type="password" 
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => {
                                    setPassword(e.target.value);
                                    setError('');
                                }}
                            />
                        </div>
                        {error && (
                            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                                <AlertCircle className="h-4 w-4" />
                                <span>{error}</span>
                            </div>
                        )}
                        <Button 
                            className="w-full bg-[#51BDEB] hover:bg-[#51BDEB]/90" 
                            onClick={() => handleSignIn('barangay')}
                        >
                            Sign In as Barangay Health Official
                        </Button>
                    </TabsContent>
                </Tabs>
                
                <div className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account? <a href="/register" className="text-[#51BDEB] hover:underline">Register</a>
                </div>
            </DialogContent>
        </Dialog>
    );
}