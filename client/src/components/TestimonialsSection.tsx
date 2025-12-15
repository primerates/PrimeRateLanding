import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const defaultTestimonials = [
  {
    name: 'Sarah Mitchell',
    location: 'Phoenix, AZ',
    rating: 5,
    text: 'The team made our first home purchase so easy. They found us an incredible rate and walked us through every step. Highly recommend!'
  },
  {
    name: 'Michael Chen',
    location: 'Austin, TX',
    rating: 5,
    text: 'Refinancing was a breeze. They beat our bank\'s rate by half a percent and saved us thousands over the life of our loan.'
  },
  {
    name: 'Jennifer Adams',
    location: 'Denver, CO',
    rating: 5,
    text: 'Professional, responsive, and transparent. No hidden fees, no surprises. This is how mortgage lending should be done.'
  },
  {
    name: 'David Thompson',
    location: 'Seattle, WA',
    rating: 5,
    text: 'As a first-time buyer, I had so many questions. The team was patient and helped me understand every detail. Closed in 21 days!'
  }
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>(defaultTestimonials);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsPerPage = 4;
  
  // Load testimonials from localStorage, merge with defaults
  useEffect(() => {
    const loadTestimonials = () => {
      const stored = localStorage.getItem('postedTestimonials');
      if (stored) {
        const parsed = JSON.parse(stored);
        // Transform data to match display format
        const formatted = parsed.map((t: any) => ({
          name: `${t.firstName} ${t.lastName}`,
          location: t.city && t.state ? `${t.city}, ${t.state}` : t.state || t.city || 'Location not specified',
          rating: parseInt(t.rating) || 5,
          text: t.comment
        }));
        // Combine custom testimonials with defaults
        setTestimonials([...formatted, ...defaultTestimonials]);
      }
    };
    
    loadTestimonials();
    
    // Listen for storage changes (when new testimonials are posted)
    window.addEventListener('storage', loadTestimonials);
    return () => window.removeEventListener('storage', loadTestimonials);
  }, []);
  
  const maxIndex = testimonials.length > 0 ? Math.ceil(testimonials.length / testimonialsPerPage) - 1 : 0;

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
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4" data-testid="text-testimonials-title">
            What Our Clients Say
          </h2>
          
          {testimonials.length > testimonialsPerPage && (
            <div className="flex justify-center items-center gap-4">
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
          )}
        </div>
        
        {testimonials.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg" data-testid="text-no-testimonials">
              No testimonials yet. Check back soon!
            </p>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {currentTestimonials.map((testimonial, index) => (
                <Card 
                  key={`${currentTestimonialIndex}-${index}`}
                  className="hover-elevate transition-all duration-300 h-full flex flex-col"
                  data-testid={`card-testimonial-${currentTestimonialIndex * testimonialsPerPage + index}`}
                >
                  <CardContent className="p-6 flex flex-col h-full">
                    <div className="flex items-center justify-center mb-4">
                      <div className="flex items-center">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-warning text-warning" />
                        ))}
                      </div>
                    </div>
                    <p 
                      className="text-muted-foreground mb-4 italic text-center flex-1 line-clamp-4" 
                      data-testid={`text-testimonial-content-${currentTestimonialIndex * testimonialsPerPage + index}`}
                    >
                      "{testimonial.text}"
                    </p>
                    <div className="flex flex-col items-center mt-auto pt-4 border-t">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-2">
                        <span className="text-primary font-semibold">
                          {testimonial.name.split(' ').map((n: string) => n[0]).join('')}
                        </span>
                      </div>
                      <div className="text-center">
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

            {testimonials.length > testimonialsPerPage && (
              <div className="flex justify-center mt-8 space-x-2">
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
            )}
          </>
        )}
      </div>
    </section>
  );
}