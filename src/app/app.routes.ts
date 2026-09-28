import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'DigiTex | Home',
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (m) => m.ProductsPageComponent || (m as any).ProductsComponent,
      ),
    title: 'Catalog | DigiTex',
  },

  // SERVICES ROUTE (Loads ProductsPageComponent with Clean /services URL)
  {
    path: 'services',
    loadComponent: () =>
      import('./pages/products/products.component').then(
        (m) => m.ProductsPageComponent || (m as any).ProductsComponent,
      ),
    title: 'Services | DigiTex',
  },

  {
    path: 'new-arrivals',
    redirectTo: '/products?features=New_Arrivals',
    pathMatch: 'full',
  },
  {
    path: 'track-order',
    loadComponent: () =>
      import('./pages/track-order/track-order.component').then((m) => m.TrackOrderComponent),
    title: 'Track Order | DigiTex',
  },
  {
    path: 'account',
    loadComponent: () =>
      import('./pages/account/account.component').then((m) => m.AccountComponent),
    title: 'Account | DigiTex',
  },
  {
    path: 'privacy-policy',
    loadComponent: () =>
      import('./pages/privacy-policy/privacy-policy.component').then(
        (m) => m.PrivacyPolicyComponent,
      ),
    title: 'Privacy Policy | DigiTex',
  },
  {
    path: 'terms-of-service',
    loadComponent: () =>
      import('./pages/terms-of-service/terms-of-service.component').then(
        (m) => m.TermsOfServiceComponent,
      ),
    title: 'Terms of Service | DigiTex',
  },
  { path: 'cookie-policy', redirectTo: 'privacy-policy', pathMatch: 'full' },

  // Catch-all Redirect to Home
  { path: '**', redirectTo: '' },
];
