// Shared room coordinates (metres), taken from the prototype.
export const DX = -1.6
export const DZ = -3.55
export const DY = 0.75

// Which props respond to a click in each camera pose.
export const ACTIONABLE = {
  standing: ['desk', 'main', 'chair', 'can', 'lamp', 'pad', 'note'],
  seated: ['main', 'can', 'lamp', 'pad', 'note'],
  moving: [],
}
