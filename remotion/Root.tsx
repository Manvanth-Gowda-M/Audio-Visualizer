import { Composition, registerRoot } from 'remotion'
import { CircleVisualizer } from './compositions/CircleVisualizer'
import { WaveformVisualizer } from './compositions/WaveformVisualizer'
import { ParticlesVisualizer } from './compositions/ParticlesVisualizer'
import { VinylVisualizer } from './compositions/VinylVisualizer'
import { GlitchVisualizer } from './compositions/GlitchVisualizer'
import { CassetteVisualizer } from './compositions/CassetteVisualizer'
import { NeonPlayerVisualizer } from './compositions/NeonPlayerVisualizer'
import { ApplePlayerVisualizer } from './compositions/ApplePlayerVisualizer'
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
]

export const RemotionRoot = () => (
  <>
    {standardCompositions.map(({ id, component: C }) => (
      <Composition
        key={id}
        id={id}
        component={C}
        durationInFrames={210 * 30}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultProps}
      />
    ))}
    <Composition
      id="ApplePlayerVisualizer"
      component={ApplePlayerVisualizer as React.ComponentType<Record<string, unknown>>}
      durationInFrames={210 * 30}
      fps={30}
      width={1080}
      height={1920}
      defaultProps={appleDefaultProps}
    />
  </>
)

registerRoot(RemotionRoot)
