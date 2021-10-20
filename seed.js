import { execSync } from 'child_process';
import { writeFileSync, unlinkSync } from 'fs';
import nunjucks from 'nunjucks';
import faker from 'faker';

faker.seed(0);

const env = new nunjucks.Environment(null, { autoescape: false });

env.addGlobal('faker', faker);

env.addFilter('e', function(str) {
  return str.replace(/'/g, "''");
});

const SQL = `
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
    '{{ faker.name.findName()|e }}',
    '{{ faker.company.companyName()|e }}',
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
    '{{ faker.name.findName()|e }}',
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
    '{{ faker.address.streetName()|e }}',
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
    'dbadmin_postgresql_11',
    'dbadmin_postgresql_12',
    'dbadmin_postgresql_13',
    'dbadmin_postgresql_14',
  ].forEach(service => {
    execSync(`docker cp seed.sql ${service}:seed.sql`);
    execSync(`docker exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "DROP DATABASE IF EXISTS ${db};" >> /dev/null`);
    execSync(`docker exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "DROP ROLE IF EXISTS ${db};" >> /dev/null`);
    execSync(`docker exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "CREATE ROLE ${db} LOGIN PASSWORD '${db}';" >> /dev/null`);
    execSync(`docker exec -e PGPASSWORD=admin ${service} psql -h localhost -U postgres -d postgres -c "CREATE DATABASE ${db} OWNER ${db};" >> /dev/null`);
    execSync(`docker exec -e PGPASSWORD=${db} ${service} psql -h localhost -U ${db} -d ${db} -f seed.sql >> /dev/null`)
  });

  unlinkSync('seed.sql');
});
