export const byKey = (key) => (a, b) =>
  a[key] > b[key] ? 1 : a[key] < b[key] ? -1 : 0

export const byKeys = (...keys) => (a, b) => {
  for (const key of keys) {
    if (a[key] > b[key]) {
      return 1
    }
    if (a[key] < b[key]) {
      return -1
    }
  }
  return 0
}
