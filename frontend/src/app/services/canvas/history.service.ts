import { Injectable, computed, signal } from '@angular/core';

export interface HistoryCommand {
  label: string;
  undo: () => void;
  redo: () => void;
}

@Injectable({ providedIn: 'root' })
export class HistoryService {
  private readonly undoStack = signal<HistoryCommand[]>([]);
  private readonly redoStack = signal<HistoryCommand[]>([]);

  readonly canUndo = computed(() => this.undoStack().length > 0);
  readonly canRedo = computed(() => this.redoStack().length > 0);

  push(command: HistoryCommand): void {
    this.undoStack.update((stack) => [...stack, command]);
    this.redoStack.set([]); // a new action invalidates whatever was available to redo
  }

  undo(): void {
    const stack = this.undoStack();
    if (stack.length === 0) return;
    const command = stack[stack.length - 1];
    this.undoStack.set(stack.slice(0, -1));
    command.undo();
    this.redoStack.update((r) => [...r, command]);
  }

  redo(): void {
    const stack = this.redoStack();
    if (stack.length === 0) return;
    const command = stack[stack.length - 1];
    this.redoStack.set(stack.slice(0, -1));
    command.redo();
    this.undoStack.update((u) => [...u, command]);
  }

  clear(): void {
    this.undoStack.set([]);
    this.redoStack.set([]);
  }
}
