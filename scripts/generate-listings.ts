import fs from 'fs';
import path from 'path';

export interface Listing {
  id: string;
  category: string;
  brand: string;
  model: string;
  trim: string;
  year: number;
  color: string;
  listingType: 'rent' | 'buy' | 'both';
  price: number | null;
  dailyRate: number | null;
  mileage: number;
  condition: 'new' | 'used';
  fuelType: string;
  seats: number;
  location: string;
  availabilityDate: string;
  marketplace: string;
  features: string[];
  imageUrl: string;
}

const COLORS = [
  'Midnight Black', 'Pearl White', 'Silver Metallic', 'Deep Red', 'Navy Blue',
  'Forest Green', 'Champagne Gold', 'Slate Grey', 'Burnt Orange', 'Sapphire Blue',
  'Arctic White', 'Matte Black', 'Racing Red', 'Sky Blue', 'Olive Green',
];

const CITIES = ['Los Angeles, CA', 'San Francisco, CA', 'New York, NY', 'Austin, TX', 'Miami, FL', 'Chicago, IL', 'Seattle, WA', 'Denver, CO', 'Phoenix, AZ', 'Dallas, TX'];
const MARKETPLACES = ['Apex Auto Exchange', 'Velox Motors Direct', 'DriveNow Select', 'Summit Luxury Gallery', 'EcoDrive Network', 'Metro AutoMart'];
const FEATURES_POOL = [
  'Adaptive Cruise Control', 'Panoramic Sunroof', 'Apple CarPlay & Android Auto',
  'Leather Heated Seats', 'Ventilated Seats', '360-Degree Camera', 'Heads-Up Display',
  'Premium Sound System', 'Blind Spot Monitor', 'Lane Keep Assist', 'AWD / 4WD',
  'Fast DC Charging', 'Wireless Charging Pad', 'Third-Row Seating', 'Power Liftgate',
];

const CAR_IMAGES: Record<string, string> = {
  SUV: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80',
  Sedan: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80',
  'Compact/Hatchback': 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=800&q=80',
  'Truck/Pickup': 'https://images.unsplash.com/photo-1559416523-140ddc3d238c?auto=format&fit=crop&w=800&q=80',
  Minivan: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80',
  Coupe: 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=800&q=80',
  Convertible: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
  Electric: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  Hybrid: 'https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80',
  Luxury: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=800&q=80',
  'Sports Car': 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=800&q=80',
  'Off-Road/4x4': 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=800&q=80',
};

// Category-specific brand/model definitions — models MATCH their category
const CATEGORY_LISTINGS: Record<string, Array<{ brand: string; model: string; trim: string; fuelType: string; seats: number; isPremium: boolean }>> = {
  Sedan: [
    { brand: 'Toyota', model: 'Camry', trim: 'XLE', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'Corolla', trim: 'SE', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Honda', model: 'Civic', trim: 'EX-L', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Honda', model: 'Accord', trim: 'Sport', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Hyundai', model: 'Elantra', trim: 'SEL', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Kia', model: 'K5', trim: 'GT-Line', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Mazda', model: 'Mazda3', trim: 'Preferred', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Volkswagen', model: 'Jetta', trim: 'SE', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Nissan', model: 'Altima', trim: 'SL', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Chevrolet', model: 'Malibu', trim: 'LT', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Subaru', model: 'Legacy', trim: 'Premium', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'BMW', model: '3 Series', trim: 'xDrive30i', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Mercedes-Benz', model: 'C-Class', trim: 'AMG Line', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Audi', model: 'A4', trim: 'Premium Plus', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Lexus', model: 'IS 300', trim: 'F Sport', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Genesis', model: 'G70', trim: 'Select', fuelType: 'Gasoline', seats: 5, isPremium: true },
  ],
  SUV: [
    { brand: 'Toyota', model: 'RAV4', trim: 'XLE', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'Highlander', trim: 'Limited', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Honda', model: 'CR-V', trim: 'Touring', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Honda', model: 'Pilot', trim: 'EX-L', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Ford', model: 'Explorer', trim: 'XLT', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Hyundai', model: 'Tucson', trim: 'SEL', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Hyundai', model: 'Palisade', trim: 'Limited', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Kia', model: 'Sportage', trim: 'SX Prestige', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Kia', model: 'Telluride', trim: 'EX', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Mazda', model: 'CX-5', trim: 'Turbo', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Subaru', model: 'Forester', trim: 'Limited', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'BMW', model: 'X3', trim: 'xDrive30i', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'BMW', model: 'X5', trim: 'M Sport', fuelType: 'Gasoline', seats: 7, isPremium: true },
    { brand: 'Mercedes-Benz', model: 'GLC 300', trim: '4MATIC', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Lexus', model: 'RX 350', trim: 'Luxury', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Audi', model: 'Q5', trim: 'Prestige', fuelType: 'Gasoline', seats: 5, isPremium: true },
  ],
  'Compact/Hatchback': [
    { brand: 'Honda', model: 'Fit', trim: 'Sport', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Honda', model: 'HR-V', trim: 'LX', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'Yaris', trim: 'LE', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Volkswagen', model: 'Golf GTI', trim: 'SE', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Mazda', model: 'Mazda3', trim: 'Carbon Edition', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Hyundai', model: 'Venue', trim: 'SEL', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Kia', model: 'Soul', trim: 'GT-Line', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Chevrolet', model: 'Trax', trim: 'LT', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Nissan', model: 'Kicks', trim: 'SR', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Mazda', model: 'CX-30', trim: 'Preferred', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Subaru', model: 'Crosstrek', trim: 'Premium', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Subaru', model: 'Impreza', trim: 'Base', fuelType: 'Gasoline', seats: 5, isPremium: false },
  ],
  'Truck/Pickup': [
    { brand: 'Ford', model: 'F-150', trim: 'XLT', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Ford', model: 'Maverick', trim: 'Lariat', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Chevrolet', model: 'Silverado 1500', trim: 'LT', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'Tacoma', trim: 'TRD Pro', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Nissan', model: 'Frontier', trim: 'SV', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Honda', model: 'Ridgeline', trim: 'Sport', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'GMC', model: 'Sierra 1500', trim: 'SLE', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Ram', model: '1500', trim: 'Big Horn', fuelType: 'Gasoline', seats: 5, isPremium: false },
  ],
  Minivan: [
    { brand: 'Honda', model: 'Odyssey', trim: 'EX-L', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Toyota', model: 'Sienna', trim: 'XLE', fuelType: 'Hybrid', seats: 7, isPremium: false },
    { brand: 'Chrysler', model: 'Pacifica', trim: 'Limited', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Kia', model: 'Carnival', trim: 'EX', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Dodge', model: 'Grand Caravan', trim: 'SXT', fuelType: 'Gasoline', seats: 7, isPremium: false },
  ],
  Coupe: [
    { brand: 'Ford', model: 'Mustang', trim: 'GT', fuelType: 'Gasoline', seats: 4, isPremium: false },
    { brand: 'Chevrolet', model: 'Camaro', trim: 'LT1', fuelType: 'Gasoline', seats: 4, isPremium: false },
    { brand: 'BMW', model: '4 Series', trim: 'M Sport', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Audi', model: 'A5 Coupe', trim: 'Premium Plus', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Mercedes-Benz', model: 'C-Class Coupe', trim: 'AMG Line', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Subaru', model: 'BRZ', trim: 'Limited', fuelType: 'Gasoline', seats: 4, isPremium: false },
    { brand: 'Volkswagen', model: 'Golf R', trim: 'Autobahn', fuelType: 'Gasoline', seats: 4, isPremium: false },
  ],
  Convertible: [
    { brand: 'Mazda', model: 'MX-5 Miata', trim: 'Club', fuelType: 'Gasoline', seats: 2, isPremium: false },
    { brand: 'Ford', model: 'Mustang Convertible', trim: 'GT', fuelType: 'Gasoline', seats: 4, isPremium: false },
    { brand: 'BMW', model: '4 Series Convertible', trim: 'M Sport', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Porsche', model: '718 Boxster', trim: 'S', fuelType: 'Gasoline', seats: 2, isPremium: true },
    { brand: 'Mercedes-Benz', model: 'E-Class Cabriolet', trim: 'Pinnacle', fuelType: 'Gasoline', seats: 4, isPremium: true },
  ],
  Electric: [
    { brand: 'Tesla', model: 'Model 3', trim: 'Long Range', fuelType: 'Electric', seats: 5, isPremium: true },
    { brand: 'Tesla', model: 'Model Y', trim: 'Performance', fuelType: 'Electric', seats: 5, isPremium: true },
    { brand: 'Hyundai', model: 'Ioniq 5', trim: 'N Line', fuelType: 'Electric', seats: 5, isPremium: false },
    { brand: 'Kia', model: 'EV6', trim: 'GT-Line', fuelType: 'Electric', seats: 5, isPremium: false },
    { brand: 'Volkswagen', model: 'ID.4', trim: 'Pro S', fuelType: 'Electric', seats: 5, isPremium: false },
    { brand: 'Ford', model: 'Mustang Mach-E', trim: 'Premium', fuelType: 'Electric', seats: 5, isPremium: false },
    { brand: 'Chevrolet', model: 'Bolt EV', trim: 'LT', fuelType: 'Electric', seats: 5, isPremium: false },
    { brand: 'Nissan', model: 'Leaf', trim: 'SL Plus', fuelType: 'Electric', seats: 5, isPremium: false },
    { brand: 'BMW', model: 'i4', trim: 'M50', fuelType: 'Electric', seats: 5, isPremium: true },
    { brand: 'Audi', model: 'Q8 e-tron', trim: 'Prestige', fuelType: 'Electric', seats: 5, isPremium: true },
    { brand: 'Genesis', model: 'Electrified GV70', trim: 'Advanced', fuelType: 'Electric', seats: 5, isPremium: true },
  ],
  Hybrid: [
    { brand: 'Toyota', model: 'Prius', trim: 'XLE', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'RAV4 Hybrid', trim: 'XLE', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'Camry Hybrid', trim: 'SE', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'Sienna Hybrid', trim: 'XLE', fuelType: 'Hybrid', seats: 7, isPremium: false },
    { brand: 'Honda', model: 'Accord Hybrid', trim: 'Sport', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Ford', model: 'Escape Hybrid', trim: 'SE', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Ford', model: 'Maverick Hybrid', trim: 'XLT', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Hyundai', model: 'Tucson Hybrid', trim: 'SEL', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Kia', model: 'Sportage Hybrid', trim: 'EX', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Subaru', model: 'Crosstrek Hybrid', trim: 'Limited', fuelType: 'Hybrid', seats: 5, isPremium: false },
    { brand: 'Lexus', model: 'NX 300h', trim: 'Luxury', fuelType: 'Hybrid', seats: 5, isPremium: true },
    { brand: 'Lexus', model: 'ES 350h', trim: 'F Sport', fuelType: 'Hybrid', seats: 5, isPremium: true },
    { brand: 'BMW', model: '330e', trim: 'xDrive', fuelType: 'Hybrid', seats: 5, isPremium: true },
    { brand: 'Audi', model: 'Q5 TFSI e', trim: 'S Line', fuelType: 'Hybrid', seats: 5, isPremium: true },
  ],
  Luxury: [
    { brand: 'BMW', model: '5 Series', trim: 'M Sport', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'BMW', model: '7 Series', trim: 'xDrive40i', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Mercedes-Benz', model: 'E-Class', trim: 'Pinnacle', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Mercedes-Benz', model: 'S-Class', trim: 'AMG Line', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Audi', model: 'A6', trim: 'Prestige', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Audi', model: 'A8', trim: 'S Line', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Lexus', model: 'LC 500', trim: 'Ultra Luxury', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Lexus', model: 'LS 500', trim: 'Luxury', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Genesis', model: 'G80', trim: 'Prestige', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Cadillac', model: 'CT5', trim: 'Platinum', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Lincoln', model: 'Continental', trim: 'Black Label', fuelType: 'Gasoline', seats: 5, isPremium: true },
  ],
  'Sports Car': [
    { brand: 'Ford', model: 'Mustang GT500', trim: 'Shelby', fuelType: 'Gasoline', seats: 4, isPremium: false },
    { brand: 'Chevrolet', model: 'Corvette Stingray', trim: 'Z51', fuelType: 'Gasoline', seats: 2, isPremium: false },
    { brand: 'Mazda', model: 'MX-5 Miata', trim: 'Club', fuelType: 'Gasoline', seats: 2, isPremium: false },
    { brand: 'Subaru', model: 'WRX', trim: 'GT', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Porsche', model: '911 Carrera', trim: 'S', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Porsche', model: '718 Cayman', trim: 'GTS', fuelType: 'Gasoline', seats: 2, isPremium: true },
    { brand: 'BMW', model: 'M4', trim: 'Competition', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Mercedes-Benz', model: 'AMG GT', trim: 'S', fuelType: 'Gasoline', seats: 2, isPremium: true },
    { brand: 'Audi', model: 'TT RS', trim: 'Coupe', fuelType: 'Gasoline', seats: 4, isPremium: true },
    { brand: 'Nissan', model: 'GT-R', trim: 'Premium', fuelType: 'Gasoline', seats: 4, isPremium: false },
    { brand: 'Toyota', model: 'GR Supra', trim: '3.0 Premium', fuelType: 'Gasoline', seats: 2, isPremium: false },
  ],
  'Off-Road/4x4': [
    { brand: 'Ford', model: 'Bronco', trim: 'Badlands', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Jeep', model: 'Wrangler', trim: 'Rubicon', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Jeep', model: 'Gladiator', trim: 'Mojave', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Toyota', model: '4Runner', trim: 'TRD Off-Road', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Toyota', model: 'Land Cruiser', trim: 'Heritage', fuelType: 'Gasoline', seats: 7, isPremium: true },
    { brand: 'Land Rover', model: 'Defender', trim: 'X-Dynamic', fuelType: 'Gasoline', seats: 5, isPremium: true },
    { brand: 'Chevrolet', model: 'Colorado ZR2', trim: 'Bison', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Subaru', model: 'Outback', trim: 'Wilderness', fuelType: 'Gasoline', seats: 5, isPremium: false },
    { brand: 'Nissan', model: 'Pathfinder', trim: 'Platinum', fuelType: 'Gasoline', seats: 7, isPremium: false },
    { brand: 'Lexus', model: 'GX 550', trim: 'Overtrail', fuelType: 'Gasoline', seats: 7, isPremium: true },
  ],
};

function getRandomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomSubset<T>(array: T[], min: number, max: number): T[] {
  const count = Math.floor(Math.random() * (max - min + 1)) + min;
  return [...array].sort(() => 0.5 - Math.random()).slice(0, count);
}

function generateListings(): Listing[] {
  const listings: Listing[] = [];
  let idx = 1;

  for (const [category, cars] of Object.entries(CATEGORY_LISTINGS)) {
    const listingsPerCar = 3; // 3 listings per model variant = good spread

    for (const car of cars) {
      for (let v = 0; v < listingsPerCar; v++) {
        const year = 2018 + Math.floor(Math.random() * 8);
        const isNew = year >= 2024 && Math.random() > 0.4;
        const condition: 'new' | 'used' = isNew ? 'new' : 'used';
        const mileage = isNew ? Math.floor(Math.random() * 60) : Math.floor(Math.random() * 75000) + 1200;

        const roll = Math.random();
        const listingType: 'rent' | 'buy' | 'both' = roll < 0.35 ? 'rent' : roll < 0.65 ? 'buy' : 'both';

        // Price tiered based on variant index to ensure range across all budgets
        let basePrice: number;
        if (v === 0) {
          // Budget tier: $12k–$28k
          basePrice = car.isPremium ? 38000 + Math.random() * 20000 : 12000 + Math.random() * 16000;
        } else if (v === 1) {
          // Mid tier: $28k–$55k
          basePrice = car.isPremium ? 55000 + Math.random() * 25000 : 28000 + Math.random() * 27000;
        } else {
          // Premium tier: $55k–$100k for premium, $35k–$70k for regular
          basePrice = car.isPremium ? 75000 + Math.random() * 40000 : 35000 + Math.random() * 35000;
        }

        const finalPrice = Math.round(basePrice / 500) * 500;
        const dailyRate = Math.max(35, Math.round((finalPrice * 0.0018 + Math.random() * 35) / 5) * 5);

        listings.push({
          id: `car-${String(idx).padStart(3, '0')}`,
          category,
          brand: car.brand,
          model: car.model,
          trim: car.trim,
          year,
          color: getRandomItem(COLORS),
          listingType,
          price: listingType === 'rent' ? null : finalPrice,
          dailyRate: listingType === 'buy' ? null : dailyRate,
          mileage,
          condition,
          fuelType: car.fuelType,
          seats: car.seats,
          location: getRandomItem(CITIES),
          availabilityDate: new Date(Date.now() + Math.floor(Math.random() * 14) * 86400000).toISOString().split('T')[0],
          marketplace: getRandomItem(MARKETPLACES),
          features: getRandomSubset(FEATURES_POOL, 3, 7),
          imageUrl: CAR_IMAGES[category] || CAR_IMAGES['Sedan'],
        });

        idx++;
      }
    }
  }

  return listings;
}

const listings = generateListings();
const outputDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
const outputPath = path.join(outputDir, 'listings.json');
fs.writeFileSync(outputPath, JSON.stringify(listings, null, 2));

// Print summary per category
const byCategory = listings.reduce((acc, l) => {
  acc[l.category] = (acc[l.category] || 0) + 1;
  return acc;
}, {} as Record<string, number>);

console.log(`✅ Generated ${listings.length} listings (models matched to categories):`);
Object.entries(byCategory).forEach(([cat, count]) => console.log(`   ${cat}: ${count} listings`));
