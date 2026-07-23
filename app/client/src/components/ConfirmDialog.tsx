import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { ReactNode } from "react";
import { AlertTriangle, HelpCircle } from "lucide-react";

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** "danger" styles the action red — use for destructive operations. */
  variant?: "danger" | "default";
}

type Resolver = (value: boolean) => void;

const ConfirmContext = createContext<
  ((options: ConfirmOptions) => Promise<boolean>) | null
>(null);

/**
 * Promise-based confirmation dialog, a drop-in replacement for window.confirm:
 *   if (!(await confirm({ title: "Delete?" }))) return;
 */
export const useConfirm = () => {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm must be used within <ConfirmProvider>");
  return ctx;
};

export const ConfirmProvider = ({ children }: { children: ReactNode }) => {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolverRef = useRef<Resolver | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  // Element that had focus before opening, so we can restore it on close.
  const previouslyFocused = useRef<HTMLElement | null>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    previouslyFocused.current = document.activeElement as HTMLElement;
    setOptions(opts);
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  const close = useCallback((result: boolean) => {
    resolverRef.current?.(result);
    resolverRef.current = null;
    setOptions(null);
    previouslyFocused.current?.focus?.();
  }, []);

  // Escape always cancels; Tab is kept inside the dialog.
  useEffect(() => {
    if (!options) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close(false);
      }
      if (e.key === "Tab") {
        const focusables =
          document.querySelectorAll<HTMLElement>("[data-confirm-focusable]");
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    // Move focus into the dialog and stop the page behind from scrolling.
    const t = window.setTimeout(() => confirmBtnRef.current?.focus(), 30);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [options, close]);

  const isDanger = options?.variant === "danger";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}

      {options && (
        <div
          className="fixed inset-0 z-[2000] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby={options.message ? "confirm-message" : undefined}
        >
          {/* Scrim — click outside cancels */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm animate-fade-in"
            onClick={() => close(false)}
          />

          {/* Panel */}
          <div
            className="relative w-full max-w-[420px] rounded-[28px] bg-theme-card glass-raise-lg
                       p-7 animate-fade-in"
          >
            <div className="flex gap-4">
              <div
                className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center glass-raise-sm
                            ${isDanger ? "text-rose-500" : "text-theme-accent"}`}
              >
                {isDanger ? (
                  <AlertTriangle size={22} />
                ) : (
                  <HelpCircle size={22} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h2
                  id="confirm-title"
                  className="text-lg font-bold text-theme-text leading-snug"
                >
                  {options.title}
                </h2>
                {options.message && (
                  <p
                    id="confirm-message"
                    className="mt-1.5 text-sm text-theme-text-muted leading-relaxed"
                  >
                    {options.message}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-7 flex items-center justify-end gap-3">
              <button
                data-confirm-focusable
                onClick={() => close(false)}
                className="px-5 py-2.5 rounded-2xl text-sm font-bold text-theme-text
                           bg-theme-card glass-pressable"
              >
                {options.cancelLabel || "Cancel"}
              </button>
              <button
                ref={confirmBtnRef}
                data-confirm-focusable
                onClick={() => close(true)}
                className={`px-5 py-2.5 rounded-2xl text-sm font-bold text-white glass-pressable
                            ${isDanger ? "bg-rose-500" : "bg-theme-accent"}`}
              >
                {options.confirmLabel || "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
};

export default ConfirmProvider;
