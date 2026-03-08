const IS_PROD = import.meta.env.PROD;

// Google Analytics 4
const GA_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID as string | undefined;

export function initGA() {
  if (!GA_ID || !IS_PROD) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  (window as any).gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID);
}

export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof (window as any).gtag === 'function') {
    (window as any).gtag('event', name, params);
  }
}

// Microsoft Clarity
const CLARITY_ID = import.meta.env.VITE_CLARITY_ID as string | undefined;

export function initClarity() {
  if (!CLARITY_ID || !IS_PROD) return;
  (function (c: any, l: any, a: any, r: any, i: any) {
    c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0] as HTMLScriptElement;
    y.parentNode!.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
}
