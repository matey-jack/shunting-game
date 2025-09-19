// Assign distinct colors to labels deterministically
export function pickColorsForLabels(labels: string[]): Record<string, string> {
  const base = [
    '#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231', '#911eb4', '#46f0f0', '#f032e6',
    '#d2f53c', '#fabebe', '#008080', '#e6beff', '#aa6e28', '#fffac8', '#800000', '#aaffc3',
    '#808000', '#ffd8b1', '#000080', '#808080', '#FFFFFF', '#000000'
  ]
  const map: Record<string, string> = {}
  labels.forEach((lbl, i) => map[lbl] = base[i % base.length])
  return map
}
