"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/require-admin";
import { ServiceError } from "@/lib/services/errors";
import * as postService from "@/lib/services/posts";
import type { PostInput } from "@/lib/services/posts";

export type PostFormInput = PostInput;
export type PostActionResult = { error: string } | { error?: undefined; id: string };

function publicPathsFor(kind: PostFormInput["kind"], slug: string) {
  return kind === "ARTICLE" ? [`/articles`, `/articles/${slug}`] : [`/news`, `/news/${slug}`];
}

function revalidateAll(kind: PostFormInput["kind"], slugs: string[]) {
  revalidatePath("/admin/articles");
  revalidatePath("/admin");
  revalidatePath("/", "layout");
  for (const slug of slugs) {
    for (const path of publicPathsFor(kind, slug)) {
      revalidatePath(path);
    }
  }
}

export async function createPost(input: PostFormInput): Promise<PostActionResult> {
  await requireAdmin();
  try {
    const post = await postService.createPost(input);
    revalidateAll(input.kind, [input.slug]);
    return { id: post.id as string };
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function updatePost(id: string, input: PostFormInput): Promise<PostActionResult> {
  await requireAdmin();
  try {
    const before = await postService.getPost(id).catch(() => null);
    const post = await postService.updatePost(id, input);

    const slugsToRevalidate =
      before && before.slug !== input.slug ? [before.slug as string, input.slug] : [input.slug];
    revalidateAll(input.kind, slugsToRevalidate);
    if (before && before.kind !== input.kind) {
      revalidateAll(before.kind as PostFormInput["kind"], [before.slug as string]);
    }

    return { id: post.id as string };
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function deletePost(id: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const existing = await postService.getPost(id);
    await postService.deletePost(id);
    revalidateAll(existing.kind as PostFormInput["kind"], [existing.slug as string]);
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function setPostStatus(id: string, status: "DRAFT" | "PUBLISHED"): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const post = await postService.setPostStatus(id, status);
    revalidateAll(post.kind as PostFormInput["kind"], [post.slug as string]);
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function setPostKind(id: string, kind: "ARTICLE" | "NEWS"): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const before = await postService.getPost(id);
    const post = await postService.setPostKind(id, kind);
    revalidateAll(kind, [post.slug as string]);
    if (before.kind !== kind) {
      revalidateAll(before.kind as PostFormInput["kind"], [before.slug as string]);
    }
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}

export async function setPostCategory(id: string, categoryId: string): Promise<{ error?: string }> {
  await requireAdmin();
  try {
    const post = await postService.setPostCategory(id, categoryId);
    revalidateAll(post.kind as PostFormInput["kind"], [post.slug as string]);
    return {};
  } catch (err) {
    if (err instanceof ServiceError) return { error: err.message };
    throw err;
  }
}
