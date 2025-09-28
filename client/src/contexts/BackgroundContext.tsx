import { createContext, useContext, useState, ReactNode } from 'react';
import cubesBackground from '@assets/stock_images/abstract_geometric_c_b9135c5b.jpg';
import pyramidsBackground from '@assets/stock_images/egyptian_pyramids_de_debf6a77.jpg';
import moonBackground from '@assets/stock_images/moon_landing_apollo__46fa586b.jpg';
import rocketBackground from '@assets/stock_images/spacex_rocket_launch_e241bee8.jpg';

export type BackgroundType = 'animated' | 'static';

export interface BackgroundPreset {
  id: string;
  label: string;
  type: BackgroundType;
  assetPath: string;
  description: string;
  credits?: string;
}

// Background presets configuration
export const backgroundPresets: BackgroundPreset[] = [
  {
    id: 'cubes-animated',
    label: 'Geometric Cubes (Animated)',
    type: 'animated',
    assetPath: cubesBackground,
    description: 'Cool animated focus effect with geometric cubes background',
    credits: 'Default'
  },
  {
    id: 'cubes-static',
    label: 'Geometric Cubes (Static)',
    type: 'static',
    assetPath: cubesBackground,
    description: 'Same geometric cubes background without animation'
  },
  {
    id: 'pyramids-static',
    label: 'Egyptian Pyramids',
    type: 'static',
    assetPath: pyramidsBackground,
    description: 'Majestic Egyptian pyramids at sunset'
  },
  {
    id: 'moon-static',
    label: 'Apollo Moon Landing',
    type: 'static',
    assetPath: moonBackground,
    description: 'Historic Apollo mission moon landing scene'
  },
  {
    id: 'rocket-static',
    label: 'SpaceX Rocket Launch',
    type: 'static',
    assetPath: rocketBackground,
    description: 'Dramatic SpaceX rocket launch with fire and smoke'
  }
];

interface BackgroundContextType {
  selectedBackground: string;
  setBackground: (backgroundId: string) => void;
  getCurrentPreset: () => BackgroundPreset | undefined;
  isAnimated: () => boolean;
  getBackgroundStyle: () => React.CSSProperties;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

interface BackgroundProviderProps {
  children: ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const [selectedBackground, setSelectedBackground] = useState('cubes-animated');

  const setBackground = (backgroundId: string) => {
    const preset = backgroundPresets.find(p => p.id === backgroundId);
    if (preset) {
      setSelectedBackground(backgroundId);
    }
  };

  const getCurrentPreset = () => {
    return backgroundPresets.find(p => p.id === selectedBackground);
  };

  const isAnimated = () => {
    const preset = getCurrentPreset();
    return preset?.type === 'animated';
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    const preset = getCurrentPreset();
    if (!preset) return {};

    return {
      backgroundImage: `url(${preset.assetPath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
  };

  const value: BackgroundContextType = {
    selectedBackground,
    setBackground,
    getCurrentPreset,
    isAnimated,
    getBackgroundStyle
  };

  return (
    <BackgroundContext.Provider value={value}>
      {children}
    </BackgroundContext.Provider>
  );
}

export function useBackground() {
  const context = useContext(BackgroundContext);
  if (context === undefined) {
    throw new Error('useBackground must be used within a BackgroundProvider');
  }
  return context;
}