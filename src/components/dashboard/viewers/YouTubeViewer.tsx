/**
 * YouTube Viewer Component
 * Embeds YouTube videos for inline viewing
 */

import React, { useState } from "react";

interface YouTubeViewerProps {
  url: string;
  title?: string;
}

/**
 * Extract YouTube video ID from various URL formats
 */
const extractYouTubeId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Handle youtu.be short links
    if (hostname === "youtu.be") {
      return urlObj.pathname.slice(1).split("?")[0];
    }

    // Handle youtube.com and www.youtube.com
    if (hostname.includes("youtube.com")) {
      // Handle /watch?v=VIDEO_ID format
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return videoId;
      }

      // Handle /embed/VIDEO_ID format
      if (urlObj.pathname.includes("/embed/")) {
        return urlObj.pathname.split("/embed/")[1].split("?")[0];
      }

      // Handle /v/VIDEO_ID format
      if (urlObj.pathname.includes("/v/")) {
        return urlObj.pathname.split("/v/")[1].split("?")[0];
      }
    }

    return null;
  } catch (error) {
    console.error("Error parsing YouTube URL:", error);
    return null;
  }
};

const YouTubeViewer: React.FC<YouTubeViewerProps> = ({
  url,
  title = "YouTube Video",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const videoId = extractYouTubeId(url);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  if (!videoId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-white rounded-lg">
        <div className="text-center max-w-md px-4">
          <div className="text-4xl mb-4">⚠️</div>
          <p className="text-lg font-medium mb-2">Invalid YouTube URL</p>
          <p className="text-sm text-gray-600">
            The provided YouTube link could not be processed. Please check the
            URL and try again.
          </p>
        </div>
      </div>
    );
  }

  // Build YouTube embed URL with optimal parameters
  const embedUrl = `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1&enablejsapi=1`;

  return (
    <div className="h-full w-full bg-black rounded-lg overflow-hidden relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-white border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-white">Loading video...</p>
          </div>
        </div>
      )}

      {error ? (
        <div className="h-full flex items-center justify-center text-white">
          <div className="text-center max-w-md px-4">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-lg font-medium mb-2">Failed to load video</p>
            <p className="text-sm opacity-80 mb-4">
              The video could not be displayed. It may be private, deleted, or
              restricted in your region.
            </p>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
            >
              Open on YouTube
            </a>
          </div>
        </div>
      ) : (
        <iframe
          src={embedUrl}
          className="w-full h-full border-0"
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleLoad}
          onError={handleError}
        />
      )}
    </div>
  );
};

export default YouTubeViewer;
