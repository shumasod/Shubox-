import { useState, useCallback } from 'react';
import { t, setLocale, getLocale } from '../i18n';

type Locale = 'ja' | 'en';

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>(getLocale() as Locale);

  const changeLocale = useCallback((next: Locale) => {
    setLocale(next);
    setLocaleState(next);
  }, []);

  return { t, locale, changeLocale };
}
