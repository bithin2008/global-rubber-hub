import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyNowPage } from './verify-now.page';

describe('VerifyNowPage', () => {
  let component: VerifyNowPage;
  let fixture: ComponentFixture<VerifyNowPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyNowPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
