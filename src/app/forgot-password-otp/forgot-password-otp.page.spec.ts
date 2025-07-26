import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ForgotPasswordOtpPage } from './forgot-password-otp.page';

describe('ForgotPasswordOtpPage', () => {
  let component: ForgotPasswordOtpPage;
  let fixture: ComponentFixture<ForgotPasswordOtpPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotPasswordOtpPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
