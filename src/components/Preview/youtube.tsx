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

    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = youtubeUrl.match(regExp);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const videoId = getYoutubeId(url);
  const isValidYouTubeUrl = isYouTubeUrl(url) && videoId;

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
      {thumbnailQualities.length > 0 ? (
        <div className="relative w-full h-full">
          <img
            src={thumbnailQualities[currentThumbnailIndex]}
            alt="YouTube Video Preview"
            className="w-full h-full object-cover"
            onError={handleImageError}
            onLoad={() =>
              console.log(
                `YouTube thumbnail loaded: ${thumbnailQualities[currentThumbnailIndex]}`
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
