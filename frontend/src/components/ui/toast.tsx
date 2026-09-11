import {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
    type PropsWithChildren,
} from "react";
import { createPortal } from "react-dom";
import { CheckCircle, TriangleAlert, CircleAlert, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ToastContext, type ToastApi } from "./use-toast";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastData {
    id: string;
    type: ToastType;
    title: string;
    message?: string;
    duration?: number; // em milissegundos (padrão: 4000)
}

export interface ToastInput {
    type: ToastType;
    title: string;
    message?: string;
    duration?: number;
}

const DEFAULT_DURATION = 4000;

const iconMap: Record<ToastType, typeof Info> = {
    success: CheckCircle,
    error: CircleAlert,
    warning: TriangleAlert,
    info: Info,
};

const accentMap: Record<ToastType, string> = {
    success: "text-success",
    error: "text-danger",
    warning: "text-warning",
    info: "text-info",
};

const barMap: Record<ToastType, string> = {
    success: "bg-success",
    error: "bg-danger",
    warning: "bg-warning",
    info: "bg-info",
};

interface ToastState extends ToastData {
    leaving: boolean;
}

let idCounter = 0;
const nextId = () => `toast-${Date.now()}-${idCounter++}`;

function ToastItem({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }) {
    const { type, title, message, duration = DEFAULT_DURATION, leaving } = toast;
    const Icon = iconMap[type];

    return (
        <div
            className={cn(
                "relative w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-surface shadow-lg",
                leaving ? "animate-[toast-out_0.2s_ease-in_forwards]" : "animate-[toast-in_0.25s_ease-out]",
            )}
            role={type === "error" ? "alert" : "status"}
        >
            <div className="flex items-start gap-3 p-3 pr-9">
                <Icon className={cn("h-5 w-5 shrink-0 mt-0.5", accentMap[type])} aria-hidden="true" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{title}</p>
                    {message && <p className="mt-0.5 text-xs text-foreground-muted wrap-break-word">{message}</p>}
                </div>
            </div>
            <button
                type="button"
                aria-label="Dismiss notification"
                onClick={onDismiss}
                className="absolute top-2 right-2 rounded-md p-1 text-foreground-muted transition-colors hover:bg-surface-elevated hover:text-foreground"
            >
                <X size={14} />
            </button>
            <div className="h-1 w-full overflow-hidden bg-border/50">
                <div
                    className={cn("h-full", barMap[type])}
                    style={{ animation: `toast-progress ${duration}ms linear forwards` }}
                />
            </div>
        </div>
    );
}

function ToastViewport({ toasts, onDismiss }: { toasts: ToastState[]; onDismiss: (id: string) => void }) {
    return createPortal(
        <div className="fixed top-4 right-4 z-60 flex flex-col items-end gap-2">
            {toasts.map(t => (
                <ToastItem key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
            ))}
        </div>,
        document.body,
    );
}

export function ToastProvider({ children }: PropsWithChildren) {
    const [toasts, setToasts] = useState<ToastState[]>([]);
    const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

    const remove = useCallback((id: string) => {
        setToasts(prev => {
            const target = prev.find(t => t.id === id);
            if (!target) return prev;
            if (target.leaving) {
                const timer = timersRef.current.get(id);
                if (timer) {
                    clearTimeout(timer);
                    timersRef.current.delete(id);
                }
                return prev.filter(t => t.id !== id);
            }
            return prev.map(t => (t.id === id ? { ...t, leaving: true } : t));
        });
    }, []);

    const dismiss = useCallback(
        (id: string) => {
            const timer = timersRef.current.get(id);
            if (timer) {
                clearTimeout(timer);
                timersRef.current.delete(id);
            }
            setToasts(prev => {
                if (!prev.find(t => t.id === id)) return prev;
                return prev.map(t => (t.id === id ? { ...t, leaving: true } : t));
            });
            setTimeout(() => {
                setToasts(prev => prev.filter(t => t.id !== id));
            }, 200);
        },
        [],
    );

    const push = useCallback(
        (input: ToastInput): string => {
            const id = nextId();
            const duration = input.duration ?? DEFAULT_DURATION;
            setToasts(prev => [...prev, { ...input, id, duration, leaving: false }]);
            timersRef.current.set(
                id,
                setTimeout(() => remove(id), duration),
            );
            return id;
        },
        [remove],
    );

    const api = useMemo<ToastApi>(
        () => ({
            success: (title, message, duration) => push({ type: "success", title, message, duration }),
            error: (title, message, duration) => push({ type: "error", title, message, duration }),
            warning: (title, message, duration) => push({ type: "warning", title, message, duration }),
            info: (title, message, duration) => push({ type: "info", title, message, duration }),
        }),
        [push],
    );

    useEffect(() => {
        const timers = timersRef.current;
        return () => {
            for (const t of timers.values()) clearTimeout(t);
            timers.clear();
        };
    }, []);

    const value = useMemo(() => ({ toast: api, dismiss }), [api, dismiss]);

    return (
        <ToastContext.Provider value={value}>
            {children}
            <ToastViewport toasts={toasts} onDismiss={dismiss} />
        </ToastContext.Provider>
    );
}
