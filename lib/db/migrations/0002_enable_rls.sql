-- Enable RLS and define policies for key tables

-- WISHLISTS: owner-only access, admins full access
ALTER TABLE "wishlists" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "wishlists" FORCE ROW LEVEL SECURITY;

CREATE POLICY "wishlists_owner_select" ON "wishlists"
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "wishlists_owner_insert" ON "wishlists"
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "wishlists_owner_delete" ON "wishlists"
  FOR DELETE USING (user_id = auth.uid());

CREATE POLICY "wishlists_admin_all" ON "wishlists"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ORDERS: owner can view, admin full; update/delete reserved for admin
ALTER TABLE "orders" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "orders" FORCE ROW LEVEL SECURITY;

CREATE POLICY "orders_owner_select" ON "orders"
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "orders_admin_all" ON "orders"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- ADDRESSES: owner or linked order owner; admin full
ALTER TABLE "addresses" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "addresses" FORCE ROW LEVEL SECURITY;

CREATE POLICY "addresses_owner_select" ON "addresses"
  FOR SELECT USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders o WHERE o.id = addresses.order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "addresses_owner_write" ON "addresses"
  FOR INSERT WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders o WHERE o.id = addresses.order_id AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "addresses_owner_update" ON "addresses"
  FOR UPDATE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders o WHERE o.id = addresses.order_id AND o.user_id = auth.uid()
    )
  ) WITH CHECK (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders o WHERE o.id = addresses.order_id AND o.user_id = auth.uid()
    )
  );
CREATE POLICY "addresses_owner_delete" ON "addresses"
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM orders o WHERE o.id = addresses.order_id AND o.user_id = auth.uid()
    )
  );

CREATE POLICY "addresses_admin_all" ON "addresses"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- CARTS: authenticated owner-only; note guest carts via session_id should be managed at API level
ALTER TABLE "carts" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "carts" FORCE ROW LEVEL SECURITY;

CREATE POLICY "carts_owner_all" ON "carts"
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- CART_ITEMS: owner via parent cart; admin full
ALTER TABLE "cart_items" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "cart_items" FORCE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_owner_all" ON "cart_items"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM carts c WHERE c.id = cart_items.cart_id AND c.user_id = auth.uid()
    )
  );

CREATE POLICY "cart_items_admin_all" ON "cart_items"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- REVIEWS: public can read published; owner can manage; admin full
ALTER TABLE "reviews" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "reviews" FORCE ROW LEVEL SECURITY;

CREATE POLICY "reviews_public_select" ON "reviews"
  FOR SELECT USING (is_published = true);
CREATE POLICY "reviews_owner_all" ON "reviews"
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "reviews_admin_all" ON "reviews"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );