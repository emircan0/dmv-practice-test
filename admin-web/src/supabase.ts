import { createClient } from "@supabase/supabase-js";

const DEFAULT_URL =
  import.meta.env.VITE_US_SUPABASE_URL || "https://bcwbteadwiuqcscrphys.supabase.co";
const DEFAULT_ANON_KEY =
  import.meta.env.VITE_US_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_IIxuUasGYMRDsvFcNnutvQ_aPUf9FFi";

const STORAGE_KEY_URL = "dmv_us_admin_supabase_url";
const STORAGE_KEY_ROLE = "dmv_us_admin_service_role_key";
const STORAGE_KEY_BUCKET = "dmv_us_admin_storage_bucket";

export const getCustomSupabaseUrl = () =>
  typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_URL) || "" : "";

export const getServiceRoleKey = () =>
  typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_ROLE) || "" : "";

export const getStorageBucket = () =>
  typeof window !== "undefined"
    ? localStorage.getItem(STORAGE_KEY_BUCKET) || "dmv-media"
    : "dmv-media";

export const setAdminCredentials = (
  url: string,
  serviceRoleKey: string,
  bucket = "dmv-media"
) => {
  if (url.trim()) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  else localStorage.removeItem(STORAGE_KEY_URL);

  if (serviceRoleKey.trim()) localStorage.setItem(STORAGE_KEY_ROLE, serviceRoleKey.trim());
  else localStorage.removeItem(STORAGE_KEY_ROLE);

  if (bucket.trim()) localStorage.setItem(STORAGE_KEY_BUCKET, bucket.trim());
  else localStorage.removeItem(STORAGE_KEY_BUCKET);

  window.location.reload();
};

export const clearAdminCredentials = () => {
  localStorage.removeItem(STORAGE_KEY_URL);
  localStorage.removeItem(STORAGE_KEY_ROLE);
  localStorage.removeItem(STORAGE_KEY_BUCKET);
  window.location.reload();
};

export const activeSupabaseUrl = getCustomSupabaseUrl() || DEFAULT_URL;
const rawServiceRoleKey = getServiceRoleKey();
export const isUsingServiceRole = !!rawServiceRoleKey;
const activeKey = rawServiceRoleKey || DEFAULT_ANON_KEY;
export const isConfigured = !!activeSupabaseUrl && !!activeKey;

// When running in a browser and a secret / service_role key is used, Supabase's Kong gateway
// rejects direct browser calls with "Forbidden use of secret API key in browser".
// We route requests through our local Vite backend proxy (/supabase-admin-proxy) which strips
// browser-identifying headers and sends the request as a backend server call.
const clientUrl =
  isUsingServiceRole && typeof window !== "undefined"
    ? `${window.location.origin}/supabase-admin-proxy`
    : activeSupabaseUrl;

export const supabase = createClient(clientUrl, activeKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
  global: {
    headers: isUsingServiceRole
      ? { "x-supabase-target-url": activeSupabaseUrl }
      : {},
  },
});
