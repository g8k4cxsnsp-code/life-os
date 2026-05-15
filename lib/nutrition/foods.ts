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

  // ── Additional Proteins ────────────────────────────────────────────────────
  { id: 'turkey-breast', name: 'Turkey Breast', aliases: ['turkey'], per: '100g', kcal: 135, protein: 29, carbs: 0, fat: 1.5 },
  { id: 'tuna-in-water', name: 'Tuna in Water', aliases: ['tinned tuna', 'canned tuna', 'tuna can', 'tuna tin water'], per: '100g', kcal: 86, protein: 19, carbs: 0, fat: 0.5 },
  { id: 'tuna-in-oil', name: 'Tuna in Oil', aliases: ['tuna in sunflower oil'], per: '100g', kcal: 198, protein: 25, carbs: 0, fat: 11 },
  { id: 'salmon-fillet', name: 'Salmon Fillet', aliases: ['fresh salmon', 'atlantic salmon'], per: '100g', kcal: 208, protein: 20, carbs: 0, fat: 13 },
  { id: 'prawns', name: 'Prawns', aliases: ['shrimp', 'tiger prawns'], per: '100g', kcal: 99, protein: 21, carbs: 0.9, fat: 1.1 },
  { id: 'biltong-stick', name: 'Biltong Stick', aliases: ['biltong snack stick'], per: 'item', kcal: 83, protein: 17, carbs: 0.6, fat: 1.2, defaultQty: 30 },
  { id: 'droewors-stick', name: 'Droëwors Stick', aliases: ['droewors stick', 'dry wors'], per: 'item', kcal: 145, protein: 11, carbs: 0.3, fat: 11, defaultQty: 30 },
  { id: 'ostrich-mince', name: 'Ostrich Mince', aliases: ['ostrich'], per: '100g', kcal: 140, protein: 26, carbs: 0, fat: 3.5 },
  { id: 'lamb-chops', name: 'Lamb Chops', aliases: ['lamb', 'chops'], per: '100g', kcal: 294, protein: 25, carbs: 0, fat: 21 },
  { id: 'bacon', name: 'Bacon', aliases: ['streaky bacon', 'back bacon'], per: 'item', kcal: 43, protein: 3, carbs: 0.1, fat: 3.3, defaultQty: 15 },
  { id: 'ham', name: 'Ham', aliases: ['sliced ham'], per: '100g', kcal: 145, protein: 21, carbs: 1.5, fat: 5.5 },
  { id: 'ricotta', name: 'Ricotta', aliases: [], per: '100g', kcal: 174, protein: 11, carbs: 3, fat: 13 },
  { id: 'tofu', name: 'Tofu', aliases: ['firm tofu', 'bean curd'], per: '100g', kcal: 76, protein: 8, carbs: 1.9, fat: 4.2 },
  { id: 'tempeh', name: 'Tempeh', aliases: [], per: '100g', kcal: 193, protein: 19, carbs: 9, fat: 11 },
  { id: 'edamame', name: 'Edamame', aliases: ['soy beans'], per: '100g', kcal: 122, protein: 11, carbs: 10, fat: 5.2 },

  // ── Additional Grains & Carbs ──────────────────────────────────────────────
  { id: 'basmati-rice', name: 'Basmati Rice', aliases: ['basmati', 'cooked basmati'], per: '100g', kcal: 130, protein: 2.5, carbs: 28, fat: 0.2 },
  { id: 'jasmine-rice', name: 'Jasmine Rice', aliases: ['jasmine', 'thai rice'], per: '100g', kcal: 130, protein: 2.7, carbs: 29, fat: 0.3 },
  { id: 'quinoa', name: 'Quinoa', aliases: ['cooked quinoa'], per: '100g', kcal: 120, protein: 4.4, carbs: 22, fat: 1.9 },
  { id: 'couscous', name: 'Couscous', aliases: [], per: '100g', kcal: 112, protein: 3.8, carbs: 23, fat: 0.2 },
  { id: 'butternut', name: 'Butternut Squash', aliases: ['butternut', 'butternut squash'], per: '100g', kcal: 45, protein: 1, carbs: 12, fat: 0.1 },
  { id: 'baby-potatoes', name: 'Baby Potatoes', aliases: ['baby potatoes', 'small potatoes'], per: '100g', kcal: 72, protein: 1.7, carbs: 16, fat: 0.1 },
  { id: 'whole-wheat-pasta', name: 'Whole Wheat Pasta', aliases: ['wholewheat pasta', 'brown pasta'], per: '100g', kcal: 151, protein: 5.5, carbs: 28, fat: 0.9 },
  { id: 'rice-noodles', name: 'Rice Noodles', aliases: ['rice noodle', 'pad thai noodles'], per: '100g', kcal: 108, protein: 0.9, carbs: 25, fat: 0.2 },
  { id: 'rye-bread', name: 'Rye Bread', aliases: ['rye', 'dark bread'], per: 'item', kcal: 83, protein: 2.7, carbs: 15, fat: 1.1, defaultQty: 32 },
  { id: 'bagel', name: 'Bagel', aliases: [], per: 'item', kcal: 245, protein: 9.7, carbs: 48, fat: 1.5, defaultQty: 98 },
  { id: 'croissant', name: 'Croissant', aliases: [], per: 'item', kcal: 272, protein: 5.5, carbs: 31, fat: 14, defaultQty: 57 },
  { id: 'pita-bread', name: 'Pita Bread', aliases: ['pita', 'pitta'], per: 'item', kcal: 165, protein: 5.5, carbs: 33, fat: 1, defaultQty: 60 },
  { id: 'mealie-meal', name: 'Mealie Meal', aliases: ['mealie', 'mealiemeal', 'maize meal'], per: '100g', kcal: 362, protein: 7.5, carbs: 79, fat: 1.5 },
  { id: 'samp', name: 'Samp', aliases: ['samp and beans', 'umngqusho'], per: '100g', kcal: 356, protein: 10, carbs: 74, fat: 1.2 },

  // ── Additional Fruits ──────────────────────────────────────────────────────
  { id: 'raspberry', name: 'Raspberries', aliases: ['raspberry'], per: '100g', kcal: 52, protein: 1.2, carbs: 12, fat: 0.7 },
  { id: 'kiwi', name: 'Kiwi', aliases: ['kiwifruit', 'kiwis'], per: 'item', kcal: 42, protein: 0.8, carbs: 10, fat: 0.4, defaultQty: 76 },
  { id: 'plum', name: 'Plum', aliases: ['plums'], per: 'item', kcal: 30, protein: 0.5, carbs: 7.5, fat: 0.2, defaultQty: 66 },
  { id: 'pear', name: 'Pear', aliases: ['pears'], per: 'item', kcal: 57, protein: 0.4, carbs: 15, fat: 0.1, defaultQty: 178 },
  { id: 'granadilla', name: 'Granadilla', aliases: ['passion fruit', 'passionfruit'], per: 'item', kcal: 17, protein: 0.4, carbs: 4.2, fat: 0.1, defaultQty: 35 },
  { id: 'naartjie', name: 'Naartjie', aliases: ['tangerine', 'mandarin', 'clementine'], per: 'item', kcal: 37, protein: 0.5, carbs: 9.4, fat: 0.2, defaultQty: 88 },
  { id: 'litchi', name: 'Litchi', aliases: ['lychee', 'litchis', 'lychees'], per: '100g', kcal: 66, protein: 0.8, carbs: 17, fat: 0.4 },
  { id: 'dates', name: 'Dates', aliases: ['date', 'medjool date'], per: 'item', kcal: 23, protein: 0.2, carbs: 6.2, fat: 0, defaultQty: 8 },
  { id: 'dried-mango', name: 'Dried Mango', aliases: ['dried mango strips'], per: '100g', kcal: 314, protein: 2.5, carbs: 78, fat: 0.5 },
  { id: 'melon', name: 'Cantaloupe / Spanspek', aliases: ['melon', 'spanspek', 'cantaloupe'], per: '100g', kcal: 34, protein: 0.8, carbs: 8, fat: 0.2 },

  // ── Additional Vegetables ──────────────────────────────────────────────────
  { id: 'cauliflower', name: 'Cauliflower', aliases: [], per: '100g', kcal: 25, protein: 1.9, carbs: 5, fat: 0.3 },
  { id: 'kale', name: 'Kale', aliases: [], per: '100g', kcal: 49, protein: 4.3, carbs: 8.8, fat: 0.9 },
  { id: 'baby-marrow', name: 'Baby Marrow', aliases: ['zucchini', 'courgette', 'baby marrows'], per: '100g', kcal: 17, protein: 1.2, carbs: 3.1, fat: 0.3 },
  { id: 'mushrooms', name: 'Mushrooms', aliases: ['button mushrooms', 'portabello'], per: '100g', kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3 },
  { id: 'peppers', name: 'Bell Peppers', aliases: ['pepper', 'capsicum', 'red pepper', 'green pepper'], per: '100g', kcal: 31, protein: 1, carbs: 6, fat: 0.3 },
  { id: 'gem-squash', name: 'Gem Squash', aliases: ['gem squash'], per: 'item', kcal: 45, protein: 1.8, carbs: 10, fat: 0.4, defaultQty: 100 },

  // ── Additional Dairy ───────────────────────────────────────────────────────
  { id: 'greek-yogurt-full', name: 'Full Fat Greek Yogurt', aliases: ['full fat greek yogurt', 'full cream greek yoghurt'], per: '100g', kcal: 97, protein: 9, carbs: 3.8, fat: 5 },
  { id: 'plain-yogurt', name: 'Plain Yogurt', aliases: ['plain yoghurt', 'natural yogurt'], per: '100g', kcal: 61, protein: 3.5, carbs: 4.7, fat: 3.3 },
  { id: 'double-cream-yogurt', name: 'Double Cream Yogurt', aliases: ['double cream yoghurt', 'woolworths yogurt'], per: '100g', kcal: 122, protein: 2.8, carbs: 4.5, fat: 11 },
  { id: 'milk-skim', name: 'Skim Milk', aliases: ['fat free milk', '0% milk'], per: '100ml', kcal: 34, protein: 3.4, carbs: 5, fat: 0.1 },
  { id: 'oat-milk', name: 'Oat Milk', aliases: ['oat drink', 'oatly'], per: '100ml', kcal: 46, protein: 1, carbs: 7, fat: 1.5 },
  { id: 'almond-milk', name: 'Almond Milk', aliases: [], per: '100ml', kcal: 17, protein: 0.6, carbs: 1.6, fat: 1.1 },
  { id: 'soy-milk', name: 'Soy Milk', aliases: ['soya milk'], per: '100ml', kcal: 33, protein: 3.3, carbs: 1.3, fat: 1.8 },
  { id: 'feta', name: 'Feta Cheese', aliases: ['feta'], per: '100g', kcal: 264, protein: 14, carbs: 4, fat: 21 },
  { id: 'mozzarella', name: 'Mozzarella', aliases: ['mozza', 'mozzarella cheese'], per: '100g', kcal: 280, protein: 28, carbs: 2.2, fat: 17 },
  { id: 'parmesan', name: 'Parmesan', aliases: ['parmigiano', 'grated parmesan'], per: '100g', kcal: 431, protein: 38, carbs: 4, fat: 29 },
  { id: 'cream-cheese', name: 'Cream Cheese', aliases: ['philadelphia', 'philly'], per: '100g', kcal: 342, protein: 6, carbs: 4.1, fat: 34 },

  // ── Additional Snacks ──────────────────────────────────────────────────────
  { id: 'quest-bar', name: 'Quest Bar', aliases: ['quest protein bar'], per: 'item', kcal: 190, protein: 21, carbs: 24, fat: 7, defaultQty: 60 },
  { id: 'pecans', name: 'Pecans', aliases: ['pecan nuts'], per: '100g', kcal: 691, protein: 9.2, carbs: 14, fat: 72 },
  { id: 'mixed-nuts', name: 'Mixed Nuts', aliases: ['nuts mix', 'trail mix'], per: '100g', kcal: 607, protein: 16, carbs: 19, fat: 55 },
  { id: 'popcorn', name: 'Popcorn', aliases: ['air popped popcorn', 'microwave popcorn'], per: '100g', kcal: 387, protein: 12, carbs: 78, fat: 4.5 },
  { id: 'rice-cakes', name: 'Rice Cakes', aliases: ['rice cake'], per: 'item', kcal: 35, protein: 0.7, carbs: 7.3, fat: 0.3, defaultQty: 9 },
  { id: 'beef-jerky', name: 'Beef Jerky', aliases: ['jerky'], per: '100g', kcal: 299, protein: 33, carbs: 7, fat: 12 },
  { id: 'dark-choc-70', name: 'Dark Chocolate 70%', aliases: ['dark chocolate', '70% chocolate'], per: '100g', kcal: 598, protein: 7.8, carbs: 46, fat: 43 },
  { id: 'milk-choc', name: 'Milk Chocolate', aliases: ['milk chocolate slab'], per: '100g', kcal: 535, protein: 7.7, carbs: 59, fat: 30 },
  { id: 'lindor', name: 'Lindt Lindor', aliases: ['lindor truffle', 'lindt truffle'], per: 'item', kcal: 73, protein: 0.7, carbs: 7.3, fat: 4.6, defaultQty: 12.5 },
  { id: 'kitkat', name: 'KitKat', aliases: ['kit kat'], per: 'item', kcal: 218, protein: 2.7, carbs: 27, fat: 11, defaultQty: 41 },
  { id: 'bar-one', name: 'Bar-One', aliases: ['bar one'], per: 'item', kcal: 220, protein: 2.5, carbs: 33, fat: 9, defaultQty: 45 },

  // ── Drinks ─────────────────────────────────────────────────────────────────
  { id: 'latte-small', name: 'Latte (Small)', aliases: ['flat white small', 'small latte', 'latte small'], per: 'item', kcal: 100, protein: 6, carbs: 10, fat: 3.5, defaultQty: 200 },
  { id: 'latte-medium', name: 'Latte (Medium)', aliases: ['medium latte', 'latte medium'], per: 'item', kcal: 150, protein: 8, carbs: 14, fat: 5, defaultQty: 300 },
  { id: 'latte-large', name: 'Latte (Large)', aliases: ['large latte', 'latte large'], per: 'item', kcal: 200, protein: 11, carbs: 19, fat: 7, defaultQty: 400 },
  { id: 'cappuccino', name: 'Cappuccino', aliases: ['capp', 'cap'], per: 'item', kcal: 80, protein: 5, carbs: 8, fat: 3, defaultQty: 180 },
  { id: 'flat-white', name: 'Flat White', aliases: [], per: 'item', kcal: 120, protein: 7, carbs: 10, fat: 5, defaultQty: 240 },
  { id: 'coke-can', name: 'Coca-Cola Can', aliases: ['coke', 'coca cola', 'coke can'], per: 'item', kcal: 139, protein: 0, carbs: 35, fat: 0, defaultQty: 330 },
  { id: 'coke-zero', name: 'Coke Zero', aliases: ['coke zero can', 'zero sugar coke'], per: 'item', kcal: 1, protein: 0, carbs: 0.1, fat: 0, defaultQty: 330 },
  { id: 'sprite-can', name: 'Sprite Can', aliases: ['sprite', 'lemonade'], per: 'item', kcal: 130, protein: 0, carbs: 33, fat: 0, defaultQty: 330 },
  { id: 'fanta-can', name: 'Fanta Can', aliases: ['fanta orange'], per: 'item', kcal: 149, protein: 0, carbs: 37, fat: 0, defaultQty: 330 },
  { id: 'energade', name: 'Energade', aliases: ['energy drink sports'], per: 'item', kcal: 95, protein: 0, carbs: 24, fat: 0, defaultQty: 500 },
  { id: 'powerade', name: 'Powerade', aliases: ['sports drink'], per: 'item', kcal: 130, protein: 0, carbs: 33, fat: 0, defaultQty: 500 },
  { id: 'red-bull', name: 'Red Bull', aliases: ['redbull', 'energy drink'], per: 'item', kcal: 113, protein: 1.2, carbs: 28, fat: 0, defaultQty: 250 },
  { id: 'beer-lager', name: 'Beer (Lager)', aliases: ['beer', 'castle', 'stella', 'heineken'], per: 'item', kcal: 153, protein: 1.3, carbs: 13, fat: 0, defaultQty: 330 },
  { id: 'wine-red', name: 'Red Wine', aliases: ['red wine', 'wine'], per: 'item', kcal: 125, protein: 0.1, carbs: 3.8, fat: 0, defaultQty: 150 },
  { id: 'wine-white', name: 'White Wine', aliases: ['white wine'], per: 'item', kcal: 121, protein: 0.1, carbs: 3.8, fat: 0, defaultQty: 150 },
  { id: 'whiskey', name: 'Whiskey Shot', aliases: ['whisky', 'bourbon', 'scotch'], per: 'item', kcal: 97, protein: 0, carbs: 0, fat: 0, defaultQty: 44 },
  { id: 'gin-tonic', name: 'Gin & Tonic', aliases: ['g&t', 'gin and tonic'], per: 'item', kcal: 140, protein: 0, carbs: 11, fat: 0, defaultQty: 200 },
]

import { COMPOSITE_FOODS } from './composite-foods'

export function getAllFoods(customFoods: FoodItem[]): FoodItem[] {
  return [...FOODS_DB, ...COMPOSITE_FOODS, ...customFoods]
}
