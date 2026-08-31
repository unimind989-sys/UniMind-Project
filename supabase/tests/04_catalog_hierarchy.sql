begin;
\ir ../fixtures/wp02-synthetic.sql
select plan(3);

select throws_ok(
  $$insert into public.institutions (
      education_stage_id, code, name_en, name_ar
    ) values (
      '20000000-0000-0000-0000-000000000001',
      'SYNTHETIC_UNIVERSITY', 'Duplicate', 'مكرر'
    )$$,
  '23505', null,
  'stable institution codes are unique within the parent'
);

insert into public.cohorts (
  id, term_id, code, name, curriculum_edition, status
)
values (
  '20000000-0000-0000-0000-000000000099',
  '20000000-0000-0000-0000-000000000005',
  'COHORT_OTHER', 'Other Synthetic Cohort', 'other-edition', 'ACTIVE'
);

select throws_ok(
  $$insert into public.curriculum_units (
      cohort_id, parent_unit_id, code, unit_type, title_en, title_ar
    ) values (
      '20000000-0000-0000-0000-000000000099',
      '20000000-0000-0000-0000-000000000007',
      'CROSS_COHORT', 'MODULE', 'Cross cohort', 'عابر'
    )$$,
  '23503', null,
  'a curriculum-unit parent cannot cross cohorts'
);

select is(
  (select count(*) from public.curriculum_units where cohort_id = '20000000-0000-0000-0000-000000000006'),
  2::bigint,
  'the fixture retains two scoped curriculum units'
);

select * from finish();
rollback;
