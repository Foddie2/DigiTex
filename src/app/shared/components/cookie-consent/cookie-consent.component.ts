import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieConsentService } from '../../../core/services/cookie-consent';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (consentService.showBanner()) {
      <div
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
      >
        <div class="space-y-3">
          <div class="flex items-center space-x-2">
            <span class="text-xl">🍪</span>
            <h3 class="font-bold text-slate-900 dark:text-white text-base">Cookie Preferences</h3>
          </div>

          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            We use cookies synced directly with Shopify to deliver a secure shopping experience,
            analyze site usage, and support regional privacy regulations.
          </p>

          <div class="flex items-center space-x-3 pt-2">
            <button
              (click)="acceptAll()"
              class="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors duration-150"
            >
              Accept All
            </button>

            <button
              (click)="declineAll()"
              class="flex-1 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-xl transition-colors duration-150"
            >
              Decline Optional
            </button>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieConsentComponent {
  consentService = inject(CookieConsentService);

  acceptAll(): void {
    this.consentService.setConsent(true);
  }

  declineAll(): void {
    this.consentService.setConsent(false);
  }
}
