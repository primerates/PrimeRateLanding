import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Zap, X } from 'lucide-react';

const services = [
  {
    icon: Lock,
    title: 'Lock Assurance',
    description: 'Market rates can be unpredictable. If they drop below your locked rate, we\'ve got you covered—we\'ll roll down your lock so you don\'t miss out.',
    features: ['Conventional loans', 'Jumbo loans', 'First-time buyer programs', 'Down payment assistance']
  },
  {
    icon: Zap,
    title: 'Choose Simplicity',
    description: 'Work and family life can be a handful; your refinance shouldn\'t be - with expert guidance, real-time loan status updates and a simplified loan process, Choose simplicity.',
    features: ['Rate & term refinance', 'Cash-out refinance', 'Streamline refinance', 'Investment property refi']
  },
  {
    icon: X,
    title: 'No Junk Fees',
    description: 'We keep it honest and transparent—with zero application, rate lock, or junk fees—so you save more every step of the way.',
    features: ['FHA loans (3.5% down)', 'VA loans (0% down)', 'USDA rural loans', 'State-specific programs']
  }
];

export default function ServicesSection() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4" data-testid="text-services-title">
            Prime VA, FHA, Conventional, and Jumbo Refinance & Purchase Loans
          </h2>
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}