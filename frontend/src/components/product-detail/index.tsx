import type { ProductDetailDto } from "../../types/product-detail";
import styles from "./product-detail.module.css";

type ProductDetailViewProps = Readonly<{
  detail: ProductDetailDto;
  preview: boolean;
  configurationAvailable?: boolean;
}>;

export function ProductDetailView({
  detail,
  preview,
  configurationAvailable = false,
}: ProductDetailViewProps) {
  return (
    <article className={styles.detail}>
      <section className={styles.hero} aria-labelledby="product-title">
        <div className={styles.media}>
          {/* The approved repository asset remains native until the production
              media origin and Next Image allowlist are selected. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={detail.image.url}
            width={detail.image.width}
            height={detail.image.height}
            alt={detail.image.alt}
          />
        </div>
        <div className={styles.heroContent}>
          <a
            className={styles.category}
            href={detail.primaryCategory.publicPath}
          >
            {detail.primaryCategory.label}
          </a>
          <p className={styles.model}>{detail.model}</p>
          <h1 id="product-title">{detail.name}</h1>
          <p className={styles.previewNotice}>
            {preview
              ? "Local test candidate — details and copy remain replaceable"
              : "Local CMS test candidate — not a production product page"}
          </p>
          <a
            className={styles.action}
            href={
              configurationAvailable ? "#configure-product" : detail.action.target
            }
          >
            {configurationAvailable
              ? "Configure & Add to Quote"
              : detail.action.label}
          </a>
        </div>
      </section>

      <section className={styles.overview} aria-labelledby="overview-title">
        <p className={styles.eyebrow}>Product Overview</p>
        <h2 id="overview-title">A focused manual track candidate</h2>
        <p>{detail.overview}</p>
      </section>

      <section
        className={styles.specifications}
        aria-labelledby="specifications-title"
      >
        <p className={styles.eyebrow}>Technical summary</p>
        <h2 id="specifications-title">Key Specifications</h2>
        <dl>
          {detail.specifications.map((specification) => (
            <div key={specification.key}>
              <dt>{specification.label}</dt>
              <dd>{specification.value}</dd>
            </div>
          ))}
        </dl>
      </section>
    </article>
  );
}

export function ProductDetailUnavailable() {
  return (
    <section className={styles.state} role="status">
      <h1>Product unavailable</h1>
      <p>Product details are temporarily unavailable.</p>
    </section>
  );
}
