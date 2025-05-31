import { useSettings } from '../context/SettingsContext';
import { translations } from '../locales/translations';

export const useTranslation = () => {
  const { settings } = useSettings();
  
  const t = (key) => {
    const currentLanguage = settings.language || 'tr';
    return translations[currentLanguage][key] || key;
  };
  
  return { t };
}; 