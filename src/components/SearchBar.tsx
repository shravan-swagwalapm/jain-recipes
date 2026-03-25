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

export default function SearchBar({ recipes, basePath }: Props) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();
    return recipes
      .filter((r) => {
        const haystack = [
          r.name,
          r.description,
          r.category.replace(/-/g, ' '),
          ...r.tags,
          ...r.ingredients.map((i) => i.name),
        ]
          .join(' ')
          .toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 20);
  }, [query, recipes]);

  return (
    <div>
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search recipes by name, ingredient, or tag..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 bg-white text-base focus:outline-none focus:ring-2 focus:ring-[#D4763C]/40 focus:border-[#D4763C] transition-all"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            ✕
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="mt-6">
          <p className="text-sm text-gray-500 mb-4">
            {results.length} recipe{results.length !== 1 ? 's' : ''} found
          </p>
          {results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {results.map((r) => (
                <a
                  key={r.slug}
                  href={`${basePath}recipes/${r.slug}/`}
                  className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all group"
                >
                  <span className="text-3xl flex-shrink-0">
                    {categoryEmoji[r.category] || '🍽️'}
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-[#6B1D2A] group-hover:text-[#D4763C] transition-colors truncate"
                      style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                      {r.name}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">{r.description}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#D4763C] bg-[#D4763C]/10 px-2 py-0.5 rounded-full capitalize">
                        {r.category.replace(/-/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-400">{r.prepTime + r.cookTime} min</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <span className="text-5xl block mb-3">🔍</span>
              <p className="text-gray-500">No recipes match "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Try a different ingredient or dish name</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
