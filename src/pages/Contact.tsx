
import React from 'react';
import { Map, Phone, Mail } from 'lucide-react';
import Footer from '@/components/Footer';
import FaqSection from '@/components/FaqSection';
import ScrollAnimationWrapper from '@/components/ScrollAnimationWrapper';

const Contact = () => {
  return (
    <div className="min-h-screen bg-podcast-dark">
      <div className="container px-4 mx-auto py-20">
        <ScrollAnimationWrapper animation="fade-down">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-12">
            <span className="text-gradient">Get In Touch</span>
          </h1>
        </ScrollAnimationWrapper>
        
        <div className="max-w-3xl mx-auto mb-16">
          <ScrollAnimationWrapper animation="fade-up" delay={100}>
            <div className="grid md:grid-cols-1 gap-8">
              <div className="bg-black p-8 rounded-2xl shadow-xl">
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-podcast-accent to-pink-500 p-3 rounded-lg">
                      <Map className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-podcast-accent mb-1">Address</h3>
                      <p className="text-gray-300">123 Studio Lane, Los Angeles, CA 90001</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-podcast-accent to-pink-500 p-3 rounded-lg">
                      <Phone className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-podcast-accent mb-1">Phone</h3>
                      <p className="text-gray-300">+1 (555) 123-4567</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-gradient-to-r from-podcast-accent to-pink-500 p-3 rounded-lg">
                      <Mail className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-podcast-accent mb-1">Email</h3>
                      <p className="text-gray-300">hello@studiobooking.com</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollAnimationWrapper>
        </div>
      </div>
      
      <FaqSection />
      <Footer />
    </div>
  );
};

export default Contact;
