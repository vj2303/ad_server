
import { useState } from 'react';
import FadeIn from '../animation/FadeIn';
import { useToast } from '@/components/ui/use-toast';

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would send the form data to a server here
    console.log('Form submitted:', formData);
    
    toast({
      title: "Message sent!",
      description: "Thank you for reaching out. We'll be in touch soon.",
      duration: 5000,
    });
    
    // Reset form
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="section-padding bg-white">
      <div className="container-small">
        <FadeIn>
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="inline-block text-sm font-medium tracking-wider uppercase text-nomad-500 mb-4">
              Get in Touch
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-nomad-900 mb-6">
              Let's create something together
            </h2>
            <p className="text-nomad-600">
              Have a project in mind or just want to say hello? Fill out the form below, and we'll get back to you promptly.
            </p>
          </div>
        </FadeIn>

        <FadeIn delay={0.2}>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-nomad-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-nomad-50 border border-nomad-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nomad-500 focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-nomad-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 bg-nomad-50 border border-nomad-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nomad-500 focus:border-transparent transition-all"
                  placeholder="your@email.com"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-nomad-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-4 py-3 bg-nomad-50 border border-nomad-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-nomad-500 focus:border-transparent transition-all"
                placeholder="Tell us about your project..."
              />
            </div>
            
            <div className="text-center sm:text-right">
              <button
                type="submit"
                className="inline-flex items-center justify-center bg-nomad-900 text-white px-8 py-3 rounded-lg hover:bg-nomad-800 transition-all duration-300 font-medium"
              >
                Send Message
              </button>
            </div>
          </form>
        </FadeIn>
      </div>
    </section>
  );
};

export default Contact;
