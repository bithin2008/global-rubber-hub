import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BidRequestPage } from './bid-request.page';

describe('BidRequestPage', () => {
  let component: BidRequestPage;
  let fixture: ComponentFixture<BidRequestPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BidRequestPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
