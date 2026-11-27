---
"@convex-dev/ai-budget": minor
---

Concurrent calls for one user no longer conflict. Admission, release and settlement insert ledger entries stamped with the commit timestamp instead of patching the bucket row, and a reconciler phase folds them into the row. Calls admitted at the same moment can pass a cap by their estimates; `setPolicy({ admission: "exact" })` restores serialized admission. `requestsPerMinute` up to 1,000 is now a sliding 60-second count from the ledger. Requires `convex` 1.49 or later.
