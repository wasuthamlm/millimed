import type { ZodError } from "zod";

export type ServiceErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "CONFLICT"
  | "FORBIDDEN"
  | "UNAUTHORIZED";

export class ServiceError extends Error {
  code: ServiceErrorCode;
  httpStatus: number;
  fieldErrors?: Record<string, string>;

  constructor(
    code: ServiceErrorCode,
    httpStatus: number,
    message: string,
    fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = "ServiceError";
    this.code = code;
    this.httpStatus = httpStatus;
    this.fieldErrors = fieldErrors;
  }
}

export function notFound(message = "ไม่พบข้อมูล") {
  return new ServiceError("NOT_FOUND", 404, message);
}

export function conflict(message: string) {
  return new ServiceError("CONFLICT", 409, message);
}

export function forbidden(message: string) {
  return new ServiceError("FORBIDDEN", 403, message);
}

export function unauthorized(message = "Unauthorized") {
  return new ServiceError("UNAUTHORIZED", 401, message);
}

export function validationError(error: ZodError, fallback = "ข้อมูลไม่ถูกต้อง") {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".") || "_";
    if (!fieldErrors[key]) fieldErrors[key] = issue.message;
  }
  return new ServiceError(
    "VALIDATION_ERROR",
    400,
    error.issues[0]?.message ?? fallback,
    fieldErrors
  );
}
