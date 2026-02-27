import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClubs,
  getClubById,
  getClubBySlug,
  createClub,
  updateClub,
  deleteClub,
  trackClubClick,
  trackClubJoin,
  getClubAnalytics,
  flagClub,
  requestClub,
  getClubFlags,
  getClubRequests,
  resolveFlag,
  updateClubStatus,
  updateClubRequest,
} from "@/api/clubs.api";
import {
  ClubStatusEnum,
  CreateClubDto,
  GetClubsParams,
  UpdateClubDto,
} from "@/lib/types/club.types";
import { toast } from "sonner";

// ── Queries ───────────────────────────────────────────────────────────

export function useClubs(params: GetClubsParams = {}) {
  return useQuery({
    queryKey: ["clubs", params],
    queryFn: () => getClubs(params),
    select: (res) =>
      res.status === "success"
        ? { clubs: res.data.data, pagination: res.data.pagination }
        : { clubs: [], pagination: null },
  });
}

export function useClub(id: string | undefined) {
  return useQuery({
    queryKey: ["club", id],
    queryFn: () => getClubById(id!),
    enabled: !!id,
    select: (res) => (res.status === "success" ? res.data : null),
  });
}

export function useClubBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ["club", "slug", slug],
    queryFn: () => getClubBySlug(slug!),
    enabled: !!slug,
    select: (res) => (res.status === "success" ? res.data : null),
  });
}

export function useMyClubs(organizerId: string | undefined) {
  return useClubs(organizerId ? { organizerId } : {});
}

export function useClubAnalytics(clubId: string | undefined) {
  return useQuery({
    queryKey: ["clubAnalytics", clubId],
    queryFn: () => getClubAnalytics(clubId!),
    enabled: !!clubId,
    select: (res) => (res.status === "success" ? res.data : null),
  });
}

export function useClubFlags(
  params: { page?: number; limit?: number; status?: string } = {},
) {
  return useQuery({
    queryKey: ["clubFlags", params],
    queryFn: () => getClubFlags(params),
    select: (res) =>
      res.status === "success"
        ? { flags: res.data.data, pagination: res.data.pagination }
        : { flags: [], pagination: null },
  });
}

export function useClubRequests(
  params: { page?: number; limit?: number; status?: string } = {},
) {
  return useQuery({
    queryKey: ["clubRequests", params],
    queryFn: () => getClubRequests(params),
    select: (res) =>
      res.status === "success"
        ? { requests: res.data.data, pagination: res.data.pagination }
        : { requests: [], pagination: null },
  });
}

// ── Mutations ─────────────────────────────────────────────────────────

export function useCreateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (dto: CreateClubDto) => createClub(dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      toast.success("Club posted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to post club");
    },
  });
}

export function useUpdateClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateClubDto }) =>
      updateClub(id, dto),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      toast.success("Club updated!");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to update club");
    },
  });
}

export function useDeleteClub() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteClub(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      toast.success("Club deleted");
    },
    onError: (err: any) => {
      toast.error(err?.message || "Failed to delete club");
    },
  });
}

// Fire-and-forget click tracking (anonymous-safe)
export function useTrackClubClick() {
  return useMutation({
    mutationFn: (id: string) => trackClubClick(id),
  });
}

// Join tracking — authenticated users only
export function useTrackClubJoin() {
  return useMutation({
    mutationFn: (id: string) => trackClubJoin(id),
  });
}

export function useFlagClub() {
  return useMutation({
    mutationFn: ({ clubId, reason }: { clubId: string; reason: string }) =>
      flagClub(clubId, reason),
    onSuccess: () => toast.success("Club reported — thanks for flagging!"),
    onError: (err: any) =>
      toast.error(err?.message || "Could not submit report"),
  });
}

export function useRequestClub() {
  return useMutation({
    mutationFn: (data: { name: string; interest: string; message?: string }) =>
      requestClub(data),
    onSuccess: () => toast.success("Request submitted!"),
    onError: (err: any) =>
      toast.error(err?.message || "Could not submit request"),
  });
}

export function useResolveFlag() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      flagId,
      action,
    }: {
      flagId: string;
      action: "approve" | "hide" | "dismiss";
    }) => resolveFlag(flagId, action),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubFlags"] });
      qc.invalidateQueries({ queryKey: ["clubs"] });
      toast.success("Flag resolved");
    },
    onError: (err: any) => toast.error(err?.message || "Action failed"),
  });
}

export function useUpdateClubStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: ClubStatusEnum }) =>
      updateClubStatus(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubs"] });
      toast.success("Club status updated");
    },
    onError: (err: any) => toast.error(err?.message || "Status update failed"),
  });
}

export function useUpdateClubRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      requestId,
      status,
    }: {
      requestId: string;
      status: "fulfilled" | "dismissed";
    }) => updateClubRequest(requestId, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clubRequests"] });
      toast.success("Request updated");
    },
    onError: (err: any) => toast.error(err?.message || "Update failed"),
  });
}
