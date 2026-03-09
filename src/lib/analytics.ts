const IS_PROD = import.meta.env.PROD;

// GA4 is now loaded directly in index.html — no dynamic init needed
export function initGA() {
  // noop — script is hardcoded in index.html
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
