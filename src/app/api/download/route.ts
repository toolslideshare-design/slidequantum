import { NextResponse } from "next/server";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { PDFDocument, rgb } from "pdf-lib";
import pptxgen from "pptxgenjs";
import { getCurrentUser } from "@/lib/user-auth";
import { addUserDownloadHistory } from "@/lib/data/user-dashboard";
import {
  extractPresentationTitle,
  extractSlideImageUrls,
} from "@/lib/slideshare/extract-slides";
export const runtime = "nodejs";

type DownloadRequest = {
  url?: string;
  format?: "PPT" | "PDF";
  preview?: boolean;
};

type SlideImage = {
  url: string;
  contentType: string;
  bytes: Uint8Array;
};

const DOWNLOAD_DIR = path.join(process.cwd(), "public", "downloads");
const DOWNLOAD_URL_PREFIX = "/downloads";

const requestHeaders = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
  Accept:
    "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
};

function isSlideshareUrl(input: string): boolean {
  try {
    const parsed = new URL(input);
    return (
      (parsed.protocol === "https:" || parsed.protocol === "http:") &&
      (parsed.hostname === "slideshare.net" ||
        parsed.hostname.endsWith(".slideshare.net"))
    );
  } catch {
    return false;
  }
}

async function fetchSlideImages(urls: string[]): Promise<SlideImage[]> {
  const images: SlideImage[] = [];

  for (const url of urls) {
    try {
      const response = await fetch(url, {
        headers: requestHeaders,
        cache: "no-store",
      });

      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") ?? "";

      if (
        !contentType.includes("image/jpeg") &&
        !contentType.includes("image/png")
      ) {
        continue;
      }
      const buffer = new Uint8Array(await response.arrayBuffer());

      if (buffer.byteLength > 0) {
        images.push({ url, contentType, bytes: buffer });
      }
    } catch {
      // Skip individual images that fail; keep processing the rest.
    }
  }

  return images;
}

async function createPdf(slides: SlideImage[]): Promise<Buffer> {
  const pdf = await PDFDocument.create();
  const pageWidth = 960;
  const pageHeight = 540;

  for (const slide of slides) {
    const page = pdf.addPage([pageWidth, pageHeight]);
    page.drawRectangle({
      x: 0,
      y: 0,
      width: pageWidth,
      height: pageHeight,
      color: rgb(0.02, 0.02, 0.02),
    });

    const image = slide.contentType.includes("png")
      ? await pdf.embedPng(slide.bytes)
      : await pdf.embedJpg(slide.bytes);

    const scaled = image.scaleToFit(pageWidth, pageHeight);
    page.drawImage(image, {
      x: (pageWidth - scaled.width) / 2,
      y: (pageHeight - scaled.height) / 2,
      width: scaled.width,
      height: scaled.height,
    });
  }

  return Buffer.from(await pdf.save());
}

async function createPpt(slides: SlideImage[]): Promise<Buffer> {
  const pptx = new pptxgen();
  pptx.layout = "LAYOUT_WIDE";
  pptx.author = "SlideQuantum";
  pptx.subject = "Converted SlideShare presentation";
  pptx.title = "Downloaded SlideShare presentation";
  pptx.company = "SlideQuantum";

  for (const slideImage of slides) {
    const slide = pptx.addSlide();
    slide.background = { color: "050505" };
    const mime = slideImage.contentType.includes("png") ? "image/png" : "image/jpeg";
    const data = `data:${mime};base64,${Buffer.from(slideImage.bytes).toString(
      "base64"
    )}`;

    slide.addImage({
      data,
      x: 0,
      y: 0,
      w: 13.333,
      h: 7.5,
    });
  }

  const output = await pptx.write({ outputType: "nodebuffer" });
  return Buffer.isBuffer(output)
    ? output
    : Buffer.from(output as ArrayBuffer);
}

async function saveGeneratedFile(buffer: Buffer, extension: "pdf" | "pptx") {
  await mkdir(DOWNLOAD_DIR, { recursive: true });

  const fileName = `slideshare-${Date.now()}-${randomUUID()}.${extension}`;
  const filePath = path.join(DOWNLOAD_DIR, fileName);
  await writeFile(filePath, buffer);

  return `${DOWNLOAD_URL_PREFIX}/${fileName}`;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DownloadRequest;
    const slideshareUrl = body.url?.trim();
    const format = body.format ?? "PDF";
    const preview = body.preview === true;

    if (!slideshareUrl) {
      return NextResponse.json(
        { error: "SlideShare URL is required" },
        { status: 400 }
      );
    }

    if (!isSlideshareUrl(slideshareUrl)) {
      return NextResponse.json(
        {
          error: "Only public SlideShare URLs are supported.",
        },
        { status: 400 }
      );
    }

    const pageResponse = await fetch(slideshareUrl, {
      headers: requestHeaders,
      cache: "no-store",
    });

    if (!pageResponse.ok) {
      return NextResponse.json(
        {
          error: "Could not fetch the SlideShare page.",
          status: pageResponse.status,
        },
        { status: 502 }
      );
    }

    const html = await pageResponse.text();
    const presentationTitle = extractPresentationTitle(html);
    const imageUrls = extractSlideImageUrls(html, {
      // Use JPG sizes for preview too — 2048px SlideShare images often timeout
      // in the Next.js image optimizer and make the gallery look broken.
      preferDownloadSafe: true,
    });

    if (imageUrls.length === 0) {
      return NextResponse.json(
        {
          error:
            "No public slide images were found on this SlideShare page. Private, login-only, or protected presentations are not supported.",
        },
        { status: 422 }
      );
    }

    if (preview) {
      return NextResponse.json({
        success: true,
        preview: true,
        format,
        title: presentationTitle,
        slideCount: imageUrls.length,
        previewImages: imageUrls,
        message: "Preview is ready.",
      });
    }

    const slides = await fetchSlideImages(imageUrls);

    if (slides.length === 0) {
      return NextResponse.json(
        {
          error:
            "Slide images were detected, but the server could not download them.",
        },
        { status: 422 }
      );
    }

    const output =
      format === "PPT" ? await createPpt(slides) : await createPdf(slides);
    const downloadUrl = await saveGeneratedFile(
      output,
      format === "PPT" ? "pptx" : "pdf"
    );
    const user = await getCurrentUser();

    if (user) {
      try {
        await addUserDownloadHistory(user.id, {
          title: presentationTitle,
          slideshareUrl,
          format,
          downloadUrl,
        });
      } catch {
        // Download generation should still succeed if history storage fails.
      }
    }

    return NextResponse.json({
      success: true,
      format,
      title: presentationTitle,
      downloadUrl,
      slideCount: slides.length,
      message: "Your file is ready to download.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unable to process download request",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
