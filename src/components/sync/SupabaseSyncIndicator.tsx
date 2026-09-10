"use client";

import React, { useState, useEffect } from "react";
import { Cloud, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function SupabaseSyncIndicator({
  userId,
  onRemoteChange,
}: {
  userId?: string;
  onRemoteChange?: (payload: any) => void;
}) {
  const [synced, setSynced] = useState(true);
  const [lastSyncText, setLastSyncText] = useState("Vừa xong");

  useEffect(() => {
    if (!userId) return;

    // Listen to Realtime changes for this specific user only
    const channel = supabase
      .channel(`user-sync-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setSynced(false);
          setLastSyncText("Đã đồng bộ từ thiết bị khác");
          if (onRemoteChange) onRemoteChange(payload);
          setTimeout(() => setSynced(true), 2000);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "finance_transactions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setSynced(false);
          setLastSyncText("Dữ liệu tài chính vừa cập nhật");
          if (onRemoteChange) onRemoteChange(payload);
          setTimeout(() => setSynced(true), 2000);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, onRemoteChange]);

  return (
    <div
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-medium text-emerald-400"
      title="Dữ liệu được lưu trữ trên Supabase Cloud và tự động đồng bộ trên mọi thiết bị"
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <Cloud className="w-3 h-3" />
      <span className="hidden sm:inline">Supabase Cloud: Đồng bộ</span>
    </div>
  );
}
