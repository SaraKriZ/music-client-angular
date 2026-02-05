import { Routes } from '@angular/router';
import { MusicListComponent } from './features/music-list/music-list.component';
import { MusicDetailsComponent } from './features/music-details/music-details.component';

export const routes: Routes = [
	{ path: '', component: MusicListComponent },
	{ path: 'detail/:id', component: MusicDetailsComponent }
];
