/**
 * Shareable landing page for a notice or receipt.
 *
 * Deliberately a SERVER component with no "use client": WhatsApp's crawler sends
 * no cookies and runs no JavaScript, so the Open Graph tags have to be in the
 * HTML that the server returns. `generateMetadata` runs per request and produces
 * them from the same fetch the page body uses.
 *
 * The route is public — see AuthGuard's PUBLIC_PATHS. Access is capability-based:
 * you need the document's unguessable ObjectId, matching how the existing public
 * PDF download routes already work.
 */

import type { Metadata } from "next";
import { API_URL } from "../../../../constants/phases";

const KINDS = ["receipt", "notice"] as const;
type Kind = (typeof KINDS)[number];

interface PublicDocument {
  kind: Kind;
  id: string;
  title: string;
  subtitle: string;
  pdfUrl: string;
  thumbnailUrl: string;
  pdfAvailable: boolean;
  language: "en" | "ur";
  createdAt: string;
}

/** Used as og:image whenever a page-1 thumbnail isn't available. */
const PLACEHOLDER_IMAGE = "/icons/icon-512.png";

const SITE_NAME = "KKB4 Housing Society";

/**
 * Absolute base URL for og:url and for resolving the placeholder image.
 * Vercel exposes the deployment host; locally we fall back to localhost.
 */
function siteBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/+$/, "");

  // On Vercel, prefer the URL of THIS deployment. Checking
  // VERCEL_PROJECT_PRODUCTION_URL first would make a preview deployment
  // advertise the production domain in og:url, pointing the card at a different
  // build than the one that rendered it.
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  return "http://localhost:3000";
}

/**
 * Fetch the document's public metadata. Returns null on any failure so both the
 * metadata and the page body degrade instead of throwing — a broken thumbnail or
 * a slow API must not turn the resident's link into an error page.
 */
async function fetchDocument(kind: string, id: string): Promise<PublicDocument | null> {
  if (!KINDS.includes(kind as Kind)) return null;
  try {
    const res = await fetch(`${API_URL}/public/documents/${kind}/${id}`, {
      // Documents never change after generation; let the CDN hold them briefly.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.success ? (body.data as PublicDocument) : null;
  } catch {
    return null;
  }
}

type RouteParams = { kind: string; id: string };

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { kind, id } = await params;
  const doc = await fetchDocument(kind, id);
  const base = siteBaseUrl();
  const pageUrl = `${base}/view/${kind}/${id}`;

  if (!doc) {
    return {
      title: `Document — ${SITE_NAME}`,
      description: "This document is unavailable.",
      openGraph: {
        type: "article",
        url: pageUrl,
        siteName: SITE_NAME,
        title: `Document — ${SITE_NAME}`,
        description: "This document is unavailable.",
        images: [{ url: `${base}${PLACEHOLDER_IMAGE}` }],
      },
    };
  }

  // Page-1 thumbnail when Cloudinary has an image-type copy, otherwise the
  // society logo — never an empty og:image, which renders as a broken card.
  const image = doc.thumbnailUrl
    ? { url: doc.thumbnailUrl, width: 1200, height: 630, alt: doc.title }
    : { url: `${base}${PLACEHOLDER_IMAGE}`, alt: SITE_NAME };

  return {
    title: `${doc.title} — ${SITE_NAME}`,
    description: doc.subtitle || SITE_NAME,
    openGraph: {
      type: "article",
      url: pageUrl,
      siteName: SITE_NAME,
      title: doc.title,
      description: doc.subtitle || SITE_NAME,
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title: doc.title,
      description: doc.subtitle || SITE_NAME,
      images: [image.url],
    },
    // A shared document link shouldn't end up in search results.
    robots: { index: false, follow: false },
  };
}

export default async function DocumentViewPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { kind, id } = await params;
  const doc = await fetchDocument(kind, id);

  return (
    <>
      <style>{styles}</style>
      <div className="dv-root">
        <header className="dv-header">
          <img src="/icons/logo.png" alt="" className="dv-logo" />
          <div className="dv-header-text">
            <p className="dv-eyebrow">{SITE_NAME}</p>
            <h1 className="dv-title">{doc ? doc.title : "Document unavailable"}</h1>
            {doc?.subtitle && <p className="dv-subtitle">{doc.subtitle}</p>}
          </div>
        </header>

        {!doc ? (
          <div className="dv-card dv-empty">
            <p className="dv-empty-title">We couldn&apos;t find this document</p>
            <p className="dv-empty-body">
              The link may be incorrect or the document may have been removed.
              Please contact the society office.
            </p>
          </div>
        ) : !doc.pdfAvailable ? (
          <div className="dv-card dv-empty">
            <p className="dv-empty-title">This document isn&apos;t available online</p>
            <p className="dv-empty-body">
              It was issued before documents were stored online. Please contact the
              society office for a copy.
            </p>
          </div>
        ) : (
          <>
            <div className="dv-card dv-viewer-card">
              {/* Native browser PDF viewer. Mobile browsers that refuse to embed
                  PDFs in an iframe show the fallback link inside it. */}
              <iframe
                src={doc.pdfUrl}
                className="dv-viewer"
                title={doc.title}
                loading="lazy"
              />
            </div>

            <div className="dv-actions">
              <a
                className="dv-btn dv-btn-primary"
                href={doc.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF
              </a>
              <a className="dv-btn dv-btn-ghost" href={doc.pdfUrl} download>
                Download
              </a>
            </div>

            <p className="dv-note">
              If the document doesn&apos;t appear above, tap &ldquo;Open PDF&rdquo;.
            </p>
          </>
        )}
      </div>
    </>
  );
}

const styles = `
  .dv-root {
    max-width: 900px;
    margin: 0 auto;
    padding: 20px 16px 40px;
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
  }

  .dv-header {
    display: flex; align-items: center; gap: 13px;
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px;
    padding: 16px 18px;
    margin-bottom: 14px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
  }
  .dv-logo { width: 44px; height: 44px; border-radius: 12px; object-fit: contain; flex-shrink: 0; }
  .dv-header-text { min-width: 0; }
  .dv-eyebrow {
    font-size: 10.5px; font-weight: 700; letter-spacing: 0.11em;
    text-transform: uppercase; color: #059669; margin: 0 0 3px;
  }
  .dv-title { font-size: 18px; font-weight: 700; margin: 0; letter-spacing: -0.2px; }
  .dv-subtitle { font-size: 12.5px; color: #64748b; margin: 3px 0 0; font-weight: 500; }

  .dv-card {
    background: #fff;
    border: 1px solid rgba(0,0,0,0.07);
    border-radius: 14px;
    box-shadow: 0 1px 2px rgba(15,23,42,0.04);
    overflow: hidden;
  }
  .dv-viewer-card { padding: 0; }
  .dv-viewer {
    display: block; width: 100%; height: 78vh; min-height: 420px;
    border: none; background: #f8fafc;
  }
  @media (max-width: 640px) {
    .dv-viewer { height: 68vh; min-height: 340px; }
  }

  .dv-actions {
    display: flex; gap: 10px; flex-wrap: wrap;
    margin-top: 14px;
  }
  .dv-btn {
    display: inline-flex; align-items: center; justify-content: center;
    height: 44px; padding: 0 20px; border-radius: 12px;
    font-size: 14px; font-weight: 700; text-decoration: none;
    transition: opacity 0.15s, border-color 0.15s, color 0.15s;
  }
  .dv-btn-primary {
    background: linear-gradient(135deg, #10b981, #059669);
    color: #fff; box-shadow: 0 4px 12px rgba(5,150,105,0.25);
    flex: 1 1 200px;
  }
  .dv-btn-primary:hover { opacity: 0.94; }
  .dv-btn-ghost {
    background: #fff; color: #334155;
    border: 1.5px solid #e2e8f0;
  }
  .dv-btn-ghost:hover { border-color: #059669; color: #059669; }

  .dv-note {
    font-size: 11.5px; color: #94a3b8; margin: 10px 2px 0; text-align: center;
  }

  .dv-empty { padding: 44px 24px; text-align: center; }
  .dv-empty-title { font-size: 16px; font-weight: 700; margin: 0 0 7px; }
  .dv-empty-body {
    font-size: 13.5px; color: #64748b; margin: 0;
    line-height: 1.6; max-width: 420px; margin-inline: auto;
  }
`;
