## State Management

---

Adpot [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) as state manager at Explorer.

#### Practice

- Diff the global state and partial state. **ONLY** use global state when the state is refereed by two or more
  pages/components.
- Always keep store simple:
  [Slicing the store into smaller stores](https://github.com/pmndrs/zustand/blob/2b29d736841dc7b3fd7dec8cbfea50fee7295974/docs/guides/slices-pattern.md);
- Always use `set` to define a
  store[refer](https://github.com/pmndrs/zustand/blob/2b29d736841dc7b3fd7dec8cbfea50fee7295974/docs/guides/flux-inspired-practice.md)
- Always export custom hooks Only [Example](https://tkdodo.eu/blog/working-with-zustand#only-export-custom-hooks)
- Always Separate Actions from State [Example](https://tkdodo.eu/blog/working-with-zustand#separate-actions-from-state)
- Always apply atomic selectors [Example](https://tkdodo.eu/blog/working-with-zustand#prefer-atomic-selectors)
