import React from "react";
import BookmarkForm from "../components/BookmarkForm";
import BookmarkList from "../components/BookmarkList";

export default function BookmarksPage() {
  return (
    <div className="min-h-screen bg-gray-100 p-10">
      <div className="max-w-2xl mx-auto">

        {/* Title */}
        <h1 className="text-4xl font-extrabold text-center mb-8 text-blue-700">
          📚 Bookmark Manager
        </h1>

        {/* Form Card */}
        <div className="bg-white p-6 rounded-2xl shadow-lg mb-10 border border-gray-200">
         
          <BookmarkForm />
        </div>

        {/* List Section */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          
          <BookmarkList />
        </div>

      </div>
    </div>
  );
}
