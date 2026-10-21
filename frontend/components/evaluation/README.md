# The evaluation components (frontend)

Shared by every none-sales department: CSD, Collection, Purchasing, HR & Admin (and the GOM place, for the bars). The backend side is
`backend/src/controllers/evaluation/README.md`.

| Component | Job |
|---|---|
| `DepartmentNavigationBar.vue`, `DepartmentSidebarMenu.vue` | the top bar and the side menu of every department layout (`layouts/csd.vue`, `collection.vue`, `purchasing.vue`, `hradmin.vue`, `gom.vue`). They take `department` and read the menu from `config/departmentViews.js` |
| `LeaderBoardTable.vue` | the table view of the leaderboard (the same columns as the Excel) |
| `PerformanceCard.vue`, `PerformanceDetailsModal.vue`, `MetricsSummary.vue` | one employee: the card, the details and the metrics summary (Agent Monthly / Yearly) |
| `TeamCard.vue`, `TeamDetailsModal.vue` | one team (Team Monthly / Yearly) |
| `EvaluationMetricModal.vue` | add / edit one metric of the evaluation (performance, absences, tardiness, memo, feedback by admin) |
| `TooltipCell.vue` | a table cell that shows the name of the employee on hover |

`components/csd/` keeps only what is CSD only (`CsdPerformanceMetrics.vue`, the metrics of the CSD staff).

## The pages
The pages are in `pages/csd/`. Collection, Purchasing and HR & Admin open the same files under their own url (`definePageMeta({ alias })`),
and every page reads its department from the url (`composables/useDepartmentView.js`) and sends `?department=` to the backend.

## The stores
`stores/evaluation.js` (the evaluation, the submit and review), `evaluation_agent_performance.js`, `evaluation_team_performance.js`,
`evaluation_qa_feedback.js`, and `leadership_evaluations.js` for the leadership form.
