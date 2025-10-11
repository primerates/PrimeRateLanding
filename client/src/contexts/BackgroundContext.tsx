import { createContext, useContext, useState, ReactNode } from 'react';
import cubesBackground from '@assets/stock_images/abstract_geometric_c_b9135c5b.jpg';
import infinityGridBackground from '@assets/Infinity_1759031666053.png';
import jellyfishBackground from '@assets/Jelly Fish of the Deep Abyss_1759125741578.png';
import threeGlowingCubesBackground from '@assets/Three Glowing Cubes_1759260151137.png';
import cyberpunkCityBackground from '@assets/Neon Night in Cyberpunk City_1760171524435.png';

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
    id: 'default',
    label: 'Default',
    type: 'static',
    assetPath: '',
    description: 'Clean white background with logo',
    credits: 'Default',
    isDark: false
  },
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
  {
    id: 'cyberpunk-city',
    label: 'Neon Night in Cyberpunk City',
    type: 'static',
    assetPath: cyberpunkCityBackground,
    description: 'Futuristic cyberpunk cityscape with neon lights reflecting on wet streets',
    isDark: true
  },
];

interface BackgroundContextType {
  selectedBackground: string;
  loginBackground: string;
  setBackground: (backgroundId: string) => void;
  setLoginBackground: (backgroundId: string) => void;
  getCurrentPreset: () => BackgroundPreset | undefined;
  getLoginPreset: () => BackgroundPreset | undefined;
  isAnimated: () => boolean;
  isPulsing: () => boolean;
  isDarkBackground: () => boolean;
  getBackgroundStyle: () => React.CSSProperties;
  getLoginBackgroundStyle: () => React.CSSProperties;
}

const BackgroundContext = createContext<BackgroundContextType | undefined>(undefined);

interface BackgroundProviderProps {
  children: ReactNode;
}

export function BackgroundProvider({ children }: BackgroundProviderProps) {
  const [selectedBackground, setSelectedBackground] = useState(() => {
    const saved = localStorage.getItem('dashboardBackground');
    return saved || 'cubes-animated';
  });
  
  const [loginBackground, setLoginBackgroundState] = useState(() => {
    const saved = localStorage.getItem('loginBackground');
    return saved || 'cubes-animated';
  });

  const setBackground = (backgroundId: string) => {
    const preset = backgroundPresets.find(p => p.id === backgroundId);
    if (preset) {
      setSelectedBackground(backgroundId);
      localStorage.setItem('dashboardBackground', backgroundId);
    }
  };

  const setLoginBackground = (backgroundId: string) => {
    const preset = backgroundPresets.find(p => p.id === backgroundId);
    if (preset) {
      setLoginBackgroundState(backgroundId);
      localStorage.setItem('loginBackground', backgroundId);
    }
  };

  const getCurrentPreset = () => {
    return backgroundPresets.find(p => p.id === selectedBackground);
  };

  const getLoginPreset = () => {
    return backgroundPresets.find(p => p.id === loginBackground);
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

  const getLoginBackgroundStyle = (): React.CSSProperties => {
    const preset = getLoginPreset();
    if (!preset) return {};

    // Default option - no background image, just white
    if (preset.id === 'default' || !preset.assetPath) {
      return {
        backgroundColor: '#ffffff'
      };
    }

    // For login page, always use the background as a cover on the right side
    return {
      backgroundImage: `url(${preset.assetPath})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    };
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
        backgroundPosition: 'center 115%',
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
    loginBackground,
    setBackground,
    setLoginBackground,
    getCurrentPreset,
    getLoginPreset,
    isAnimated,
    isPulsing,
    isDarkBackground,
    getBackgroundStyle,
    getLoginBackgroundStyle
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