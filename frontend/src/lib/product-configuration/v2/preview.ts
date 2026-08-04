import sample from "../../cms/product-configuration-v2-contract/samples/success/fgd-x15-pvc.json";
import { adaptProductConfigurationV2 } from "../../cms/server/product-configurations-v2/adapter";
import { validateProductConfigurationV2 } from "../../cms/server/product-configurations-v2/validation";

export const previewProductConfigurationV2 = adaptProductConfigurationV2(validateProductConfigurationV2(sample));
