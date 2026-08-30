import { FormsModule } from '@angular/forms';
import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { SearchTopicResult } from '../../../models/canvas/search-result.model';
import { SearchService } from '../../../services/canvas/search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.scss'
})
export class SearchBarComponent {
  private readonly searchService = inject(SearchService);
  private readonly queryChanged$ = new Subject<string>();

  readonly query = signal('');
  readonly results = signal<SearchTopicResult[]>([]);
  readonly isSearching = signal(false);
  readonly hasSearched = signal(false);

  /** Emits the chosen result so the host page can navigate the canvas to it. */
  @Output() resultSelected = new EventEmitter<SearchTopicResult>();

  constructor() {
    this.queryChanged$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((value) => {
          const trimmed = value.trim();
          if (!trimmed) {
            this.hasSearched.set(false);
            this.isSearching.set(false);
            return of<SearchTopicResult[]>([]);
          }
          this.isSearching.set(true);
          return this.searchService.searchTopics(trimmed);
        })
      )
      .subscribe((results) => {
        this.isSearching.set(false);
        this.hasSearched.set(this.query().trim().length > 0);
        this.results.set(results ?? []);
      });
  }

  onInputChange(value: string): void {
    this.query.set(value);
    this.queryChanged$.next(value);
  }

  clear(): void {
    this.query.set('');
    this.results.set([]);
    this.hasSearched.set(false);
    this.queryChanged$.next('');
  }

  selectResult(result: SearchTopicResult): void {
    this.resultSelected.emit(result);
    this.clear();
  }
}
