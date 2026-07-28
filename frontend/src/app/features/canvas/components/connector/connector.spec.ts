import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Connector } from './connector';

describe('Connector', () => {
  let component: Connector;
  let fixture: ComponentFixture<Connector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Connector]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Connector);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
