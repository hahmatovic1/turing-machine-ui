# CLAUDE.md — Bachelor Thesis Angular Project

## Project Overview
This is a bachelor thesis web application built with Angular. It is a CRUD/dashboard app.
When in doubt, prioritize clean, readable, well-structured code suitable for academic review.

## Tech Stack
- **Framework:** Angular (latest)
- **Component style:** Standalone components (no NgModules)
- **Styling:** SCSS
- **State management:** Angular **signals** (primary) with services for business logic
- **Backend/API:** (update: REST API / Firebase / mock data)

## Code Style & Conventions
- Use **standalone components** everywhere — never generate NgModule-based components
- Use `inject()` instead of constructor injection for dependencies
- **Use Angular signals for all state management** — `signal()`, `computed()`, `effect()`
  - Signals replace async pipe in most cases; bind directly in templates with `{{ signalName() }}`
  - Use `computed()` for derived state, `effect()` for side effects
  - Prefer signals over RxJS Observables for local state
- Use `HttpClient` with typed responses — always define interfaces for API data
- File naming: `feature-name.component.ts`, `feature-name.service.ts`, etc.
- Keep components small and focused — extract logic into services
- Use component outputs (`@Output()` / `output()`) for parent-child communication

## Folder Structure
```
src/
  app/
    core/          # Singleton services, guards, interceptors
    shared/        # Reusable components, pipes, directives
    features/      # One folder per feature (e.g. /dashboard, /users)
      feature-name/
        feature-name.component.ts
        feature-name.service.ts
        feature-name.routes.ts
    app.routes.ts
    app.config.ts
```

## Feature Development Instructions
When writing new features, always:
1. Create a **service** for all data fetching and business logic
2. Create a **standalone component** that consumes the service via `inject()`
3. Add a **route** to the appropriate `*.routes.ts` file
4. Define **TypeScript interfaces** for all data models
5. Handle loading and error states in the template
6. Add basic **input validation** on forms using Angular Reactive Forms

### Example pattern for a new CRUD feature:
```typescript
// model
export interface Item { id: number; name: string; }

// service
@Injectable({ providedIn: 'root' })
export class ItemService {
  private http = inject(HttpClient);
  getAll() { return this.http.get<Item[]>('/api/items'); }
  create(item: Omit<Item, 'id'>) { return this.http.post<Item>('/api/items', item); }
  update(id: number, item: Partial<Item>) { return this.http.put<Item>(`/api/items/${id}`, item); }
  delete(id: number) { return this.http.delete<void>(`/api/items/${id}`); }
}

// component
@Component({ standalone: true, ... })
export class ItemListComponent {
  private service = inject(ItemService);
  items = signal<Item[]>([]);
  // ...
}
```

## What NOT to do
- Do not use `ngModel` for complex forms — use Reactive Forms
- Do not use `any` type — always type everything explicitly
- Do not subscribe manually if the `async` pipe works
- Do not create NgModules
- Do not put business logic inside components

## Thesis-Specific Notes
- Code must be clean and readable — it will be reviewed by academic supervisors
- Add JSDoc comments to services and non-obvious functions
- Keep commits focused and descriptive
- When generating boilerplate, follow the folder structure above exactly
