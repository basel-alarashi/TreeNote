import { Component, HostBinding, computed, input } from '@angular/core';
import { Topic } from '../../../models/topic.model';
import { TOPIC_WIDTH, TOPIC_HEIGHT } from '../../../models/canvas/canvas-view.constants';

@Component({
  selector: '[appConnector]',
  standalone: true,
  template: '',
})
export class ConnectorComponent {
  readonly parent = input<Topic | undefined>();
  readonly child = input<Topic | undefined>();

  private readonly pathValue = computed(() => {
    const p = this.parent();
    const c = this.child();
    if (!p || !c) return '';

    const startX = p.x + TOPIC_WIDTH;
    const startY = p.y + TOPIC_HEIGHT / 2;
    const endX = c.x;
    const endY = c.y + TOPIC_HEIGHT / 2;
    const midX = (startX + endX) / 2;

    return `M ${startX} ${startY} C ${midX} ${startY}, ${midX} ${endY}, ${endX} ${endY}`;
  });

  @HostBinding('attr.d') get d(): string { return this.pathValue(); }
  @HostBinding('attr.fill') fill = 'none';
  @HostBinding('attr.stroke') stroke = '#999';
  @HostBinding('attr.stroke-width') strokeWidth = '2';
}
