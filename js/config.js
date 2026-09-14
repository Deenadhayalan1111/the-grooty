/* =========================================================
   THE GROOT OOTY — Configuration Bridge
   ========================================================= */

const _getImg = (bucket, file, fallback) => window.getStorageImageUrl ? window.getStorageImageUrl(bucket, file) : fallback;

const CONFIG = {
  // Contact numbers
  PHONE_NUMBER_1: '6382316323',
  PHONE_NUMBER_2: '7395965006',

  // WhatsApp (international format, no + prefix needed for wa.me)
  WHATSAPP_NUMBER: '916382316323',

  // Social
  INSTAGRAM_URL: 'https://www.instagram.com/the_groot_ooty/',
  INSTAGRAM_HANDLE: '@the_groot_ooty',

  // Property details
  PROPERTY_NAME: 'The Groot Ooty',
  ADDRESS: '204, Showdown Road, Mellakshminarayanapuram, Pudumund, Ooty, Tamil Nadu 643001',
  ADDRESS_SHORT: 'Pudumund, Ooty, Tamil Nadu 643001',
  MAP_EMBED: 'https://maps.google.com/maps?q=11.4067,76.7032&z=15&output=embed',

  // Website pages
  PAGES: {
    HOME: 'index.html',
    ROOMS: 'rooms.html',
    ROOM_DETAIL: 'room-detail.html',
    GALLERY: 'gallery.html',
    EXPERIENCES: 'experiences.html',
    OOTY: 'ooty.html',
    REVIEWS: 'reviews.html',
    CONTACT: 'contact.html',
    BOOKING: 'booking.html',
    ADMIN: 'admin.html',
  },
};

// Getter function for dynamic room data from GrootStore
function getRoomsData() {
  if (typeof window !== 'undefined' && window.GrootStore) {
    return window.GrootStore.getRooms();
  }
  return [
    {
      id: 'standard',
      name: 'Standard',
      price: 2500,
      status: 'available',
      tagline: 'Cozy & comfortable double bedroom',
      shortDescription: 'Warm, well-appointed room perfect for couples or solo travelers seeking a peaceful stay in the Nilgiris.',
      longDescription: 'Wake up to the crisp Nilgiri air in our Standard room. A cozy, thoughtfully furnished double bedroom designed for calm comfort with quality bedding, warm blankets, hot water, and a charming view of the surrounding mountain greenery.',
      maxGuests: 3,
      image: 'assets/images/standard_1_client.jpeg',
      interiorImage: 'assets/images/standard_2_client.jpeg',
      features: ['Double Bed', 'Hot Water 24/7', 'High-Speed Wi-Fi', 'Garden View'],
      amenities: [
        { label: 'Comfortable Double Bed' },
        { label: 'Hot Water Shower' },
        { label: 'High-Speed Wi-Fi' },
        { label: 'Warm Blankets & Linens' },
        { label: 'Electric Kettle & Tea' }
      ]
    },
    {
      id: 'aframe',
      name: 'A-frame',
      price: 4500,
      status: 'available',
      tagline: 'Signature architectural timber cabin',
      shortDescription: 'Distinctive triangular architectural cabin with exposed timber beams, high ceilings, and forest ambiance.',
      longDescription: 'The A-frame is the signature stay of The Groot Ooty. Its distinctive triangular architecture, soaring ceilings, exposed natural wooden beams, and forest-framed windows create an unforgettable Nilgiri mountain experience.',
      maxGuests: 4,
      image: 'assets/images/a_frame_client.jpeg',
      interiorImage: 'assets/images/a_frame_client.jpeg',
      features: ['Signature Cabin', 'Forest Views', 'High Ceilings', 'Hot Water 24/7'],
      amenities: [
        { label: 'Signature A-frame Timber Architecture' },
        { label: 'Deep Forest Panoramas' },
        { label: 'Hot Water Shower' },
        { label: 'High-Speed Wi-Fi' },
        { label: 'Campfire & Garden Access' }
      ]
    },
    {
      id: 'suite',
      name: 'Luxurious suit',
      price: 5500,
      status: 'available',
      tagline: 'Spacious premium comfort',
      shortDescription: 'Our most expansive accommodation with elevated furnishings, plush king bed, and private lounge area.',
      longDescription: 'Indulge in The Groot\'s premium retreat. The Luxurious suit features generous living space, refined teak furnishings, plush king bedding, and an ambiance balancing authentic mountain tranquility with elevated comfort.',
      maxGuests: 6,
      image: 'assets/images/luxury_1_client.jpeg',
      interiorImage: 'assets/images/luxury_2_client.jpeg',
      features: ['King Bed', 'Spacious Suite', 'Lounge Seating', 'Hill Panoramas'],
      amenities: [
        { label: 'Expansive Suite Layout' },
        { label: 'Premium King Bedding' },
        { label: 'Separate Lounge Seating Area' },
        { label: 'Hot Water Shower' },
        { label: 'Private Hillside View' }
      ]
    },
    {
      id: 'glasshouse',
      name: 'Glass house',
      price: 5000,
      status: 'available',
      tagline: 'Sleep surrounded by the forest',
      shortDescription: 'Panoramic glass walls immersing you directly in the lush green canopy of the Nilgiri hills.',
      longDescription: 'The Glass house provides a one-of-a-kind immersion in Ooty nature. Floor-to-ceiling glass panels replace traditional walls, surrounding you with the living forest while keeping you cozy and warm inside.',
      maxGuests: 3,
      image: 'assets/images/glasshouse_client.jpeg',
      interiorImage: 'assets/images/glasshouse_client.jpeg',
      features: ['Glass Wall Panorama', 'Forest Immersion', 'Hot Water 24/7', 'Nature Views'],
      amenities: [
        { label: 'Panoramic Glass Wall Design' },
        { label: '360° Forest Immersion' },
        { label: 'Hot Water Shower' },
        { label: 'High-Speed Wi-Fi' },
        { label: 'Stargazing Experience' }
      ]
    }
  ];
}

// Proxied global ROOMS constant
const ROOMS = getRoomsData();

// REVIEWS DATA
const REVIEWS = [
  {
    name: 'Priya M.',
    initial: 'P',
    rating: 5,
    text: 'The A-frame was absolutely magical. Waking up to the Ooty mist through the wooden windows was something I\'ll never forget. The caretakers were so warm and helpful. Highly recommend!',
    source: 'Google Review',
    location: 'Chennai',
  },
  {
    name: 'Rahul & Divya',
    initial: 'R',
    rating: 5,
    text: 'We stayed in the Glass house for our anniversary and it was incredible. Felt like we were literally sleeping in the forest. The campfire in the evening made it even more special.',
    source: 'Google Review',
    location: 'Bangalore',
  },
  {
    name: 'Karthik S.',
    initial: 'K',
    rating: 5,
    text: 'Budget-friendly and genuinely beautiful. The property is exactly like the photos. Home food was amazing — loved the authentic Tamil food. Will definitely come back!',
    source: 'Instagram',
    location: 'Coimbatore',
  },
  {
    name: 'Meena & Family',
    initial: 'M',
    rating: 5,
    text: 'Perfect family stay. Clean rooms, hot water, and the kids loved the campfire. The location is peaceful and the hosts were incredibly welcoming. Felt like home.',
    source: 'Google Review',
    location: 'Erode',
  },
  {
    name: 'Aditya K.',
    initial: 'A',
    rating: 5,
    text: 'Stayed in the Standard room and it was so cozy. The Groot has a very personal feel — not a big resort, but a real place where you feel at home. The music system and campfire were great.',
    source: 'Google Review',
    location: 'Hyderabad',
  },
  {
    name: 'Shreya & Vikram',
    initial: 'S',
    rating: 5,
    text: 'The Luxurious suit is so spacious with a beautiful view of the hills. Highly recommend booking direct on WhatsApp — quick confirmation and very smooth check-in.',
    source: 'Direct Stay',
    location: 'Mumbai',
  }
];
