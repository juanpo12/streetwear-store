'use client'
import { useCategories } from "@/hooks/use-products"

export default function Categorias() {
  const { categories, loading, error } = useCategories()
  if (loading) return <div>Cargando...</div>
  if (error) return <div>Error: {error}</div>
  return (
    <div>
      <h1>Categorias</h1>
      <ul>
        {categories.map(category => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  )
}