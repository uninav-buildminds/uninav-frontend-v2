/**
 * PowerPoint Viewer (Office Online Viewer)
 * Mirrors the clean layout of existing viewers (PDF/GDrive) with a loader and error fallback.
 * Accepts a public or pre-signed URL to a PPT/PPTX file via `url`.
 */

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert02Icon } from "@hugeicons/core-free-icons";

interface PowerPointViewerProps {
  url: string; // Direct, publicly reachable or pre-signed HTTPS URL to .ppt or .pptx
  title?: string;
}

const PowerPointViewer: React.FC<PowerPointViewerProps> = ({
  url,
  title = "PowerPoint",
}) => {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(false);

  // Office Online embed requires the src document URL to be URL-encoded
  const encodedSrc = encodeURIComponent(url);
  const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodedSrc}`;

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  return (
    <div className="h-full w-full bg-white">
      <div className="h-full w-full relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-3 border-brand border-t-transparent mx-auto mb-3"></div>
              <p className="text-sm text-gray-600">Loading presentation...</p>
            </div>
          </div>
        )}

        {error ? (
          <div className="h-full flex items-center justify-center text-gray-500">
            <div className="text-center max-w-md">
              <div className="mb-4 flex justify-center">
                <HugeiconsIcon icon={Alert02Icon} strokeWidth={1.5} size={48} className="text-gray-500" />
              </div>
              <p className="text-lg font-medium mb-2">
                Failed to load presentation
              </p>
              <p className="text-sm text-gray-600">
                Ensure the file URL is publicly accessible or a valid pre-signed
                link.
              </p>
            </div>
          </div>
        ) : (
          <iframe
            src={officeViewerUrl}
            className="w-full h-full border-0"
            title={title}
            onLoad={handleLoad}
            onError={handleError}
            allowFullScreen
          />
        )}
      </div>
    </div>
  );
};

export default PowerPointViewer;
