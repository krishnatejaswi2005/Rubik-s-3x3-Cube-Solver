# Rubik’s Cube Solver

A full-stack web application that takes any valid Rubik’s Cube scramble, computes a solving sequence using the **two-phase algorithm** (via `kociemba`), applies it to a virtual cube (handled by `pycuber`), and visually displays the before/after cube states in a browser UI. The frontend is a React app styled with Bootstrap; the backend is a Flask service exposing a `/solve` endpoint.

---

## Features / What the code does

- Represents a Rubik’s Cube using `pycuber`.
- Converts the cube’s current sticker colors into the 54-character facelet string required by the Kociemba two-phase solver.
- Calls the `kociemba` solver to get a guaranteed solution sequence.
- Applies the solution back to the scrambled cube and verifies that the cube is solved.
- Exposes a REST API (`/solve`) that accepts a scramble, returns:
  - The original scramble.
  - The computed solution moves.
  - The cube state before solving.
  - The cube state after applying the solution.
  - A boolean flag indicating whether the result is solved.
- Frontend renders the cube states as colored facelets and displays the solution in a clean UI using Bootstrap.

---

## Architecture

```

/
├── server.py           # Flask backend solving logic
├── rubiks-ui/         # React + Bootstrap frontend
└── README.md

```

---

## Technology Stack / Libraries Used

### Backend (Python)

- [`pycuber`](https://github.com/SvenWerlen/pycuber): Cube representation and move application.
- [`kociemba`](https://pypi.org/project/kociemba/): Two-phase Rubik’s Cube solving algorithm.
- [`Flask`](https://flask.palletsprojects.com/): Lightweight web server to expose solve endpoint.
- Standard library modules: `random`, `collections.Counter`, `argparse`, etc.

### Frontend (React)

- [`React`](https://react.dev/): UI framework for interactive frontend.
- [`Bootstrap 5`](https://getbootstrap.com/): Styling, layout, and components for a clean minimal UI.

---

## Core Logic & Algorithm

1. **Scramble application**: The backend receives a scramble string (or generates a random one), and applies it to a fresh `pycuber.Cube()` instance.

2. **Facelet string construction**:

   - Attempts to read the center sticker of each face to establish the canonical mapping (which color corresponds to U, R, F, D, L, B).
   - If the center is missing / unreliable, it falls back to using the majority color of that face (robust inference).
   - Builds a reverse mapping from normalized color names to face letters.
   - Constructs the 54-character string in the order `U R F D L B`, matching the input format expected by the `kociemba` solver. Minor fuzzy matching is included to handle slight naming discrepancies.

3. **Solving**: Passes the facelet string to `kociemba.solve(...)` which implements the **two-phase algorithm** to compute a sequence of moves that will solve the cube.

4. **Verification**:

   - Applies that solution sequence back onto a copy of the scrambled cube.
   - Checks that each face’s stickers match its center (i.e., fully solved).
   - Returns both pre- and post-solution cube states and the solved flag.

5. **Frontend**: Sends scramble to backend, receives solution and cube fingerprints, and renders:
   - Scrambled cube.
   - Solution moves.
   - Final cube state.
   - Visual solved status indicator.

---

## Installation & Setup

### Prerequisites

- Python 3.10+
- Node.js 16+ (or newer) and npm (or yarn/pnpm)
- Git

### Clone the repository

```bash
git clone https://github.com/krishnatejaswi2005/Rubik-s-3x3-Cube-Solver.git
cd Rubik-s-3x3-Cube-Solver
```

---

### Backend (Python) Setup

1. **Create and activate virtual environment**

```bash
python -m venv .venv
```

- On Windows PowerShell:

  ```powershell
  .\.venv\Scripts\Activate.ps1
  ```

- On Windows CMD:

  ```cmd
  .\.venv\Scripts\activate.bat
  ```

- On macOS / Linux:

  ```bash
  source .venv/bin/activate
  ```

2. **Install dependencies**

Create (if not present) or verify `requirements.txt` with:

```txt
pycuber
kociemba
flask
flask-cors
```

Then install:

```bash
pip install -r requirements.txt
```

3. **Run backend**

```bash
python server.py
```

By default it will start at `http://localhost:5000`.

---

### Frontend (React + Bootstrap) Setup

1. **Navigate to frontend**

```bash
cd rubiks-ui
```

2. **Install dependencies**

```bash
npm install
```

_or_

```bash
yarn install
```

3. **Run frontend**

```bash
npm run dev
```

The React app will typically be available at `http://localhost:5173` or `http://localhost:3000` depending on setup.

---

## Usage

1. Open the frontend in a browser.
2. Enter a scramble string (e.g., `R U R' U'`) or leave blank to use a random scramble.
3. Click **Solve**.
4. View:

   - The scrambled cube.
   - The solution sequence.
   - The resulting cube after applying the solution.
   - Whether the cube was successfully solved.

---

## Possible Enhancements

- Clickable cube editor to define arbitrary cube states.
- Step-by-step animation of solution moves.
- Image-based cube state input (via camera + color detection).
- Docker Compose to bundle frontend + backend.
- Authentication / history persistence.

---
