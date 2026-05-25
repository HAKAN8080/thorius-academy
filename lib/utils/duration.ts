export function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return "";

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return minutes > 0 ? `${hours} sa ${minutes} dk` : `${hours} sa`;
  }

  if (minutes > 0) {
    return `${minutes} dk`;
  }

  return "1 dk";
}