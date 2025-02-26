import { PrismaClient } from "@prisma/client";
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const prisma = new PrismaClient();

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
  const records = JSON.parse(fileContent);
  
  console.log(`Found ${records.length} skill taxonomy records in the JSON file`);
  
  // Group records by category and skill
  const categoriesMap = new Map();
  
  for (const record of records) {
    const { category, skill, competency, criteria } = record;
    
    if (!categoriesMap.has(category)) {
      categoriesMap.set(category, new Map());
    }
    
    const skillsMap = categoriesMap.get(category);
    
    if (!skillsMap.has(skill)) {
      skillsMap.set(skill, new Map());
    }
    
    const competenciesMap = skillsMap.get(skill);
    
    if (!competenciesMap.has(competency)) {
      competenciesMap.set(competency, []);
    }
    
    competenciesMap.get(competency).push(criteria);
  }
  
  // Insert data into the database
  for (const [categoryName, skillsMap] of categoriesMap) {
    console.log(`Processing category: ${categoryName}`);
    
    // Create or find the category
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      create: { name: categoryName },
      update: {},
    });
    
    for (const [skillName, competenciesMap] of skillsMap) {
      console.log(`  Processing skill: ${skillName}`);
      
      // Create or find the skill
      const skill = await prisma.skill.upsert({
        where: { 
          categoryId_name: {
            categoryId: category.id,
            name: skillName,
          }
        },
        create: {
          name: skillName,
          categoryId: category.id,
        },
        update: {},
      });
      
      for (const [competencyName, criteriaList] of competenciesMap) {
        console.log(`    Processing competency: ${competencyName}`);
        
        // Create or find the subskill (competency)
        const subSkill = await prisma.subSkill.upsert({
          where: {
            skillId_name: {
              skillId: skill.id,
              name: competencyName,
            }
          },
          create: {
            name: competencyName,
            skillId: skill.id,
          },
          update: {},
        });
        
        // Create criteria
        for (const criteriaDesc of criteriaList) {
          console.log(`      Adding criterion: ${criteriaDesc.substring(0, 30)}...`);
          
          // Check if criterion already exists to avoid duplicates
          const existingCriterion = await prisma.criterion.findFirst({
            where: {
              description: criteriaDesc,
              subSkillId: subSkill.id,
            }
          });
          
          if (!existingCriterion) {
            await prisma.criterion.create({
              data: {
                description: criteriaDesc,
                subSkillId: subSkill.id,
              },
            });
          }
        }
      }
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