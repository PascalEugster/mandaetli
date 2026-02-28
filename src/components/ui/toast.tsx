"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ToastMessage = {
	id: number;
	text: string;
};

let toastId = 0;
let addToastFn: ((text: string) => void) | null = null;

export function toast(text: string) {
	addToastFn?.(text);
}

export function Toaster() {
	const [toasts, setToasts] = useState<ToastMessage[]>([]);
	const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

	const addToast = useCallback((text: string) => {
		const id = ++toastId;
		setToasts((prev) => [...prev, { id, text }]);
		const timer = setTimeout(() => {
			setToasts((prev) => prev.filter((t) => t.id !== id));
			timers.current.delete(id);
		}, 2000);
		timers.current.set(id, timer);
	}, []);

	useEffect(() => {
		addToastFn = addToast;
		return () => {
			addToastFn = null;
		};
	}, [addToast]);

	useEffect(() => {
		return () => {
			for (const timer of timers.current.values()) {
				clearTimeout(timer);
			}
		};
	}, []);

	if (toasts.length === 0) return null;

	return (
		<div className="fixed bottom-6 left-1/2 z-[100] flex -translate-x-1/2 flex-col gap-2">
			{toasts.map((t) => (
				<div
					key={t.id}
					className="animate-in fade-in slide-in-from-bottom-2 rounded-lg border border-border-subtle bg-surface-2 px-4 py-2 text-sm text-text-primary shadow-lg"
				>
					{t.text}
				</div>
			))}
		</div>
	);
}
