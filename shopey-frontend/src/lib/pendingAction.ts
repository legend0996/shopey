import { Product } from "@/types";

export type PendingAction =
  | { type: "add_to_cart"; product: Product }
  | { type: "toggle_wishlist"; product: Product };

const KEY = "pending_action";

export function savePendingAction(action: PendingAction) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(action));
}

export function consumePendingAction(): PendingAction | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;

  sessionStorage.removeItem(KEY);

  try {
    return JSON.parse(raw) as PendingAction;
  } catch {
    return null;
  }
}
