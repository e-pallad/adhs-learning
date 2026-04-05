import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/dashboard", "/learning", "/roadmap", "/progress", "/settings", "/training", "/projects"],
    },
    sitemap: "https://devfluent.de/sitemap.xml",
  }
}
