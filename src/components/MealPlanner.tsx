import { useState, useEffect, useCallback } from 'react';

interface Recipe {
  slug: string;
  name: string;
  category: string;
  prepTime: number;
  cookTime: number;
}

interface Props {
  recipes: Recipe[];
  basePath: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'] as const;
type MealType = typeof MEALS[number];

const STORAGE_KEY = 'jainrecipes-meal-plan';

type Plan = Record<string, Record<MealType, string | null>>;

function emptyPlan(): Plan {
  const plan: Plan = {};
  DAYS.forEach((day) => {
    plan[day] = { Breakfast: null, Lunch: null, Dinner: null };
  });
  return plan;
}

export default function MealPlanner({ recipes, basePath }: Props) {
  const [plan, setPlan] = useState<Plan>(emptyPlan);
  const [picking, setPicking] = useState<{ day: string; meal: MealType } | null>(null);
  const [search, setSearch] = useState('');

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setPlan(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch { /* ignore */ }
  }, [plan]);

  const setMeal = useCallback((day: string, meal: MealType, slug: string | null) => {
    setPlan((prev) => ({
      ...prev,
      [day]: { ...prev[day], [meal]: slug },
    }));
    setPicking(null);
    setSearch('');
  }, []);

  const clearAll = () => setPlan(emptyPlan());

  const randomFill = () => {
    const breakfastRecipes = recipes.filter((r) => r.category === 'breakfast');
    const mainRecipes = recipes.filter((r) => ['main-course', 'rice-and-breads'].includes(r.category));

    const newPlan = emptyPlan();
    DAYS.forEach((day) => {
      if (breakfastRecipes.length > 0) {
        newPlan[day].Breakfast = breakfastRecipes[Math.floor(Math.random() * breakfastRecipes.length)].slug;
      }
      if (mainRecipes.length > 0) {
        newPlan[day].Lunch = mainRecipes[Math.floor(Math.random() * mainRecipes.length)].slug;
        newPlan[day].Dinner = mainRecipes[Math.floor(Math.random() * mainRecipes.length)].slug;
      }
    });
    setPlan(newPlan);
  };

  const getRecipeName = (slug: string) => {
    const r = recipes.find((r) => r.slug === slug);
    return r?.name || slug;
  };

  const filteredRecipes = search.trim()
    ? recipes.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()))
    : recipes;

  const filledCount = Object.values(plan).reduce(
    (acc, day) => acc + Object.values(day).filter(Boolean).length,
    0
  );

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={randomFill}
          className="inline-flex items-center gap-2 bg-[#D4763C] text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-[#B85E2A] transition-colors min-h-[44px]"
        >
          🎲 Random Fill
        </button>
        <button
          onClick={clearAll}
          className="inline-flex items-center gap-2 bg-[#F5EDE0] text-gray-600 px-5 py-2.5 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors min-h-[44px]"
        >
          🗑️ Clear Week
        </button>
        <span className="text-sm text-gray-400 ml-auto">
          {filledCount}/21 meals planned
        </span>
      </div>

      {/* Desktop Grid */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="p-3 text-left text-sm font-medium text-gray-400 w-24"></th>
              {DAYS.map((day) => (
                <th key={day} className="p-3 text-center text-sm font-semibold text-[#6B1D2A]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {day.slice(0, 3)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MEALS.map((meal) => (
              <tr key={meal}>
                <td className="p-3 text-sm font-medium text-gray-500">{meal}</td>
                {DAYS.map((day) => {
                  const slug = plan[day]?.[meal];
                  return (
                    <td key={`${day}-${meal}`} className="p-1.5">
                      {slug ? (
                        <div className="bg-[#D4763C]/10 rounded-xl p-2.5 text-center relative group min-h-[64px] flex flex-col items-center justify-center">
                          <a
                            href={`${basePath}recipes/${slug}/`}
                            className="text-xs font-medium text-[#6B1D2A] hover:text-[#D4763C] transition-colors line-clamp-2 leading-snug"
                          >
                            {getRecipeName(slug)}
                          </a>
                          <button
                            onClick={() => setMeal(day, meal, null)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-100 text-red-500 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                            aria-label="Remove"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPicking({ day, meal })}
                          className="w-full min-h-[64px] rounded-xl border-2 border-dashed border-gray-200 text-gray-300 hover:border-[#D4763C]/40 hover:text-[#D4763C] transition-colors flex items-center justify-center text-xl"
                        >
                          +
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: Day-by-day cards */}
      <div className="md:hidden space-y-4">
        {DAYS.map((day) => (
          <div key={day} className="bg-white rounded-2xl p-4 shadow-sm">
            <h3 className="font-semibold text-[#6B1D2A] mb-3" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              {day}
            </h3>
            <div className="space-y-2">
              {MEALS.map((meal) => {
                const slug = plan[day]?.[meal];
                return (
                  <div key={meal} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-400 w-16">{meal}</span>
                    {slug ? (
                      <div className="flex-1 flex items-center justify-between bg-[#D4763C]/10 rounded-lg px-3 py-2">
                        <a
                          href={`${basePath}recipes/${slug}/`}
                          className="text-sm text-[#6B1D2A] hover:text-[#D4763C] transition-colors"
                        >
                          {getRecipeName(slug)}
                        </a>
                        <button
                          onClick={() => setMeal(day, meal, null)}
                          className="text-red-400 hover:text-red-600 ml-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setPicking({ day, meal })}
                        className="flex-1 py-2 rounded-lg border border-dashed border-gray-200 text-gray-400 text-sm hover:border-[#D4763C]/40 hover:text-[#D4763C] transition-colors min-h-[44px]"
                      >
                        + Add {meal.toLowerCase()}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Recipe Picker Modal */}
      {picking && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4" onClick={() => { setPicking(null); setSearch(''); }}>
          <div
            className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-lg max-h-[70vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#6B1D2A]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {picking.day} — {picking.meal}
                </h3>
                <button
                  onClick={() => { setPicking(null); setSearch(''); }}
                  className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search recipes..."
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4763C]/40"
                autoFocus
              />
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredRecipes.map((r) => (
                <button
                  key={r.slug}
                  onClick={() => setMeal(picking.day, picking.meal, r.slug)}
                  className="w-full text-left px-4 py-3 rounded-xl hover:bg-[#FFF8F0] transition-colors flex items-center gap-3 min-h-[48px]"
                >
                  <span className="text-sm font-medium text-[#6B1D2A]">{r.name}</span>
                  <span className="text-xs text-gray-400 ml-auto capitalize">{r.category.replace(/-/g, ' ')}</span>
                </button>
              ))}
              {filteredRecipes.length === 0 && (
                <p className="text-center text-gray-400 py-8 text-sm">No recipes found</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
