# AWKUM's Grading Scale and Formula for SGPA and CGPA Calculation

The whole app logic revolve around the contents of this file.

To convert marks into grade points, **AWKUM** uses a table in which each mark has it's associated grade point.

| Marks out of 100 | Grade Point | Grade Letter |
| ---------------- | ----------- | ------------ |
| $< 50$           | $0.00$      | **_F_**      |
| $50$             | $2.00$      | **_C-_**     |
| $51$             | $2.05$      | **_C-_**     |
| $52$             | $2.10$      | **_C-_**     |
| $53$             | $2.15$      | **_C-_**     |
| $54$             | $2.20$      | **_C-_**     |
| $55$             | $2.25$      | **_C_**      |
| $56$             | $2.30$      | **_C_**      |
| $57$             | $2.35$      | **_C_**      |
| $58$             | $2.40$      | **_C_**      |
| $59$             | $2.45$      | **_C_**      |
| $60$             | $2.50$      | **_C+_**     |
| $61$             | $2.55$      | **_C+_**     |
| $62$             | $2.60$      | **_C+_**     |
| $63$             | $2.65$      | **_C+_**     |
| $64$             | $2.70$      | **_C+_**     |
| $65$             | $2.75$      | **_B-_**     |
| $66$             | $2.80$      | **_B-_**     |
| $67$             | $2.85$      | **_B-_**     |
| $68$             | $2.90$      | **_B-_**     |
| $69$             | $2.95$      | **_B-_**     |
| $70$             | $3.00$      | **_B_**      |
| $71$             | $3.05$      | **_B_**      |
| $72$             | $3.10$      | **_B_**      |
| $73$             | $3.15$      | **_B_**      |
| $74$             | $3.20$      | **_B_**      |
| $75$             | $3.25$      | **_B+_**     |
| $76$             | $3.30$      | **_B+_**     |
| $77$             | $3.35$      | **_B+_**     |
| $78$             | $3.40$      | **_B+_**     |
| $79$             | $3.45$      | **_B+_**     |
| $80$             | $3.50$      | **_A-_**     |
| $81$             | $3.55$      | **_A-_**     |
| $82$             | $3.60$      | **_A-_**     |
| $83$             | $3.65$      | **_A-_**     |
| $84$             | $3.70$      | **_A-_**     |
| $85$             | $3.75$      | **_A_**      |
| $86$             | $3.80$      | **_A_**      |
| $87$             | $3.85$      | **_A_**      |
| $88$             | $3.90$      | **_A_**      |
| $89$             | $3.95$      | **_A_**      |
| $\geq 90$        | $4.00$      | **_A+_**     |

### Formula for Calculating Semester GPA (SGPA).

To calculate the GPA, you should know your grade point and credit hours.

$$
\text{SGPA} = \frac{\sum_{i=1}^{n}(G_i\times C_i)}{\sum_{i=1}^{n}(C_i)}
$$

#### Explanation of the Symbols

The symbols used in above formula is broken down into the following table.

| Symbol | Meaning                   |
| ------ | ------------------------- |
| $i$    | _Subject_                 |
| $G_i$  | _Grade Point of Subject_  |
| $C_i$  | _Credit Hours of Subject_ |
| $n$    | _The Last Subject_        |

### Formula for Calculating Cumulative GPA (CGPA)

From semester 2 and onwards, **CGPA** is taken into account and you're obliged to maintain or increase it.

To calculate your **CGPA**, you should know **SGPA** of previous semesters and the total credits of that semester.

$$
\text{CGPA} = \frac{\sum_{i=1}^{n} (S_i\times T_i)}{\sum_{i=1}^{n}(T_i)}
$$

#### Explanation of the Symbols

The symbols used in above formula are broken down into the following table.

| Symbol | Meaning                            |
| ------ | ---------------------------------- |
| $i$    | _Semester_                         |
| $S_i$  | _SGPA of a semester_               |
| $T_i$  | _Total credit hours of a semester_ |
| $n$    | _Last Freshly Finished Semester_   |

---
