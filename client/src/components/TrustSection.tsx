import { useRef, useEffect } from 'react';
import aerialVideo from '@assets/generated_videos/aerial_neighborhood_golden_hour.mp4';

export default function TrustSection() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.7;
    }
  }, []);

  return (
    <div>
      {/* Header above the video */}
      <div className="py-8 bg-background">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="text-3xl lg:text-4xl font-bold font-serif" data-testid="text-trust-title">
              Trusted by Thousands of Homeowners and Real Estate Professionals
            </h2>
          </div>
        </div>
      </div>

      {/* Full-size video section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
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
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-black/20 to-black/15"></div>
        </div>
        
        <div className="relative z-10 container mx-auto px-6">
          {/* Content can be added here if needed */}
        </div>
      </section>
    </div>
  );
}