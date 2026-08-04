import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  ProductDetailUnavailable,
  ProductDetailView,
} from "../../../components/product-detail";
import {
  ProductConfigurator,
  ProductConfiguratorUnavailable,
} from "../../../components/product-configurator";
import { projectPublicProductConfigurator } from "../../../lib/product-configuration/v2/public-configurator";
import { loadProductDetailPage } from "../../../lib/product-detail/load";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "FGD X15+PVC Track | GDHE",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function ProductDetailPage() {
  const state = await loadProductDetailPage();
  if (state.kind === "disabled" || state.kind === "not_found") {
    notFound();
  }

  return (
    <main className={styles.main}>
      {state.kind === "ready" ? (
        <>
          <ProductDetailView
            detail={state.detail}
            preview={state.preview}
            configurationAvailable={state.configurationState.kind === "ready"}
          />
          {state.configurationState.kind === "ready" ? (
            <ProductConfigurator
              configuration={projectPublicProductConfigurator(
                state.configurationState.configuration,
              )}
            />
          ) : (
            <ProductConfiguratorUnavailable />
          )}
        </>
      ) : (
        <ProductDetailUnavailable />
      )}
    </main>
  );
}
