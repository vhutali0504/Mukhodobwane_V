// True when the browser can create a WebGL context. The probe context is
// released straight away so it does not count against the browser's limit.
export function hasWebGL() {
  try {
    if (typeof window === 'undefined' || !window.WebGLRenderingContext) return false
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
    if (!gl) return false
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}
