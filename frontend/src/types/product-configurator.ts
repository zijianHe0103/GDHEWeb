export type PublicProductConfiguratorViewModel = Readonly<{
  product: Readonly<{
    model: "FGD X15+PVC";
    publicPath: "/products/fgd-x15-pvc/";
    quantityUnit: "piece";
  }>;
  standardOptions: readonly Readonly<{
    lengthMeters: number;
    color: Readonly<{ code: string; label: string }>;
  }>[];
  packaging: Readonly<{
    baseOptions: readonly Readonly<{ key: string; label: string }>[];
    logoPrintingAvailable: boolean;
    protectionOptions: readonly Readonly<{ key: string; label: string }>[];
  }>;
  customLength: Readonly<{
    enabled: boolean;
    minimumExclusive: number;
    maximum: number | null;
    decimalPlaces: number;
  }>;
}>;

export type PublicProductConfiguratorField =
  | "selection"
  | "customLength"
  | "color"
  | "basePackaging"
  | "logoPrinting"
  | "protectionArrangement"
  | "quantity";

export type PublicProductConfiguratorFormValues = Readonly<{
  lengthChoice: string;
  customLength?: string;
  colorCode: string;
  basePackaging: string;
  logoPrinting: boolean;
  protectionArrangement: string | null;
  quantity: string;
}>;

export type PublicQuoteDraft = Readonly<{
  product: Readonly<{
    model: string;
    publicPath: string;
  }>;
  selection: Readonly<{
    type: "standard" | "custom";
    lengthMeters: number;
    color: Readonly<{ code: string; label: string }>;
  }>;
  packaging: Readonly<{
    basePackaging: Readonly<{ label: string }>;
    logoPrinting: boolean;
    protectionArrangement: Readonly<{ label: string }> | null;
  }>;
  quantityUnit: string;
  quantity: number;
}>;
