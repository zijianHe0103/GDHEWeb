export type QuoteLineProduct = Readonly<{
  id: string;
  model: string;
  publicPath: string;
}>;

export type QuoteLineColor = Readonly<{
  code: string;
  label: string;
}>;

export type ArticleNumberSelection = Readonly<{
  type: "article_number";
  articleNumber: string;
  lengthMeters: number;
  color: QuoteLineColor;
}>;

export type CustomLengthSelection = Readonly<{
  type: "custom_length";
  articleNumber: null;
  lengthMeters: number;
  color: QuoteLineColor;
  resolution: "sales_follow_up";
}>;

export type QuoteLinePackaging = Readonly<{
  basePackaging: "standard" | "carton" | "large_shrink_wrap";
  logoPrinting: boolean;
  protectionArrangement: "single_bag" | "paired" | null;
}>;

export type QuoteLineConfiguration = Readonly<{
  installationMethod: "ceiling" | "wall";
  packaging: QuoteLinePackaging;
}>;

export type QuoteLine = Readonly<{
  contractVersion: "1.0.0";
  product: QuoteLineProduct;
  selection: ArticleNumberSelection | CustomLengthSelection;
  configuration: QuoteLineConfiguration;
  quantityUnit: "piece";
  quantity: number;
}>;

export function quoteLineIdentityEquals(
  left: QuoteLine,
  right: QuoteLine,
): boolean {
  if (
    left.contractVersion !== right.contractVersion ||
    left.product.id !== right.product.id ||
    left.product.model !== right.product.model ||
    left.product.publicPath !== right.product.publicPath ||
    left.selection.type !== right.selection.type ||
    left.selection.lengthMeters !== right.selection.lengthMeters ||
    left.selection.color.code !== right.selection.color.code ||
    left.selection.color.label !== right.selection.color.label ||
    left.configuration.installationMethod !==
      right.configuration.installationMethod ||
    left.configuration.packaging.basePackaging !==
      right.configuration.packaging.basePackaging ||
    left.configuration.packaging.logoPrinting !==
      right.configuration.packaging.logoPrinting ||
    left.configuration.packaging.protectionArrangement !==
      right.configuration.packaging.protectionArrangement ||
    left.quantityUnit !== right.quantityUnit
  ) {
    return false;
  }

  if (
    left.selection.type === "article_number" &&
    right.selection.type === "article_number"
  ) {
    return left.selection.articleNumber === right.selection.articleNumber;
  }

  return left.selection.type === "custom_length" &&
    right.selection.type === "custom_length" &&
    left.selection.articleNumber === right.selection.articleNumber &&
    left.selection.resolution === right.selection.resolution;
}

export function mergeQuoteLines(
  lines: ReadonlyArray<QuoteLine>,
): ReadonlyArray<QuoteLine> {
  const merged: QuoteLine[] = [];

  for (const line of lines) {
    if (!Number.isSafeInteger(line.quantity) || line.quantity < 1) {
      throw new RangeError(
        "QuoteLine quantity must be a positive safe integer",
      );
    }
    const index = merged.findIndex((candidate) =>
      quoteLineIdentityEquals(candidate, line)
    );
    if (index === -1) {
      merged.push(structuredClone(line));
      continue;
    }
    const current = merged[index];
    const quantity = current.quantity + line.quantity;
    if (!Number.isSafeInteger(quantity)) {
      throw new RangeError(
        "Merged QuoteLine quantity exceeds the safe integer maximum",
      );
    }
    merged[index] = {
      ...current,
      quantity,
    };
  }

  return merged;
}
