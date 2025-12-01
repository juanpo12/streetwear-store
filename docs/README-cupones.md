# Cupones: diseño, migración e integración con MercadoPago

## Visión General
- Tipos soportados: `percentage`, `fixed_amount`, `free_shipping`.
- Reglas de negocio: límite global (`usageLimit`), mínimo de compra (`minimumAmount`), ventana temporal (`startsAt`/`expiresAt`), asignación a usuario (`coupons.userId`), una redención por usuario.
- Flujo: validación previa en checkout, prorrateo de descuento por ítem, redención definitiva sólo cuando el pago se aprueba.

## Esquema
- `coupons`: agrega `user_id` para cupones ligados a usuario.
- `coupon_redemptions`: tabla de redenciones por usuario con índice único `(coupon_id, user_id)`.
- Referencias:
  - `lib/db/schema.ts:241` (`coupons.userId`)
  - `lib/db/schema.ts:256` (`coupon_redemptions`)

## Migración
- Archivo: `lib/db/migrations/0003_coupons_per_user.sql`.
- Contenido clave:
  - Crea `coupon_redemptions` con FK a `coupons`, `users` y `orders`.
  - Índice único `(coupon_id, user_id)`.
  - RLS: dueño puede `ALL` en `coupon_redemptions`; `admins` `ALL`.
  - `coupons`: `SELECT` público; `admins` `ALL`.
- Cómo aplicar en Supabase (recomendado):
  - Abrir SQL Editor → pegar el contenido completo del archivo → ejecutar.
  - Verificar tablas y políticas: `coupon_redemptions` y columna `coupons.user_id` existentes.

## Utilidades
- Archivo: `lib/coupons.ts`.
- Validaciones con `zod` y generación segura con `crypto.randomBytes`.
- Referencias:
  - Tipos y reglas: `lib/coupons.ts:24`
  - Crear cupón: `lib/coupons.ts:54`
  - Validar uso: `lib/coupons.ts:104`
  - Redimir cupón: `lib/coupons.ts:134`

## Integración en API
- Create Preference (aplicación de descuento y prorrateo por ítem):
  - `app/api/mercadopago/create-preference/route.ts:153` (validación y aplicación)
  - `app/api/mercadopago/create-preference/route.ts:177` (prorrateo por ítem)
  - `app/api/mercadopago/create-preference/route.ts:202` (creación de orden)
- Webhook (redención tras pago aprobado):
  - `app/api/mercadopago/webhook/route.ts:205` (redención `redeemCoupon`)

## Ejemplos
- 15% de descuento:
```ts
await createCoupon({
  type: 'percentage',
  value: 15,
  minimumAmount: 0,
  usageLimit: 100,
  prefix: 'LANZ',
  groups: 3,
  groupSize: 4,
})
```
- $1500 fijo:
```ts
await createCoupon({
  type: 'fixed_amount',
  value: 1500,
  minimumAmount: 5000,
  usageLimit: 50,
  prefix: 'VIP',
})
```
- Cupón ligado a usuario:
```ts
await db.insert(coupons).values({
  code: generateCode({ prefix: 'PERS' }),
  type: 'fixed_amount',
  value: '1500',
  userId: '<USER_UUID>',
  isActive: true,
})
```

## Seguridad
- Generación cripto-segura y normalización de códigos.
- RLS: usuarios sólo ven y crean sus propias redenciones; admins gestionan cupones.
- Redención en transacción: inserta redención y aumenta `usedCount` de forma atómica.

## Operativa
- Si el `push/migrate` de Drizzle falla por parsing en Node 22, aplica el SQL manualmente en Supabase.
- Usa `push`/`migrate` con Node 20 o actualiza `drizzle-kit` cuando esté disponible.

## Límites y consumo
- Límite global: define `usageLimit` en el cupón. Cuando `usedCount` alcanza el límite, la validación devuelve `global_limit` y bloquea nuevos usos (`lib/coupons.ts:116-117`).
- Una vez por usuario: el índice único `(coupon_id, user_id)` en `coupon_redemptions` impide reusar el mismo cupón por el mismo usuario (`lib/db/migrations/0003_coupons_per_user.sql`).
- Consumo sólo con pago aprobado: la redención se registra en el webhook de pago aprobado; aplicar el cupón en checkout no lo gasta (`app/api/mercadopago/webhook/route.ts:205`).
- Incremento atómico de `usedCount`: la redención aumenta el contador en transacción con `sql` para evitar condiciones de carrera (`lib/coupons.ts:141-143`).

### Ejemplos SQL
- Cupón general 15% con límite global 10:
```sql
INSERT INTO "coupons" (
  "code","type","value","minimum_amount","usage_limit","used_count","is_active",
  "user_id","starts_at","expires_at","created_at","updated_at"
) VALUES (
  'LANZ-15-GEN',
  'percentage',
  '15',
  NULL,
  10,
  0,
  TRUE,
  NULL,
  NOW(),
  NOW() + INTERVAL '14 days',
  NOW(),
  NOW()
);
```
- Cupón fijo $1500 ligado a usuario:
```sql
INSERT INTO "coupons" (
  "code","type","value","minimum_amount","usage_limit","used_count","is_active",
  "user_id","starts_at","expires_at","created_at","updated_at"
) VALUES (
  'VIP-1500-JUANJ',
  'fixed_amount',
  '1500',
  NULL,
  1,
  0,
  TRUE,
  '<USER_UUID>',
  NOW(),
  NOW() + INTERVAL '7 days',
  NOW(),
  NOW()
);
```
