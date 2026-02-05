import { Component, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription, BehaviorSubject, of } from 'rxjs';
import { distinctUntilChanged, switchMap, catchError, finalize, map, tap } from 'rxjs/operators';
import { MusicService } from '../../services/music.service';
import { Song } from '../../models/music.models';
import { SearchHistoryService } from '../../services/search-history.service';

@Component({
	selector: 'app-music-list',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	templateUrl: './music-list.component.html',
	styleUrls: ['./music-list.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MusicListComponent implements OnInit, OnDestroy {
	// reactive subjects
	private songsSubject = new BehaviorSubject<Song[]>([]);
	songs$ = this.songsSubject.asObservable();

	private isLoadingSubject = new BehaviorSubject<boolean>(false);
	isLoading$ = this.isLoadingSubject.asObservable();

	private errorSubject = new BehaviorSubject<string | null>(null);
	error$ = this.errorSubject.asObservable();

	searchQuery = '';
	history: string[] = [];
	pageSize = 20;
	offset = 0;
	totalCount = 0;


	constructor(
		private musicService: MusicService,
		private historyService: SearchHistoryService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	private qpSub?: Subscription;

	ngOnInit(): void {
		this.history = this.historyService.getHistory();

		// react to query param changes and perform searches reactively
		this.qpSub = this.route.queryParamMap
			.pipe(
				map((params) => params.get('q')),
				distinctUntilChanged(),
				switchMap((q) => {
					const term = q ?? this.historyService.getHistory()[0] ?? '';
					if (!term) {
						// clear results
						this.songsSubject.next([]);
						this.searchQuery = '';
						return of(null);
					}

					this.searchQuery = term;
					this.historyService.addTerm(term);
					this.history = this.historyService.getHistory();

					this.isLoadingSubject.next(true);
					this.errorSubject.next(null);

					// perform search
					return this.musicService.searchSongs(term, this.pageSize, 0).pipe(
						tap((res) => {
							this.totalCount = res.count || res.items.length;
						}),
						catchError((err) => {
							console.error(err);
							this.errorSubject.next('Failed to fetch songs.');
							return of({ items: [], count: 0 });
						}),
						finalize(() => this.isLoadingSubject.next(false))
					);
				})
			)
			.subscribe((res) => {
				if (!res) return;
				this.offset = 0;
				this.songsSubject.next(res.items);
			});
	}

	ngOnDestroy(): void {
		this.qpSub?.unsubscribe();
		this.songsSubject.complete();
		this.isLoadingSubject.complete();
		this.errorSubject.complete();
	}

	// legacy imperative load (used for "More") - appends results
	loadSongs(): void {
		// kept for compatibility with manual triggers; prefer query param driven searches
		const q = this.searchQuery?.trim();
		if (!q) {
			this.errorSubject.next('Please enter a search query.');
			return;
		}

		this.offset = 0;
		this.isLoadingSubject.next(true);
		this.errorSubject.next(null);

		this.musicService.searchSongs(q, this.pageSize, this.offset).pipe(
			catchError((err) => {
				console.error(err);
				this.errorSubject.next('Failed to fetch songs.');
				return of({ items: [], count: 0 });
			}),
			finalize(() => this.isLoadingSubject.next(false))
		).subscribe((res) => {
			this.songsSubject.next(res.items);
			this.totalCount = res.count || res.items.length;
		});
	}

	loadMore(): void {
		const q = this.searchQuery?.trim();
		if (!q) return;

		this.isLoadingSubject.next(true);
		this.errorSubject.next(null);
		this.offset += this.pageSize;

		this.musicService.searchSongs(q, this.pageSize, this.offset).pipe(
			catchError((err) => {
				console.error(err);
				this.errorSubject.next('Failed to fetch more songs.');
				return of({ items: [], count: 0 });
			}),
			finalize(() => this.isLoadingSubject.next(false))
		).subscribe((res) => {
			const current = this.songsSubject.getValue();
			this.songsSubject.next([...current, ...res.items]);
			this.totalCount = res.count || this.totalCount;
		});
	}

	onSearchSubmit(): void {
		const q = this.searchQuery?.trim();
		if (!q) return;
		// update URL so query param pipeline performs the search
		this.router.navigate([], { relativeTo: this.route, queryParams: { q } });
	}

	selectHistory(term: string): void {
		this.searchQuery = term;
		this.router.navigate([], { relativeTo: this.route, queryParams: { q: term } });
	}

	clearHistory(): void {
		this.historyService.clear();
		this.history = [];
	}


}
