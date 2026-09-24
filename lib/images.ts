/** Hosts configured in next.config.mjs `images.remotePatterns`. */
function optimizableHosts(): string[] {
  const hosts = ["images.unsplash.com", "i.ytimg.com"];
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (supabaseUrl) {
    try {
      hosts.push(new URL(supabaseUrl).hostname);
    } catch {
      // Invalid URL: Supabase images simply won't be optimised.
    }
  }
  return hosts;
}

/**
 * Whether next/image can optimise this source. Other hosts (e.g. an image URL pasted in
 * the CMS) are rendered unoptimised instead of crashing the page.
 */
export function isOptimizableImage(src: string): boolean {
  if (src.startsWith("/") && !src.startsWith("//")) return true;
  try {
    return optimizableHosts().includes(new URL(src).hostname);
  } catch {
    return false;
  }
}
