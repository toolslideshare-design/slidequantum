import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const testUrl =
  "https://www.slideshare.net/slideshow/2024-state-of-marketing-report-by-hubspot/266319371";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0 Safari/537.36",
};

function parseNextData(html) {
  const markerIndex = html.indexOf("__NEXT_DATA__");
  const start = html.indexOf(">", markerIndex) + 1;
  const end = html.indexOf("</script>", start);
  return JSON.parse(html.slice(start, end));
}

function pickImageSize(sizes, preferDownloadSafe) {
  const jpgSizes = sizes.filter((size) => size.format === "jpg");
  if (preferDownloadSafe && jpgSizes.length > 0) {
    return jpgSizes.reduce((best, current) =>
      current.width > best.width ? current : best
    );
  }
  return sizes.reduce((best, current) =>
    current.width > best.width ? current : best
  );
}

function buildUrls(slideshow, preferDownloadSafe) {
  const config = slideshow.slides;
  const size = pickImageSize(config.imageSizes, preferDownloadSafe);
  const urls = [];
  for (let i = 1; i <= slideshow.totalSlides; i += 1) {
    urls.push(
      `${config.host}/${config.imageLocation}/${size.quality}/${config.title}-${i}-${size.width}.jpg`
    );
  }
  return urls;
}

const response = await fetch(testUrl, { headers });
const html = await response.text();
const slideshow = parseNextData(html).props.pageProps.slideshow;
const previewUrls = buildUrls(slideshow, false);
const downloadUrls = buildUrls(slideshow, true);

console.log("totalSlides:", slideshow.totalSlides);
console.log("preview urls:", previewUrls.length, "first:", previewUrls[0]);
console.log("download urls:", downloadUrls.length, "first:", downloadUrls[0]);

const indices = previewUrls.map((url) => Number(url.match(/-(\d+)-\d+\.jpg$/)[1]));
const orderOk = indices.every((value, index) => value === index + 1);
console.log("order ok:", orderOk);
console.log("unique urls:", new Set(previewUrls).size === previewUrls.length);

const oldPatterns = html.match(/https?:\/\/[^"'\\s<>]+slidesharecdn\.com[^"'\\s<>]*/gi) ?? [];
console.log("raw cdn urls in html:", oldPatterns.length);
console.log("preview avoids recommendations:", previewUrls.length < oldPatterns.length);
