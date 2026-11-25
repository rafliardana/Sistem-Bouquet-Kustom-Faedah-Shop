// Menjalankan callback secara berkala HANYA saat layar sedang fokus
// dan aplikasi berada di foreground. Dipakai pelacak pesanan agar status
// terasa real-time tanpa WebSocket, sekaligus hemat baterai & kuota.
import { useCallback, useEffect, useRef } from "react";
import { AppState } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

export function usePolling(callback: () => void | Promise<void>, intervalMs = 10000) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);

  useFocusEffect(
    useCallback(() => {
      saved.current(); // muat segera saat layar dibuka
      let timer: ReturnType<typeof setInterval> | null = setInterval(() => saved.current(), intervalMs);

      const sub = AppState.addEventListener("change", (state) => {
        if (state === "active") {
          saved.current();
          if (!timer) timer = setInterval(() => saved.current(), intervalMs);
        } else if (timer) {
          clearInterval(timer);
          timer = null;
        }
      });

      return () => {
        if (timer) clearInterval(timer);
        sub.remove();
      };
    }, [intervalMs]),
  );
}
