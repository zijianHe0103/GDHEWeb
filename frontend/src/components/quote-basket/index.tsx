"use client";

import Image from "next/image";
import { useState } from "react";

import { RfqCustomerForm } from "../rfq-form";
import { useQuoteBasket } from "../../lib/quote-basket/use-quote-basket";
import type { QuoteBasketDocument } from "../../types/quote-basket";
import type { QuoteBasketDocumentV2 } from "../../types/quote-basket-v2";
import type { QuoteBasketDocumentV3 } from "../../types/quote-basket-v3";
import styles from "./quote-basket.module.css";

type RowsProps = Readonly<{
  basket: QuoteBasketDocument | QuoteBasketDocumentV2 | QuoteBasketDocumentV3;
  onQuantity(entryId: string, quantity: number): void;
  onRemove(entryId: string): void;
  disabled?: boolean;
}>;

export function QuoteBasketRows({ basket, onQuantity, onRemove, disabled = false }: RowsProps) {
  return (
    <>
      <ul className={styles.rows}>
        {basket.items.map((item, index) => (
          <li className={styles.row} key={item.entryId}>
            <a
              className={styles.imageLink}
              href={"lineKind" in item && item.lineKind === "catalog_accessory" ? item.catalogPath : item.product.publicPath}
            >
              <Image
                src={item.product.image.url}
                width={item.product.image.width}
                height={item.product.image.height}
                alt={item.product.image.alt}
              />
            </a>
            <div className={styles.information}>
              <p className={styles.model}>{item.product.model}</p>
              <h2><a href={"lineKind" in item && item.lineKind === "catalog_accessory" ? item.catalogPath : item.product.publicPath}>{item.product.name}</a></h2>
              {!("lineKind" in item) || item.lineKind === "configured_product" ? <dl>
                <div><dt>Length Type</dt><dd>{item.selection.type === "standard" ? "Standard Length" : "Custom Length"}</dd></div>
                <div><dt>Length</dt><dd>{item.selection.lengthMeters} m</dd></div>
                <div><dt>Color</dt><dd>{item.selection.color.label}</dd></div>
                <div><dt>Base Packaging</dt><dd>{item.packaging.basePackaging.label}</dd></div>
                <div><dt>Customer Logo Printing</dt><dd>{item.packaging.logoPrinting ? "Yes" : "No"}</dd></div>
                <div><dt>Protection Arrangement</dt><dd>{item.packaging.protectionArrangement?.label ?? "None"}</dd></div>
              </dl> : <p>Catalog accessory</p>}
              {"state" in item && item.state === "requires_validation" ? (
                <p>We need to refresh this saved configuration before it can be submitted.</p>
              ) : null}
              {"state" in item && item.state === "requires_readd" ? (
                <p>Please remove this saved accessory and add it again to refresh availability.</p>
              ) : null}
              <div className={styles.actions}>
                <label htmlFor={`quantity-${index}`}>Quantity ({item.quantityUnit})</label>
                <input
                  id={`quantity-${index}`}
                  type="number"
                  min="1"
                  step="1"
                  value={item.quantity}
                  disabled={disabled}
                  onChange={(event) => {
                    const quantity = Number(event.target.value);
                    if (Number.isSafeInteger(quantity) && quantity > 0) {
                      onQuantity(item.entryId, quantity);
                    }
                  }}
                />
                <button type="button" disabled={disabled} onClick={() => onRemove(item.entryId)}>
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

type QuoteBasketContentState = Pick<
  ReturnType<typeof useQuoteBasket>,
  "hydrated" | "basket" | "error" | "announcement" | "setQuantity" | "remove"
> & Partial<Pick<
  ReturnType<typeof useQuoteBasket>,
  "add" | "addAccessory" | "clearAcceptedReceipt"
>>;

type QuoteBasketContentProps = QuoteBasketContentState & Readonly<{
  submissionEnabled?: boolean;
}>;

export function QuoteBasketContent({ submissionEnabled = false, ...state }: QuoteBasketContentProps) {
  const [submissionPending, setSubmissionPending] = useState(false);
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
          disabled={submissionPending}
        />
        <RfqCustomerForm
          basket={state.basket}
          enabled={submissionEnabled}
          storageError={state.error !== null}
          onPendingChange={setSubmissionPending}
          onAcceptedReceipt={state.clearAcceptedReceipt}
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

export function QuoteBasketView({ submissionEnabled = false }: Readonly<{ submissionEnabled?: boolean }>) {
  return <QuoteBasketContent {...useQuoteBasket()} submissionEnabled={submissionEnabled} />;
}
