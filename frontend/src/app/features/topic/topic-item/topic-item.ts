import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Topic } from '../../../models/topic.model';

@Component({
  selector: 'app-topic-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, FormsModule, MatButtonModule, MatIconModule],
  templateUrl: './topic-item.html',
  styleUrl: './topic-item.scss',
})
export class TopicItemComponent {
  @Input({ required: true }) topic!: Topic;
  @Output() rename = new EventEmitter<{ id: string; title: string }>();
  @Output() delete = new EventEmitter<string>();
  @Output() duplicate = new EventEmitter<string>();
  @Output() addChild = new EventEmitter<string>();

  editing = false;
  editTitle = '';

  startEdit(): void {
    this.editing = true;
    this.editTitle = this.topic.title;
  }

  confirmEdit(): void {
    this.rename.emit({ id: this.topic.id, title: this.editTitle });
    this.editing = false;
  }
}
