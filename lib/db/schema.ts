import { pgTable, text, integer, decimal, timestamp, boolean, uuid, jsonb, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Users table (extends Supabase auth.users)
export const users = pgTable('users', {
  id: uuid('id').primaryKey(), // This will match Supabase auth.users.id
  email: text('email').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: varchar('role', { length: 20 }).default('user').notNull(),
  phone: text('phone'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User profiles (additional user information)
export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name'),
  lastName: text('last_name'),
  dateOfBirth: timestamp('date_of_birth'),
  gender: text('gender'),
  preferences: jsonb('preferences'), // Store user preferences as JSON
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Categories table
export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  imageUrl: text('image_url'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Products table
export const products = pgTable('products', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  shortDescription: text('short_description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  costPrice: decimal('cost_price', { precision: 10, scale: 2 }),
  sku: text('sku').unique(),
  barcode: text('barcode'),
  trackQuantity: boolean('track_quantity').default(true).notNull(),
  continueSellingWhenOutOfStock: boolean('continue_selling_when_out_of_stock').default(false).notNull(),
  requiresShipping: boolean('requires_shipping').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  weight: decimal('weight', { precision: 8, scale: 2 }),
  weightUnit: text('weight_unit').default('kg'),
  categoryId: uuid('category_id').references(() => categories.id),
  tags: text('tags').array(), // Array of tags
  metaTitle: text('meta_title'),
  metaDescription: text('meta_description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Product images table
export const productImages = pgTable('product_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull(),
  altText: text('alt_text'),
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Product variants table (sizes, colors, etc.)
export const productVariants = pgTable('product_variants', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  title: text('title').notNull(), // e.g., "Small / Red"
  price: decimal('price', { precision: 10, scale: 2 }),
  compareAtPrice: decimal('compare_at_price', { precision: 10, scale: 2 }),
  sku: text('sku').unique(),
  barcode: text('barcode'),
  inventoryQuantity: integer('inventory_quantity').default(0).notNull(),
  weight: decimal('weight', { precision: 8, scale: 2 }),
  position: integer('position').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Product variant options (size, color, material, etc.)
export const productOptions = pgTable('product_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  name: text('name').notNull(), // e.g., "Size", "Color"
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Product option values
export const productOptionValues = pgTable('product_option_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  optionId: uuid('option_id').references(() => productOptions.id, { onDelete: 'cascade' }).notNull(),
  value: text('value').notNull(), // e.g., "Small", "Red"
  position: integer('position').default(0).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Variant option values (linking variants to their option values)
export const variantOptionValues = pgTable('variant_option_values', {
  id: uuid('id').primaryKey().defaultRandom(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }).notNull(),
  optionValueId: uuid('option_value_id').references(() => productOptionValues.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Shopping cart table
export const carts = pgTable('carts', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  sessionId: text('session_id'), // For guest users
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Cart items table
export const cartItems = pgTable('cart_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  cartId: uuid('cart_id').references(() => carts.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id, { onDelete: 'cascade' }),
  quantity: integer('quantity').default(1).notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price at time of adding to cart
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: text('order_number').notNull().unique(),
  userId: uuid('user_id').references(() => users.id),
  email: text('email').notNull(),
  phone: text('phone'),
  status: text('status').default('pending').notNull(), // pending, confirmed, shipped, delivered, cancelled
  paymentStatus: text('payment_status').default('pending').notNull(), // pending, paid, failed, refunded
  fulfillmentStatus: text('fulfillment_status').default('unfulfilled').notNull(), // unfulfilled, partial, fulfilled
  subtotalPrice: decimal('subtotal_price', { precision: 10, scale: 2 }).notNull(),
  totalTax: decimal('total_tax', { precision: 10, scale: 2 }).default('0').notNull(),
  totalShipping: decimal('total_shipping', { precision: 10, scale: 2 }).default('0').notNull(),
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').default('USD').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Order items table
export const orderItems = pgTable('order_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id).notNull(),
  variantId: uuid('variant_id').references(() => productVariants.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price at time of order
  totalPrice: decimal('total_price', { precision: 10, scale: 2 }).notNull(),
  productTitle: text('product_title').notNull(), // Snapshot of product name
  variantTitle: text('variant_title'), // Snapshot of variant title
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Addresses table
export const addresses = pgTable('addresses', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  orderId: uuid('order_id').references(() => orders.id, { onDelete: 'cascade' }),
  type: text('type').notNull(), // billing, shipping
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  company: text('company'),
  address1: text('address1').notNull(),
  address2: text('address2'),
  city: text('city').notNull(),
  province: text('province'),
  country: text('country').notNull(),
  zip: text('zip').notNull(),
  phone: text('phone'),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Wishlist table
export const wishlists = pgTable('wishlists', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Reviews table
export const reviews = pgTable('reviews', {
  id: uuid('id').primaryKey().defaultRandom(),
  productId: uuid('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  rating: integer('rating').notNull(), // 1-5 stars
  title: text('title'),
  content: text('content'),
  isVerified: boolean('is_verified').default(false).notNull(), // Verified purchase
  isPublished: boolean('is_published').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Coupons table
export const coupons = pgTable('coupons', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').notNull().unique(),
  type: text('type').notNull(), // percentage, fixed_amount, free_shipping
  value: decimal('value', { precision: 10, scale: 2 }).notNull(),
  minimumAmount: decimal('minimum_amount', { precision: 10, scale: 2 }),
  usageLimit: integer('usage_limit'),
  usedCount: integer('used_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  startsAt: timestamp('starts_at'),
  expiresAt: timestamp('expires_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(profiles),
  carts: many(carts),
  orders: many(orders),
  addresses: many(addresses),
  wishlists: many(wishlists),
  reviews: many(reviews),
}))

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, {
    fields: [profiles.id],
    references: [users.id],
  }),
}))

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}))

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  images: many(productImages),
  variants: many(productVariants),
  options: many(productOptions),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  wishlists: many(wishlists),
  reviews: many(reviews),
}))

export const productImagesRelations = relations(productImages, ({ one }) => ({
  product: one(products, {
    fields: [productImages.productId],
    references: [products.id],
  }),
}))

export const productVariantsRelations = relations(productVariants, ({ one, many }) => ({
  product: one(products, {
    fields: [productVariants.productId],
    references: [products.id],
  }),
  cartItems: many(cartItems),
  orderItems: many(orderItems),
  optionValues: many(variantOptionValues),
}))

export const productOptionsRelations = relations(productOptions, ({ one, many }) => ({
  product: one(products, {
    fields: [productOptions.productId],
    references: [products.id],
  }),
  values: many(productOptionValues),
}))

export const productOptionValuesRelations = relations(productOptionValues, ({ one, many }) => ({
  option: one(productOptions, {
    fields: [productOptionValues.optionId],
    references: [productOptions.id],
  }),
  variantValues: many(variantOptionValues),
}))

export const variantOptionValuesRelations = relations(variantOptionValues, ({ one }) => ({
  variant: one(productVariants, {
    fields: [variantOptionValues.variantId],
    references: [productVariants.id],
  }),
  optionValue: one(productOptionValues, {
    fields: [variantOptionValues.optionValueId],
    references: [productOptionValues.id],
  }),
}))

export const cartsRelations = relations(carts, ({ one, many }) => ({
  user: one(users, {
    fields: [carts.userId],
    references: [users.id],
  }),
  items: many(cartItems),
}))

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  cart: one(carts, {
    fields: [cartItems.cartId],
    references: [carts.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [cartItems.variantId],
    references: [productVariants.id],
  }),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  items: many(orderItems),
  addresses: many(addresses),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
  variant: one(productVariants, {
    fields: [orderItems.variantId],
    references: [productVariants.id],
  }),
}))

export const addressesRelations = relations(addresses, ({ one }) => ({
  user: one(users, {
    fields: [addresses.userId],
    references: [users.id],
  }),
  order: one(orders, {
    fields: [addresses.orderId],
    references: [orders.id],
  }),
}))

export const wishlistsRelations = relations(wishlists, ({ one }) => ({
  user: one(users, {
    fields: [wishlists.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [wishlists.productId],
    references: [products.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.productId],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}))

// Export types
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Profile = typeof profiles.$inferSelect
export type NewProfile = typeof profiles.$inferInsert
export type Category = typeof categories.$inferSelect
export type NewCategory = typeof categories.$inferInsert
export type Product = typeof products.$inferSelect
export type NewProduct = typeof products.$inferInsert
export type ProductImage = typeof productImages.$inferSelect
export type NewProductImage = typeof productImages.$inferInsert
export type ProductVariant = typeof productVariants.$inferSelect
export type NewProductVariant = typeof productVariants.$inferInsert
export type Cart = typeof carts.$inferSelect
export type NewCart = typeof carts.$inferInsert
export type CartItem = typeof cartItems.$inferSelect
export type NewCartItem = typeof cartItems.$inferInsert
export type Order = typeof orders.$inferSelect
export type NewOrder = typeof orders.$inferInsert
export type OrderItem = typeof orderItems.$inferSelect
export type NewOrderItem = typeof orderItems.$inferInsert
export type Address = typeof addresses.$inferSelect
export type NewAddress = typeof addresses.$inferInsert
export type Wishlist = typeof wishlists.$inferSelect
export type NewWishlist = typeof wishlists.$inferInsert
export type Review = typeof reviews.$inferSelect
export type NewReview = typeof reviews.$inferInsert
export type Coupon = typeof coupons.$inferSelect
export type NewCoupon = typeof coupons.$inferInsert