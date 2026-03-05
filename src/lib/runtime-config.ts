import "server-only";

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";

export interface RuntimeSupabaseConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
}

export type SupabaseConfigSource = "runtime" | "env" | "none";

const RUNTIME_CONFIG_PATH = path.join(process.cwd(), ".runtime-config.json");

function isPlaceholder(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  if (!normalized) return true;
  return (
    normalized.includes("your-project-id") ||
    normalized.includes("your-anon-key") ||
    normalized.includes("your-service-role-key") ||
    normalized.includes("change-this")
  );
}

function normalize(value: string | undefined): string {
  const result = (value || "").trim();
  return isPlaceholder(result) ? "" : result;
}

function parseConfig(raw: unknown): RuntimeSupabaseConfig {
  if (!raw || typeof raw !== "object") {
    return { supabaseUrl: "", supabaseAnonKey: "", supabaseServiceRoleKey: "" };
  }
  const record = raw as Record<string, unknown>;
  return {
    supabaseUrl: normalize(String(record.supabaseUrl || "")),
    supabaseAnonKey: normalize(String(record.supabaseAnonKey || "")),
    supabaseServiceRoleKey: normalize(String(record.supabaseServiceRoleKey || "")),
  };
}

export function getRuntimeSupabaseConfig(): RuntimeSupabaseConfig {
  if (!existsSync(RUNTIME_CONFIG_PATH)) {
    return { supabaseUrl: "", supabaseAnonKey: "", supabaseServiceRoleKey: "" };
  }

  try {
    const text = readFileSync(RUNTIME_CONFIG_PATH, "utf8");
    return parseConfig(JSON.parse(text));
  } catch {
    return { supabaseUrl: "", supabaseAnonKey: "", supabaseServiceRoleKey: "" };
  }
}

export function getEnvSupabaseConfig(): RuntimeSupabaseConfig {
  return {
    supabaseUrl: normalize(process.env.NEXT_PUBLIC_SUPABASE_URL),
    supabaseAnonKey: normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    supabaseServiceRoleKey: normalize(process.env.SUPABASE_SERVICE_ROLE_KEY),
  };
}

function hasRequiredConfig(config: RuntimeSupabaseConfig): boolean {
  return Boolean(config.supabaseUrl && config.supabaseServiceRoleKey);
}

export function getEffectiveSupabaseConfig(): {
  source: SupabaseConfigSource;
  config: RuntimeSupabaseConfig;
} {
  const runtimeConfig = getRuntimeSupabaseConfig();
  if (hasRequiredConfig(runtimeConfig)) {
    return { source: "runtime", config: runtimeConfig };
  }

  const envConfig = getEnvSupabaseConfig();
  if (hasRequiredConfig(envConfig)) {
    return { source: "env", config: envConfig };
  }

  return {
    source: "none",
    config: { supabaseUrl: "", supabaseAnonKey: "", supabaseServiceRoleKey: "" },
  };
}

export function saveRuntimeSupabaseConfig(config: RuntimeSupabaseConfig): void {
  const sanitized = {
    supabaseUrl: normalize(config.supabaseUrl),
    supabaseAnonKey: normalize(config.supabaseAnonKey),
    supabaseServiceRoleKey: normalize(config.supabaseServiceRoleKey),
  };

  writeFileSync(RUNTIME_CONFIG_PATH, JSON.stringify(sanitized, null, 2), "utf8");
}

export function clearRuntimeSupabaseConfig(): void {
  if (existsSync(RUNTIME_CONFIG_PATH)) {
    unlinkSync(RUNTIME_CONFIG_PATH);
  }
}
