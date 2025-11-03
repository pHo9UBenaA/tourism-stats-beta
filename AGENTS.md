# Development

t_wadaのTDDで、YAGNIの原則に従い、Baby stepsでペアプロを行ってください。
`pnpm run format`, `pnpm run lint` はこまめに実施してください。

タスクの終了前に chrome-devtools-mcp を活用し、アドホックな形でアプリをテストしてください。

また、常に以下に従ってください。

## Always: FP

Implement functional domain modeling in TypeScript.

- Implement with single-responsibility functions (no classes)
- Model domains using algebraic data types

```ts
type FetchResult<T, E> = {
  ok: true;
  data: T;
} | {
  ok: false;
  error: E;
};
```

```ts
validateUser(user)` + `saveUser(user)
```

## Always: Domain Model

Aggregate domain models in `src/types/<domain>.ts`.

## Always: Module Scoping

Keep all definitions properly scoped within modules.

Avoid:

- Global scope definitions
- Module-level global references

Why: They create hidden dependencies and make testing difficult

## Always: Comments

Write comments in English using JSDoc.

- File headers: Describe specifications
- Functions/constants: Focus on What/Why

## Always: Magic Literals

Extract magic literals (magic numbers, magic strings) into constants. e.g.:
`if (user.role === "admin")` to `if (user.role === ROLE_ADMIN)`

## Always: Code Organization

- Keep exports of functions to the necessary minimum to maintain clear
  architectural layers and readability
- Use early returns to minimize nesting and improve readability
- Remove dead code to prevent confusion and maintenance burden
