import React, { useState, useRef, useEffect } from "react";
import {
  createBatchRunner,
  BatchRunOptions,
  BatchUpdateProgress,
} from "@/lib/batch-preview-updater";
import { MaterialTypeEnum } from "@/lib/types/material.types";

const DEFAULT_OPTIONS: BatchRunOptions = {
  replaceExisting: false,
  throttlePerMinute: 30,
  sortBy: "createdAt",
  sortOrder: "desc",
  startPage: 1,
};

const IDLE_PROGRESS: BatchUpdateProgress = {
  totalMaterials: 0,
  processed: 0,
  successful: 0,
  failed: 0,
  skipped: 0,
  rateLimitPauses: 0,
  status: "idle",
  currentTask: "Ready to start.",
  resumeInSeconds: 0,
  currentPage: 0,
  totalPages: 0,
};

const BatchPreviewUpdater: React.FC = () => {
  const [options, setOptions] = useState<BatchRunOptions>(DEFAULT_OPTIONS);
  const [progress, setProgress] = useState<BatchUpdateProgress>(IDLE_PROGRESS);
  const runnerRef = useRef(createBatchRunner());

  // Recreate runner instance on each mount so abort state is clean
  useEffect(() => {
    runnerRef.current = createBatchRunner();
  }, []);

  const isRunning = progress.status === "running" || progress.status === "paused_ratelimit";
  const isPausedUser = progress.status === "paused_user";
  const isDone = progress.status === "completed" || progress.status === "stopped" || progress.status === "error";

  const handleStart = () => {
    runnerRef.current = createBatchRunner();
    setProgress(IDLE_PROGRESS);
    runnerRef.current.run(options, setProgress);
  };

  const handlePause = () => {
    runnerRef.current.pause();
  };

  const handleResume = () => {
    runnerRef.current.resume();
  };

  const handleStop = () => {
    runnerRef.current.stop();
  };

  const handleReset = () => {
    setProgress(IDLE_PROGRESS);
  };

  const pct = progress.totalMaterials > 0
    ? Math.min(100, Math.round((progress.processed / progress.totalMaterials) * 100))
    : 0;

  const statusColor: Record<BatchUpdateProgress["status"], string> = {
    idle: "text-gray-500",
    running: "text-blue-600",
    paused_user: "text-purple-600",
    paused_ratelimit: "text-amber-600",
    completed: "text-green-600",
    stopped: "text-gray-600",
    error: "text-red-600",
  };

  const statusLabel: Record<BatchUpdateProgress["status"], string> = {
    idle: "Idle",
    running: "Running",
    paused_user: `Paused on page ${progress.currentPage}`,
    paused_ratelimit: `Rate limited — resuming in ${progress.resumeInSeconds}s`,
    completed: "Completed",
    stopped: "Stopped",
    error: "Error",
  };

  return (
    <div className="space-y-6">
      {/* ── Config ─────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Batch Preview Generator</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Scans all matching materials and generates missing (or replaces existing) preview images.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Creator ID */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Creator ID (optional)</label>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none disabled:opacity-50"
              placeholder="Paste user UUID…"
              value={options.creatorId ?? ""}
              disabled={isRunning || isPausedUser}
              onChange={(e) => setOptions((o) => ({ ...o, creatorId: e.target.value || undefined }))}
            />
          </div>

          {/* Course ID */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Course ID (optional)</label>
            <input
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none disabled:opacity-50"
              placeholder="Paste course UUID…"
              value={options.courseId ?? ""}
              disabled={isRunning || isPausedUser}
              onChange={(e) => setOptions((o) => ({ ...o, courseId: e.target.value || undefined }))}
            />
          </div>

          {/* Type filter */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Material Type</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none disabled:opacity-50"
              value={options.type ?? ""}
              disabled={isRunning || isPausedUser}
              onChange={(e) =>
                setOptions((o) => ({
                  ...o,
                  type: (e.target.value as MaterialTypeEnum) || undefined,
                }))
              }
            >
              <option value="">All (PDF + GDrive)</option>
              <option value={MaterialTypeEnum.PDF}>PDF only</option>
              <option value={MaterialTypeEnum.GDRIVE}>Google Drive only</option>
            </select>
          </div>

          {/* Sort by */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sort By</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none disabled:opacity-50"
              value={options.sortBy ?? "createdAt"}
              disabled={isRunning || isPausedUser}
              onChange={(e) =>
                setOptions((o) => ({
                  ...o,
                  sortBy: e.target.value as BatchRunOptions["sortBy"],
                }))
              }
            >
              <option value="createdAt">Created At</option>
              <option value="label">Label</option>
              <option value="downloads">Downloads</option>
            </select>
          </div>

          {/* Sort order */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">Sort Order</label>
            <select
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none disabled:opacity-50"
              value={options.sortOrder ?? "desc"}
              disabled={isRunning || isPausedUser}
              onChange={(e) =>
                setOptions((o) => ({
                  ...o,
                  sortOrder: e.target.value as BatchRunOptions["sortOrder"],
                }))
              }
            >
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </div>

          {/* Throttle */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Throttle (requests / min)
            </label>
            <input
              type="number"
              min={1}
              max={300}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none disabled:opacity-50"
              value={options.throttlePerMinute}
              disabled={isRunning || isPausedUser}
              onChange={(e) =>
                setOptions((o) => ({
                  ...o,
                  throttlePerMinute: Math.max(1, Math.min(300, Number(e.target.value) || 30)),
                }))
              }
            />
            <span className="text-[11px] text-gray-400">
              {Math.ceil(60_000 / options.throttlePerMinute / 1000)}s delay between items
            </span>
          </div>

          {/* Start page */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-gray-600">
              Start from page
            </label>
            <input
              type="number"
              min={1}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-brand/30 focus:border-brand outline-none disabled:opacity-50"
              value={options.startPage ?? 1}
              disabled={isRunning || isPausedUser}
              onChange={(e) =>
                setOptions((o) => ({
                  ...o,
                  startPage: Math.max(1, Number(e.target.value) || 1),
                }))
              }
            />
            <span className="text-[11px] text-gray-400">
              Resume from a specific page
            </span>
          </div>
        </div>

        {/* Replace toggle */}
        <div className="flex items-center justify-between rounded-lg border border-dashed border-amber-400/60 bg-amber-50 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-amber-800">Replace existing previews</p>
            <p className="text-xs text-amber-700 mt-0.5">
              When ON, overwrites materials that already have a preview URL. When OFF, only fills in missing ones.
            </p>
          </div>
          <button
            type="button"
            disabled={isRunning || isPausedUser}
            onClick={() => setOptions((o) => ({ ...o, replaceExisting: !o.replaceExisting }))}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors disabled:opacity-50 ${
              options.replaceExisting ? "bg-amber-500" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                options.replaceExisting ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 flex-wrap">
          {!isRunning && !isPausedUser && !isDone && (
            <button
              onClick={handleStart}
              className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors"
            >
              Start
            </button>
          )}
          {isRunning && (
            <>
              <button
                onClick={handlePause}
                className="px-5 py-2 bg-purple-600 text-white rounded-lg text-sm font-semibold hover:bg-purple-700 transition-colors"
              >
                Pause
              </button>
              <button
                onClick={handleStop}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            </>
          )}
          {isPausedUser && (
            <>
              <button
                onClick={handleResume}
                className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors"
              >
                Resume
              </button>
              <button
                onClick={handleStop}
                className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 transition-colors"
              >
                Stop
              </button>
            </>
          )}
          {isDone && (
            <>
              <button
                onClick={handleStart}
                className="px-5 py-2 bg-brand text-white rounded-lg text-sm font-semibold hover:bg-brand/90 transition-colors"
              >
                Run Again
              </button>
              <button
                onClick={handleReset}
                className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors"
              >
                Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Progress ───────────────────────────────────────── */}
      {progress.status !== "idle" && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          {/* Status + task */}
          <div className="flex items-center justify-between">
            <span className={`text-sm font-semibold ${statusColor[progress.status]}`}>
              {statusLabel[progress.status]}
            </span>
            <span className="text-xs text-gray-400">
              Page {progress.currentPage} / {progress.totalPages}
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs text-gray-500">
              <span>{progress.processed} processed</span>
              <span>{pct}%</span>
            </div>
            <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  progress.status === "paused_ratelimit"
                    ? "bg-amber-400"
                    : progress.status === "paused_user"
                    ? "bg-purple-400"
                    : progress.status === "completed"
                    ? "bg-green-500"
                    : progress.status === "error"
                    ? "bg-red-500"
                    : "bg-brand"
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          {/* Current task label */}
          <p className="text-xs text-gray-500 italic truncate">{progress.currentTask}</p>

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard label="Total" value={progress.totalMaterials} color="bg-gray-100 text-gray-700" />
            <StatCard label="Successful" value={progress.successful} color="bg-green-50 text-green-700" />
            <StatCard label="Failed" value={progress.failed} color="bg-red-50 text-red-700" />
            <StatCard label="Skipped" value={progress.skipped} color="bg-yellow-50 text-yellow-700" />
            <StatCard
              label="Rate Limit Pauses"
              value={progress.rateLimitPauses}
              color="bg-amber-50 text-amber-700"
            />
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: number; color: string }> = ({
  label,
  value,
  color,
}) => (
  <div className={`rounded-lg px-3 py-3 text-center ${color}`}>
    <p className="text-xl font-bold">{value}</p>
    <p className="text-[11px] font-medium mt-0.5 leading-tight">{label}</p>
  </div>
);

export default BatchPreviewUpdater;
