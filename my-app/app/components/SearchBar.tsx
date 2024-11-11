"use client";

import { scrapeAndStoreProduct } from "@/app/lib/actions";
import { FormEvent, useState } from "react";

const isValidAmazonUrl = (url: string) => {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname.toLowerCase();
    if (
      hostname.includes("amazon.com") ||
      hostname.includes("amazon.") ||
      hostname.endsWith("amazon")
    ) {
      return true;
    }
  } catch (error) {
    return false;
  }
  return false;
};

const SearchBar = () => {
  const [searchPrompt, setSearchPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(""); // State to manage error message

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const valid = isValidAmazonUrl(searchPrompt);
    if (!valid) {
      setError("Please enter a valid Amazon product link.");

      // Shake animation effect on input box
      const inputBox = document.querySelector(".searchbar-input");
      if (inputBox) {
        inputBox.classList.add("animate-shake");
        setTimeout(() => {
          inputBox.classList.remove("animate-shake");
        }, 2000); // Remove shake animation after 500ms
      }
      return;
    }

    // Clear error if valid and proceed with submission logic
    setError("");

    try {
      setLoading(true);
      // Perform scraping or other logic here
      const product=await scrapeAndStoreProduct(searchPrompt);
    } catch (error) {
      // Handle error if needed
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="flex flex-wrap items-center gap-4 mt-12" onSubmit={handleSubmit}>
      <div className="relative flex items-center w-full">
        <input
          type="text"
          value={searchPrompt}
          onChange={(e) => setSearchPrompt(e.target.value)}
          placeholder="Enter the product link"
          className={`searchbar-input ${error ? "border-red-500" : ""}`}
        />
        <button
          type="submit"
          disabled={!searchPrompt}
          className="searchbar-btn ml-2"
        >
          <span className="text-primary">
            {loading ? "Searching..." : "Search"}
          </span>
        </button>
      </div>
      {error && (
        <p className="text-red-500 text-sm mt-1 ml-2">
          {error}
        </p>
      )}
    </form>
  );
};

export default SearchBar;