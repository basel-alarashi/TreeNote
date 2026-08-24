import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportMenu } from './export-menu';

describe('ExportMenu', () => {
  let component: ExportMenu;
  let fixture: ComponentFixture<ExportMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExportMenu]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
