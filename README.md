# JainRecipes

Static Astro site for strict Jain vegetarian recipes. It publishes a searchable recipe library to GitHub Pages, with one detail page per recipe.

## What It Does

- Lists all Jain recipes from `src/data/recipes.json`
- Generates clickable recipe detail pages at `/recipes/[slug]/`
- Supports category filters, text search, ingredient filtering, and a local meal planner
- Validates recipe data before every production build
- Deploys `dist/` to GitHub Pages through `.github/workflows/deploy.yml`

## Jain Recipe Rules

The build rejects forbidden ingredients in recipe ingredient lists:

- onion, garlic, potato, ginger
- carrot, radish, beetroot, turnip, sweet potato, yam
- arbi/colocasia, mushroom
- egg, meat, fish, chicken

Run validation directly:

```sh
npm run validate:recipes
```

## Local Development

```sh
npm install
npm run dev
```

Build for production:

```sh
npm run build
```

Preview the built site:

```sh
npm run preview
```

## GitHub Pages

This repo is configured for GitHub Pages at:

```txt
https://shravan-swagwalapm.github.io/jain-recipes/
```

Deployment runs on pushes to `main`. In GitHub, set Pages source to **GitHub Actions**.
