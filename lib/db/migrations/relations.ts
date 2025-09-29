import { relations } from "drizzle-orm/relations";
import { productOptions, productOptionValues, orders, addresses, users, carts, cartItems, products, productVariants, categories, orderItems, productImages, profiles, reviews, variantOptionValues, wishlists } from "./schema";

export const productOptionValuesRelations = relations(productOptionValues, ({one, many}) => ({
	productOption: one(productOptions, {
		fields: [productOptionValues.optionId],
		references: [productOptions.id]
	}),
	variantOptionValues: many(variantOptionValues),
}));

export const productOptionsRelations = relations(productOptions, ({one, many}) => ({
	productOptionValues: many(productOptionValues),
	product: one(products, {
		fields: [productOptions.productId],
		references: [products.id]
	}),
}));

export const addressesRelations = relations(addresses, ({one}) => ({
	order: one(orders, {
		fields: [addresses.orderId],
		references: [orders.id]
	}),
	user: one(users, {
		fields: [addresses.userId],
		references: [users.id]
	}),
}));

export const ordersRelations = relations(orders, ({one, many}) => ({
	addresses: many(addresses),
	user: one(users, {
		fields: [orders.userId],
		references: [users.id]
	}),
	orderItems: many(orderItems),
}));

export const usersRelations = relations(users, ({many}) => ({
	addresses: many(addresses),
	orders: many(orders),
	carts: many(carts),
	profiles: many(profiles),
	reviews: many(reviews),
	wishlists: many(wishlists),
}));

export const cartsRelations = relations(carts, ({one, many}) => ({
	user: one(users, {
		fields: [carts.userId],
		references: [users.id]
	}),
	cartItems: many(cartItems),
}));

export const cartItemsRelations = relations(cartItems, ({one}) => ({
	cart: one(carts, {
		fields: [cartItems.cartId],
		references: [carts.id]
	}),
	product: one(products, {
		fields: [cartItems.productId],
		references: [products.id]
	}),
	productVariant: one(productVariants, {
		fields: [cartItems.variantId],
		references: [productVariants.id]
	}),
}));

export const productsRelations = relations(products, ({one, many}) => ({
	cartItems: many(cartItems),
	category: one(categories, {
		fields: [products.categoryId],
		references: [categories.id]
	}),
	productVariants: many(productVariants),
	orderItems: many(orderItems),
	productImages: many(productImages),
	productOptions: many(productOptions),
	reviews: many(reviews),
	wishlists: many(wishlists),
}));

export const productVariantsRelations = relations(productVariants, ({one, many}) => ({
	cartItems: many(cartItems),
	product: one(products, {
		fields: [productVariants.productId],
		references: [products.id]
	}),
	orderItems: many(orderItems),
	variantOptionValues: many(variantOptionValues),
}));

export const categoriesRelations = relations(categories, ({many}) => ({
	products: many(products),
}));

export const orderItemsRelations = relations(orderItems, ({one}) => ({
	order: one(orders, {
		fields: [orderItems.orderId],
		references: [orders.id]
	}),
	product: one(products, {
		fields: [orderItems.productId],
		references: [products.id]
	}),
	productVariant: one(productVariants, {
		fields: [orderItems.variantId],
		references: [productVariants.id]
	}),
}));

export const productImagesRelations = relations(productImages, ({one}) => ({
	product: one(products, {
		fields: [productImages.productId],
		references: [products.id]
	}),
}));

export const profilesRelations = relations(profiles, ({one}) => ({
	user: one(users, {
		fields: [profiles.id],
		references: [users.id]
	}),
}));

export const reviewsRelations = relations(reviews, ({one}) => ({
	product: one(products, {
		fields: [reviews.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [reviews.userId],
		references: [users.id]
	}),
}));

export const variantOptionValuesRelations = relations(variantOptionValues, ({one}) => ({
	productOptionValue: one(productOptionValues, {
		fields: [variantOptionValues.optionValueId],
		references: [productOptionValues.id]
	}),
	productVariant: one(productVariants, {
		fields: [variantOptionValues.variantId],
		references: [productVariants.id]
	}),
}));

export const wishlistsRelations = relations(wishlists, ({one}) => ({
	product: one(products, {
		fields: [wishlists.productId],
		references: [products.id]
	}),
	user: one(users, {
		fields: [wishlists.userId],
		references: [users.id]
	}),
}));