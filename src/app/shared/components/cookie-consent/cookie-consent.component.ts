import {
  Component,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    @if (isVisible()) {
      <div
        class="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-9999 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 p-5 rounded-2xl border border-slate-300 dark:border-slate-700 shadow-2xl transition-all duration-300"
      >
        <div class="flex items-start gap-3">
          <span class="text-2xl shrink-0">🍪</span>
          <div class="space-y-2 flex-1">
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              Cookie & Privacy Preferences
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We use essential cookies and storage tokens to maintain your shopping cart, dark mode,
              and preferred currency. Read our
              <a
                routerLink="/cookie-policy"
                class="text-emerald-600 dark:text-emerald-400 underline hover:text-emerald-500 font-semibold"
                >Cookie Policy</a
              >.
            </p>

            <div class="flex items-center gap-2 pt-2">
              <button
                type="button"
                (click)="acceptAll()"
                class="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs py-2.5 px-3 rounded-xl transition shadow-md shadow-emerald-600/20 cursor-pointer text-center"
              >
                Accept All
              </button>
              <button
                type="button"
                (click)="acceptEssential()"
                class="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs py-2.5 px-3 rounded-xl transition cursor-pointer text-center"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class CookieConsentComponent implements OnInit, OnDestroy {
  private platformId = inject(PLATFORM_ID);

  isVisible = signal<boolean>(false);
  private timer: any = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent) {
        // Fallback: Trigger popup automatically after 1.5 seconds regardless of scroll
        this.timer = setTimeout(() => {
          this.isVisible.set(true);
        }, 1500);
      }
    }
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  @HostListener('window:scroll', [])
  onScroll(): void {
    if (isPlatformBrowser(this.platformId) && !this.isVisible()) {
      const consent = localStorage.getItem('cookie_consent');
      if (!consent && (window.scrollY > 20 || document.documentElement.scrollTop > 20)) {
        this.isVisible.set(true);
      }
    }
  }

  acceptAll(): void {
    this.saveConsent('all');
  }

  acceptEssential(): void {
    this.saveConsent('essential');
  }

  private saveConsent(type: 'all' | 'essential'): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('cookie_consent', type);
      this.isVisible.set(false);
    }
  }
}
