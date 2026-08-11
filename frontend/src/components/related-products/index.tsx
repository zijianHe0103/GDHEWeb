"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { useQuoteBasket } from "../../lib/quote-basket/use-quote-basket";
import type { CatalogAccessoryDraft } from "../../types/quote-basket-v2";
import type { ReadyCatalogAccessoryDraftV3 } from "../../types/quote-basket-v3";
import type { PublicRelatedProduct } from "../../types/related-products";
import styles from "./related-products.module.css";

export const RELATED_PRODUCTS_RETURN_STATE_KEY =
  "gdhe:ui:related-products:/products/fgd-x15-pvc/:v1";

type RelatedProductsReturnState = Readonly<{
  visibleCount: number;
  scrollY: number;
}>;

export function nextRelatedProductVisibleCount(
  current: number,
  total: number,
): number {
  return Math.min(Math.max(current, 0) + 3, Math.max(total, 0));
}

export function buildCatalogAccessoryDraft(
  item: PublicRelatedProduct,
): Readonly<{ ok: true; draft: CatalogAccessoryDraft }> | Readonly<{ ok: false }> {
  if (item.action.kind !== "quote") return Object.freeze({ ok: false });
  return Object.freeze({
    ok: true,
    draft: Object.freeze({
      product: item.product,
      catalogPath: item.action.catalogPath,
      quantityUnit: item.action.quantityUnit,
      quantity: 1,
    }),
  });
}

export function buildCatalogAccessoryDraftV3(
  item: PublicRelatedProduct,
): Readonly<{ ok: true; draft: ReadyCatalogAccessoryDraftV3 }> | Readonly<{ ok: false }> {
  if (
    item.action.kind !== "quote" ||
    typeof item.action.articleNumber !== "string" ||
    !/^GDHEPRD[0-9]{6}$/.test(item.action.articleNumber)
  ) return Object.freeze({ ok: false });
  return Object.freeze({
    ok: true,
    draft: Object.freeze({
      product: item.product,
      catalogPath: item.action.catalogPath,
      articleNumber: item.action.articleNumber,
      quantityUnit: "piece",
      quantity: 1,
    }),
  });
}

export function serializeRelatedProductsReturnState(
  visibleCount: number,
  scrollY: number,
  itemCount: number,
): string {
  return JSON.stringify({
    version: 1,
    visibleCount: clampVisibleCount(visibleCount, itemCount),
    scrollY: Number.isFinite(scrollY)
      ? Math.min(Math.max(Math.floor(scrollY), 0), Number.MAX_SAFE_INTEGER)
      : 0,
  });
}

export function parseRelatedProductsReturnState(
  serialized: unknown,
  itemCount: number,
): RelatedProductsReturnState | null {
  if (typeof serialized !== "string" || serialized.length > 256) return null;
  try {
    const value = JSON.parse(serialized) as unknown;
    if (
      value === null ||
      typeof value !== "object" ||
      Array.isArray(value) ||
      Object.getPrototypeOf(value) !== Object.prototype ||
      JSON.stringify(Reflect.ownKeys(value).sort()) !==
        JSON.stringify(["scrollY", "version", "visibleCount"])
    ) return null;
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const version = descriptors.version;
    const visibleCount = descriptors.visibleCount;
    const scrollY = descriptors.scrollY;
    if (
      !version || !("value" in version) || version.value !== 1 ||
      !visibleCount || !("value" in visibleCount) ||
      !Number.isSafeInteger(visibleCount.value) || visibleCount.value < 0 ||
      !scrollY || !("value" in scrollY) ||
      !Number.isSafeInteger(scrollY.value) || scrollY.value < 0
    ) return null;
    return Object.freeze({
      visibleCount: clampVisibleCount(visibleCount.value, itemCount),
      scrollY: scrollY.value,
    });
  } catch {
    return null;
  }
}

function clampVisibleCount(visibleCount: number, itemCount: number): number {
  const total = Number.isSafeInteger(itemCount) && itemCount > 0 ? itemCount : 0;
  const initial = Math.min(3, total);
  const requested = Number.isSafeInteger(visibleCount) ? visibleCount : initial;
  return Math.min(Math.max(requested, initial), total);
}

export function RelatedProducts({
  items,
}: Readonly<{ items: readonly PublicRelatedProduct[] }>) {
  const [visibleCount, setVisibleCount] = useState(Math.min(3, items.length));
  const [announcement, setAnnouncement] = useState("");
  const [focusIndex, setFocusIndex] = useState<number | null>(null);
  const firstNewAction = useRef<HTMLAnchorElement | HTMLButtonElement>(null);
  const quoteBasket = useQuoteBasket();

  useEffect(() => {
    if (focusIndex !== null && visibleCount >= items.length) {
      firstNewAction.current?.focus();
    }
  }, [focusIndex, items.length, visibleCount]);

  useEffect(() => {
    let active = true;
    let frame: number | null = null;
    try {
      const serialized = window.sessionStorage.getItem(
        RELATED_PRODUCTS_RETURN_STATE_KEY,
      );
      window.sessionStorage.removeItem(RELATED_PRODUCTS_RETURN_STATE_KEY);
      const restored = parseRelatedProductsReturnState(serialized, items.length);
      if (!restored) return;
      queueMicrotask(() => {
        if (!active) return;
        setVisibleCount(restored.visibleCount);
        frame = window.requestAnimationFrame(() => {
          window.scrollTo(0, restored.scrollY);
        });
      });
    } catch {
      return;
    }
    return () => {
      active = false;
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, [items.length]);

  if (items.length === 0) return null;
  const visible = items.slice(0, visibleCount);

  function revealMore(): void {
    const next = nextRelatedProductVisibleCount(visibleCount, items.length);
    setFocusIndex(visibleCount);
    setVisibleCount(next);
    setAnnouncement(`${next - visibleCount} more products shown.`);
  }

  function addAccessory(item: PublicRelatedProduct): void {
    const result = buildCatalogAccessoryDraftV3(item);
    if (!result.ok) {
      setAnnouncement("This item could not be added to your Quote Basket.");
      return;
    }
    const mutation = quoteBasket.addAccessory(result.draft);
    if (!mutation) {
      setAnnouncement("This item could not be added to your Quote Basket.");
      return;
    }
    setAnnouncement(
      mutation === "added"
        ? `${item.product.name} added to your Quote Basket.`
        : `${item.product.name} quantity updated in your Quote Basket.`,
    );
  }

  function rememberReturnState(): void {
    try {
      window.sessionStorage.setItem(
        RELATED_PRODUCTS_RETURN_STATE_KEY,
        serializeRelatedProductsReturnState(
          visibleCount,
          window.scrollY,
          items.length,
        ),
      );
    } catch {
      // Navigation remains available when session storage is unavailable.
    }
  }

  return (
    <section className={styles.section} aria-labelledby="related-products-title">
      <div className={styles.heading}>
        <p>Compatible product candidates</p>
        <h2 id="related-products-title">You May Also Need</h2>
      </div>
      <ul className={styles.grid}>
        {visible.map((item, index) => (
          <li key={item.key}>
            <article className={styles.card}>
              <figure className={styles.media}>
                <Image
                  src={item.product.image.url}
                  width={item.product.image.width}
                  height={item.product.image.height}
                  alt={item.product.image.alt}
                />
              </figure>
              <div className={styles.body}>
                <div className={styles.information}>
                  <p className={styles.model}>{item.product.model}</p>
                  <h3>{item.product.name}</h3>
                  <p>{item.summary}</p>
                  <p className={styles.candidate}>{item.candidateNotice}</p>
                </div>
                <footer className={styles.action}>
                  {item.action.kind === "view" ? (
                    <a
                      className={styles.actionControl}
                      ref={index === focusIndex ? (node) => {
                        firstNewAction.current = node;
                      } : undefined}
                      href={item.action.href}
                      onClick={rememberReturnState}
                    >
                      View Product
                    </a>
                  ) : (
                    <button
                      className={styles.actionControl}
                      ref={index === focusIndex ? (node) => {
                        firstNewAction.current = node;
                      } : undefined}
                      type="button"
                      disabled={!quoteBasket.hydrated}
                      onClick={() => addAccessory(item)}
                    >
                      Add to Quote
                    </button>
                  )}
                </footer>
              </div>
            </article>
          </li>
        ))}
      </ul>
      {visibleCount < items.length ? (
        <button className={styles.more} type="button" onClick={revealMore}>
          Show More Products
        </button>
      ) : null}
      <p className={styles.live} aria-live="polite">{announcement}</p>
      {quoteBasket.basket?.items.length ? (
        <a className={styles.basketLink} href="/request-a-quote/">View Quote Basket</a>
      ) : null}
    </section>
  );
}
