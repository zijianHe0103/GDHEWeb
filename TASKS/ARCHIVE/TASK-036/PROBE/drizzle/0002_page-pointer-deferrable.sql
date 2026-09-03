ALTER TABLE "publication"."pages"
  ALTER CONSTRAINT "pages_current_published_version_same_page_fk"
  DEFERRABLE INITIALLY DEFERRED;
