import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RubberRatesPage } from './rubber-rates.page';

describe('RubberRatesPage', () => {
  let component: RubberRatesPage;
  let fixture: ComponentFixture<RubberRatesPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(RubberRatesPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
