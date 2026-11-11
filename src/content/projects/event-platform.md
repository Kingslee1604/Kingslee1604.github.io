---
title: Event Platform
summary: Meters every AI model call on Kafka and Postgres, bills each one exactly once and enforces per-tenant token budgets, tested by killing brokers, gateways and workers while it runs.
order: 2
featured: true
caseStudy: true
tags: [Python, Kafka, PostgreSQL, Docker, Crash testing, Exactly-once]
repo: https://github.com/Kingslee1604/2026AIProjects/tree/main/event-platform
cover: ../../assets/event-platform/crash-test-result.png
coverAlt: 'The end of a crash test: 20,474 usage records acknowledged after 4 kills, with 0 lost, 0 counted twice and 0 out of order.'
coverPosition: center
demo:
  src: /event-platform-crash-replay.gif
  width: 960
  height: 540
  alt: 'Crash test replay: usage records flow from AI apps through three gateways, three Kafka brokers, the ledger writer and the totals service while a gateway, the totals service and a Kafka broker are killed; at the end, 0 lost, 0 counted twice and 0 out of order.'
  caption: 'A real crash-test run, replayed: kill times, stalls and final counts come from its results file (60 seconds shown in 12).'
metrics:
  - value: '101,000+'
    label: records crash-tested, 0 lost or counted twice
    source: https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/docs/adr/0004-crash-testing.md
  - value: '0'
    label: tokens over budget, through 8 gateway kills
    source: https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/bench/results/2026-10-27-Kingslee-budget-chaos/results.json
  - value: 613-718/s
    label: records on one gateway (acks=all)
    source: https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/docs/adr/0005-benchmarks-and-tuning.md
---

## The problem

Every call to an AI model costs tokens, and a platform that resells or shares those calls has to
bill each one **exactly once**: a lost usage record is lost revenue, and a duplicate overcharges
a customer. It also has to stop a tenant before a call takes them over their daily budget, not
after. Both have to stay true while clients retry and machines crash.

## The approach

- **Billed exactly once.** A usage record that got a `202` is in the ledger once: never lost,
  never counted twice, even when clients retry and brokers, workers and gateways are killed.
- **Order kept per tenant.** Records are keyed by tenant, so one tenant's records keep the order
  they were sent in.
- **Budgets enforced at the gateway.** A call that would go over the daily budget gets a `402`
  before it runs. Gateways approve calls from local slices of budget, so a check usually needs
  no network call, and the slices never add up to more than the limit.
- **Recovers on its own.** Crashed services restart and rebuild their state; no step needs a
  person.

## How it works

1. **Before a model call,** the app asks a gateway to authorize it with the call's maximum
   tokens. The gateway reserves them from its local allowance and tops up from the budget
   service, which grants slices with one SQL statement, so concurrent gateways can never be
   granted more than the limit.
2. **After the call,** the app sends the usage record with the same `event_id`. The gateway
   answers `202` only once the record is on every in-sync Kafka replica (`acks=all`,
   idempotent producer).
3. **The ledger writer** copies records into Postgres with `ON CONFLICT DO NOTHING`, then commits
   its Kafka offsets: at-least-once delivery plus an idempotent write gives each `event_id`
   exactly one row. The ledger is what gets billed.
4. **The totals service** keeps per-tenant, per-day totals with Kafka transactions and publishes
   them to a compacted topic as a live feed.
5. Records that cannot be parsed go to a dead-letter topic with the reason.

## Measured results

On one laptop (i7-1255U, WSL2 capped at 4 GB), with the load generator on the same machine.

| What | Result | Evidence |
|---|---|---|
| Correctness under crashes (3 Kafka nodes) | 0 lost, 0 counted twice, 0 out of order across 101,000+ records, while killing Kafka nodes, gateways and workers and freezing Postgres for 30 s | [ADR-0004](https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/docs/adr/0004-crash-testing.md) |
| Budget never exceeded | 24 clients, 3 gateways, 8 gateway kills: 2,975,245 tokens used of a 3,000,000 limit | [results](https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/bench/results/2026-10-27-Kingslee-budget-chaos/results.json) |
| Throughput, one gateway | 613-718 records/s acknowledged | [ADR-0005](https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/docs/adr/0005-benchmarks-and-tuning.md) |
| Gateway to ledger row, light load | p50 115 ms, p99 220 ms | [results](https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/bench/results/2026-11-08-Kingslee-load/results.json) |
| Recovery | Ledger caught up 2 s after a 30 s database freeze; workers restart in 1-2 s after `kill -9` | [ADR-0004](https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/docs/adr/0004-crash-testing.md) |
| Replay | Ledger rebuilt from the Kafka log, identical row for row, at 13,219 records/s | [ADR-0004](https://github.com/Kingslee1604/2026AIProjects/blob/main/event-platform/docs/adr/0004-crash-testing.md) |

## What the crash tests found

- The Kafka client's committed-offset lookup failed once during a broker failover and was never
  retried, leaving partitions unread.
- A fenced consumer reported a fatal error that did not look fatal, so the service kept polling
  a dead client.
- Workers waited up to a second to fill each batch; records now reach the ledger in 0.22 s at
  p99 under light load.

Each was fixed and written up with its evidence in the
[design records](https://github.com/Kingslee1604/2026AIProjects/tree/main/event-platform/docs/adr).

## What I'd do next

- Budget alerts (for example at 80% of a budget) built on the live totals feed.
- Request metrics for the gateway.
- Authentication: the services listen only on `127.0.0.1` and trust their callers.
