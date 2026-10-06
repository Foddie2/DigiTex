import { TestBed } from '@angular/core/testing';

import { ShopifyPolicyService } from './shopify-policy.service';

describe('ShopifyPolicyService', () => {
  let service: ShopifyPolicyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShopifyPolicyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
