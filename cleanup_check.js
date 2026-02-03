#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

console.log("=== FRONTEND CLEANUP ANALYSIS ===\n");

// Read navigation menus
const adminShellPath =
  "c:/laragon/www/plnip-portal-frontend/components/admin/AdminShell.tsx";
const superadminShellPath =
  "c:/laragon/www/plnip-portal-frontend/components/superadmin/SuperadminShell.tsx";
const dashboardLayoutPath =
  "c:/laragon/www/plnip-portal-frontend/app/dashboard/layout.tsx";
const instructorLayoutPath =
  "c:/laragon/www/plnip-portal-frontend/app/instructor/layout.tsx";

function extractMenuItems(filePath, menuName) {
  const content = fs.readFileSync(filePath, "utf8");
  const navItemsMatch = content.match(/const navItems = \[([\s\S]*?)\];/);

  if (!navItemsMatch) return [];

  const items = [];
  const hrefRegex = /href: ["']([^"']+)["']/g;
  let match;

  while ((match = hrefRegex.exec(navItemsMatch[1])) !== null) {
    items.push(match[1]);
  }

  console.log(`${menuName} Menu Items:`);
  items.forEach((item) => console.log(`  - ${item}`));
  console.log("");

  return items;
}

function getFolders(dirPath) {
  try {
    return fs
      .readdirSync(dirPath, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name);
  } catch (e) {
    return [];
  }
}

// Extract menus
const adminMenus = extractMenuItems(adminShellPath, "Admin");
const superadminMenus = extractMenuItems(superadminShellPath, "Superadmin");
const dashboardMenus = extractMenuItems(dashboardLayoutPath, "Dashboard");
const instructorMenus = extractMenuItems(instructorLayoutPath, "Instructor");

// Check folders
const roles = ["admin", "superadmin", "dashboard", "instructor"];

console.log("\n=== FOLDER vs MENU COMPARISON ===\n");

roles.forEach((role) => {
  const folderPath = `c:/laragon/www/plnip-portal-frontend/app/${role}`;
  const folders = getFolders(folderPath);

  let menus;
  if (role === "admin")
    menus = adminMenus.map((m) => m.replace("/admin/", "").split("/")[0]);
  else if (role === "superadmin")
    menus = superadminMenus.map(
      (m) => m.replace("/superadmin/", "").split("/")[0],
    );
  else if (role === "dashboard")
    menus = dashboardMenus.map(
      (m) => m.replace("/dashboard/", "").split("/")[0],
    );
  else if (role === "instructor")
    menus = instructorMenus.map(
      (m) => m.replace("/instructor/", "").split("/")[0],
    );

  console.log(`\n${role.toUpperCase()}:`);
  console.log(`Folders: ${folders.join(", ")}`);

  const unused = folders.filter(
    (f) => !menus.includes(f) && f !== "layout.tsx" && f !== "page.tsx",
  );

  if (unused.length > 0) {
    console.log(`❌ UNUSED FOLDERS (DELETE): ${unused.join(", ")}`);
  } else {
    console.log("✅ All folders used");
  }
});

console.log("\n=== CLEANUP COMPLETE ===");
