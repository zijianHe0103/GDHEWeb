"use client";

import Image from "next/image";

import { useQuoteBasket } from "../../lib/quote-basket/use-quote-basket";
import type { QuoteBasketDocument } from "../../types/quote-basket";
import styles from "./quote-basket.module.css";

type RowsProps = Readonly<{
  basket: QuoteBasketDocument;
  onQuantity(entryId: string, quantity: number): void;
  onRemove(entryId: string): void;
}>;

export function QuoteBasketRows({ basket, onQuantity, onRemove }: RowsProps) {
  return (
    <>
      <ul className={styles.rows}>
        {basket.items.map((item) => (
          <li className={styles.row} key={item.entryId}>
            <a className={styles.imageLink} href={item.product.publicPath}>
              <Image
                src={item.product.image.url}
                width={item.product.image.width}
                height={item.product.image.height}
                alt={item.product.image.alt}
              />
            </a>
            <div className={styles.information}>
              <p className={styles.model}>{item.product.model}</p>
              <h2><a href={item.product.publicPath}>{item.product.name}</a></h2>
              <dl>
                <div><dt>Length Type</dt><dd>{item.selection.type === "standard" ? "Standard Length" : "Custom Length"}</dd></div>
                <div><dt>Length</dt><dd>{item.selection.lengthMeters} m</dd></div>
                <div><dt>Color</dt><dd>{item.selection.color.label}</dd></div>
                <div><dt>Base Packaging</dt><dd>{item.packaging.basePackaging.label}</dd></div>
                <div><dt>Customer Logo Printing</dt><dd>{item.packaging.logoPrinting ? "Yes" : "No"}</dd></div>
                <div><dt>Protection Arrangement</dt><dd>{item.packaging.protectionArrangement?.label ?? "None"}</dd></div>
              </dl>
              <div className={styles.actions}>
                <label htmlFor={`quantity-${item.entryId}`}>Quantity ({item.quantityUnit})</label>
                <input
                  id={`quantity-${item.entryId}`}
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  onChange={(event) => {
                    const quantity = Number(event.target.value);
                    if (Number.isSafeInteger(quantity) && quantity > 0) {
                      onQuantity(item.entryId, quantity);
                    }
                  }}
                />
                <button type="button" onClick={() => onRemove(item.entryId)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <section className={styles.nextStep} aria-labelledby="quote-next-step">
        <h2 id="quote-next-step">Ready for the next step?</h2>
        <p>Final quote submission is not available yet. Your items remain only in this browser.</p>
        <button type="button" disabled>Request a Quote</button>
      </section>
    </>
  );
}

export function QuoteBasketContent(state: ReturnType<typeof useQuoteBasket>) {
  let content;
  if (!state.hydrated) {
    content = <p className={styles.status}>Loading your saved quote items…</p>;
  } else if (state.error && !state.basket) {
    content = <p className={styles.status}>{state.error}</p>;
  } else if (!state.basket || state.basket.items.length === 0) {
    content = (
      <section className={styles.empty}>
        <h2>Your Quote Basket is empty</h2>
        <p>Add a configured product when you are ready.</p>
        <a href="/products/">Continue browsing products</a>
      </section>
    );
  } else {
    content = (
      <>
        <p className={styles.count}>{state.basket.items.length} quote basket {state.basket.items.length === 1 ? "line" : "lines"}</p>
        <QuoteBasketRows
          basket={state.basket}
          onQuantity={state.setQuantity}
          onRemove={state.remove}
        />
      </>
    );
  }

  return (
    <>
      {content}
      <p className={styles.live} aria-live="polite">{state.error ?? state.announcement}</p>
    </>
  );
}

export function QuoteBasketView() {
  return <QuoteBasketContent {...useQuoteBasket()} />;
}
