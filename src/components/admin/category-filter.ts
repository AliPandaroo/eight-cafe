const CATEGORY_FILTER_KEY = "admin-items-category"
const CATEGORY_FILTER_EVENT = "admin-items-category"

export function subscribeCategoryFilter(onChange: () => void) {
  window.addEventListener(CATEGORY_FILTER_EVENT, onChange)
  return () => window.removeEventListener(CATEGORY_FILTER_EVENT, onChange)
}

export function getCategoryFilter() {
  return sessionStorage.getItem(CATEGORY_FILTER_KEY) ?? ""
}

export function setCategoryFilter(id: string) {
  sessionStorage.setItem(CATEGORY_FILTER_KEY, id)
  window.dispatchEvent(new Event(CATEGORY_FILTER_EVENT))
}
