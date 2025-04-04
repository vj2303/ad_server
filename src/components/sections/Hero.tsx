
import FadeIn from '../animation/FadeIn';
import { ArrowDown } from 'lucide-react';

const Hero = () => {
  return (
    <section 
      id="home" 
      className="min-h-screen flex flex-col justify-center relative overflow-hidden pt-20"
    >
      <div className="container-large flex flex-col items-center justify-center text-center py-20 md:py-32">
        <FadeIn delay={0.1}>
          <span className="inline-block text-sm font-medium tracking-wider uppercase text-nomad-500 mb-6 px-3 py-1 bg-nomad-100 rounded-full">
            Creative Studio
          </span>
        </FadeIn>
        
        <FadeIn delay={0.2}>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-nomad-900 mb-8">
            We craft digital <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-nomad-700 to-nomad-900">
              experiences
            </span>
          </h1>
        </FadeIn>
        
        <FadeIn delay={0.3}>
          <p className="text-nomad-600 text-lg md:text-xl max-w-2xl mb-10 text-balance">
            NOMAD is a design-driven creative studio that specializes in creating exceptional digital experiences that engage, inspire, and deliver results.
          </p>
        </FadeIn>
        
        <FadeIn delay={0.4}>
          <a 
            href="#work" 
            className="inline-flex items-center gap-2 bg-nomad-900 text-white px-6 py-3 rounded-full hover:bg-nomad-800 transition-all duration-300 font-medium"
          >
            View our work
          </a>
        </FadeIn>
      </div>
      
      <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
        <FadeIn delay={0.7} direction="down">
          <p className="text-nomad-500 text-sm mb-2">Scroll to explore</p>
          <ArrowDown className="animate-bounce text-nomad-400" size={20} />
        </FadeIn>
      </div>
    </section>
  );
};

export default Hero;
