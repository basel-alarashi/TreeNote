import { Component, HostBinding, input } from '@angular/core';

export interface SelectionRect { x: number; y: number; width: number; height: number; }

@Component({
  selector: '[appSelectionBox]',
  standalone: true,
  template: '',
})
export class SelectionBoxComponent {
  readonly box = input.required<SelectionRect>();

  @HostBinding('attr.x') get x() { return this.box().x; }
  @HostBinding('attr.y') get y() { return this.box().y; }
  @HostBinding('attr.width') get width() { return this.box().width; }
  @HostBinding('attr.height') get height() { return this.box().height; }
  @HostBinding('attr.fill') fill = 'rgba(103,58,183,0.1)';
  @HostBinding('attr.stroke') stroke = '#673ab7';
  @HostBinding('attr.stroke-dasharray') dash = '4';
}
