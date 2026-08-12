"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
} from "react";

import {
  createRfqSubmissionOperation,
  type RfqSubmissionClientResult,
} from "../../lib/rfq/submission/client";
import type { RfqCustomerFieldError } from "../../lib/rfq/customer";
import type { QuoteBasketDocumentV3 } from "../../types/quote-basket-v3";
import { RfqSubmissionPanel } from "./presentation";

type Props = Readonly<{
  basket: QuoteBasketDocumentV3;
  enabled: boolean;
  storageError: boolean;
  onPendingChange?(pending: boolean): void;
  onAcceptedReceipt?(receipt: unknown, submittedSnapshot: unknown): Promise<boolean>;
}>;

export function rfqSubmissionResultMessage(result: RfqSubmissionClientResult): string {
  if (result.kind === "accepted_cleared") {
    return `Local test request ${result.publicReference} was accepted. Your Quote Basket was cleared.`;
  }
  if (result.kind === "accepted_basket_changed") {
    return `Local test request ${result.publicReference} was accepted, but your Quote Basket changed and was kept in full.`;
  }
  if (result.kind === "processing") {
    return `Local test request ${result.publicReference} is processing. Your Quote Basket remains in this browser.`;
  }
  if (result.kind === "invalid_fields") return "Please correct the highlighted fields.";
  if (result.kind === "basket_refresh_required") {
    return "Review the saved configurations before trying again. Your Quote Basket has been kept.";
  }
  if (result.kind === "conflict") {
    return "This request conflicts with an earlier local attempt. Your Quote Basket has been kept.";
  }
  if (result.kind === "rate_or_security") {
    return "This local request could not be authorized. Your Quote Basket has been kept.";
  }
  if (result.kind === "pending") return "Submitting your local test request.";
  return "Local RFQ submission is temporarily unavailable. Your Quote Basket has been kept.";
}

export function RfqCustomerForm({
  basket,
  enabled,
  storageError,
  onPendingChange,
  onAcceptedReceipt,
}: Props) {
  const pendingRef = useRef(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const operation = useMemo(() => createRfqSubmissionOperation({
    clearAcceptedReceipt: (receipt, submittedSnapshot) => (
      onAcceptedReceipt?.(receipt, submittedSnapshot) ?? Promise.resolve(false)
    ),
  }), [onAcceptedReceipt]);
  const [pending, setPending] = useState(false);
  const [errors, setErrors] = useState<readonly RfqCustomerFieldError[]>([]);
  const [result, setResult] = useState<string | null>(null);
  useEffect(() => {
    if (errors.length > 0) summaryRef.current?.focus();
  }, [errors]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (pendingRef.current) return;
    const form = event.currentTarget;
    const customer = Object.fromEntries(new FormData(form).entries());
    pendingRef.current = true;
    setPending(true);
    setErrors([]);
    setResult(null);
    onPendingChange?.(true);
    try {
      const outcome = await operation.submit({ basket, customer });
      setErrors(outcome.kind === "invalid_fields" ? outcome.errors : []);
      setResult(rfqSubmissionResultMessage(outcome));
    } catch {
      setErrors([]);
      setResult("Local RFQ submission is temporarily unavailable. Your Quote Basket has been kept.");
    } finally {
      pendingRef.current = false;
      setPending(false);
      onPendingChange?.(false);
    }
  }

  return (
    <RfqSubmissionPanel
      basket={basket}
      enabled={enabled}
      storageError={storageError}
      pending={pending}
      errors={errors}
      result={result}
      onSubmit={handleSubmit}
      summaryRef={summaryRef}
    />
  );
}
