import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ attachmentId: string }> },
) {
  const { attachmentId } = await params;

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: attachmentId },
    });

    if (!attachment) {
      return new NextResponse("Attachment not found", { status: 404 });
    }

    // Return the blob with correct headers
    const headers = new Headers();
    headers.set("Content-Type", attachment.contentType);

    // Support UTF-8 encoded filenames for safety
    const encodedFilename = encodeURIComponent(attachment.filename);
    headers.set(
      "Content-Disposition",
      `attachment; filename="${attachment.filename}"; filename*=UTF-8''${encodedFilename}`,
    );
    headers.set("Content-Length", attachment.size.toString());

    return new NextResponse(attachment.content, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("[api/attachments] failed to fetch attachment:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
