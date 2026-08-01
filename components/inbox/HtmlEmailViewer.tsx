"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface HtmlEmailViewerProps {
  html: string;
}

export function HtmlEmailViewer({ html }: HtmlEmailViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(500);

  const preparedHtml = useMemo(() => {
    if (!html) return "";

    const resetStylesAndBase = `
      <base target="_blank">
      <style id="riov-inbox-email-reset">
        html, body {
          margin: 0 !important;
          padding: 24px !important;
          height: auto !important;
          min-height: 100% !important;
          overflow: visible !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          box-sizing: border-box !important;
        }
        img {
          max-width: 100% !important;
          height: auto !important;
        }
        table {
          max-width: 100% !important;
        }
      </style>
    `;

    if (html.includes("<head>")) {
      return html.replace("<head>", `<head>${resetStylesAndBase}`);
    }
    if (html.includes("<html")) {
      return html.replace(
        /<html[^>]*>/,
        `$&<head>${resetStylesAndBase}</head>`,
      );
    }
    return `<!DOCTYPE html><html><head>${resetStylesAndBase}</head><body>${html}</body></html>`;
  }, [html]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let resizeObserver: ResizeObserver | null = null;

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc) return;
        const body = doc.body;
        const docEl = doc.documentElement;

        if (body || docEl) {
          const contentHeight = Math.max(
            body?.scrollHeight ?? 0,
            body?.offsetHeight ?? 0,
            docEl?.clientHeight ?? 0,
            docEl?.scrollHeight ?? 0,
            docEl?.offsetHeight ?? 0,
          );
          if (contentHeight > 0) {
            setHeight(contentHeight + 16);
          }
        }
      } catch {
        // Fallback to default height if cross-origin or measurement issue
      }
    };

    const handleLoad = () => {
      updateHeight();

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc && doc.body) {
          if (typeof ResizeObserver !== "undefined") {
            resizeObserver = new ResizeObserver(() => {
              updateHeight();
            });
            resizeObserver.observe(doc.body);
          }

          const images = doc.querySelectorAll("img");
          images.forEach((img) => {
            if (!img.complete) {
              img.addEventListener("load", updateHeight);
              img.addEventListener("error", updateHeight);
            }
          });
        }
      } catch {}
    };

    iframe.addEventListener("load", handleLoad);

    updateHeight();

    const timeouts = [100, 300, 600, 1200, 2500].map((delay) =>
      setTimeout(updateHeight, delay),
    );

    return () => {
      iframe.removeEventListener("load", handleLoad);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      timeouts.forEach(clearTimeout);
    };
  }, [preparedHtml]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={preparedHtml}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      title="Conteúdo do e-mail"
      className="w-full bg-white transition-[height] duration-150 ease-out border-0"
      style={{ height: `${height}px`, minHeight: "300px" }}
    />
  );
}
