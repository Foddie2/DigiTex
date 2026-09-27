import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  picture?: string;
}

declare const google: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private scriptLoadedPromise: Promise<void> | null = null;

  private readonly googleClientId =
    '148437308582-s7s39so50nalpo17o7q8oe1u5kjd1imo.apps.googleusercontent.com';

  // 5 Hours Inactivity Duration in Milliseconds (5 * 60 * 60 * 1000)
  private readonly TIMEOUT_MS = 18_000_000;
  private timeoutId: any = null;
  private lastActivityUpdate = 0;

  public isLoggedIn = signal<boolean>(false);
  public currentUser = signal<UserProfile | null>(null);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      this.restoreSession();
      this.scriptLoadedPromise = this.loadGoogleScript();
    }
  }

  private loadGoogleScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (document.getElementById('google-jssdk')) {
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.id = 'google-jssdk';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }

  /**
   * Opens the Google Account Picker popup in local & production
   */
  async loginWithGoogle(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      if (this.scriptLoadedPromise) {
        await this.scriptLoadedPromise;
      }

      if (typeof google !== 'undefined' && google.accounts?.oauth2) {
        const client = google.accounts.oauth2.initTokenClient({
          client_id: this.googleClientId,
          scope: 'email profile openid',
          callback: async (response: any) => {
            if (response.access_token) {
              await this.fetchGoogleUserProfile(response.access_token);
            } else if (response.error) {
              console.error('Google OAuth Error Response:', response);
            }
          },
        });
        client.requestAccessToken();
      } else {
        console.error('Google SDK failed to load.');
      }
    } catch (err) {
      console.error('Error during Google sign-in:', err);
    }
  }

  private async fetchGoogleUserProfile(accessToken: string): Promise<void> {
    try {
      const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) {
        throw new Error(`UserInfo API returned status ${res.status}`);
      }

      const data = await res.json();

      const user: UserProfile = {
        id: data.sub,
        name: data.name || 'digitex Customer',
        email: data.email,
        picture: data.picture,
        initials: (data.name || data.email)
          .split(' ')
          .map((n: string) => n[0])
          .join('')
          .toUpperCase()
          .slice(0, 2),
      };

      this.setUserSession(user);
    } catch (err) {
      console.error('Failed to fetch Google profile:', err);
    }
  }

  private setUserSession(user: UserProfile): void {
    this.currentUser.set(user);
    this.isLoggedIn.set(true);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('digitex_customer', JSON.stringify(user));
      this.recordActivity();
      this.setupActivityListeners();
    }
  }

  private restoreSession(): void {
    const saved = localStorage.getItem('digitex_customer');
    const lastActiveStr = localStorage.getItem('digitex_last_active');

    if (saved && lastActiveStr) {
      const lastActive = parseInt(lastActiveStr, 10);
      const now = Date.now();

      if (now - lastActive >= this.TIMEOUT_MS) {
        this.logout();
        return;
      }

      try {
        const user = JSON.parse(saved);
        this.currentUser.set(user);
        this.isLoggedIn.set(true);
        this.recordActivity();
        this.setupActivityListeners();
      } catch (e) {
        this.logout();
      }
    } else {
      this.logout();
    }
  }

  private recordActivity(): void {
    const now = Date.now();
    this.lastActivityUpdate = now;
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('digitex_last_active', now.toString());
    }
    this.startInactivityTimer();
  }

  private startInactivityTimer(): void {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
    this.timeoutId = setTimeout(() => {
      this.logout();
    }, this.TIMEOUT_MS);
  }

  private onUserActivity = (): void => {
    if (!this.isLoggedIn()) return;

    const now = Date.now();
    if (now - this.lastActivityUpdate > 60_000) {
      this.recordActivity();
    }
  };

  private setupActivityListeners(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => {
      window.addEventListener(evt, this.onUserActivity, { passive: true });
    });
  }

  private removeActivityListeners(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((evt) => {
      window.removeEventListener(evt, this.onUserActivity);
    });
  }

  logout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('digitex_customer');
      localStorage.removeItem('digitex_last_active');
      this.removeActivityListeners();
    }
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }
    this.isLoggedIn.set(false);
    this.currentUser.set(null);
  }
}
