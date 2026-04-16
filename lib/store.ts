import { create } from 'zustand'

export interface LyricLine {
  time: number    // start time in seconds
  end?: number    // end time in seconds (next line's start)
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
  lyricsSource: 'lrclib' | 'megalobiz' | 'rclyricsband' | 'genius' | 'whisper' | 'manual' | null
  lyricsLoading: boolean
  lyricsSynced: boolean
  lyricsFont: string

  template: 'circle' | 'waveform' | 'particles' | 'vinyl' | 'glitch' | 'cassette' | 'neonplayer' | 'appleplayer'
  typoStyle: 'minimal' | 'bold' | 'neon'
  accentColor: string
  labelText: string
  // Visual effects
  effects: string[]  // array of active effect IDs
  // Export settings
  exportFormat: 'mp4' | 'webm' | 'gif'
  exportQuality: 'draft' | 'hd' | 'fullhd' | '4k'
  exportAspect: '16:9' | '9:16' | '1:1' | '4:5'
  themeColor: 'white' | 'gold' | 'blue' | 'purple'
  fontStyle: 'minimal' | 'serif' | 'mono'

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
  setLyrics: (lyrics: LyricLine[], source: AppState['lyricsSource'], synced?: boolean) => void
  setLyricsLoading: (loading: boolean) => void
  setLyricsFont: (font: string) => void
  toggleEffect: (id: string) => void
  setExportFormat: (f: AppState['exportFormat']) => void
  setExportQuality: (q: AppState['exportQuality']) => void
  setExportAspect: (a: AppState['exportAspect']) => void
  setTemplate: (template: AppState['template']) => void
  setTypoStyle: (style: AppState['typoStyle']) => void
  setAccentColor: (color: string) => void
  setLabelText: (text: string) => void
  setThemeColor: (color: AppState['themeColor']) => void
  setFontStyle: (style: AppState['fontStyle']) => void
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
  lyricsSource: null as AppState['lyricsSource'],
  lyricsLoading: false,
  lyricsSynced: false,
  lyricsFont: 'inter',
  effects: [],
  exportFormat: 'mp4' as AppState['exportFormat'],
  exportQuality: 'fullhd' as AppState['exportQuality'],
  exportAspect: '16:9' as AppState['exportAspect'],
  template: 'circle' as AppState['template'],
  typoStyle: 'minimal' as AppState['typoStyle'],
  accentColor: '#a855f7',
  labelText: 'Now Playing',
  themeColor: 'white' as AppState['themeColor'],
  fontStyle: 'minimal' as AppState['fontStyle'],
  projectId: null as string | null,
  renderStatus: 'idle' as AppState['renderStatus'],
  renderProgress: 0,
  outputUrl: null as string | null,
  currentStep: 1 as AppState['currentStep'],
}

export const useStore = create<AppState>((set) => ({
  ...initialState,
  setAudio: (file, url) => set({ audioFile: file, audioUrl: url }),
  setArtwork: (file, url) => set({ artworkFile: file, artworkUrl: url }),
  setMetadata: (title, artist, duration) => set({ songTitle: title, artist, duration }),
  setWaveformData: (data) => set({ waveformData: data }),
  setAudioPath: (path) => set({ audioPath: path }),
  setArtworkPath: (path) => set({ artworkPath: path }),
  setLyrics: (lyrics, source, synced = false) => set({ lyrics, lyricsSource: source, lyricsSynced: synced }),
  setLyricsLoading: (loading) => set({ lyricsLoading: loading }),
  setLyricsFont: (font) => set({ lyricsFont: font }),
  toggleEffect: (id) => set((s) => ({
    effects: s.effects.includes(id)
      ? s.effects.filter(e => e !== id)
      : [...s.effects, id]
  })),
  setExportFormat:  (f) => set({ exportFormat: f }),
  setExportQuality: (q) => set({ exportQuality: q }),
  setExportAspect:  (a) => set({ exportAspect: a }),
  setTemplate: (template) => set({ template }),
  setTypoStyle: (style) => set({ typoStyle: style }),
  setAccentColor: (color) => set({ accentColor: color }),
  setLabelText: (text) => set({ labelText: text }),
  setThemeColor: (color) => set({ themeColor: color }),
  setFontStyle: (style) => set({ fontStyle: style }),
  setCurrentStep: (step) => set({ currentStep: step }),
  setRenderStatus: (status, progress) =>
    set((s) => ({ renderStatus: status, renderProgress: progress ?? s.renderProgress })),
  setOutputUrl: (url) => set({ outputUrl: url }),
  setProjectId: (id) => set({ projectId: id }),
  reset: () => set(initialState),
}))
