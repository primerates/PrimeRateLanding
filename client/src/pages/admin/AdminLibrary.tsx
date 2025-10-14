import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { ArrowLeft, Plus, Minus, User, Sun, Moon, Palette, Sparkles, RotateCcw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

// Dashboard shortcuts menu items
const dashboardMenuItems = [
  // Row 1
  { label: 'Lead', path: '/admin/add-client' },
  { label: 'Quote', path: '/admin/quotes' },
  { label: 'Loan Prep', path: '/admin/loan-prep' },
  { label: 'Loan', path: '/admin/pipeline' },
  { label: 'Funded', path: '/admin/funded' },
  // Row 2
  { label: 'Closed', path: '/admin/records' },
  { label: 'Dashboard', path: '/admin/reports' },
  // Row 3
  { label: 'Library', path: '/admin/library' },
  { label: 'Settings', path: '/admin/add-comment' },
];

export default function AdminLibrary() {
  const [, setLocation] = useLocation();
  const [isBorrowerOpen, setIsBorrowerOpen] = useState(true);
  const [hasCoBorrower, setHasCoBorrower] = useState(false);
  const [shortcutDropdownOpen, setShortcutDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  // Advanced color controls
  const [bgHue, setBgHue] = useState(270);
  const [bgSaturation, setBgSaturation] = useState(50);
  const [bgLightness, setBgLightness] = useState(15);
  
  const [cardHue, setCardHue] = useState(270);
  const [cardSaturation, setCardSaturation] = useState(30);
  const [cardLightness, setCardLightness] = useState(25);

  const [borderHue, setBorderHue] = useState(270);
  const [borderSaturation, setBorderSaturation] = useState(50);
  const [borderLightness, setBorderLightness] = useState(40);
  const [borderOpacity, setBorderOpacity] = useState(30);
  const [borderWidth, setBorderWidth] = useState(1);

  const [headingHue, setHeadingHue] = useState(0);
  const [headingSaturation, setHeadingSaturation] = useState(0);
  const [headingLightness, setHeadingLightness] = useState(100);
  
  const [bodyHue, setBodyHue] = useState(270);
  const [bodySaturation, setBodySaturation] = useState(20);
  const [bodyLightness, setBodyLightness] = useState(70);

  const [accentHue, setAccentHue] = useState(280);
  const [accentSaturation, setAccentSaturation] = useState(80);
  const [accentLightness, setAccentLightness] = useState(60);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [middleName, setMiddleName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [ssn, setSsn] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('Select');
  const [relationshipToCoBorrower, setRelationshipToCoBorrower] = useState('N/A');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [preferredContactTime, setPreferredContactTime] = useState('Select');
  
  // Current Residence fields
  const [currentResidenceType, setCurrentResidenceType] = useState<'owned' | 'rental' | 'other'>('owned');
  const [street, setStreet] = useState('');
  const [unit, setUnit] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [county, setCounty] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isPresent, setIsPresent] = useState(false);

  // Advanced color control functions
  const getBackgroundStyle = () => {
    if (isDarkMode) {
      return {
        background: `linear-gradient(to bottom right, hsl(${bgHue}, ${bgSaturation}%, ${bgLightness}%), hsl(${bgHue + 20}, ${bgSaturation + 10}%, ${bgLightness + 5}%), hsl(${bgHue}, ${bgSaturation}%, ${bgLightness}%))`
      };
    } else {
      return {
        background: `linear-gradient(to bottom right, hsl(${bgHue}, ${bgSaturation}%, ${bgLightness + 80}%), hsl(${bgHue + 20}, ${bgSaturation}%, ${bgLightness + 85}%), hsl(${bgHue + 40}, ${bgSaturation}%, ${bgLightness + 90}%))`
      };
    }
  };

  const getCardStyle = () => {
    if (isDarkMode) {
      return {
        backgroundColor: `hsla(${cardHue}, ${cardSaturation}%, ${cardLightness}%, 0.5)`,
        borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, ${borderOpacity / 100})`,
        borderWidth: `${borderWidth}px`
      };
    } else {
      return {
        backgroundColor: `hsla(${cardHue}, ${cardSaturation}%, ${cardLightness + 70}%, 0.8)`,
        borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness + 40}%, ${borderOpacity / 100})`,
        borderWidth: `${borderWidth}px`
      };
    }
  };

  const getHeadingStyle = () => {
    if (isDarkMode) {
      return {
        color: `hsl(${headingHue}, ${headingSaturation}%, ${headingLightness}%)`
      };
    } else {
      return {
        color: `hsl(${headingHue}, ${headingSaturation}%, ${100 - headingLightness}%)`
      };
    }
  };

  const getBodyStyle = () => {
    if (isDarkMode) {
      return {
        color: `hsl(${bodyHue}, ${bodySaturation}%, ${bodyLightness}%)`
      };
    } else {
      return {
        color: `hsl(${bodyHue}, ${bodySaturation}%, ${100 - bodyLightness + 20}%)`
      };
    }
  };

  const getAccentStyle = () => {
    return {
      background: `linear-gradient(to right, hsl(${accentHue}, ${accentSaturation}%, ${accentLightness}%), hsl(${accentHue + 20}, ${accentSaturation}%, ${accentLightness - 10}%))`
    };
  };

  const resetToDefaults = () => {
    setBgHue(270);
    setBgSaturation(50);
    setBgLightness(15);
    setCardHue(270);
    setCardSaturation(30);
    setCardLightness(25);
    setBorderHue(270);
    setBorderSaturation(50);
    setBorderLightness(40);
    setBorderOpacity(30);
    setBorderWidth(1);
    setHeadingHue(0);
    setHeadingSaturation(0);
    setHeadingLightness(100);
    setBodyHue(270);
    setBodySaturation(20);
    setBodyLightness(70);
    setAccentHue(280);
    setAccentSaturation(80);
    setAccentLightness(60);
  };

  const randomizeTheme = () => {
    const randomHue = Math.floor(Math.random() * 360);
    const complementaryHue = (randomHue + 180) % 360;
    
    setBgHue(randomHue);
    setBgSaturation(40 + Math.floor(Math.random() * 40));
    setBgLightness(isDarkMode ? 10 + Math.floor(Math.random() * 15) : 15);
    
    setCardHue(randomHue + Math.floor(Math.random() * 40) - 20);
    setCardSaturation(20 + Math.floor(Math.random() * 40));
    setCardLightness(isDarkMode ? 20 + Math.floor(Math.random() * 15) : 25);
    
    setBorderHue(complementaryHue);
    setBorderSaturation(50 + Math.floor(Math.random() * 40));
    setBorderLightness(40 + Math.floor(Math.random() * 30));
    setBorderOpacity(20 + Math.floor(Math.random() * 40));
    
    setAccentHue(randomHue + Math.floor(Math.random() * 60) - 30);
    setAccentSaturation(70 + Math.floor(Math.random() * 30));
    setAccentLightness(50 + Math.floor(Math.random() * 20));
  };

  // Slider Control Component
  const SliderControl = ({ label, value, onChange, min = 0, max = 360, gradientBg }: any) => (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-medium" style={getBodyStyle()}>{label}</label>
        <span className="text-xs" style={getBodyStyle()}>{value}{max === 360 ? '°' : '%'}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={onChange}
        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
        style={{ background: gradientBg }}
      />
    </div>
  );

  const formatDateOfBirth = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 2);
      if (digitsOnly.length > 2) {
        formatted += '/' + digitsOnly.substring(2, 4);
        if (digitsOnly.length > 4) {
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      }
    }
    return formatted;
  };

  const formatSSN = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 3);
      if (digitsOnly.length > 3) {
        formatted += '-' + digitsOnly.substring(3, 5);
        if (digitsOnly.length > 5) {
          formatted += '-' + digitsOnly.substring(5, 9);
        }
      }
    }
    return formatted;
  };

  const formatDate = (value: string) => {
    const digitsOnly = value.replace(/\D/g, '');
    let formatted = '';
    if (digitsOnly.length > 0) {
      formatted = digitsOnly.substring(0, 2);
      if (digitsOnly.length > 2) {
        formatted += '/' + digitsOnly.substring(2, 4);
        if (digitsOnly.length > 4) {
          formatted += '/' + digitsOnly.substring(4, 8);
        }
      }
    }
    return formatted;
  };

  // Helper to get label color
  const getLabelColor = () => {
    if (isDarkMode) {
      return { color: `hsl(${bodyHue}, ${bodySaturation - 10}%, ${bodyLightness + 10}%)` };
    } else {
      return { color: `hsl(${bodyHue}, ${bodySaturation}%, ${100 - bodyLightness + 30}%)` };
    }
  };

  // Helper to get input styles
  const getInputStyle = () => {
    if (isDarkMode) {
      return {
        backgroundColor: `hsla(${cardHue}, ${cardSaturation}%, ${cardLightness - 5}%, 0.5)`,
        color: `hsl(${bodyHue}, ${bodySaturation}%, ${bodyLightness}%)`,
        borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`
      };
    } else {
      return {
        backgroundColor: `hsla(${cardHue}, ${cardSaturation}%, ${cardLightness + 75}%, 0.9)`,
        color: `hsl(${bodyHue}, ${bodySaturation}%, ${100 - bodyLightness + 20}%)`,
        borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness + 40}%, 0.5)`
      };
    }
  };

  return (
    <div className="min-h-screen p-6 transition-all duration-300" style={getBackgroundStyle()}>
      <div className="container mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-black transition-colors" style={{ ...getHeadingStyle(), fontFamily: 'Orbitron, sans-serif' }} data-testid="heading-library">LoanView GPT</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="flex items-center justify-center w-10 h-10 rounded-lg border transition-all backdrop-blur-sm"
              style={{
                backgroundColor: isDarkMode ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255, 255, 255, 0.9)',
                borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`
              }}
              title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              data-testid="button-theme-toggle"
            >
              {isDarkMode ? <Sun className="w-5 h-5 text-yellow-300" /> : <Moon className="w-5 h-5 text-purple-600" />}
            </button>

            <button
              onClick={randomizeTheme}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all font-medium text-white backdrop-blur-sm"
              style={getAccentStyle()}
              data-testid="button-randomize"
            >
              <Sparkles className="w-5 h-5" />
              Surprise Me!
            </button>

            <button
              onClick={() => setShowCustomizer(!showCustomizer)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border transition-all font-medium text-white backdrop-blur-sm"
              style={getAccentStyle()}
              data-testid="button-customize"
            >
              <Palette className="w-5 h-5" />
              {showCustomizer ? 'Hide' : 'Customize'}
            </button>
            <DropdownMenu open={shortcutDropdownOpen} onOpenChange={setShortcutDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className="p-2 rounded-lg border transition-all backdrop-blur-sm"
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255, 255, 255, 0.9)',
                    borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`
                  }}
                  data-testid="button-shortcut"
                >
                  <User className="h-5 w-5" style={{ color: isDarkMode ? `hsl(${bodyHue}, ${bodySaturation}%, ${bodyLightness}%)` : `hsl(${bodyHue}, ${bodySaturation}%, ${100 - bodyLightness + 30}%)` }} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 backdrop-blur-xl" style={{
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`
              }}>
                {dashboardMenuItems.map((item, index) => (
                  <div key={item.path}>
                    <DropdownMenuItem
                      onClick={() => setLocation(item.path)}
                      className="cursor-pointer transition-all hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white focus:!bg-gradient-to-r focus:!from-purple-600 focus:!to-pink-600 focus:!text-white"
                      style={getBodyStyle()}
                      data-testid={`shortcut-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {item.label}
                    </DropdownMenuItem>
                    {(index === 4 || index === 6) && <DropdownMenuSeparator style={{backgroundColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`}} />}
                  </div>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              onClick={() => setLocation('/admin/dashboard')}
              className="flex items-center gap-2"
              style={getBodyStyle()}
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>

        {/* Advanced Color Customizer Panel */}
        {showCustomizer && (
          <div className="backdrop-blur-xl rounded-2xl p-6 border shadow-2xl transition-all" style={getCardStyle()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={getHeadingStyle()}>
                Advanced Color Controls
              </h2>
              <button
                onClick={resetToDefaults}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors backdrop-blur-sm"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(71, 85, 105, 0.5)' : 'rgba(255, 255, 255, 0.9)',
                  color: isDarkMode ? 'white' : '#1e293b',
                  border: `1px solid ${isDarkMode ? 'rgba(100, 116, 139, 0.5)' : 'rgba(203, 213, 225, 1)'}`
                }}
                data-testid="button-reset-theme"
              >
                <RotateCcw className="w-4 h-4" />
                Reset All
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              
              {/* Background Page Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={getHeadingStyle()}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(${bgHue}, ${bgSaturation}%, 50%)`}}></span>
                  Background Page
                </h3>
                <div className="space-y-3">
                  <SliderControl
                    label="Hue"
                    value={bgHue}
                    onChange={(e:any) => setBgHue(Number(e.target.value))}
                    max={360}
                    gradientBg="linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))"
                  />
                  <SliderControl
                    label="Saturation"
                    value={bgSaturation}
                    onChange={(e:any) => setBgSaturation(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${bgHue}, 0%, 50%), hsl(${bgHue}, 100%, 50%))`}
                  />
                  <SliderControl
                    label="Lightness"
                    value={bgLightness}
                    onChange={(e:any) => setBgLightness(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${bgHue}, ${bgSaturation}%, 0%), hsl(${bgHue}, ${bgSaturation}%, 50%), hsl(${bgHue}, ${bgSaturation}%, 100%))`}
                  />
                  <div className="p-3 rounded-lg border" style={{borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`}}>
                    <div className="h-16 rounded-lg" style={getBackgroundStyle()}></div>
                  </div>
                </div>
              </div>

              {/* Card/Main Area Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={getHeadingStyle()}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(${cardHue}, ${cardSaturation}%, 50%)`}}></span>
                  Card / Main Area
                </h3>
                <div className="space-y-3">
                  <SliderControl
                    label="Hue"
                    value={cardHue}
                    onChange={(e:any) => setCardHue(Number(e.target.value))}
                    max={360}
                    gradientBg="linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))"
                  />
                  <SliderControl
                    label="Saturation"
                    value={cardSaturation}
                    onChange={(e:any) => setCardSaturation(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${cardHue}, 0%, 50%), hsl(${cardHue}, 100%, 50%))`}
                  />
                  <SliderControl
                    label="Lightness"
                    value={cardLightness}
                    onChange={(e:any) => setCardLightness(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${cardHue}, ${cardSaturation}%, 0%), hsl(${cardHue}, ${cardSaturation}%, 50%), hsl(${cardHue}, ${cardSaturation}%, 100%))`}
                  />
                  <div className="p-3 rounded-lg border" style={{borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`}}>
                    <div className="h-16 rounded-lg border" style={getCardStyle()}></div>
                  </div>
                </div>
              </div>

              {/* Border/Frame Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={getHeadingStyle()}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(${borderHue}, ${borderSaturation}%, ${borderLightness}%)`}}></span>
                  Border / Frame
                </h3>
                <div className="space-y-3">
                  <SliderControl
                    label="Hue"
                    value={borderHue}
                    onChange={(e:any) => setBorderHue(Number(e.target.value))}
                    max={360}
                    gradientBg="linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))"
                  />
                  <SliderControl
                    label="Saturation"
                    value={borderSaturation}
                    onChange={(e:any) => setBorderSaturation(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${borderHue}, 0%, 50%), hsl(${borderHue}, 100%, 50%))`}
                  />
                  <SliderControl
                    label="Lightness"
                    value={borderLightness}
                    onChange={(e:any) => setBorderLightness(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${borderHue}, ${borderSaturation}%, 0%), hsl(${borderHue}, ${borderSaturation}%, 50%), hsl(${borderHue}, ${borderSaturation}%, 100%))`}
                  />
                  <SliderControl
                    label="Opacity"
                    value={borderOpacity}
                    onChange={(e:any) => setBorderOpacity(Number(e.target.value))}
                    max={100}
                    gradientBg="linear-gradient(to right, transparent, white)"
                  />
                  <SliderControl
                    label="Width"
                    value={borderWidth}
                    onChange={(e:any) => setBorderWidth(Number(e.target.value))}
                    max={8}
                    gradientBg={`hsl(${borderHue}, ${borderSaturation}%, ${borderLightness}%)`}
                  />
                </div>
              </div>

              {/* Heading Font Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={getHeadingStyle()}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(${headingHue}, ${headingSaturation}%, ${headingLightness}%)`}}></span>
                  Heading Font
                </h3>
                <div className="space-y-3">
                  <SliderControl
                    label="Hue"
                    value={headingHue}
                    onChange={(e:any) => setHeadingHue(Number(e.target.value))}
                    max={360}
                    gradientBg="linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))"
                  />
                  <SliderControl
                    label="Saturation"
                    value={headingSaturation}
                    onChange={(e:any) => setHeadingSaturation(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${headingHue}, 0%, 50%), hsl(${headingHue}, 100%, 50%))`}
                  />
                  <SliderControl
                    label="Lightness"
                    value={headingLightness}
                    onChange={(e:any) => setHeadingLightness(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${headingHue}, ${headingSaturation}%, 0%), hsl(${headingHue}, ${headingSaturation}%, 50%), hsl(${headingHue}, ${headingSaturation}%, 100%))`}
                  />
                  <div className="p-3 rounded-lg border" style={{borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`}}>
                    <h4 className="text-xl font-bold" style={getHeadingStyle()}>Sample Heading</h4>
                  </div>
                </div>
              </div>

              {/* Body Font Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={getHeadingStyle()}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(${bodyHue}, ${bodySaturation}%, ${bodyLightness}%)`}}></span>
                  Body Font
                </h3>
                <div className="space-y-3">
                  <SliderControl
                    label="Hue"
                    value={bodyHue}
                    onChange={(e:any) => setBodyHue(Number(e.target.value))}
                    max={360}
                    gradientBg="linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))"
                  />
                  <SliderControl
                    label="Saturation"
                    value={bodySaturation}
                    onChange={(e:any) => setBodySaturation(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${bodyHue}, 0%, 50%), hsl(${bodyHue}, 100%, 50%))`}
                  />
                  <SliderControl
                    label="Lightness"
                    value={bodyLightness}
                    onChange={(e:any) => setBodyLightness(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${bodyHue}, ${bodySaturation}%, 0%), hsl(${bodyHue}, ${bodySaturation}%, 50%), hsl(${bodyHue}, ${bodySaturation}%, 100%))`}
                  />
                  <div className="p-3 rounded-lg border" style={{borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`}}>
                    <p style={getBodyStyle()}>Sample body text for preview</p>
                  </div>
                </div>
              </div>

              {/* Accent Color Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2" style={getHeadingStyle()}>
                  <span className="w-2 h-2 rounded-full" style={{backgroundColor: `hsl(${accentHue}, ${accentSaturation}%, ${accentLightness}%)`}}></span>
                  Accent Color
                </h3>
                <div className="space-y-3">
                  <SliderControl
                    label="Hue"
                    value={accentHue}
                    onChange={(e:any) => setAccentHue(Number(e.target.value))}
                    max={360}
                    gradientBg="linear-gradient(to right, hsl(0, 100%, 50%), hsl(60, 100%, 50%), hsl(120, 100%, 50%), hsl(180, 100%, 50%), hsl(240, 100%, 50%), hsl(300, 100%, 50%), hsl(360, 100%, 50%))"
                  />
                  <SliderControl
                    label="Saturation"
                    value={accentSaturation}
                    onChange={(e:any) => setAccentSaturation(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${accentHue}, 0%, 50%), hsl(${accentHue}, 100%, 50%))`}
                  />
                  <SliderControl
                    label="Lightness"
                    value={accentLightness}
                    onChange={(e:any) => setAccentLightness(Number(e.target.value))}
                    max={100}
                    gradientBg={`linear-gradient(to right, hsl(${accentHue}, ${accentSaturation}%, 0%), hsl(${accentHue}, ${accentSaturation}%, 50%), hsl(${accentHue}, ${accentSaturation}%, 100%))`}
                  />
                  <div className="p-3 rounded-lg border" style={{borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`}}>
                    <div className="h-16 rounded-lg" style={getAccentStyle()}></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Main Content - Borrower Card with Dashboard Theme */}
        <Card className="backdrop-blur-xl border-l-4 transition-all duration-300 shadow-2xl" style={{...getCardStyle(), borderLeftColor: `hsl(${borderHue}, ${borderSaturation}%, ${borderLightness}%)`, borderLeftWidth: '4px'}}>
            <Collapsible open={isBorrowerOpen} onOpenChange={setIsBorrowerOpen}>
              <CardHeader className="border-b" style={{borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.2)`}}>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-2xl transition-colors" style={getHeadingStyle()}>
                    Borrower
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {!hasCoBorrower ? (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setHasCoBorrower(true)}
                        className="text-white border-0 shadow-lg hover:shadow-purple-500/50"
                        style={getAccentStyle()}
                        data-testid="button-add-coborrower"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Co-Borrower
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setHasCoBorrower(false)}
                        className="bg-red-600 hover:bg-red-700 text-white border-0"
                        data-testid="button-remove-coborrower"
                      >
                        Remove Co-Borrower
                      </Button>
                    )}
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="transition-all backdrop-blur-sm"
                            style={{
                              backgroundColor: isDarkMode ? 'rgba(147, 51, 234, 0.2)' : 'rgba(255, 255, 255, 0.9)',
                              color: isDarkMode ? `hsl(${bodyHue}, ${bodySaturation}%, ${bodyLightness}%)` : `hsl(${bodyHue}, ${bodySaturation}%, ${100 - bodyLightness + 30}%)`
                            }}
                            data-testid="button-toggle-borrower"
                          >
                            {isBorrowerOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                          </Button>
                        </CollapsibleTrigger>
                      </TooltipTrigger>
                      <TooltipContent className="backdrop-blur-xl" style={{
                        backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)',
                        borderColor: `hsla(${borderHue}, ${borderSaturation}%, ${borderLightness}%, 0.3)`
                      }}>
                        <p style={getBodyStyle()}>{isBorrowerOpen ? 'Minimize' : 'Expand'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-6 pt-6">
                  {/* Row 1: First Name, Middle Name, Last Name, Date of Birth, SSN */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="transition-colors" style={getLabelColor()}>First Name</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="placeholder:text-slate-400"
                        style={getInputStyle()}
                        data-testid="input-firstName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="middleName" className="transition-colors" style={getLabelColor()}>Middle Name</Label>
                      <Input
                        id="middleName"
                        value={middleName}
                        onChange={(e) => setMiddleName(e.target.value)}
                        className="placeholder:text-slate-400"
                        style={getInputStyle()}
                        data-testid="input-middleName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="transition-colors" style={getLabelColor()}>Last Name</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="placeholder:text-slate-400"
                        style={getInputStyle()}
                        data-testid="input-lastName"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="dateOfBirth" className="transition-colors" style={getLabelColor()}>Date of Birth</Label>
                      <Input
                        id="dateOfBirth"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(formatDateOfBirth(e.target.value))}
                        placeholder="MM/DD/YYYY"
                        maxLength={10}
                        className="placeholder:text-slate-400"
                        style={getInputStyle()}
                        data-testid="input-dateOfBirth"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="ssn" className="transition-colors" style={getLabelColor()}>SSN</Label>
                      <Input
                        id="ssn"
                        value={ssn}
                        onChange={(e) => setSsn(formatSSN(e.target.value))}
                        placeholder="XXX-XX-XXXX"
                        maxLength={11}
                        className="placeholder:text-slate-400"
                        style={getInputStyle()}
                        data-testid="input-ssn"
                      />
                    </div>
                  </div>
                  
                  {/* Row 2: Marital Status, Relationship to Co-Borrower, Phone, Email, Preferred Contact Time */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus" className={`transition-colors ${getLabelColor()}`}>Marital Status</Label>
                      <Select value={maritalStatus} onValueChange={setMaritalStatus}>
                        <SelectTrigger 
                          className={!isDarkMode 
                            ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500'
                            : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500'
                          }
                          data-testid="select-maritalStatus"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className={`backdrop-blur-xl ${
                          !isDarkMode
                            ? 'bg-white/95 border-purple-300'
                            : 'bg-slate-800/95 border-purple-500/30'
                        }`}>
                          <SelectItem value="Select" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Select</SelectItem>
                          <SelectItem value="single" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Single</SelectItem>
                          <SelectItem value="married" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Married</SelectItem>
                          <SelectItem value="divorced" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Divorced</SelectItem>
                          <SelectItem value="widowed" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Widowed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="relationshipToCoBorrower" className={`transition-colors ${getLabelColor()}`}>Relationship to Co-borrower</Label>
                      <Select value={relationshipToCoBorrower} onValueChange={setRelationshipToCoBorrower}>
                        <SelectTrigger 
                          className={!isDarkMode 
                            ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500'
                            : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500'
                          }
                          data-testid="select-relationshipToCoBorrower"
                        >
                          <SelectValue placeholder="N/A" />
                        </SelectTrigger>
                        <SelectContent className={`backdrop-blur-xl ${
                          !isDarkMode
                            ? 'bg-white/95 border-purple-300'
                            : 'bg-slate-800/95 border-purple-500/30'
                        }`}>
                          <SelectItem value="N/A" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>N/A</SelectItem>
                          <SelectItem value="spouse" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Spouse</SelectItem>
                          <SelectItem value="partner" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Partner</SelectItem>
                          <SelectItem value="sibling" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Sibling</SelectItem>
                          <SelectItem value="parent" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Parent</SelectItem>
                          <SelectItem value="child" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Child</SelectItem>
                          <SelectItem value="other" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone" className={`transition-colors ${getLabelColor()}`}>Phone</Label>
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(XXX) XXX-XXXX"
                        className={!isDarkMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-phone"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className={`transition-colors ${getLabelColor()}`}>Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@example.com"
                        className={!isDarkMode 
                          ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                          : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                        }
                        data-testid="input-email"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferredContactTime" className={`transition-colors ${getLabelColor()}`}>Preferred Contact Time</Label>
                      <Select value={preferredContactTime} onValueChange={setPreferredContactTime}>
                        <SelectTrigger 
                          className={!isDarkMode 
                            ? 'bg-slate-50 text-slate-900 border-purple-300 focus:border-purple-500'
                            : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500'
                          }
                          data-testid="select-preferredContactTime"
                        >
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent className={`backdrop-blur-xl ${
                          !isDarkMode
                            ? 'bg-white/95 border-purple-300'
                            : 'bg-slate-800/95 border-purple-500/30'
                        }`}>
                          <SelectItem value="Select" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Select</SelectItem>
                          <SelectItem value="morning" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Morning</SelectItem>
                          <SelectItem value="afternoon" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Afternoon</SelectItem>
                          <SelectItem value="evening" className={!isDarkMode ? 'text-slate-700 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white' : 'text-purple-200 hover:!bg-gradient-to-r hover:!from-purple-600 hover:!to-pink-600 hover:!text-white'}>Evening</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Current Residence Section */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-10">
                    <div className="space-y-2 flex items-center gap-2">
                      <Label className={`text-xl transition-colors ${getHeadingStyle()}`}>Current Residence</Label>
                    </div>
                    <div className="flex items-center gap-4 ml-1">
                      <button
                        type="button"
                        onClick={() => setCurrentResidenceType('owned')}
                        className="flex items-center gap-1.5 group"
                        data-testid="button-residence-owned"
                      >
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          currentResidenceType === 'owned' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                            : !isDarkMode
                              ? 'border-2 border-purple-400 bg-slate-50 hover:border-purple-500'
                              : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className={`text-sm font-medium ${!isDarkMode ? 'text-slate-700' : 'text-purple-200'}`}>Owned</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentResidenceType('rental')}
                        className="flex items-center gap-1.5 group"
                        data-testid="button-residence-rental"
                      >
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          currentResidenceType === 'rental' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                            : !isDarkMode
                              ? 'border-2 border-purple-400 bg-slate-50 hover:border-purple-500'
                              : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className={`text-sm font-medium ${!isDarkMode ? 'text-slate-700' : 'text-purple-200'}`}>Rental</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setCurrentResidenceType('other')}
                        className="flex items-center gap-1.5 group"
                        data-testid="button-residence-other"
                      >
                        <div className={`w-3 h-3 rounded-full transition-colors ${
                          currentResidenceType === 'other' 
                            ? 'bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/50' 
                            : !isDarkMode
                              ? 'border-2 border-purple-400 bg-slate-50 hover:border-purple-500'
                              : 'border-2 border-purple-400/50 bg-slate-700/50 hover:border-purple-400'
                        }`}>
                        </div>
                        <span className={`text-sm font-medium ${!isDarkMode ? 'text-slate-700' : 'text-purple-200'}`}>Other</span>
                      </button>
                    </div>
                  </div>

                  {/* Address Card with Dashboard Theme */}
                  <Card className={`backdrop-blur-xl shadow-2xl mt-6 ${
                    !isDarkMode
                      ? 'bg-slate-50/80 border-purple-200'
                      : 'bg-slate-800/50 border-purple-500/20'
                  }`}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="space-y-2 md:col-span-3">
                          <Label htmlFor="street" className={`font-semibold transition-colors ${getLabelColor()}`}>Street Address</Label>
                          <Input
                            id="street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                            className={!isDarkMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-street"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="unit" className={`font-semibold transition-colors ${getLabelColor()}`}>Unit/Apt</Label>
                          <Input
                            id="unit"
                            value={unit}
                            onChange={(e) => setUnit(e.target.value)}
                            className={!isDarkMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-unit"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="city" className={`font-semibold transition-colors ${getLabelColor()}`}>City</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            className={!isDarkMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-city"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="state" className={`font-semibold transition-colors ${getLabelColor()}`}>State</Label>
                          <Input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            placeholder="CA"
                            maxLength={2}
                            className={!isDarkMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-state"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="zipCode" className={`font-semibold transition-colors ${getLabelColor()}`}>ZIP Code</Label>
                          <Input
                            id="zipCode"
                            value={zipCode}
                            onChange={(e) => setZipCode(e.target.value)}
                            placeholder="12345"
                            maxLength={5}
                            className={!isDarkMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-zipCode"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="county" className={`font-semibold transition-colors ${getLabelColor()}`}>County</Label>
                          <Input
                            id="county"
                            value={county}
                            onChange={(e) => setCounty(e.target.value)}
                            className={!isDarkMode 
                              ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                              : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }
                            data-testid="input-county"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="fromDate" className={`font-semibold transition-colors ${getLabelColor()}`}>From</Label>
                          <Input
                            id="fromDate"
                            value={fromDate}
                            onChange={(e) => setFromDate(formatDate(e.target.value))}
                            placeholder="mm/dd/yyyy"
                            maxLength={10}
                            className={`!text-[13px] placeholder:text-[10px] ${
                              !isDarkMode 
                                ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                                : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }`}
                            data-testid="input-fromDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <div className="flex items-center justify-between mb-2">
                            <Label htmlFor="toDate" className={`text-sm font-semibold transition-colors ${getLabelColor()}`}>
                              {isPresent ? 'Present' : 'To'}
                            </Label>
                            <Switch
                              checked={isPresent}
                              onCheckedChange={(checked) => {
                                setIsPresent(checked);
                                if (checked) {
                                  setToDate('Present');
                                } else {
                                  setToDate('');
                                }
                              }}
                              data-testid="toggle-present"
                              className="scale-[0.8] data-[state=checked]:bg-purple-500"
                            />
                          </div>
                          <Input
                            id="toDate"
                            value={isPresent ? 'Present' : toDate}
                            onChange={(e) => !isPresent && setToDate(formatDate(e.target.value))}
                            placeholder="mm/dd/yyyy"
                            maxLength={10}
                            readOnly={isPresent}
                            className={`!text-[13px] placeholder:text-[10px] ${
                              !isDarkMode 
                                ? 'bg-white text-slate-900 border-purple-300 focus:border-purple-500 placeholder:text-slate-400'
                                : 'bg-slate-700/50 text-white border-purple-500/30 focus:border-purple-500 placeholder:text-slate-400'
                            }`}
                            data-testid="input-toDate"
                          />
                        </div>
                        
                        <div className="space-y-2 md:col-span-1">
                          <Label htmlFor="duration" className={`text-sm font-semibold transition-colors ${getLabelColor()}`}>Duration</Label>
                          <Input
                            id="duration"
                            value="0 Yrs 0 Mos"
                            readOnly
                            className={`cursor-not-allowed !text-[13px] ${
                              !isDarkMode
                                ? 'bg-purple-50 text-purple-700 border-purple-300'
                                : 'bg-slate-700/50 text-purple-300 border-purple-500/30'
                            }`}
                            data-testid="input-duration"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
      </div>
    </div>
  );
}
