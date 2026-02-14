import { Button } from './ui/button';
import { Heart, Shield, Activity, Users } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
    return (
        <div className="bg-white min-h-screen flex items-center justify-center py-12 relative overflow-hidden">
            {/* Spiral Background Lines */}
            <div className="absolute inset-0 pointer-events-none">
                <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="spiralGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#51BDEB" stopOpacity="0.1" />
                            <stop offset="100%" stopColor="#20A0D8" stopOpacity="0.05" />
                        </linearGradient>
                    </defs>
                    <path d="M 0,300 Q 200,100 400,300 T 800,300" stroke="url(#spiralGradient)" strokeWidth="2" fill="none" />
                    <path d="M 100,500 Q 300,300 500,500 T 900,500" stroke="url(#spiralGradient)" strokeWidth="2" fill="none" />
                    <path d="M -100,200 Q 100,50 300,200 T 700,200" stroke="url(#spiralGradient)" strokeWidth="1.5" fill="none" />
                    <circle cx="20%" cy="20%" r="150" stroke="#51BDEB" strokeWidth="1" fill="none" opacity="0.1" />
                    <circle cx="80%" cy="70%" r="200" stroke="#20A0D8" strokeWidth="1" fill="none" opacity="0.08" />
                    <circle cx="90%" cy="30%" r="100" stroke="#51BDEB" strokeWidth="1" fill="none" opacity="0.1" />
                </svg>
            </div>
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 lg:gap-20 items-center max-w-7xl mx-auto">
                    <motion.div 
                        className="space-y-6 text-left"
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight text-left">
                            Welcome to <span className="text-[#51BDEB]">HealthWatch</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 text-left">
                            Your comprehensive community health monitoring and reporting solution
                        </p>
                        <div className="flex flex-wrap gap-4 justify-start">
                            <Button size="lg" className="bg-[#51BDEB] hover:bg-[#20A0D8] text-white font-semibold">
                                Get Started
                            </Button>
                            <Button size="lg" variant="outline" className="border-2 border-[#51BDEB] text-[#51BDEB] hover:bg-[#51BDEB]/10">
                                Learn More
                            </Button>
                        </div>
                    </motion.div>
                    <div className="grid grid-cols-2 gap-6">
                        <motion.div 
                            className="bg-white border-2 border-[#51BDEB]/20 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                        >
                            <div className="w-12 h-12 bg-[#51BDEB]/10 rounded-lg flex items-center justify-center mb-4">
                                <Heart className="h-6 w-6 text-[#51BDEB]" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Health Monitoring</h3>
                            <p className="text-sm text-gray-600">Track and monitor community health metrics</p>
                        </motion.div>
                        <motion.div 
                            className="bg-white border-2 border-[#51BDEB]/20 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <div className="w-12 h-12 bg-[#51BDEB]/10 rounded-lg flex items-center justify-center mb-4">
                                <Shield className="h-6 w-6 text-[#51BDEB]" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Emergency Response</h3>
                            <p className="text-sm text-gray-600">Quick response to health emergencies</p>
                        </motion.div>
                        <motion.div 
                            className="bg-white border-2 border-[#51BDEB]/20 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                        >
                            <div className="w-12 h-12 bg-[#51BDEB]/10 rounded-lg flex items-center justify-center mb-4">
                                <Activity className="h-6 w-6 text-[#51BDEB]" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Real-time Tracking</h3>
                            <p className="text-sm text-gray-600">Live updates on health incidents</p>
                        </motion.div>
                        <motion.div 
                            className="bg-white border-2 border-[#51BDEB]/20 rounded-xl p-6 hover:shadow-lg transition-shadow"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                        >
                            <div className="w-12 h-12 bg-[#51BDEB]/10 rounded-lg flex items-center justify-center mb-4">
                                <Users className="h-6 w-6 text-[#51BDEB]" />
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-2">Community Care</h3>
                            <p className="text-sm text-gray-600">Connect citizens with health services</p>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}