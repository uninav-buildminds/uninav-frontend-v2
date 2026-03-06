import {
  searchMaterials,
  getDownloadUrl,
  getMaterialById,
} from "@/api/materials.api";
import { httpClient } from "@/api/api";
import { MaterialTypeEnum } from "@/lib/types/material.types";
import { generatePdfPreviewBlob } from "@/components/Preview/PdfPreviewer";
import {
  extractGDriveId,
  generateGDrivePreviewBlob,
  listFolderFiles,
} from "@/lib/gdrive-preview";

export interface BatchRunOptions {
  // Filters
  creatorId?: string;
  courseId?: string;
  type?: MaterialTypeEnum;
  sortBy?: "createdAt" | "label" | "downloads";
  sortOrder?: "asc" | "desc";
  reviewStatus?: string;

  // Behaviour
  replaceExisting: boolean;   // false = skip materials that already have a previewUrl
  throttlePerMinute: number;  // default 30
  startPage: number;          // default 1 — lets you resume from a specific page
}

export interface BatchUpdateProgress {
  // Scope
  totalMaterials: number;

  // Counters
  processed: number;
  successful: number;
  failed: number;
  skipped: number;
  rateLimitPauses: number;

  // State
  status: "idle" | "running" | "paused_user" | "paused_ratelimit" | "completed" | "stopped" | "error";
  currentTask: string;
  resumeInSeconds: number; // >0 during rate-limit countdown
  currentPage: number;
  totalPages: number;
}

const ROOT_API_KEY = "DKDddEK3K39SFfadfdfKDF$%$@#$#$@#$#@$#22";

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

async function uploadPreviewWithRootKey(materialId: string, blob: Blob): Promise<void> {
  const file = new File([blob], "preview.jpg", { type: "image/jpeg" });
  const formData = new FormData();
  formData.append("preview", file, "preview.jpg");
  await httpClient.post(`/materials/preview/upload/${materialId}`, formData, {
    headers: { "X-Root-API-Key": ROOT_API_KEY },
  });
}

function isRateLimitError(err: unknown): boolean {
  if (!err) return false;
  const msg = String((err as any)?.message || err).toLowerCase();
  return (
    msg.includes("rate limit") ||
    msg.includes("429") ||
    msg.includes("403") ||
    msg.includes("all api keys exhausted") ||
    msg.includes("quota")
  );
}

// A resolvable promise used for user-initiated pause/resume
function createGate() {
  let resolve!: () => void;
  let promise: Promise<void> = Promise.resolve(); // starts open
  let locked = false;

  return {
    lock() {
      if (locked) return;
      locked = true;
      promise = new Promise<void>((r) => { resolve = r; });
    },
    unlock() {
      if (!locked) return;
      locked = false;
      resolve?.();
    },
    get locked() { return locked; },
    wait() { return promise; },
  };
}

export function createBatchRunner() {
  let abortController: AbortController | null = null;
  const gate = createGate();

  async function run(
    options: BatchRunOptions,
    onProgress: (p: BatchUpdateProgress) => void
  ): Promise<void> {
    abortController = new AbortController();
    const signal = abortController.signal;
    gate.unlock(); // ensure gate is open when a new run starts

    const delayPerItem = Math.ceil(60_000 / options.throttlePerMinute);
    const startPage = Math.max(1, options.startPage ?? 1);

    const progress: BatchUpdateProgress = {
      totalMaterials: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      skipped: 0,
      rateLimitPauses: 0,
      status: "running",
      currentTask: "Starting…",
      resumeInSeconds: 0,
      currentPage: startPage,
      totalPages: 0,
    };

    const emit = () => onProgress({ ...progress });

    // Checkpoint: awaits the gate (user pause) and checks abort signal.
    // Returns true if execution should stop.
    async function checkpoint(): Promise<boolean> {
      if (signal.aborted) return true;
      if (gate.locked) {
        progress.status = "paused_user";
        progress.currentTask = `⏸ Paused on page ${progress.currentPage} — click Resume to continue`;
        emit();
        await gate.wait();
        if (signal.aborted) return true;
        progress.status = "running";
        emit();
      }
      return false;
    }

    emit();

    const searchOpts = {
      creatorId: options.creatorId,
      courseId: options.courseId,
      type: options.type,
      sortBy: options.sortBy ?? "createdAt",
      sortOrder: options.sortOrder ?? "desc",
      reviewStatus: options.reviewStatus,
      ignorePreference: true,
    };

    try {
      progress.currentTask = "Fetching material count…";
      emit();

      const initial = await searchMaterials({ page: startPage, limit: 50, ...searchOpts });
      if (await checkpoint()) return finish("stopped");
      if (initial.status !== "success") throw new Error("Failed to fetch materials");

      progress.totalMaterials = initial.data.pagination.total;
      progress.totalPages = initial.data.pagination.totalPages;
      emit();

      for (let page = startPage; page <= progress.totalPages; page++) {
        if (await checkpoint()) return finish("stopped");

        progress.currentPage = page;
        progress.currentTask = `Fetching page ${page} / ${progress.totalPages}…`;
        emit();

        const pageData = page === startPage
          ? initial
          : await searchMaterials({ page, limit: 50, ...searchOpts });

        if (await checkpoint()) return finish("stopped");
        if (pageData.status !== "success") {
          progress.currentTask = `⚠️ Failed to fetch page ${page}, skipping…`;
          emit();
          continue;
        }

        const eligible = pageData.data.items.filter((m) =>
          m.type === MaterialTypeEnum.PDF || m.type === MaterialTypeEnum.GDRIVE
        );

        for (const material of eligible) {
          if (await checkpoint()) return finish("stopped");

          if (!options.replaceExisting && material.previewUrl) {
            progress.skipped++;
            progress.processed++;
            emit();
            continue;
          }

          progress.currentTask = `Processing: ${material.label}`;
          emit();

          let previewBlob: Blob | null = null;
          let hitRateLimit = false;

          try {
            previewBlob = await generatePreview(material, signal);
          } catch (err) {
            if (isRateLimitError(err)) {
              hitRateLimit = true;
            } else {
              progress.failed++;
              progress.processed++;
              progress.currentTask = `❌ Failed: ${material.label}`;
              emit();
              await sleep(delayPerItem);
              continue;
            }
          }

          // Rate-limit auto-pause with countdown
          if (hitRateLimit) {
            progress.rateLimitPauses++;
            progress.status = "paused_ratelimit";

            for (let s = 60; s > 0; s--) {
              if (signal.aborted) return finish("stopped");
              progress.resumeInSeconds = s;
              progress.currentTask = `⏸ Rate limited — resuming in ${s}s…`;
              emit();
              await sleep(1_000);
            }

            progress.resumeInSeconds = 0;
            progress.status = "running";
            progress.currentTask = `Retrying: ${material.label}`;
            emit();

            try {
              previewBlob = await generatePreview(material, signal);
            } catch {
              progress.failed++;
              progress.processed++;
              progress.currentTask = `❌ Retry failed: ${material.label}`;
              emit();
              await sleep(delayPerItem);
              continue;
            }
          }

          // Upload
          if (previewBlob && previewBlob.size > 0) {
            try {
              await uploadPreviewWithRootKey(material.id, previewBlob);
              progress.successful++;
              progress.currentTask = `✅ Done: ${material.label}`;
            } catch {
              progress.failed++;
              progress.currentTask = `❌ Upload failed: ${material.label}`;
            }
          } else {
            progress.skipped++;
            progress.currentTask = `⏭ No preview source: ${material.label}`;
          }

          progress.processed++;
          emit();

          if (!signal.aborted) await sleep(delayPerItem);
        }
      }

      finish("completed");
    } catch (err) {
      progress.status = "error";
      progress.currentTask = `Error: ${(err as Error).message}`;
      emit();
    }

    function finish(status: BatchUpdateProgress["status"]) {
      progress.status = status;
      progress.resumeInSeconds = 0;
      progress.currentTask =
        status === "completed"
          ? `Completed — ${progress.successful} updated, ${progress.skipped} skipped, ${progress.failed} failed`
          : status === "stopped"
          ? `Stopped on page ${progress.currentPage}.`
          : progress.currentTask;
      onProgress({ ...progress });
    }
  }

  // Pause: locks the gate; the runner will suspend at the next checkpoint
  function pause() {
    gate.lock();
  }

  // Resume: unlocks the gate; the runner continues from where it paused
  function resume() {
    gate.unlock();
  }

  // Stop: aborts entirely (also unlocks gate so the runner can exit cleanly)
  function stop() {
    gate.unlock(); // unblock any pending gate.wait() so the abort check fires
    abortController?.abort();
  }

  return { run, pause, resume, stop };
}

// ── Shared preview generation logic ────────────────────────────────────────────
async function generatePreview(
  material: { id: string; type: MaterialTypeEnum; label: string },
  signal: AbortSignal
): Promise<Blob | null> {
  if (material.type === MaterialTypeEnum.PDF) {
    const downloadUrl = await getDownloadUrl(material.id);
    if (signal.aborted) return null;
    return generatePdfPreviewBlob(downloadUrl);
  }

  if (material.type === MaterialTypeEnum.GDRIVE) {
    const full = await getMaterialById(material.id);
    if (signal.aborted) return null;

    const address = full?.data?.resource?.resourceAddress;
    if (!address) return null;

    const gdriveId = extractGDriveId(address);
    if (!gdriveId) return null;

    if (gdriveId.type === "file") {
      return generateGDrivePreviewBlob(gdriveId.id);
    }

    // Folder — use first non-folder file
    const contents = await listFolderFiles(gdriveId.id);
    const firstFile =
      contents.files.find((f) => f.mimeType !== "application/vnd.google-apps.folder") ||
      contents.files[0];
    return firstFile ? generateGDrivePreviewBlob(firstFile.id) : null;
  }

  return null;
}
