import { Injectable, Inject, forwardRef, Optional } from '@nestjs/common';
import { FirebaseService } from '@config/firebase.service';
import { RedisService } from '@config/redis.service';
import { Product, ProductFilter } from './interfaces/product.interface';
import { CreateProductDto } from './dto/product.dto';
import { SearchService } from '../search/search.service';

@Injectable()
export class ProductsService {
  private productCache = new Map<string, Product>(); // Cache em memória

  constructor(
    private firebaseService: FirebaseService,
    private redisService: RedisService,
    @Optional() @Inject(forwardRef(() => SearchService))
    private searchService?: SearchService,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const firestore = this.firebaseService.getFirestore();
    const productsRef = firestore.collection('products');

    const productData = {
      title: createProductDto.title,
      description: createProductDto.description,
      price: createProductDto.price,
      images: createProductDto.images,
      category: createProductDto.category,
      source: createProductDto.source,
      sourceUrl: createProductDto.sourceUrl,
      location: {
        state: createProductDto.state,
        city: createProductDto.city,
        cep: createProductDto.cep || null,
      },
      seller: {
        name: createProductDto.sellerName,
        phone: createProductDto.sellerPhone || null,
      },
      condition: createProductDto.condition || 'used',
      createdAt: new Date(),
      updatedAt: new Date(),
      scrapedAt: new Date(),
    };

    const docRef = await productsRef.add(productData);
    return { id: docRef.id, ...productData } as Product;
  }

  async findAll(filters: ProductFilter, limit = 50): Promise<Product[]> {
    const cacheKey = `products:${JSON.stringify(filters)}:${limit}`;
    const cached = await this.redisService.get(cacheKey);

    if (cached) {
      return JSON.parse(cached);
    }

    const firestore = this.firebaseService.getFirestore();
    let query = firestore.collection('products').orderBy('createdAt', 'desc').limit(limit);

    if (filters.category) {
      query = query.where('category', '==', filters.category) as any;
    }
    if (filters.state) {
      query = query.where('location.state', '==', filters.state) as any;
    }
    if (filters.city) {
      query = query.where('location.city', '==', filters.city) as any;
    }
    if (filters.source) {
      query = query.where('source', '==', filters.source) as any;
    }

    const snapshot = await query.get();
    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Product[];

    await this.redisService.set(cacheKey, JSON.stringify(products), 300);
    return products;
  }

  async findById(id: string): Promise<Product | null> {
    // Verificar cache em memória primeiro
    if (this.productCache.has(id)) {
      return this.productCache.get(id);
    }

    // Verificar cache do SearchService (produtos simulados)
    if (this.searchService) {
      const cachedProduct = await this.searchService.getProductById(id);
      if (cachedProduct) {
        return cachedProduct;
      }
    }

    // Buscar no Firebase
    const firestore = this.firebaseService.getFirestore();
    const doc = await firestore.collection('products').doc(id).get();

    if (!doc.exists) {
      return null;
    }

    return { id: doc.id, ...doc.data() } as Product;
  }

  cacheProduct(product: Product): void {
    this.productCache.set(product.id, product);
  }

  async delete(id: string): Promise<void> {
    const firestore = this.firebaseService.getFirestore();
    await firestore.collection('products').doc(id).delete();
  }
}
