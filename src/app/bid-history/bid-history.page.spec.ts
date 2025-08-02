import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BidHistoryPage } from './bid-history.page';

describe('BidHistoryPage', () => {
  let component: BidHistoryPage;
  let fixture: ComponentFixture<BidHistoryPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(BidHistoryPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
