# Turing Machine Simulator

An interactive visual Turing Machine simulator for education and theory exploration. Supports both single-tape and multi-tape machines with step-by-step or automatic execution.

## Tech Stack
- **Framework:** Angular (standalone components)
- **Styling:** SCSS
- **State:** Angular signals
- **Data:** JSON-based machine definitions

## Core Components

### app.component
Main orchestrator handling:
- Machine configuration parsing and validation
- Tape initialization and management
- Execution engine (play, pause, step, reset)
- Step counter and state tracking

### tape.component
Tape visualization with:
- Single and multi-tape display
- Read/write head position
- Scroll navigation
- Label support for multi-tape machines

### examples.component
Built-in examples:
- Binary Incrementer
- Bit Flip
- Count Ones
- Copy Input (two-tape)

### Services
**turing-machine.service**
- Parses JSON configurations
- Validates transitions
- Generates example machines
- Supports single and multi-tape formats

## Data Models

```typescript
class TuringMachine {
  numberOfTapes: number;
  states: Set<string>;
  inputAlphabet: Set<string>;
  tapeAlphabet: Set<string>;
  transitions: Transition[];
  initialState: string;
  blank: string;
  finalStates: Set<string>;
}

interface Transition {
  currentState: string;
  readSymbols: string[];
  nextState: string;
  writeSymbols: string[];
  moveDirections: MoveDirection[];
}

type MoveDirection = 'L' | 'R' | 'N';
```

## Configuration Format

**Single-tape:**
```json
{
  "numberOfTapes": 1,
  "states": ["q0", "q1"],
  "inputAlphabet": ["0", "1"],
  "tapeAlphabet": ["0", "1", "_"],
  "initialState": "q0",
  "blank": "_",
  "finalStates": ["q1"],
  "transitions": [
    ["q0", ["0"], "q0", ["0"], ["R"]],
    ["q0", ["_"], "q1", ["_"], ["L"]]
  ]
}
```

**Multi-tape:** Same format but `numberOfTapes > 1` and arrays in transitions match tape count.

## Features
- **Modes:** Play (automatic), Step (manual), Pause, Reset
- **Display:** Current state, read symbols, next transition info
- **Tracking:** Step counter, tape visualization
- **Multi-tape:** Automatic detection and display based on config

## Conventions

### States & Symbols
- States: `q0, q1, q2` (lowercase)
- Symbols: `a, b, 0, 1` (standard)
- Blank: `_` (underscore)
- Movements: `R`, `L`, `N`

### Components
- Naming: `feature-name.component.ts`
- State: Use `signal()` for local state
- Inject: Use `inject(Service)` not constructor
- Bind: `{{ signal() }}` in templates

## Expanding the Project

### Add an Example
1. Add to `examples: Example[]` in `examples.component.ts`
2. Include valid transitions matching your `numberOfTapes`
3. Test in UI

### Add a Feature
1. Create service for business logic
2. Create component with `inject(Service)`
3. Add state with `signal()`
4. Bind in template with `{{ signal() }}`

### Modify Execution
Edit `step()` method in `app.component.ts`:
- `readSymbols` reads from all tapes
- `writeSymbols` writes to all tapes
- `moveDirections` moves each head independently

### Change Visualization
Edit `tape.component.ts`, `tape.component.html`, and `tape.component.scss`

## File Structure
```
src/app/
  core/services/
    turing-machine.service.ts
  shared/components/
    tape/
    examples/
  app.component.ts
  app.component.html
  app.component.scss
  models/
    turing-machine.model.ts
```
