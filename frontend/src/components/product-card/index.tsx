import type {
  ProductCardCollectionDto,
  ProductCardDto,
  ProductCardImageDto,
} from "../../types/product-card";
import styles from "./product-card.module.css";

type ProductListViewProps = Readonly<{
  collection: ProductCardCollectionDto;
  preview: boolean;
}>;

export function ProductListView({
  collection,
  preview,
}: ProductListViewProps) {
  return (
    <div className={styles.content}>
      <header className={styles.header}>
        <p className={styles.eyebrow}>GDHE product catalog</p>
        <h1>Products</h1>
        <p className={styles.lead}>
          Explore product families prepared for professional curtain-system
          projects.
        </p>
        {preview ? (
          <p className={styles.previewNotice}>
            Local test candidate — not production catalog
          </p>
        ) : null}
      </header>
      {collection.items.length === 0 ? (
        <ProductListEmptyState />
      ) : (
        <>
          <p className={styles.resultCount}>
            {collection.total} {collection.total === 1 ? "product" : "products"}
          </p>
          <ProductCardGrid items={collection.items} />
        </>
      )}
    </div>
  );
}

export function ProductCardGrid({
  items,
}: Readonly<{ items: readonly ProductCardDto[] }>) {
  return (
    <ul className={styles.grid}>
      {items.map((card) => (
        <li key={card.id}>
          <ProductCard card={card} />
        </li>
      ))}
    </ul>
  );
}

export function ProductCard({
  card,
}: Readonly<{ card: ProductCardDto }>) {
  const media = <ProductCardMedia image={card.image} />;
  const title = <h2 className={styles.cardTitle}>{card.name}</h2>;

  return (
    <article className={styles.card}>
      {card.action.mode === "view_product" ? (
        <a
          className={styles.mediaLink}
          href={card.action.targetPath}
          aria-label={`View ${card.name}`}
        >
          {media}
        </a>
      ) : (
        media
      )}
      <div className={styles.cardBody}>
        <p className={styles.category}>{card.primaryCategory.label}</p>
        <p className={styles.model}>{card.model}</p>
        {card.action.mode === "view_product" ? (
          <a className={styles.titleLink} href={card.action.targetPath}>
            {title}
          </a>
        ) : (
          title
        )}
        {card.lifecycle === "discontinued" ? (
          <p className={styles.lifecycle}>Discontinued</p>
        ) : null}
        {card.summary ? (
          <p className={styles.summary}>{card.summary}</p>
        ) : null}
        {card.keyAttributes.length > 0 ? (
          <dl className={styles.attributes}>
            {card.keyAttributes.map((attribute) => (
              <div key={attribute.key}>
                <dt>{attribute.label}</dt>
                <dd>
                  {attribute.value}
                  {attribute.unit ? ` ${attribute.unit}` : ""}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}
        <a className={styles.action} href={card.action.targetPath}>
          {card.action.label}
        </a>
      </div>
    </article>
  );
}

export function ProductCardMedia({
  image,
}: Readonly<{ image: ProductCardImageDto }>) {
  return (
    <span className={styles.media}>
      {/* The protected local candidate uses a native responsive image until
          the production media origin and Next Image allowlist are approved. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.url}
        width={image.width}
        height={image.height}
        alt={image.alt}
      />
    </span>
  );
}

export function ProductListEmptyState() {
  return (
    <section className={styles.state} aria-labelledby="products-empty-title">
      <h2 id="products-empty-title">No products yet</h2>
      <p>No products are available in this test view.</p>
    </section>
  );
}

export function ProductListUnavailableState() {
  return (
    <section
      className={styles.state}
      aria-labelledby="products-unavailable-title"
      role="status"
    >
      <h1 id="products-unavailable-title">Products unavailable</h1>
      <p>Products are temporarily unavailable.</p>
    </section>
  );
}
