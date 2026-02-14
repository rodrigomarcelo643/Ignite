import { Home, Users, FileText, LogOut, AlertTriangle, User, ChevronDown,LayoutDashboard, ClipboardList, Map , MapPin, Bell } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import Logo from "@/assets/logo/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
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

export default function SidebarBarangay() {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const menuItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/barangay/dashboard' },
        { icon: Users, label: 'Citizens', path: '/barangay/citizens' },
        { icon: MapPin, label: 'Health Map', path: '/barangay/map' },
        { icon: Bell, label: 'Outbreak Alerts', path: '/barangay/alerts' },
    ];

    return (
        <Sidebar collapsible="offcanvas" className="border-r">
            <SidebarHeader className="border-b">
                <div className="flex justify-center items-center px-4 py-6">
                    <img src={Logo} alt="Logo" className="h-24 w-24" />
                </div>
            </SidebarHeader>
            
            <SidebarContent className="px-3 py-4">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu className="space-y-2">
                            {menuItems.map((item) => {
                                const isActive = location.pathname === item.path;
                                return (
                                    <SidebarMenuItem key={item.path}>
                                        <SidebarMenuButton 
                                            asChild 
                                            className={`h-10 pl-3 transition-colors ${
                                                isActive 
                                                    ? 'bg-[#51BDEB] text-white hover:bg-[#51BDEB] hover:text-white' 
                                                    : 'hover:bg-[#51BDEB]/10 hover:text-[#51BDEB]'
                                            }`}
                                        >
                                            <Link to={item.path} className="flex items-center gap-3">
                                                <item.icon className="h-5 w-5" />
                                                <span className="font-medium">{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                );
                            })}
                            
                            <Collapsible asChild defaultOpen={location.pathname.includes('/barangay/reports')}>
                                <SidebarMenuItem>
                                    <CollapsibleTrigger asChild>
                                        <SidebarMenuButton className="h-12 hover:bg-[#51BDEB]/10 hover:text-[#51BDEB] transition-colors">
                                            <ClipboardList className="h-5 w-5" />
                                            <span className="font-medium">Reports</span>
                                            <ChevronDown className="ml-auto h-4 w-4 transition-transform group-data-[state=open]:rotate-180" />
                                        </SidebarMenuButton>
                                    </CollapsibleTrigger>
                                    <CollapsibleContent>
                                        <SidebarMenuSub>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton 
                                                    asChild
                                                    className={`text-xs ${location.pathname === '/barangay/reports' ? 'bg-[#51BDEB]/20 text-[#51BDEB]' : ''}`}
                                                >
                                                    <Link to="/barangay/reports">
                                                        <span>Normal Reports</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton 
                                                    asChild
                                                    className={`text-xs ${location.pathname === '/barangay/emergency-reports' ? 'bg-[#51BDEB]/20 text-[#51BDEB]' : ''}`}
                                                >
                                                    <Link to="/barangay/emergency-reports">
                                                        <span>Emergency Reports</span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </SidebarMenuSub>
                                    </CollapsibleContent>
                                </SidebarMenuItem>
                            </Collapsible>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-2">
                <div className="mb-2">
                    <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-[#51BDEB]/10 to-[#20A0D8]/10 rounded-lg border border-[#51BDEB]/20">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#51BDEB] to-[#20A0D8] flex items-center justify-center text-white shadow-md flex-shrink-0">
                            <User className="h-5 w-5" />
                        </div>
                        <div className="flex flex-col min-w-0">
                            <span className="text-xs text-gray-500 font-normal"></span>
                            <span className="font-semibold text-sm truncate">{user?.username}</span>
                            <span className="text-xs text-gray-500 capitalize">{user?.role} Health Official</span>
                        </div>
                    </div>
                </div>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <SidebarMenuButton 
                                    className="h-11 text-red-600 hover:text-red-700 flex justify-center hover:bg-red-50 border border-red-200 transition-colors"
                                >
                                    <LogOut className="h-5 w-5" />
                                    <span className="font-medium">Logout</span>
                                </SidebarMenuButton>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to logout? You will need to sign in again to access your account.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
                                        Logout
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}