import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Handshake, Ban, TrendingDown } from 'lucide-react';
import { useState, useEffect } from 'react';

const services = [
  {
    icon: TrendingDown,
    title: 'Prime Rates',
    description: 'We shop banks and lenders every day to secure the most competitive rates for you, and we\'ll beat any comparable offer. Lower payments start with Prime Rates.',
    features: []
  },
  {
    icon: Lock,
    title: 'Lock Assurance',
    description: 'Rates can be unpredictable. If they drop below your locked rate, our relock option ensures you don\'t miss out on extra savings, while giving you added peace of mind.',
    features: ['Conventional loans', 'Jumbo loans', 'First-time buyer programs', 'Down payment assistance']
  },
  {
    icon: Ban,
    title: 'No Junk Fees',
    description: 'We earn your trust with honest, transparent quotes and disclosures - no application, rate lock, or junk fees, so you save more every step of the way.',
    features: ['FHA loans (3.5% down)', 'VA loans (0% down)', 'USDA rural loans', 'State-specific programs']
  },
  {
    icon: Handshake,
    title: 'Choose Simplicity',
    description: 'Work and family life can be a handful; your loan shouldn\'t be - with expert guidance, real-time updates and a simplified loan process, Choose simplicity.',
    features: ['Rate & term refinance', 'Cash-out refinance', 'Streamline refinance', 'Investment property refi']
  }
];

export default function ServicesSection() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Animate both ways - slide down when entering, slide up when leaving
        setIsVisible(entry.isIntersecting);
      },
      {
        threshold: 0.3, // Trigger when 30% of the section is visible
        rootMargin: '-100px 0px' // Start animation 100px before the section comes into view
      }
    );

    const section = document.getElementById('services-section');
    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  return (
    <section id="services-section" className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 
            className={`text-3xl lg:text-4xl font-bold font-serif mb-4 transition-all duration-1000 ease-out ${
              isVisible 
                ? 'translate-y-0 opacity-100' 
                : '-translate-y-12 opacity-0'
            }`}
            data-testid="text-services-title"
          >
            Prime Rates on VA, FHA, and Conventional Loans
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index}
              className="hover-elevate transition-all duration-300 h-full"
              data-testid={`card-service-${index}`}
            >
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
                  <service.icon className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-xl font-serif" data-testid={`text-service-title-${index}`}>
                  {service.title}
                </CardTitle>
                <CardDescription className="text-base" data-testid={`text-service-description-${index}`}>
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}