export const UPLOAD_KINDS = ['audio', 'artwork'] as const
export const MEDIA_API_PATH_REGEX = /^\/api\/uploads\/([^/]+)\/([^/]+)$/

const uploadRootFromEnv = process.env.UPLOAD_ROOT?.trim()
// Default uses ephemeral temp storage; configure UPLOAD_ROOT for persistent storage in production.
export const TMP_UPLOAD_ROOT =
  uploadRootFromEnv && uploadRootFromEnv.length > 0
    ? uploadRootFromEnv
    : '/tmp/audio-visualizer/uploads'
