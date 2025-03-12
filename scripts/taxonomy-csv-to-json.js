import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define interfaces
/**
 * @typedef {Object} Category
 * @property {number} id
 * @property {string} name
 */

/**
 * @typedef {Object} Skill
 * @property {number} id
 * @property {number} categoryId
 * @property {string} name
 */

/**
 * @typedef {Object} Competency
 * @property {number} id
 * @property {number} skillId
 * @property {string} name
 * @property {string} criteria
 * @property {string} [level_5_exceptional]
 * @property {string} [level_4_proficient]
 * @property {string} [level_3_competent]
 * @property {string} [level_2_needs_guidance]
 * @property {string} [level_1_inadequate]
 */

/**
 * @typedef {Object} TaxonomyData
 * @property {Category[]} categories
 * @property {Skill[]} skills
 * @property {Competency[]} competencies
 */

// Paths
const inputPath = path.join(__dirname, "../prisma/data/taxonomy.csv");
const outputPath = path.join(__dirname, "../prisma/data/skill_taxonomy.json");

// Read the CSV file
console.log("Reading taxonomy CSV file...");
const csvContent = fs.readFileSync(inputPath, "utf8");
const lines = csvContent.split("\n");
const dataRows = lines.slice(1);

// Objects to hold the extracted data
/** @type {Map<number, Category>} */
const categories = new Map();
/** @type {Map<number, Skill>} */
const skills = new Map();
/** @type {Competency[]} */
const competencies = [];

// Parse each CSV row
dataRows.forEach((row) => {
  if (!row.trim()) return; // Skip empty rows

  // Parse the CSV, handling quoted fields correctly
  const cols = [];
  let inQuotes = false;
  let currentValue = "";

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      // If we see a double quote, toggle the quote state
      inQuotes = !inQuotes;
      // If we see two double quotes in a row within quotes, add one quote to the value
      if (i + 1 < row.length && row[i + 1] === '"' && inQuotes) {
        currentValue += '"';
        i++; // Skip the next quote
      }
    } else if (char === "," && !inQuotes) {
      // If we see a comma outside quotes, it's a field delimiter
      cols.push(currentValue);
      currentValue = "";
    } else {
      // Otherwise add the character to the current value
      currentValue += char;
    }
  }

  // Don't forget the last column
  cols.push(currentValue);

  // Ensure we have all the required columns
  if (cols.length < 7) {
    console.warn(`Skipping invalid row: ${row}`);
    return;
  }

  // Extract data from columns (with safety checks)
  const competencyIdStr = cols[0] || "0";
  const competencyName = (cols[1] || "")
    .replace(/^"|"$/g, "")
    .replace(/""/g, '"');
  const competencyCriteria = (cols[2] || "")
    .replace(/^"|"$/g, "")
    .replace(/""/g, '"');
  const skillIdStr = cols[3] || "0";
  const skillName = (cols[4] || "").replace(/^"|"$/g, "").replace(/""/g, '"');
  const categoryIdStr = cols[5] || "0";
  const categoryName = (cols[6] || "")
    .replace(/^"|"$/g, "")
    .replace(/""/g, '"');

  // Extract the new rubric level columns if they exist
  const level5Exceptional =
    cols.length > 7
      ? (cols[7] || "").replace(/^"|"$/g, "").replace(/""/g, '"')
      : "";
  const level4Proficient =
    cols.length > 8
      ? (cols[8] || "").replace(/^"|"$/g, "").replace(/""/g, '"')
      : "";
  const level3Competent =
    cols.length > 9
      ? (cols[9] || "").replace(/^"|"$/g, "").replace(/""/g, '"')
      : "";
  const level2NeedsGuidance =
    cols.length > 10
      ? (cols[10] || "").replace(/^"|"$/g, "").replace(/""/g, '"')
      : "";
  const level1Inadequate =
    cols.length > 11
      ? (cols[11] || "").replace(/^"|"$/g, "").replace(/""/g, '"')
      : "";

  // Parse numeric IDs
  const competencyId = parseInt(competencyIdStr, 10);
  const skillId = parseInt(skillIdStr, 10);
  const categoryId = parseInt(categoryIdStr, 10);

  // Skip if any required ID is invalid
  if (isNaN(competencyId) || isNaN(skillId) || isNaN(categoryId)) {
    console.warn(`Skipping row with invalid ID: ${row}`);
    return;
  }

  // Add to category map if not exists
  if (!categories.has(categoryId)) {
    categories.set(categoryId, {
      id: categoryId,
      name: categoryName,
    });
  }

  // Add to skill map if not exists
  if (!skills.has(skillId)) {
    skills.set(skillId, {
      id: skillId,
      categoryId: categoryId,
      name: skillName,
    });
  }

  // Add competency with new rubric level fields
  /** @type {Competency} */
  const competency = {
    id: competencyId,
    skillId: skillId,
    name: competencyName,
    criteria: competencyCriteria,
  };

  // Only add non-empty level values
  if (level5Exceptional) competency.level_5_exceptional = level5Exceptional;
  if (level4Proficient) competency.level_4_proficient = level4Proficient;
  if (level3Competent) competency.level_3_competent = level3Competent;
  if (level2NeedsGuidance)
    competency.level_2_needs_guidance = level2NeedsGuidance;
  if (level1Inadequate) competency.level_1_inadequate = level1Inadequate;

  competencies.push(competency);
});

// Convert maps to arrays sorted by ID
const categoriesArray = Array.from(categories.values()).sort(
  (a, b) => a.id - b.id,
);

const skillsArray = Array.from(skills.values()).sort((a, b) => a.id - b.id);

const competenciesArray = competencies.sort((a, b) => a.id - b.id);

// Create the final JSON structure
/** @type {TaxonomyData} */
const taxonomy = {
  categories: categoriesArray,
  skills: skillsArray,
  competencies: competenciesArray,
};

// Write the JSON file with proper indentation
fs.writeFileSync(outputPath, JSON.stringify(taxonomy, null, 2), "utf8");

console.log(`Conversion complete! JSON file saved to: ${outputPath}`);
