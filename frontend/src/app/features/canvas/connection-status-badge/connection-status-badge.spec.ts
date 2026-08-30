import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConnectionStatusBadge } from './connection-status-badge';

describe('ConnectionStatusBadge', () => {
  let component: ConnectionStatusBadge;
  let fixture: ComponentFixture<ConnectionStatusBadge>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConnectionStatusBadge]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConnectionStatusBadge);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
