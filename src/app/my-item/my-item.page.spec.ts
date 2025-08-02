import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MyItemPage } from './my-item.page';

describe('MyItemPage', () => {
  let component: MyItemPage;
  let fixture: ComponentFixture<MyItemPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(MyItemPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
