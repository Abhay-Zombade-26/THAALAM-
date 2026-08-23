import React, { useRef, useEffect } from 'react';

export const BackgroundVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = true;
    video.defaultMuted = true;

    const playVideo = () => {
      if (video) {
        video.play().catch(() => {
          // Fallback if browser requires interaction
        });
      }
    };

    playVideo();
    video.addEventListener('canplay', playVideo);

    return () => {
      video.removeEventListener('canplay', playVideo);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0b090a] z-0 select-none pointer-events-none">
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover"
        style={{
          filter: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          transform: 'translateZ(0)'
        }}
      >
        <source src="/background_video.mp4" type="video/mp4" />
        <source src="/background%20video.mp4" type="video/mp4" />
        <source src="/background video.mp4" type="video/mp4" />
      </video>
    </div>
  );
};

export default BackgroundVideo;

