import { useRef, useEffect, useState } from 'react';
import aerialVideo from '@assets/generated_videos/aerial_neighborhood_golden_hour.mp4';

export default function TrustSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [titleVisible, setTitleVisible] = useState(false);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          // Delay the title reveal slightly for dramatic effect
          setTimeout(() => {
            setTitleVisible(true);
          }, 800);
        } else {
          setTitleVisible(false);
        }
      },
      {
        threshold: 0.3,
        rootMargin: '-50px 0px'
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <div>
      {/* Full-size video section with overlay title */}
      <section ref={sectionRef} className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Video background with gradient overlay */}
        <div className="absolute inset-0 z-0">
          <video 
            ref={videoRef}
            src={aerialVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            data-testid="video-trust-background"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/10"></div>
        </div>
        
        {/* Title positioned at top of video with fade-in animation */}
        <div className="relative z-10 pt-16 pb-8">
          <div className="container mx-auto px-6">
            <div className="text-center">
              <h2 
                className={`text-3xl lg:text-5xl xl:whitespace-nowrap font-bold font-serif text-white drop-shadow-lg transition-all duration-1000 ease-out ${
                  titleVisible 
                    ? 'opacity-100 translate-y-0' 
                    : 'opacity-0 -translate-y-8'
                }`}
                style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                data-testid="text-trust-title"
              >
                Trusted by Thousands of Homeowners & Real Estate Professionals
              </h2>
            </div>
          </div>
        </div>

        <div className="flex-1"></div>
      </section>
    </div>
  );
}