# Semester Grade Point and Cumulative Grade Point Average Calculator for AWKUM
This repo holds the code for the client side webapp that calculates SGPA and CGPA for the students enrolled in AWK University Mardan.

## Why this app ?
This app was created only for the purpose to serve students of AWKUM.
There was no specific GPA and CGPA calculator that was designed to use the AWKUM's linear grading formula.
This app can calculate your SGPA and your CGPA no matter what subjects you have or in which department you 
are enrolled. This app can also export an unofficial Detailed Marks Certificate for SGPA and CGPA.


## AWKUM's Grading Scale and Formula for SGPA and CGPA Calculation

To convert marks into grade points, **AWKUM** uses a table in which each mark has it's associated grade point.

| Marks out of 100 | Grade Point | Grade Letter |
| ---------------- | ----------- | ------------ |
| $< 50$           | $0.00$      | ***F***      |
| $50$             | $2.00$      | ***C-***     |
| $51$             | $2.05$      | ***C-***     |
| $52$             | $2.10$      | ***C-***     |
| $53$             | $2.15$      | ***C-***     |
| $54$             | $2.20$      | ***C-***     |
| $55$             | $2.25$      | ***C***      |
| $56$             | $2.30$      | ***C***      |
| $57$             | $2.35$      | ***C***      |
| $58$             | $2.40$      | ***C***      |
| $59$             | $2.45$      | ***C***      |
| $60$             | $2.50$      | ***C+***     |
| $61$             | $2.55$      | ***C+***     |
| $62$             | $2.60$      | ***C+***     |
| $63$             | $2.65$      | ***C+***     |
| $64$             | $2.70$      | ***C+***     |
| $65$             | $2.75$      | ***B-***     |
| $66$             | $2.80$      | ***B-***     |
| $67$             | $2.85$      | ***B-***     |
| $68$             | $2.90$      | ***B-***     |
| $69$             | $2.95$      | ***B-***     |
| $70$             | $3.00$      | ***B***      |
| $71$             | $3.05$      | ***B***      |
| $72$             | $3.10$      | ***B***      |
| $73$             | $3.15$      | ***B***      |
| $74$             | $3.20$      | ***B***      |
| $75$             | $3.25$      | ***B+***     |
| $76$             | $3.30$      | ***B+***     |
| $77$             | $3.35$      | ***B+***     |
| $78$             | $3.40$      | ***B+***     |
| $79$             | $3.45$      | ***B+***     |
| $80$             | $3.50$      | ***A-***     |
| $81$             | $3.55$      | ***A-***     |
| $82$             | $3.60$      | ***A-***     |
| $83$             | $3.65$      | ***A-***     |
| $84$             | $3.70$      | ***A-***     |
| $85$             | $3.75$      | ***A***      |
| $86$             | $3.80$      | ***A***      |
| $87$             | $3.85$      | ***A***      |
| $88$             | $3.90$      | ***A***      |
| $89$             | $3.95$      | ***A***      |
| $\geq 90$        | $4.00$      | ***A+***     |

### Formula for Calculating Semester GPA (SGPA).

To calculate the GPA, you should know your grade point and credit hours.

$$
\text{SGPA} = \frac{\sum_{i=1}^{n}(G_i\times C_i)}{\sum_{i=1}^{n}(C_i)}
$$

#### Explanation of the Symbols

The symbols used in above formula is broken down into the following table.

| Symbol | Meaning                   |
| ------ | ------------------------- |
| $i$    | *Subject*                 |
| $G_i$  | *Grade Point of Subject*  |
| $C_i$  | *Credit Hours of Subject* |
| n      | *The Last Subject*        |

### Formula for Calculating Cumulative GPA (CGPA)

From semester 2 and onwards, **CGPA** is taken into account and you're obliged to maintain or increase it.

To calculate your **CGPA**, you should know **SGPA** of previous semesters and the total credits of that semester.

$$
\text{CGPA} = \frac{\sum_{i=1}^{n} (S_i\times T_i)}{\sum_{i=1}^{n}(T_i)}
$$

#### Explanation of the Symbols 

The symbols used in above formula are broken down into the following table.

| Symbol | Meaning                               |
| ------ | ------------------------------------- |
| $i$    | *Semester*                            |
| $S_i$  | *SGPA of a semester*                  |
| $T_i$  | *Total credit hours of a semester*    |
| $n$    | *Last Freshly Finished Semester* |

---
