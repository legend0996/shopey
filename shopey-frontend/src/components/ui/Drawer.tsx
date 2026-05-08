"use client";
import { useEffect } from "react";
import { createPortal } from "react-dom";
import clsx from "clsx";
import { Button } from "./Button";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: "right" | "left";
}

export function Drawer({ open, onClose, title, children, side = "right" }: DrawerProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <div
      className={clsx(
        "fixed inset-0 z-50 flex",
        side === "right" ? "justify-end" : "justify-start",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
      aria-hidden={!open}
    >
      <div
        className={clsx(
          "absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          "relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col transition-transform duration-300",
          side === "right"
            ? open ? "translate-x-0" : "translate-x-full"
            : open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          {title && <h2 className="font-semibold text-slate-900">{title}</h2>}
          <Button variant="ghost" size="sm" onClick={onClose} className="p-1.5!">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
      </div>
    </div>,
    document.body
  );
}
