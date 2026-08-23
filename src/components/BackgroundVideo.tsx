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
          // Fallback if browser requires user interaction
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
    <div className="fixed inset-0 w-full h-full overflow-hidden bg-[#0b090a] z-0 select-none">
      {/* Actual video element — pointer-events disabled via CSS */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="w-full h-full object-cover select-none"
        style={{
          filter: 'none',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          transform: 'translateZ(0)',
        }}
        tabIndex={-1}
        controlsList="nodownload nofullscreen noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
      >
        <source src="/Couple_talking_for_looping_video.mp4" type="video/mp4" />
      </video>

      {/* Transparent shield overlay — blocks right-click / drag on video */}
      <div
        className="video-shield"
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        aria-hidden="true"
      />

      {/* Very subtle bottom gradient to seat the player bar naturally */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none z-[3]"
        style={{
          background: 'linear-gradient(to top, rgba(11,9,10,0.45) 0%, transparent 100%)',
        }}
      />
    </div>
  );
};

export default BackgroundVideo;
