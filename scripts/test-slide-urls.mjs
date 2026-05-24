const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
};

const response = await fetch(
  "https://www.slideshare.net/HubSpot/2024-state-of-marketing-report-by-hubspot",
  { headers }
);
const html = await response.text();
const patterns = [
  /rel=["']canonical["'][^>]*href=["']([^"']+)["']/i,
  /href=["']([^"']+)["'][^>]*rel=["']canonical["']/i,
  /property=["']og:url["'][^>]*content=["']([^"']+)["']/i,
  /"canonicalUrl"\s*:\s*"([^"]+)"/,
  /\/slideshow\/[^"'\\s]+/
];
for (const pattern of patterns) {
  const match = html.match(pattern);
  console.log(String(pattern), match?.[1] ?? match?.[0] ?? "none");
}
