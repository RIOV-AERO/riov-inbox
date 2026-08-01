"use client";

import { useEffect, useRef, useState, useMemo } from "react";

interface HtmlEmailViewerProps {
  html: string;
}

export function HtmlEmailViewer({ html }: HtmlEmailViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState<number>(400);

  const preparedHtml = useMemo(() => {
    if (!html) return "";

    const resetStyles = `
      <style id="riov-inbox-email-reset">
        html, body {
          margin: 0 !important;
          padding: 24px !important;
          height: auto !important;
          min-height: 0 !important;
          max-height: none !important;
          overflow-x: auto !important;
          overflow-y: visible !important;
          -webkit-overflow-scrolling: touch !important;
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

    return result;
  }, [html]);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    let resizeObserver: ResizeObserver | null = null;
    let mutationObserver: MutationObserver | null = null;

    const updateHeight = () => {
      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc || !doc.body) return;

        const body = doc.body;
        const docEl = doc.documentElement;

        docEl.style.setProperty("height", "auto", "important");
        docEl.style.setProperty("min-height", "0px", "important");
        body.style.setProperty("height", "auto", "important");
        body.style.setProperty("min-height", "0px", "important");

        let maxChildBottom = 0;
        const children = body.querySelectorAll("*");
        for (let i = 0; i < children.length; i++) {
          const rect = children[i].getBoundingClientRect();
          if (rect.bottom > maxChildBottom) {
            maxChildBottom = rect.bottom;
          }
        }

        const contentHeight = Math.max(
          body.scrollHeight,
          body.offsetHeight,
          docEl.scrollHeight,
          docEl.offsetHeight,
          Math.ceil(maxChildBottom),
        );

        if (contentHeight > 0) {
          setHeight(contentHeight + 32);
        }
      } catch {
        // Fallback if cross-origin or measurement issue occurs
      }
    };

    let touchStartY = 0;
    let touchStartX = 0;
    let initialScrollTop = 0;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartY = e.touches[0].clientY;
        touchStartX = e.touches[0].clientX;
        const container = iframe.closest(
          ".overflow-y-auto",
        ) as HTMLElement | null;
        if (container) {
          initialScrollTop = container.scrollTop;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;

      const currentY = e.touches[0].clientY;
      const currentX = e.touches[0].clientX;
      const deltaY = touchStartY - currentY;
      const deltaX = touchStartX - currentX;

      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        const container = iframe.closest(
          ".overflow-y-auto",
        ) as HTMLElement | null;
        if (container) {
          container.scrollTop = initialScrollTop + deltaY;
        }
      }
    };

    const setupDocListeners = () => {
      updateHeight();

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (!doc || !doc.body) return;

        doc.removeEventListener("touchstart", handleTouchStart);
        doc.removeEventListener("touchmove", handleTouchMove);
        doc.addEventListener("touchstart", handleTouchStart, { passive: true });
        doc.addEventListener("touchmove", handleTouchMove, { passive: true });

        if (typeof ResizeObserver !== "undefined") {
          if (resizeObserver) resizeObserver.disconnect();
          resizeObserver = new ResizeObserver(() => updateHeight());
          resizeObserver.observe(doc.body);
          if (doc.documentElement) {
            resizeObserver.observe(doc.documentElement);
          }
        }

        if (typeof MutationObserver !== "undefined") {
          if (mutationObserver) mutationObserver.disconnect();
          mutationObserver = new MutationObserver(() => updateHeight());
          mutationObserver.observe(doc.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true,
          });
        }

        const images = doc.querySelectorAll("img");
        images.forEach((img) => {
          if (!img.complete) {
            img.addEventListener("load", updateHeight, { once: true });
            img.addEventListener("error", updateHeight, { once: true });
          }
        });
      } catch {
        // Ignore
      }
    };

    iframe.addEventListener("load", setupDocListeners);
    window.addEventListener("resize", updateHeight);

    setupDocListeners();

    const timeouts = [50, 150, 300, 600, 1200, 2500].map((delay) =>
      setTimeout(updateHeight, delay),
    );

    return () => {
      iframe.removeEventListener("load", setupDocListeners);
      window.removeEventListener("resize", updateHeight);
      if (resizeObserver) resizeObserver.disconnect();
      if (mutationObserver) mutationObserver.disconnect();
      timeouts.forEach(clearTimeout);

      try {
        const doc = iframe.contentDocument || iframe.contentWindow?.document;
        if (doc) {
          doc.removeEventListener("touchstart", handleTouchStart);
          doc.removeEventListener("touchmove", handleTouchMove);
        }
      } catch {}
    };
  }, [preparedHtml]);

  return (
    <iframe
      ref={iframeRef}
      srcDoc={preparedHtml}
      sandbox="allow-same-origin allow-popups allow-popups-to-escape-sandbox"
      title="Conteúdo do e-mail"
      className="block w-full border-0 bg-white"
      style={{ height: `${height}px` }}
    />
  );
}
