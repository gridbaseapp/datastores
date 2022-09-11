import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import nunjucks from 'nunjucks';
import { faker } from '@faker-js/faker';

faker.seed(0);

const env = new nunjucks.Environment(null, { autoescape: false });

env.addGlobal('faker', faker);

env.addFilter('e', function(str) {
  return str.replace(/'/g, "''");
});

const SQL = `
CREATE TYPE color AS ENUM ('red', 'green', 'blue');

CREATE TYPE foobar AS (
  i integer,
  name text
);

CREATE TABLE {{ db }}_types (
  type_smallint smallint,
  type_integer integer,
  type_bigint bigint,
  type_real real,
  type_double_precision double precision,
  type_decimal decimal(6, 4),
  type_numeric numeric(6, 4),
  type_money money,
  type_varchar varchar,
  type_char char(10),
  type_text text,
  type_bytea bytea,
  type_date date,
  type_time time,
  type_time_with_time_zone time with time zone,
  type_timestamp timestamp,
  type_timestamp_with_time_zone timestamp with time zone,
  type_interval interval,
  type_boolean boolean,
  type_enum_color color,
  type_point point,
  type_line line,
  type_lseg lseg,
  type_box box,
  type_path path,
  type_polygon polygon,
  type_circle circle,
  type_inet inet,
  type_cidr cidr,
  type_macaddr macaddr,
  type_macaddr8 macaddr8,
  type_bit bit(8),
  type_bit_varying bit varying,
  type_tsvector tsvector,
  type_tsquery tsquery,
  type_uuid uuid,
  type_xml xml,
  type_json json,
  type_jsonb jsonb,
  type_integer_array integer[],
  type_integer_array2 integer[][],
  type_foobar foobar,
  type_int4range int4range
);

INSERT INTO {{ db }}_types (
  type_smallint,
  type_integer,
  type_bigint,
  type_real,
  type_double_precision,
  type_decimal,
  type_numeric,
  type_money,
  type_varchar,
  type_char,
  type_text,
  type_bytea,
  type_date,
  type_time,
  type_time_with_time_zone,
  type_timestamp,
  type_timestamp_with_time_zone,
  type_interval,
  type_boolean,
  type_enum_color,
  type_point,
  type_line,
  type_lseg,
  type_box,
  type_path,
  type_polygon,
  type_circle,
  type_inet,
  type_cidr,
  type_macaddr,
  type_macaddr8,
  type_bit,
  type_bit_varying,
  type_tsvector,
  type_tsquery,
  type_uuid,
  type_xml,
  type_json,
  type_jsonb,
  type_integer_array,
  type_integer_array2,
  type_foobar,
  type_int4range
) VALUES
(
  null, 123, 123,
  'inf', '-inf',
  12.1234, 12.1234,
  312323.22,
  'foobar', 'foobar', '{{ faker.lorem.words()|e }}',
  '\\xDEADBEEF',
  '2021-10-10',
  '14:32:22.432',
  '14:32:22.432-2',
  '2021-10-10 14:32:22.432',
  '2021-10-10 14:32:22.432-2',
  'P1Y2M3DT4H5M6S',
  TRUE,
  'red',
  '(0, 10)',
  '{1, 2, 3}',
  '((1, 1), (10, 10))',
  '((1, 1), (10, 10))',
  '[(1, 1), (10, 10), (20, 20), (5, 5)]',
  '((1, 1), (10, 10), (1, 1))',
  '<(0, 0), 10>',
  '192.168.100.128/25',
  '192.168.100.128/25',
  '08:00:2b:01:02:03',
  '08:00:2b:01:02:03:04:05',
  B'10101001',
  B'10101010101',
  'a fat cat sat on a mat and ate a fat rat',
  'fat & (rat | cat)',
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  '<foobar><foo>bar</foo><foo>bar</foo></foobar>',
  '{"foo": [true, "bar"], "tags": {"a": 1, "b": null}}',
  '{"foo": [true, "bar"], "tags": {"a": 1, "b": null}}',
  '{1, 2, 3, 4}',
  {% raw %}'{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}'{% endraw %},
  (0, 'foobar-0'),
  '(0, 10)'
),
{%- for i in range(0, 50) %}
  (
    {{ i }}, {{ i }}, {{ i }},
    {{ i }}, {{ i }},
    {{ i }}, {{ i }},
    {{ i }},
    'foobar-{{ i }}', 'foobar-{{ i }}', '{{ faker.lorem.words()|e }}',
    '\\xDEADBEEF',
    '2021-10-10',
    '14:32:22.432',
    '14:32:22.432-2',
    '2021-10-10 14:32:22.432',
    '2021-10-10 14:32:22.432-2',
    '1 year 2 months 3 days 4 hours 5 minutes 6 seconds',
    FALSE,
    'green',
    '({{ i }}, {{ i}})',
    '{1, 2, 3}',
    '((1, 1), (10, 10))',
    '((1, 1), (10, 10))',
    '((1, 1), (10, 10), (20, 20), (1, 1))',
    '((1, 1), (10, 10), (1, 1))',
    '<(0, 0), 10>',
    '2001:4f8:3:ba::/64',
    '2001:4f8:3:ba::/64',
    '08:00:2b:01:02:03',
    '08:00:2b:01:02:03:04:05',
    B'10101001',
    B'10101010101',
    'a fat cat sat on a mat and ate a fat rat',
    'fat & (rat | cat)',
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    '<foobar><foo>bar</foo><foo>bar</foo></foobar>',
    '{"foo": [true, "bar"], "tags": {"a": 1, "b": null}}',
    '{"foo": [true, "bar"], "tags": {"a": 1, "b": null}}',
    '{1, 2, 3, 4}',
    {% raw %}'{{1, 2, 3}, {4, 5, 6}, {7, 8, 9}}'{% endraw %},
    ({{ i }}, 'foobar-{{ i }}'),
    '[0, 10]'
  ){% if not loop.last %},{% endif %}
{%- endfor %}
;

CREATE TABLE {{ db }}_books (
  id serial PRIMARY KEY,
  title text,
  author text,
  publisher text,
  genre text
);

INSERT INTO {{ db }}_books (title, author, publisher, genre) VALUES
{%- for i in range(0, 50) %}
  (
    '{{ faker.lorem.words()|e }}',
    '{{ faker.name.fullName()|e }}',
    '{{ faker.company.name()|e }}',
    '{{ faker.lorem.words()|e }}'
  ){% if not loop.last %},{% endif %}
{%- endfor %}
;

CREATE TABLE {{ db }}_movies (
  id serial PRIMARY KEY,
  title text,
  director text,
  release_date date
);

INSERT INTO {{ db }}_movies (title, director, release_date) VALUES
{%- for i in range(0, 50) %}
  (
    '{{ faker.lorem.sentence()|e }}',
    '{{ faker.name.fullName()|e }}',
    '{{ faker.date.past().toISOString() }}'
  ){% if not loop.last %},{% endif %}
{%- endfor %}
;

CREATE TABLE {{ db }}_games (
  id serial PRIMARY KEY,
  title text,
  release_date date
);

INSERT INTO {{ db }}_games (title, release_date) VALUES
{%- for i in range(0, 20) %}
  (
    '{{ faker.lorem.sentence()|e }}',
    '{{ faker.date.past().toISOString() }}'
  ){% if not loop.last %},{% endif %}
{%- endfor %}
;

CREATE TABLE {{ db }}_addresses (
  id serial PRIMARY KEY,
  city text,
  street text,
  zip varchar,
  state varchar,
  country varchar,
  time_zone varchar,
  latitude float,
  longitude float
);

INSERT INTO {{ db }}_addresses (city, street, zip, state, country, time_zone, latitude, longitude) VALUES
{%- for i in range(0, 20) %}
  (
    '{{ faker.address.city()|e }}',
    '{{ faker.address.street()|e }}',
    '{{ faker.address.zipCode()|e }}',
    '{{ faker.address.state()|e }}',
    '{{ faker.address.country()|e }}',
    '{{ faker.address.timeZone()|e }}',
    {{ faker.address.latitude() }},
    {{ faker.address.longitude() }}
  ){% if not loop.last %},{% endif %}
{%- endfor %}
;

{%- for tb_idx in range(0, 6) %}
  CREATE TABLE {{ db }}_big_table_{{ tb_idx }} (
    id serial PRIMARY KEY,
    col1 text,
    col2 text,
    col3 text,
    col4 text,
    col5 text,
    col6 text,
    col7 text,
    col8 text,
    col9 text,
    col10 text
  );

  INSERT INTO {{ db }}_big_table_{{ tb_idx }} (col1, col2, col3, col4, col5, col6, col7, col8, col9, col10) VALUES
  {%- for i in range(0, 5000) %}
    ('bt{{ tb_idx }}-{{ i }}-1', 'bt{{ tb_idx }}-{{ i }}-2', 'bt{{ tb_idx }}-{{ i }}-3',
     'bt{{ tb_idx }}-{{ i }}-4', 'bt{{ tb_idx }}-{{ i }}-5', 'bt{{ tb_idx }}-{{ i }}-6',
     'bt{{ tb_idx }}-{{ i }}-7', 'bt{{ tb_idx }}-{{ i }}-8', 'bt{{ tb_idx }}-{{ i }}-9',
     'bt{{ tb_idx }}-{{ i }}-10'){% if not loop.last %},{% endif %}
  {%- endfor %}
  ;
{%- endfor %}

CREATE VIEW {{ db }}_books_view AS
  SELECT id, author FROM {{ db }}_books;

CREATE MATERIALIZED VIEW {{ db }}_materialized_movies_view AS
  SELECT id, director FROM {{ db }}_movies;


CREATE SCHEMA {{ db }}_blog_schema;
SET search_path = {{ db }}_blog_schema;

CREATE TABLE {{ db }}_users (
  id serial PRIMARY KEY,
  first_name text,
  last_name text
);

INSERT INTO {{ db }}_users (first_name, last_name) VALUES
{%- for i in range(0, 20) %}
  (
    '{{ faker.name.firstName()|e }}',
    '{{ faker.name.lastName()|e }}'
  ){% if not loop.last %},{% endif %}
{%- endfor %}
;

CREATE TABLE {{ db }}_comments (
  id serial PRIMARY KEY,
  body text
);

INSERT INTO {{ db }}_comments (body) VALUES
{%- for i in range(0, 20) %}
  ('{{ faker.lorem.paragraph()|e }}'){% if not loop.last %},{% endif %}
{%- endfor %}
;

CREATE VIEW {{ db }}_users_view AS
  SELECT id, first_name FROM {{ db }}_users;

CREATE MATERIALIZED VIEW {{ db }}_materialized_comments_view AS
  SELECT id, body FROM {{ db }}_comments;
`;

['db1', 'db2'].forEach(db => {
  const output = env.renderString(SQL, { db });

  writeFileSync('seed.sql', output);

  [
    'gridbase_postgresql_10',
    'gridbase_postgresql_11',
    'gridbase_postgresql_12',
    'gridbase_postgresql_13',
    'gridbase_postgresql_14',
  ].forEach(service => {
    execSync(`podman cp seed.sql ${service}:seed.sql`);
    execSync(`podman exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "DROP DATABASE IF EXISTS ${db};" >> /dev/null`);
    execSync(`podman exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "DROP ROLE IF EXISTS ${db};" >> /dev/null`);
    execSync(`podman exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "CREATE ROLE ${db} LOGIN PASSWORD '${db}';" >> /dev/null`);
    execSync(`podman exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "CREATE DATABASE ${db} OWNER ${db};" >> /dev/null`);
    execSync(`podman exec -e PGPASSWORD=${db} ${service} psql -h localhost -U ${db} -d ${db} -f seed.sql >> /dev/null`)
  });

  unlinkSync('seed.sql');
});
