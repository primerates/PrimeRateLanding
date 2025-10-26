import { useState } from 'react';

/**
 * Third Party Services structure
 */
export interface ThirdPartyService {
  id: string;
  serviceName: string;
}

export interface ThirdPartyCategory {
  id: string;
  categoryName: string;
  services: ThirdPartyService[];
}

/**
 * Custom hook to manage Third Party Services state
 */
export const useThirdPartyServices = () => {
  const [thirdPartyServiceValues, setThirdPartyServiceValues] = useState<{
    [serviceId: string]: string[];
  }>({
    's1': Array(4).fill(''), // VA Funding Fee
    's2': Array(4).fill(''), // Appraisal Inspection
    's4': Array(4).fill(''), // Underwriting Services
    's8': Array(4).fill(''), // Processing Services
    's9': Array(4).fill(''), // Credit Report Services
    's5': Array(4).fill(''), // Title & Escrow Services
    's6': Array(4).fill(''), // Pay Off Interest
    's7': Array(4).fill(''), // State Tax & Recording
  });

  const [categorySameModes, setCategorySameModes] = useState<{ [categoryId: string]: boolean }>({
    '1': false, // Third Party Services
  });

  // Define Third Party Services structure
  const currentThirdPartyServices: ThirdPartyCategory[] = [
    {
      id: '1',
      categoryName: 'Third Party Services',
      services: [
        { id: 's1', serviceName: 'VA Funding Fee' },
        { id: 's2', serviceName: 'Appraisal Inspection' },
        { id: 's4', serviceName: 'Underwriting Services' },
        { id: 's8', serviceName: 'Processing Services' },
        { id: 's9', serviceName: 'Credit Report Services' },
        { id: 's5', serviceName: 'Title & Escrow Services' },
        { id: 's7', serviceName: 'State Tax & Recording' },
      ]
    }
  ];

  return {
    thirdPartyServiceValues,
    setThirdPartyServiceValues,
    categorySameModes,
    setCategorySameModes,
    currentThirdPartyServices,
  };
};
