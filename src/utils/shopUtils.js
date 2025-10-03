/**
 * Utility to get the current shop ID from URL
 * Supports both subdomain routing (production) and path routing (development)
 */

/**
 * Extract shop ID from current URL
 * Production: cakeshopa.vercel.app → "cakeshopa"
 * Development: localhost:5174/cakeshopa → "cakeshopa"
 * @returns {string|null} Shop ID or null if not found
 */
export const getShopId = () => {
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;

  // Development mode: Check for path-based routing (e.g., /cakeshopa)
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const pathSegments = pathname.split("/").filter(Boolean);
    // If path starts with a shop ID, use it
    if (pathSegments.length > 0 && !pathSegments[0].includes(".")) {
      return pathSegments[0];
    }
    // Default to env variable or 'shop1' for local development
    return import.meta.env.VITE_SHOP_ID || "shop1";
  }

  // Production mode: Extract from subdomain
  // cakeshopa.vercel.app → "cakeshopa"
  // customdomain.com → use env variable
  const subdomain = hostname.split(".")[0];

  // If it's the main domain (no subdomain), use env variable
  if (
    subdomain === "localhost" ||
    subdomain === "www" ||
    hostname.split(".").length < 3
  ) {
    return import.meta.env.VITE_SHOP_ID || "shop1";
  }

  return subdomain;
};

/**
 * Check if we're in development mode
 */
export const isDevelopment = () => {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
};

/**
 * Get the base URL for routing
 * Development: /shopId
 * Production: /
 */
export const getBaseUrl = () => {
  if (isDevelopment()) {
    const shopId = getShopId();
    return `/${shopId}`;
  }
  return "";
};

/**
 * Navigate to a route with proper base URL
 * @param {string} path - Path to navigate to (e.g., '/customize/cake1')
 * @returns {string} Full path with base URL
 */
export const getRoutePath = (path) => {
  const baseUrl = getBaseUrl();
  return `${baseUrl}${path}`;
};
