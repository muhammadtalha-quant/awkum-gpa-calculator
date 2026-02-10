# Semester Grade Point and Cumulative Grade Point Average Calculator for AWKUM

This repository contains the client-side web application for calculating SGPA and CGPA for students enrolled in Abdul Wali Khan University Mardan (AWKUM).

## Documentation

We have detailed documentation available for different aspects of the project:

-   [**Features**](./documentation/FEATURES.md): Learn about the calculation modes, grading logic, and PDF export features.
-   [**Architecture**](./documentation/ARCHITECTURE.md): An overview of the tech stack and client-side architecture.
-   [**Code Design**](./documentation/CODE_DESIGN.md): Details on the component hierarchy and state management.

## Quick Start

### Prerequisites
-   Node.js (v18 or higher)
-   npm or yarn

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/muhammadtalha-quant/awkum-gpa-calculator.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Start the development server
    ```sh
    npm run dev
    ```

## Grading Scale

To convert marks into grade points, **AWKUM** uses a specific table. For the full breakdown and formulas used in this app, please refer to the [LOGIC.md](./documentation/LOGIC.md) file.
