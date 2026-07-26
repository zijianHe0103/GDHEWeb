import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { loadCmsIntegrationPage } from "../../../lib/cms/server/integration";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "CMS integration proof",
  robots: {
    index: false,
    follow: false,
  },
};

export const dynamic = "force-dynamic";

export default async function CmsIntegrationPage() {
  const result = await loadCmsIntegrationPage();
  if (result.kind !== "ready") {
    notFound();
  }

  const { page } = result;

  return (
    <main className={styles.main}>
      <section
        className={styles.panel}
        aria-labelledby="cms-integration-title"
      >
        <p className={styles.eyebrow}>Local technical proof</p>
        <h1 id="cms-integration-title">CMS integration is connected</h1>
        <p className={styles.title}>{page.title}</p>
        <dl className={styles.details}>
          <div>
            <dt>Content type</dt>
            <dd>{page.type}</dd>
          </div>
          <div>
            <dt>Template key</dt>
            <dd>{page.templateKey}</dd>
          </div>
          <div>
            <dt>Public path</dt>
            <dd>{page.publicPath}</dd>
          </div>
          <div>
            <dt>API version</dt>
            <dd>{page.apiVersion}</dd>
          </div>
          <div>
            <dt>Schema version</dt>
            <dd>{page.schemaVersion}</dd>
          </div>
          <div>
            <dt>Module count</dt>
            <dd>{page.moduleCount}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}
