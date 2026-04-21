import { Composition, registerRoot } from 'remotion'
import { CircleVisualizer } from './compositions/CircleVisualizer'
import { WaveformVisualizer } from './compositions/WaveformVisualizer'
import { ParticlesVisualizer } from './compositions/ParticlesVisualizer'
import { VinylVisualizer } from './compositions/VinylVisualizer'
import { GlitchVisualizer } from './compositions/GlitchVisualizer'
import { CassetteVisualizer } from './compositions/CassetteVisualizer'
import { NeonPlayerVisualizer } from './compositions/NeonPlayerVisualizer'
import { ApplePlayerVisualizer } from './compositions/ApplePlayerVisualizer'
import { PosterVisualizer } from './compositions/PosterVisualizer'
import { DashboardVisualizer } from './compositions/DashboardVisualizer'
import { CinematicVinylVisualizer } from './compositions/CinematicVinylVisualizer'
import { EditorialAlbumVisualizer } from './compositions/EditorialAlbumVisualizer'
import { CircularPlayerVisualizer } from './compositions/CircularPlayerVisualizer'
import { SymmetricalVisualizer } from './compositions/SymmetricalVisualizer'
import { RetroPlayerVisualizer } from './compositions/RetroPlayerVisualizer'
import { RetroCassetteVisualizer } from './compositions/RetroCassetteVisualizer'
import { CinematicVinylUIVisualizer } from './compositions/CinematicVinylUIVisualizer'

import { VisualizerProps } from './compositions/shared'

const defaultProps: VisualizerProps = {
  audioSrc: '',
  artworkSrc: '',
  lyrics: [],
  accentColor: '#a855f7',
  typoStyle: 'minimal',
  durationInSeconds: 210,
  lyricsFont: 'inter',
  effects: [],
}

const appleDefaultProps = {
  audioSrc: '',
  artworkSrc: '',
  songTitle: 'Song Title',
  artistName: 'Artist Name',
  labelText: 'Now Playing',
  durationInSeconds: 210,
  themeColor: 'white',
  fontStyle: 'minimal',
}

const standardCompositions = [
  { id: 'CircleVisualizer',     component: CircleVisualizer },
  { id: 'WaveformVisualizer',   component: WaveformVisualizer },
  { id: 'ParticlesVisualizer',  component: ParticlesVisualizer },
  { id: 'VinylVisualizer',      component: VinylVisualizer },
  { id: 'GlitchVisualizer',     component: GlitchVisualizer },
  { id: 'CassetteVisualizer',   component: CassetteVisualizer },
  { id: 'NeonPlayerVisualizer', component: NeonPlayerVisualizer },
  { id: 'PosterVisualizer',     component: PosterVisualizer },
  { id: 'DashboardVisualizer',  component: DashboardVisualizer },
  { id: 'CinematicVinylVisualizer', component: CinematicVinylVisualizer },
  { id: 'EditorialAlbumVisualizer', component: EditorialAlbumVisualizer },
  { id: 'SymmetricalVisualizer', component: SymmetricalVisualizer },
  { id: 'cinematic_vinyl_ui', component: CinematicVinylUIVisualizer },
]

export const RemotionRoot = () => (
  <>
    {standardCompositions.map(({ id, component: C }) => (
      <Composition
        key={id}
        id={id}
        component={C as unknown as React.ComponentType<Record<string, unknown>>}
        durationInFrames={210 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    ))}
    <Composition
      id="ApplePlayerVisualizer"
      component={ApplePlayerVisualizer as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={210 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={appleDefaultProps}
    />
    <Composition
      id="CircularPlayerVisualizer"
      component={CircularPlayerVisualizer as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={210 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={defaultProps}
    />
    <Composition
      id="RetroPlayerVisualizer"
      component={RetroPlayerVisualizer as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={210 * 30}
      fps={30}
      width={1080}
      height={1080}
      defaultProps={appleDefaultProps}
    />
    <Composition
      id="retro_cassette"
      component={RetroCassetteVisualizer as unknown as React.ComponentType<Record<string, unknown>>}
      durationInFrames={210 * 30}
      fps={30}
      width={1920}
      height={1080}
      defaultProps={defaultProps}
    />
  </>
)

registerRoot(RemotionRoot)
