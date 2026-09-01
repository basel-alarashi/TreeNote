import { Component, ChangeDetectionStrategy, HostBinding, input } from '@angular/core';
import { Topic } from '../../../models/topic.model';
import { TOPIC_WIDTH, TOPIC_HEIGHT } from '../../../models/canvas/canvas-view.constants';

@Component({
  selector: '[appTopic]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic.html',
})
export class TopicComponent {
  readonly topic = input.required<Topic>();
  readonly selected = input<boolean>(false);
  readonly width = TOPIC_WIDTH;
  readonly height = TOPIC_HEIGHT;

  @HostBinding('attr.transform')
  get transform(): string {
    const t = this.topic();
    return `translate(${t.x}, ${t.y})`;
  }
}
