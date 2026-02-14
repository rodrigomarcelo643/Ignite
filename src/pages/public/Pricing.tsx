import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function Pricing() {
    const plans = [
        {
            name: 'Barangay',
            price: '₱1,000',
            period: '/month',
            description: 'Perfect for single barangay implementation',
            features: [
                'Real-time reporting dashboard',
                'SMS alerts for unusual clusters',
                'Basic training and support',
                'Monthly summary reports',
                'BHW mobile access'
            ],
            popular: false
        },
        {
            name: 'Municipal',
            price: '₱8,000',
            period: '/month',
            description: 'For municipalities with up to 10 barangays',
            features: [
                'All Barangay features',
                'Multi-barangay dashboard',
                'Advanced outbreak detection',
                'Priority support',
                'Custom reports',
                'API access for integration'
            ],
            popular: true
        },
        {
            name: 'Provincial',
            price: '₱15,000',
            period: '/month',
            description: 'Unlimited barangays for cities and provinces',
            features: [
                'All Municipal features',
                'Unlimited barangays',
                'Dedicated account manager',
                'Custom AI training',
                'White-label options',
                'Research data access'
            ],
            popular: false
        },
        {
            name: 'Research',
            price: 'Custom',
            period: '',
            description: 'For academic institutions and researchers',
            features: [
                'Anonymized data access',
                'API for research projects',
                'Student collaboration tools',
                'Publication support',
                'Custom analytics',
                'Semester-based licensing'
            ],
            popular: false
        }
    ];

    return (
        <div className="bg-white min-h-screen flex items-center justify-center pt-24 pb-12 relative overflow-hidden">
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
                <div className="max-w-7xl mx-auto">
                    {/* Header Section - Left Aligned */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6 }}
                        className="space-y-6 text-left mb-16"
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                            Simple, Transparent <span className="text-[#51BDEB]">Pricing</span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600">
                            Affordable health surveillance for every community. Choose the plan that fits your needs.
                        </p>
                    </motion.div>

                    {/* Pricing Cards - 2x2 Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                        {plans.map((plan, index) => (
                            <motion.div
                                key={plan.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className={`relative bg-white rounded-xl p-6 border-2 ${
                                    plan.popular ? 'border-[#51BDEB]' : 'border-[#51BDEB]/20'
                                } hover:shadow-lg transition-shadow`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-3 left-6">
                                        <span className="bg-[#51BDEB] text-white px-4 py-1 rounded-full text-sm font-semibold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                    <div className="flex items-baseline mb-2">
                                        <span className="text-4xl font-bold text-[#51BDEB]">{plan.price}</span>
                                        <span className="text-gray-600 ml-1">{plan.period}</span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{plan.description}</p>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {plan.features.map((feature) => (
                                        <li key={feature} className="flex items-start">
                                            <Check className="w-5 h-5 text-[#51BDEB] mr-2 flex-shrink-0 mt-0.5" />
                                            <span className="text-gray-600 text-sm">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                                        plan.popular
                                            ? 'bg-[#51BDEB] text-white hover:bg-[#20A0D8]'
                                            : 'bg-[#51BDEB]/10 text-[#51BDEB] hover:bg-[#51BDEB]/20'
                                    }`}
                                >
                                    Get Started
                                </button>
                            </motion.div>
                        ))}
                    </div>

                    {/* Additional Info - Full Width */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                        className="bg-gradient-to-r from-[#51BDEB] to-[#20A0D8] rounded-xl p-8 text-white"
                    >
                        <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Cost Savings</h3>
                                <p className="text-white/90 mb-4">
                                    Traditional paper-based systems cost municipalities ₱65,000-95,000 annually in printing, transport, and staff time.
                                </p>
                                <p className="text-white/90">
                                    HealthWatch reduces costs by 70% while providing real-time outbreak detection.
                                </p>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold mb-4">Setup & Training</h3>
                                <p className="text-white/90 mb-2">
                                    • One-time setup: ₱2,500 per municipality
                                </p>
                                <p className="text-white/90 mb-2">
                                    • Custom QR materials: ₱500 per barangay
                                </p>
                                <p className="text-white/90">
                                    • Includes BHW training and 3-month onboarding support
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}