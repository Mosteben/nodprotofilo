/** Supabase Storage host, so uploaded images can go through next/image optimisation. */
function supabaseImagePattern() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!url) return [];
  try {
    const { protocol, hostname } = new URL(url);
    return [
      {
        protocol: protocol.replace(":", ""),
        hostname,
        pathname: "/storage/v1/object/public/**",
      },
    ];
  } catch {
    return [];
  }
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      ...supabaseImagePattern(),
    ],
  },

  typedRoutes: true,

  // The blog moved from /articles to /blog; keep old links (and search rankings) working.
  async redirects() {
    return [
      { source: "/articles", destination: "/blog", permanent: true },
      { source: "/articles/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },

  // Opt-in for machines with little free RAM: `NEXT_BUILD_LOW_MEMORY=1 npm run build`.
  // Has no effect on Vercel unless the variable is set there.
  ...(process.env.NEXT_BUILD_LOW_MEMORY === "1" && {
    experimental: { cpus: 1, workerThreads: false },
  }),
};

export default nextConfig;
