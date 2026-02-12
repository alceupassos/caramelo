export const haptics = {
  light: () => navigator?.vibrate?.(10),
  medium: () => navigator?.vibrate?.(25),
  heavy: () => navigator?.vibrate?.(50),
  win: () => navigator?.vibrate?.([50, 30, 50, 30, 100]),
  loss: () => navigator?.vibrate?.([100, 50, 200]),
};
