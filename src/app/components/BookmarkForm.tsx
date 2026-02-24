"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import React from "react";

export default function BookmarkForm() {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in!");
      setLoading(false);
      return;
    }

    const { error } = await supabase.from("bookmarks").insert([
      {
        title: title,
        url: url,
        user_id: user.id,
      },
    ]);

    if (error) {
      alert("Error saving bookmark");
      console.log(error);
    } else {
      // ✅ Clear form immediately - realtime will update the list
      setTitle("");
      setUrl("");
      // ✅ Remove the alert - it's annoying and unnecessary
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-xl rounded-2xl p-8">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
        Add New Bookmark
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input
          type="text"
          placeholder="Bookmark Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 bg-gray-50 
                     placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition duration-200"
          required
        />

        <input
          type="url"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded-xl text-gray-900 bg-gray-50 
                     placeholder-gray-400 
                     focus:outline-none focus:ring-2 focus:ring-blue-500 
                     focus:border-blue-500 transition duration-200"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium 
                     hover:bg-blue-700 active:scale-95 
                     transition duration-200 shadow-md 
                     disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? "Saving..." : "Add Bookmark"}
        </button>
      </form>
    </div>
  );
}