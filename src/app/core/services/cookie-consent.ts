import { Injectable, inject, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

declare global {
  interface Window {
    Shopify?: {
      customerPrivacy?: {
        shouldShowBanner: () => boolean;
        getTrackingConsent: () => string;
        userCanBeTracked: () => boolean;
        setTrackingConsent: (
          consent: {
            analytics: boolean;
            marketing: boolean;
            preferences: boolean;
            sale_of_data: boolean;
            headlessStorefront?: boolean;
            checkoutRootDomain?: string;
            storefrontRootDomain?: string;
            storefrontAccessToken?: string;
          },
          callback: (res: any) => void,
        ) => void;
      };
    };
  }
}

@Injectable({
  providedIn: 'root',
})
export class CookieConsentService {
  private platformId = inject(PLATFORM_ID);

  private readonly shopifyDomain = 'techbytesstore.myshopify.com';
  private readonly storefrontAccessToken = 'YOUR_SHOPIFY_STOREFRONT_TOKEN';

  showBanner = signal<boolean>(false);
  isLoaded = signal<boolean>(false);

  initConsentTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    if (window.Shopify?.customerPrivacy) {
      this.evaluateConsentState();
      return;
    }

    // Dynamically load Shopify Customer Privacy Script
    const script = document.createElement('script');
    script.src =
      'https://cdn.shopify.com/shopifycloud/consent-tracking-api/v0.1/consent-tracking-api.js';
    script.async = true;
    script.onload = () => this.evaluateConsentState();
    script.onerror = () => console.warn('Shopify Customer Privacy script failed to load.');
    document.head.appendChild(script);
  }

  private evaluateConsentState(): void {
    if (!window.Shopify?.customerPrivacy) return;

    this.isLoaded.set(true);

    // Checks if current region mandates a cookie banner in Shopify Admin
    const shouldShow = window.Shopify.customerPrivacy.shouldShowBanner();
    // Returns 'yes', 'no', or '' (unanswered)
    const currentConsent = window.Shopify.customerPrivacy.getTrackingConsent();

    if (shouldShow && currentConsent === '') {
      this.showBanner.set(true);
    }
  }

  setConsent(accepted: boolean): void {
    if (!isPlatformBrowser(this.platformId) || !window.Shopify?.customerPrivacy) return;

    const consentParams = {
      analytics: accepted,
      marketing: accepted,
      preferences: accepted,
      sale_of_data: accepted,
      headlessStorefront: true,
      storefrontRootDomain: window.location.hostname,
      checkoutRootDomain: this.shopifyDomain,
      storefrontAccessToken: this.storefrontAccessToken,
    };

    window.Shopify.customerPrivacy.setTrackingConsent(consentParams, (res) => {
      this.showBanner.set(false);
    });
  }
}
