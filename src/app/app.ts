import { Component, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { CartDrawerComponent } from './shared/components/cart-drawer/cart-drawer.component';
import { CookieConsentComponent } from './shared/components/cookie-consent/cookie-consent.component';
import { CartService } from './core/services/cart';
import { AiChatbotComponent } from './shared/components/ai-chatbot/ai-chatbot.component';
import { CookieConsentService } from './core/services/cookie-consent';
import { AnalyticsService } from './core/services/analytics';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    Navbar,
    FooterComponent,
    CartDrawerComponent,
    CookieConsentComponent,
    AiChatbotComponent,
  ],
  template: `
    <app-navbar />
    <main
      class="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200"
    >
      <router-outlet />
    </main>
    <app-footer />

    <!-- Global Cart Drawer & Cookie Modal -->
    <app-cart-drawer />
    <app-cookie-consent />

    <!-- 3. Add Floating AI Chatbot Launcher -->
    <app-ai-chatbot />
  `,
})
export class AppComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private analytics = inject(AnalyticsService);
  private consentService = inject(CookieConsentService);
  public cartService = inject(CartService);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.analytics.initRouteTracking();
      this.consentService.initConsentTracking();
      this.cartService.initCart();
    }
  }
}
