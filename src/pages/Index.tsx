
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import FadeIn from '@/components/animation/FadeIn';

const Index = () => {
  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const features = [
    { title: "User-friendly Interface", description: "Intuitive platform for brands and creators" },
    { title: "Meta Ads Integration", description: "Connect your Facebook Ads account seamlessly" },
    { title: "Performance Tracking", description: "Monitor ad spend and creative performance" },
    { title: "Automated Commissions", description: "Calculate creator earnings based on ad spend" },
    { title: "Approval Workflow", description: "Streamlined process for creative submissions" },
    { title: "Detailed Analytics", description: "Track performance metrics for all creatives" },
  ];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Header />
        <main>
          {/* Hero Section */}
          <section className="py-20 px-6 md:px-12 lg:px-24 bg-gray-50">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <h1 className="text-4xl md:text-6xl font-bold mb-6">
                  Revolutionize your <span className="text-blue-600">creative marketing</span>
                </h1>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-xl mb-8 max-w-2xl text-gray-600">
                  AdCreativeX connects brands with creators and tracks performance, 
                  automating commissions based on real ad spend.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <div className="flex flex-wrap gap-4">
                  <Button asChild size="lg" className="rounded-full">
                    <Link to="/register">
                      Get Started <ArrowRight className="ml-2" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="rounded-full">
                    <Link to="/login">
                      Sign In
                    </Link>
                  </Button>
                </div>
              </FadeIn>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="py-20 px-6 md:px-12 lg:px-24">
            <div className="max-w-6xl mx-auto">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">
                  Everything you need to scale creative performance
                </h2>
              </FadeIn>
              
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                  <FadeIn key={index} delay={0.1 * index} direction={index % 2 === 0 ? 'left' : 'right'}>
                    <div className="p-6 border rounded-xl hover:shadow-md transition-shadow">
                      <CheckCircle className="text-blue-600 mb-4 h-8 w-8" />
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </section>
          
          {/* CTA Section */}
          <section className="py-20 px-6 md:px-12 lg:px-24 bg-blue-600 text-white">
            <div className="max-w-6xl mx-auto text-center">
              <FadeIn>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Ready to transform your creative marketing?
                </h2>
              </FadeIn>
              <FadeIn delay={0.1}>
                <p className="text-xl mb-8 max-w-2xl mx-auto text-blue-100">
                  Join AdCreativeX today and start seeing real results from your creative collaborations.
                </p>
              </FadeIn>
              <FadeIn delay={0.2}>
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <Link to="/register">
                    Get Started <ArrowRight className="ml-2" />
                  </Link>
                </Button>
              </FadeIn>
            </div>
          </section>
        </main>
        <Footer />
      </motion.div>
    </AnimatePresence>
  );
};

export default Index;
