import { describe, expect, it } from 'vitest'
import { playlists, tracks, tracksInPlaylist } from '../data/playlists'

describe('data playlist musik', () => {
  it('memiliki tiga playlist sesuai spesifikasi', () => {
    expect(playlists.map((playlist) => playlist.name)).toEqual([
      'Rindu yang Tidak Selesai',
      'Bahagia yang Hilang',
      'Malam Paling Sepi',
    ])
  })

  it('memiliki 18 lagu terdaftar', () => {
    expect(tracks.length).toBe(18)
  })

  it('semua lagu memiliki video ID resmi yang sudah diverifikasi', () => {
    const withoutVideo = tracks.filter((track) => !track.videoId)
    expect(withoutVideo).toEqual([])
  })

  it('setiap lagu memiliki tautan pencarian cadangan', () => {
    for (const track of tracks) {
      expect(track.searchLink).toContain('youtube.com/results')
    }
  })

  it('setiap playlist berisi lagu', () => {
    for (const playlist of playlists) {
      expect(tracksInPlaylist(playlist.id).length).toBeGreaterThan(0)
    }
  })
})
