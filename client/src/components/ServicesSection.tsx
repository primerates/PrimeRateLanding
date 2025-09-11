import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, RefreshCw, Shield } from 'lucide-react';

const services = [
  {
    icon: Home,
    title: 'Purchase Loans',
    description: 'Whether you\'re a first-time buyer or moving up, we offer competitive rates and personalized guidance to help you secure your dream home.',
    features: ['Conventional loans', 'Jumbo loans', 'First-time buyer programs', 'Down payment assistance']
  },
  {
    icon: RefreshCw,
    title: 'Refinancing',
    description: 'Lower your monthly payments or access your home equity with our streamlined refinancing process and competitive rates.',
    features: ['Rate & term refinance', 'Cash-out refinance', 'Streamline refinance', 'Investment property refi']
  },
  {
    icon: Shield,
    title: 'FHA & VA Loans',
    description: 'Specialized government-backed loan programs designed to help more people achieve homeownership with flexible requirements.',
    features: ['FHA loans (3.5% down)', 'VA loans (0% down)', 'USDA rural loans', 'State-specific programs']
  }
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4" data-testid="text-services-title">
            Our Lending Solutions
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-services-description">
            From purchase to refinance, we offer comprehensive mortgage solutions tailored to your unique financial situation
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
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
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li 
                      key={featureIndex} 
                      className="flex items-center text-sm"
                      data-testid={`text-service-feature-${index}-${featureIndex}`}
                    >
                      <div className="w-1.5 h-1.5 bg-success rounded-full mr-3"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  data-testid={`button-learn-more-${index}`}
                  onClick={() => console.log(`Learn more about ${service.title} clicked`)}
                >
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}