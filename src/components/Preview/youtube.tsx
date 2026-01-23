import React from "react";

type YoutubePreviewProps = {
  url: string;
  width?: number;
  height?: number;
  className?: string;
};

export const YoutubePreview: React.FC<YoutubePreviewProps> = ({
  url,
  width = 250,
  height = 150,
  className = "",
}) => {
  // Enhanced YouTube URL validation
  const isYouTubeUrl = (urlString: string): boolean => {
    try {
      const urlObj = new URL(urlString);
      return (
        urlObj.hostname === "www.youtube.com" ||
        urlObj.hostname === "youtube.com" ||
        urlObj.hostname === "youtu.be" ||
        urlObj.hostname === "m.youtube.com"
      );
    } catch {
      return false;
    }
  };

  const getYoutubeId = (youtubeUrl: string): string | null => {
    if (!isYouTubeUrl(youtubeUrl)) {
      return null;
    }

    try {
      const urlObj = new URL(youtubeUrl);

      // Handle youtu.be short URLs
      if (urlObj.hostname === "youtu.be") {
        const videoId = urlObj.pathname.slice(1).split("/")[0];
        return videoId.length === 11 ? videoId : null;
      }

      // Handle youtube.com URLs
      const videoId = urlObj.searchParams.get("v");
      return videoId && videoId.length === 11 ? videoId : null;
    } catch {
      // Fallback to regex for edge cases
      const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = youtubeUrl.match(regExp);
      return match && match[2].length === 11 ? match[2] : null;
    }
  };

  const getPlaylistId = (youtubeUrl: string): string | null => {
    if (!isYouTubeUrl(youtubeUrl)) {
      return null;
    }
    const match = youtubeUrl.match(/[?&]list=([^&]+)/);
    return match ? match[1] : null;
  };

  const videoId = getYoutubeId(url);
  const playlistId = getPlaylistId(url);
  const isPlaylist = !!playlistId;
  const isValidYouTubeUrl = isYouTubeUrl(url) && (videoId || playlistId);

  // Generate multiple thumbnail qualities for better fallback
  const thumbnailQualities = videoId
    ? [
        `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`, // Highest quality
        `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`, // High quality
        `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`, // Medium quality
        `https://img.youtube.com/vi/${videoId}/default.jpg`, // Default quality
      ]
    : [];

  const [currentThumbnailIndex, setCurrentThumbnailIndex] = React.useState(0);
  const [playlistThumbnail, setPlaylistThumbnail] = React.useState<
    string | null
  >(null);

  // Fetch playlist thumbnail from oEmbed API
  React.useEffect(() => {
    if (isPlaylist) {
      const fetchPlaylistThumbnail = async () => {
        try {
          const playlistUrl = `https://www.youtube.com/playlist?list=${playlistId}`;
          const oEmbedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(
            playlistUrl
          )}&format=json`;

          console.log("🎬 Fetching playlist thumbnail from oEmbed:", oEmbedUrl);

          const response = await fetch(oEmbedUrl);
          if (response.ok) {
            const data = await response.json();
            console.log("✅ oEmbed API Response:", data);
            console.log("🖼️ Playlist Thumbnail URL:", data.thumbnail_url);
            setPlaylistThumbnail(data.thumbnail_url);
          } else {
            console.error(
              "❌ oEmbed API failed:",
              response.status,
              response.statusText
            );
          }
        } catch (error) {
          console.error("❌ Failed to fetch playlist thumbnail:", error);
        }
      };
      fetchPlaylistThumbnail();
    }
  }, [isPlaylist, playlistId]);

  const handleImageError = () => {
    if (currentThumbnailIndex < thumbnailQualities.length - 1) {
      setCurrentThumbnailIndex((prev) => prev + 1);
    }
  };

  if (!isValidYouTubeUrl) {
    return null; // Don't render anything if it's not a valid YouTube URL
  }

  return (
    <div
      className={`rounded-xl overflow-hidden shadow-md bg-gray-100 ${className}`}
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      {thumbnailQualities.length > 0 || playlistThumbnail ? (
        <div className="relative w-full h-full">
          <img
            src={playlistThumbnail || thumbnailQualities[currentThumbnailIndex]}
            alt="YouTube Video Preview"
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={() =>
              console.log(
                `YouTube thumbnail loaded: ${
                  playlistThumbnail || thumbnailQualities[currentThumbnailIndex]
                }`
              )
            }
          />
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-red-600 rounded-full p-3 shadow-lg hover:bg-red-700 transition-colors">
              <svg
                className="w-6 h-6 text-white ml-1"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
          {/* Playlist badge */}
          {isPlaylist && (
            <div className="absolute top-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
              PLAYLIST
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-sm text-gray-500">Unable to load preview</p>
        </div>
      )}
    </div>
  );
};

// Utility function to check if URL is YouTube (can be exported for use elsewhere)
export const checkIsYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com" ||
      urlObj.hostname === "youtu.be" ||
      urlObj.hostname === "m.youtube.com"
    );
  } catch {
    return false;
  }
};
