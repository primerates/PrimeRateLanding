import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

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

export default function TestimonialsSection() {
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsPerPage = 4;
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
    <section className="py-16 bg-muted/30 relative">
      <div className="container mx-auto px-6">
        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif text-center mb-4" data-testid="text-testimonials-title">
            What Our Clients Say
          </h2>
          
          {/* Navigation Arrows - centered below heading */}
          <div className="flex justify-center items-center gap-4 mb-8">
            <Button
              variant="outline"
              size="icon"
              className="bg-white shadow-md hover-elevate"
              onClick={prevTestimonials}
              data-testid="button-prev-testimonials"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <Button
              variant="outline"
              size="icon"
              className="bg-white shadow-md hover-elevate"
              onClick={nextTestimonials}
              data-testid="button-next-testimonials"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <div className="relative">
            {/* Testimonials Container */}
            <div className="px-4">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
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
        </div>
      </div>
    </section>
  );
}