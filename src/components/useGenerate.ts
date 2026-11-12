"use client";

import { useCallback, useRef, useState } from "react";
import type { ToolId } from "@/lib/tools";

interface State<T> {
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  result: T | null;
}

/** Calls our own server route (never the AI provider directly) and tracks loading/error state. */
export function useGenerate<T>(tool: ToolId) {
  const [state, setState] = useState<State<T>>({
    loading: false,
    error: null,
    fieldErrors: {},
    result: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(
    async (input: unknown): Promise<T | null> => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      setState((s) => ({ ...s, loading: true, error: null, fieldErrors: {} }));
      try {
        const res = await fetch(`/api/generate/${tool}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setState((s) => ({
            ...s,
            loading: false,
            error: data.error || `Request failed (${res.status}). Please try again.`,
            fieldErrors: data.fields || {},
          }));
          return null;
        }
        setState({ loading: false, error: null, fieldErrors: {}, result: data.result as T });
        return data.result as T;
      } catch (err) {
        if ((err as Error).name === "AbortError") return null;
        setState((s) => ({
          ...s,
          loading: false,
          error: "Could not connect. Please check your internet connection and try again.",
        }));
        return null;
      }
    },
    [tool],
  );

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setState({ loading: false, error: null, fieldErrors: {}, result: null });
  }, []);

  const setFieldErrors = useCallback((fieldErrors: Record<string, string>) => {
    setState((s) => ({ ...s, fieldErrors, error: Object.keys(fieldErrors).length ? "Please fix the highlighted fields." : null }));
  }, []);

  return { ...state, generate, reset, setFieldErrors };
}
