import { create } from 'zustand'

export interface LyricLine {
  time: number    // start time in seconds
  end?: number    // end time in seconds (next line's start)
  text: string
}

export type CaptionPosition =
  | 'top-left' | 'top-center' | 'top-right'
  | 'middle-left' | 'center' | 'middle-right'
  | 'bottom-left' | 'bottom-center' | 'bottom-right'

export type CaptionAnimation =
  | 'none' | 'fade' | 'slideUp' | 'slideDown'
  | 'slideLeft' | 'slideRight' | 'zoom' | 'typewriter' | 'bounce'

export type CaptionStylePreset =
  | 'minimal' | 'cinema' | 'neon' | 'brutalist' | 'gradient'
  | 'vintage' | 'hiphop' | 'lyric' | 'studio' | 'glitch'

export interface Caption {
  id: string
  text: string
  startTime: number
  endTime: number
  font: string
  fontFamily: string
  stylePreset: CaptionStylePreset
  color: string
  gradientFrom: string
  gradientTo: string
  useGradient: boolean
  position: CaptionPosition
  fontSize: number
  animation: CaptionAnimation
  bold: boolean
  italic: boolean
  outline: boolean
  outlineColor: string
  outlineWidth: number
  glow: boolean
  glowColor: string
  glowIntensity: number
  shadow: boolean
  textAlign: 'left' | 'center' | 'right'
  backgroundColor: string
  backgroundOpacity: number
  letterSpacing: number
  uppercase: boolean
}

export interface AppState {
  audioFile: File | null
  audioUrl: string | null
  audioPath: string | null
  artworkFile: File | null
  artworkUrl: string | null
  artworkPath: string | null
  personImageFiles: File[]
  personImagePaths: string[]
  /** true ONLY after a successful POST /api/upload — never when just a local File is dropped */
  isUploaded: boolean
  songTitle: string
  artist: string
  duration: number
  waveformData: number[]

  captions: Caption[]
  lyrics: LyricLine[]
  lyricsSource: 'lrclib' | 'megalobiz' | 'rclyricsband' | 'genius' | 'whisper' | 'manual' | null
  lyricsLoading: boolean
  lyricsSynced: boolean
  lyricsFont: string

  template: 'circle' | 'waveform' | 'particles' | 'vinyl' | 'glitch' | 'cassette' | 'neonplayer' | 'appleplayer' | 'poster' | 'dashboard' | 'circular' | 'cinematic' | 'editorial' | 'symmetrical' | 'retro' | 'retro_cassette' | 'cinematic_vinyl_ui' | 'aesthetic'
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
  currentStep: 1 | 2 | 3

  setAudio: (file: File, url: string) => void
  setArtwork: (file: File, url: string) => void
  setPersonImages: (files: File[]) => void
  setMetadata: (title: string, artist: string, duration: number) => void
  setWaveformData: (data: number[]) => void
  setAudioPath: (path: string) => void
  setArtworkPath: (path: string) => void
  setPersonImagePaths: (paths: string[]) => void
  setIsUploaded: (v: boolean) => void
  /** Wipe all file/media state so Step1 shows fresh drop zones. Keeps template & style prefs. */
  addCaption: (caption: Caption) => void
  updateCaption: (id: string, updates: Partial<Caption>) => void
  removeCaption: (id: string) => void
  setCaptions: (captions: Caption[]) => void
  clearFiles: () => void
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
  setCurrentStep: (step: 1 | 2 | 3) => void
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
  personImageFiles: [],
  personImagePaths: [],
  isUploaded: false,
  songTitle: '',
  artist: '',
  duration: 0,
  waveformData: [],
  captions: [],
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
  currentStep: 1 as (1|2|3),
}

const fileResetState = {
  audioFile: null,
  audioUrl: null,
  audioPath: null,
  artworkFile: null,
  artworkUrl: null,
  artworkPath: null,
  personImageFiles: [],
  personImagePaths: [],
  isUploaded: false,
  songTitle: '',
  artist: '',
  duration: 0,
  waveformData: [],
  captions: [],
  lyrics: [],
  lyricsSource: null as AppState['lyricsSource'],
  lyricsSynced: false,
  lyricsLoading: false,
  renderStatus: 'idle' as AppState['renderStatus'],
  renderProgress: 0,
  outputUrl: null as string | null,
  currentStep: 1 as (1|2|3),
}

export const useStore = create<AppState>((set) => ({
  ...initialState,
  setAudio: (file, url) => set({ audioFile: file, audioUrl: url }),
  setArtwork: (file, url) => set({ artworkFile: file, artworkUrl: url }),
  setPersonImages: (files) => set({ personImageFiles: files }),
  setMetadata: (title, artist, duration) => set({ songTitle: title, artist, duration }),
  setWaveformData: (data) => set({ waveformData: data }),
  setAudioPath: (path) => set({ audioPath: path }),
  setArtworkPath: (path) => set({ artworkPath: path }),
  setPersonImagePaths: (paths) => set({ personImagePaths: paths }),
  setIsUploaded: (v) => set({ isUploaded: v }),
  addCaption: (caption) => set(s => ({ captions: [...s.captions, caption] })),
  updateCaption: (id, updates) => set(s => ({ captions: s.captions.map(c => c.id === id ? { ...c, ...updates } : c) })),
  removeCaption: (id) => set(s => ({ captions: s.captions.filter(c => c.id !== id) })),
  setCaptions: (captions) => set({ captions }),
  clearFiles: () => set(fileResetState),
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
  setCurrentStep: (step: 1|2|3) => set({ currentStep: step }),
  setRenderStatus: (status, progress) =>
    set((s) => ({ renderStatus: status, renderProgress: progress ?? s.renderProgress })),
  setOutputUrl: (url) => set({ outputUrl: url }),
  setProjectId: (id) => set({ projectId: id }),
  reset: () => set(initialState),
}))
