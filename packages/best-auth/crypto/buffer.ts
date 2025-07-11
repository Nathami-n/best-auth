export function constantTimeEqual(
  a: ArrayBuffer | Uint8Array,
  b: ArrayBuffer | Uint8Array
): boolean {
  const a_buffer = new Uint8Array(a);
  const b_buffer = new Uint8Array(b);

  if (a_buffer.length !== b_buffer.length) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a_buffer.length; i++) {
    c |= a_buffer[i] ^ b_buffer[i];
  }
  return c === 0;
}
