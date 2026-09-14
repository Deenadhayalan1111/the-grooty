/* =========================================================
   THE GROOT OOTY — Centralized Store & Data Architecture
   Single source of truth for Rooms, Pricing, Availability, 
   Gallery photo mappings, and Property settings.
   ========================================================= */

import { supabase } from './supabase.js';

const _getImg = (bucket, file, fallback) => window.getStorageImageUrl ? window.getStorageImageUrl(bucket, file) : fallback;

const STORAGE_KEY_ROOMS = 'groot_rooms_data_v1';
const STORAGE_KEY_GALLERY = 'groot_gallery_data_v1';
const STORAGE_KEY_SETTINGS = 'groot_settings_data_v1';
const STORAGE_KEY_AUTH = 'groot_admin_auth_v1';

// TEMPORARY ADMIN PASSWORD CONFIGURATION
const TEMPORARY_ADMIN_USERNAME = 'admin';
const TEMPORARY_ADMIN_PASSWORD = 'groot2026';

// DEFAULT ROOM METADATA FOR UI ASSETS & FALLBACKS
const DEFAULT_ROOM_METADATA = {
  standard: {
    slug: 'standard',
    name: 'Standard',
    defaultPrice: 2500,
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
  aframe: {
    slug: 'aframe',
    name: 'A-frame',
    defaultPrice: 4500,
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
  suite: {
    slug: 'suite',
    name: 'Luxurious suit',
    defaultPrice: 5500,
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
  glasshouse: {
    slug: 'glasshouse',
    name: 'Glass house',
    defaultPrice: 5000,
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
};

function getMetadataForRoomName(dbRoomName) {
  const name = (dbRoomName || '').toLowerCase();
  if (name.includes('a-frame') || name.includes('aframe') || name.includes('signature cabin') || name.includes('cabin')) {
    return DEFAULT_ROOM_METADATA.aframe;
  }
  if (name.includes('glass')) {
    return DEFAULT_ROOM_METADATA.glasshouse;
  }
  if (name.includes('luxur') || name.includes('suite') || name.includes('suit')) {
    return DEFAULT_ROOM_METADATA.suite;
  }
  if (name.includes('standard')) {
    return DEFAULT_ROOM_METADATA.standard;
  }
  return DEFAULT_ROOM_METADATA.standard;
}

// DEFAULT GALLERY ITEMS
const DEFAULT_GALLERY = [
  { id: 'gal-1', url: 'assets/images/garden_area_client.jpeg', title: 'The Groot Garden Lawn & Surrounding Hills', category: 'property', assignedRoom: 'property', enabled: true, order: 1 },
  { id: 'gal-2', url: 'assets/images/common_area_client.jpeg', title: 'Common Lounge & Property Grounds', category: 'property', assignedRoom: 'property', enabled: true, order: 2 },
  { id: 'gal-3', url: 'assets/images/common_area_1_client.jpeg', title: 'Guest Gathering & Relaxation Area', category: 'property', assignedRoom: 'property', enabled: true, order: 3 },
  { id: 'gal-4', url: 'assets/images/a_frame_client.jpeg', title: 'A-frame Cabin Exterior & Architecture', category: 'rooms', assignedRoom: 'aframe', enabled: true, order: 4 },
  { id: 'gal-5', url: 'assets/images/glasshouse_client.jpeg', title: 'Glass house Panoramic Forest Immersion', category: 'rooms', assignedRoom: 'glasshouse', enabled: true, order: 5 },
  { id: 'gal-6', url: 'assets/images/luxury_1_client.jpeg', title: 'Luxurious suit Bedroom & Living Space', category: 'rooms', assignedRoom: 'suite', enabled: true, order: 6 },
  { id: 'gal-7', url: 'assets/images/luxury_2_client.jpeg', title: 'Luxurious suit Interior Seating Area', category: 'rooms', assignedRoom: 'suite', enabled: true, order: 7 },
  { id: 'gal-8', url: 'assets/images/luxury_3_client.jpeg', title: 'Luxurious suit Refined Teak Finishes', category: 'rooms', assignedRoom: 'suite', enabled: true, order: 8 },
  { id: 'gal-9', url: 'assets/images/standard_1_client.jpeg', title: 'Standard Room Warm Bedroom', category: 'rooms', assignedRoom: 'standard', enabled: true, order: 9 },
  { id: 'gal-10', url: 'assets/images/standard_2_client.jpeg', title: 'Standard Room Cozy Double Bed', category: 'rooms', assignedRoom: 'standard', enabled: true, order: 10 },
  { id: 'gal-11', url: 'assets/images/1000032835_professional_4k.webp', title: 'Nilgiri Morning Mist & Mountain Vista', category: 'nature', assignedRoom: 'property', enabled: true, order: 11 },
  { id: 'gal-12', url: 'assets/images/1000032841_professional_4k.webp', title: 'Evening Campfire Under Starlit Sky', category: 'campfire', assignedRoom: 'property', enabled: true, order: 12 },
  { id: 'gal-13', url: 'assets/images/IMG-20260821-WA0036_4k.webp', title: 'Outdoor Garden Gathering & Seating', category: 'campfire', assignedRoom: 'property', enabled: true, order: 13 },
  { id: 'gal-14', url: 'assets/images/IMG-20260821-WA0041_4k.webp', title: 'Fresh Authentic Home-Cooked Meals', category: 'food', assignedRoom: 'property', enabled: true, order: 14 },
  { id: 'gal-15', url: 'assets/images/1000032840_professional_4k.webp', title: 'Tea Plantation & Nature Trails', category: 'nature', assignedRoom: 'property', enabled: true, order: 15 }
];

// DEFAULT SETTINGS
const DEFAULT_SETTINGS = {
  propertyName: 'The Groot Ooty',
  phone1: '6382316323',
  phone2: '7395965006',
  whatsapp: '916382316323',
  address: '204, Showdown Road, Mellakshminarayanapuram, Pudumund, Ooty, Tamil Nadu 643001',
  checkInTime: '12:00 PM',
  checkOutTime: '11:00 AM',
  bookingNote: '100% Direct Booking. Availability and final pricing are confirmed directly with The Groot via WhatsApp.',
  instagram: '@the_groot_ooty'
};

// STORE CLASS
class GrootStore {
  constructor() {
    this.listeners = [];
    this.roomsData = Object.values(DEFAULT_ROOM_METADATA).map(m => ({
      id: m.slug,
      slug: m.slug,
      name: m.name,
      price: m.defaultPrice,
      status: m.status,
      tagline: m.tagline,
      shortDescription: m.shortDescription,
      longDescription: m.longDescription,
      maxGuests: m.maxGuests,
      image: m.image,
      interiorImage: m.interiorImage,
      features: m.features,
      amenities: m.amenities
    }));
    this.isFetching = false;
    
    // Automatically fetch live Supabase data on init
    this.fetchLiveRooms();
  }

  // Helper: write to localStorage for fallback cache
  _write(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this._notify();
    } catch (e) {
      console.error('GrootStore write error:', e);
    }
  }

  async fetchLiveRooms() {
    if (this.isFetching) return;
    this.isFetching = true;
    try {
      // 1. Fetch all rooms from Supabase ordered by name
      const { data, error } = await supabase
        .from('rooms')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      let dbRooms = data || [];

      // 2. Ensure all 4 rooms exist in Supabase (create missing if needed)
      const requiredKeys = [
        { key: 'standard', name: 'Standard', price: 2500, max_guests: 3, status: 'available' },
        { key: 'aframe', name: 'A-frame', price: 4500, max_guests: 4, status: 'available' },
        { key: 'suite', name: 'Luxurious suit', price: 5500, max_guests: 6, status: 'available' },
        { key: 'glasshouse', name: 'Glass house', price: 5000, max_guests: 3, status: 'available' }
      ];

      const missing = requiredKeys.filter(req => {
        return !dbRooms.some(r => {
          const meta = getMetadataForRoomName(r.name);
          return meta.slug === req.key;
        });
      });

      if (missing.length > 0) {
        for (const item of missing) {
          const meta = DEFAULT_ROOM_METADATA[item.key];
          const { error: insertErr } = await supabase.from('rooms').insert([{
            name: meta.name,
            price: meta.defaultPrice,
            max_guests: meta.maxGuests,
            status: meta.status,
            description: meta.shortDescription,
            image_url: meta.image,
            currency: 'INR'
          }]);
          if (insertErr) console.error('Insert missing room error:', insertErr);
        }

        const { data: refetched } = await supabase
          .from('rooms')
          .select('*')
          .order('name');
        if (refetched) dbRooms = refetched;
      }

      // 3. Map every Supabase row directly to a room object using actual Supabase rooms.id
      if (dbRooms.length > 0) {
        this.roomsData = dbRooms.map(dbRoom => {
          const meta = getMetadataForRoomName(dbRoom.name);
          return {
            id: dbRoom.id, // Actual Supabase UUID
            uuid: dbRoom.id,
            slug: meta.slug || 'room',
            name: dbRoom.name || meta.name,
            price: dbRoom.price !== null && dbRoom.price !== undefined ? Number(dbRoom.price) : (meta.defaultPrice || 0),
            status: dbRoom.status || meta.status || 'available',
            tagline: meta.tagline || '',
            shortDescription: dbRoom.description || meta.shortDescription || '',
            longDescription: meta.longDescription || dbRoom.description || '',
            maxGuests: dbRoom.max_guests || meta.maxGuests || 2,
            image: dbRoom.image_url || meta.image || '',
            interiorImage: meta.interiorImage || dbRoom.image_url || '',
            features: meta.features || [],
            amenities: meta.amenities || [],
            currency: dbRoom.currency || 'INR',
            updatedAt: dbRoom.updated_at
          };
        });
        this._notify();
      }
    } catch (err) {
      console.error('Error fetching live rooms from Supabase:', err);
    } finally {
      this.isFetching = false;
    }
  }

  getRooms() {
    return this.roomsData;
  }

  getRoom(id) {
    const rooms = this.getRooms();
    if (!id) return rooms[0];
    const search = String(id).trim().toLowerCase();

    // 1. Exact ID (UUID) match
    let match = rooms.find(r => r.id === id || String(r.id).toLowerCase() === search);
    if (match) return match;

    // 2. Slug match ('standard', 'aframe', 'suite', 'glasshouse')
    match = rooms.find(r => r.slug === search);
    if (match) return match;

    // 3. Case-insensitive substring match on name
    match = rooms.find(r => r.name.toLowerCase().includes(search));
    if (match) return match;

    return rooms[0];
  }

  async updateRoomPrice(id, newPrice) {
    const price = Number(newPrice);
    if (isNaN(price) || price < 0) return { success: false, error: 'Please enter a valid price amount.' };
    
    // Find room by id (Supabase UUID or slug match)
    const room = this.getRoom(id);
    if (!room || !room.id) {
      return { success: false, error: 'Room not found.' };
    }

    try {
      const { data, error } = await supabase
        .from('rooms')
        .update({ 
          price: price, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', room.id)
        .select();
        
      if (error) {
        console.error('Supabase update failed:', error);
        return { success: false, error: error.message };
      }
      
      // Update local state on success
      this.roomsData = this.roomsData.map(r => r.id === room.id ? { ...r, price } : r);
      this._notify();
      return { success: true, room: this.getRoom(room.id) };
      
    } catch (err) {
      console.error('Network error during update:', err);
      return { success: false, error: err.message };
    }
  }

  // GALLERY API — Read-only immutable gallery catalogue
  getGallery(includeDisabled = false) {
    return [...DEFAULT_GALLERY].sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getGalleryItem(id) {
    return DEFAULT_GALLERY.find(item => item.id === id);
  }

  getRoomPhotos(roomId) {
    const room = this.getRoom(roomId);
    const slug = room ? (room.slug || '').toLowerCase() : (roomId || '').toLowerCase();
    const gallery = this.getGallery(false);
    const assigned = gallery.filter(item => item.assignedRoom === slug || item.assignedRoom === roomId).map(item => item.url);
    
    const photos = [];
    if (room && room.image && !photos.includes(room.image)) photos.push(room.image);
    if (room && room.interiorImage && !photos.includes(room.interiorImage)) photos.push(room.interiorImage);
    assigned.forEach(url => {
      if (!photos.includes(url)) photos.push(url);
    });
    return photos.length > 0 ? photos : ['assets/images/garden_area_client.jpeg'];
  }

  // SETTINGS API — Read-only immutable property settings
  getSettings() {
    return { ...DEFAULT_SETTINGS };
  }

  // AUTH API (Admin dashboard session)
  isAuthenticated() {
    const auth = sessionStorage.getItem(STORAGE_KEY_AUTH);
    return auth === 'authenticated';
  }

  login(username, password) {
    if (!username || !password) return false;
    if (username === TEMPORARY_ADMIN_USERNAME && password === TEMPORARY_ADMIN_PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY_AUTH, 'authenticated');
      return true;
    }
    return false;
  }

  logout() {
    sessionStorage.removeItem(STORAGE_KEY_AUTH);
  }

  // RESET TO DEFAULTS
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY_ROOMS);
    localStorage.removeItem(STORAGE_KEY_GALLERY);
    localStorage.removeItem(STORAGE_KEY_SETTINGS);
    this._notify();
  }

  // SUBSCRIPTIONS
  subscribe(fn) {
    if (typeof fn === 'function') {
      this.listeners.push(fn);
    }
  }

  _notify() {
    this.listeners.forEach(fn => {
      try { fn(); } catch(e) { console.error(e); }
    });
  }
}

// Instantiate singleton
window.GrootStore = new GrootStore();
