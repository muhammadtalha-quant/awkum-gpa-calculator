# Code Design

This document provides a deep dive into the code structure, state management, and design patterns used in the AWKUM GPA Calculator.

## Type Definitions (`types.ts`)

The application relies on strong TypeScript interfaces to ensure data integrity.

### `SGPACalculator` State
-   **`SGPACalculator` Inteface**:
    ```typescript
    interface SGPACalculator {
      id: string;          // Unique identifier for React keys
      name: string;        // Subject Name
      code?: string;       // Optional Course Code (e.g. CS-101)
      credits: number;     // Credit Hours (2-6)
      marks: number;       // Obtained Marks (0-100)
      gradePoint: number;  // Calculated GP (0.00 - 4.00)
      gradeLetter: string; // Calculated Grade (A, B, C...)
    }
    ```

### `CGPACalculator` State
-   **`CGPASemester` Interface**:
    ```typescript
    interface CGPASemester {
      id: string;
      name: string;        // "Semester 1", "Semester 2" etc.
      sgpa: number;        // Semester GPA
      credits: number;     // Total Credits for the semester
      subjects?: SGPACalculator[]; // Only used in Expert Mode
    }
    ```

---

## Component Architecture

### 1. `App.tsx` (Root)
-   **Responsibility**:
    -   Holds the global UI state: `activeTab` ('sgpa' | 'cgpa'), `theme`, and `mode` (light/dark).
    -   **Persistence**: Syncs UI config to `localStorage` (`awku_app_ui_config`).
    -   **Layout**: Renders `Header`, the active Calculator component, and `Footer`.
-   **View Transitions**: Uses the View Transitions API for smooth theme switching animations.

### 2. `SGPACalculator.tsx`
-   **State**: `subjects` (Array of objects).
-   **Logic**:
    -   **Auto-Calculation**: Whenever `marks` change, a `useEffect` or handler immediately recalculates `gradePoint`.
    -   **Validation**:
        -   Credits: Enforced to be between 2 and 6.
        -   Marks: Enforced to be between 0 and 100.
    -   **Course Codes**: Toggled via `enableCodes` state.
-   **Export**: Passes the `subjects` array to `pdfService.exportSGPA_PDF`.

### 3. `CGPACalculator.tsx`
-   **State**: `semesters` (Array of `CGPASemester`).
-   **Modes**:
    -   **Quick Mode**: Users edit `sgpa` and `credits` directly in the table.
    -   **Expert Mode**: Renders a nested `SemesterSubjectTable` for each semester.
-   **Credit Pruning**: A `useEffect` monitors the total credit hours across all semesters and removes the last added semester if the total exceeds **216 credits** (max degree limit).

### 4. `SemesterSubjectTable.tsx`
-   **Usage**: Child of `CGPACalculator` in Expert Mode.
-   **Logic**: 
    -   Manages the list of subjects for a *single* semester.
    -   Passes updated data back to parent via `onUpdate` callback.
    -   Calculates the **Semester SGPA** automatically based on the subjects' GPs and Credits.

---

## State Management Patterns

-   **Local State**: Most data (subjects, semesters) is kept in local component state (`useState`) because it doesn't need to be shared globally.
-   **Prop Drilling**: Minimal. Only `theme` is passed down to styled components.
-   **Persistence**:
    -   `SGPACalculator` saves `enableCodes` preference.
    -   `CGPACalculator` saves `isExpertMode` preference.
    -   *Data* (subjects/grades) is **not** persisted to encourage privacy and a fresh start on reload, though `App.tsx` implements a "Session Save" for accidental closes.s

## Utility Logic (`utils/`)

### `gradingLogic.ts`
-   **`calculateGradePoint(marks)`**: Implements the linear interpolation formula.
-   **`getLetterFromGP(gp)`**: Maps a GP (e.g., 3.6) to a Letter Grade (e.g., A-).

### `validation.ts`
-   **`isValidCourseCode(code)`**: Regex `^[A-Z]{2,}-\d{3}$` (approx) to ensure codes look like "CS-101".
