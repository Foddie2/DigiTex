import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

// Core Services
import { CartService } from '../../../core/services/cart';
import { ThemeService } from '../../../core/services/theme';
import { LanguageService } from '../../../core/services/language';
import { CurrencyService } from '../../../core/services/currency';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header
      class="w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 transition-colors duration-300 sticky top-0 z-50 shadow-xs"
    >
      <!-- 1. Top Utility Bar -->
      <div
        class="bg-slate-100/90 dark:bg-slate-950 text-xs sm:text-sm text-slate-600 dark:text-slate-400 py-1.5 px-4 lg:px-8 border-b border-slate-200/60 dark:border-slate-800/80 transition-colors"
      >
        <div class="max-w-7xl mx-auto flex justify-between items-center">
          <p class="hidden sm:flex items-center gap-2 font-medium tracking-tight">
            ⚡ Express global shipping on all verified orders over
            {{ currencyService.formatPrice({ amount: 50, currencyCode: 'USD' }) }}
          </p>

          <div class="flex items-center gap-4 ml-auto font-medium">
            <!-- Track Order Link -->
            <a
              routerLink="/track-order"
              class="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5 py-0.5"
              title="Track live shipment status"
            >
              <span class="material-symbols-outlined text-[16px]">local_shipping</span>
              <span>Track Order</span>
            </a>

            <span class="text-slate-300 dark:text-slate-800" aria-hidden="true">|</span>

            <!-- Language Selector Dropdown -->
            <div class="relative">
              <button
                (click)="toggleDropdown('lang')"
                aria-label="Select Language"
                [attr.aria-expanded]="isLangOpen()"
                class="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-200 font-medium cursor-pointer py-0.5"
              >
                <span>🌐 {{ languageService.selectedLang() }}</span>
                <span
                  class="material-symbols-outlined text-[16px] transition-transform duration-200"
                  [class.rotate-180]="isLangOpen()"
                  >expand_more</span
                >
              </button>

              @if (isLangOpen()) {
                <div
                  (mouseleave)="isLangOpen.set(false)"
                  class="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xl py-1 z-50 animate-fadeIn"
                >
                  <button
                    (click)="selectLang('EN')"
                    class="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition-colors duration-150 cursor-pointer dark:text-slate-200"
                  >
                    English (EN)
                  </button>
                  <button
                    (click)="selectLang('ES')"
                    class="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition-colors duration-150 cursor-pointer dark:text-slate-200"
                  >
                    Español (ES)
                  </button>
                  <button
                    (click)="selectLang('FR')"
                    class="w-full text-left px-3.5 py-1.5 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-semibold transition-colors duration-150 cursor-pointer dark:text-slate-200"
                  >
                    Français (FR)
                  </button>
                </div>
              }
            </div>

            <span class="text-slate-300 dark:text-slate-800" aria-hidden="true">|</span>

            <!-- Dark Mode Switcher -->
            <button
              (click)="themeService.toggleDarkMode()"
              class="rounded-md hover:bg-transparent dark:hover:bg-transparent transition-colors duration-200 cursor-pointer flex items-center justify-center"
              [attr.aria-label]="
                themeService.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode'
              "
              title="Toggle Theme"
            >
              @if (themeService.isDarkMode()) {
                <span class="material-symbols-outlined text-[15px] text-emerald-400"
                  >light_mode</span
                >
              } @else {
                <span class="material-symbols-outlined text-[15px] text-slate-600">dark_mode</span>
              }
            </button>
          </div>
        </div>
      </div>

      <!-- 2. Main Header / Branding Section -->
      <div
        class="max-w-7xl mx-auto px-4 lg:px-8 py-3.5 flex items-center justify-between gap-4 sm:gap-8"
      >
        <!-- Brand Logo -->
        <a
          routerLink="/"
          class="rubik-glitch-regular text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-wide flex items-center gap-1 group transition-transform duration-200 active:scale-95"
          aria-label="DigiTex E-Commerce Home"
        >
          <span
            class="text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-500 transition-colors"
            >Digi</span
          >Tex
        </a>

        <!-- Search Bar (Desktop) -->
        <div class="hidden md:flex flex-1 max-w-lg relative">
          <input
            type="search"
            [value]="searchQuery()"
            (input)="searchQuery.set($any($event.target).value)"
            (keyup.enter)="onSearch()"
            placeholder="Search products, services, tech categories..."
            aria-label="Search Catalog"
            class="w-full bg-slate-100/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 pl-4 pr-11 py-2.5 rounded-full border border-slate-200/80 dark:border-slate-700/60 focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:ring-2 focus:ring-emerald-500/20 outline-none text-sm transition-all duration-200 placeholder:text-slate-400"
          />
          <button
            (click)="onSearch()"
            aria-label="Submit Search"
            class="absolute right-1.5 top-1.5 p-1.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 rounded-full cursor-pointer transition-colors duration-200 flex items-center justify-center"
            title="Execute Search"
          >
            <span class="material-symbols-outlined text-[20px]">search</span>
          </button>
        </div>

        <!-- Action Items -->
        <div class="flex items-center gap-1 sm:gap-2">
          <!-- ACCOUNT DROPDOWN MENU -->
          <div class="relative">
            <button
              (click)="toggleDropdown('account')"
              [attr.aria-expanded]="isAccountOpen()"
              aria-label="User Profile & Order Account Menu"
              class="p-1 rounded-full transition-all duration-200 cursor-pointer flex items-center group"
              [title]="
                authService.isLoggedIn()
                  ? 'Logged in as ' + (authService.currentUser()?.name || 'Customer')
                  : 'Customer Account'
              "
            >
              @if (authService.isLoggedIn() && authService.currentUser()) {
                <div class="relative flex items-center justify-center">
                  @if (authService.currentUser()?.picture) {
                    <img
                      [src]="authService.currentUser()?.picture"
                      [alt]="authService.currentUser()?.name || 'User Avatar'"
                      referrerpolicy="no-referrer"
                      class="w-8 h-8 rounded-full object-cover border-2 border-emerald-600/40 group-hover:border-emerald-600 transition-colors"
                    />
                  } @else {
                    <div
                      class="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-black text-xs flex items-center justify-center"
                    >
                      {{ authService.currentUser()?.initials || 'VC' }}
                    </div>
                  }
                  <span
                    class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full"
                    title="Active Session"
                  ></span>
                </div>
              } @else {
                <div
                  class="p-2 text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-full transition-all flex items-center justify-center"
                >
                  <span class="material-symbols-outlined text-[24px]">account_circle</span>
                </div>
              }
            </button>

            @if (isAccountOpen()) {
              <div
                (mouseleave)="isAccountOpen.set(false)"
                class="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xl py-2 z-50 divide-y divide-slate-100 dark:divide-slate-700/60 animate-fadeIn"
              >
                <div class="px-4 py-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-t-2xl">
                  <p
                    class="text-[11px] font-extrabold uppercase text-emerald-600 dark:text-emerald-400 tracking-wider"
                  >
                    {{ authService.isLoggedIn() ? 'Verified Customer' : 'Account profile' }}
                  </p>
                  <p class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{
                      authService.isLoggedIn()
                        ? authService.currentUser()?.name || 'Customer Dashboard'
                        : 'Guest Visitor'
                    }}
                  </p>
                  @if (authService.isLoggedIn() && authService.currentUser()?.email) {
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {{ authService.currentUser()?.email }}
                    </p>
                  }
                </div>

                <div class="py-1">
                  <a
                    routerLink="/account"
                    [queryParams]="{ tab: 'overview' }"
                    (click)="isAccountOpen.set(false)"
                    class="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50/80 dark:hover:bg-slate-700/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
                  >
                    <span class="material-symbols-outlined text-[20px] text-slate-400"
                      >dashboard</span
                    >
                    <span>My Account</span>
                  </a>

                  <a
                    routerLink="/account"
                    [queryParams]="{ tab: 'orders' }"
                    (click)="isAccountOpen.set(false)"
                    class="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50/80 dark:hover:bg-slate-700/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors animate-pulse duration-150"
                  >
                    <span class="material-symbols-outlined text-[20px] text-slate-400"
                      >local_shipping</span
                    >
                    <span>Orders Placed</span>
                  </a>

                  <a
                    routerLink="/account"
                    [queryParams]="{ tab: 'wishlist' }"
                    (click)="isAccountOpen.set(false)"
                    class="flex items-center gap-3 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-emerald-50/80 dark:hover:bg-slate-700/60 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors animate-pulse duration-150"
                  >
                    <span class="material-symbols-outlined text-[20px] text-slate-400"
                      >favorite</span
                    >
                    <span>Wishlist</span>
                  </a>
                </div>

                <div class="py-2 px-4 bg-slate-50/30 dark:bg-slate-800/30 rounded-b-2xl">
                  @if (authService.isLoggedIn()) {
                    <button
                      (click)="authService.logout(); isAccountOpen.set(false)"
                      class="w-full text-left text-xs font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer py-1"
                    >
                      Sign Out
                    </button>
                  } @else {
                    <button
                      (click)="authService.loginWithGoogle(); isAccountOpen.set(false)"
                      class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline inline-flex items-center gap-1 cursor-pointer"
                    >
                      Sign In with Google →
                    </button>
                  }
                </div>
              </div>
            }
          </div>

          <!-- Shopping Cart Trigger -->
          <button
            (click)="cartService.openDrawer(); closeAllDropdowns()"
            class="relative p-2.5 text-slate-700 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100/80 dark:hover:bg-slate-800 rounded-full transition-all duration-200 cursor-pointer group flex items-center justify-center"
            title="Shopping Cart Drawer"
            aria-label="Open Shopping Cart Drawer"
          >
            <span
              class="material-symbols-outlined text-[24px] transition-transform duration-200 group-hover:scale-110"
              >shopping_cart</span
            >
            @if (cartService.itemCount() > 0) {
              <span
                class="absolute top-0.5 right-0.5 bg-emerald-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 shadow-xs animate-pulse"
              >
                {{ cartService.itemCount() }}
              </span>
            }
          </button>

          <!-- Mobile Hamburger Toggle -->
          <button
            (click)="isMobileOpen.set(!isMobileOpen())"
            class="md:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-emerald-600 cursor-pointer rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center"
            aria-label="Toggle Mobile Menu Navigation"
            [attr.aria-expanded]="isMobileOpen()"
          >
            <span class="material-symbols-outlined text-[24px]">menu</span>
          </button>
        </div>
      </div>

      <!-- 3. Lower Menu Bar -->
      <nav
        class="hidden md:block bg-slate-50/80 dark:bg-slate-900/60 border-t border-slate-200/60 dark:border-slate-800 text-sm font-medium"
        aria-label="Primary Catalog Navigation"
      >
        <div class="max-w-7xl mx-auto px-4 lg:px-8 flex items-center gap-8 h-11">
          <!-- MEGA MENU DROPDOWN (PRODUCT CATALOG) -->
          <div class="relative" (mouseleave)="isMegaOpen.set(false)">
            <button
              (mouseenter)="isMegaOpen.set(true); isCatOpen.set(false)"
              (click)="toggleDropdown('mega')"
              [attr.aria-expanded]="isMegaOpen()"
              class="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200 hover:text-emerald-600 dark:hover:text-emerald-400 h-11 cursor-pointer transition-colors duration-150"
            >
              <span
                class="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-500"
                >grid_view</span
              >
              <span>Shop Catalog</span>
              <span
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                [class.rotate-180]="isMegaOpen()"
                >expand_more</span
              >
            </button>

            @if (isMegaOpen()) {
              <div
                class="absolute left-0 top-11 w-170 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-2xl p-6 grid grid-cols-3 gap-6 z-50 animate-fadeIn"
              >
                <div>
                  <h4
                    class="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3"
                  >
                    Computers & Laptops
                  </h4>
                  <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Laptops' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-emerald-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        High-Performance Laptops
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Desktops' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-emerald-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Workstations & Towers
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Monitors' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-emerald-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        4K & Curved Monitors
                      </a>
                    </li>
                  </ul>
                </div>

                <div>
                  <h4
                    class="font-bold text-xs uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3"
                  >
                    Mobile & Accessories
                  </h4>
                  <ul class="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Smartphones' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-emerald-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Flagship Smartphones
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Headphones' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-emerald-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Noise-Canceling Audio
                      </a>
                    </li>
                    <li>
                      <a
                        routerLink="/products"
                        [queryParams]="{ category: 'Keyboards' }"
                        (click)="isMegaOpen.set(false)"
                        class="hover:text-emerald-600 dark:hover:text-white transition-colors duration-150 block py-0.5"
                      >
                        Mechanical Keyboards
                      </a>
                    </li>
                  </ul>
                </div>

                <div
                  class="bg-linear-to-br from-emerald-50 to-indigo-50 dark:from-slate-700/50 dark:to-slate-700/30 p-4 flex flex-col justify-between border border-emerald-100 dark:border-slate-600/50"
                >
                  <div>
                    <span
                      class="inline-block bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded-xl uppercase tracking-wider mb-2"
                    >
                      Featured Drop
                    </span>
                    <h5 class="font-bold text-sm text-slate-900 dark:text-white">
                      Next-Gen Tech Gear
                    </h5>
                    <p class="text-xs text-slate-500 dark:text-slate-300 mt-1">
                      Directly sourced verified hardware releases.
                    </p>
                  </div>
                  <a
                    routerLink="/products"
                    (click)="isMegaOpen.set(false)"
                    class="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline mt-4 block"
                  >
                    Explore Hardware →
                  </a>
                </div>
              </div>
            }
          </div>

          <!-- CATEGORIES DROPDOWN MENU -->
          <div class="relative" (mouseleave)="isCatOpen.set(false)">
            <button
              (mouseenter)="isCatOpen.set(true); isMegaOpen.set(false)"
              (click)="toggleDropdown('cat')"
              [attr.aria-expanded]="isCatOpen()"
              class="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 h-11 cursor-pointer transition-colors duration-150"
            >
              <span>Categories</span>
              <span
                class="material-symbols-outlined text-[16px] transition-transform duration-200"
                [class.rotate-180]="isCatOpen()"
                >expand_more</span
              >
            </button>

            @if (isCatOpen()) {
              <div
                class="absolute left-0 top-11 w-52 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 shadow-xl py-2 z-50 animate-fadeIn"
              >
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Hardware' }"
                  (click)="isCatOpen.set(false)"
                  class="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
                >
                  💻 Hardware & Components
                </a>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Software' }"
                  (click)="isCatOpen.set(false)"
                  class="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
                >
                  ⚡ Software & Licenses
                </a>
                <a
                  routerLink="/products"
                  [queryParams]="{ category: 'Networking' }"
                  (click)="isCatOpen.set(false)"
                  class="block px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-700/80 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
                >
                  📡 Networking & Servers
                </a>
              </div>
            }
          </div>

          <!-- Direct Links -->
          <a
            routerLink="/products"
            routerLinkActive="text-emerald-600 dark:text-emerald-400 font-bold"
            class="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
          >
            All Products
          </a>
          <a
            routerLink="/products"
            [queryParams]="{ features: 'New_Arrivals' }"
            routerLinkActive="text-emerald-600 dark:text-emerald-400 font-bold"
            class="text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors duration-150"
          >
            New Arrivals
          </a>
        </div>
      </nav>

      <!-- 4. Mobile Drawer Navigation -->
      @if (isMobileOpen()) {
        <div
          class="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 pt-4 pb-6 space-y-5 shadow-2xl animate-fadeIn"
        >
          <div class="relative w-full">
            <input
              type="search"
              [value]="searchQuery()"
              (input)="searchQuery.set($any($event.target).value)"
              (keyup.enter)="onSearch()"
              placeholder="Search tech catalog..."
              aria-label="Mobile Search Bar"
              class="w-full bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 pl-4 pr-10 py-2.5 rounded-xl text-sm border-none outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <button
              (click)="onSearch()"
              aria-label="Search"
              class="absolute right-3 top-2.5 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 flex items-center justify-center"
            >
              <span class="material-symbols-outlined text-[20px]">search</span>
            </button>
          </div>

          <div
            class="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl space-y-2 border border-slate-200/60 dark:border-slate-700/60"
          >
            <div class="flex items-center justify-between px-1">
              <p
                class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider"
              >
                {{
                  authService.isLoggedIn()
                    ? authService.currentUser()?.name || 'Customer Profile'
                    : 'Customer Central'
                }}
              </p>
              @if (authService.isLoggedIn()) {
                <span
                  class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/60"
                >
                  Online
                </span>
              }
            </div>
            <div class="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
              <a
                routerLink="/account"
                [queryParams]="{ tab: 'overview' }"
                (click)="isMobileOpen.set(false)"
                class="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-2xs text-slate-700 dark:text-slate-200 active:bg-emerald-50 transition"
              >
                Profile
              </a>
              <a
                routerLink="/account"
                [queryParams]="{ tab: 'orders' }"
                (click)="isMobileOpen.set(false)"
                class="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs text-slate-700 dark:text-slate-200 active:bg-emerald-50 transition"
              >
                Orders
              </a>
              <a
                routerLink="/account"
                [queryParams]="{ tab: 'wishlist' }"
                (click)="isMobileOpen.set(false)"
                class="p-2.5 bg-white dark:bg-slate-800 rounded-lg shadow-2xs text-slate-700 dark:text-slate-200 active:bg-emerald-50 transition"
              >
                Wishlist
              </a>
            </div>
          </div>

          <div class="flex flex-col gap-2 font-medium text-slate-700 dark:text-slate-200 text-sm">
            <a
              routerLink="/"
              (click)="isMobileOpen.set(false)"
              class="py-2 border-b border-slate-100 dark:border-slate-800"
              >Home</a
            >
            <a
              routerLink="/products"
              (click)="isMobileOpen.set(false)"
              class="py-2 border-b border-slate-100 dark:border-slate-800"
              >Shop Full Catalog</a
            >
            <a
              routerLink="/products"
              [queryParams]="{ features: 'New_Arrivals' }"
              (click)="isMobileOpen.set(false)"
              class="py-2 border-b border-slate-100 dark:border-slate-800"
              >New Arrivals</a
            >
            <a
              routerLink="/track-order"
              (click)="isMobileOpen.set(false)"
              class="py-2 text-emerald-600 dark:text-emerald-400 font-bold"
              >Track Live Shipment →</a
            >
          </div>
        </div>
      }
    </header>
  `,
  styles: [
    `
      .rubik-glitch-regular {
        font-family: 'Rubik Glitch', system-ui;
        font-weight: 400;
        font-style: normal;
      }
      .press-start-2p-regular {
        font-family: 'Press Start 2P', system-ui;
        font-weight: 400;
        font-style: normal;
      }
    `,
  ],
})
export class Navbar {
  private router = inject(Router);

  public cartService = inject(CartService);
  public themeService = inject(ThemeService);
  public languageService: LanguageService = inject(LanguageService);
  public currencyService = inject(CurrencyService);
  public authService = inject(AuthService);

  isMobileOpen = signal<boolean>(false);
  isMegaOpen = signal<boolean>(false);
  isCatOpen = signal<boolean>(false);
  isAccountOpen = signal<boolean>(false);
  isLangOpen = signal<boolean>(false);
  searchQuery = signal<string>('');

  toggleDropdown(type: 'lang' | 'account' | 'mega' | 'cat'): void {
    this.isLangOpen.set(type === 'lang' ? !this.isLangOpen() : false);
    this.isAccountOpen.set(type === 'account' ? !this.isAccountOpen() : false);
    this.isMegaOpen.set(type === 'mega' ? !this.isMegaOpen() : false);
    this.isCatOpen.set(type === 'cat' ? !this.isCatOpen() : false);
  }

  closeAllDropdowns(): void {
    this.isLangOpen.set(false);
    this.isAccountOpen.set(false);
    this.isMegaOpen.set(false);
    this.isCatOpen.set(false);
  }

  selectLang(lang: string): void {
    this.languageService.setLanguage(lang);
    this.isLangOpen.set(false);
  }

  onSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/products'], { queryParams: { q } });
      this.isMobileOpen.set(false);
      this.closeAllDropdowns();
    }
  }
}
