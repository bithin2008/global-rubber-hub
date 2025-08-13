import { ComponentFixture, TestBed } from '@angular/core/testing';
import { VerifyInnerPage } from './verify-inner.page';

describe('VerifyInnerPage', () => {
  let component: VerifyInnerPage;
  let fixture: ComponentFixture<VerifyInnerPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(VerifyInnerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
