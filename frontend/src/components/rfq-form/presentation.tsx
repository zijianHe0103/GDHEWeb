import type {
  FormEventHandler,
  Ref,
} from "react";

import type {
  RfqCustomerField,
  RfqCustomerFieldError,
} from "../../lib/rfq/customer";
import type { QuoteBasketDocumentV3 } from "../../types/quote-basket-v3";
import styles from "./rfq-form.module.css";

const fieldIds: Record<Exclude<RfqCustomerField, "contactMethods">, string> = {
  fullName: "rfq-full-name",
  companyName: "rfq-company-name",
  whatsApp: "rfq-whatsapp",
  weChat: "rfq-wechat",
  businessEmail: "rfq-business-email",
  phone: "rfq-phone",
  countryRegion: "rfq-country-region",
  city: "rfq-city",
  companyWebsite: "rfq-company-website",
  message: "rfq-message",
};

const fieldLabels: Record<RfqCustomerField, string> = {
  fullName: "Full Name",
  companyName: "Company Name",
  whatsApp: "WhatsApp",
  weChat: "WeChat",
  businessEmail: "Business Email",
  phone: "Phone",
  countryRegion: "Country/Region",
  city: "City",
  companyWebsite: "Company Website",
  message: "Additional Requirements",
  contactMethods: "Contact details",
};

function errorTarget(field: RfqCustomerField): string {
  return field === "contactMethods" ? fieldIds.whatsApp : fieldIds[field];
}

function errorId(field: RfqCustomerField): string {
  return `rfq-${field === "contactMethods" ? "contact-methods" : field.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}-error`;
}

function errorMessage(error: RfqCustomerFieldError): string {
  if (error.code === "at_least_one_required") {
    return "Enter at least one contact method.";
  }
  if (error.code === "required") return `${fieldLabels[error.field]} is required.`;
  if (error.code === "too_long") return `${fieldLabels[error.field]} is too long.`;
  return `Enter a valid ${fieldLabels[error.field].toLowerCase()}.`;
}

function errorFor(
  errors: readonly RfqCustomerFieldError[],
  field: RfqCustomerField,
): RfqCustomerFieldError | undefined {
  return errors.find((error) => error.field === field);
}

type TextFieldProps = Readonly<{
  field: Exclude<RfqCustomerField, "contactMethods" | "message">;
  label: string;
  errors: readonly RfqCustomerFieldError[];
  required?: boolean;
  type?: "email" | "tel" | "text" | "url";
  autoComplete?: string;
  inputMode?: "email" | "tel" | "url";
  pending: boolean;
}>;

function TextField({
  field,
  label,
  errors,
  required = false,
  type = "text",
  autoComplete,
  inputMode,
  pending,
}: TextFieldProps) {
  const error = errorFor(errors, field);
  const describedBy = error ? errorId(field) : undefined;
  return (
    <div className={styles.field}>
      <label htmlFor={fieldIds[field]}>
        {label}{required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={fieldIds[field]}
        name={field}
        type={type}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        disabled={pending}
      />
      {error ? <p className={styles.error} id={describedBy}>{errorMessage(error)}</p> : null}
    </div>
  );
}

export type RfqSubmissionPanelProps = Readonly<{
  basket: QuoteBasketDocumentV3 | null;
  enabled: boolean;
  storageError: boolean;
  pending: boolean;
  errors: readonly RfqCustomerFieldError[];
  result: string | null;
  onSubmit: FormEventHandler<HTMLFormElement>;
  summaryRef?: Ref<HTMLDivElement>;
}>;

export function RfqSubmissionPanel({
  basket,
  enabled,
  storageError,
  pending,
  errors,
  result,
  onSubmit,
  summaryRef,
}: RfqSubmissionPanelProps) {
  if (storageError) {
    return <p className={styles.unavailable}>RFQ submission is unavailable in this browser.</p>;
  }
  if (!basket || basket.items.length === 0) {
    return <p className={styles.unavailable}>Add a ready product configuration before requesting a quote.</p>;
  }
  if (!enabled) {
    return <p className={styles.unavailable}>Local RFQ submission is not enabled.</p>;
  }
  if (basket.items.some((item) => item.state === "requires_validation")) {
    return <p className={styles.unavailable}>Please refresh this saved configuration before requesting a quote.</p>;
  }
  if (basket.items.some((item) => item.state === "requires_readd")) {
    return <p className={styles.unavailable}>Please remove the saved accessory and add it again before requesting a quote.</p>;
  }

  const contactError = errorFor(errors, "contactMethods");
  return (
    <section className={styles.panel} aria-labelledby="rfq-customer-title">
      <p className={styles.notice}>
        Local non-production Stub — requests and server state are for testing only and may be lost on restart.
      </p>
      <h2 id="rfq-customer-title">Request a Quote</h2>
      <p>Enter your business contact details. Fields marked * are required.</p>
      {errors.length > 0 ? (
        <div
          className={styles.summary}
          ref={summaryRef}
          tabIndex={-1}
          aria-labelledby="rfq-error-summary-title"
        >
          <h3 id="rfq-error-summary-title">Check the highlighted fields</h3>
          <ul>
            {errors.map((error) => (
              <li key={`${error.field}-${error.code}`}>
                <a href={`#${errorTarget(error.field)}`}>{errorMessage(error)}</a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <form onSubmit={onSubmit} noValidate>
        <fieldset disabled={pending}>
          <legend>Customer information</legend>
          <TextField field="fullName" label="Full Name" required autoComplete="name" errors={errors} pending={pending} />
          <TextField field="companyName" label="Company Name" required autoComplete="organization" errors={errors} pending={pending} />
          <TextField field="countryRegion" label="Country/Region" required autoComplete="country-name" errors={errors} pending={pending} />
          <TextField field="city" label="City" required autoComplete="address-level2" errors={errors} pending={pending} />
        </fieldset>
        <fieldset
          className={styles.contactGroup}
          disabled={pending}
          aria-describedby={`rfq-contact-guidance${contactError ? ` ${errorId("contactMethods")}` : ""}`}
        >
          <legend>Contact details</legend>
          <p id="rfq-contact-guidance">At least one of WhatsApp, WeChat, Business Email or Phone is required.</p>
          <TextField field="whatsApp" label="WhatsApp" type="tel" autoComplete="tel" inputMode="tel" errors={errors} pending={pending} />
          <TextField field="weChat" label="WeChat" errors={errors} pending={pending} />
          <TextField field="businessEmail" label="Business Email" type="email" autoComplete="email" inputMode="email" errors={errors} pending={pending} />
          <TextField field="phone" label="Phone" type="tel" autoComplete="tel" inputMode="tel" errors={errors} pending={pending} />
          {contactError ? <p className={styles.error} id={errorId("contactMethods")}>{errorMessage(contactError)}</p> : null}
        </fieldset>
        <fieldset disabled={pending}>
          <legend>Additional information</legend>
          <TextField field="companyWebsite" label="Company Website" type="url" autoComplete="url" inputMode="url" errors={errors} pending={pending} />
          <div className={styles.field}>
            <label htmlFor={fieldIds.message}>Additional Requirements</label>
            <textarea
              id={fieldIds.message}
              name="message"
              rows={6}
              aria-invalid={errorFor(errors, "message") ? "true" : undefined}
              aria-describedby={errorFor(errors, "message") ? errorId("message") : undefined}
              disabled={pending}
            />
            {errorFor(errors, "message") ? <p className={styles.error} id={errorId("message")}>{errorMessage(errorFor(errors, "message")!)}</p> : null}
          </div>
        </fieldset>
        <p>
          Before submitting, review this local <a href="#rfq-privacy-policy">Privacy Policy</a>.
        </p>
        <section
          id="rfq-privacy-policy"
          tabIndex={-1}
          aria-labelledby="rfq-privacy-policy-title"
        >
          <h3 id="rfq-privacy-policy-title">Privacy Policy</h3>
          <p>
            For this local non-production test, the contact and RFQ details you submit are processed only by the local non-production Stub. They are not sent to Feishu, CRM or email, and they are not stored in durable production storage.
          </p>
        </section>
        <button type="submit" disabled={pending}>{pending ? "Submitting…" : "Submit Request"}</button>
      </form>
      <p className={styles.live} aria-live="polite">
        {pending ? "Submitting your local test request." : result}
      </p>
    </section>
  );
}
