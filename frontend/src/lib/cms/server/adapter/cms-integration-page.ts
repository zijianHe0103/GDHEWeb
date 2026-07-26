import "server-only";

import type { CmsIntegrationPageDto } from "../../../../types/cms-integration";
import {
  validateCmsSuccessPayload,
  type ValidatedCmsPayload,
} from "../validation";

type ValidatedPageView = {
  id: string;
  apiVersion: "1";
  schemaVersion: "3.0.0";
  type: string;
  templateKey: string;
  locale: "en";
  publicPath: string;
  title: string;
  excerpt?: string;
  modules: readonly unknown[];
};

export function adaptCmsIntegrationPage(
  validated: ValidatedCmsPayload<"success">,
): CmsIntegrationPageDto {
  const body =
    validateCmsSuccessPayload.getValidatedBody(validated) as ValidatedPageView;

  return Object.freeze({
    id: body.id,
    apiVersion: body.apiVersion,
    schemaVersion: body.schemaVersion,
    type: body.type,
    templateKey: body.templateKey,
    locale: body.locale,
    publicPath: body.publicPath,
    title: body.title,
    excerpt: body.excerpt ?? null,
    moduleCount: body.modules.length,
  });
}
