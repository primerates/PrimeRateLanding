import heroImage from '@assets/generated_images/Happy_family_outside_home_374959f2.png';

export default function TrustSection() {
  return (
    <section className="relative py-16 bg-background">
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
        {/* Title Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold font-serif mb-4 text-white" data-testid="text-trust-title">
            Trusted by Thousands of Homeowners and Real Estate Professionals
          </h2>
        </div>

      </div>
    </section>
  );
}