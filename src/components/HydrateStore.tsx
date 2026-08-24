import { useEffect } from "react";
import { useRentaStore } from "@/lib/rentamax/store";

export function HydrateStore() {
  const setHydrated = useRentaStore((s) => s.setHydrated);

  useEffect(() => {
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      useRentaStore.getState().expireIfNeeded();
      setHydrated();
    };
    const unsub = useRentaStore.persist.onFinishHydration(finish);
    void useRentaStore.persist.rehydrate().then(finish);
    return () => {
      unsub();
    };
  }, [setHydrated]);

  return null;
}

export function ScreenLoader({ label = "Cargando RentaMax…" }: { label?: string }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-canvas text-ink">
      <div className="size-10 animate-pulse rounded-xl bg-brand" />
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}
