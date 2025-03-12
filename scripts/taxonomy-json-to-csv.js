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
const inputPath = path.join(__dirname, "../prisma/data/skill_taxonomy.json");
const outputPath = path.join(__dirname, "../prisma/data/taxonomy.csv");

// Read the JSON file
console.log("Reading taxonomy JSON file...");
/** @type {TaxonomyData} */
const taxonomyData = JSON.parse(fs.readFileSync(inputPath, "utf8"));

// Create a lookup map for categories and skills
/** @type {Map<number, Category>} */
const categoriesMap = new Map();
taxonomyData.categories.forEach((category) => {
  categoriesMap.set(category.id, category);
});

/** @type {Map<number, Skill>} */
const skillsMap = new Map();
taxonomyData.skills.forEach((skill) => {
  skillsMap.set(skill.id, skill);
});

// Create CSV header
const csvHeader = [
  "competency_id",
  "competency_name",
  "competency_criteria",
  "skill_id",
  "skill_name",
  "category_id",
  "category_name",
  "level_5_exceptional",
  "level_4_proficient",
  "level_3_competent",
  "level_2_needs_guidance",
  "level_1_inadequate",
].join(",");

// Create CSV rows
const csvRows = taxonomyData.competencies.map((competency) => {
  const skill = skillsMap.get(competency.skillId);
  if (!skill) {
    throw new Error(
      `Skill with ID ${competency.skillId} not found for competency ${competency.id}`,
    );
  }

  const category = categoriesMap.get(skill.categoryId);
  if (!category) {
    throw new Error(
      `Category with ID ${skill.categoryId} not found for skill ${skill.id}`,
    );
  }

  return [
    competency.id,
    `"${competency.name.replace(/"/g, '""')}"`, // Escape quotes in CSV
    `"${competency.criteria.replace(/"/g, '""')}"`,
    skill.id,
    `"${skill.name.replace(/"/g, '""')}"`,
    category.id,
    `"${category.name.replace(/"/g, '""')}"`,
    competency.level_5_exceptional
      ? `"${competency.level_5_exceptional.replace(/"/g, '""')}"`
      : `""`,
    competency.level_4_proficient
      ? `"${competency.level_4_proficient.replace(/"/g, '""')}"`
      : `""`,
    competency.level_3_competent
      ? `"${competency.level_3_competent.replace(/"/g, '""')}"`
      : `""`,
    competency.level_2_needs_guidance
      ? `"${competency.level_2_needs_guidance.replace(/"/g, '""')}"`
      : `""`,
    competency.level_1_inadequate
      ? `"${competency.level_1_inadequate.replace(/"/g, '""')}"`
      : `""`,
  ].join(",");
});

// Combine header and rows
const csvContent = [csvHeader, ...csvRows].join("\n");

// Write to CSV file
fs.writeFileSync(outputPath, csvContent, "utf8");
console.log(`Conversion complete! CSV file saved to: ${outputPath}`);
