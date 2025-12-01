-- Add user linkage to coupons and per-user redemptions tracking
ALTER TABLE "coupons" ADD COLUMN IF NOT EXISTS "user_id" uuid REFERENCES "users"("id") ON DELETE CASCADE;

CREATE TABLE IF NOT EXISTS "coupon_redemptions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "coupon_id" uuid NOT NULL REFERENCES "coupons"("id") ON DELETE CASCADE,
  "user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
  "order_id" uuid REFERENCES "orders"("id") ON DELETE SET NULL,
  "redeemed_at" timestamp NOT NULL DEFAULT now()
);

-- Ensure single redemption per user per coupon
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE indexname = 'coupon_redemptions_unique_coupon_user'
  ) THEN
    CREATE UNIQUE INDEX "coupon_redemptions_unique_coupon_user"
      ON "coupon_redemptions" ("coupon_id", "user_id");
  END IF;
END $$;

-- Optional: basic RLS
ALTER TABLE "coupon_redemptions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupon_redemptions" FORCE ROW LEVEL SECURITY;

CREATE POLICY "coupon_redemptions_owner_all" ON "coupon_redemptions"
  FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

CREATE POLICY "coupon_redemptions_admin_all" ON "coupon_redemptions"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

-- Coupons can be public-readable, admin-managed
ALTER TABLE "coupons" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "coupons" FORCE ROW LEVEL SECURITY;

CREATE POLICY "coupons_public_select" ON "coupons" FOR SELECT USING (true);

CREATE POLICY "coupons_admin_all" ON "coupons"
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM users u WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );

