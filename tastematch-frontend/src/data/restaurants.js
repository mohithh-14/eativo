const restaurants = [
  {
    id: '1',
    name: 'Paradise Biryani',
    cuisine: 'Hyderabadi',
    area: 'Secunderabad',
    rating: 4.8,
    priceRange: 'Rs 900',
    distance: '2.1 km',
    imageUrl:
      'https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1400&auto=format&fit=crop',
    isTopRated: true,
    isTrending: true,
    matchScore: 98,
    vibe: 'Iconic biryani destination for family dinners and late-night cravings.',
    description:
      'A Hyderabad staple known for dum biryani, kebabs, and a fast-moving dining room that always feels lively.',
    address: 'SD Road, Secunderabad, Hyderabad',
    timings: '11:00 AM - 11:30 PM',
    specialties: ['Chicken Dum Biryani', 'Mutton Biryani', 'Double Ka Meetha'],
    menu: [
      { id: '101', name: 'Chicken Dum Biryani', description: 'Long-grain rice layered with masala chicken and slow-finished on dum.', category: 'Biryani', price: 349 },
      { id: '102', name: 'Mutton Biryani', description: 'Tender mutton, saffron rice, and the signature Paradise spice blend.', category: 'Biryani', price: 429 },
      { id: '103', name: 'Apollo Fish', description: 'Crisp fish bites tossed in a spicy yogurt-chili coating.', category: 'Starters', price: 339 },
      { id: '104', name: 'Mirchi Ka Salan', description: 'Tangy peanut and chili curry that pairs perfectly with biryani.', category: 'Sides', price: 129 },
      { id: '105', name: 'Qubani Ka Meetha', description: 'Apricot dessert finished with cream and toasted nuts.', category: 'Desserts', price: 149 },
    ],
  },
  {
    id: '2',
    name: 'Shah Ghouse Cafe',
    cuisine: 'Mughlai',
    area: 'Tolichowki',
    rating: 4.9,
    priceRange: 'Rs 850',
    distance: '4.2 km',
    imageUrl:
      'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1400&auto=format&fit=crop',
    isTopRated: true,
    isTrending: true,
    matchScore: 96,
    vibe: 'High-energy dining for rich gravies, haleem, and celebratory biryani runs.',
    description:
      'Beloved for hearty portions, deep spice, and late-night comfort food that still feels unmistakably local.',
    address: 'Tolichowki Main Road, Hyderabad',
    timings: '12:00 PM - 1:00 AM',
    specialties: ['Special Mutton Biryani', 'Haleem', 'Chicken 65'],
    menu: [
      { id: '201', name: 'Special Mutton Biryani', description: 'A richer version of the house biryani with extra masala and juicy mutton.', category: 'Biryani', price: 459 },
      { id: '202', name: 'Ramzan Haleem', description: 'Slow-cooked wheat, lentils, and meat finished with ghee and fried onions.', category: 'Signature', price: 269 },
      { id: '203', name: 'Chicken 65', description: 'Bold, crispy, and fiery chicken bites with curry leaf tempering.', category: 'Starters', price: 289 },
      { id: '204', name: 'Rumali Roti', description: 'Thin, soft flatbread for pairing with gravies.', category: 'Breads', price: 39 },
      { id: '205', name: 'Kaddu Ki Kheer', description: 'A subtle Hyderabad-style dessert with pumpkin, milk, and cardamom.', category: 'Desserts', price: 129 },
    ],
  },
  {
    id: '3',
    name: 'Chutneys',
    cuisine: 'South Indian',
    area: 'Banjara Hills',
    rating: 4.7,
    priceRange: 'Rs 700',
    distance: '3.0 km',
    imageUrl:
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1400&auto=format&fit=crop',
    isTrending: true,
    matchScore: 91,
    vibe: 'Bright vegetarian comfort food with a reliable breakfast-to-dinner rhythm.',
    description:
      'Known for expansive chutney samplers, crispy dosas, and a polished family-friendly dining experience.',
    address: 'Road No. 1, Banjara Hills, Hyderabad',
    timings: '7:00 AM - 11:00 PM',
    specialties: ['Ghee Podi Idli', 'Mysore Masala Dosa', 'Filter Coffee'],
    menu: [
      { id: '301', name: 'Mysore Masala Dosa', description: 'Crisp dosa with spicy chutney spread and potato masala.', category: 'Breakfast', price: 199 },
      { id: '302', name: 'Ghee Podi Idli', description: 'Soft idlis tossed in podi, ghee, and curry leaf.', category: 'Breakfast', price: 149 },
      { id: '303', name: 'Ragi Sankati Meal', description: 'Millet ball served with pappu, pachadi, and ghee.', category: 'Meals', price: 239 },
      { id: '304', name: 'Mini Tiffin', description: 'A sampler plate with dosa, idli, upma, and pongal.', category: 'Combos', price: 219 },
      { id: '305', name: 'Filter Coffee', description: 'Strong South Indian coffee with a creamy top layer.', category: 'Beverages', price: 69 },
    ],
  },
  {
    id: '4',
    name: 'Bawarchi',
    cuisine: 'Hyderabadi',
    area: 'RTC Cross Roads',
    rating: 4.6,
    priceRange: 'Rs 800',
    distance: '5.1 km',
    imageUrl:
      'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?q=80&w=1400&auto=format&fit=crop',
    isTrending: true,
    matchScore: 88,
    vibe: 'Classic biryani stop for big portions, fast service, and dependable spice.',
    description:
      'One of the city favorites for biryani loyalists who want crowd energy and strong flavors without the frills.',
    address: 'RTC Cross Roads, Hyderabad',
    timings: '11:30 AM - 11:45 PM',
    specialties: ['Chicken Biryani', 'Mutton Keema', 'Khubani Dessert'],
    menu: [
      { id: '401', name: 'Chicken Biryani', description: 'The restaurant favorite with aromatic rice and deep masala notes.', category: 'Biryani', price: 329 },
      { id: '402', name: 'Keema Samosa', description: 'Crisp pastry pockets with minced meat and warming spices.', category: 'Starters', price: 139 },
      { id: '403', name: 'Mutton Keema Curry', description: 'Slow-cooked keema in a silky onion-tomato gravy.', category: 'Curries', price: 319 },
      { id: '404', name: 'Butter Naan', description: 'Soft naan with a buttery finish for scooping curry.', category: 'Breads', price: 49 },
      { id: '405', name: 'Khubani with Ice Cream', description: 'Apricot compote served chilled with vanilla ice cream.', category: 'Desserts', price: 159 },
    ],
  },
  {
    id: '5',
    name: 'Pista House',
    cuisine: 'Hyderabadi',
    area: 'Charminar',
    rating: 4.8,
    priceRange: 'Rs 950',
    distance: '6.3 km',
    imageUrl:
      'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1400&auto=format&fit=crop',
    isTopRated: true,
    matchScore: 93,
    vibe: 'Festive old-city favorite for haleem, sweets, and generous family meal boxes.',
    description:
      'Best known for seasonal haleem and indulgent bakery counters, with a menu that feels made for sharing.',
    address: 'Near Charminar, Hyderabad',
    timings: '10:00 AM - 12:00 AM',
    specialties: ['Zafrani Haleem', 'Mutton Biryani', 'Baklava'],
    menu: [
      { id: '501', name: 'Zafrani Haleem', description: 'Silky haleem with saffron, fried onions, and a slow-cooked finish.', category: 'Signature', price: 299 },
      { id: '502', name: 'Family Pack Mutton Biryani', description: 'A festive biryani pack sized for group dinners.', category: 'Biryani', price: 799 },
      { id: '503', name: 'Chicken Shawarma Plate', description: 'Soft wraps, garlic sauce, and fries on the side.', category: 'Combos', price: 249 },
      { id: '504', name: 'Baklava Box', description: 'Buttery layered pastry stuffed with nuts and syrup.', category: 'Desserts', price: 189 },
      { id: '505', name: 'Badam Milk', description: 'Chilled almond milk drink with saffron.', category: 'Beverages', price: 99 },
    ],
  },
  {
    id: '6',
    name: 'Meridian',
    cuisine: 'Multi-Cuisine',
    area: 'Panjagutta',
    rating: 4.5,
    priceRange: 'Rs 1000',
    distance: '4.8 km',
    imageUrl:
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?q=80&w=1400&auto=format&fit=crop',
    isTrending: true,
    matchScore: 84,
    vibe: 'Casual multi-cuisine comfort with dependable biryani and grills.',
    description:
      'A versatile pick when your group wants variety, especially for kebabs, biryani, and Indo-Chinese favorites.',
    address: 'Panjagutta Circle, Hyderabad',
    timings: '11:00 AM - 11:30 PM',
    specialties: ['Mandi Platter', 'Paneer Tikka', 'Chicken Noodles'],
    menu: [
      { id: '601', name: 'Chicken Mandi', description: 'Arabian-style rice platter with roast chicken and sauces.', category: 'Signature', price: 439 },
      { id: '602', name: 'Paneer Tikka', description: 'Smoky paneer cubes with peppers and mint chutney.', category: 'Starters', price: 279 },
      { id: '603', name: 'Chicken Hakka Noodles', description: 'Wok-tossed noodles with vegetables and chili-garlic heat.', category: 'Noodles', price: 249 },
      { id: '604', name: 'Tandoori Roti', description: 'Whole wheat flatbread baked in a clay oven.', category: 'Breads', price: 29 },
      { id: '605', name: 'Fresh Lime Soda', description: 'Sweet-salty soda to cool down the spice.', category: 'Beverages', price: 79 },
    ],
  },
  {
    id: '7',
    name: 'Cafe Bahar',
    cuisine: 'Hyderabadi',
    area: 'Basheerbagh',
    rating: 4.6,
    priceRange: 'Rs 780',
    distance: '3.9 km',
    imageUrl:
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?q=80&w=1400&auto=format&fit=crop',
    matchScore: 86,
    vibe: 'Crowd-favorite biryani institution with a strong local following.',
    description:
      'A dependable pick for classic biryani, peppery starters, and group dinners that lean on familiar favorites.',
    address: 'Basheerbagh, Hyderabad',
    timings: '11:30 AM - 11:00 PM',
    specialties: ['Chicken Biryani', 'Talawa Gosht', 'Irani Chai'],
    menu: [
      { id: '701', name: 'Chicken Biryani', description: 'Fragrant rice, juicy chicken, and a balanced spice profile.', category: 'Biryani', price: 319 },
      { id: '702', name: 'Talawa Gosht', description: 'Pan-fried mutton with black pepper and green chili.', category: 'Starters', price: 339 },
      { id: '703', name: 'Egg Biryani', description: 'A lighter biryani option with masala eggs and fried onions.', category: 'Biryani', price: 249 },
      { id: '704', name: 'Khatti Dal', description: 'Tangy lentils with Hyderabad-style tempering.', category: 'Sides', price: 119 },
      { id: '705', name: 'Irani Chai', description: 'Slow-brewed tea with milk and a caramelized note.', category: 'Beverages', price: 45 },
    ],
  },
  {
    id: '8',
    name: 'Mehfil',
    cuisine: 'Indian',
    area: 'Narayanguda',
    rating: 4.4,
    priceRange: 'Rs 720',
    distance: '5.8 km',
    imageUrl:
      'https://images.unsplash.com/photo-1514326640560-7d063ef2aed5?q=80&w=1200&auto=format&fit=crop',
    heroImageUrl:
      'https://images.unsplash.com/photo-1559329007-40df8a9345d8?q=80&w=1400&auto=format&fit=crop',
    isTrending: true,
    matchScore: 80,
    vibe: 'Budget-friendly comfort food with crowd-pleasing biryani and grills.',
    description:
      'Popular for affordable family meals, quick service, and mixed menus that cover biryani, tandoor, and curries.',
    address: 'Narayanguda, Hyderabad',
    timings: '11:00 AM - 11:00 PM',
    specialties: ['Chicken 555', 'Special Biryani', 'Butter Chicken'],
    menu: [
      { id: '801', name: 'Special Chicken Biryani', description: 'A hearty biryani portion with masala-coated chicken pieces.', category: 'Biryani', price: 299 },
      { id: '802', name: 'Chicken 555', description: 'Crispy-fried chicken tossed with peppers and house spices.', category: 'Starters', price: 279 },
      { id: '803', name: 'Butter Chicken', description: 'Creamy tomato gravy with grilled chicken pieces.', category: 'Curries', price: 289 },
      { id: '804', name: 'Veg Fried Rice', description: 'Wok-fried rice with vegetables and soy-garlic seasoning.', category: 'Rice', price: 199 },
      { id: '805', name: 'Falooda', description: 'Rose milk dessert drink with vermicelli and ice cream.', category: 'Desserts', price: 139 },
    ],
  },
];

export const getAllRestaurants = () => restaurants;

export const getRestaurantById = (restaurantId) =>
  restaurants.find((restaurant) => String(restaurant.id) === String(restaurantId));

export const getMenuByRestaurantId = (restaurantId) =>
  getRestaurantById(restaurantId)?.menu || [];

export const enrichRestaurant = (restaurant) => {
  const source = getRestaurantById(restaurant?.id || restaurant?.restaurantId);
  if (!source) {
    return {
      ...restaurant,
      id: String(restaurant?.id || restaurant?.restaurantId || ''),
      rating: restaurant?.rating ?? restaurant?.avgRating ?? 4.2,
      matchScore: Math.round(Number(restaurant?.matchScore ?? 0)),
      isTopRated: Boolean(restaurant?.isTopRated ?? restaurant?.topRated),
      isTrending: Boolean(restaurant?.isTrending ?? restaurant?.trending),
    };
  }

  return {
    ...source,
    ...restaurant,
    id: String(restaurant?.id ?? restaurant?.restaurantId ?? source.id),
    rating: restaurant?.rating ?? restaurant?.avgRating ?? source.rating,
    matchScore: Math.round(Number(restaurant?.matchScore ?? source.matchScore ?? 0)),
    isTopRated: Boolean(restaurant?.isTopRated ?? restaurant?.topRated ?? source.isTopRated),
    isTrending: Boolean(restaurant?.isTrending ?? restaurant?.trending ?? source.isTrending),
  };
};

export const searchRestaurants = ({ location = '', cuisine = '' } = {}) => {
  const normalizedLocation = location.trim().toLowerCase();
  const normalizedCuisine = cuisine.trim().toLowerCase();

  return restaurants.filter((restaurant) => {
    const matchesLocation =
      !normalizedLocation ||
      restaurant.area.toLowerCase().includes(normalizedLocation) ||
      restaurant.address.toLowerCase().includes(normalizedLocation);
    const matchesCuisine =
      !normalizedCuisine ||
      restaurant.cuisine.toLowerCase().includes(normalizedCuisine) ||
      restaurant.specialties.some((dish) => dish.toLowerCase().includes(normalizedCuisine));

    return matchesLocation && matchesCuisine;
  });
};

const parseBudgetValue = (priceRange = '') => {
  const match = priceRange.replace(/,/g, '').match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const getCuisineAffinityScore = (restaurantCuisine, preferredCuisine) => {
  if (!restaurantCuisine || !preferredCuisine) {
    return 0;
  }

  const normalizedRestaurantCuisine = restaurantCuisine.trim().toLowerCase();
  const normalizedPreferredCuisine = preferredCuisine.trim().toLowerCase();

  if (normalizedRestaurantCuisine === normalizedPreferredCuisine) {
    return 30;
  }

  if (
    normalizedRestaurantCuisine.includes(normalizedPreferredCuisine) ||
    normalizedPreferredCuisine.includes(normalizedRestaurantCuisine)
  ) {
    return 16;
  }

  if (normalizedRestaurantCuisine.includes('multi-cuisine')) {
    return 10;
  }

  return 0;
};

const getBudgetAffinityScore = (preferredBudget, restaurantBudget) => {
  const preferredValue = parseBudgetValue(preferredBudget);
  const restaurantValue = parseBudgetValue(restaurantBudget);

  if (!preferredValue || !restaurantValue) {
    return 0;
  }

  const difference = Math.abs(preferredValue - restaurantValue);
  if (difference <= 100) {
    return 14;
  }
  if (difference <= 200) {
    return 10;
  }
  if (difference <= 350) {
    return 6;
  }
  return 0;
};

const getSpiceAffinityScore = (restaurantCuisine, spiceLevel) => {
  if (!restaurantCuisine || typeof spiceLevel !== 'number' || Number.isNaN(spiceLevel)) {
    return 0;
  }

  const spicyCuisine = ['Hyderabadi', 'Mughlai', 'Indian'].includes(restaurantCuisine);

  if (spiceLevel >= 80) {
    return spicyCuisine ? 8 : 3;
  }
  if (spiceLevel >= 60) {
    return spicyCuisine ? 5 : 2;
  }
  if (spiceLevel <= 30) {
    return spicyCuisine ? -2 : 5;
  }
  if (spiceLevel <= 50) {
    return spicyCuisine ? 1 : 3;
  }

  return 0;
};

const getDietAffinityScore = (restaurant, dietType = '') => {
  const normalizedDietType = dietType.trim().toLowerCase();
  if (!normalizedDietType) {
    return 0;
  }

  const searchableMenuText = restaurant.menu
    .map((item) => `${item.name} ${item.description} ${item.category}`)
    .join(' ')
    .toLowerCase();

  const hasVegFriendlyMenu = /paneer|veg|vegan|idli|dosa|dal|sambar|upma|pongal|meal|coffee/.test(searchableMenuText);
  const hasEggMenu = /egg/.test(searchableMenuText);
  const hasNonVegMenu = /chicken|mutton|fish|gosht|haleem|kebab|keema|shawarma|apollo|tikka/.test(searchableMenuText);

  if (normalizedDietType === 'veg') {
    if (hasVegFriendlyMenu) {
      return 12;
    }
    return hasNonVegMenu ? -3 : 4;
  }

  if (normalizedDietType === 'vegan') {
    if (restaurant.cuisine === 'South Indian') {
      return 12;
    }
    if (restaurant.cuisine === 'Multi-Cuisine') {
      return 8;
    }
    if (hasVegFriendlyMenu) {
      return 5;
    }
    return hasNonVegMenu ? -4 : 0;
  }

  if (normalizedDietType === 'eggetarian') {
    if (hasEggMenu) {
      return 10;
    }
    if (hasVegFriendlyMenu) {
      return 7;
    }
    return 3;
  }

  if (normalizedDietType === 'non-veg') {
    if (hasNonVegMenu) {
      return 12;
    }
    if (['Hyderabadi', 'Mughlai', 'Indian'].includes(restaurant.cuisine)) {
      return 9;
    }
    return 4;
  }

  return 0;
};

const getBaseRatingScore = (rating, ratingImportance) =>
  rating * (7 + Math.max(1, Math.min(Number(ratingImportance) || 4, 5)) * 1.4);

export const getPersonalizedRestaurants = (preferences = {}) => {
  const hasProfilePreferences = Boolean(preferences && Object.keys(preferences).length);
  const cuisine = preferences?.cuisine || '';
  const dietType = preferences?.dietType || '';
  const budgetRange = preferences?.budgetRange || '';
  const spiceLevel = hasProfilePreferences ? Number(preferences.spiceLevel ?? 80) : null;
  const ratingImportance = hasProfilePreferences ? Number(preferences.ratingImportance ?? 4) : 3;

  return restaurants
    .map((restaurant) => {
      let score = hasProfilePreferences ? getBaseRatingScore(restaurant.rating, ratingImportance) : restaurant.rating * 12 + 18;

      if (hasProfilePreferences) {
        score += getCuisineAffinityScore(restaurant.cuisine, cuisine);
        score += getBudgetAffinityScore(budgetRange, restaurant.priceRange);
        score += getSpiceAffinityScore(restaurant.cuisine, spiceLevel);
        score += getDietAffinityScore(restaurant, dietType);
      }

      return {
        ...restaurant,
        matchScore: Math.min(Math.round(score), 99),
      };
    })
    .sort((left, right) => right.matchScore - left.matchScore);
};

export default restaurants;
