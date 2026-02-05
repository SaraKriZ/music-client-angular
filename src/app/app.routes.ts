import { Routes } from '@angular/router';
import { MusicListComponent } from './features/music-list/music-list.component';
import { MusicDetailsComponent } from './features/music-details/music-details.component';

export const routes: Routes = [
	{ path: '', redirectTo: 'music', pathMatch: 'full' },
	{ path: 'music', component: MusicListComponent },
	{ path: 'music/:id', component: MusicDetailsComponent },
	{ path: '**', redirectTo: 'music' }
];
