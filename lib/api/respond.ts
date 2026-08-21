import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { ServiceError, validationError } from "@/lib/services/errors";

export function ok<T>(data: T, init?: { status?: number; meta?: Record<string, unknown> }) {
  return NextResponse.json({ data, ...(init?.meta ? { meta: init.meta } : {}) }, { status: init?.status ?? 200 });
}

export function errorResponse(err: unknown) {
  if (err instanceof ZodError) {
    const svcErr = validationError(err);
    return NextResponse.json(
      { error: { code: svcErr.code, message: svcErr.message, fieldErrors: svcErr.fieldErrors } },
      { status: svcErr.httpStatus }
    );
  }
  if (err instanceof ServiceError) {
    return NextResponse.json(
      { error: { code: err.code, message: err.message, fieldErrors: err.fieldErrors } },
      { status: err.httpStatus }
    );
  }
  console.error(err);
  return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Internal server error" } }, { status: 500 });
}

/** Wraps a Route Handler body so any thrown ServiceError/ZodError/unknown error becomes a consistent JSON response. */
export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (err) {
    return errorResponse(err);
  }
}
