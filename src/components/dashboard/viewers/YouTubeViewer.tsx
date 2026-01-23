/**
 * YouTube Viewer Component
 * Embeds YouTube videos for inline viewing with playlist support
 */

import React, { useState, useEffect, useCallback } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon, PlayIcon } from "@hugeicons/core-free-icons";
import { ENV } from "@/lib/env.config";

interface YouTubeViewerProps {
  url: string;
  title?: string;
}

interface PlaylistVideo {
  id: string;
  title: string;
  thumbnail: string;
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

/**
 * Extract YouTube playlist ID from URL
 */
const extractPlaylistId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const playlistId = urlObj.searchParams.get("list");
    return playlistId || null;
  } catch (error) {
    // Fallback to regex
    const match = url.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  }
};

/**
 * Fetch playlist videos using YouTube Data API v3
 * Falls back to showing first video if API key is not available
 */
const fetchPlaylistVideos = async (
  playlistId: string,
  firstVideoId: string | null
): Promise<PlaylistVideo[]> => {
  try {
    // Check if we have a YouTube API key
    const apiKey = ENV.YOUTUBE_API_KEY;

    if (!apiKey) {
      // No API key - return first video only as fallback
      if (firstVideoId) {
        return [
          {
            id: firstVideoId,
            title: "Video in Playlist",
            thumbnail: `https://img.youtube.com/vi/${firstVideoId}/mqdefault.jpg`,
          },
        ];
      }
      return [];
    }

    // Fetch playlist items using YouTube Data API v3
    const apiUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${playlistId}&key=${apiKey}`;

    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status}`);
    }

    const data = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items.map((item: any) => ({
        id: item.snippet.resourceId.videoId,
        title: item.snippet.title,
        thumbnail:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          `https://img.youtube.com/vi/${item.snippet.resourceId.videoId}/mqdefault.jpg`,
      }));
    }

    // Fallback to first video if API returns no items
    if (firstVideoId) {
      return [
        {
          id: firstVideoId,
          title: "Video in Playlist",
          thumbnail: `https://img.youtube.com/vi/${firstVideoId}/mqdefault.jpg`,
        },
      ];
    }

    return [];
  } catch (error) {
    console.error("Error fetching playlist videos:", error);
    // Fallback to first video on error
    if (firstVideoId) {
      return [
        {
          id: firstVideoId,
          title: "Video in Playlist",
          thumbnail: `https://img.youtube.com/vi/${firstVideoId}/mqdefault.jpg`,
        },
      ];
    }
    return [];
  }
};

const YouTubeViewer: React.FC<YouTubeViewerProps> = ({
  url,
  title = "YouTube Video",
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentVideoId, setCurrentVideoId] = useState<string | null>(null);
  const [playlistId, setPlaylistId] = useState<string | null>(null);
  const [playlistVideos, setPlaylistVideos] = useState<PlaylistVideo[]>([]);
  const [loadingPlaylist, setLoadingPlaylist] = useState(false);
  const [isPlaylist, setIsPlaylist] = useState(false);

  // Extract video and playlist IDs
  useEffect(() => {
    const videoId = extractYouTubeId(url);
    const plId = extractPlaylistId(url);

    setCurrentVideoId(videoId);
    setPlaylistId(plId);
    setIsPlaylist(!!plId);

    // If it's a playlist, try to fetch playlist videos
    if (plId) {
      setLoadingPlaylist(true);
      fetchPlaylistVideos(plId, videoId)
        .then((videos) => {
          setPlaylistVideos(videos);
          // If no video ID but we have playlist videos, use the first one
          if (!videoId && videos.length > 0) {
            setCurrentVideoId(videos[0].id);
          }
          setLoadingPlaylist(false);
        })
        .catch(() => {
          setLoadingPlaylist(false);
        });
    }
  }, [url]);

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const handleVideoSelect = useCallback((videoId: string) => {
    setCurrentVideoId(videoId);
    setLoading(true);
    // Force iframe reload by changing key
  }, []);

  // If we have a playlist but no video ID yet, wait for videos to load
  if (!currentVideoId && !playlistId) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg">
        <div className="text-center max-w-md px-4">
          <div className="mb-4 flex justify-center">
            <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.5} size={48} className="text-gray-500" />
          </div>
          <p className="text-lg font-medium mb-2">Invalid YouTube URL</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            The provided YouTube link could not be processed. Please check the
            URL and try again.
          </p>
        </div>
      </div>
    );
  }

  // If we have a playlist but no video ID, show loading
  if (playlistId && !currentVideoId && loadingPlaylist) {
    return (
      <div className="h-full flex items-center justify-center text-gray-500 bg-white dark:bg-gray-800 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-red-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Loading playlist...
          </p>
        </div>
      </div>
    );
  }

  // Build YouTube embed URL with optimal parameters
  // If playlist, include list parameter for playlist navigation
  const embedUrl =
    isPlaylist && playlistId && currentVideoId
      ? `https://www.youtube.com/embed/${currentVideoId}?list=${playlistId}&rel=0&modestbranding=1&enablejsapi=1`
      : currentVideoId
      ? `https://www.youtube.com/embed/${currentVideoId}?rel=0&modestbranding=1&enablejsapi=1`
      : playlistId
      ? `https://www.youtube.com/embed/videoseries?list=${playlistId}&rel=0&modestbranding=1&enablejsapi=1`
      : "";

  return (
    <div className="h-full w-full flex flex-col">
      {/* Main video player - takes up most of the space */}
      <div className="flex-1 min-h-0 bg-black rounded-lg overflow-hidden relative">
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
              <div className="mb-4 flex justify-center">
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.5} size={48} className="text-white" />
              </div>
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
        ) : embedUrl ? (
          <iframe
            key={currentVideoId || playlistId} // Force reload on video change
            src={embedUrl}
            className="w-full h-full border-0"
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            onLoad={handleLoad}
            onError={handleError}
          />
        ) : null}
      </div>

      {/* Playlist section - compact, scrollable container below */}
      {isPlaylist && playlistId && (
        <div className="flex-shrink-0 mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 dark:bg-red-900/20 rounded-md">
                <svg
                  className="w-3.5 h-3.5 text-red-600 dark:text-red-400"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
                </svg>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">
                  Playlist
                </span>
              </div>
              {playlistVideos.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {playlistVideos.length} videos
                </span>
              )}
            </div>
            <a
              href={`https://www.youtube.com/playlist?list=${playlistId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              View on YouTube
            </a>
          </div>

          {loadingPlaylist ? (
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-red-600 mx-auto mb-2"></div>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Loading...
                </p>
              </div>
            </div>
          ) : playlistVideos.length > 0 ? (
            <div className="max-h-28 overflow-x-auto overflow-y-hidden">
              <div className="flex gap-2 pb-1">
                {playlistVideos.map((video, index) => (
                  <button
                    key={video.id}
                    onClick={() => handleVideoSelect(video.id)}
                    className={`group relative flex-shrink-0 w-28 aspect-video rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700 transition-all hover:scale-105 ${
                      currentVideoId === video.id
                        ? "ring-2 ring-red-600 dark:ring-red-400 shadow-md"
                        : "hover:ring-1 hover:ring-gray-300 dark:hover:ring-gray-600"
                    }`}
                  >
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to default thumbnail
                        (
                          e.target as HTMLImageElement
                        ).src = `https://img.youtube.com/vi/${video.id}/default.jpg`;
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors flex items-center justify-center">
                      <div className="bg-red-600 rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <HugeiconsIcon icon={PlayIcon} strokeWidth={1.5} size={12} className="text-white ml-0.5" />
                      </div>
                    </div>
                    {currentVideoId === video.id && (
                      <div className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded font-semibold flex items-center gap-1">
                        <div className="w-1 h-1 bg-white rounded-full animate-pulse"></div>
                        Now
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-1.5">
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className="text-[10px] font-medium text-white/90 bg-black/50 px-1 py-0.5 rounded">
                          #{index + 1}
                        </span>
                      </div>
                      <p className="text-[10px] text-white line-clamp-1 text-left font-medium leading-tight">
                        {video.title}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                Unable to load playlist videos
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-500">
                {!ENV.YOUTUBE_API_KEY && (
                  <>Add VITE_YOUTUBE_API_KEY for full support</>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default YouTubeViewer;
