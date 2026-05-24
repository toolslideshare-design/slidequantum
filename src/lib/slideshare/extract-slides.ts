export type SlideshowImageSize = {
  quality: number;
  width: number;
  format: string;
};

export type SlideshowSlideConfig = {
  host: string;
  title: string;
  imageLocation: string;
  imageSizes: SlideshowImageSize[];
};

export type SlideshowData = {
  title?: string;
  strippedTitle?: string;
  totalSlides?: number;
  slides?: SlideshowSlideConfig;
};

export type SlideExtractionResult = {
  imageUrls: string[];
  title: string;
  slideCount: number;
  source: "next-data" | "legacy-filtered" | "none";
};

const MAX_SLIDES = 80;

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function normalizeHtmlUrl(value: string): string {
  return decodeHtmlEntities(
    value.replace(/\\u002F/g, "/").replace(/\\\//g, "/").replace(/\\+/g, "")
  );
}

function parseNextData(html: string): unknown | null {
  const marker = "__NEXT_DATA__";
  const markerIndex = html.indexOf(marker);

  if (markerIndex < 0) {
    return null;
  }

  const start = html.indexOf(">", markerIndex) + 1;
  const end = html.indexOf("</script>", start);

  if (start <= 0 || end <= start) {
    return null;
  }

  try {
    return JSON.parse(html.slice(start, end));
  } catch {
    return null;
  }
}

export function getSlideshowFromHtml(html: string): SlideshowData | null {
  const data = parseNextData(html) as {
    props?: { pageProps?: { slideshow?: SlideshowData } };
  };

  const slideshow = data?.props?.pageProps?.slideshow;

  if (
    !slideshow?.slides?.host ||
    !slideshow.slides.imageLocation ||
    !slideshow.slides.title ||
    !Array.isArray(slideshow.slides.imageSizes) ||
    slideshow.slides.imageSizes.length === 0 ||
    !slideshow.totalSlides ||
    slideshow.totalSlides < 1
  ) {
    return null;
  }

  return slideshow;
}

function pickImageSize(
  sizes: SlideshowImageSize[],
  preferDownloadSafe = false
): SlideshowImageSize {
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

export function buildSlideImageUrls(
  slideshow: SlideshowData,
  options?: { preferDownloadSafe?: boolean }
): string[] {
  const slideConfig = slideshow.slides;
  const totalSlides = slideshow.totalSlides;

  if (!slideConfig || !totalSlides) {
    return [];
  }

  const imageSize = pickImageSize(
    slideConfig.imageSizes,
    options?.preferDownloadSafe
  );
  // SlideShare serves high-res webp assets from .jpg URLs.
  const extension = "jpg";
  const host = slideConfig.host.replace(/\/$/, "");
  const urls: string[] = [];

  for (let index = 1; index <= totalSlides; index += 1) {
    urls.push(
      `${host}/${slideConfig.imageLocation}/${imageSize.quality}/${slideConfig.title}-${index}-${imageSize.width}.${extension}`
    );
  }

  return urls.slice(0, MAX_SLIDES);
}

function extractPresentationTitleFromHtml(html: string, slideshow?: SlideshowData | null) {
  if (slideshow?.title?.trim()) {
    return decodeHtmlEntities(slideshow.title.trim());
  }

  if (slideshow?.strippedTitle?.trim()) {
    return decodeHtmlEntities(slideshow.strippedTitle.trim());
  }

  const patterns = [
    /property=["']og:title["'][^>]*content=["']([^"']+)["']/i,
    /content=["']([^"']+)["'][^>]*property=["']og:title["']/i,
    /<title>([^<]+)<\/title>/i,
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);

    if (match?.[1]) {
      return decodeHtmlEntities(match[1])
        .replace(/\s*\|\s*SlideShare\s*$/i, "")
        .replace(/\s*-\s*SlideShare\s*$/i, "")
        .trim();
    }
  }

  return "SlideShare Presentation";
}

function isSupportedImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const pathName = parsed.pathname.toLowerCase();

    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (pathName.endsWith(".jpg") ||
        pathName.endsWith(".jpeg") ||
        pathName.endsWith(".png") ||
        pathName.endsWith(".webp")) &&
      parsed.hostname.includes("slidesharecdn.com")
    );
  } catch {
    return false;
  }
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractLegacyFilteredSlideUrls(
  html: string,
  slideshow: SlideshowData | null
): string[] {
  const imageLocation = slideshow?.slides?.imageLocation;
  const slideTitle = slideshow?.slides?.title;
  const totalSlides = slideshow?.totalSlides;

  if (imageLocation && slideTitle && totalSlides) {
    const pattern = new RegExp(
      `https?:\\/\\/[^"'\\s<>]+slidesharecdn\\.com\\/${escapeRegex(imageLocation)}\\/[^"'\\s<>]+\\/${escapeRegex(slideTitle)}-(\\d+)-\\d+\\.(?:jpg|jpeg|webp)(?:\\?[^"'\\s<>]*)?`,
      "gi"
    );
    const byIndex = new Map<number, string>();

    for (const match of html.matchAll(pattern)) {
      const index = Number(match[1]);
      const url = normalizeHtmlUrl(match[0]);

      if (
        Number.isFinite(index) &&
        index >= 1 &&
        index <= totalSlides &&
        isSupportedImageUrl(url) &&
        !byIndex.has(index)
      ) {
        byIndex.set(index, url);
      }
    }

    if (byIndex.size > 0) {
      return Array.from({ length: totalSlides }, (_, offset) => byIndex.get(offset + 1))
        .filter((url): url is string => Boolean(url))
        .slice(0, MAX_SLIDES);
    }
  }

  return [];
}

export function extractSlidesFromHtml(
  html: string,
  options?: { preferDownloadSafe?: boolean }
): SlideExtractionResult {
  const slideshow = getSlideshowFromHtml(html);
  const title = extractPresentationTitleFromHtml(html, slideshow);

  if (slideshow) {
    const imageUrls = buildSlideImageUrls(slideshow, options);

    if (imageUrls.length > 0) {
      return {
        imageUrls,
        title,
        slideCount: imageUrls.length,
        source: "next-data",
      };
    }
  }

  const legacyUrls = extractLegacyFilteredSlideUrls(html, slideshow);

  if (legacyUrls.length > 0) {
    return {
      imageUrls: legacyUrls,
      title,
      slideCount: legacyUrls.length,
      source: "legacy-filtered",
    };
  }

  return {
    imageUrls: [],
    title,
    slideCount: 0,
    source: "none",
  };
}

export function extractSlideImageUrls(
  html: string,
  options?: { preferDownloadSafe?: boolean }
): string[] {
  return extractSlidesFromHtml(html, options).imageUrls;
}

export function extractPresentationTitle(html: string): string {
  const slideshow = getSlideshowFromHtml(html);
  return extractPresentationTitleFromHtml(html, slideshow);
}
