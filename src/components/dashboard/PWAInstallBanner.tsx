import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Cancel01Icon,
  Download04Icon,
  ArrowRight02Icon,
  SmartPhone01Icon,
  InformationCircleIcon,
} from "@hugeicons/core-free-icons";
import { deferredPrompt } from "../../main";
import {usePostHog} from "@posthog/react";

// ── Platform detection helpers ────────────────────────────────────────────

function getIsIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function getIsAndroid(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android/.test(navigator.userAgent);
}

function getIsStandalone(): boolean {
  if (typeof window === "undefined") return false;
  // iOS Safari
  if ("standalone" in navigator && (navigator as { standalone?: boolean }).standalone) return true;
  // Standard check
  return window.matchMedia("(display-mode: standalone)").matches;
}

function getIsSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua);
}

// ── Constants ─────────────────────────────────────────────────────────────

const DISMISS_KEY = "pwa-install-dismissed";
const DISMISS_DAYS = 7; // Re-prompt after 7 days

function isDismissed(): boolean {
  const stored = localStorage.getItem(DISMISS_KEY);
  if (!stored) return false;
  const dismissedAt = parseInt(stored, 10);
  if (isNaN(dismissedAt)) return false;
  const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
  return daysSince < DISMISS_DAYS;
}

function setDismissed(): void {
  localStorage.setItem(DISMISS_KEY, Date.now().toString());
}

// ── Component ─────────────────────────────────────────────────────────────

interface PWAInstallBannerProps {
  /** Whether to show the banner (typically: profile is complete) */
  canShow: boolean;
}

const PWAInstallBanner: React.FC<PWAInstallBannerProps> = ({ canShow }) => {
  const [visible, setVisible] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> }) | null
  >(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const postHog = usePostHog();

  const isIOS = getIsIOS();
  const isAndroid = getIsAndroid();
  const isSafari = getIsSafari();
  const isStandalone = getIsStandalone();

  // Listen for the native install prompt
  useEffect(() => {
    // Check if we already have a deferred prompt from main.tsx
    if (deferredPrompt) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setInstallPrompt(deferredPrompt as any);
      setIsInstallable(true);
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setInstallPrompt(e as any);
      setIsInstallable(true);
    };

    const handlePWAReady = () => {
      if (deferredPrompt) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        setInstallPrompt(deferredPrompt as any);
        setIsInstallable(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    window.addEventListener("pwa-ready", handlePWAReady);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
      window.removeEventListener("pwa-ready", handlePWAReady);
    };
  }, []);

  // Determine whether to display the banner
  useEffect(() => {
    if (!canShow) {
      setVisible(false);
      return;
    }
    // Don't show if already installed
    if (isStandalone) {
      setVisible(false);
      return;
    }
    // Don't show if recently dismissed
    if (isDismissed()) {
      setVisible(false);
      return;
    }
    // Show for iOS (always, since beforeinstallprompt doesn't fire)
    // Show for others only if installable
    if (isIOS || isInstallable) {
      // Small delay so it doesn't appear instantly on page load
      const timeout = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timeout);
    }
  }, [canShow, isStandalone, isIOS, isInstallable]);

  const handleDismiss = useCallback(() => {
    setDismissed();
    setVisible(false);
  }, []);

  const handleInstallChrome = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") {
      setVisible(false);
      postHog?.capture("pwa_installed");
      // Clear dismissal so the banner doesn't come back
      localStorage.removeItem(DISMISS_KEY);
    }
    setInstallPrompt(null);
    setIsInstallable(false);
  }, [installPrompt, postHog]);

  const handleShowIOSGuide = useCallback(() => {
    setShowIOSGuide((prev) => !prev);
  }, []);

  // Don't render anything if not visible
  if (!canShow) return null;

  const platformLabel = isIOS ? "iOS" : isAndroid ? "Android" : "your device";

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 80 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed bottom-20 md:bottom-4 left-0 right-0 z-50 px-3 md:px-0 md:right-4 md:left-auto md:max-w-sm"
        >
          <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
            {/* Close button */}
            <button
              onClick={handleDismiss}
              className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex items-center justify-center z-10"
              aria-label="Dismiss"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={1.5}
                size={12}
                className="text-gray-500"
              />
            </button>

            <div className="p-4 pr-10">
              {/* Header */}
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-brand/10 flex items-center justify-center">
                  {isIOS ? (
                    <HugeiconsIcon
                      icon={SmartPhone01Icon}
                      strokeWidth={1.5}
                      size={20}
                      className="text-brand"
                    />
                  ) : (
                    <HugeiconsIcon
                      icon={Download04Icon}
                      strokeWidth={1.5}
                      size={20}
                      className="text-brand"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Install UniNav
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Use it like a native app on {platformLabel} without opening your browser
                  </p>
                </div>
              </div>

              {/* iOS-specific guide */}
              <AnimatePresence>
                {isIOS && showIOSGuide && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 rounded-lg bg-gray-50 border border-gray-100 p-3 space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                          1
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          Tap the{" "}
                          <span className="inline-flex items-center">
                            <svg
                              width="14"
                              height="14"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="text-brand inline mx-0.5"
                            >
                              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                              <polyline points="16 6 12 2 8 6" />
                              <line x1="12" y1="2" x2="12" y2="15" />
                            </svg>
                          </span>{" "}
                          <strong>Share</strong> button in{" "}
                          {isSafari ? "Safari's toolbar" : "your browser"}
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                          2
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          Scroll down and tap{" "}
                          <strong>&quot;Add to Home Screen&quot;</strong>
                        </p>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand text-white text-[10px] font-bold flex items-center justify-center">
                          3
                        </span>
                        <p className="text-xs text-gray-700 leading-relaxed">
                          Tap <strong>&quot;Add&quot;</strong> to confirm
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="mt-3 flex items-center gap-2">
                {isIOS ? (
                  // iOS: Show/hide instructions
                  <button
                    onClick={handleShowIOSGuide}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand text-white text-xs font-medium rounded-lg hover:bg-brand/90 transition-colors"
                  >
                    <HugeiconsIcon
                      icon={showIOSGuide ? InformationCircleIcon : ArrowRight02Icon}
                      strokeWidth={1.5}
                      size={14}
                    />
                    {showIOSGuide ? "Got it" : "How to Install"}
                  </button>
                ) : (
                  // Android/Chrome/Desktop: Trigger native prompt
                  <button
                    onClick={handleInstallChrome}
                    disabled={!isInstallable}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand text-white text-xs font-medium rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <HugeiconsIcon
                      icon={Download04Icon}
                      strokeWidth={1.5}
                      size={14}
                    />
                    Install Now
                  </button>
                )}
                <button
                  onClick={handleDismiss}
                  className="px-3 py-2 text-xs font-medium text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Maybe Later
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallBanner;
