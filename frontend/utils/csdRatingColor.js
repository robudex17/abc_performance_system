// Bold colors of the rating names of the CSD pages: EXCEPTIONAL purple, VERY SATISFACTORY blue, SATISFACTORY green,
// UNSATISFACTORY and POOR red. '' for the others (INCOMPLETE RATING ... keep their own color).
export const csdRatingClass = (name) => ({
  'EXCEPTIONAL': 'font-bold text-purple-500',
  'VERY SATISFACTORY': 'font-bold text-blue-500',
  'SATISFACTORY': 'font-bold text-green-500',
  'UNSATISFACTORY': 'font-bold text-red-500',
  'POOR': 'font-bold text-red-500',
}[name] || '')
