import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
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
export class MusicListComponent implements OnInit {
	songs: Song[] = [];
	searchQuery = '';
	isLoading = false;
	errorMessage = '';
	history: string[] = [];


	constructor(
		private musicService: MusicService,
		private historyService: SearchHistoryService,
		private route: ActivatedRoute
	) {}

	ngOnInit(): void {
		this.history = this.historyService.getHistory();
		const q = this.route.snapshot.queryParamMap.get('q');
		if (q) {
			this.searchQuery = q;
			this.loadSongs();
		}
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
		this.historyService.addTerm(q);
		this.history = this.historyService.getHistory();
		this.songs = [];
		this.loadSongs();
	}

	selectHistory(term: string): void {
		this.searchQuery = term;
		this.onSearchSubmit();
	}

	clearHistory(): void {
		this.historyService.clear();
		this.history = [];
	}


}
