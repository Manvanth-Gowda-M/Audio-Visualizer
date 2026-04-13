import { create } from 'zustand'

export interface LyricLine {
  time: number
  text: string
}

export interface AppState {
  audioFile: File | null
  audioUrl: string | null
  audioPath: string | null
  artworkFile: File | null
  artworkUrl: string | null
  artworkPath: string | null
  songTitle: string
  artist: string
  duration: number
  waveformData: number[]

  lyrics: LyricLine[]
  lyricsSource: 'lrclib' | 'genius' | 'whisper' | 'manual' | null
  lyricsLoading: boolean

  template: 'circle' | 'waveform' | 'particles'
  typoStyle: 'minimal' | 'bold' | 'neon'
  accentColor: string

  projectId: string | null
  renderStatus: 'idle' | 'queued' | 'processing' | 'done' | 'error'
  renderProgress: number
  outputUrl: string | null
  currentStep: 1 | 2 | 3 | 4

  setAudio: (file: File, url: string) => void
  setArtwork: (file: File, url: string) => void
  setMetadata: (title: string, artist: string, duration: number) => void
  setWaveformData: (data: number[]) => void
  setAudioPath: (path: string) => void
  setArtworkPath: (path: string) => void
  setLyrics: (lyrics: LyricLine[], source: AppState['lyricsSource']) => void
  setLyricsLoading: (loading: boolean) => void
  setTemplate: (template: AppState['template']) => void
  setTypoStyle: (style: AppState['typoStyle']) => void
  setAccentColor: (color: string) => void
  setCurrentStep: (step: 1 | 2 | 3 | 4) => void
  setRenderStatus: (status: AppState['renderStatus'], progress?: number) => void
  setOutputUrl: (url: string) => void
  setProjectId: (id: string) => void
  reset: () => void
}

const initialState = {
  audioFile: null,
  audioUrl: null,
  audioPath: null,
  artworkFile: null,
  artworkUrl: null,
  artworkPath: null,
  songTitle: '',
  artist: '',
  duration: 0,
  waveformData: [],
  lyrics: [],
  lyricsSource: null,
  lyricsLoading: false,
  template: 'circle' as const,
  typoStyle: 'minimal' as const,
  accentColor: '#a855f7',
  projectId: null,
  renderStatus: 'idle' as const,
  renderProgress: 0,
  outputUrl: null,
  currentStep: 1 as const,
}

export const useStore = create<AppState>((set) => ({
  ...initialState,
  setAudio: (file, url) => set({ audioFile: file, audioUrl: url }),
  setArtwork: (file, url) => set({ artworkFile: file, artworkUrl: url }),
  setMetadata: (title, artist, duration) => set({ songTitle: title, artist, duration }),
  setWaveformData: (data) => set({ waveformData: data }),
  setAudioPath: (path) => set({ audioPath: path }),
  setArtworkPath: (path) => set({ artworkPath: path }),
  setLyrics: (lyrics, source) => set({ lyrics, lyricsSource: source }),
  setLyricsLoading: (loading) => set({ lyricsLoading: loading }),
  setTemplate: (template) => set({ template }),
  setTypoStyle: (style) => set({ typoStyle: style }),
  setAccentColor: (color) => set({ accentColor: color }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setRenderStatus: (status, progress) =>
    set((s) => ({ renderStatus: status, renderProgress: progress ?? s.renderProgress })),
  setOutputUrl: (url) => set({ outputUrl: url }),
  setProjectId: (id) => set({ projectId: id }),
  reset: () => set(initialState),
}))
