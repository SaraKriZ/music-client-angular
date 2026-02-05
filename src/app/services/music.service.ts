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
    const params: any = {
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


  getSongByID(songId: string): Observable<Song | null> {
    const url = `${this.MB_SEARCH_URL}/${songId}`;
    const params = { fmt: 'json', inc: 'releases+artists' };

    return this.http.get<any>(url, { params }).pipe(
      map((rec) => {
        if (!rec) return null;

        const artistCredit = rec['artist-credit']?.[0] || {};
        const release = rec.releases?.[0] || null;

        return {
          id: rec.id,
          title: rec.title,
          artist: artistCredit.name || artistCredit.artist?.name || 'Unknown',
          album: release?.title,
          artworkUrl: release ? `${this.COVER_ART_URL}/${release.id}` : null,
          description: rec.disambiguation || release?.disambiguation || '',
          releaseDate: release?.date || null
        } as Song;
      }),
      catchError(() => of(null))
    );
  }
}
