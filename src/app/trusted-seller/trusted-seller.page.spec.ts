import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TrustedSellerPage } from './trusted-seller.page';

describe('TrustedSellerPage', () => {
  let component: TrustedSellerPage;
  let fixture: ComponentFixture<TrustedSellerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(TrustedSellerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
