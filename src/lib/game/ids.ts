const ALPH = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";

export function makeRoomCode() {
  let s = "";
  for (let i = 0; i < 6; i += 1) {
    s += ALPH[Math.floor(Math.random() * ALPH.length)]!;
  }
  return s;
}

export function newId() {
  return crypto.randomUUID();
}
