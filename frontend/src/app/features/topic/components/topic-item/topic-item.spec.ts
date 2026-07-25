import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TopicItem } from './topic-item';

describe('TopicItem', () => {
  let component: TopicItem;
  let fixture: ComponentFixture<TopicItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicItem);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
