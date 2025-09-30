import { createContext, useContext, useState, ReactNode } from 'react';
import cubesBackground from '@assets/stock_images/abstract_geometric_c_b9135c5b.jpg';
import infinityGridBackground from '@assets/Infinity_1759031666053.png';
import glowingCubeBackground from '@assets/glowing cube_1759038202702.jpg';
import jellyfishBackground from '@assets/Jelly Fish of the Deep Abyss_1759125741578.png';
import threeGlowingCubesBackground from '@assets/Three Glowing Cubes_1759260151137.png';

export type BackgroundType = 'animated' | 'static' | 'pulsing';

export interface BackgroundPreset {
  id: string;
  label: string;
  type: BackgroundType;
  assetPath: string;
  description: string;
  credits?: string;
  isDark?: boolean;
}

// Background presets configuration
export const backgroundPresets: BackgroundPreset[] = [
  {
    id: 'cubes-animated',
    label: 'Geometric Cubes (Animated)',
    type: 'animated',
    assetPath: cubesBackground,
    description: 'Cool animated focus effect with geometric cubes background',
    credits: 'Default',
    isDark: false
  },
  {
    id: 'infinity-grid',
    label: 'Infinity Grid',
    type: 'static',
    assetPath: infinityGridBackground,
    description: 'Futuristic infinity grid with deep blue tones',
    isDark: true
  },
  {
    id: 'glowing-cube-static',
    label: 'Glowing Cube (Static)',
    type: 'static',
    assetPath: glowingCubeBackground,
    description: 'Vibrant glowing cubes floating in dark space',
    isDark: true
  },
  {
    id: 'jellyfish-abyss',
    label: 'Jellyfish of the Deep Abyss',
    type: 'static',
    assetPath: jellyfishBackground,
    description: 'Ethereal jellyfish floating in the deep ocean abyss with luminous tentacles',
    isDark: true
  },
  {
    id: 'cubes',
    label: 'Cubes',
    type: 'static',
    assetPath: threeGlowingCubesBackground,
    description: 'Three glowing gradient cubes on dark background',
    isDark: true
  },
];

interface BackgroundContextType {
  selectedBackground: string;
  setBackground: (backgroundId: string) => void;
  getCurrentPreset: () => BackgroundPreset | undefined;
  isAnimated: () => boolean;
  isPulsing: () => boolean;
  isDarkBackground: () => boolean;
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

  const isPulsing = () => {
    const preset = getCurrentPreset();
    return preset?.type === 'pulsing';
  };

  const isDarkBackground = () => {
    const preset = getCurrentPreset();
    return preset?.isDark ?? false;
  };

  const getBackgroundStyle = (): React.CSSProperties => {
    const preset = getCurrentPreset();
    if (!preset) return {};

    // Special styling for jellyfish background - black background with 50% smaller jellyfish below tiles
    if (preset.id === 'jellyfish-abyss') {
      const baseStyle = {
        backgroundColor: '#000000',
        backgroundImage: `url(${preset.assetPath})`,
        backgroundSize: '50%',
        backgroundPosition: 'center 95%',
        backgroundRepeat: 'no-repeat'
      };

      if (preset.type === 'pulsing') {
        return {
          ...baseStyle,
          animation: 'pulse-glow 3s ease-in-out infinite'
        };
      }

      return baseStyle;
    }

    // Special styling for cubes background - black background with 50% smaller cubes positioned below tiles
    if (preset.id === 'cubes') {
      const baseStyle = {
        backgroundColor: '#000000',
        backgroundImage: `url(${preset.assetPath})`,
        backgroundSize: '50%',
        backgroundPosition: 'center 95%',
        backgroundRepeat: 'no-repeat'
      };

      if (preset.type === 'pulsing') {
        return {
          ...baseStyle,
          animation: 'pulse-glow 3s ease-in-out infinite'
        };
      }

      return baseStyle;
    }

    // Default styling for other backgrounds
    const baseStyle = {
      backgroundImage: `url(${preset.assetPath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };

    // Add pulsing animation for pulsing type
    if (preset.type === 'pulsing') {
      return {
        ...baseStyle,
        animation: 'pulse-glow 3s ease-in-out infinite'
      };
    }

    return baseStyle;
  };

  const value: BackgroundContextType = {
    selectedBackground,
    setBackground,
    getCurrentPreset,
    isAnimated,
    isPulsing,
    isDarkBackground,
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