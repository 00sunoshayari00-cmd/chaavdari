// lib/youtube.ts  (pure code, safe in the browser and on the server)
const ID = /^[\w-]{11}$/;

// Accepts a bare id, watch?v=..., youtu.be/..., /shorts/... or /embed/... links
export function extractYoutubeId(input: string): string | null {
  const value = input.trim();
  if (ID.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\.|^m\./, "");
    let candidate: string | null = null;

    if (host === "youtu.be") {
      candidate = url.pathname.slice(1).split("/")[0];
    } else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") candidate = url.searchParams.get("v");
      else
        candidate =
          url.pathname.match(/^\/(?:shorts|embed|live)\/([\w-]{11})/)?.[1] ??
          null;
    }
    return candidate && ID.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

// Only https links on youtube.com or youtu.be are accepted for the channel button
export function isYoutubeUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\.|^m\./, "");
    return (
      url.protocol === "https:" &&
      (host === "youtube.com" || host === "youtu.be")
    );
  } catch {
    return false;
  }
}
