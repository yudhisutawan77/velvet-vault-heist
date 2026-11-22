// The Velvet Vault — keyboard and mouse input, one job only.
// Tracks held keys and edge-triggered presses (a press fires once per keydown).

const heldKeys = new Set();
const pressedKeys = new Set();
let mouseX = 0;
let mouseY = 0;
let mouseClicked = false;

function keyName(event) {
  return event.key.length === 1 ? event.key.toLowerCase() : event.key;
}

export function bindInput(canvas) {
  window.addEventListener('keydown', (event) => {
    const key = keyName(event);
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(event.key)) {
      event.preventDefault();
    }
    if (!event.repeat) pressedKeys.add(key);
    heldKeys.add(key);
  });
  window.addEventListener('keyup', (event) => {
    heldKeys.delete(keyName(event));
  });
  window.addEventListener('blur', () => {
    heldKeys.clear();
    pressedKeys.clear();
  });
  canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
  });
  canvas.addEventListener('mousedown', (event) => {
    const rect = canvas.getBoundingClientRect();
    mouseX = event.clientX - rect.left;
    mouseY = event.clientY - rect.top;
    mouseClicked = true;
    event.preventDefault();
  });
}

export function isHeld(key) {
  return heldKeys.has(key);
}

/** True once for the frame the key went down; call endFrame() each tick to clear. */
export function wasPressed(key) {
  return pressedKeys.has(key);
}

export function endFrame() {
  pressedKeys.clear();
  mouseClicked = false;
}

export function readMoveVector() {
  let x = 0;
  let y = 0;
  if (isHeld('a') || isHeld('ArrowLeft')) x -= 1;
  if (isHeld('d') || isHeld('ArrowRight')) x += 1;
  if (isHeld('w') || isHeld('ArrowUp')) y -= 1;
  if (isHeld('s') || isHeld('ArrowDown')) y += 1;
  if (x !== 0 && y !== 0) {
    const inv = 1 / Math.sqrt(2);
    x *= inv;
    y *= inv;
  }
  return { x, y };
}

export function readMouse() {
  return { x: mouseX, y: mouseY, clicked: mouseClicked };
}
