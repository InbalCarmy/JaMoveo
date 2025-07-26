// TypeScript interfaces for the JaMoveo application

export interface ConnectedMember {
  socketId: string;
  username: string;
  role: string;
}

export interface SongContent {
  text: string;
  chord?: string;
}

export interface Song {
  title: string;
  artist: string;
  content: SongContent[];
  image_url?: string;
}

export interface User {
  username: string;
  role?: string;
  instrument?: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}