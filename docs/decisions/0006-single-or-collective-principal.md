# 0006: The principal can be one person or a collective

Status: accepted (2026-11-13; owner chose "both, by era")

## Context

In the Union and in Ukraine the player is one person. In the Roman Republic the leadership is the Senate, a collective whose majority shifts and whose magistrates rotate every year. In the Late Republic or the Empire the player is a single strongman. The kernel has to support both without a branch per setting.

## Decision

- The **principal** is an abstraction: an entity that holds a **mandate** and spends it through the leader's verbs.
- A **single principal** is one person. Their mandate comes from blocs. Their attention budget comes from their own health and staff.
- A **collective principal** is a body (a Senate, a junta, a politburo). Its mandate comes from the **coalition within it**. Its verbs are proposals that must pass the body's decision rule. Its members are themselves persons with values and standing who can push back. A collective's attention is the body's agenda.
- A pack declares the principal type. Mechanisms take the principal as an input and never test its type for setting-specific behaviour.

## Consequences

- In a collective, "pushback" also happens **inside** the principal: a faction blocks your proposal. This uses the same compliance and coalition machinery.
- The kernel's verb pipeline needs an authorization step (`single`: always authorized; `collective`: put to a vote) before a directive is issued. The first slice exercises only the single case. Rome is the test of the collective case.
