export function cleanText(value: unknown, max = 120) {
  if (typeof value !== "string") {
    return "";
  }

  return value.trim().slice(0, max);
}

export function cleanPlayers(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((player) => cleanText(player, 80))
    .filter(Boolean)
    .slice(0, 14);
}
