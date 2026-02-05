import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MusicService } from '../../services/music.service';
import { Song } from '../../models/music.models';
import { SearchHistoryService } from '../../services/search-history.service';

@Component({
	selector: 'app-music-list',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	templateUrl: './music-list.component.html',
	styleUrls: ['./music-list.component.scss']
})
export class MusicListComponent implements OnInit, OnDestroy {
	songs: Song[] = [];
	searchQuery = '';
	isLoading = false;
	errorMessage = '';
	history: string[] = [];


	constructor(
		private musicService: MusicService,
		private historyService: SearchHistoryService,
		private route: ActivatedRoute,
		private router: Router
	) {}

	private qpSub?: Subscription;

	ngOnInit(): void {
		this.history = this.historyService.getHistory();

		// react to query param changes so browser Back/Forward restores searches
		this.qpSub = this.route.queryParamMap.subscribe((params) => {
			const q = params.get('q');
			if (q) {
				this.searchQuery = q;
				this.loadSongs();
			} else {
				const last = this.historyService.getHistory()[0];
				if (last) {
					this.searchQuery = last;
					this.loadSongs();
				}
			}
		});
	}

	ngOnDestroy(): void {
		this.qpSub?.unsubscribe();
	}

	loadSongs(): void {
		const q = this.searchQuery?.trim();
		if (!q) {
			this.errorMessage = 'Please enter a search query.';
			return;
		}

		this.isLoading = true;
		this.errorMessage = '';

		this.musicService.searchSongs(q, 20).subscribe({
			next: (data) => {
				this.songs = data;
				this.isLoading = false;
				if (!data.length) this.errorMessage = 'No songs found.';
			},
			error: (err) => {
				console.error(err);
				this.isLoading = false;
				this.errorMessage = 'Failed to fetch songs.';
			}
		});
	}

	onSearchSubmit(): void {
		const q = this.searchQuery?.trim();
		if (!q) return;
		// update URL so Back/Forward restores this search
		this.router.navigate([], { relativeTo: this.route, queryParams: { q } });
		this.historyService.addTerm(q);
		this.history = this.historyService.getHistory();
		this.songs = [];
	}

	selectHistory(term: string): void {
		this.searchQuery = term;
		this.router.navigate([], { relativeTo: this.route, queryParams: { q: term } });
		this.historyService.addTerm(term);
		this.history = this.historyService.getHistory();
	}

	clearHistory(): void {
		this.historyService.clear();
		this.history = [];
	}


}
