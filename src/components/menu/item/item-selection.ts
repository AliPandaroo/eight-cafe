const ITEM_PARAM = "item";

type Listener = () => void;

const listeners = new Set<Listener>();

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

function itemUrl(id: string | null) {
  const url = new URL(window.location.href);

  if (id) {
    url.searchParams.set(ITEM_PARAM, id);
  } else {
    url.searchParams.delete(ITEM_PARAM);
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

export function getSelectedItemId() {
  return new URLSearchParams(window.location.search).get(ITEM_PARAM);
}

export function subscribeSelectedItemId(listener: Listener) {
  listeners.add(listener);
  window.addEventListener("popstate", listener);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

export function openMenuItem(id: string) {
  window.history.pushState({ menuItem: id }, "", itemUrl(id));
  notify();
}

export function closeMenuItem() {
  window.history.replaceState({ menuItem: null }, "", itemUrl(null));
  notify();
}
