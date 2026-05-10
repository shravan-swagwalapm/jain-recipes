import fs from 'node:fs';
import path from 'node:path';

const recipesPath = path.join(process.cwd(), 'src/data/recipes.json');
const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
const homePagePath = path.join(process.cwd(), 'src/pages/index.astro');
const homePage = fs.readFileSync(homePagePath, 'utf8');

const allowedCategories = new Set([
  'breakfast',
  'snacks',
  'main-course',
  'desserts',
  'rice-and-breads',
  'drinks',
]);

const allowedDifficulties = new Set(['easy', 'medium', 'hard']);

const forbiddenIngredientPatterns = [
  /\bonions?\b/i,
  /\bgarlic\b/i,
  /\bpotatoes?\b/i,
  /\bginger\b/i,
  /\bcarrots?\b/i,
  /\bradishes?\b/i,
  /\bbeetroots?\b/i,
  /\bturnips?\b/i,
  /\bsweet potatoes?\b/i,
  /\byams?\b/i,
  /\barbi\b/i,
  /\bcolocasia\b/i,
  /\bmushrooms?\b/i,
  /\beggs?\b/i,
  /\bmeat\b/i,
  /\bfish\b/i,
  /\bchicken\b/i,
];

const errors = [];
const seenSlugs = new Set();

function fail(slug, message) {
  errors.push(`${slug || 'unknown recipe'}: ${message}`);
}

if (!Array.isArray(recipes) || recipes.length === 0) {
  fail('recipes.json', 'must contain at least one recipe');
}

for (const recipe of recipes) {
  const slug = recipe?.slug;
  if (!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    fail(slug, 'slug must be kebab-case');
  }

  if (seenSlugs.has(slug)) {
    fail(slug, 'duplicate slug');
  }
  seenSlugs.add(slug);

  for (const field of ['name', 'description', 'category', 'cuisine', 'difficulty', 'jainLevel']) {
    if (typeof recipe[field] !== 'string' || recipe[field].trim() === '') {
      fail(slug, `${field} is required`);
    }
  }

  if (!allowedCategories.has(recipe.category)) {
    fail(slug, `category "${recipe.category}" is not supported`);
  }

  if (!allowedDifficulties.has(recipe.difficulty)) {
    fail(slug, `difficulty "${recipe.difficulty}" is not supported`);
  }

  for (const field of ['prepTime', 'servings']) {
    if (!Number.isFinite(recipe[field]) || recipe[field] <= 0) {
      fail(slug, `${field} must be a positive number`);
    }
  }

  if (!Number.isFinite(recipe.cookTime) || recipe.cookTime < 0) {
    fail(slug, 'cookTime must be zero or a positive number');
  }

  if (!Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    fail(slug, 'must include ingredients');
  } else {
    for (const ingredient of recipe.ingredients) {
      const name = ingredient?.name || '';
      if (typeof name !== 'string' || name.trim() === '') {
        fail(slug, 'ingredient name is required');
        continue;
      }

      const forbidden = forbiddenIngredientPatterns.find((pattern) => pattern.test(name));
      if (forbidden) {
        fail(slug, `forbidden Jain ingredient found: "${name}"`);
      }
    }
  }

  if (!Array.isArray(recipe.steps) || recipe.steps.length < 3) {
    fail(slug, 'must include at least 3 steps');
  }

  if (!Array.isArray(recipe.tags) || recipe.tags.length === 0) {
    fail(slug, 'must include tags');
  }
}

const recipeSlugs = new Set(recipes.map((recipe) => recipe.slug));
const featuredMatch = homePage.match(/const featuredSlugs = \[([\s\S]*?)\];/);
if (featuredMatch) {
  const featuredSlugs = [...featuredMatch[1].matchAll(/'([^']+)'/g)].map((match) => match[1]);
  for (const slug of featuredSlugs) {
    if (!recipeSlugs.has(slug)) {
      fail('src/pages/index.astro', `featured slug "${slug}" does not exist in recipes.json`);
    }
  }
}

if (errors.length > 0) {
  console.error(`Recipe validation failed with ${errors.length} issue(s):`);
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(`Validated ${recipes.length} Jain recipes.`);
