import "server-only";

import path from "path";

export const DATA_DIR = path.join(process.cwd(), "src", "data");
export const BLOG_DIR = path.join(process.cwd(), "src", "content", "blog");
export const HOMEPAGE_FILE = path.join(DATA_DIR, "homepage-content.json");
export const SITE_SETTINGS_FILE = path.join(DATA_DIR, "site-settings.json");
export const HEAD_CODE_FILE = path.join(DATA_DIR, "head-code.json");
export const BODY_CODE_FILE = path.join(DATA_DIR, "body-code.json");
export const FAVICON_SETTINGS_FILE = path.join(DATA_DIR, "favicon.json");
export const AI_SETTINGS_FILE = path.join(DATA_DIR, "ai-settings.json");
export const LAYOUT_SETTINGS_FILE = path.join(DATA_DIR, "layout-settings.json");
export const USERS_FILE = path.join(DATA_DIR, "users.json");
export const DOWNLOAD_HISTORY_FILE = path.join(DATA_DIR, "download-history.json");
export const SAVED_PRESENTATIONS_FILE = path.join(DATA_DIR, "saved-presentations.json");
