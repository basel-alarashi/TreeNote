import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectionBox } from './selection-box';

describe('SelectionBox', () => {
  let component: SelectionBox;
  let fixture: ComponentFixture<SelectionBox>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectionBox]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SelectionBox);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
