import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { categories, users, products } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const allCategories = await db
      .select({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
        productCount: sql<number>`COUNT(${products.id})`,
      })
      .from(categories)
      .leftJoin(products, eq(products.categoryId, categories.id))
      .where(eq(categories.isActive, true))
      .groupBy(
        categories.id,
        categories.name,
        categories.slug,
        categories.description,
        categories.imageUrl,
        categories.isActive,
      )
      .orderBy(categories.name);

    return NextResponse.json(allCategories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const { name, slug, description } = await req.json();

    // Generate slug from name if not provided
    const categorySlug =
      slug ||
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const newCategory = await db
      .insert(categories)
      .values({
        name,
        slug: categorySlug,
        description,
        imageUrl: null,
        isActive: true,
      })
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
      });

    return NextResponse.json(newCategory[0]);
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const authUserId = data.user.id;

    // 2) Verificar rol admin en BD
    const [record] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, authUserId))
      .limit(1);

    if (!record || record.role !== "admin") {
      return NextResponse.json(
        { error: "Privilegios de admin requeridos" },
        { status: 403 }
      );
    }

    // 3) Validar input y eliminar
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Category ID es requerido" },
        { status: 400 }
      );
    }

    // Si hay productos vinculados, desactivarlos y quitar la relación antes de borrar
    try {
      const linked = await db
        .select({ id: products.id })
        .from(products)
        .where(eq(products.categoryId, id));

      if (linked.length > 0) {
        await db
          .update(products)
          .set({ categoryId: null, isActive: false })
          .where(eq(products.categoryId, id));
      }
    } catch (e) {
      console.error("Error actualizando productos vinculados:", e);
    }

    const deleted = await db
      .delete(categories)
      .where(eq(categories.id, id))
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
      });

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(deleted[0]);
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Fallo al eliminar categoría" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, name, slug, description } = await req.json();
    const supabase = createClient();
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const authUserId = data.user.id;

    // 2) Verificar rol admin en BD
    const [record] = await db
      .select({ role: users.role })
      .from(users)
      .where(eq(users.id, authUserId))
      .limit(1);

    if (!record || record.role !== "admin") {
      return NextResponse.json(
        { error: "Privilegios de admin requeridos" },
        { status: 403 }
      );
    }
    if (!id) {
      return NextResponse.json(
        { error: "Category ID es requerido" },
        { status: 400 }
      );
    }
    // 3) Actualizar categoría
    const updated = await db
      .update(categories)
      .set({
        name,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
        description,
      })
      .where(eq(categories.id, id))
      .returning({
        id: categories.id,
        name: categories.name,
        slug: categories.slug,
        description: categories.description,
        imageUrl: categories.imageUrl,
        isActive: categories.isActive,
      });
    if (updated.length === 0) {
      return NextResponse.json(
        { error: "Categoría no encontrada" },
        { status: 404 }
      );
    }
    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Fallo al actualizar categoría" },
      { status: 500 }
    );
  }
}
