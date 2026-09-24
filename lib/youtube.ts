const VIDEO_ID = /^[A-Za-z0-9_-]{11}$/;
const HOSTS = new Set(["youtube.com", "www.youtube.com", "m.youtube.com", "music.youtube.com", "youtu.be", "www.youtube-nocookie.com", "youtube-nocookie.com"]);

/**
 * Extracts the 11-character video id from common YouTube URL formats
 * (watch?v=, youtu.be/, /embed/, /shorts/, /live/) or a bare id. Returns null otherwise.
 */
export function parseYouTubeId(input: string): string | null {
  const value = input.trim();
  if (VIDEO_ID.test(value)) return value;

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (!["http:", "https:"].includes(url.protocol) || !HOSTS.has(url.hostname)) return null;

  const candidate =
    url.hostname === "youtu.be"
      ? url.pathname.slice(1).split("/")[0]
      : url.pathname === "/watch"
        ? url.searchParams.get("v")
        : url.pathname.match(/^\/(?:embed|shorts|live|v)\/([^/?#]+)/)?.[1];

  return candidate && VIDEO_ID.test(candidate) ? candidate : null;
}

/** Privacy-friendly embed URL. The id is validated, so it is safe to put in an iframe src. */
export function youTubeEmbedUrl(id: string): string {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function youTubeWatchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function youTubeThumbnail(id: string): string {
  return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
}
