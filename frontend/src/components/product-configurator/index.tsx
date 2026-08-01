"use client";

import { useState, type FormEvent } from "react";

import {
  buildProductConfigurationQuoteLine,
  type ProductConfigurationField,
  type ProductConfigurationFormValues,
} from "../../lib/product-configuration/build-quote-line";
import type { QuoteLine } from "../../lib/quote-contract";
import type { ProductConfigurationDto } from "../../types/product-configuration";
import styles from "./product-configurator.module.css";

type ProductConfiguratorProps = Readonly<{
  configuration: ProductConfigurationDto;
}>;

export type ProductConfiguratorResultState = Readonly<{
  errors: readonly ProductConfigurationField[];
  latestLine: QuoteLine | null;
}>;

type ProductConfiguratorFieldError = Readonly<{
  invalid: true;
  describedBy: string;
  id: string;
  message: string;
}>;

const errorMessages: Record<ProductConfigurationField, string> = {
  selection: "Choose a published option.",
  customLength: "Enter a positive length with at most one decimal place.",
  color: "Choose an available color.",
  installationMethod: "Choose an installation method.",
  basePackaging: "Choose a base packaging option.",
  logoPrinting: "Choose whether customer logo printing is required.",
  protectionArrangement: "Choose an available protection arrangement.",
  quantity: "Enter a positive whole-number quantity.",
};

export function createProductConfiguratorResultState(): ProductConfiguratorResultState {
  return Object.freeze({ errors: Object.freeze([]), latestLine: null });
}

export function applyProductConfiguratorSubmission(
  configuration: ProductConfigurationDto,
  current: ProductConfiguratorResultState,
  values: ProductConfigurationFormValues,
): ProductConfiguratorResultState {
  const result = buildProductConfigurationQuoteLine(configuration, values);
  if (!result.ok) {
    return Object.freeze({
      errors: Object.freeze(result.errors.map(({ field }) => field)),
      latestLine: current.latestLine,
    });
  }
  return Object.freeze({
    errors: Object.freeze([]),
    latestLine: result.line,
  });
}

export function getProductConfiguratorFieldError(
  field: ProductConfigurationField,
  errors: readonly ProductConfigurationField[],
): ProductConfiguratorFieldError | null {
  if (!errors.includes(field)) return null;
  const id = `${field}-error`;
  return Object.freeze({
    invalid: true,
    describedBy: id,
    id,
    message: errorMessages[field],
  });
}

function FieldError({
  field,
  errors,
}: Readonly<{
  field: ProductConfigurationField;
  errors: readonly ProductConfigurationField[];
}>) {
  const error = getProductConfiguratorFieldError(field, errors);
  return error ? (
    <p id={error.id} className={styles.error}>
      {error.message}
    </p>
  ) : null;
}

const installationLabels: Record<
  QuoteLine["configuration"]["installationMethod"],
  string
> = {
  ceiling: "Ceiling Mount",
  wall: "Wall Mount",
};

const basePackagingLabels: Record<
  QuoteLine["configuration"]["packaging"]["basePackaging"],
  string
> = {
  standard: "Standard Packaging",
  carton: "Carton Packaging",
  large_shrink_wrap: "Large Shrink Wrap",
};

const protectionLabels: Record<
  Exclude<
    QuoteLine["configuration"]["packaging"]["protectionArrangement"],
    null
  >,
  string
> = {
  single_bag: "Single-piece Bagging",
  paired: "Paired Interlocking",
};

const logoPrintingLabel = "Customer Logo Printing";
const noProtectionLabel = "None";

export function LatestQuoteLineSummary({ line }: Readonly<{ line: QuoteLine }>) {
  const packaging = line.configuration.packaging;
  return (
    <div>
      <p>Latest temporary quote item</p>
      <dl>
        <div>
          <dt>Model</dt>
          <dd>{line.product.model}</dd>
        </div>
        <div>
          <dt>Length Type</dt>
          <dd>
            {line.selection.type === "article_number"
              ? "Standard Length"
              : "Custom Length"}
          </dd>
        </div>
        <div>
          <dt>Length</dt>
          <dd>{line.selection.lengthMeters} m</dd>
        </div>
        <div>
          <dt>Color</dt>
          <dd>{line.selection.color.label}</dd>
        </div>
        <div>
          <dt>Installation</dt>
          <dd>{installationLabels[line.configuration.installationMethod]}</dd>
        </div>
        <div>
          <dt>Base Packaging</dt>
          <dd>{basePackagingLabels[packaging.basePackaging]}</dd>
        </div>
        <div>
          <dt>{logoPrintingLabel}</dt>
          <dd>{packaging.logoPrinting ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt>Protection Arrangement</dt>
          <dd>
            {packaging.protectionArrangement === null
              ? noProtectionLabel
              : protectionLabels[packaging.protectionArrangement]}
          </dd>
        </div>
        <div>
          <dt>Quantity</dt>
          <dd>
            {line.quantity} {line.quantityUnit}
          </dd>
        </div>
      </dl>
    </div>
  );
}

export function ProductConfigurator({
  configuration,
}: ProductConfiguratorProps) {
  const [mode, setMode] = useState<"standard" | "custom">("standard");
  const [optionIndex, setOptionIndex] = useState("0");
  const [customLength, setCustomLength] = useState("");
  const [colorCode, setColorCode] = useState(
    configuration.options[0]?.color.code ?? "",
  );
  const [installationMethod, setInstallationMethod] = useState("");
  const [basePackaging, setBasePackaging] = useState("");
  const [logoPrinting, setLogoPrinting] = useState(false);
  const [protectionArrangement, setProtectionArrangement] = useState("");
  const [quantity, setQuantity] = useState("");
  const [resultState, setResultState] = useState(
    createProductConfiguratorResultState,
  );

  const fieldError = (field: ProductConfigurationField) =>
    getProductConfiguratorFieldError(field, resultState.errors);
  const selectedOption = configuration.options[Number(optionIndex)];

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setResultState((current) =>
      applyProductConfiguratorSubmission(configuration, current, {
      mode,
      articleNumber: selectedOption?.articleNumber,
      customLength,
      colorCode,
      installationMethod,
      basePackaging,
      logoPrinting,
      protectionArrangement:
        protectionArrangement === "" ? null : protectionArrangement,
      quantity,
      }),
    );
  }

  return (
    <section
      id="configure-product"
      className={styles.section}
      aria-labelledby="configurator-title"
    >
      <div className={styles.introduction}>
        <p className={styles.eyebrow}>Local configuration test</p>
        <h2 id="configurator-title">Configure Your Track</h2>
        <p>
          Choose the published track specification and packaging details for
          one temporary quote item.
        </p>
      </div>
      <div className={styles.card}>
        <form onSubmit={submit} noValidate>
          <fieldset>
            <legend>Track length</legend>
            <label>
              <input
                type="radio"
                name="length-mode"
                value="standard"
                checked={mode === "standard"}
                onChange={() => setMode("standard")}
              />{" "}
              Standard length
            </label>
            <label>
              <input
                type="radio"
                name="length-mode"
                value="custom"
                checked={mode === "custom"}
                onChange={() => setMode("custom")}
              />{" "}
              Custom length
            </label>
          </fieldset>

          {mode === "standard" ? (
            <div className={styles.field}>
              <label htmlFor="standard-option">Published option</label>
              <select
                id="standard-option"
                value={optionIndex}
                onChange={(event) => setOptionIndex(event.target.value)}
                aria-invalid={fieldError("selection")?.invalid}
                aria-describedby={fieldError("selection")?.describedBy}
              >
                {configuration.options.map((option, index) => (
                  <option key={option.articleNumber} value={String(index)}>
                    {option.lengthMeters} m — {option.color.label}
                  </option>
                ))}
              </select>
              <FieldError field="selection" errors={resultState.errors} />
            </div>
          ) : (
            <>
              <div className={styles.field}>
                <label htmlFor="custom-length">Custom length (m)</label>
                <input
                  id="custom-length"
                  inputMode="decimal"
                  value={customLength}
                  onChange={(event) => setCustomLength(event.target.value)}
                  aria-invalid={fieldError("customLength")?.invalid}
                  aria-describedby={fieldError("customLength")?.describedBy}
                />
                <FieldError
                  field="customLength"
                  errors={resultState.errors}
                />
              </div>
              <div className={styles.field}>
                <label htmlFor="custom-color">Color</label>
                <select
                  id="custom-color"
                  value={colorCode}
                  onChange={(event) => setColorCode(event.target.value)}
                  aria-invalid={fieldError("color")?.invalid}
                  aria-describedby={fieldError("color")?.describedBy}
                >
                  {Array.from(
                    new Map(
                      configuration.options.map(({ color }) => [
                        color.code,
                        color,
                      ]),
                    ).values(),
                  ).map((color) => (
                    <option key={color.code} value={color.code}>
                      {color.label}
                    </option>
                  ))}
                </select>
                <FieldError field="color" errors={resultState.errors} />
              </div>
            </>
          )}

          <fieldset
            aria-invalid={fieldError("installationMethod")?.invalid}
            aria-describedby={
              fieldError("installationMethod")?.describedBy
            }
          >
            <legend>Installation</legend>
            {configuration.installationMethods.map(({ method }) => (
              <label key={method}>
                <input
                  type="radio"
                  name="installation"
                  value={method}
                  checked={installationMethod === method}
                  onChange={() => setInstallationMethod(method)}
                />{" "}
                {installationLabels[method]}
              </label>
            ))}
            <FieldError
              field="installationMethod"
              errors={resultState.errors}
            />
          </fieldset>

          <div className={styles.field}>
            <label htmlFor="base-packaging">Base packaging</label>
            <select
              id="base-packaging"
              value={basePackaging}
              onChange={(event) => setBasePackaging(event.target.value)}
              aria-invalid={fieldError("basePackaging")?.invalid}
              aria-describedby={fieldError("basePackaging")?.describedBy}
            >
              <option value="">Choose packaging</option>
              {configuration.packaging.baseOptions.map((option) => (
                <option key={option} value={option}>
                  {basePackagingLabels[option]}
                </option>
              ))}
            </select>
            <FieldError field="basePackaging" errors={resultState.errors} />
          </div>

          <div className={styles.field}>
            <label className={styles.checkbox}>
              <input
                type="checkbox"
                checked={logoPrinting}
                disabled={!configuration.packaging.logoPrintingAvailable}
                onChange={(event) => setLogoPrinting(event.target.checked)}
                aria-invalid={fieldError("logoPrinting")?.invalid}
                aria-describedby={fieldError("logoPrinting")?.describedBy}
              />{" "}
              {logoPrintingLabel}
            </label>
            <FieldError field="logoPrinting" errors={resultState.errors} />
          </div>

          <div className={styles.field}>
            <label htmlFor="protection">
              Protection arrangement (optional)
            </label>
            <select
              id="protection"
              value={protectionArrangement}
              onChange={(event) => setProtectionArrangement(event.target.value)}
              aria-invalid={fieldError("protectionArrangement")?.invalid}
              aria-describedby={
                fieldError("protectionArrangement")?.describedBy
              }
            >
              <option value="">{noProtectionLabel}</option>
              {configuration.packaging.protectionOptions.map((option) => (
                <option key={option} value={option}>
                  {protectionLabels[option]}
                </option>
              ))}
            </select>
            <FieldError
              field="protectionArrangement"
              errors={resultState.errors}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="quantity">Quantity (piece)</label>
            <input
              id="quantity"
              inputMode="numeric"
              value={quantity}
              onChange={(event) => setQuantity(event.target.value)}
              aria-invalid={fieldError("quantity")?.invalid}
              aria-describedby={fieldError("quantity")?.describedBy}
            />
            <FieldError field="quantity" errors={resultState.errors} />
          </div>

          <button type="submit">Add to Quote</button>
        </form>
        <p className={styles.notice}>
          Temporary quote item only — it has not been sent or saved. Refreshing
          clears it.
        </p>
        <div className={styles.result} aria-live="polite">
          {resultState.latestLine && (
            <LatestQuoteLineSummary line={resultState.latestLine} />
          )}
        </div>
      </div>
    </section>
  );
}

export function ProductConfiguratorUnavailable() {
  return (
    <section
      className={styles.fallback}
      aria-labelledby="configuration-unavailable-title"
    >
      <h2 id="configuration-unavailable-title">
        Online configuration is temporarily unavailable
      </h2>
      <p>You can still continue to the request form.</p>
      <a href="/request-a-quote/">Request a Quote</a>
    </section>
  );
}
