import {
  previewDetailMetadata,
  renderPreviewRelatedProductDetail,
} from "../../../lib/related-products/preview-detail-page";

export const metadata = previewDetailMetadata;
export const dynamic = "force-dynamic";

export default function TestCandidateThreePage() {
  return renderPreviewRelatedProductDetail("test-candidate-3");
}
