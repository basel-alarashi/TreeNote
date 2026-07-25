import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasList } from './canvas-list';

describe('CanvasList', () => {
  let component: CanvasList;
  let fixture: ComponentFixture<CanvasList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
