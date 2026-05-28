import { toFile } from "openai";
import { openai, PRIMARY_MODEL } from "./openai.js";

export interface ExtractedContent {
  text: string;
  kind: "pdf" | "docx" | "txt" | "image" | "audio" | "video" | "url";
}

const MAX_TEXT_CHARS = 50000;

function clamp(text: string): string {
  return text.length > MAX_TEXT_CHARS ? text.slice(0, MAX_TEXT_CHARS) : text;
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

async function extractPdf(buffer: Buffer): Promise<string> {
  const mod: any = await import("pdf-parse");
  const pdfParse = mod.default ?? mod;
  const data = await pdfParse(buffer);
  return (data.text ?? "").trim();
}

async function extractDocx(buffer: Buffer): Promise<string> {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ buffer });
  return (result.value ?? "").trim();
}

async function extractImage(buffer: Buffer, mimetype: string): Promise<string> {
  const b64 = buffer.toString("base64");
  const dataUrl = `data:${mimetype};base64,${b64}`;
  const response = await openai.chat.completions.create({
    model: PRIMARY_MODEL,
    max_completion_tokens: 4096,
    messages: [
      {
        role: "system",
        content:
          "You are a study assistant that extracts the full educational content of an image. Transcribe any text exactly, then describe diagrams, tables, charts, or formulas in clear study-note form. Output plain text only - no preamble.",
      },
      {
        role: "user",
        content: [
          { type: "text", text: "Extract all text and explain any diagrams or visuals in this study material." },
          { type: "image_url", image_url: { url: dataUrl } },
        ] as any,
      },
    ],
  });
  return (response.choices[0]?.message?.content ?? "").trim();
}

async function extractAudio(buffer: Buffer, filename: string, mimetype: string): Promise<string> {
  const file = await toFile(buffer, filename || "audio.bin", {
    type: mimetype || "application/octet-stream",
  });
  const result = await openai.audio.transcriptions.create({
    file,
    model: "gpt-4o-mini-transcribe",
    response_format: "json",
  });
  return (result.text ?? "").trim();
}

export async function extractFromFile(args: {
  buffer: Buffer;
  mimetype: string;
  filename: string;
}): Promise<ExtractedContent> {
  const { buffer, mimetype, filename } = args;
  const lowerName = filename.toLowerCase();
  const mt = (mimetype || "").toLowerCase();

  // PDF
  if (mt === "application/pdf" || lowerName.endsWith(".pdf")) {
    return { text: clamp(await extractPdf(buffer)), kind: "pdf" };
  }
  // DOCX / DOC
  if (
    mt === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mt === "application/msword" ||
    lowerName.endsWith(".docx") ||
    lowerName.endsWith(".doc")
  ) {
    return { text: clamp(await extractDocx(buffer)), kind: "docx" };
  }
  // Plain text
  if (mt.startsWith("text/") || lowerName.endsWith(".txt") || lowerName.endsWith(".md")) {
    return { text: clamp(buffer.toString("utf8").trim()), kind: "txt" };
  }
  // Image
  if (mt.startsWith("image/")) {
    return { text: clamp(await extractImage(buffer, mt || "image/png")), kind: "image" };
  }
  // Audio
  if (mt.startsWith("audio/")) {
    return { text: clamp(await extractAudio(buffer, filename, mt)), kind: "audio" };
  }
  // Video - send to Whisper; it accepts mp4/mov/webm and pulls the audio track
  if (mt.startsWith("video/")) {
    return { text: clamp(await extractAudio(buffer, filename, mt)), kind: "video" };
  }
  throw new Error(`Unsupported file type: ${mimetype || filename}`);
}

export async function extractFromUrl(url: string): Promise<ExtractedContent> {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; PaideiaStudy/1.0; +https://paideia-ren.com)",
      Accept: "text/html,application/xhtml+xml,*/*;q=0.8",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch URL (${res.status})`);
  }
  const contentType = res.headers.get("content-type") || "";
  const body = await res.text();
  let text: string;
  if (contentType.includes("html")) {
    text = stripHtml(body);
  } else {
    text = body.replace(/\s+/g, " ").trim();
  }
  return { text: clamp(text), kind: "url" };
}
