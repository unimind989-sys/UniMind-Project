create table unimind_private.processed_documents (
  id uuid primary key default extensions.gen_random_uuid(),
  source_version_id uuid not null unique
    references public.source_versions(id) on delete restrict,
  format text not null,
  object_key text not null unique,
  checksum text not null,
  compressed_bytes bigint not null,
  schema_version text not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint processed_documents_id_version_unique unique (id, source_version_id),
  constraint processed_documents_format_check
    check (format in ('MARKDOWN_JSON', 'SYNTHETIC_FIXTURE')),
  constraint processed_documents_checksum_check check (checksum ~ '^sha256:[0-9a-f]{64}$'),
  constraint processed_documents_size_check check (compressed_bytes >= 0)
);

create table unimind_private.source_locators (
  id uuid primary key default extensions.gen_random_uuid(),
  processed_document_id uuid not null,
  source_version_id uuid not null,
  locator_type text not null,
  original_page integer,
  start_ms bigint,
  end_ms bigint,
  processed_start integer not null,
  processed_end integer not null,
  confidence numeric(6, 5),
  created_at timestamptz not null default transaction_timestamp(),
  constraint source_locators_document_version_fk
    foreign key (processed_document_id, source_version_id)
    references unimind_private.processed_documents(id, source_version_id) on delete restrict,
  constraint source_locators_id_version_unique unique (id, source_version_id),
  constraint source_locators_type_check
    check (locator_type in ('PAGE', 'TIME_RANGE', 'SECTION', 'SYNTHETIC')),
  constraint source_locators_page_check check (original_page is null or original_page > 0),
  constraint source_locators_time_check
    check (
      (start_ms is null and end_ms is null)
      or (start_ms is not null and end_ms is not null and start_ms >= 0 and end_ms > start_ms)
    ),
  constraint source_locators_processed_range_check
    check (processed_start >= 0 and processed_end > processed_start),
  constraint source_locators_confidence_check
    check (confidence is null or confidence between 0 and 1)
);

create table unimind_private.source_segments (
  id uuid primary key default extensions.gen_random_uuid(),
  source_version_id uuid not null,
  source_asset_id uuid not null,
  cohort_id uuid not null,
  curriculum_unit_id uuid not null,
  curriculum_edition text not null,
  sequence_number integer not null,
  heading_path text[] not null default '{}'::text[],
  content text not null,
  content_hash text not null,
  token_count integer not null,
  locator_id uuid not null,
  language text not null,
  active boolean not null default true,
  created_at timestamptz not null default transaction_timestamp(),
  constraint source_segments_version_asset_fk
    foreign key (source_version_id, source_asset_id)
    references public.source_versions(id, source_asset_id) on delete restrict,
  constraint source_segments_asset_scope_fk
    foreign key (source_asset_id, cohort_id, curriculum_unit_id)
    references public.source_assets(id, cohort_id, curriculum_unit_id) on delete restrict,
  constraint source_segments_locator_version_fk
    foreign key (locator_id, source_version_id)
    references unimind_private.source_locators(id, source_version_id) on delete restrict,
  constraint source_segments_id_unit_unique unique (id, curriculum_unit_id),
  constraint source_segments_sequence_unique unique (source_version_id, sequence_number),
  constraint source_segments_content_unique unique (source_version_id, content_hash),
  constraint source_segments_sequence_check check (sequence_number > 0),
  constraint source_segments_content_check check (nullif(btrim(content), '') is not null),
  constraint source_segments_hash_check check (content_hash ~ '^sha256:[0-9a-f]{64}$'),
  constraint source_segments_token_count_check check (token_count > 0),
  constraint source_segments_language_check check (language in ('EN', 'AR_EG', 'MIXED', 'OTHER'))
);

create table unimind_private.segment_tags (
  id uuid primary key default extensions.gen_random_uuid(),
  source_segment_id uuid not null
    references unimind_private.source_segments(id) on delete restrict,
  tag_type text not null,
  label text,
  confidence numeric(6, 5),
  details_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default transaction_timestamp(),
  constraint segment_tags_identity_unique unique (source_segment_id, tag_type, label),
  constraint segment_tags_type_check
    check (tag_type in ('PROFESSOR_HINT', 'EXAM_EMPHASIS', 'EXCLUSION', 'CORRECTION', 'LIKELY_QUESTION', 'CONFLICT', 'OTHER')),
  constraint segment_tags_confidence_check
    check (confidence is null or confidence between 0 and 1)
);

create table unimind_private.embedding_configs (
  id uuid primary key default extensions.gen_random_uuid(),
  provider text not null,
  model text not null,
  dimensions integer not null,
  normalization text not null,
  distance_operator text not null,
  version text not null,
  active boolean not null default false,
  created_at timestamptz not null default transaction_timestamp(),
  constraint embedding_configs_identity_unique
    unique (provider, model, version, dimensions, normalization, distance_operator),
  constraint embedding_configs_dimensions_check check (dimensions between 1 and 16000),
  constraint embedding_configs_normalization_check
    check (normalization in ('NONE', 'L2')),
  constraint embedding_configs_distance_check
    check (distance_operator in ('COSINE', 'L2', 'INNER_PRODUCT'))
);

create table unimind_private.segment_embeddings (
  id uuid primary key default extensions.gen_random_uuid(),
  source_segment_id uuid not null
    references unimind_private.source_segments(id) on delete restrict,
  embedding_config_id uuid not null
    references unimind_private.embedding_configs(id) on delete restrict,
  embedding extensions.vector not null,
  created_at timestamptz not null default transaction_timestamp(),
  constraint segment_embeddings_segment_config_unique
    unique (source_segment_id, embedding_config_id)
);

create table unimind_private.source_conflict_annotations (
  id uuid primary key default extensions.gen_random_uuid(),
  curriculum_unit_id uuid not null
    references public.curriculum_units(id) on delete restrict,
  segment_a_id uuid not null,
  segment_b_id uuid not null,
  status text not null default 'OPEN',
  description text not null,
  created_by uuid not null references public.profiles(user_id) on delete restrict,
  created_at timestamptz not null default transaction_timestamp(),
  constraint source_conflicts_segment_a_scope_fk
    foreign key (segment_a_id, curriculum_unit_id)
    references unimind_private.source_segments(id, curriculum_unit_id) on delete restrict,
  constraint source_conflicts_segment_b_scope_fk
    foreign key (segment_b_id, curriculum_unit_id)
    references unimind_private.source_segments(id, curriculum_unit_id) on delete restrict,
  constraint source_conflicts_pair_unique
    unique (curriculum_unit_id, segment_a_id, segment_b_id),
  constraint source_conflicts_not_self_check check (segment_a_id <> segment_b_id),
  constraint source_conflicts_order_check check (segment_a_id < segment_b_id),
  constraint source_conflicts_status_check check (status in ('OPEN', 'CONFIRMED', 'RESOLVED'))
);

create function unimind_private.validate_embedding_dimensions()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  expected_dimensions integer;
begin
  select dimensions
  into expected_dimensions
  from unimind_private.embedding_configs
  where id = new.embedding_config_id;

  if expected_dimensions is null then
    raise exception using errcode = '23503', message = 'embedding configuration does not exist';
  end if;

  if extensions.vector_dims(new.embedding) <> expected_dimensions then
    raise exception using errcode = '22000', message = 'embedding dimensions do not match configuration';
  end if;

  return new;
end;
$$;

create function unimind_private.enforce_source_segment_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if (new.source_version_id, new.source_asset_id, new.cohort_id,
      new.curriculum_unit_id, new.curriculum_edition, new.sequence_number,
      new.heading_path, new.content, new.content_hash, new.token_count,
      new.locator_id, new.language, new.created_at)
     is distinct from
     (old.source_version_id, old.source_asset_id, old.cohort_id,
      old.curriculum_unit_id, old.curriculum_edition, old.sequence_number,
      old.heading_path, old.content, old.content_hash, old.token_count,
      old.locator_id, old.language, old.created_at) then
    raise exception using errcode = '55000', message = 'source segment evidence is immutable';
  end if;
  return new;
end;
$$;

revoke all on function unimind_private.validate_embedding_dimensions()
  from public, anon, authenticated;
revoke all on function unimind_private.enforce_source_segment_update()
  from public, anon, authenticated;

create trigger segment_embeddings_dimension_check
before insert or update on unimind_private.segment_embeddings
for each row execute function unimind_private.validate_embedding_dimensions();

create trigger source_segments_immutable_evidence
before update on unimind_private.source_segments
for each row execute function unimind_private.enforce_source_segment_update();

create trigger source_segments_no_delete
before delete on unimind_private.source_segments
for each row execute function unimind_private.reject_row_mutation();

create trigger processed_documents_append_only
before update or delete on unimind_private.processed_documents
for each row execute function unimind_private.reject_row_mutation();

create trigger source_locators_append_only
before update or delete on unimind_private.source_locators
for each row execute function unimind_private.reject_row_mutation();

create trigger segment_embeddings_append_only
before update or delete on unimind_private.segment_embeddings
for each row execute function unimind_private.reject_row_mutation();

revoke all on table unimind_private.processed_documents from public, anon, authenticated;
revoke all on table unimind_private.source_locators from public, anon, authenticated;
revoke all on table unimind_private.source_segments from public, anon, authenticated;
revoke all on table unimind_private.segment_tags from public, anon, authenticated;
revoke all on table unimind_private.embedding_configs from public, anon, authenticated;
revoke all on table unimind_private.segment_embeddings from public, anon, authenticated;
revoke all on table unimind_private.source_conflict_annotations from public, anon, authenticated;
