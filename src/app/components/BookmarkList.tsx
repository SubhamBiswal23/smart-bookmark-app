"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";

interface Bookmark {
  id: number;
  url: string;
  title: string;
  created_at: string;
}

export default function BookmarkList() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  // ✅ Fetch Bookmarks
  const fetchBookmarks = async (uid: string) => {
    console.log("📥 Fetching bookmarks for user:", uid);
    
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Fetch error:", error.message);
      return;
    }

    if (data) {
      console.log("✅ Fetched bookmarks:", data.length);
      setBookmarks(data);
    }
  };

  // ✅ Get Logged-in User
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        console.log("👤 User ID:", data.user.id);
        setUserId(data.user.id);
        fetchBookmarks(data.user.id);
      }
    };

    getUser();
  }, []);

  // ✅ Delete Bookmark
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this bookmark?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase.from("bookmarks").delete().eq("id", id);

    if (error) {
      console.error("❌ Delete error:", error.message);
      return;
    }

    console.log("🗑️ Deleted bookmark ID:", id);
    // Realtime will handle the update, but we can update locally too for instant feedback
    setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
  };

  // ✅ Real-time Subscription
  useEffect(() => {
    if (!userId) {
      console.log("⏳ Waiting for userId...");
      return;
    }

    console.log("🔄 Setting up realtime subscription for user:", userId);

    const channel = supabase
      .channel("public:bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("🔔 Realtime event:", payload.eventType, payload);
          
          // Refetch bookmarks on