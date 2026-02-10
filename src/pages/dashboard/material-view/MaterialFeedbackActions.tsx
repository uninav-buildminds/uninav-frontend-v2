import React, { useState, useEffect } from "react";

const FEEDBACK_STORAGE_KEY = "material-feedback";

function getStoredFeedback(materialId: string): "like" | "dislike" | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`${FEEDBACK_STORAGE_KEY}-${materialId}`);
    if (raw === "like" || raw === "dislike") return raw;
    return null;
  } catch {
    return null;
  }
}

function setStoredFeedback(materialId: string, value: "like" | "dislike" | null) {
  try {
    if (value) localStorage.setItem(`${FEEDBACK_STORAGE_KEY}-${materialId}`, value);
    else localStorage.removeItem(`${FEEDBACK_STORAGE_KEY}-${materialId}`);
  } catch {
    // ignore
  }
}

interface MaterialFeedbackActionsProps {
  materialId: string;
  onFlag: () => void;
  onLike: () => void;
  onDislike: () => void;
  /** Placeholder until backend implements; default 0 */
  likeCount?: number;
  /** Placeholder until backend implements; default 0 */
  dislikeCount?: number;
  variant?: "compact" | "normal";
}

/** Flag icon - outline (stroke) */
function FlagOutlineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v1.5M3 21v-6m0 0 2.77-.693a9 9 0 0 1 6.208.682l.108.054a9 9 0 0 0 6.086.71l3.114-.732a48.524 48.524 0 0 1-.005-10.499l-3.11.732a9 9 0 0 1-6.085-.711l-.108-.054a9 9 0 0 0-6.208-.682L3 4.5M3 15V4.5" />
    </svg>
  );
}

/** Like - outline */
function LikeOutlineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.633 10.25c.806 0 1.533-.446 2.031-1.08a9.041 9.041 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75a.75.75 0 0 1 .75-.75 2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282m0 0h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H13.48c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23H5.904m10.598-9.75H14.25M5.904 18.5c.083.205.173.405.27.602.197.4-.078.898-.523.898h-.908c-.889 0-1.713-.518-1.972-1.368a12 12 0 0 1-.521-3.507c0-1.553.295-3.036.831-4.398C3.387 9.953 4.167 9.5 5 9.5h1.053c.472 0 .745.556.5.96a8.958 8.958 0 0 0-1.302 4.665c0 1.194.232 2.333.654 3.375Z" />
    </svg>
  );
}

/** Like - filled */
function LikeFilledIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M7.493 18.5c-.425 0-.82-.236-.975-.632A7.48 7.48 0 0 1 6 15.125c0-1.75.599-3.358 1.602-4.634.151-.192.373-.309.6-.397.473-.183.89-.514 1.212-.924a9.042 9.042 0 0 1 2.861-2.4c.723-.384 1.35-.956 1.653-1.715a4.498 4.498 0 0 0 .322-1.672V2.75A.75.75 0 0 1 15 2a2.25 2.25 0 0 1 2.25 2.25c0 1.152-.26 2.243-.723 3.218-.266.558.107 1.282.725 1.282h3.126c1.026 0 1.945.694 2.054 1.715.045.422.068.85.068 1.285a11.95 11.95 0 0 1-2.649 7.521c-.388.482-.987.729-1.605.729H14.23c-.483 0-.964-.078-1.423-.23l-3.114-1.04a4.501 4.501 0 0 0-1.423-.23h-.777ZM2.331 10.727a11.969 11.969 0 0 0-.831 4.398 12 12 0 0 0 .52 3.507C2.28 19.482 3.105 20 3.994 20H4.9c.445 0 .72-.498.523-.898a8.963 8.963 0 0 1-.924-3.977c0-1.708.476-3.305 1.302-4.666.245-.403-.028-.959-.5-.959H4.25c-.832 0-1.612.453-1.918 1.227Z" />
    </svg>
  );
}

/** Dislike - outline */
function DislikeOutlineIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.498 15.25H4.372c-1.026 0-1.945-.694-2.054-1.715a12.137 12.137 0 0 1-.068-1.285c0-2.848.992-5.464 2.649-7.521C5.287 4.247 5.886 4 6.504 4h4.016a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23h1.294M7.498 15.25c.618 0 .991.724.725 1.282A7.471 7.471 0 0 0 7.5 19.75 2.25 2.25 0 0 0 9.75 22a.75.75 0 0 0 .75-.75v-.633c0-.573.11-1.14.322-1.672.304-.76.93-1.33 1.653-1.715a9.04 9.04 0 0 0 2.86-2.4c.498-.634 1.226-1.08 2.032-1.08h.384m-10.253 1.5H9.7m8.075-9.75c.01.05.027.1.05.148.593 1.2.925 2.55.925 3.977 0 1.487-.36 2.89-.999 4.125m.023-8.25c-.076-.365.183-.75.575-.75h.908c.889 0 1.713.518 1.972 1.368.339 1.11.521 2.287.521 3.507 0 1.553-.295 3.036-.831 4.398-.306.774-1.086 1.227-1.918 1.227h-1.053c-.472 0-.745-.556-.5-.96a8.95 8.95 0 0 0 .303-.54" />
    </svg>
  );
}

/** Dislike - filled */
function DislikeFilledIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M15.73 5.5h1.035A7.465 7.465 0 0 1 18 9.625a7.465 7.465 0 0 1-1.235 4.125h-.148c-.806 0-1.534.446-2.031 1.08a9.04 9.04 0 0 1-2.861 2.4c-.723.384-1.35.956-1.653 1.715a4.499 4.499 0 0 0-.322 1.672v.633A.75.75 0 0 1 9 22a2.25 2.25 0 0 1-2.25-2.25c0-1.152.26-2.243.723-3.218.266-.558-.107-1.282-.725-1.282H3.622c-1.026 0-1.945-.694-2.054-1.715A12.137 12.137 0 0 1 1.5 12.25c0-2.848.992-5.464 2.649-7.521C4.537 4.247 5.136 4 5.754 4H9.77a4.5 4.5 0 0 1 1.423.23l3.114 1.04a4.5 4.5 0 0 0 1.423.23ZM21.669 14.023c.536-1.362.831-2.845.831-4.398 0-1.22-.182-2.398-.52-3.507-.26-.85-1.084-1.368-1.973-1.368H19.1c-.445 0-.72.498-.523.898.591 1.2.924 2.55.924 3.977a8.958 8.958 0 0 1-1.302 4.666c-.245.403.028.959.5.959h1.053c.832 0 1.612-.453 1.918-1.227Z" />
    </svg>
  );
}

const MaterialFeedbackActions: React.FC<MaterialFeedbackActionsProps> = ({
  materialId,
  onFlag,
  onLike,
  onDislike,
  likeCount = 0,
  dislikeCount = 0,
  variant = "compact",
}) => {
  const [feedback, setFeedback] = useState<"like" | "dislike" | null>(() => getStoredFeedback(materialId));
  const padding = variant === "compact" ? "p-1.5" : "p-2";
  const iconClass = "size-5";
  const textSize = variant === "compact" ? "text-[10px]" : "text-xs";

  useEffect(() => {
    setFeedback(getStoredFeedback(materialId));
  }, [materialId]);

  const handleLike = () => {
    const next = feedback === "like" ? null : "like";
    setFeedback(next);
    setStoredFeedback(materialId, next);
    onLike();
  };

  const handleDislike = () => {
    const next = feedback === "dislike" ? null : "dislike";
    setFeedback(next);
    setStoredFeedback(materialId, next);
    onDislike();
  };

  return (
    <div
      className={`flex items-center justify-between gap-2 pt-2 mt-2 border-t border-gray-100 ${
        variant === "normal" ? "gap-2 pt-3 mt-3 border-gray-200" : "gap-1"
      }`}
    >
      <button
        type="button"
        onClick={onFlag}
        className={`${padding} text-gray-500 hover:text-brand hover:bg-brand/10 rounded-md transition-colors outline-none focus:ring-0 flex flex-col items-center gap-0.5`}
        aria-label="Report material"
      >
        <FlagOutlineIcon className={iconClass} />
      </button>
      <button
        type="button"
        onClick={handleLike}
        className={`${padding} text-gray-500 hover:text-brand hover:bg-brand/10 rounded-md transition-colors outline-none focus:ring-0 flex flex-col items-center gap-0.5 ${feedback === "like" ? "text-brand" : ""}`}
        aria-label="Like"
      >
        {feedback === "like" ? (
          <LikeFilledIcon className={iconClass} />
        ) : (
          <LikeOutlineIcon className={iconClass} />
        )}
        <span className={`${textSize} font-medium text-gray-600 tabular-nums`}>{likeCount}</span>
      </button>
      <button
        type="button"
        onClick={handleDislike}
        className={`${padding} text-gray-500 hover:text-brand hover:bg-brand/10 rounded-md transition-colors outline-none focus:ring-0 flex flex-col items-center gap-0.5 ${feedback === "dislike" ? "text-brand" : ""}`}
        aria-label="Dislike"
      >
        {feedback === "dislike" ? (
          <DislikeFilledIcon className={iconClass} />
        ) : (
          <DislikeOutlineIcon className={iconClass} />
        )}
        <span className={`${textSize} font-medium text-gray-600 tabular-nums`}>{dislikeCount}</span>
      </button>
    </div>
  );
};

export default MaterialFeedbackActions;
