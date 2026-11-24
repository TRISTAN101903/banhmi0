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
  const [settings, setSettings] = useState<Record<string, string>>({});

  useEffect(() => {
    api.getSettings()
      .then((s) => setSettings(s || {}))
      .catch(() => {
        // Giữ giá trị mặc định nếu không tải được cài đặt (lỗi mạng tạm thời).
      });
  }, []);

  return (
    <StoreSettingsContext.Provider
      value={{
        logoUrl: settings.STORE_LOGO_URL || DEFAULT_LOGO,
        showcaseUrl: settings.STORE_SHOWCASE_URL || DEFAULT_SHOWCASE,
        conceptImageUrl: settings.STORE_CONCEPT_IMAGE_URL || DEFAULT_CONCEPT_IMAGE,
        settings,
      }}
    >
      {children}
    </StoreSettingsContext.Provider>
  );
};

export const useStoreSettings = () => useContext(StoreSettingsContext);
