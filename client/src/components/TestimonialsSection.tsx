import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const testimonialsPerPage = 2;
  
  // Load testimonials from localStorage
  useEffect(() => {
    const loadTestimonials = () => {
      const stored = localStorage.getItem('postedTestimonials');
      if (stored) {
        const parsed = JSON.parse(stored);
        console.log('Raw testimonials data:', parsed);
        // Transform data to match display format
        const formatted = parsed.map((t: any) => {
          const location = t.city && t.state ? `${t.city}, ${t.state}` : t.state || t.city || 'Location not specified';
          console.log('Testimonial:', { city: t.city, state: t.state, location });
          return {
            name: `${t.firstName} ${t.lastName}`,
            location: location,
            rating: parseInt(t.rating) || 5,
            text: t.comment
          };
        });
        console.log('Formatted testimonials:', formatted);
        setTestimonials(formatted);
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
        {/* Testimonials */}
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif text-center mb-4" data-testid="text-testimonials-title">
            What Our Clients Say
          </h2>
          
          {testimonials.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg" data-testid="text-no-testimonials">
                No testimonials yet. Check back soon!
              </p>
            </div>
          ) : (
            <>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </>
          )}
        </div>
      </div>
    </section>
  );
}