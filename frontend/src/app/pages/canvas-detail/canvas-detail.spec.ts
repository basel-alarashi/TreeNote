import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CanvasDetail } from './canvas-detail';

describe('CanvasDetail', () => {
  let component: CanvasDetail;
  let fixture: ComponentFixture<CanvasDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CanvasDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
