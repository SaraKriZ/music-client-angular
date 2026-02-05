import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MusicService, Song } from '../../services/music.service';

@Component({
	selector: 'app-music-list',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterModule],
	templateUrl: './music-list.component.html',
	styleUrls: ['./music-list.component.scss']
})
export class MusicListComponent implements OnInit {
	songs: Song[] = [];
	searchQuery = 'beatles';
	isLoading = false;
	errorMessage = '';

	constructor(private musicService: MusicService) {}

	ngOnInit(): void {
		this.loadSongs();
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
		this.songs = [];
		this.loadSongs();
	}
}
