import { useState, useMemo } from 'react';

interface Recipe {
  slug: string;
  name: string;
  description: string;
  category: string;
  prepTime: number;
  cookTime: number;
  difficulty: string;
  servings: number;
  tags: string[];
  ingredients: { name: string; quantity: string; unit: string }[];
}

interface Props {
  recipes: Recipe[];
  basePath: string;
}

const categoryEmoji: Record<string, string> = {
  'breakfast': '🌅',
  'main-course': '🍛',
  'snacks': '🍘',
  'desserts': '🍮',
  'rice-and-breads': '🍚',
  'drinks': '🥤',
};

// Common Jain-safe ingredients organized by type
const ingredientGroups = [
  {
    label: 'Dairy & Protein',
    items: ['Paneer', 'Milk', 'Curd', 'Ghee', 'Butter', 'Cream', 'Cheese'],
  },
  {
    label: 'Vegetables',
    items: ['Capsicum', 'Tomato', 'Cauliflower', 'Cabbage', 'Peas', 'Brinjal', 'Okra', 'Bottle Gourd', 'Ridge Gourd', 'French Beans', 'Spinach', 'Corn'],
  },
  {
    label: 'Lentils & Grains',
    items: ['Toor Dal', 'Moong Dal', 'Chana Dal', 'Rice', 'Wheat Flour', 'Besan', 'Semolina', 'Poha'],
  },
  {
    label: 'Spices',
    items: ['Cumin', 'Coriander', 'Turmeric', 'Red Chili', 'Black Pepper', 'Asafoetida'],
  },
];

export default function IngredientFilter({ recipes, basePath }: Props) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (ingredient: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  };

  const clearAll = () => setSelected(new Set());

  const matches = useMemo(() => {
    if (selected.size === 0) return [];
    return recipes.filter((recipe) => {
      const recipeIngredients = recipe.ingredients.map((i) => i.name.toLowerCase());
      return Array.from(selected).every((sel) =>
        recipeIngredients.some((ri) => ri.includes(sel.toLowerCase()))
      );
    });
  }, [selected, recipes]);

  return (
    <div>
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-[#6B1D2A]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            I have these ingredients...
          </h3>
          {selected.size > 0 && (
            <button
              onClick={clearAll}
              className="text-sm text-[#D4763C] hover:text-[#B85E2A] transition-colors min-h-[44px] px-2"
            >
              Clear all ({selected.size})
            </button>
          )}
        </div>

        <div className="space-y-5">
          {ingredientGroups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {group.items.map((item) => {
                  const isSelected = selected.has(item);
                  return (
                    <button
                      key={item}
                      onClick={() => toggle(item)}
                      className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all min-h-[36px] ${
                        isSelected
                          ? 'bg-[#D4763C] text-white shadow-sm'
                          : 'bg-[#F5EDE0] text-gray-600 hover:bg-[#D4763C]/10'
                      }`}
                    >
                      {isSelected ? '✓ ' : ''}{item}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selected.size > 0 && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-4">
            {matches.length} recipe{matches.length !== 1 ? 's' : ''} you can make
          </p>
          {matches.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matches.map((r) => (
                <a
                  key={r.slug}
                  href={`${basePath}recipes/${r.slug}/`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <span className="text-3xl flex-shrink-0">
                    {categoryEmoji[r.category] || '🍽️'}
                  </span>
                  <div className="min-w-0">
                    <h3
                      className="font-semibold text-[#6B1D2A] group-hover:text-[#D4763C] transition-colors truncate"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                    >
                      {r.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{r.description}</p>
                    <span className="text-xs text-gray-400">{r.prepTime + r.cookTime} min</span>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">🤔</span>
              <p className="text-gray-500">No recipes match all selected ingredients</p>
              <p className="text-sm text-gray-400 mt-1">Try selecting fewer ingredients</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
