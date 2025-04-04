
import FadeIn from '../animation/FadeIn';
import { ArrowUpRight } from 'lucide-react';

const caseStudies = [
  {
    id: 1,
    title: 'Vision Eyewear',
    category: 'Branding & Website',
    description: 'A minimalist e-commerce experience for a premium eyewear brand.',
    image: 'https://images.unsplash.com/photo-1508296695146-257a814070b4?q=80&w=2070',
    link: '#',
  },
  {
    id: 2,
    title: 'Kinfolk Magazine',
    category: 'Editorial Design',
    description: 'Reimagining digital storytelling for a lifestyle publication.',
    image: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=2730',
    link: '#',
  },
  {
    id: 3,
    title: 'Tempo App',
    category: 'UX/UI Design',
    description: 'A productivity app focused on minimalism and efficiency.',
    image: 'https://images.unsplash.com/photo-1594731804133-4d7505ea077d?q=80&w=2069',
    link: '#',
  },
];

const CaseStudies = () => {
  return (
    <section id="work" className="section-padding bg-white">
      <div className="container-large">
        <FadeIn>
          <div className="max-w-xl mb-16">
            <span className="inline-block text-sm font-medium tracking-wider uppercase text-nomad-500 mb-4">
              Our Work
            </span>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-nomad-900 mb-6">
              Selected case studies
            </h2>
            <p className="text-nomad-600 text-pretty">
              Explore our portfolio of work spanning branding, digital product design, and creative direction for forward-thinking brands and businesses.
            </p>
          </div>
        </FadeIn>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {caseStudies.map((study, index) => (
            <FadeIn key={study.id} delay={0.1 * (index + 1)}>
              <a href={study.link} className="case-study-card group">
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={study.image} 
                    alt={study.title} 
                    className="case-study-image"
                    loading="lazy"
                  />
                </div>
                <div className="p-6">
                  <span className="text-sm text-nomad-500 block mb-2">{study.category}</span>
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-nomad-700 transition-colors">
                    {study.title}
                  </h3>
                  <p className="text-nomad-600 mb-4 text-pretty">{study.description}</p>
                  <div className="flex items-center gap-2 text-nomad-800 font-medium">
                    <span>View case study</span>
                    <ArrowUpRight size={16} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </a>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CaseStudies;
