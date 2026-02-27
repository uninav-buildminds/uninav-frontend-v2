import React, { useState } from "react";
import {
  runBatchPreviewUpdate,
  BatchUpdateProgress,
  BatchSearchOptions,
} from "@/lib/batch-preview-updater";
import { Button } from "@/components/ui/button";
import { RocketIcon } from "lucide-react";

const BatchPreviewUpdater: React.FC = () => {
  const [progress, setProgress] = useState<BatchUpdateProgress>({
    totalPages: 0,
    currentPage: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    skipped: 0,
    totalToProcess: 0,
    status: "idle",
    currentTask: "Ready to start.",
  });

  const [options, setOptions] = useState<BatchSearchOptions>({
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const handleStartUpdate = () => {
    runBatchPreviewUpdate(setProgress, options);
  };

  const isRunning = progress.status === "running";

  return (
    <div className="p-4 border rounded-lg bg-gray-50">
      <h3 className="text-lg font-semibold mb-2">Batch Preview Updater Tool</h3>
      <p className="text-sm text-gray-600 mb-4">
        This tool will scan all existing PDF and Google Drive materials and
        generate missing preview images. This process can take a long time.
      </p>

      <div className="flex flex-wrap gap-4 mb-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Sort By</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={options.sortBy ?? "createdAt"}
            disabled={isRunning}
            onChange={(e) =>
              setOptions((o) => ({
                ...o,
                sortBy: e.target.value as BatchSearchOptions["sortBy"],
              }))
            }
          >
            <option value="createdAt">Created At</option>
            <option value="label">Label</option>
            <option value="downloads">Downloads</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Sort Order</label>
          <select
            className="border rounded px-2 py-1 text-sm bg-white"
            value={options.sortOrder ?? "desc"}
            disabled={isRunning}
            onChange={(e) =>
              setOptions((o) => ({
                ...o,
                sortOrder: e.target.value as BatchSearchOptions["sortOrder"],
              }))
            }
          >
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Creator ID (optional)</label>
          <input
            className="border rounded px-2 py-1 text-sm bg-white"
            placeholder="e.g. user-uuid"
            value={options.creatorId ?? ""}
            disabled={isRunning}
            onChange={(e) =>
              setOptions((o) => ({
                ...o,
                creatorId: e.target.value || undefined,
              }))
            }
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-600">Course ID (optional)</label>
          <input
            className="border rounded px-2 py-1 text-sm bg-white"
            placeholder="e.g. course-uuid"
            value={options.courseId ?? ""}
            disabled={isRunning}
            onChange={(e) =>
              setOptions((o) => ({
                ...o,
                courseId: e.target.value || undefined,
              }))
            }
          />
        </div>
      </div>

      <Button onClick={handleStartUpdate} disabled={isRunning} className="mb-4">
        {isRunning ? (
          <>
            <RocketIcon className="mr-2 h-4 w-4 animate-pulse" />
            Updating in Progress...
          </>
        ) : (
          "Start Missing Previews Update"
        )}
      </Button>

      {progress.status !== "idle" && (
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
            <span className="font-medium text-gray-700">Status:</span>
            <span
              className={`font-semibold ${
                progress.status === "completed"
                  ? "text-green-600"
                  : progress.status === "error"
                  ? "text-red-600"
                  : "text-blue-600"
              }`}
            >
              {progress.status.charAt(0).toUpperCase() +
                progress.status.slice(1)}
            </span>
          </div>

          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block text-blue-600">
                  Page {progress.currentPage} of {progress.totalPages}
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-blue-600">
                  {Math.round(
                    (progress.processed / (progress.totalToProcess || 1)) * 100
                  )}
                  %
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-200">
              <div
                style={{
                  width: `${
                    (progress.processed / (progress.totalToProcess || 1)) * 100
                  }%`,
                }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500 transition-all duration-500"
              ></div>
            </div>
          </div>

          <p className="text-gray-600 italic h-4">{progress.currentTask}</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center">
            <div className="p-2 bg-green-100 rounded">
              <p className="font-bold text-green-700">{progress.successful}</p>
              <p className="text-xs text-green-600">Successful</p>
            </div>
            <div className="p-2 bg-red-100 rounded">
              <p className="font-bold text-red-700">{progress.failed}</p>
              <p className="text-xs text-red-600">Failed</p>
            </div>
            <div className="p-2 bg-yellow-100 rounded">
              <p className="font-bold text-yellow-700">{progress.skipped}</p>
              <p className="text-xs text-yellow-600">Skipped</p>
            </div>
            <div className="p-2 bg-gray-200 rounded">
              <p className="font-bold text-gray-700">{progress.processed}</p>
              <p className="text-xs text-gray-600">Total Processed</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BatchPreviewUpdater;
