import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api.js';

const DEFAULT_LOGO = '/logo_banhmi0.jpg';
const DEFAULT_SHOWCASE = '/store_showcase.jpg';
const DEFAULT_CONCEPT_IMAGE = '/store_showcase.jpg';

interface StoreSettingsContextType {
  logoUrl: string;
  showcaseUrl: string;
  conceptImageUrl: string;
  settings: Record<string, string>;
}

const StoreSettingsContext = createContext<StoreSettingsContextType>({
  logoUrl: DEFAULT_LOGO,
  showcaseUrl: DEFAULT_SHOWCASE,
  conceptImageUrl: DEFAULT_CONCEPT_IMAGE,
  settings: {},
});

export const StoreSettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [logoUrl, setLogoUrl] = useState(DEFAULT_LOGO);
  const [showcaseUrl, setShowcaseUrl] = useState(DEFAULT_SHOWCASE);
  const [conceptImageUrl, setConceptImageUrl] = useState(DEFAULT_CONCEPT_IMAGE);
  const [allSettings, setAllSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getSettings()
      .then((settings) => {
        setAllSettings(settings || {});
        if (settings.STORE_LOGO_URL) setLogoUrl(settings.STORE_LOGO_URL);
        if (settings.STORE_SHOWCASE_URL) setShowcaseUrl(settings.STORE_SHOWCASE_URL);
        if (settings.STORE_CONCEPT_IMAGE_URL) setConceptImageUrl(settings.STORE_CONCEPT_IMAGE_URL);
      })
      .catch(() => {
        // Giữ ảnh mặc định nếu không tải được cài đặt (lỗi mạng tạm thời).
      });
  }, []);

  return (
    <StoreSettingsContext.Provider value={{ logoUrl, showcaseUrl, conceptImageUrl, settings: allSettings }}>
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
