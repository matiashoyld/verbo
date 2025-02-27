import { PrismaClient } from "@prisma/client";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

// Type definitions for the data in JSON file
interface Category {
  id: number;
  name: string;
}

interface Skill {
  id: number;
  categoryId: number;
  name: string;
}

interface Competency {
  id: number;
  skillId: number;
  name: string;
  criteria: string;
}

interface TaxonomyData {
  categories: Category[];
  skills: Skill[];
  competencies: Competency[];
}

// ES Modules compatible __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function main() {
  console.log('Starting to seed the database...');
  
  try {
    // Seed Skill Taxonomy
    await seedSkillTaxonomy();
    
    // Seed Common Positions
    await seedCommonPositions();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

async function seedSkillTaxonomy() {
  console.log('Seeding skill taxonomy...');
  
  // Read the JSON file
  const filePath = path.join(__dirname, 'data', 'skill_taxonomy.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Parse the JSON content
  const taxonomyData = JSON.parse(fileContent) as TaxonomyData;
  
  console.log(`Found ${taxonomyData.categories.length} categories, ${taxonomyData.skills.length} skills, and ${taxonomyData.competencies.length} competencies in the JSON file`);
  
  // Maps to store the relationships between original numeric IDs and new UUIDs
  const categoryIdMap = new Map<number, string>();
  const skillIdMap = new Map<number, string>();
  
  // Clear existing data to avoid conflicts
  console.log('Clearing existing data...');
  await prisma.criterion.deleteMany({});
  await prisma.competency.deleteMany({});
  await prisma.skill.deleteMany({});
  await prisma.category.deleteMany({});
  
  // First, create all categories with their numeric IDs
  console.log('Creating categories...');
  for (const category of taxonomyData.categories) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        numId: category.id
      }
    });
    
    // Store mapping between numeric ID and UUID
    categoryIdMap.set(category.id, createdCategory.id);
  }
  
  // Next, create all skills with their numeric IDs and category relationships
  console.log('Creating skills...');
  for (const skill of taxonomyData.skills) {
    const categoryUuid = categoryIdMap.get(skill.categoryId);
    if (!categoryUuid) {
      console.warn(`Warning: Category ID ${skill.categoryId} not found for skill ${skill.name}`);
      continue;
    }
    
    const createdSkill = await prisma.skill.create({
      data: {
        name: skill.name,
        numId: skill.id,
        categoryId: categoryUuid
      }
    });
    
    // Store mapping between numeric ID and UUID
    skillIdMap.set(skill.id, createdSkill.id);
  }
  
  // Finally, create competencies with their criteria
  console.log('Creating competencies and criteria...');
  for (const competency of taxonomyData.competencies) {
    const skillUuid = skillIdMap.get(competency.skillId);
    if (!skillUuid) {
      console.warn(`Warning: Skill ID ${competency.skillId} not found for competency ${competency.name}`);
      continue;
    }
    
    try {
      // Create the competency
      const createdCompetency = await prisma.competency.create({
        data: {
          name: competency.name,
          numId: competency.id,
          skillId: skillUuid,
          // Create the criterion as part of the competency creation
          criteria: {
            create: {
              description: competency.criteria
            }
          }
        }
      });
      
      console.log(`Created competency: ${competency.name} with ID ${createdCompetency.id}`);
    } catch (error: any) {
      console.warn(`Failed to create competency ${competency.name} for skill ID ${competency.skillId}: ${error.message}`);
    }
  }
  
  console.log('Skill taxonomy seeding completed successfully!');
}

async function seedCommonPositions() {
  console.log('Seeding common positions...');
  
  // Read the JSON file
  const filePath = path.join(__dirname, 'data', 'common_positions.json');
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Parse the JSON content
  const positions = JSON.parse(fileContent);
  
  console.log(`Found ${positions.length} common positions in the JSON file`);
  
  // Insert positions into the database
  for (const position of positions) {
    const { title, icon, description } = position;
    
    console.log(`Processing position: ${title}`);
    
    // Create or update the position
    await prisma.commonPosition.upsert({
      where: { title },
      create: {
        title,
        icon,
        description,
      },
      update: {
        icon,
        description,
      },
    });
  }
  
  console.log('Common positions seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 