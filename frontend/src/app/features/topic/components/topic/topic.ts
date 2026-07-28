import { Component, HostBinding, input } from '@angular/core';
import { Topic } from '../../../../models/topic.model';
import { TOPIC_WIDTH, TOPIC_HEIGHT } from '../../../../models/canvas-view.constants';

@Component({
  selector: '[appTopic]',
  standalone: true,
  templateUrl: './topic.html',
})
export class TopicComponent {
  readonly topic = input.required<Topic>();
  readonly width = TOPIC_WIDTH;
  readonly height = TOPIC_HEIGHT;

  @HostBinding('attr.transform')
  get transform(): string {
    const t = this.topic();
    return `translate(${t.x}, ${t.y})`;
  }
}
