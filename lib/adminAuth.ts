/**
 * GOYE Web3 Business Hub - Admin Authentication Helper
 */

export function isAdminValid(inputPassword: string): boolean {
  const adminPass = process.env.ADMIN_PASSWORD || process.env.GOYE_ADMIN_SECRET;
  if (!adminPass) return false;
  return inputPassword.trim() === adminPass.trim();
}

console.log("New admin password set successfully");
