
import FadeIn from '../animation/FadeIn';

const teamMembers = [
  {
    id: 1,
    name: 'Alex Morgan',
    role: 'Creative Director',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1949',
  },
  {
    id: 2,
    name: 'Sam Chen',
    role: 'Lead Designer',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=1976',
  },
  {
    id: 3,
    name: 'Jordan Taylor',
    role: 'UX Strategist',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=1961',
  },
];

const About = () => {
  return (
    <section id="about" className="section-padding bg-nomad-50">
      <div className="container-large">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <FadeIn>
            <div>
              <span className="inline-block text-sm font-medium tracking-wider uppercase text-nomad-500 mb-4">
                About Us
              </span>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-nomad-900 mb-6">
                Driven by design, <br />guided by purpose
              </h2>
              <div className="space-y-6 text-nomad-700">
                <p>
                  NOMAD is a design studio founded in 2018 with a simple mission: to create meaningful digital experiences that resonate with people. We believe that great design goes beyond aesthetics—it solves problems, tells stories, and creates connections.
                </p>
                <p>
                  Our approach combines strategic thinking with meticulous craftsmanship. We don't just design how things look; we design how they work and how they feel. This holistic perspective allows us to create solutions that are both beautiful and functional.
                </p>
                <p>
                  Whether we're designing a brand identity, a website, or a digital product, we bring the same level of care and attention to detail to every project we undertake.
                </p>
              </div>
            </div>
          </FadeIn>

          <FadeIn direction="right">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {teamMembers.map((member, index) => (
                <div key={member.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                  <div className="aspect-[3/4] overflow-hidden">
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-nomad-900">{member.name}</h3>
                    <p className="text-sm text-nomad-500">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
};

export default About;
