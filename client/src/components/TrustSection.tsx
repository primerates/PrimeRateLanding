import heroImage from '@assets/generated_images/Happy_family_outside_home_374959f2.png';

export default function TrustSection() {
  return (
    <div>
      {/* Header above the photo */}
      <div className="py-8 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold font-serif" data-testid="text-trust-title">
              Trusted by Thousands of Homeowners and Real Estate Professionals
            </h2>
          </div>
        </div>
      </div>

      {/* Full-size photo section matching homepage */}
      <section className="relative min-h-screen flex items-center">
        {/* Hero background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Happy family standing outside their beautiful home"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6">
          {/* Content can be added here if needed */}
        </div>
      </section>
    </div>
  );
}