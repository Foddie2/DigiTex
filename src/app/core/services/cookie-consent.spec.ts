import { TestBed } from '@angular/core/testing';

import { CookieConsent } from './cookie-consent';

describe('CookieConsent', () => {
  let service: CookieConsent;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookieConsent);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
