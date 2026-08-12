import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { QuoteBasketView } from "../../components/quote-basket";
import { readProductDetailMode } from "../../lib/product-detail/config";
import { readRfqIntakeConfig } from "../../lib/rfq/server/v2/config";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Quote Basket | GDHE",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function QuoteBasketPage() {
  if (readProductDetailMode() === "disabled") notFound();
  if (!readRfqIntakeConfig().enabled) notFound();

  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <p className={styles.eyebrow}>Local RFQ collection</p>
        <h1>Quote Basket</h1>
        <p className={styles.introduction}>
          Review the public product configurations saved in this browser. A
          local test form becomes available when every line is ready and the
          non-production Stub is enabled.
        </p>
        <QuoteBasketView submissionEnabled />
      </div>
    </main>
  );
}
