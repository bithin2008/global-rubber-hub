import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GstUdyamVerificationPage } from './gst-udyam-verification.page';

describe('GstUdyamVerificationPage', () => {
  let component: GstUdyamVerificationPage;
  let fixture: ComponentFixture<GstUdyamVerificationPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(GstUdyamVerificationPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
