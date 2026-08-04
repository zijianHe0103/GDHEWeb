export type QuoteLineV2Color = Readonly<{ code: string; label: string }>;

export type QuoteLineV2Selection =
  | Readonly<{ type: "article_number"; articleNumber: string; lengthMeters: number; color: QuoteLineV2Color }>
  | Readonly<{ type: "custom_length"; articleNumber: null; lengthMeters: number; color: QuoteLineV2Color; resolution: "sales_follow_up" }>;

export type QuoteLineV2 = Readonly<{
  contractVersion: "2.0.0";
  product: Readonly<{ id: string; model: string; publicPath: string }>;
  selection: QuoteLineV2Selection;
  configuration: Readonly<{
    packaging: Readonly<{
      basePackaging: "standard" | "carton" | "large_shrink_wrap";
      logoPrinting: boolean;
      protectionArrangement: "single_bag" | "paired" | null;
    }>;
  }>;
  quantityUnit: "piece";
  quantity: number;
}>;
