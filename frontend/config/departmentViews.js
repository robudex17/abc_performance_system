// The department views that share the CSD pages: CSD and Collection use the same evaluation, leaderboard, Agent and Team
// Performance pages (the same code, the same scores). What is different is here: the url prefix, the menu, the title,
// and who receives the QA feedback.
// The pages are the files of pages/csd, Collection opens them with an alias (definePageMeta({ alias })) under /collection.
import { csdMenu } from './csdMenu'
import { collectionMenu } from './collectionMenu'
import { purchasingMenu } from './purchasingMenu'
import { isInsideArea } from './departments'

export const DEPARTMENT_VIEWS = {
  csd: {
    code: 'csd',
    base: '/csd',
    label: 'CSD',
    layout: 'csd',
    menu: csdMenu,
    evaluationTitle: 'Customer Service Performance Evaluation',
    // the Quality Analyst gives the QA feedback to the staff of this position level and below
    qaMaxLevel: 8,
  },
  collection: {
    code: 'collection',
    base: '/collection',
    label: 'Collection',
    layout: 'collection',
    menu: collectionMenu,
    evaluationTitle: 'Collection Performance Evaluation',
    qaMaxLevel: 3,
  },
  purchasing: {
    code: 'purchasing',
    base: '/purchasing',
    label: 'Purchasing',
    layout: 'purchasing',
    menu: purchasingMenu,
    evaluationTitle: 'Purchasing Performance Evaluation',
    // the Quality Analyst is the QA of CSD and Collection only: nobody of Purchasing has the QA feedback
    qaMaxLevel: 0,
  },
}

// the department view of a path: '/collection/...' is Collection, '/purchasing/...' is Purchasing, anything else is CSD
export const departmentOfPath = (path) =>
  Object.values(DEPARTMENT_VIEWS).find(view => isInsideArea(String(path || ''), view.base))?.code ?? 'csd'

export const departmentViewOfPath = (path) => DEPARTMENT_VIEWS[departmentOfPath(path)]
