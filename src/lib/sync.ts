"use client";

import { useEffect } from "react";
import { supabase } from "./supabase";

const SYNC_CHANNEL_NAME = "lifeos-cloud-sync";

// Web BroadcastChannel for instant same-browser cross-tab sync
let localBroadcast: BroadcastChannel | null = null;
if (typeof window !== "undefined" && "BroadcastChannel" in window) {
  localBroadcast = new BroadcastChannel(SYNC_CHANNEL_NAME);
}

/**
 * Broadcast an update event to all other open tabs and devices
 */
export function broadcastDataChange(entity: string, action: "create" | "update" | "delete", userId?: string) {
  if (typeof window === "undefined") return;

  const payload = { entity, action, userId, timestamp: Date.now() };

  // 1. Same-device cross-tab broadcast
  if (localBroadcast) {
    try {
      localBroadcast.postMessage(payload);
    } catch (e) {
      console.warn("Local broadcast error", e);
    }
  }

  // 2. Cross-device cloud broadcast via Supabase Realtime
  if (userId) {
    try {
      const channel = supabase.channel(`user-sync:${userId}`);
      channel.send({
        type: "broadcast",
        event: "sync",
        payload,
      });
    } catch (e) {
      console.warn("Supabase Realtime broadcast error", e);
    }
  }

  // 3. Dispatch local window event
  window.dispatchEvent(new CustomEvent("lifeos:data-changed", { detail: payload }));
}

/**
 * React Hook to subscribe to real-time sync updates across devices & tabs
 */
export function useRealtimeSync(userId: string | undefined, onSync: (entity?: string) => void) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Listen for local window events
    const handleLocalEvent = (e: any) => {
      onSync(e.detail?.entity);
    };
    window.addEventListener("lifeos:data-changed", handleLocalEvent);

    // 2. Listen for same-device cross-tab messages
    const handleTabMessage = (e: MessageEvent) => {
      onSync(e.data?.entity);
    };
    if (localBroadcast) {
      localBroadcast.addEventListener("message", handleTabMessage);
    }

    // 3. Listen for cross-device cloud sync events via Supabase Realtime
    let supabaseChannel: any = null;
    if (userId) {
      try {
        supabaseChannel = supabase
          .channel(`user-sync:${userId}`)
          .on("broadcast", { event: "sync" }, (data: any) => {
            onSync(data.payload?.entity);
          })
          .subscribe();
      } catch (e) {
        console.warn("Supabase Realtime subscription error", e);
      }
    }

    return () => {
      window.removeEventListener("lifeos:data-changed", handleLocalEvent);
      if (localBroadcast) {
        localBroadcast.removeEventListener("message", handleTabMessage);
      }
      if (supabaseChannel) {
        supabase.removeChannel(supabaseChannel);
      }
    };
  }, [userId, onSync]);
}
