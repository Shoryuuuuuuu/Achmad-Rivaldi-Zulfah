import "server-only";

import { getEffectiveSupabaseConfig } from "@/lib/runtime-config";

function assertValue(name: string, value: string): string {
  if (!value) {
    throw new Error(`Supabase configuration is missing: ${name}`);
  }
  return value;
}

function baseHeaders(extra?: HeadersInit): HeadersInit {
  const { config } = getEffectiveSupabaseConfig();
  const key = assertValue("supabaseServiceRoleKey", config.supabaseServiceRoleKey);
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    ...extra,
  };
}

function restUrl(path: string, params?: URLSearchParams): string {
  const { config } = getEffectiveSupabaseConfig();
  const base = assertValue("supabaseUrl", config.supabaseUrl);
  const url = new URL(`/rest/v1/${path}`, base);
  if (params) {
    url.search = params.toString();
  }
  return url.toString();
}

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text) {
    return [] as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`Invalid JSON response from Supabase: ${text}`);
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase REST error ${response.status}: ${text}`);
  }
  return parseJson<T>(response);
}

export async function restSelect<T>(
  table: string,
  params: Record<string, string> = {}
): Promise<T[]> {
  const search = new URLSearchParams({ select: "*", ...params });
  const response = await fetch(restUrl(table, search), {
    method: "GET",
    headers: baseHeaders(),
    cache: "no-store",
  });

  return handleResponse<T[]>(response);
}

export async function restInsert<T>(
  table: string,
  payload: Record<string, unknown> | Record<string, unknown>[]
): Promise<T[]> {
  const response = await fetch(restUrl(table), {
    method: "POST",
    headers: baseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
  });

  return handleResponse<T[]>(response);
}

export async function restUpdate<T>(
  table: string,
  filter: Record<string, string>,
  payload: Record<string, unknown>
): Promise<T[]> {
  const search = new URLSearchParams(filter);
  const response = await fetch(restUrl(table, search), {
    method: "PATCH",
    headers: baseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
    }),
    body: JSON.stringify(payload),
  });

  return handleResponse<T[]>(response);
}

export async function restDelete(
  table: string,
  filter: Record<string, string>
): Promise<void> {
  const search = new URLSearchParams(filter);
  const response = await fetch(restUrl(table, search), {
    method: "DELETE",
    headers: baseHeaders(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase REST delete error ${response.status}: ${text}`);
  }
}

export async function restCount(
  table: string,
  params: Record<string, string> = {}
): Promise<number> {
  const search = new URLSearchParams({ select: "id", ...params });
  const response = await fetch(restUrl(table, search), {
    method: "HEAD",
    headers: baseHeaders({ Prefer: "count=exact" }),
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase REST count error ${response.status}: ${text}`);
  }

  const range = response.headers.get("content-range");
  if (!range) {
    return 0;
  }

  const total = range.split("/")[1];
  return Number(total || 0);
}

export function getSupabaseBaseUrl(): string {
  const { config } = getEffectiveSupabaseConfig();
  return assertValue("supabaseUrl", config.supabaseUrl);
}

export function getSupabaseServiceRoleKey(): string {
  const { config } = getEffectiveSupabaseConfig();
  return assertValue("supabaseServiceRoleKey", config.supabaseServiceRoleKey);
}
