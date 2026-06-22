export type VehicleStatus = 'ACTIVE' | 'ALMOST_SOLD' | 'JUST_SOLD';

export interface Vehicle {
  id: string;
  title: string;
  make: string;
  model: string;
  year: number;
  mileage: number;
  price: number;
  location: string;
  description: string;
  status: VehicleStatus;
  videoUrl: string;
  ctaLink: string;
  ctaText: string;
  images: string[];
  createdAt: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  category: string;
  seoTitle: string;
  metaDescription: string;
  createdAt: string;
}

export interface Settings {
  companyName: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  socialLinks: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    youtube?: string;
  };
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface DatabaseSchema {
  admin: Admin | null;
  adminPasswordHash: string | null;
  vehicles: Vehicle[];
  blogPosts: BlogPost[];
  settings: Settings;
}
