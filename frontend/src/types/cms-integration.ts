export type CmsIntegrationPageDto = Readonly<{
  id: string;
  apiVersion: "1";
  schemaVersion: "3.0.0";
  type: string;
  templateKey: string;
  locale: "en";
  publicPath: string;
  title: string;
  excerpt: string | null;
  moduleCount: number;
}>;
