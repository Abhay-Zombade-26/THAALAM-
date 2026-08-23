import React from 'react';
import { BackgroundVideo } from './BackgroundVideo';

interface AnimatedBackgroundProps {
  onLoadComplete?: () => void;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = () => {
  return <BackgroundVideo />;
};

export default AnimatedBackground;

