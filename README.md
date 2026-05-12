# AlgoXpress

<p align="center">
  <img src="public/favicon.png" alt="AlgoXpress Logo" width="120" />
</p>

## What is AlgoXpress?

AlgoXpress is an interactive, learning-first platform designed to help computer science students understand the **logic behind DSA problems** before worrying about programming syntax.

Most beginners struggle with Data Structures and Algorithms not because they cannot code, but because they cannot visualize:

* state transitions
* pointer movement
* data manipulation
* execution flow
* step-by-step algorithm behavior

Platforms like LeetCode and NeetCode are excellent for intermediate learners who already understand problem-solving patterns.

AlgoXpress focuses on the earlier stage:

> Understanding how algorithms think.

Inspired by games like *Human Resource Machine*, AlgoXpress transforms DSA learning into a visual execution-based experience where students assemble logic using instructions instead of writing traditional code.

---

## Current Development Status

AlgoXpress is currently in an **early startup MVP phase**.

### Currently Under Development

* In-place replacement in arrays
* Linked list visualization
* Tree visualization

### Current Focus

The current MVP focuses on:

* Visual algorithm execution
* Step-by-step replayable logic
* Instruction-based gameplay
* Understanding array transformations

---

## Core Idea

Instead of writing JavaScript, C++, or Python directly, players solve challenges using visual instructions.

Example instruction types:

### Pointer Movement

* MOVE_LEFT
* MOVE_RIGHT
* SET_POINTER

### Data Manipulation

* PICK
* PUT
* SWAP_WITH_NEXT

### Control Flow

* IF_GREATER
* IF_EQUAL
* JUMP
* LABEL

The goal is to teach:

* algorithmic thinking
* execution flow
* memory reasoning
* state visualization

—not syntax memorization.

---

## Gameplay Philosophy

AlgoXpress is designed around one principle:

> A visual algorithm debugger disguised as a game.

The experience prioritizes:

* Deterministic execution
* Visual traceability
* Replayability
* Step-by-step inspection
* Learning through iteration

Players can:

* assemble instructions
* execute algorithms visually
* step forward
* run automatically
* rewind execution
* inspect every state transition

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion

### State Management

* Zustand

### Visualization

* SVG-based rendering

### Execution Engine

* Custom TypeScript VM
* Web Worker-based execution pipeline

---

## Architecture

The application is divided into three core systems:

### 1. Game Engine

Pure logic layer responsible for:

* challenge definitions
* validation
* execution rules
* win/fail conditions
* complexity tracking

### 2. Renderer

Pure visualization layer responsible for:

* array rendering
* pointer visualization
* execution timeline
* smooth animations

### 3. Orchestrator

State coordination layer responsible for:

* gameplay controls
* interpreter communication
* execution state
* rewind/history
* challenge progression

---

## Screenshots

### Gameplay

<p align="center">
  <img src="public/screenshots/algo1.jpg" width="800" alt="AlgoXpress Screenshot 1" />
</p>

<p align="center">
  <img src="public/screenshots/algo2.jpg" width="800" alt="AlgoXpress Screenshot 2" />
</p>

<p align="center">
  <img src="public/screenshots/algo3.jpg" width="800" alt="AlgoXpress Screenshot 3" />
</p>

---

## Why AlgoXpress Exists

Most DSA platforms assume students already know:

* how to reason about arrays
* how pointers move
* how memory changes over time
* how algorithms transform state

But beginners often fail before they even reach coding.

AlgoXpress attempts to bridge the gap between:

> “I can read the solution”

and

> “I finally understand why the solution works.”

---

## Planned MVP Scope

### Included

* Arrays
* Instruction-based execution
* Visual replay system
* Step / Run / Rewind execution
* Handcrafted challenges

### Not Included

* Backend services
* Competitive leaderboards
* Multiplayer
* Advanced DSA topics
* Traditional code editor

---

## Local Development

### Clone the Repository

```bash
git clone <repo-url>
cd algoxpress
```

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

### Build Production Version

```bash
npm run build
```

---

## Folder Structure

```text
src/
├── app/
├── engine/
├── interpreter/
├── orchestrator/
├── renderer/
├── ui/
├── auth/
├── hooks/
├── utils/
└── styles/
```

---

## Vision

AlgoXpress is not trying to replace LeetCode.

It is trying to solve the stage before LeetCode.

The goal is to help students build intuition for:

* algorithm flow
* state changes
* logical reasoning
* problem-solving patterns

through interactive visual gameplay.

---

## Author

Built by [@shamiroxs](https://github.com/shamiroxs)

---

## License

Currently private during early startup development.
