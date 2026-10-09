import { TestBed } from '@angular/core/testing';

import { ShopifyTrackOrder } from './shopify-track-order';

describe('ShopifyTrackOrder', () => {
  let service: ShopifyTrackOrder;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ShopifyTrackOrder);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
