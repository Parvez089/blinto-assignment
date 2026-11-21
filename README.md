# Doomsday Ready

A full-stack MERN application featuring a Netflix-inspired dark and crimson interface for managing prerequisite-driven movie watchlists, planning topological rewatch sequences, and optimizing cinema ticket bundle purchases.

## Features

* **Movie Vault & Prerequisites:** Track watch status, search, filter (`All`, `Watched`, `Unwatched`), sort (`Chronological Year`, `Title`, `Runtime`), create or edit entries, and confirm deletions with a custom modal.


* **Circular Dependency Detection:** Validates movie prerequisite graphs and flags circular loops (`409 CIRCULAR_DEPENDENCY` with cycle path details).


* **Rewatch Timeline Planner:** Computes ordered prerequisite watch sequences and calculates remaining versus total plan runtime.


* **Ticket Bundle Optimizer:** Uses a 1D dynamic programming algorithm to optimize cinema ticket bundle purchases.


* **Responsive Dark UI:** Built with Tailwind CSS v4 across mobile, tablet, and desktop viewports with silent background state refreshes.



## Tech Stack

* **Frontend:** Vite, React, TypeScript, Tailwind CSS v4
* **Backend:** Node.js, Express, Mongoose
* **Database:** MongoDB Atlas

## Project Structure

```text
doomsday-ready/
├── backend/
│   ├── src/
│   ├── .env.example
│   ├── .gitignore
│   ├── package.json
│   └── tsconfig.json
└── frontend/
    ├── src/
    │   ├── api/
    │   ├── components/
    │   │   ├── booking/
    │   │   ├── layout/
    │   │   ├── movies/
    │   │   └── rewatch/
    │   ├── pages/
    │   └── types/
    ├── .gitignore
    ├── package.json
    └── vite.config.ts

```

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Parvez089/blinto-assignment.git
cd blinto-assignment

```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env

```

Add your MongoDB Atlas connection string and server configuration to `backend/.env`, then start the server:

```bash
npm run dev

```

### 3. Frontend Setup

Open a new terminal in the `frontend` directory:

```bash
cd frontend
npm install
npm run dev

```

You can also configure `VITE_DOCUMENTATION_URL` in `frontend/.env` to customize the documentation link in the navigation bar.

## Links

* **Repository:** [https://github.com/Parvez089/blinto-assignment](https://github.com/Parvez089/blinto-assignment)
* **Documentation:** [Google Drive Documentation](https://drive.google.com/file/d/1mDOBTRnunu0Q9GQsRVdyhlxzHnuuvUrS/view?usp=drive_link)
