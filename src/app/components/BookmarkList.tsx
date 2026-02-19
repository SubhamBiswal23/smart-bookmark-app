"use client";

import { useEffect, useState, useCallback } from "react";
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

  // ✅ Fetch Bookmarks (stable function)
  const fetchBookmarks = useCallback(async (uid: string) => {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", uid)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Fetch error:", error.message);
      return;
    }

    if (data) {
      setBookmarks(data);
    }
  }, []);

  // ✅ Get Logged-in User
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUserId(data.user.id);
        fetchBookmarks(data.user.id);
      }
    };

    getUser();
  }, [fetchBookmarks]);

  // ✅ Delete Bookmark
  const handleDelete = async (id: number) => {
    const confirmDelete = confirm(
      "Are you sure you want to delete this bookmark?"
    );
    if (!confirmDelete) return;

    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Delete error:", error.message);
      return;
    }

    // Instant UI update in same tab
    setBookmarks((prev) =>
      prev.filter((bookmark) => bookmark.id !== id)
    );
  };

  // ✅ Real-time Subscription
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel("realtime-bookmarks")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "bookmarks",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log("Realtime event:", payload);
          fetchBookmarks(userId);
        }
      )
      .subscribe((status) => {
        console.log("Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchBookmarks]);

  return (
    <div className="max-w-3xl mx-auto mt-12 px-4">
      <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">
        My Bookmarks
      </h2>

      {bookmarks.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <p className="text-gray-600 text-lg">No bookmarks yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Start saving useful links to see them here.
          </p>
        </div>
      ) : (
        <ul className="space-y-6">
          {bookmarks.map((bookmark) => (
            <li
              key={bookmark.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 
                         hover:shadow-xl transition duration-300 
                         flex justify-between items-start"
            >
              <div className="flex flex-col space-y-2">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xl font-semibold text-gray-800 
                             hover:text-blue-600 transition"
                >
                  {bookmark.title}
                </a>

                <p className="text-sm text-gray-500 break-all">
                  {bookmark.url}
                </p>

                <p className="text-xs text-gray-400">
                  Added on{" "}
                  {new Date(bookmark.created_at).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => handleDelete(bookmark.id)}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-xl 
                           hover:bg-red-100 transition 
                           text-sm font-medium"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
