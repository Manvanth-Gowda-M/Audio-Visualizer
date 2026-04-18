declare module 'lyrics-finder' {
  const lyricsFinder: (artist: string, title: string) => Promise<string>
  export default lyricsFinder
}
