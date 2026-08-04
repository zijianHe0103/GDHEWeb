import "server-only";

import { validateProductConfigurationV2Schema } from "./validation-registry";

export class ProductConfigurationV2ContractError extends Error {
  readonly category = "contract";
  constructor(readonly kind: "unsupported_schema" | "invalid_success_payload") {
    super("Product Configuration payload did not satisfy the supported contract.");
    this.name = "ProductConfigurationV2ContractError";
  }
}

const authentic = new WeakSet<object>();
const bodies = new WeakMap<object, unknown>();
export type ValidatedProductConfigurationV2 = Readonly<{ kind: "success" }>;

function freeze(value: unknown, seen = new WeakSet<object>()): unknown {
  if (!value || typeof value !== "object" || seen.has(value)) return value;
  if (!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype && Object.getPrototypeOf(value) !== null) throw new TypeError();
  seen.add(value);
  for (const child of Object.values(value)) freeze(child, seen);
  return Object.freeze(value);
}

function bodyOf(value: unknown): unknown {
  if (!value || typeof value !== "object" || !authentic.has(value)) throw new ProductConfigurationV2ContractError("invalid_success_payload");
  return bodies.get(value);
}

type Validator = ((input: unknown) => ValidatedProductConfigurationV2) & { getValidatedBody(input: unknown): unknown };
const implementation = ((input: unknown) => {
  let snapshot: unknown;
  try { snapshot = freeze(structuredClone(input)); } catch { throw new ProductConfigurationV2ContractError("invalid_success_payload"); }
  if (!snapshot || typeof snapshot !== "object" || (snapshot as {schemaVersion?:unknown}).schemaVersion !== "2.0.0") throw new ProductConfigurationV2ContractError("unsupported_schema");
  if (!validateProductConfigurationV2Schema(snapshot)) throw new ProductConfigurationV2ContractError("invalid_success_payload");
  const view = snapshot as { product: { model: unknown; publicPath: unknown }; articleNumberOptions: Array<{articleNumber:string; lengthMeters:number; color:{code:string}}> };
  const keys = new Set(view.articleNumberOptions.map((option) => `${option.lengthMeters}\u0000${option.color.code}`));
  if (view.product.model !== "FGD X15+PVC" || view.product.publicPath !== "/products/fgd-x15-pvc/" || keys.size !== view.articleNumberOptions.length || new Set(view.articleNumberOptions.map((option) => option.articleNumber)).size !== view.articleNumberOptions.length) throw new ProductConfigurationV2ContractError("invalid_success_payload");
  const wrapper = Object.create(null) as ValidatedProductConfigurationV2;
  Object.defineProperties(wrapper, { kind: { enumerable: true, value: "success" }, toJSON: { value: () => ({kind:"success"}) } });
  authentic.add(wrapper); bodies.set(wrapper, snapshot); return Object.freeze(wrapper);
}) as Validator;
Object.defineProperty(implementation, "getValidatedBody", { value: bodyOf });
export const validateProductConfigurationV2 = implementation;
