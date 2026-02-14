import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { registerUser } from '@/services/auth/authService';
import { motion } from 'framer-motion';
import Logo from '@/assets/logo/logo.png';

export default function Register() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    department: '',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (role: 'barangay' | 'citizen') => {
    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await registerUser({ ...formData, role });
      alert('Registration successful!');
      navigate('/');
    } catch (error) {
      alert('Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white min-h-screen flex items-center justify-center pt-24 pb-12 px-4 relative overflow-hidden">
      {/* Spiral Background Lines */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="registerSpiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#51BDEB" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#20A0D8" stopOpacity="0.05" />
            </linearGradient>
          </defs>
          <path d="M 0,300 Q 200,100 400,300 T 800,300" stroke="url(#registerSpiralGradient)" strokeWidth="2" fill="none" />
          <path d="M 100,500 Q 300,300 500,500 T 900,500" stroke="url(#registerSpiralGradient)" strokeWidth="2" fill="none" />
          <path d="M -100,200 Q 100,50 300,200 T 700,200" stroke="url(#registerSpiralGradient)" strokeWidth="1.5" fill="none" />
          <circle cx="20%" cy="20%" r="150" stroke="#51BDEB" strokeWidth="1" fill="none" opacity="0.1" />
          <circle cx="80%" cy="70%" r="200" stroke="#20A0D8" strokeWidth="1" fill="none" opacity="0.08" />
          <circle cx="90%" cy="30%" r="100" stroke="#51BDEB" strokeWidth="1" fill="none" opacity="0.1" />
        </svg>
      </div>

      <div className="container mx-auto px-4 relative ">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-md mx-auto"
        >
          <Card className="border-2 border-[#51BDEB]/20 shadow-xl">
            <CardHeader>
              <img src={Logo} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
              <CardTitle className="text-center text-3xl font-bold">
                Create <span className="text-[#51BDEB]">Account</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="citizen">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="citizen">Citizen</TabsTrigger>
                  <TabsTrigger value="barangay">Barangay</TabsTrigger>
                </TabsList>

                <TabsContent value="citizen" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="citizen-fullName">Full Name</Label>
                    <Input id="citizen-fullName" name="fullName" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-username">Username</Label>
                    <Input id="citizen-username" name="username" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-email">Email</Label>
                    <Input id="citizen-email" name="email" type="email" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-password">Password</Label>
                    <Input id="citizen-password" name="password" type="password" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="citizen-confirmPassword">Confirm Password</Label>
                    <Input id="citizen-confirmPassword" name="confirmPassword" type="password" onChange={handleChange} />
                  </div>
                  <Button className="w-full bg-[#51BDEB] hover:bg-[#20A0D8]" onClick={() => handleRegister('citizen')} disabled={loading}>
                    Register as Citizen
                  </Button>
                </TabsContent>

                <TabsContent value="barangay" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gov-fullName">Full Name</Label>
                    <Input id="gov-fullName" name="fullName" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gov-username">Username</Label>
                    <Input id="gov-username" name="username" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gov-email">Email</Label>
                    <Input id="gov-email" name="email" type="email" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gov-department">Department</Label>
                    <Input id="gov-department" name="department" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gov-password">Password</Label>
                    <Input id="gov-password" name="password" type="password" onChange={handleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gov-confirmPassword">Confirm Password</Label>
                    <Input id="gov-confirmPassword" name="confirmPassword" type="password" onChange={handleChange} />
                  </div>
                  <Button className="w-full bg-[#51BDEB] hover:bg-[#20A0D8]" onClick={() => handleRegister('barangay')} disabled={loading}>
                    Register as Barangay Official
                  </Button>
                </TabsContent>
              </Tabs>

              <div className="text-center text-sm text-muted-foreground mt-4">
                Already have an account? <a href="/" className="text-[#51BDEB] hover:underline">Sign In</a>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
