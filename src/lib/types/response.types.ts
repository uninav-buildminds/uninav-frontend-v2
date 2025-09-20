export enum ResponseStatus {
  SUCCESS = "success",
  ERROR = "error",
}

export type ResponseSuccess<T> = {
  data: T;
  message: string;
  status: ResponseStatus.SUCCESS;
};

export type ResponseError = {
  message: string;
  status: ResponseStatus.ERROR;
  error: {
    cause: unknown;
    name: string;
    path: string;
    statusCode: number;
  };
};

export type Response<T> = ResponseSuccess<T> | ResponseError;

export type PaginatedResponse<T> = Response<{
  data: T[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
    hasMore: boolean;
    hasPrev: boolean;
  };
}>;

export enum ApprovalStatusEnum {
  APPROVED = "approved",
  PENDING = "pending",
  REJECTED = "rejected",
}

export enum UserRole {
  STUDENT = "student",
  MODERATOR = "moderator",
  ADMIN = "admin",
}