const testUrl =
  process.argv[2] ??
  "https://www.slideshare.net/slideshow/2024-state-of-marketing-report-by-hubspot/266319371";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  Accept: "text/html",
};

const response = await fetch(testUrl, { headers });
const html = await response.text();
const start = html.indexOf(">", html.indexOf("__NEXT_DATA__")) + 1;
const end = html.indexOf("</script>", start);
const data = JSON.parse(html.slice(start, end));
const slideshow = data.props.pageProps.slideshow;

console.log("totalSlides:", slideshow.totalSlides);
console.log("slides object keys:", Object.keys(slideshow.slides));
console.log("slides sample:", JSON.stringify(slideshow.slides, null, 2).slice(0, 1200));

console.log("\nrecommendationsByLocation keys:", Object.keys(slideshow.recommendationsByLocation ?? {}));
const recs = slideshow.recommendationsByLocation;
if (recs) {
  for (const [key, value] of Object.entries(recs)) {
    console.log(" rec", key, Array.isArray(value) ? `array[${value.length}]` : typeof value);
    if (Array.isArray(value) && value[0]) {
      console.log("  sample:", JSON.stringify(value[0]).slice(0, 200));
    }
  }
}

console.log("\ntopReadSlides:", Array.isArray(slideshow.topReadSlides) ? slideshow.topReadSlides.length : slideshow.topReadSlides);

function buildUrls(slideshow) {
  const slides = slideshow.slides;
  const quality = slides.imageSizes?.at(-1)?.quality ?? 75;
  const width = slides.imageSizes?.at(-1)?.width ?? 2048;
  const template = `${slides.host}/${slides.imageLocation}/${quality}/${slides.title}-{}-${width}.jpg`;
  const urls = [];
  for (let i = 1; i <= slideshow.totalSlides; i += 1) {
    urls.push(template.replace("{}", String(i)));
  }
  return urls;
}

const urls = buildUrls(slideshow);
console.log("\nbuilt urls:", urls.length);
console.log("first:", urls[0]);
console.log("last:", urls.at(-1));

// compare with naive extraction
const naive = new Set();
for (const match of html.matchAll(/https?:\\?\/\\?\/[^"'<>\\s]+?\.(?:jpg|jpeg|png)/gi)) {
  const url = match[0].replace(/\\u002F/g, "/").replace(/\\\//g, "/");
  if (url.includes("slidesharecdn.com")) naive.add(url);
}
console.log("\nnaive cdn urls:", naive.size);
console.log("built only in naive:", [...naive].filter(u => !urls.includes(u)).slice(0, 5));
