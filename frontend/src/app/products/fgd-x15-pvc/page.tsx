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
import { RelatedProducts } from "../../../components/related-products";
import { projectPublicProductConfigurator } from "../../../lib/product-configuration/v2/public-configurator";
import { loadProductDetailPage } from "../../../lib/product-detail/load";
import { projectQuoteBasketProduct } from "../../../lib/product-detail/quote-basket-product";
import { previewRelatedProducts } from "../../../lib/related-products/preview";
import { projectPublicRelatedProducts } from "../../../lib/related-products/public-view";
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

  const relatedProducts = state.kind === "ready"
    ? state.preview
      ? previewRelatedProducts
      : projectPublicRelatedProducts(state.relatedProducts)
    : [];

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
              product={projectQuoteBasketProduct(state.detail)}
            />
          ) : (
            <ProductConfiguratorUnavailable />
          )}
          <RelatedProducts items={relatedProducts} />
        </>
      ) : (
        <ProductDetailUnavailable />
      )}
    </main>
  );
}
