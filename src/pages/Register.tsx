import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { registerUser } from '@/services/auth/authService';
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <img src={Logo} alt="Logo" className="w-20 h-20 mx-auto mb-4" />
          <CardTitle className="text-center text-2xl">Create Account</CardTitle>
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
              <Button className="w-full bg-[#51BDEB]" onClick={() => handleRegister('citizen')} disabled={loading}>
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
              <Button className="w-full bg-[#51BDEB]" onClick={() => handleRegister('barangay')} disabled={loading}>
                Register as Barangay Official
              </Button>
            </TabsContent>
          </Tabs>

          <div className="text-center text-sm text-muted-foreground mt-4">
            Already have an account? <a href="/" className="text-[#51BDEB] hover:underline">Sign In</a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
