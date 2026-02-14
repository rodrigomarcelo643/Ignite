import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Menu, User, LogOut } from 'lucide-react';
import Logo from "@/assets/logo/logo.png";
import LoginDialog from './LoginForm/LoginDialog';
export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="border-b border-gray-200 shadow-sm fixed w-full z-10 bg-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl px-3 font-bold">
          <img src={Logo} alt="Logo" className="h-22 w-22" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex flex-1 justify-center ">
          <NavigationMenu>
            <NavigationMenuList className="gap-2">
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} text-base font-medium hover:text-[#51BDEB] transition-colors`}>
                  <Link to="/">Home</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} text-base font-medium hover:text-[#51BDEB] transition-colors`}>
                  <Link to="/about">About</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} text-base font-medium hover:text-[#51BDEB] transition-colors`}>
                  <Link to="/services">Services</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={`${navigationMenuTriggerStyle()} text-base font-medium hover:text-[#51BDEB] transition-colors`}>
                  <Link to="/pricing">Pricing</Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Desktop Auth Buttons */}
        <div className="hidden lg:flex gap-2 p-2">
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-3 h-12 px-4 border-2 border-gray-200 hover:border-[#51BDEB] hover:bg-[#51BDEB]/5 transition-all">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#51BDEB] to-[#20A0D8] flex items-center justify-center text-white shadow-md">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-500 font-normal">Welcome back</span>
                    <span className="font-semibold text-sm">{user?.username}</span>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.username}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role} Account</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate(user?.role === 'barangay' ? '/barangay/dashboard' : '/citizen/dashboard')} className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Dashboard
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600 focus:text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <LoginDialog>
                <Button className="border-2 py-3 px-6 border-[#51BDEB] shadow-lg" variant="ghost">
                  Sign In
                </Button>
              </LoginDialog>
              <Button className="border-2 py-3 px-6 border-[#51BDEB] shadow-lg" asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-20 w-20" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-4 ">
            <div className="flex flex-col gap-4 mt-8">
              <Link to="/" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-[#51BDEB] transition-colors py-2">
                Home
              </Link>
              <Link to="/about" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-[#51BDEB] transition-colors py-2">
                About
              </Link>
              <Link to="/services" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-[#51BDEB] transition-colors py-2">
                Services
              </Link>
              <Link to="/contact" onClick={() => setOpen(false)} className="text-lg font-medium hover:text-[#51BDEB] transition-colors py-2">
                Map
              </Link>
              <div className="flex flex-col gap-3 mt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center gap-3 p-3 border-2 border-[#51BDEB] rounded-lg bg-[#51BDEB]/5">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#51BDEB] to-[#20A0D8] flex items-center justify-center text-white shadow-md">
                        <User className="h-6 w-6" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-gray-500">Logged in as</span>
                        <span className="font-semibold">{user?.username}</span>
                        <span className="text-xs text-gray-500 capitalize">{user?.role}</span>
                      </div>
                    </div>
                    <Button onClick={() => { navigate(user?.role === 'barangay' ? '/barangay/dashboard' : '/citizen/dashboard'); setOpen(false); }} className="bg-[#51BDEB] hover:bg-[#20A0D8]">
                      <User className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                    <Button variant="outline" onClick={() => { handleLogout(); setOpen(false); }} className="border-red-200 text-red-600 hover:bg-red-50">
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <LoginDialog>
                      <Button className="border-2 border-[#51BDEB] shadow-lg" variant="ghost">
                        Sign In
                      </Button>
                    </LoginDialog>
                    <Button className="border-2 border-[#51BDEB] shadow-lg" asChild>
                      <Link to="/register" onClick={() => setOpen(false)}>Register</Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}
