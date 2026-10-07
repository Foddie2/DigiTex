import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

declare const gtag: Function;

export interface AnalyticsItem {
  item_id: string; // Shopify Variant ID or SKU
  item_name: string; // Product Title
  price: number;
  quantity: number;
  item_category?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AnalyticsService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  /**
   * Listens to Angular Router for SPA pageviews
   */
  initRouteTracking(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.trackPageView(event.urlAfterRedirects);
      });
  }

  trackPageView(path: string): void {
    if (!this.canTrack()) return;

    gtag('event', 'page_view', {
      page_path: path,
      page_title: document.title,
    });
  }

  // --- E-Commerce & Google Ads Tracking ---

  trackViewItem(item: AnalyticsItem, currency = 'USD'): void {
    if (!this.canTrack()) return;

    gtag('event', 'view_item', {
      currency,
      value: item.price,
      items: [item],
    });
  }

  trackAddToCart(item: AnalyticsItem, currency = 'USD'): void {
    if (!this.canTrack()) return;

    gtag('event', 'add_to_cart', {
      currency,
      value: item.price * item.quantity,
      items: [item],
    });
  }

  trackRemoveFromCart(item: AnalyticsItem, currency = 'USD'): void {
    if (!this.canTrack()) return;

    gtag('event', 'remove_from_cart', {
      currency,
      value: item.price * item.quantity,
      items: [item],
    });
  }

  trackBeginCheckout(items: AnalyticsItem[], totalValue: number, currency = 'USD'): void {
    if (!this.canTrack()) return;

    // GA4 Begin Checkout Event
    gtag('event', 'begin_checkout', {
      currency,
      value: totalValue,
      items,
    });

    // Google Ads Conversion Event (Replace AW-YYYYYYYYY/CONVERSION_LABEL with actual ID)
    gtag('event', 'conversion', {
      send_to: 'AW-YYYYYYYYY/CONVERSION_LABEL',
      value: totalValue,
      currency,
    });
  }

  // --- Account & Auth Tracking ---

  trackAuth(method: 'email' | 'google' | 'shopify', type: 'login' | 'sign_up'): void {
    if (!this.canTrack()) return;

    gtag('event', type, {
      method,
    });
  }

  trackAccountView(tabName: string): void {
    if (!this.canTrack()) return;

    gtag('event', 'account_navigation', {
      account_tab: tabName,
    });
  }

  // --- Order Tracking & Policy Pages ---

  trackOrderSearch(orderId: string, statusFound: boolean): void {
    if (!this.canTrack()) return;

    gtag('event', 'search_order_status', {
      order_id: orderId,
      status_found: statusFound,
    });
  }

  trackPolicyView(policyType: 'terms_of_service' | 'privacy_policy'): void {
    if (!this.canTrack()) return;

    gtag('event', 'view_policy', {
      policy_name: policyType,
    });
  }

  // --- AI Chatbot Tracking ---

  trackChatInteraction(
    action: 'opened' | 'message_sent' | 'product_clicked',
    label?: string,
  ): void {
    if (!this.canTrack()) return;

    gtag('event', 'chatbot_interaction', {
      action,
      label: label || '',
    });
  }

  private canTrack(): boolean {
    return isPlatformBrowser(this.platformId) && typeof gtag !== 'undefined';
  }
}
