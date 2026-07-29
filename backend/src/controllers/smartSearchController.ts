// backend/src/controllers/smartSearchController.ts
import { Request, Response } from 'express';
import Vehicle from '../models/Vehicle';

/**
 * Lightweight NLP parser that extracts structured query parameters
 * from a natural language search string.
 *
 * Examples:
 *   "fast electric cars under $80k"   → { category: 'Electric', maxPrice: 80000 }
 *   "show me cheap SUVs"              → { category: 'SUV', maxPrice: 30000 }
 *   "luxury sedans over 50000"        → { category: 'Sedan', minPrice: 50000 }
 *   "Toyota trucks"                   → { make: 'Toyota', category: 'Truck' }
 *   "2024 BMW"                        → { year: 2024, make: 'BMW' }
 */
const parseNaturalLanguage = (query: string) => {
  const q = query.toLowerCase();
  const filter: any = {};

  // ── Extract explicit price constraints ──
  const underMatch = q.match(/(?:under|below|less than|max|up to|cheaper than)\s*\$?([\d,]+)k?/i);
  if (underMatch) {
    let val = parseInt(underMatch[1].replace(/,/g, ''));
    if (val < 1000) val *= 1000; // "80k" → 80000
    filter.maxPrice = val;
  }

  const overMatch = q.match(/(?:over|above|more than|min|at least|starting at)\s*\$?([\d,]+)k?/i);
  if (overMatch) {
    let val = parseInt(overMatch[1].replace(/,/g, ''));
    if (val < 1000) val *= 1000;
    filter.minPrice = val;
  }

  const rangeMatch = q.match(/(?:between|\$)\s*([\d,]+)k?\s*(?:and|to|-)\s*\$?([\d,]+)k?/i);
  if (rangeMatch) {
    let low = parseInt(rangeMatch[1].replace(/,/g, ''));
    let high = parseInt(rangeMatch[2].replace(/,/g, ''));
    if (low < 1000) low *= 1000;
    if (high < 1000) high *= 1000;
    filter.minPrice = low;
    filter.maxPrice = high;
  }

  // ── Extract year ──
  const yearMatch = q.match(/\b(20[0-9]{2})\b/);
  if (yearMatch) {
    filter.year = parseInt(yearMatch[1]);
  }

  // ── Extract category via keyword matching ──
  const categoryKeywords: Record<string, string[]> = {
    'Electric': ['electric', 'ev', 'battery', 'zero emission', 'hybrid'],
    'SUV': ['suv', 'crossover', 'sport utility'],
    'Sedan': ['sedan', 'saloon', 'luxury sedan'],
    'Truck': ['truck', 'pickup', 'hauler'],
    'Sports': ['sports', 'fast', 'performance', 'speed', 'supercar', 'coupe', 'muscle'],
    'Luxury': ['luxury', 'premium', 'high-end', 'executive'],
    'Compact': ['compact', 'small', 'city car', 'hatchback'],
    'Minivan': ['minivan', 'van', 'family'],
  };

  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some(kw => q.includes(kw))) {
      filter.category = category;
      break;
    }
  }

  // ── Extract budget keywords ──
  if (!filter.maxPrice && !filter.minPrice) {
    if (/\b(cheap|affordable|budget|inexpensive)\b/.test(q)) {
      filter.maxPrice = 30000;
    }
    if (/\b(expensive|premium|high.?end|luxury)\b/.test(q)) {
      filter.minPrice = 50000;
    }
  }

  // ── Extract make from known brands ──
  const knownMakes = [
    'toyota', 'honda', 'ford', 'chevrolet', 'chevy', 'bmw', 'mercedes', 
    'audi', 'tesla', 'nissan', 'hyundai', 'kia', 'volkswagen', 'vw',
    'subaru', 'mazda', 'lexus', 'porsche', 'jeep', 'dodge', 'ram',
    'gmc', 'cadillac', 'buick', 'acura', 'infiniti', 'volvo', 'jaguar',
    'land rover', 'mini', 'fiat', 'alfa romeo', 'genesis', 'lincoln',
    'chrysler', 'mitsubishi', 'suzuki', 'rivian', 'lucid', 'polestar'
  ];
  const aliasMap: Record<string, string> = {
    'chevy': 'Chevrolet', 'vw': 'Volkswagen', 'merc': 'Mercedes',
  };

  for (const make of knownMakes) {
    if (q.includes(make)) {
      filter.make = aliasMap[make] || make.charAt(0).toUpperCase() + make.slice(1);
      break;
    }
  }

  return filter;
};

/**
 * POST /api/vehicles/smart-search
 * AI-powered natural language vehicle search
 */
export const smartSearch = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: 'Please provide a search query',
      });
      return;
    }

    // Parse natural language into structured filters
    const parsed = parseNaturalLanguage(query);

    // Build MongoDB filter
    const mongoFilter: any = {};

    if (parsed.make) {
      mongoFilter.make = { $regex: parsed.make, $options: 'i' };
    }
    if (parsed.category) {
      mongoFilter.category = { $regex: parsed.category, $options: 'i' };
    }
    if (parsed.year) {
      mongoFilter.year = parsed.year;
    }
    if (parsed.minPrice || parsed.maxPrice) {
      mongoFilter.price = {};
      if (parsed.minPrice) mongoFilter.price.$gte = parsed.minPrice;
      if (parsed.maxPrice) mongoFilter.price.$lte = parsed.maxPrice;
    }

    const vehicles = await Vehicle.find(mongoFilter);

    res.status(200).json({
      success: true,
      data: vehicles,
      meta: {
        originalQuery: query,
        parsedFilters: parsed,
        resultCount: vehicles.length,
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
