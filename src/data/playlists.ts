import type { PlaylistDef, Track } from '../types'
import { verifiedVideos } from './video-ids'

export const playlists: PlaylistDef[] = [
  {
    id: 'rindu',
    name: 'Rindu yang Tidak Selesai',
    description: 'Untuk malam-malam ketika nama itu masih terasa hangat.',
  },
  {
    id: 'bahagia-hilang',
    name: 'Bahagia yang Hilang',
    description: 'Untuk mengakui bahwa yang dulu indah memang pernah ada.',
  },
  {
    id: 'malam-sepi',
    name: 'Malam Paling Sepi',
    description: 'Untuk duduk tenang, tanpa harus baik-baik saja.',
  },
]

const PLAYLIST_BY_NAME: Record<string, string> = {
  'Rindu yang Tidak Selesai': 'rindu',
  'Bahagia yang Hilang': 'bahagia-hilang',
  'Malam Paling Sepi': 'malam-sepi',
}

function searchLink(title: string, artist: string): string {
  const query = encodeURIComponent(`${artist} ${title} Official`)
  return `https://www.youtube.com/results?search_query=${query}`
}

export const tracks: Track[] = verifiedVideos.map(([playlist, title, artist, videoId]) => ({
  id: `${playlist}-${title}`.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  title,
  artist,
  playlist: PLAYLIST_BY_NAME[playlist] ?? 'malam-sepi',
  videoId,
  searchLink: searchLink(title, artist),
}))

export function tracksInPlaylist(playlistId: string): Track[] {
  return tracks.filter((track) => track.playlist === playlistId)
}

export function trackIndex(trackId: string): number {
  return tracks.findIndex((track) => track.id === trackId)
}
