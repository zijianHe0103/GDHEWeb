import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProductListUnavailableState,
  ProductListView,
} from "../../components/product-card";
import { loadProductListPage } from "../../lib/product-list";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Products | GDHE",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function ProductListPage() {
  const state = await loadProductListPage();
  if (state.kind === "disabled") {
    notFound();
  }

  return (
    <main className={styles.main}>
      {state.kind === "ready" ? (
        <ProductListView
          collection={state.collection}
          preview={state.preview}
        />
      ) : (
        <ProductListUnavailableState />
      )}
    </main>
  );
}
