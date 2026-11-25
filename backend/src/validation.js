const { STATUSES } = require("./models/Application");

const ICON_PATTERN = /^[a-z0-9-]{1,40}$/;

/**
 * Validate a full application record (for updates, merge the stored record
 * with the incoming changes first). Returns { data } or { error }.
 */
function validateApplication(input) {
  const data = {
    name: String(input.name ?? "").trim(),
    description: String(input.description ?? "").trim(),
    url: String(input.url ?? "").trim(),
    icon: String(input.icon ?? "layout-grid").trim() || "layout-grid",
    status: String(input.status ?? "available"),
    enabled: input.enabled === undefined ? true : input.enabled,
    order: input.order === undefined || input.order === "" ? 0 : Number(input.order),
  };

  if (!data.name) return { error: "Application name is required." };
  if (data.name.length > 100) return { error: "Application name must be 100 characters or fewer." };
  if (data.description.length > 300) return { error: "Description must be 300 characters or fewer." };
  if (!STATUSES.includes(data.status)) return { error: "Invalid status." };
  if (typeof data.enabled !== "boolean") return { error: "Enabled must be true or false." };
  if (!Number.isInteger(data.order)) return { error: "Display order must be a whole number." };
  if (!ICON_PATTERN.test(data.icon)) return { error: "Invalid icon." };

  if (data.url) {
    if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(data.url)) data.url = `http://${data.url}`;
    let parsed;
    try {
      parsed = new URL(data.url);
    } catch {
      return { error: "URL is not valid." };
    }
    // Only web links: blocks javascript:, data:, file: etc.
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { error: "URL must start with http:// or https://." };
    }
    if (data.url.length > 500) return { error: "URL is too long." };
  } else if (data.status === "available") {
    return { error: "A URL is required for applications with status Available." };
  }

  return { data };
}

module.exports = { validateApplication };
