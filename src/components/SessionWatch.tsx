import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRentaStore } from "@/lib/rentamax/store";

export function SessionWatch() {
  const expireIfNeeded = useRentaStore((s) => s.expireIfNeeded);
  const touchSession = useRentaStore((s) => s.touchSession);
  const session = useRentaStore((s) => s.session);
  const navigate = useNavigate();

  useEffect(() => {
    if (!session) return;
    const onExpire = () => {
      if (expireIfNeeded()) {
        void navigate({ to: "/login" });
      }
    };
    onExpire();
    const id = window.setInterval(onExpire, 15000);
    const onActivity = () => touchSession();
    window.addEventListener("pointerdown", onActivity);
    window.addEventListener("keydown", onActivity);
    return () => {
      window.clearInterval(id);
      window.removeEventListener("pointerdown", onActivity);
      window.removeEventListener("keydown", onActivity);
    };
  }, [expireIfNeeded, navigate, session, touchSession]);

  return null;
}
