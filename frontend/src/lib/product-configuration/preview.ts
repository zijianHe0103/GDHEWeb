import "server-only";

import sample from "../cms/product-configuration-contract/samples/success/fgd-x15-pvc.json";
import { adaptProductConfiguration } from "../cms/server/product-configurations/adapter";
import { validateProductConfiguration } from "../cms/server/product-configurations/validation";

export const previewProductConfiguration = adaptProductConfiguration(
  validateProductConfiguration(sample),
);
