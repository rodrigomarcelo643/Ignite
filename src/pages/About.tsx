import { Card, CardContent } from '@/components/ui/card';
import { Heart, Shield, Users, TrendingUp } from 'lucide-react';

export default function About() {
  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-[#51BDEB] to-cyan-500 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">About HealthWatch</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Empowering communities with real-time health monitoring and data-driven insights for a healthier tomorrow.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-6 text-center">Our Mission</h2>
          <p className="text-lg text-muted-foreground text-center mb-12">
            HealthWatch is dedicated to revolutionizing public health management through innovative technology. 
            We provide comprehensive health monitoring solutions that connect citizens, healthcare providers, 
            and government agencies to create a unified approach to community wellness.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          <Card>
            <CardContent className="pt-6 text-center">
              <Heart className="h-12 w-12 mx-auto mb-4 text-[#51BDEB]" />
              <h3 className="text-xl font-semibold mb-2">Health First</h3>
              <p className="text-muted-foreground">Prioritizing citizen health with real-time monitoring and alerts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-12 w-12 mx-auto mb-4 text-[#51BDEB]" />
              <h3 className="text-xl font-semibold mb-2">Secure Data</h3>
              <p className="text-muted-foreground">Bank-level encryption protecting your sensitive health information</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <Users className="h-12 w-12 mx-auto mb-4 text-[#51BDEB]" />
              <h3 className="text-xl font-semibold mb-2">Community Focus</h3>
              <p className="text-muted-foreground">Connecting communities for better health outcomes</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-[#51BDEB]" />
              <h3 className="text-xl font-semibold mb-2">Data Analytics</h3>
              <p className="text-muted-foreground">Advanced insights for informed health decisions</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Our Vision</h2>
            <p className="text-lg text-muted-foreground text-center">
              We envision a world where health data is accessible, actionable, and empowers every individual 
              to take control of their wellness. Through HealthWatch, we're building a future where preventive 
              care is the norm, health emergencies are detected early, and communities thrive together.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <h3 className="text-4xl font-bold text-[#51BDEB] mb-2">10K+</h3>
            <p className="text-muted-foreground">Active Users</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-[#51BDEB] mb-2">50+</h3>
            <p className="text-muted-foreground">Partner Hospitals</p>
          </div>
          <div>
            <h3 className="text-4xl font-bold text-[#51BDEB] mb-2">24/7</h3>
            <p className="text-muted-foreground">Health Monitoring</p>
          </div>
        </div>
      </section>
    </div>
  );
}
