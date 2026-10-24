# SQLite teaching challenge (v0.9)

The equipment search intentionally interpolates its search text into a SQL string. Unlike a payload matcher, real SQLite evaluates accepted queries. Search results therefore depend on the predicate the player supplied. PostgreSQL, Docker and external endpoints are no longer part of the current app.

## Architecture

Authenticated game action → GameRoom Durable Object → private SQL_LABS binding → SqlLab Durable Object.

GameRoom keeps room progress in its own database. SqlLab keeps five fictional equipment records in a different database, plus non-sensitive initialization/quota markers. Each room has its own lab object. The public Worker exposes no direct SqlLab route; the game authorizes the player's room credential before invoking the binding. No client connection string or gateway token is needed.

## What players can try

Quotes, doubled single-quote escapes, SQL comments, literal comparisons, arithmetic, AND/OR/NOT, NULL/TRUE/FALSE, LIKE, IS [NOT], IN, EXISTS, scalar subqueries, COUNT(*), LOWER/UPPER/LENGTH/ABS, bounded UNION [ALL], DISTINCT and LIMIT up to20 are supported. Only the reservations table and its four named columns may be referenced. Qualifying a column with reservations is allowed. Aliases, quoted identifiers, arbitrary functions and broader SQL syntax are outside this exercise.

Examples:

```sql
' OR 1=1 --
' OR 'holiday'='holiday' --
' OR (SELECT count(*) FROM reservations)>0 --
```

These are evaluated by SQLite. The validator does not decide whether the condition is true. A syntactically valid SQLite feature outside this bounded grammar is rejected as unsupported; it is not a promise to run arbitrary SQLite SQL. The UI reports the rejection and shows the generated query.

## Containment

The policy scans the full generated query, including string/comment boundaries, and requires complete consumption. It then executes canonical accepted tokens with comments removed, rather than executing the original raw query. Literal tokens retain their exact single-quote escaping. SQL statement separators outside strings, DDL/DML, PRAGMA, ATTACH, system tables, unapproved identifiers/functions, CTEs and JOINs cannot pass the grammar.

Input: 200 characters /800 UTF-8 bytes, no control characters. Query:120 tokens, expression depth10, at most4 SELECT terms and8 values per IN list. There are only5 source rows. No joins, recursive queries, table-valued or expanding functions are available, keeping intermediate work finite. This is a structural bound; there is no false promise that a JavaScript timer can interrupt synchronous SQLite execution.

The trusted outer projection limits results to20 rows and clips each text field to1025 characters. Fields above1024 UTF-8 bytes and result rows above16 KiB combined are rejected. The challenge cannot look up another Durable Object's database or host files through this SQL interface.

Every attempt, including rejected SQL, consumes a persisted per-room budget:14 attempts per10-second window and500 per UTC day. Updates are serialized before executing SQL. Busy and daily-limit messages are distinct; refreshing/reconnecting/evicting the object does not reset its budget. A new UTC day resets the daily allowance. These are teaching limits, not complete protection against someone creating many new rooms. Public abuse controls and idle-room cleanup remain future deployment work.

## Free-tier target

Both GameRoom and SqlLab use SQLite-backed Durable Objects, supported by Workers Free. The static artwork/front end is served by Worker Assets. No separate SQL hosting is necessary. Actual usage shares your account's request, duration, row-read/write and storage quotas; a small team is expected to fit, but no deployed usage has been measured. Free-tier quota exhaustion can make operations fail. Using SQLite does not remove account limits or justify running unlimited/expensive SQL.

## Validation

`npm test` runs actual local workerd SQLite and the production binding path. See sqlite-test-report.json and test-report.json. Rejections, alternative predicates, query semantics, literals/comments, subqueries/UNION, output bounds, persisted rate limiting and separate-room budgets are exercised. Quota window/day transitions use the exact budget function used by production. No deployed account, full browser walkthrough or timing study is claimed.
