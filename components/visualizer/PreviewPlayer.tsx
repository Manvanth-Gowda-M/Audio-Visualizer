'use client'
import { useStore } from '@/lib/store'
import dynamic from 'next/dynamic'

const Player = dynamic(() => import('@remotion/player').then((m) => m.Player), { ssr: false })

const compositions = {
  circle: dynamic(() =>
    import('@/remotion/compositions/CircleVisualizer').then((m) => m.CircleVisualizer)
  ),
  waveform: dynamic(() =>
    import('@/remotion/compositions/WaveformVisualizer').then((m) => m.WaveformVisualizer)
  ),
  particles: dynamic(() =>
    import('@/remotion/compositions/ParticlesVisualizer').then((m) => m.ParticlesVisualizer)
  ),
  vinyl: dynamic(() =>
    import('@/remotion/compositions/VinylVisualizer').then((m) => m.VinylVisualizer)
  ),
  glitch: dynamic(() =>
    import('@/remotion/compositions/GlitchVisualizer').then((m) => m.GlitchVisualizer)
  ),
  cassette: dynamic(() =>
    import('@/remotion/compositions/CassetteVisualizer').then((m) => m.CassetteVisualizer)
  ),
  neonplayer: dynamic(() =>
    import('@/remotion/compositions/NeonPlayerVisualizer').then((m) => m.NeonPlayerVisualizer)
  ),
  appleplayer: dynamic(() =>
    import('@/remotion/compositions/ApplePlayerVisualizer').then((m) => m.ApplePlayerVisualizer)
  ),
  poster: dynamic(() =>
    import('@/remotion/compositions/PosterVisualizer').then((m) => m.PosterVisualizer)
  ),
  dashboard: dynamic(() =>
    import('@/remotion/compositions/DashboardVisualizer').then((m) => m.DashboardVisualizer)
  ),
  circular: dynamic(() =>
    import('@/remotion/compositions/CircularPlayerVisualizer').then((m) => m.CircularPlayerVisualizer)
  ),
  cinematic: dynamic(() =>
    import('@/remotion/compositions/CinematicVinylVisualizer').then((m) => m.CinematicVinylVisualizer)
  ),
  editorial: dynamic(() =>
    import('@/remotion/compositions/EditorialAlbumVisualizer').then((m) => m.EditorialAlbumVisualizer)
  ),
  symmetrical: dynamic(() =>
    import('@/remotion/compositions/SymmetricalVisualizer').then((m) => m.SymmetricalVisualizer)
  ),
  retro: dynamic(() =>
    import('@/remotion/compositions/RetroPlayerVisualizer').then((m) => m.RetroPlayerVisualizer)
  ),
  retro_cassette: dynamic(() =>
    import('@/remotion/compositions/RetroCassetteVisualizer').then((m) => m.RetroCassetteVisualizer)
  ),
  cinematic_vinyl_ui: dynamic(() =>
    import('@/remotion/compositions/CinematicVinylUIVisualizer').then((m) => m.CinematicVinylUIVisualizer)
  ),
}

export default function PreviewPlayer() {
  const store = useStore()

  if (!store.audioUrl) {
    return (
      <div className="flex items-center justify-center h-64 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-500 text-sm">
        Upload audio in Step 1 to see preview
      </div>
    )
  }

  // Use blob URLs for preview — they're already in browser memory and work instantly.
  // Server paths (store.audioPath) are only needed for the render job.
  const audioSrcForVisualizer   = store.audioUrl ?? ''
  const artworkSrcForVisualizer = store.artworkUrl ?? ''

  // Use filename from path as cache buster key
  const audioFilename   = store.audioPath?.split('/').pop() ?? store.audioFile?.name ?? '0'
  const artworkFilename = store.artworkPath?.split('/').pop() ?? store.artworkFile?.name ?? '0'

  const Component = compositions[store.template]
  // Preview: cap at 60s so it loads fast. Full render uses actual duration.
  const previewDuration = Math.min(store.duration || 30, 60)
  const isApple = store.template === 'appleplayer'
  const isPortrait = isApple || store.template === 'circular'
  const isSquare = store.template === 'retro'

  const inputProps = isApple ? {
    audioSrc: audioSrcForVisualizer,
    artworkSrc: artworkSrcForVisualizer,
    songTitle: store.songTitle || 'Song Title',
    artistName: store.artist || 'Artist Name',
    labelText: store.labelText || 'Now Playing',
    durationInSeconds: previewDuration,
    themeColor: store.themeColor || 'white',
    fontStyle: store.fontStyle || 'minimal',
  } : {
    audioSrc: audioSrcForVisualizer,
    artworkSrc: artworkSrcForVisualizer,
    lyrics: store.lyrics,
    accentColor: store.accentColor,
    typoStyle: store.typoStyle,
    durationInSeconds: previewDuration,
    lyricsFont: store.lyricsFont,
    effects: store.effects,
    songTitle: store.songTitle,
    artistName: store.artist,
    albumName: store.labelText || 'Album',
  }

  return (
    <div className="rounded-xl overflow-hidden max-w-2xl mx-auto">
      {/* key forces full remount when audio file changes — kills Remotion's internal audio cache */}
      <div key={`wrapper-${audioFilename}`}>
        <Player
          key={`${audioFilename}-${store.template}`}
          component={Component as unknown as React.ComponentType<Record<string, unknown>>}
          inputProps={inputProps}
          durationInFrames={Math.round(previewDuration * 30)}
          compositionWidth={isSquare ? 1080 : isPortrait ? 1080 : 1920}
          compositionHeight={isSquare ? 1080 : isPortrait ? 1920 : 1080}
          fps={30}
          style={{ width: '100%', aspectRatio: isSquare ? '1/1' : isPortrait ? '9/16' : '16/9' }}
          controls
          loop
          acknowledgeRemotionLicense
        />
      </div>
    </div>
  )
}
