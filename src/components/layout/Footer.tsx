
import { cn } from '@/lib/utils';

const Footer = () => {
  return (
    <footer className="bg-nomad-100 py-16 px-6 md:px-12">
      <div className="container-large grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <h3 className="text-2xl font-semibold mb-6">NOMAD</h3>
          <p className="text-nomad-600 max-w-xs">
            A creative studio dedicated to crafting exceptional digital experiences through thoughtful design.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-nomad-700 mb-6">Navigate</h4>
          <nav className="flex flex-col space-y-3">
            <a href="#home" className="text-nomad-600 hover:text-nomad-900 transition-colors">Home</a>
            <a href="#work" className="text-nomad-600 hover:text-nomad-900 transition-colors">Work</a>
            <a href="#about" className="text-nomad-600 hover:text-nomad-900 transition-colors">About</a>
            <a href="#contact" className="text-nomad-600 hover:text-nomad-900 transition-colors">Contact</a>
          </nav>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-nomad-700 mb-6">Contact</h4>
          <address className="not-italic">
            <p className="text-nomad-600 mb-2">123 Design Avenue</p>
            <p className="text-nomad-600 mb-2">San Francisco, CA 94107</p>
            <p className="text-nomad-600 mb-4">United States</p>
            <a href="mailto:hello@nomadstudio.co" className="text-nomad-600 hover:text-nomad-900 transition-colors">
              hello@nomadstudio.co
            </a>
          </address>
        </div>
      </div>

      <div className="container-large mt-16 pt-8 border-t border-nomad-200">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <p className="text-nomad-500 text-sm">
            © {new Date().getFullYear()} NOMAD Studio. All rights reserved.
          </p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <a href="#" className="text-nomad-600 hover:text-nomad-900 transition-colors text-sm">
              Privacy Policy
            </a>
            <a href="#" className="text-nomad-600 hover:text-nomad-900 transition-colors text-sm">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
