/**
 * Shared catalogue for મીઠુડી મુખવાસ.
 *
 * Single source of truth for the launch range: the API seeds PostgreSQL from it, and the
 * storefront uses it as an offline fallback so the site still browses when the API is down.
 * Prices are integer rupees, GST-inclusive.
 */

export type CategorySlug = 'premium' | 'digestive' | 'sweet' | 'kids' | 'gift-boxes';

export interface CatalogCategory {
  slug: CategorySlug;
  name: string;
  blurb: string;
  sortOrder: number;
}

export interface CatalogVariant {
  label: string;
  grams: number;
  price: number;
  mrp: number;
  sku: string;
  stock: number;
}

/** Palette for the illustrated glass-jar packaging used until real photography is uploaded. */
export interface JarArt {
  shape: 'round' | 'tall' | 'apothecary' | 'box';
  /** Colours of the seeds / pieces inside the jar. */
  mix: string[];
  lid: string;
  label: string;
  labelInk: string;
  /** Backdrop wash behind the jar. */
  wash: string;
  /** Props scattered around the jar in scenes. */
  props: ('rose' | 'fennel' | 'saffron' | 'leaf' | 'star' | 'cardamom')[];
}

export interface CatalogProduct {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  ingredients: string[];
  benefits: string[];
  howToUse: string;
  categories: CategorySlug[];
  variants: CatalogVariant[];
  art: JarArt;
  isBestSeller: boolean;
  isNew: boolean;
  rating: number;
  reviewCount: number;
}

export interface CatalogReview {
  productSlug: string;
  name: string;
  city: string;
  rating: number;
  title: string;
  body: string;
}

export const commerceRules = {
  freeShippingAbove: 499,
  shippingFee: 49,
  whatsappNumber: '919876543210',
  supportEmail: 'hello@mithudi.in',
} as const;

export const categories: CatalogCategory[] = [
  { slug: 'premium', name: 'Premium', blurb: 'Saffron, silver varq and rose — our finest small-batch blends.', sortOrder: 1 },
  { slug: 'digestive', name: 'Digestive', blurb: 'Roasted seeds and spices that settle a hearty meal.', sortOrder: 2 },
  { slug: 'sweet', name: 'Sweet', blurb: 'Candied fennel, gulkand and paan for the sweet tooth.', sortOrder: 3 },
  { slug: 'kids', name: 'Kids', blurb: 'Colourful, gently sweet and free from supari.', sortOrder: 4 },
  { slug: 'gift-boxes', name: 'Gift Boxes', blurb: 'Keepsake jars for weddings, Diwali and every thank-you.', sortOrder: 5 },
];

const jar = (grams: number, price: number, mrp: number, sku: string, stock = 120): CatalogVariant => ({
  label: grams >= 1000 ? `${grams / 1000} kg` : `${grams} g`,
  grams,
  price,
  mrp,
  sku,
  stock,
});

const pack = (label: string, grams: number, price: number, mrp: number, sku: string, stock = 60): CatalogVariant => ({
  label,
  grams,
  price,
  mrp,
  sku,
  stock,
});

export const products: CatalogProduct[] = [
  {
    slug: 'royal-paan-mukhvas',
    name: 'Royal Paan Mukhvas',
    tagline: 'Betel leaf, gulkand and rose — the after-dinner classic.',
    description:
      'Our most-loved blend, made the way it was served at family weddings: sun-dried betel leaf, slow-set gulkand, desiccated coconut and crushed rose petals, tossed with sweet fennel. Fragrant, cooling and gently sweet.',
    ingredients: ['Betel leaf', 'Gulkand (rose petal preserve)', 'Sweet fennel', 'Coconut', 'Rose petals', 'Cardamom', 'Sugar-coated fennel'],
    benefits: ['Cools the palate after spicy food', 'Freshens breath naturally', 'Supari-free and tobacco-free', 'Aids digestion'],
    howToUse: 'Take half a teaspoon after meals and chew slowly. Store in the glass jar, lid tightly closed, away from sunlight.',
    categories: ['premium', 'sweet'],
    variants: [jar(100, 179, 219, 'MM-RPM-100'), jar(200, 329, 399, 'MM-RPM-200'), jar(400, 599, 729, 'MM-RPM-400')],
    art: { shape: 'round', mix: ['#3F6B3A', '#7FA35B', '#E7C9D1', '#F3EBDD', '#B8456B'], lid: '#C9A66B', label: '#5C2C2C', labelInk: '#FDF8F3', wash: '#F4E3D7', props: ['rose', 'leaf'] },
    isBestSeller: true,
    isNew: false,
    rating: 4.9,
    reviewCount: 412,
  },
  {
    slug: 'kesar-pista-royale',
    name: 'Kesar Pista Royale',
    tagline: 'Kashmiri saffron and pistachio, finished with silver varq.',
    description:
      'A celebration jar. Fennel steeped in Kashmiri saffron, slivered pistachio, almond flakes and a whisper of edible silver. Rich, aromatic and made for festive tables.',
    ingredients: ['Fennel', 'Kashmiri saffron', 'Pistachio', 'Almond', 'Edible silver varq', 'Cardamom', 'Rock sugar'],
    benefits: ['Warm, aromatic finish after rich meals', 'Premium dry fruits in every spoon', 'Supari-free', 'A gifting favourite'],
    howToUse: 'Serve a small spoonful after festive meals. Keep the jar sealed to preserve the saffron aroma.',
    categories: ['premium'],
    variants: [jar(100, 249, 299, 'MM-KPR-100'), jar(200, 469, 549, 'MM-KPR-200'), jar(400, 879, 999, 'MM-KPR-400')],
    art: { shape: 'apothecary', mix: ['#E3A33B', '#F2C75C', '#9CB36B', '#EFE3CF', '#D9D9D9'], lid: '#C9A66B', label: '#FDF8F3', labelInk: '#5C2C2C', wash: '#F6E7CF', props: ['saffron', 'cardamom'] },
    isBestSeller: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 268,
  },
  {
    slug: 'classic-sauf-dhana-dal',
    name: 'Classic Sauf Dhana Dal',
    tagline: 'Roasted fennel, coriander dal and sesame. Pure Gujarati.',
    description:
      'The mukhvas every Gujarati kitchen keeps by the door. Fennel and coriander dal roasted in small batches with sesame and a pinch of rock salt — nutty, crunchy and quietly digestive.',
    ingredients: ['Fennel', 'Coriander dal', 'White sesame', 'Flax seeds', 'Rock salt', 'Lemon juice'],
    benefits: ['Supports healthy digestion', 'Reduces bloating after meals', 'No added sugar', 'Rich in fibre'],
    howToUse: 'Chew a pinch after lunch and dinner. Refill the jar from the pouch and keep dry.',
    categories: ['digestive'],
    variants: [jar(100, 129, 149, 'MM-SDD-100'), jar(200, 229, 269, 'MM-SDD-200'), jar(400, 419, 499, 'MM-SDD-400', 200)],
    art: { shape: 'tall', mix: ['#8BA888', '#B7A06A', '#E9DDC3', '#6E7F4E', '#D8C49C'], lid: '#8A5A3B', label: '#FDF8F3', labelInk: '#5C2C2C', wash: '#EDEAD9', props: ['fennel'] },
    isBestSeller: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 530,
  },
  {
    slug: 'ajwain-hing-digestive',
    name: 'Ajwain Hing Digestive',
    tagline: 'Carom, hing and black salt for heavy meals.',
    description:
      'Our grandmother’s remedy after a rich thali. Roasted ajwain, a touch of hing, black salt and dried mint — sharp, warming and very effective.',
    ingredients: ['Ajwain (carom seeds)', 'Fennel', 'Hing (asafoetida)', 'Black salt', 'Dried mint', 'Lemon'],
    benefits: ['Relieves acidity and gas', 'Warms the stomach', 'No sugar added', 'Traditional Ayurvedic combination'],
    howToUse: 'A small pinch after heavy meals. Strong flavour — a little goes a long way.',
    categories: ['digestive'],
    variants: [jar(100, 139, 159, 'MM-AHD-100'), jar(200, 249, 289, 'MM-AHD-200')],
    art: { shape: 'round', mix: ['#9A8657', '#6E6A43', '#C9B98B', '#556B45', '#E8DDC4'], lid: '#5C2C2C', label: '#8BA888', labelInk: '#FDF8F3', wash: '#E9EBDD', props: ['leaf', 'fennel'] },
    isBestSeller: false,
    isNew: false,
    rating: 4.7,
    reviewCount: 188,
  },
  {
    slug: 'rose-gulkand-fennel',
    name: 'Rose Gulkand Fennel',
    tagline: 'Candied fennel folded with gulkand and petals.',
    description:
      'Soft, floral and romantic. Sweet fennel coated in slow-cooked gulkand and tossed with dried Desi rose petals. Our pick for bridal trousseau jars.',
    ingredients: ['Sweet fennel', 'Gulkand', 'Dried rose petals', 'Rose water', 'Sugar'],
    benefits: ['Naturally cooling in summer', 'Floral, breath-freshening finish', 'Supari-free', 'Loved at weddings'],
    howToUse: 'Enjoy a spoonful after meals, or sprinkle over kulfi and phirni.',
    categories: ['sweet', 'premium'],
    variants: [jar(100, 169, 199, 'MM-RGF-100'), jar(200, 309, 369, 'MM-RGF-200'), jar(400, 569, 679, 'MM-RGF-400')],
    art: { shape: 'apothecary', mix: ['#D36A8A', '#F0B7C6', '#B8456B', '#F6DDE3', '#8BA888'], lid: '#C9A66B', label: '#5C2C2C', labelInk: '#FDF8F3', wash: '#F6E1E3', props: ['rose'] },
    isBestSeller: true,
    isNew: false,
    rating: 4.9,
    reviewCount: 301,
  },
  {
    slug: 'meetha-paan-bites',
    name: 'Meetha Paan Bites',
    tagline: 'Little paan balls with a gulkand heart.',
    description:
      'All of a meetha paan, rolled into a bite. Betel leaf, coconut and cardamom around a soft gulkand centre, dusted in rose sugar.',
    ingredients: ['Betel leaf', 'Coconut', 'Gulkand', 'Cardamom', 'Fennel', 'Rose sugar'],
    benefits: ['Instant breath freshener', 'Mess-free — perfect for guests', 'Tobacco and supari-free'],
    howToUse: 'Pop one after a meal. Keep refrigerated in hot, humid months.',
    categories: ['sweet'],
    variants: [jar(150, 199, 239, 'MM-MPB-150'), jar(300, 369, 439, 'MM-MPB-300')],
    art: { shape: 'round', mix: ['#5E8C4A', '#7FA35B', '#A9C88A', '#F3EBDD', '#E7C9D1'], lid: '#C9A66B', label: '#8BA888', labelInk: '#FDF8F3', wash: '#E8EFE0', props: ['leaf', 'rose'] },
    isBestSeller: false,
    isNew: true,
    rating: 4.7,
    reviewCount: 94,
  },
  {
    slug: 'aam-papad-chatpata',
    name: 'Aam Chatpata Mix',
    tagline: 'Tangy mango, jeera and a little mischief.',
    description:
      'A sweet-and-sour summer mix: diced aam papad, roasted jeera, candied fennel and a sprinkle of chaat masala. Kids raid this jar first.',
    ingredients: ['Aam papad (mango)', 'Candied fennel', 'Roasted cumin', 'Chaat masala', 'Black salt', 'Sugar'],
    benefits: ['Tangy palate cleanser', 'Supari-free and kid-friendly', 'Made with real mango pulp'],
    howToUse: 'Snack a spoonful after meals or on road trips.',
    categories: ['sweet', 'kids'],
    variants: [jar(100, 149, 179, 'MM-ACM-100'), jar(200, 279, 329, 'MM-ACM-200')],
    art: { shape: 'tall', mix: ['#F2A541', '#F6C667', '#E07A3F', '#FBE3B5', '#8BA888'], lid: '#E8A87C', label: '#5C2C2C', labelInk: '#FDF8F3', wash: '#FBEBD6', props: ['star'] },
    isBestSeller: false,
    isNew: true,
    rating: 4.6,
    reviewCount: 77,
  },
  {
    slug: 'rainbow-candy-fennel',
    name: 'Rainbow Candy Fennel',
    tagline: 'The colourful sugar-coated sauf from every restaurant counter.',
    description:
      'Crisp fennel in a thin candy shell, in soft pastel colours made with permitted food colours. Nostalgic, crunchy and a favourite for birthday return gifts.',
    ingredients: ['Fennel', 'Sugar', 'Rice starch', 'Permitted food colours', 'Natural flavour'],
    benefits: ['Kids love it', 'Freshens breath', 'Supari-free'],
    howToUse: 'A small spoonful after meals. Contains sugar — enjoy in moderation.',
    categories: ['kids', 'sweet'],
    variants: [jar(100, 119, 139, 'MM-RCF-100'), jar(250, 259, 299, 'MM-RCF-250')],
    art: { shape: 'round', mix: ['#F4A6B6', '#A8D5BA', '#F9E07F', '#A7C7E7', '#FDF8F3', '#E8A87C'], lid: '#8BA888', label: '#FDF8F3', labelInk: '#5C2C2C', wash: '#F4EEF3', props: ['star'] },
    isBestSeller: true,
    isNew: false,
    rating: 4.8,
    reviewCount: 356,
  },
  {
    slug: 'chocolate-sauf',
    name: 'Chocolate Sauf',
    tagline: 'Fennel enrobed in cocoa. Yes, really.',
    description:
      'Our playful take for young ones: sweet fennel lightly coated in cocoa and dusted with cardamom sugar. Chocolatey, crunchy and still breath-freshening.',
    ingredients: ['Sweet fennel', 'Cocoa', 'Sugar', 'Cardamom', 'Milk solids'],
    benefits: ['Kid-approved flavour', 'Supari-free', 'Freshens breath'],
    howToUse: 'A spoonful after meals. Store below 25°C.',
    categories: ['kids'],
    variants: [jar(100, 159, 189, 'MM-CHS-100'), jar(200, 289, 339, 'MM-CHS-200')],
    art: { shape: 'tall', mix: ['#5A3A2E', '#7B4F3A', '#A0714F', '#3E2A22', '#E8DCCB'], lid: '#C9A66B', label: '#E8A87C', labelInk: '#5C2C2C', wash: '#F0E4DA', props: ['star'] },
    isBestSeller: false,
    isNew: true,
    rating: 4.6,
    reviewCount: 61,
  },
  {
    slug: 'til-gud-crunch',
    name: 'Til Gud Crunch',
    tagline: 'Sesame, jaggery and flax — winter warmth in a jar.',
    description:
      'Inspired by Uttarayan. Roasted sesame, flax and melon seeds bound in a thin jaggery crackle, broken into small crunchy bits.',
    ingredients: ['White sesame', 'Jaggery', 'Flax seeds', 'Melon seeds', 'Ghee', 'Dry ginger'],
    benefits: ['Warming for winter', 'Iron and calcium from sesame and jaggery', 'No refined sugar'],
    howToUse: 'Enjoy a small handful after meals or with evening chai.',
    categories: ['digestive', 'sweet'],
    variants: [jar(150, 169, 199, 'MM-TGC-150'), jar(300, 319, 369, 'MM-TGC-300')],
    art: { shape: 'apothecary', mix: ['#C98A4B', '#E2B77A', '#F3E4C4', '#8A5A3B', '#D9C2A0'], lid: '#5C2C2C', label: '#FDF8F3', labelInk: '#5C2C2C', wash: '#F3E6D4', props: ['fennel'] },
    isBestSeller: false,
    isNew: false,
    rating: 4.7,
    reviewCount: 142,
  },
  {
    slug: 'tangy-jeera-goli',
    name: 'Tangy Jeera Goli',
    tagline: 'Tamarind-jeera pellets that wake up the palate.',
    description:
      'Chewy tamarind and roasted cumin pellets with a black-salt tang — the digestive goli from the school gate, made cleaner and better.',
    ingredients: ['Tamarind', 'Roasted cumin', 'Jaggery', 'Black salt', 'Dry mango powder'],
    benefits: ['Stimulates appetite and digestion', 'Relieves nausea on journeys', 'No artificial colours'],
    howToUse: 'Suck one or two slowly after meals.',
    categories: ['digestive', 'kids'],
    variants: [jar(100, 99, 119, 'MM-TJG-100'), jar(250, 219, 259, 'MM-TJG-250')],
    art: { shape: 'round', mix: ['#6B3B2A', '#8A4E36', '#A8664A', '#4A2A20', '#C28D6B'], lid: '#E8A87C', label: '#5C2C2C', labelInk: '#FDF8F3', wash: '#F1E1D6', props: ['cardamom'] },
    isBestSeller: false,
    isNew: false,
    rating: 4.5,
    reviewCount: 88,
  },
  {
    slug: 'heritage-trio-gift-box',
    name: 'Heritage Trio Gift Box',
    tagline: 'Three glass jars in a hand-finished keepsake box.',
    description:
      'Royal Paan, Kesar Pista Royale and Classic Sauf Dhana Dal, each in a 100 g glass jar with brass-tone lids, nested in a maroon keepsake box with a handwritten note card.',
    ingredients: ['Royal Paan Mukhvas', 'Kesar Pista Royale', 'Classic Sauf Dhana Dal'],
    benefits: ['Ready to gift — no wrapping needed', 'Free personalised note card', 'Reusable keepsake box'],
    howToUse: 'Add your message at checkout in the order notes. Ships in protective packaging.',
    categories: ['gift-boxes', 'premium'],
    variants: [pack('Box of 3 jars', 300, 649, 749, 'MM-HTB-3'), pack('Box of 5 jars', 500, 999, 1199, 'MM-HTB-5', 40)],
    art: { shape: 'box', mix: ['#3F6B3A', '#E3A33B', '#8BA888', '#E7C9D1', '#F2C75C'], lid: '#C9A66B', label: '#5C2C2C', labelInk: '#C9A66B', wash: '#F3E2D6', props: ['rose', 'saffron'] },
    isBestSeller: true,
    isNew: false,
    rating: 4.9,
    reviewCount: 219,
  },
  {
    slug: 'wedding-favour-minis',
    name: 'Wedding Favour Minis',
    tagline: 'Mini jars for mehendi, sangeet and every guest.',
    description:
      '40 g mini glass jars of Rose Gulkand Fennel with a silk ribbon and a tag. Order in sets of 25 — for larger quantities or custom tags, use our Wedding Gifting form.',
    ingredients: ['Rose Gulkand Fennel', 'Glass mini jar', 'Silk ribbon', 'Printed tag'],
    benefits: ['Elegant, affordable guest favours', 'Custom tags available on bulk orders', 'Packed to survive travel'],
    howToUse: 'Order at least 3 weeks before the event for custom tags.',
    categories: ['gift-boxes'],
    variants: [pack('Set of 25', 1000, 1999, 2499, 'MM-WFM-25', 30), pack('Set of 50', 2000, 3799, 4799, 'MM-WFM-50', 20)],
    art: { shape: 'round', mix: ['#D36A8A', '#F0B7C6', '#F6DDE3', '#8BA888', '#B8456B'], lid: '#C9A66B', label: '#FDF8F3', labelInk: '#5C2C2C', wash: '#F8E8E6', props: ['rose'] },
    isBestSeller: false,
    isNew: true,
    rating: 5,
    reviewCount: 46,
  },
  {
    slug: 'festive-brass-hamper',
    name: 'Festive Brass Hamper',
    tagline: 'Five blends, a brass mukhvas dani and a diya.',
    description:
      'Our grandest gift: a hand-polished brass mukhvas dani, five of our signature blends in glass jars and a clay diya, in a gold-foiled box. Made for Diwali and wedding families.',
    ingredients: ['Brass mukhvas dani', '5 × 100 g signature blends', 'Clay diya', 'Gold-foiled gift box'],
    benefits: ['Heirloom brass serving piece', 'Luxury unboxing', 'Corporate branding on request'],
    howToUse: 'Polish the brass with lemon and salt; keep the blends in their jars.',
    categories: ['gift-boxes', 'premium'],
    variants: [pack('Hamper', 700, 2499, 2999, 'MM-FBH-1', 25)],
    art: { shape: 'box', mix: ['#C9A66B', '#E3A33B', '#B8456B', '#8BA888', '#F2C75C'], lid: '#C9A66B', label: '#C9A66B', labelInk: '#5C2C2C', wash: '#F4E6CF', props: ['saffron', 'rose'] },
    isBestSeller: false,
    isNew: false,
    rating: 4.9,
    reviewCount: 58,
  },
];

export const reviews: CatalogReview[] = [
  { productSlug: 'royal-paan-mukhvas', name: 'Hetal Shah', city: 'Ahmedabad', rating: 5, title: 'Tastes like my nani’s', body: 'The paan mukhvas is exactly what we used to get at family weddings. Fresh, not too sweet, and the jar is gorgeous on the dining table.' },
  { productSlug: 'classic-sauf-dhana-dal', name: 'Rohan Mehta', city: 'Mumbai', rating: 5, title: 'Our daily after-meal ritual', body: 'Perfectly roasted, not oily at all. We finished the 400 g jar in three weeks — reordering the big one.' },
  { productSlug: 'heritage-trio-gift-box', name: 'Priya Iyer', city: 'Bengaluru', rating: 5, title: 'Best Diwali gift we sent', body: 'Ordered 20 boxes for clients. Packaging felt truly premium and everyone asked where it was from.' },
  { productSlug: 'rose-gulkand-fennel', name: 'Krupa Desai', city: 'Surat', rating: 5, title: 'Floral and fresh', body: 'Beautiful rose aroma the moment you open the lid. I sprinkle it on kulfi too.' },
  { productSlug: 'rainbow-candy-fennel', name: 'Neha Patel', city: 'Vadodara', rating: 5, title: 'Kids’ favourite', body: 'Used these as birthday return gifts. Kids loved the colours and parents loved that it is supari-free.' },
  { productSlug: 'kesar-pista-royale', name: 'Anand Joshi', city: 'Pune', rating: 4, title: 'Real saffron', body: 'You can actually see and smell the saffron strands. Pricey, but worth it for guests.' },
  { productSlug: 'wedding-favour-minis', name: 'Sneha & Karan', city: 'Rajkot', rating: 5, title: 'Guests loved them', body: 'We ordered 300 minis with custom tags for our sangeet. Delivered on time and looked stunning.' },
  { productSlug: 'ajwain-hing-digestive', name: 'Dilip Trivedi', city: 'Bhavnagar', rating: 5, title: 'Works every time', body: 'After a Sunday thali this is the only thing that helps. Strong and authentic.' },
];

export const coupons = [
  { code: 'MITHUDI10', type: 'PERCENT' as const, value: 10, minOrder: 299, maxDiscount: 150, description: '10% off orders above ₹299' },
  { code: 'WELCOME100', type: 'FLAT' as const, value: 100, minOrder: 799, maxDiscount: null, description: '₹100 off your first order above ₹799' },
  { code: 'GIFTING15', type: 'PERCENT' as const, value: 15, minOrder: 1999, maxDiscount: 600, description: '15% off gifting orders above ₹1,999' },
];
