export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Mukhvas Tips' | 'After-Meal Rituals' | 'Gifting';
  date: string;
  readMinutes: number;
  /** Which product's jar art illustrates the post. */
  coverSlug: string;
  body: { heading?: string; text: string }[];
}

export const posts: Post[] = [
  {
    slug: 'the-after-meal-ritual',
    title: 'The After-Meal Ritual: Why Gujarati Homes Keep a Mukhvas Dani by the Door',
    excerpt: 'A small brass bowl, a spoonful of roasted seeds, and a pause before the day carries on. The quiet ceremony behind every Gujarati meal.',
    category: 'After-Meal Rituals',
    date: '2026-08-14',
    readMinutes: 5,
    coverSlug: 'classic-sauf-dhana-dal',
    body: [
      { text: 'In most Gujarati homes, the meal is not over when the plates are cleared. It ends with a small brass or silver dani passed around the table — a spoonful of fennel, a pinch of dhana dal, perhaps a sliver of sweet supari-free paan. It is hospitality, digestion and a moment of pause, all in one gesture.' },
      { heading: 'Why after the meal?', text: 'Fennel, ajwain and coriander seeds have long been used in Indian kitchens to settle the stomach after a heavy meal. Chewing slowly also refreshes the mouth naturally, which is why mukhvas has always been the original breath freshener.' },
      { heading: 'Setting up your own dani', text: 'Choose one digestive blend (like Classic Sauf Dhana Dal) and one sweet blend (like Rose Gulkand Fennel). Keep them in airtight glass jars, refill the dani weekly, and place it where guests will see it — by the door, on the dining table, or beside the tea tray.' },
      { heading: 'A ritual worth keeping', text: 'Mukhvas is less about what is in the spoon than about the moment it creates: a last few minutes at the table, a conversation that lingers. That is the ritual we want every jar of ours to carry forward.' },
    ],
  },
  {
    slug: 'how-to-store-mukhvas',
    title: 'How to Keep Your Mukhvas Fresh and Fragrant for Months',
    excerpt: 'Humidity is the enemy of crunch. Five small habits that keep every spoonful as fresh as the day the jar was sealed.',
    category: 'Mukhvas Tips',
    date: '2026-07-22',
    readMinutes: 4,
    coverSlug: 'kesar-pista-royale',
    body: [
      { text: 'Roasted seeds and candied fennel are happiest when they are kept cool, dry and dark. A few simple habits make a big difference, especially through the Indian monsoon.' },
      { heading: '1. Always use glass', text: 'Glass does not absorb aromas or leach flavours. Our jars have airtight lids — close them fully after every use.' },
      { heading: '2. Use a dry spoon', text: 'Even a drop of water can make a whole jar soft. Keep a dedicated dry spoon in the dani.' },
      { heading: '3. Keep away from the stove', text: 'Heat and steam soften sugar coatings and dull saffron. A cupboard away from the kitchen is ideal.' },
      { heading: '4. Refrigerate paan blends in summer', text: 'Blends with gulkand or fresh betel leaf stay freshest in the fridge from April to September.' },
      { heading: '5. Buy what you will enjoy in a month', text: 'Our 200 g jars last most families three to four weeks — the sweet spot for peak freshness.' },
    ],
  },
  {
    slug: 'wedding-favour-guide',
    title: 'A Guide to Mukhvas Wedding Favours Your Guests Will Actually Use',
    excerpt: 'From mehendi to reception: quantities, timelines and pairing ideas for elegant, edible guest gifts.',
    category: 'Gifting',
    date: '2026-06-30',
    readMinutes: 6,
    coverSlug: 'wedding-favour-minis',
    body: [
      { text: 'Edible favours are the ones that never end up forgotten in a drawer. Mini jars of mukhvas are beautiful on a welcome table, practical after a wedding feast, and carry a little of the celebration home.' },
      { heading: 'How many to order', text: 'Plan one mini jar per family for sangeet and mehendi, and one per guest for the reception. Add 5–8% extra for last-minute guests and hampers.' },
      { heading: 'When to order', text: 'For custom tags with names and dates, place your order at least three weeks before the first function. Standard minis ship within 3–5 working days.' },
      { heading: 'Pairing ideas', text: 'Rose Gulkand Fennel in blush tones suits haldi and mehendi; Kesar Pista Royale feels festive for the reception. Mix two blends for a colourful welcome table.' },
      { heading: 'Let us help', text: 'Share your dates, guest count and colour palette on our Wedding Gifting page and our team will send a tailored quote within one working day.' },
    ],
  },
  {
    slug: 'fennel-ajwain-coriander',
    title: 'Fennel, Ajwain and Coriander: The Three Seeds Behind Every Good Mukhvas',
    excerpt: 'Meet the humble trio that has settled Indian stomachs for generations — and how we roast them.',
    category: 'Mukhvas Tips',
    date: '2026-05-18',
    readMinutes: 4,
    coverSlug: 'ajwain-hing-digestive',
    body: [
      { text: 'Almost every traditional mukhvas starts with some combination of three seeds. Each brings its own character to the spoon.' },
      { heading: 'Fennel (variyali)', text: 'Sweet, cooling and aromatic. We use plump Lucknowi fennel for sweet blends and bolder green fennel for digestive ones.' },
      { heading: 'Ajwain (carom)', text: 'Sharp and warming, traditionally reached for after heavy or fried food. A little goes a long way.' },
      { heading: 'Coriander dal', text: 'The split, roasted inner seed of coriander — nutty, crunchy and gently citrusy. It is what gives a Gujarati mukhvas its signature crunch.' },
      { heading: 'Why we roast in small batches', text: 'Seeds roast unevenly in large drums. Roasting a few kilos at a time lets us pull each batch the moment it turns fragrant — never bitter.' },
    ],
  },
];
