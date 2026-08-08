import "server-only";

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { readProductDetailMode } from "../product-detail/config";
import { previewRelatedProducts } from "./preview";
import styles from "./preview-detail-page.module.css";

export const previewDetailMetadata: Metadata = {
  title: "Protected test candidate | GDHE",
  robots: {
    index: false,
    follow: false,
  },
};

export function renderPreviewRelatedProductDetail(slug: string) {
  if (readProductDetailMode() !== "preview") {
    notFound();
  }

  const candidate = previewRelatedProducts.find(
    (item) =>
      item.key === slug &&
      item.action.kind === "view" &&
      item.action.href === `/products/${slug}/`,
  );

  if (!candidate) {
    notFound();
  }

  return (
    <main className={styles.main}>
      <article className={styles.content}>
        <p>{candidate.candidateNotice}</p>
        <h1>{candidate.product.name}</h1>
        <Image
          className={styles.image}
          src={candidate.product.image.url}
          width={candidate.product.image.width}
          height={candidate.product.image.height}
          alt={candidate.product.image.alt}
        />
        <p>{candidate.summary}</p>
        <p>
          This is a navigation preview only, not a published product detail page.
        </p>
      </article>
    </main>
  );
}
