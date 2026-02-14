import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LandingMap1 from "../assets/Landing_Map.jpg";
export default function HeroSection() {
    const [currentSlide, setCurrentSlide] = useState(0);
    
    const slides = [
        {
            title: 'Welcome to HealthWatch',
            subtitle: 'Your comprehensive health monitoring solution',
            image: LandingMap1
        },
        {
            title: 'Track Your Health',
            subtitle: 'Monitor vital signs and health metrics in real-time',
            image: 'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=1920&h=600&fit=crop'
        },
        {
            title: 'Smart Analytics',
            subtitle: 'Get insights and recommendations based on your data',
            image: 'https://images.unsplash.com/photo-1504813184591-01572f98c85f?w=1920&h=600&fit=crop'
        }
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 7000);
        return () => clearInterval(timer);
    }, [slides.length]);

    const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);
    const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);

    return (
        <div className="relative h-[400px] sm:h-[500px] md:h-[600px] lg:h-[730px] w-full overflow-hidden">
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
                >
                    <img 
                        src={slide.image} 
                        alt={slide.title}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-end">
                       {/** <div className="text-center text-white px-4">
                            <h1 className="text-5xl md:text-6xl font-bold mb-6">{slide.title}</h1>
                            <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto">{slide.subtitle}</p>
                            <div className="flex gap-4 justify-center">
                                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">Get Started</Button>
                                <Button size="lg" className="border-white text-white hover:bg-white/20">Learn More</Button>
                            </div>
                        </div>
                        */} 
                    </div>
                </div>
            ))}
            
            <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-1.5 sm:p-2 rounded-full transition-colors z-10"
            >
                <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </button>
            <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/30 hover:bg-white/50 p-1.5 sm:p-2 rounded-full transition-colors z-10"
            >
                <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
            </button>
            
            <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                {slides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-white' : 'bg-white/50'}`}
                    />
                ))}
            </div>
        </div>
    );
}