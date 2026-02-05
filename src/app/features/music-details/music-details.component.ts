import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MusicService } from '../../services/music.service';
import { Song } from '../../models/music.models';
import { SearchHistoryService } from '../../services/search-history.service';

@Component({
  selector: 'app-music-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './music-details.component.html',
  styleUrls: ['./music-details.component.scss']
})
export class MusicDetailsComponent implements OnInit {
  song: Song | null = null;
  isLoading = false;
  errorMessage = '';

  constructor(
    private route: ActivatedRoute,
    private musicService: MusicService,
    private router: Router,
    private historyService: SearchHistoryService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.errorMessage = 'No id provided.';
      return;
    }

    this.isLoading = true;
    this.musicService.getSongByID(id).subscribe({
      next: (s) => {
        this.song = s;
        this.isLoading = false;
        if (!s) this.errorMessage = 'Details not found.';
      },
      error: (err) => {
        console.error(err);
        this.errorMessage = 'Failed to load details.';
        this.isLoading = false;
      }
    });
  }

  goBack(): void {
    const last = this.historyService.getHistory()[0];
    if (last) {
      this.router.navigate(['/music'], { queryParams: { q: last } });
    } else {
      this.router.navigate(['/music']);
    }
  }

}
