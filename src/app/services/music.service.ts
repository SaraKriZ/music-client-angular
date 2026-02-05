import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Song, Album } from '../models/music.models';

@Injectable({ providedIn: 'root' })
export class MusicService {
	private readonly MB_SEARCH_URL = 'https://musicbrainz.org/ws/2/recording';
	private readonly COVER_ART_URL = 'https://coverartarchive.org/release';

	constructor(private http: HttpClient) {}

  searchSongs(query: string, limit: number = 20): Observable<Song[]> {
    const params = {
      query: query,
      fmt: 'json',
      limit: String(limit)
    };

    return this.http.get<any>(this.MB_SEARCH_URL, { params }).pipe(
      map(resp => (resp.recordings || []).map((rec: any) => {
        const artistCredit = rec['artist-credit']?.[0] || {};
        const release = rec.releases?.[0] || null;

        return {
          id: rec.id,
          title: rec.title,
          artist: artistCredit.name || artistCredit.artist?.name || 'Unknown',
          album: release?.title,
          artworkUrl: release ? `${this.COVER_ART_URL}/${release.id}` : null,
          description: rec.disambiguation || release?.disambiguation || ''
        } as Song;
      })),
      catchError(() => of([]))
    );
  }


  getRecordingDetails(recordingId: string): Observable<Song | null> {
    const url = `${this.MB_SEARCH_URL}/${recordingId}`; // ws/2/recording/{id}
    const params = { fmt: 'json', inc: 'releases+artists' };

    return this.http.get<any>(url, { params }).pipe(
      switchMap((rec) => {
        if (!rec) return of(null);

        const artistCredit = (rec['artist-credit'] && rec['artist-credit'][0]) || {};
        const release = (rec.releases && rec.releases[0]) || null;

        const base: Song = {
          id: rec.id,
          title: rec.title,
          artist: artistCredit.name || artistCredit.artist?.name || 'Unknown',
          album: release?.title,
          artworkUrl: null,
          description: rec.disambiguation || release?.disambiguation || '',
          releaseDate: release?.date || null
        };

        if (!release || !release.id) return of(base);

        const caUrl = `${this.COVER_ART_URL}/${release.id}`;
        return this.http.get<any>(caUrl).pipe(
          map((ca) => {
            if (ca && ca.images && ca.images.length) {
              const img = ca.images[0];
              base.artworkUrl = img.thumbnails?.['250'] || img.thumbnails?.['120'] || img.image || null;
            }
            return base;
          }),
          catchError(() => of(base))
        );
      }),
      catchError(() => of(null))
    );
  }
}
