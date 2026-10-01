'use client';

import * as React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';

interface NavigationContextType {
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  isLoading: boolean;
}

const NavigationContext = React.createContext<NavigationContextType>({
  startLoading: () => {},
  stopLoading: () => {},
  isLoading: false,
});

export function usePageLoading() {
  return React.useContext(NavigationContext);
}

function NavigationListener({
  startLoading,
  stopLoading,
}: {
  startLoading: (msg?: string) => void;
  stopLoading: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Route change complete
  React.useEffect(() => {
    stopLoading();
  }, [pathname, searchParams, stopLoading]);

  // Global click interception for link clicks
  React.useEffect(() => {
    const handleAnchorClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      let target = event.target as HTMLElement | null;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }

      if (!target || target.tagName !== 'A') return;

      const anchor = target as HTMLAnchorElement;
      const href = anchor.getAttribute('href');

      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('javascript:') ||
        anchor.target === '_blank' ||
        anchor.hasAttribute('download')
      ) {
        return;
      }

      try {
        const targetUrl = new URL(anchor.href, window.location.href);
        const currentUrl = new URL(window.location.href);

        if (
          targetUrl.origin === currentUrl.origin &&
          (targetUrl.pathname !== currentUrl.pathname || targetUrl.search !== currentUrl.search)
        ) {
          startLoading('Redirecting to PRISM-EDU section...');
        }
      } catch {
        if (href.startsWith('/') && href !== window.location.pathname) {
          startLoading('Redirecting to PRISM-EDU section...');
        }
      }
    };

    document.addEventListener('click', handleAnchorClick, { capture: true });
    return () => {
      document.removeEventListener('click', handleAnchorClick, { capture: true });
    };
  }, [startLoading]);

  return null;
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingMessage, setLoadingMessage] = React.useState('Loading PRISM-EDU section...');
  const startTimeRef = React.useRef<number | null>(null);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const startLoading = React.useCallback((message?: string) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    startTimeRef.current = Date.now();
    setLoadingMessage(message || 'Loading PRISM-EDU section...');
    setIsLoading(true);
  }, []);

  const stopLoading = React.useCallback(() => {
    if (!startTimeRef.current) {
      setIsLoading(false);
      return;
    }

    const elapsed = Date.now() - startTimeRef.current;
    const minDuration = 80; // Optimized lightning-fast client transition (80ms max)

    if (elapsed < minDuration) {
      const remaining = minDuration - elapsed;
      timerRef.current = setTimeout(() => {
        setIsLoading(false);
        startTimeRef.current = null;
      }, remaining);
    } else {
      setIsLoading(false);
      startTimeRef.current = null;
    }
  }, []);

  return (
    <NavigationContext.Provider value={{ startLoading, stopLoading, isLoading }}>
      <React.Suspense fallback={null}>
        <NavigationListener startLoading={startLoading} stopLoading={stopLoading} />
      </React.Suspense>
      {children}
      {isLoading && (
        <LoadingScreen message={loadingMessage} fullScreen={true} />
      )}
    </NavigationContext.Provider>
  );
}
