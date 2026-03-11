import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../../config/firebase.service';
import * as admin from 'firebase-admin';

export interface Listing {
  id: string;
  userId: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  condition: 'new' | 'used';
  location: {
    cep: string;
    city: string;
    state: string;
  };
  contact: {
    phone?: string;
    whatsapp?: string;
    email?: string;
  };
  active: boolean;
  featured: boolean;
  featuredUntil?: Date;
  views: number;
  clicks: number;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields
  brand?: string;
  model?: string;
  year?: string;
  specifications?: Record<string, string>;
  shipping?: {
    available: boolean;
    cost?: number;
  };
}

@Injectable()
export class ListingsService {
  constructor(private firebaseService: FirebaseService) {}

  async createListing(userId: string, listingData: any): Promise<Listing> {
    // Filter out undefined values
    const cleanObject = (obj: any): any => {
      if (obj === undefined || obj === null) return undefined;
      if (typeof obj !== 'object') return obj;
      if (Array.isArray(obj)) return obj.map(cleanObject);
      
      const cleaned: any = {};
      for (const key in obj) {
        if (obj[key] !== undefined) {
          cleaned[key] = cleanObject(obj[key]);
        }
      }
      return cleaned;
    };

    const listing: Omit<Listing, 'id'> = {
      userId,
      title: listingData.title,
      description: listingData.description,
      price: listingData.price,
      images: listingData.images || [],
      category: listingData.category || 'geral',
      condition: listingData.condition || 'used',
      location: listingData.location,
      contact: listingData.contact,
      active: true,
      featured: false,
      featuredUntil: null as any,
      views: 0,
      clicks: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add optional fields only if they exist
    if (listingData.brand) listing.brand = listingData.brand;
    if (listingData.model) listing.model = listingData.model;
    if (listingData.year) listing.year = listingData.year;
    if (listingData.specifications && Object.keys(listingData.specifications).length > 0) {
      listing.specifications = listingData.specifications;
    }
    if (listingData.shipping) listing.shipping = listingData.shipping;

    const docRef = await this.firebaseService.getFirestore()
      .collection('listings')
      .add(listing);

    // Also add to products collection for search (only defined fields)
    const productData: any = {
      id: docRef.id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      image: listing.images[0] || null,
      images: listing.images,
      url: `https://zavlo.ia/listing/${docRef.id}`,
      sourceUrl: `https://zavlo.ia/listing/${docRef.id}`,
      source: 'Zavlo.ia',
      marketplace: 'Zavlo.ia',
      category: listing.category,
      location: listing.location,
      condition: listing.condition,
      active: listing.active,
      stock: true,
      seller: 'Zavlo User',
      score: 1.0,
      qualityScore: 1.0,
      createdAt: listing.createdAt,
      updatedAt: listing.updatedAt,
      scrapedAt: listing.createdAt,
      featured: listing.featured,
    };

    // Add optional fields to product
    if (listing.brand) productData.brand = listing.brand;
    if (listing.model) productData.model = listing.model;
    if (listing.year) productData.year = listing.year;

    await this.firebaseService.getFirestore()
      .collection('products')
      .doc(docRef.id)
      .set(productData);

    return { id: docRef.id, ...listing };
  }

  async getUserListings(userId: string): Promise<Listing[]> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('listings')
      .where('userId', '==', userId)
      .get();

    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];

    // Sort in memory instead of Firestore
    return listings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async updateListing(userId: string, listingId: string, updates: any): Promise<void> {
    await this.firebaseService.getFirestore()
      .collection('listings')
      .doc(listingId)
      .update({
        ...updates,
        updatedAt: new Date(),
      });

    // Update in products collection too
    await this.firebaseService.getFirestore()
      .collection('products')
      .doc(listingId)
      .update({
        ...updates,
        updatedAt: new Date(),
      });
  }

  async toggleActive(userId: string, listingId: string): Promise<void> {
    const doc = await this.firebaseService.getFirestore()
      .collection('listings')
      .doc(listingId)
      .get();

    if (doc.exists) {
      const currentActive = doc.data()?.active || false;
      await this.updateListing(userId, listingId, { active: !currentActive });
    }
  }

  async incrementViews(listingId: string): Promise<void> {
    await this.firebaseService.getFirestore()
      .collection('listings')
      .doc(listingId)
      .update({
        views: admin.firestore.FieldValue.increment(1),
      });
  }

  async incrementClicks(listingId: string): Promise<void> {
    await this.firebaseService.getFirestore()
      .collection('listings')
      .doc(listingId)
      .update({
        clicks: admin.firestore.FieldValue.increment(1),
      });
  }

  async deleteListing(userId: string, listingId: string): Promise<void> {
    // Delete from listings collection
    await this.firebaseService.getFirestore()
      .collection('listings')
      .doc(listingId)
      .delete();

    // Delete from products collection
    await this.firebaseService.getFirestore()
      .collection('products')
      .doc(listingId)
      .delete();
  }

  async getListingById(listingId: string): Promise<Listing | null> {
    const doc = await this.firebaseService.getFirestore()
      .collection('listings')
      .doc(listingId)
      .get();

    if (!doc.exists) return null;

    return { id: doc.id, ...doc.data() } as Listing;
  }

  async featureListing(userId: string, listingId: string, days: number): Promise<void> {
    const featuredUntil = new Date();
    featuredUntil.setDate(featuredUntil.getDate() + days);

    await this.updateListing(userId, listingId, {
      featured: true,
      featuredUntil,
    });
  }

  async getAllActiveListings(): Promise<Listing[]> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('listings')
      .where('active', '==', true)
      .get();

    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];

    // Sort by creation date (newest first)
    return listings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getListingsByCategory(category: string): Promise<Listing[]> {
    const snapshot = await this.firebaseService.getFirestore()
      .collection('listings')
      .where('active', '==', true)
      .where('category', '==', category)
      .get();

    const listings = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Listing[];

    return listings.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async searchListings(query: string): Promise<Listing[]> {
    // For now, get all active and filter in memory
    // In production, use Algolia or similar for full-text search
    const allListings = await this.getAllActiveListings();
    
    const lowerQuery = query.toLowerCase();
    return allListings.filter(listing =>
      listing.title.toLowerCase().includes(lowerQuery) ||
      listing.description?.toLowerCase().includes(lowerQuery) ||
      listing.category.toLowerCase().includes(lowerQuery)
    );
  }
}
