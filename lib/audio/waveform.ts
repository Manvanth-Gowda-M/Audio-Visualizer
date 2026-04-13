export async function extractWaveform(audioBuffer: AudioBuffer, samples = 200): Promise<number[]> {
  const rawData = audioBuffer.getChannelData(0)
  const blockSize = Math.floor(rawData.length / samples)
  const result: number[] = []

  for (let i = 0; i < samples; i++) {
    const start = i * blockSize
    let sum = 0
    for (let j = 0; j < blockSize; j++) {
      sum += rawData[start + j] ** 2
    }
    result.push(Math.sqrt(sum / blockSize))
  }

  const max = Math.max(...result, 0.001)
  return result.map((v) => v / max)
}
