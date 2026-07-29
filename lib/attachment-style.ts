export interface AttachmentBadge {
  label: string;
  bg: string;
  fg: string;
}

const BADGES: Record<string, AttachmentBadge> = {
  pdf: { label: "PDF", bg: "#FDF0EE", fg: "#C0483A" },
  csv: { label: "CSV", bg: "#EAF6EF", fg: "#1E7A4C" },
  zip: { label: "ZIP", bg: "#F2F1EC", fg: "#6B7671" },
  png: { label: "PNG", bg: "#EDF2FD", fg: "#3D5FA6" },
  jpg: { label: "JPG", bg: "#EDF2FD", fg: "#3D5FA6" },
  jpeg: { label: "JPG", bg: "#EDF2FD", fg: "#3D5FA6" },
  gif: { label: "GIF", bg: "#EDF2FD", fg: "#3D5FA6" },
  doc: { label: "DOC", bg: "#EDF2FD", fg: "#3D5FA6" },
  docx: { label: "DOC", bg: "#EDF2FD", fg: "#3D5FA6" },
  xls: { label: "XLS", bg: "#EAF6EF", fg: "#1E7A4C" },
  xlsx: { label: "XLS", bg: "#EAF6EF", fg: "#1E7A4C" },
};

const DEFAULT_BADGE: AttachmentBadge = {
  label: "FILE",
  bg: "#F2F1EC",
  fg: "#6B7671",
};

/** Best-effort badge derived from filename extension, falling back to MIME type. */
export function attachmentBadge(
  filename: string,
  contentType: string,
): AttachmentBadge {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext && BADGES[ext]) return BADGES[ext];

  const mimeSubtype = contentType.split("/").pop()?.toLowerCase();
  if (mimeSubtype && BADGES[mimeSubtype]) return BADGES[mimeSubtype];

  return DEFAULT_BADGE;
}
