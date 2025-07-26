import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ItemAddPage } from './item-add.page';

describe('ItemAddPage', () => {
  let component: ItemAddPage;
  let fixture: ComponentFixture<ItemAddPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(ItemAddPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
