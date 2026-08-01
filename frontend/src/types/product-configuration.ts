export type ProductConfigurationDto = Readonly<{
  product: Readonly<{
    id: string;
    model: "FGD X15+PVC";
    name: "FGD X15+PVC Track";
    publicPath: "/products/fgd-x15-pvc/";
    productKind: "curtain_track";
    quantityUnit: "piece";
  }>;
  options: readonly Readonly<{
    articleNumber: string;
    lengthMeters: number;
    color: Readonly<{ code: string; label: string }>;
  }>[];
  installationMethods: readonly Readonly<{
    method: "ceiling" | "wall";
    changesTrackArticleNumber: false;
  }>[];
  packaging: Readonly<{
    baseOptions: readonly ("standard" | "carton" | "large_shrink_wrap")[];
    logoPrintingAvailable: true;
    protectionOptions: readonly ("single_bag" | "paired")[];
  }>;
  customLength: Readonly<{
    enabled: true;
    minimumExclusive: 0;
    maximum: null;
    decimalPlaces: 1;
    resolution: "sales_follow_up";
  }>;
}>;
