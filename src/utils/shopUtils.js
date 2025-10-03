/**
 * Utility to get the current shop ID from URL
 * Supports path-based routing: /shop/:shopId
 */

/**
 * Extract shop ID from current URL
 * Expects format: /shop/:shopId or /shop/:shopId/...
 * @returns {string|null} Shop ID or null if not found
 */
export const getShopId = () => {
  const pathname = window.location.pathname;
  const pathSegments = pathname.split("/").filter(Boolean);

  // Check if URL starts with /shop/
  if (pathSegments.length >= 2 && pathSegments[0] === "shop") {
    return pathSegments[1];
  }

  // If not in /shop/:shopId format, return null
  return null;
};

/**
 * Navigate to a route with proper shop prefix
 * @param {string} path - Path to navigate to (e.g., '/customize/cake1')
 * @param {string} shopId - Shop ID to include in path
 * @returns {string} Full path with shop prefix (/shop/:shopId/...)
 */
export const getRoutePath = (path, shopId) => {
  if (!shopId) {
    console.warn("shopId is required for getRoutePath");
    return path;
  }
  
  // Remove leading slash from path if present
  const cleanPath = path.startsWith("/") ? path.substring(1) : path;
  
  return `/shop/${shopId}/${cleanPath}`;
};
