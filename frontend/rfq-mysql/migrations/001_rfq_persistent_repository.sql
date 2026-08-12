CREATE DATABASE `gdhe_rfq`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_0900_bin;

CREATE TABLE `gdhe_rfq`.`rfq_schema_migrations` (
  `version` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `checksum` BINARY(32) NOT NULL,
  `applied_at` DATETIME(3) NOT NULL,
  PRIMARY KEY (`version`)
) ENGINE=InnoDB;

CREATE TABLE `gdhe_rfq`.`rfq_intake_records` (
  `key_fingerprint` BINARY(32) NOT NULL,
  `rfq_id` BINARY(16) NOT NULL,
  `public_reference` CHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `contract_version` VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `payload_key_version` VARCHAR(64) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `payload_digest` BINARY(32) NOT NULL,
  `comparison_token` BINARY(32) NOT NULL,
  `basket_snapshot_token` BINARY(32) NOT NULL,
  `state` VARCHAR(32) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `delivery_state` VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `delivery_attempt_count` TINYINT UNSIGNED NOT NULL,
  `authoritative_document` JSON NULL,
  `public_document_kind` VARCHAR(16) CHARACTER SET ascii COLLATE ascii_bin NOT NULL,
  `public_document` JSON NOT NULL,
  `initial_http_status` SMALLINT UNSIGNED NOT NULL,
  `created_at` DATETIME(3) NOT NULL,
  `expires_at` DATETIME(3) NOT NULL,
  `last_transition_at` DATETIME(3) NOT NULL,
  `row_version` BIGINT UNSIGNED NOT NULL,
  PRIMARY KEY (`key_fingerprint`),
  UNIQUE KEY `uq_rfq_intake_records_rfq_id` (`rfq_id`),
  UNIQUE KEY `uq_rfq_intake_records_public_reference` (`public_reference`),
  KEY `ix_rfq_intake_records_state_expires` (`state`, `expires_at`),
  CONSTRAINT `ck_rfq_contract_version` CHECK (`contract_version` = '2.0.0'),
  CONSTRAINT `ck_rfq_public_reference` CHECK (REGEXP_LIKE(`public_reference`, '^RFQ-[A-Z2-9]{12}$', 'c')),
  CONSTRAINT `ck_rfq_state` CHECK (`state` IN ('idempotency_reserved', 'resolving_lines', 'delivery_pending', 'accepted', 'delivery_indeterminate', 'rejected_before_delivery')),
  CONSTRAINT `ck_rfq_delivery_state` CHECK (`delivery_state` IN ('not_started', 'pending', 'accepted', 'indeterminate', 'rejected')),
  CONSTRAINT `ck_rfq_delivery_attempt_count` CHECK (`delivery_attempt_count` IN (0, 1)),
  CONSTRAINT `ck_rfq_public_document_kind` CHECK (`public_document_kind` IN ('receipt', 'error')),
  CONSTRAINT `ck_rfq_initial_http_status` CHECK (`initial_http_status` IN (201, 202, 409)),
  CONSTRAINT `ck_rfq_expiry_anchor` CHECK (`expires_at` = `created_at` + INTERVAL 30 DAY),
  CONSTRAINT `ck_rfq_transition_time` CHECK (`last_transition_at` >= `created_at`),
  CONSTRAINT `ck_rfq_row_version` CHECK (
    (`state` = 'idempotency_reserved' AND `row_version` = 1)
    OR (`state` = 'resolving_lines' AND `row_version` = 2)
    OR (`state` = 'delivery_pending' AND `row_version` = 3)
    OR (`state` IN ('accepted', 'delivery_indeterminate') AND `row_version` = 4)
    OR (`state` = 'rejected_before_delivery' AND `row_version` IN (3, 4))
  ),
  CONSTRAINT `ck_rfq_state_cell` CHECK (
    (`state` = 'idempotency_reserved' AND `delivery_state` = 'not_started' AND `delivery_attempt_count` = 0 AND `authoritative_document` IS NULL AND `public_document_kind` = 'receipt' AND `initial_http_status` = 202)
    OR (`state` = 'resolving_lines' AND `delivery_state` = 'not_started' AND `delivery_attempt_count` = 0 AND `public_document_kind` = 'receipt' AND `initial_http_status` = 202)
    OR (`state` = 'delivery_pending' AND `delivery_state` = 'pending' AND `delivery_attempt_count` = 1 AND `authoritative_document` IS NOT NULL AND `public_document_kind` = 'receipt' AND `initial_http_status` = 202)
    OR (`state` = 'accepted' AND `delivery_state` = 'accepted' AND `delivery_attempt_count` = 1 AND `authoritative_document` IS NOT NULL AND `public_document_kind` = 'receipt' AND `initial_http_status` = 201)
    OR (`state` = 'delivery_indeterminate' AND `delivery_state` = 'indeterminate' AND `delivery_attempt_count` = 1 AND `authoritative_document` IS NOT NULL AND `public_document_kind` = 'receipt' AND `initial_http_status` = 202)
    OR (`state` = 'rejected_before_delivery' AND `delivery_state` = 'rejected' AND `delivery_attempt_count` = 0 AND `public_document_kind` = 'error' AND `initial_http_status` = 409)
  )
) ENGINE=InnoDB;
