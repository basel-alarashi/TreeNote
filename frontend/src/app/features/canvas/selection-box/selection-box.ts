import { ChangeDetectionStrategy, Component, HostBinding, input } from '@angular/core';

export interface SelectionRect { x: number; y: number; width: number; height: number; }

@Component({
  selector: '[appSelectionBox]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class SelectionBoxComponent {
  readonly box = input.required<SelectionRect>();

  @HostBinding('attr.x') get x() { return this.box().x; }
  @HostBinding('attr.y') get y() { return this.box().y; }
  @HostBinding('attr.width') get width() { return this.box().width; }
  @HostBinding('attr.height') get height() { return this.box().height; }
  @HostBinding('attr.style') get style() {
    return `fill: var(--tn-canopy); fill-opacity: 0.1; stroke: var(--tn-canopy); stroke-dasharray: 4;`;
  }
}
