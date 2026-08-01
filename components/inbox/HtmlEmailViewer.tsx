"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface HtmlEmailViewerProps {
  html: string;
}

export function HtmlEmailViewer({ html }: HtmlEmailViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(600);

  const preparedHtml = useMemo(() => {
    if (!html) return "";

    const resetStyles = `
      <style id="riov-inbox-email-reset">
        html, body {
          margin: 0 !important;
          padding: 24px !important;
          height: auto !important;
          min-height: 100% !important;
          max-height: none !important;
          overflow-x: auto !important;
          overflow-y: auto !important;
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
      <base target="_blank">
    `;

    let result = html;

    if (result.includes("</head>")) {
      result = result.replace("</head>", `${resetStyles}</head>`);
    } else if (result.includes("<head>")) {
      result = result.replace("<head>", `<head>${resetStyles}`);
    } else if (result.includes("<html")) {
      result = result.replace(/<html[^>]*>/, `$&<head>${resetStyles}</head>`);
    } else {
      result = `<!DOCTYPE html><html><head>${resetStyles}</head><body>${result}</body></html>`;
    }

    if (result.includes("</body>")) {
      result = result.replace("</body>", `${resetStyles}</body>`);
    }

    return result;
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

        if (body && docEl) {
          docEl.style.setProperty("overflow-y", "auto", "important");
          docEl.style.setProperty("height", "auto", "important");
          docEl.style.setProperty("max-height", "none", "important");
          body.style.setProperty("overflow-y", "auto", "important");
          body.style.setProperty("height", "auto", "important");
          body.style.setProperty("max-height", "none", "important");

          const contentHeight = Math.max(
            body.scrollHeight,
            body.offsetHeight,
            body.clientHeight,
            docEl.scrollHeight,
            docEl.offsetHeight,
            docEl.clientHeight,
          );

          if (contentHeight > 0) {
            setHeight(contentHeight + 24);
          }
        }
      } catch {
        // Fallback if cross-origin or measurement issue occurs
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
            if (doc.documentElement) {
              resizeObserver.observe(doc.documentElement);
            }
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

    const timeouts = [50, 150, 300, 600, 1200, 2500].map((delay) =>
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
      className="w-full bg-white border-0 overflow-y-auto min-h-[350px]"
      style={{ height: `${height}px` }}
    />
  );
}
