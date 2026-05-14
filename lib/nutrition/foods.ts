import type { FoodItem } from '@/types'

// Macros per 100g unless noted. kcal, protein, carbs, fat
export const FOODS_DB: FoodItem[] = [
  // ── Fruits ─────────────────────────────────────────────────────────────
  { id: 'banana', name: 'Banana', aliases: ['bananas', 'nana'], per: 'item', kcal: 89, protein: 1.1, carbs: 23, fat: 0.3, defaultQty: 118 },
  { id: 'apple', name: 'Apple', aliases: ['apples'], per: 'item', kcal: 52, protein: 0.3, carbs: 14, fat: 0.2, defaultQty: 182 },
  { id: 'orange', name: 'Orange', aliases: ['oranges'], per: 'item', kcal: 47, protein: 0.9, carbs: 12, fat: 0.1, defaultQty: 131 },
  { id: 'grape', name: 'Grapes', aliases: ['grape'], per: '100g', kcal: 67, protein: 0.6, carbs: 17, fat: 0.4 },
  { id: 'strawberry', name: 'Strawberries', aliases: ['strawberry'], per: '100g', kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3 },
  { id: 'blueberry', name: 'Blueberries', aliases: ['blueberry'], per: '100g', kcal: 57, protein: 0.7, carbs: 14, fat: 0.3 },
  { id: 'mango', name: 'Mango', aliases: ['mangoes', 'mango'], per: 'item', kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, defaultQty: 200 },
  { id: 'watermelon', name: 'Watermelon', aliases: [], per: '100g', kcal: 30, protein: 0.6, carbs: 7.6, fat: 0.2 },
  { id: 'avocado', name: 'Avocado', aliases: ['avo', 'avocados'], per: 'item', kcal: 160, protein: 2, carbs: 9, fat: 15, defaultQty: 150 },
  { id: 'pineapple', name: 'Pineapple', aliases: [], per: '100g', kcal: 50, protein: 0.5, carbs: 13, fat: 0.1 },
  { id: 'peach', name: 'Peach', aliases: ['peaches'], per: 'item', kcal: 39, protein: 0.9, carbs: 10, fat: 0.3, defaultQty: 150 },

  // ── Vegetables ──────────────────────────────────────────────────────────
  { id: 'broccoli', name: 'Broccoli', aliases: [], per: '100g', kcal: 34, protein: 2.8, carbs: 7, fat: 0.4 },
  { id: 'spinach', name: 'Spinach', aliases: [], per: '100g', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4 },
  { id: 'carrot', name: 'Carrots', aliases: ['carrot'], per: '100g', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2 },
  { id: 'sweet-potato', name: 'Sweet Potato', aliases: ['sweet potatoes', 'sweetpotato'], per: '100g', kcal: 86, protein: 1.6, carbs: 20, fat: 0.1 },
  { id: 'potato', name: 'Potato', aliases: ['potatoes'], per: '100g', kcal: 77, protein: 2, carbs: 17, fat: 0.1 },
  { id: 'tomato', name: 'Tomato', aliases: ['tomatoes'], per: 'item', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, defaultQty: 123 },
  { id: 'cucumber', name: 'Cucumber', aliases: [], per: '100g', kcal: 15, protein: 0.7, carbs: 3.6, fat: 0.1 },
  { id: 'lettuce', name: 'Lettuce', aliases: [], per: '100g', kcal: 15, protein: 1.4, carbs: 2.9, fat: 0.2 },
  { id: 'onion', name: 'Onion', aliases: ['onions'], per: '100g', kcal: 40, protein: 1.1, carbs: 9.3, fat: 0.1 },
  { id: 'garlic', name: 'Garlic', aliases: [], per: '100g', kcal: 149, protein: 6.4, carbs: 33, fat: 0.5 },
  { id: 'corn', name: 'Corn', aliases: ['sweetcorn', 'maize'], per: '100g', kcal: 86, protein: 3.3, carbs: 19, fat: 1.4 },
  { id: 'peas', name: 'Peas', aliases: ['green peas'], per: '100g', kcal: 81, protein: 5.4, carbs: 14, fat: 0.4 },

  // ── Grains & Carbs ──────────────────────────────────────────────────────
  { id: 'oats', name: 'Oats', aliases: ['oatmeal', 'rolled oats', 'porridge'], per: '100g', kcal: 389, protein: 17, carbs: 66, fat: 7 },
  { id: 'white-rice', name: 'White Rice', aliases: ['rice', 'cooked rice', 'steamed rice'], per: '100g', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3 },
  { id: 'brown-rice', name: 'Brown Rice', aliases: [], per: '100g', kcal: 122, protein: 2.6, carbs: 25, fat: 0.9 },
  { id: 'pasta', name: 'Pasta', aliases: ['spaghetti', 'penne', 'cooked pasta'], per: '100g', kcal: 158, protein: 5.8, carbs: 31, fat: 0.9 },
  { id: 'bread-white', name: 'White Bread', aliases: ['white bread', 'toast', 'slice bread'], per: 'item', kcal: 79, protein: 2.7, carbs: 15, fat: 1, defaultQty: 30 },
  { id: 'bread-brown', name: 'Brown Bread', aliases: ['brown bread', 'wholewheat bread', 'whole wheat'], per: 'item', kcal: 69, protein: 3.5, carbs: 12, fat: 1.1, defaultQty: 30 },
  { id: 'pap', name: 'Pap', aliases: ['mealie pap', 'mieliepap', 'maize pap', 'sadza'], per: '100g', kcal: 174, protein: 3.9, carbs: 38, fat: 0.5 },
  { id: 'roti', name: 'Roti', aliases: ['chapati'], per: 'item', kcal: 104, protein: 3, carbs: 19, fat: 2.3, defaultQty: 45 },
  { id: 'tortilla', name: 'Tortilla', aliases: ['wrap'], per: 'item', kcal: 146, protein: 4, carbs: 25, fat: 3.5, defaultQty: 45 },
  { id: 'crackers', name: 'Crackers', aliases: ['cream crackers'], per: 'item', kcal: 50, protein: 1, carbs: 8, fat: 1.5, defaultQty: 13 },
  { id: 'rusks', name: 'Rusks', aliases: ['buttermilk rusks', 'ouma rusks'], per: 'item', kcal: 137, protein: 2.6, carbs: 24, fat: 3.5, defaultQty: 40 },

  // ── Proteins ────────────────────────────────────────────────────────────
  { id: 'chicken-breast', name: 'Chicken Breast', aliases: ['chicken', 'grilled chicken', 'cooked chicken'], per: '100g', kcal: 165, protein: 31, carbs: 0, fat: 3.6 },
  { id: 'chicken-thigh', name: 'Chicken Thigh', aliases: ['chicken thighs'], per: '100g', kcal: 209, protein: 26, carbs: 0, fat: 11 },
  { id: 'beef-mince', name: 'Beef Mince', aliases: ['ground beef', 'mince', 'beef mince'], per: '100g', kcal: 254, protein: 26, carbs: 0, fat: 17 },
  { id: 'steak', name: 'Steak', aliases: ['beef steak', 'sirloin', 'ribeye'], per: '100g', kcal: 217, protein: 26, carbs: 0, fat: 12 },
  { id: 'tuna', name: 'Tuna', aliases: ['canned tuna', 'tuna tin'], per: '100g', kcal: 116, protein: 26, carbs: 0, fat: 1 },
  { id: 'salmon', name: 'Salmon', aliases: ['salmon fillet'], per: '100g', kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { id: 'egg', name: 'Egg', aliases: ['eggs', 'whole egg'], per: 'item', kcal: 78, protein: 6, carbs: 0.6, fat: 5, defaultQty: 50 },
  { id: 'egg-white', name: 'Egg White', aliases: ['egg whites'], per: 'item', kcal: 17, protein: 3.6, carbs: 0.2, fat: 0.1, defaultQty: 30 },
  { id: 'whey-protein', name: 'Whey Protein', aliases: ['protein shake', 'whey', 'protein powder', 'protein'], per: 'item', kcal: 120, protein: 25, carbs: 3, fat: 2, defaultQty: 30 },
  { id: 'biltong', name: 'Biltong', aliases: [], per: '100g', kcal: 275, protein: 57, carbs: 2, fat: 4 },
  { id: 'boerewors', name: 'Boerewors', aliases: ['boerie'], per: '100g', kcal: 320, protein: 18, carbs: 1, fat: 27 },
  { id: 'sausage', name: 'Sausage', aliases: ['vienna', 'frankfurter'], per: 'item', kcal: 180, protein: 8, carbs: 2, fat: 16, defaultQty: 60 },
  { id: 'pork-chop', name: 'Pork Chop', aliases: ['pork'], per: '100g', kcal: 231, protein: 25, carbs: 0, fat: 14 },
  { id: 'sardines', name: 'Sardines', aliases: ['pilchards'], per: '100g', kcal: 208, protein: 25, carbs: 0, fat: 11 },
  { id: 'droewors', name: 'Droëwors', aliases: ['droewors', 'dry sausage'], per: '100g', kcal: 485, protein: 38, carbs: 1, fat: 37 },

  // ── Dairy ────────────────────────────────────────────────────────────────
  { id: 'milk-full', name: 'Full Cream Milk', aliases: ['milk', 'full cream', 'whole milk'], per: '100ml', kcal: 61, protein: 3.2, carbs: 4.8, fat: 3.3 },
  { id: 'milk-low', name: 'Low Fat Milk', aliases: ['low fat milk', 'skim milk'], per: '100ml', kcal: 42, protein: 3.4, carbs: 5, fat: 1 },
  { id: 'greek-yogurt', name: 'Greek Yogurt', aliases: ['greek yoghurt', 'yogurt', 'yoghurt'], per: '100g', kcal: 59, protein: 10, carbs: 3.6, fat: 0.4 },
  { id: 'cottage-cheese', name: 'Cottage Cheese', aliases: ['cottage cheese'], per: '100g', kcal: 98, protein: 11, carbs: 3.4, fat: 4.3 },
  { id: 'cheddar', name: 'Cheddar Cheese', aliases: ['cheese', 'cheddar'], per: '100g', kcal: 403, protein: 25, carbs: 1.3, fat: 33 },
  { id: 'butter', name: 'Butter', aliases: [], per: '100g', kcal: 717, protein: 0.9, carbs: 0.1, fat: 81 },

  // ── Fats & Spreads ───────────────────────────────────────────────────────
  { id: 'peanut-butter', name: 'Peanut Butter', aliases: ['peanut butter', 'pb'], per: '100g', kcal: 588, protein: 25, carbs: 20, fat: 50 },
  { id: 'almond-butter', name: 'Almond Butter', aliases: [], per: '100g', kcal: 614, protein: 21, carbs: 19, fat: 56 },
  { id: 'olive-oil', name: 'Olive Oil', aliases: ['oil'], per: '100ml', kcal: 884, protein: 0, carbs: 0, fat: 100 },
  { id: 'almonds', name: 'Almonds', aliases: ['almond'], per: '100g', kcal: 579, protein: 21, carbs: 22, fat: 50 },
  { id: 'cashews', name: 'Cashews', aliases: ['cashew'], per: '100g', kcal: 553, protein: 18, carbs: 30, fat: 44 },
  { id: 'walnuts', name: 'Walnuts', aliases: [], per: '100g', kcal: 654, protein: 15, carbs: 14, fat: 65 },
  { id: 'sunflower-seeds', name: 'Sunflower Seeds', aliases: [], per: '100g', kcal: 584, protein: 21, carbs: 20, fat: 51 },

  // ── Drinks ───────────────────────────────────────────────────────────────
  { id: 'water', name: 'Water', aliases: [], per: '100ml', kcal: 0, protein: 0, carbs: 0, fat: 0 },
  { id: 'orange-juice', name: 'Orange Juice', aliases: ['oj'], per: '100ml', kcal: 45, protein: 0.7, carbs: 10, fat: 0.2 },
  { id: 'coffee-black', name: 'Black Coffee', aliases: ['coffee', 'americano', 'espresso'], per: '100ml', kcal: 2, protein: 0.3, carbs: 0, fat: 0 },
  { id: 'rooibos', name: 'Rooibos Tea', aliases: ['rooibos'], per: '100ml', kcal: 1, protein: 0, carbs: 0.1, fat: 0 },

  // ── Snacks & Fast Food ────────────────────────────────────────────────────
  { id: 'granola-bar', name: 'Granola Bar', aliases: ['bar', 'cereal bar'], per: 'item', kcal: 193, protein: 4, carbs: 29, fat: 7, defaultQty: 47 },
  { id: 'chocolate', name: 'Dark Chocolate', aliases: ['chocolate', 'dark choc'], per: '100g', kcal: 598, protein: 7.8, carbs: 46, fat: 43 },
  { id: 'chips', name: 'Chips', aliases: ['crisps', 'potato chips', 'lays'], per: '100g', kcal: 536, protein: 7, carbs: 53, fat: 35 },
  { id: 'pizza-slice', name: 'Pizza Slice', aliases: ['pizza'], per: 'item', kcal: 285, protein: 12, carbs: 36, fat: 10, defaultQty: 107 },
  { id: 'burger', name: 'Burger', aliases: ['cheeseburger', 'hamburger'], per: 'item', kcal: 495, protein: 25, carbs: 40, fat: 25, defaultQty: 200 },

  // ── Meal Combos / SA Staples ──────────────────────────────────────────────
  { id: 'braai-plate', name: 'Braai Plate', aliases: ['braai'], per: 'item', kcal: 600, protein: 35, carbs: 15, fat: 45, defaultQty: 250 },
  { id: 'pap-vleis', name: 'Pap & Vleis', aliases: ['pap and vleis'], per: 'item', kcal: 520, protein: 28, carbs: 55, fat: 20, defaultQty: 300 },
  { id: 'bunny-chow', name: 'Bunny Chow', aliases: ['bunny'], per: 'item', kcal: 650, protein: 22, carbs: 90, fat: 18, defaultQty: 350 },

  // ── Fitness Meals ─────────────────────────────────────────────────────────
  { id: 'mass-gainer', name: 'Mass Gainer Shake', aliases: ['mass gainer', 'gainer'], per: 'item', kcal: 750, protein: 50, carbs: 110, fat: 8, defaultQty: 150 },
  { id: 'protein-bar', name: 'Protein Bar', aliases: ['quest bar', 'protein bar'], per: 'item', kcal: 200, protein: 20, carbs: 22, fat: 7, defaultQty: 60 },
  { id: 'rice-chicken', name: 'Rice & Chicken', aliases: ['chicken and rice'], per: 'item', kcal: 395, protein: 35, carbs: 45, fat: 5, defaultQty: 300 },
]

export function getAllFoods(customFoods: FoodItem[]): FoodItem[] {
  return [...FOODS_DB, ...customFoods]
}
