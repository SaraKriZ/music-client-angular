export interface Song {
  id: string;
  title: string;
  artist: string;
  album?: string;
  artworkUrl?: string | null;
  description?: string;
  releaseDate?: string | null;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artworkUrl?: string | null;
  description?: string;
  releaseDate?: string | null;
}
