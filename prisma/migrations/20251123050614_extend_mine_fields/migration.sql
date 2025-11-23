/*
  Warnings:

  - You are about to drop the column `code` on the `Mine` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Mine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "location" TEXT,
    "maxDepthM" REAL,
    "hostRock" TEXT,
    "mineType" TEXT,
    "altitudeM" REAL,
    "sitePressureKpa" REAL,
    "dailyMaxDryBulbC" REAL,
    "dailyMinDryBulbC" REAL,
    "dailyMaxWetBulbC" REAL,
    "dailyMinWetBulbC" REAL,
    "dailyRelativeHumidityPct" REAL,
    "hottestMonth" TEXT,
    "hottestMonthMaxDryBulbC" REAL,
    "hottestMonthMinDryBulbC" REAL,
    "hottestMonthMaxWetBulbC" REAL,
    "hottestMonthMinWetBulbC" REAL,
    "hottestMonthRelativeHumidityPct" REAL,
    "companyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Mine_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Mine" ("companyId", "createdAt", "id", "location", "name") SELECT "companyId", "createdAt", "id", "location", "name" FROM "Mine";
DROP TABLE "Mine";
ALTER TABLE "new_Mine" RENAME TO "Mine";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
