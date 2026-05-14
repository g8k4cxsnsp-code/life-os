import type { FoodItem, FoodUnit, ParsedFoodChunk } from '@/types'
import { getAllFoods } from './foods'

// ── Word-to-number map ─────────────────────────────────────────────────────
const WORD_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  half: 0.5, quarter: 0.25, dozen: 12,
}

// ── Unit normalisation ──────────────────────────────────────────────────────
const UNIT_MAP: Record<string, FoodUnit> = {
  g: 'g', gram: 'g', grams: 'g', gr: 'g',
  kg: 'kg', kilogram: 'kg', kilograms: 'kg',
  ml: 'ml', milliliter: 'ml', milliliters: 'ml', millilitre: 'ml',
  l: 'l', liter: 'l', liters: 'l', litre: 'l', litres: 'l',
  cup: 'cup', cups: 'cup',
  tbsp: 'tbsp', tablespoon: 'tbsp', tablespoons: 'tbsp',
  tsp: 'tsp', teaspoon: 'tsp', teaspoons: 'tsp',
  oz: 'oz', ounce: 'oz', ounces: 'oz',
  slice: 'slice', slices: 'slice',
  piece: 'piece', pieces: 'piece',
  scoop: 'item', scoops: 'item',
  serving: 'serving', servings: 'serving',
}

function parseQty(token: string): number | null {
  // Fraction like 1/2
  if (/^\d+\/\d+$/.test(token)) {
    const [a, b] = token.split('/').map(Number)
    return a / b
  }
  const n = parseFloat(token)
  if (!isNaN(n)) return n
  return WORD_NUMBERS[token.toLowerCase()] ?? null
}

// ── Levenshtein distance ────────────────────────────────────────────────────
function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  )
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    }
  }
  return dp[m][n]
}

function fuzzyMatch(query: string, foods: FoodItem[]): { food: FoodItem; confidence: number } | null {
  const q = query.toLowerCase().trim()
  if (!q) return null

  let best: { food: FoodItem; confidence: number } | null = null

  for (const food of foods) {
    const candidates = [food.name.toLowerCase(), ...food.aliases.map((a) => a.toLowerCase())]
    for (const candidate of candidates) {
      // Exact match
      if (candidate === q) return { food, confidence: 1.0 }

      // Contains match
      if (candidate.includes(q) || q.includes(candidate)) {
        const conf = Math.max(q.length, candidate.length) === 0
          ? 0
          : Math.min(q.length, candidate.length) / Math.max(q.length, candidate.length)
        if (!best || conf > best.confidence) best = { food, confidence: Math.min(conf + 0.1, 0.95) }
      }

      // Fuzzy (Levenshtein)
      const dist = levenshtein(q, candidate)
      const maxLen = Math.max(q.length, candidate.length)
      if (maxLen === 0) continue
      const conf = 1 - dist / maxLen
      if (conf > 0.6 && (!best || conf > best.confidence)) {
        best = { food, confidence: conf }
      }
    }
  }

  return best
}

// ── Unit-to-gram conversion ─────────────────────────────────────────────────
function toBaseQty(qty: number, unit: FoodUnit, food: FoodItem): number {
  if (food.per === 'item') {
    // qty in items
    if (unit === 'g') return qty
    if (unit === 'kg') return qty * 1000
    return qty  // treat as items
  }
  // food.per === '100g' or '100ml'
  switch (unit) {
    case 'g': return qty / 100
    case 'kg': return qty * 10
    case 'ml': return qty / 100
    case 'l': return qty * 10
    case 'cup': return (qty * 240) / 100
    case 'tbsp': return (qty * 15) / 100
    case 'tsp': return (qty * 5) / 100
    case 'oz': return (qty * 28.35) / 100
    default: return qty / 100
  }
}

function computeMacros(qty: number, unit: FoodUnit, food: FoodItem) {
  let multiplier: number
  if (food.per === 'item') {
    const itemGrams = food.defaultQty ?? 100
    if (unit === 'g') {
      multiplier = qty / itemGrams
    } else if (unit === 'kg') {
      multiplier = (qty * 1000) / itemGrams
    } else {
      multiplier = qty  // items count
    }
  } else {
    multiplier = toBaseQty(qty, unit, food)
  }

  return {
    kcal: Math.round(food.kcal * multiplier),
    protein: Math.round(food.protein * multiplier * 10) / 10,
    carbs: Math.round(food.carbs * multiplier * 10) / 10,
    fat: Math.round(food.fat * multiplier * 10) / 10,
  }
}

// ── Tokenize one chunk ──────────────────────────────────────────────────────
function parseChunk(raw: string, foods: FoodItem[]): ParsedFoodChunk {
  const tokens = raw.trim().toLowerCase().split(/\s+/)

  let qty = 1
  let unit: FoodUnit = 'item'
  let foodStart = 0

  // Try to parse qty from first token
  if (tokens.length > 0) {
    const q = parseQty(tokens[0])
    if (q !== null) {
      qty = q
      foodStart = 1
    }
  }

  // Try to parse unit from next token
  if (foodStart < tokens.length) {
    const potentialUnit = UNIT_MAP[tokens[foodStart]]
    if (potentialUnit) {
      unit = potentialUnit
      foodStart++
    }
  }

  const foodQuery = tokens.slice(foodStart).join(' ')
  const matchResult = fuzzyMatch(foodQuery, foods)

  if (!matchResult) {
    return {
      raw,
      qty,
      unit,
      foodQuery,
      confidence: 0,
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    }
  }

  const { food, confidence } = matchResult
  const macros = computeMacros(qty, unit, food)

  return {
    raw,
    qty,
    unit,
    foodQuery,
    match: food,
    confidence,
    ...macros,
  }
}

// ── Main parser ─────────────────────────────────────────────────────────────
export function parseNutritionInput(input: string, customFoods: FoodItem[]): ParsedFoodChunk[] {
  const foods = getAllFoods(customFoods)

  // Split on commas, "and", newlines, semicolons
  const chunks = input
    .split(/,|\band\b|\n|;/i)
    .map((c) => c.trim())
    .filter((c) => c.length > 0)

  return chunks.map((chunk) => parseChunk(chunk, foods))
}
