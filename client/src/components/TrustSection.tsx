import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Award, Users, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

// todo: remove mock functionality - replace with real testimonials
const testimonials = [
  {
    name: 'Sarah Johnson',
    location: 'Austin, TX',
    rating: 5,
    text: 'Prime Rate Home Loans made our first home purchase seamless. Their team guided us through every step and secured us an amazing rate!'
  },
  {
    name: 'Michael Chen',
    location: 'Denver, CO', 
    rating: 5,
    text: 'Refinanced with Prime Rate and saved $400/month. Professional service and incredibly fast closing process.'
  },
  {
    name: 'Jennifer Martinez',
    location: 'Phoenix, AZ',
    rating: 5,
    text: 'As a first-time homebuyer, I was nervous about the process. Prime Rate made everything clear and got me into my dream home with an incredible rate!'
  },
  {
    name: 'David Thompson',
    location: 'Seattle, WA',
    rating: 5,
    text: 'Exceptional service from start to finish. They worked with my complex financial situation and found the perfect loan solution for my family.'
  },
  {
    name: 'Lisa Rodriguez',
    location: 'Miami, FL',
    rating: 5,
    text: 'Prime Rate helped us refinance and consolidate debt. We now save over $600 monthly and couldn\'t be happier with their expertise.'
  },
  {
    name: 'Robert Kim',
    location: 'Portland, OR',
    rating: 5,
    text: 'Their VA loan program made homeownership possible for our military family. Outstanding support and competitive rates throughout the process.'
  }
];

const stats = [
  { icon: Users, label: 'Happy Families Served', value: '15,000+' },
  { icon: Clock, label: 'Years of Experience', value: '25+' },
  { icon: Award, label: 'Loans Funded', value: '$3.2B+' },
];

export default function TrustSection() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsPerPage = 2;
  const maxIndex = Math.ceil(testimonials.length / testimonialsPerPage) - 1;

  const nextTestimonials = () => {
    setCurrentTestimonialIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
  };

  const prevTestimonials = () => {
    setCurrentTestimonialIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
  };

  const currentTestimonials = testimonials.slice(
    currentTestimonialIndex * testimonialsPerPage,
    (currentTestimonialIndex + 1) * testimonialsPerPage
  );
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-6">
        {/* Stats Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4" data-testid="text-trust-title">
            Trusted by Thousands of Families
          </h2>
          <p className="text-lg text-muted-foreground" data-testid="text-trust-description">
            Our track record speaks for itself
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => (
            <Card 
              key={index}
              className="text-center hover-elevate"
              data-testid={`card-stat-${index}`}
            >
              <CardContent className="p-6">
                <div className="mx-auto mb-4 p-3 bg-success/10 rounded-full w-fit">
                  <stat.icon className="w-8 h-8 text-success" />
                </div>
                <div className="text-3xl font-bold text-primary mb-2" data-testid={`text-stat-value-${index}`}>
                  {stat.value}
                </div>
                <div className="text-muted-foreground" data-testid={`text-stat-label-${index}`}>
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold font-serif text-center mb-8" data-testid="text-testimonials-title">
            What Our Clients Say
          </h3>
          
          <div className="relative">
            {/* Navigation Arrows */}
            <Button
              variant="outline"
              size="icon"
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md hover-elevate"
              onClick={prevTestimonials}
              data-testid="button-prev-testimonials"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white shadow-md hover-elevate"
              onClick={nextTestimonials}
              data-testid="button-next-testimonials"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>

            {/* Testimonials Container */}
            <div className="px-12">
              <div className="grid md:grid-cols-2 gap-8">
                {currentTestimonials.map((testimonial, index) => (
                  <Card 
                    key={`${currentTestimonialIndex}-${index}`}
                    className="hover-elevate"
                    data-testid={`card-testimonial-${currentTestimonialIndex * testimonialsPerPage + index}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex items-center mr-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                          ))}
                        </div>
                        <Badge variant="secondary" data-testid={`badge-testimonial-rating-${currentTestimonialIndex * testimonialsPerPage + index}`}>
                          {testimonial.rating} stars
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-4 italic" data-testid={`text-testimonial-content-${currentTestimonialIndex * testimonialsPerPage + index}`}>
                        "{testimonial.text}"
                      </p>
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                          <span className="text-primary font-semibold">
                            {testimonial.name.split(' ').map(n => n[0]).join('')}
                          </span>
                        </div>
                        <div>
                          <div className="font-semibold" data-testid={`text-testimonial-name-${currentTestimonialIndex * testimonialsPerPage + index}`}>
                            {testimonial.name}
                          </div>
                          <div className="text-sm text-muted-foreground" data-testid={`text-testimonial-location-${currentTestimonialIndex * testimonialsPerPage + index}`}>
                            {testimonial.location}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {[...Array(maxIndex + 1)].map((_, index) => (
                <button
                  key={index}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentTestimonialIndex ? 'bg-primary' : 'bg-muted'
                  }`}
                  onClick={() => setCurrentTestimonialIndex(index)}
                  data-testid={`button-testimonial-dot-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <div className="mt-16 text-center">
            <h3 className="text-2xl font-bold font-serif mb-8" data-testid="text-why-choose-title">
              Why Choose Prime Rate Home Loans?
            </h3>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                'Licensed in 50 states',
                'Same-day pre-approval',
                'No hidden fees',
                'Expert loan officers'
              ].map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-center p-4 bg-muted/50 rounded-md"
                  data-testid={`text-feature-${index}`}
                >
                  <div className="w-2 h-2 bg-success rounded-full mr-3"></div>
                  <span className="font-medium">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}