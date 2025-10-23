'use client'

import { useCategories } from "@/hooks/use-products"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Edit, Trash2 } from "lucide-react"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"

export default function Categorias() {
  const { categories, loading, error, deleteCategory, updateCategory } = useCategories()
  const { toast } = useToast()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editing, setEditing] = useState<{ id: string; name: string; slug?: string; description?: string } | null>(null)

  const handleDelete = async () => {
    if (!confirmId) return
    setDeletingId(confirmId)
    const ok = await deleteCategory(confirmId)
    if (ok) {
      toast({ title: "Categoría eliminada", description: "Se eliminó correctamente. Los productos vinculados se desactivaron." })
    } else {
      toast({ title: "Error al eliminar", description: "No se pudo eliminar la categoría.", variant: "destructive" })
    }
    setDeletingId(null)
    setConfirmId(null)
  }

  const openEdit = (cat: { id: string; name: string; slug?: string; description?: string }) => {
    setEditing({ id: cat.id, name: cat.name, slug: cat.slug, description: cat.description })
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!editing) return
    const res = await updateCategory({ id: editing.id, name: editing.name, slug: editing.slug, description: editing.description })
    if (res) {
      toast({ title: "Categoría actualizada", description: "Los cambios se guardaron correctamente." })
      setIsEditOpen(false)
      setEditing(null)
    } else {
      toast({ title: "Error al actualizar", description: "No se pudo actualizar la categoría.", variant: "destructive" })
    }
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-streetwear-lg">CATEGORÍAS</h1>
            <p className="text-muted-foreground">Gestiona las categorías de la tienda</p>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && <div className="mb-4 text-sm text-muted-foreground">Cargando categorías...</div>}
        {error && <div className="mb-4 text-sm text-red-500">Error: {error}</div>}

        {/* Categories Table */}
        <Card>
          <CardHeader>
            <CardTitle>LISTA DE CATEGORÍAS</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Productos</TableHead>
                  <TableHead className="w-[160px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[300px]">
                      {category.description || "-"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{category.productCount ?? 0}</TableCell>
                    <TableCell className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEdit({ id: category.id, name: category.name, slug: category.slug ?? undefined, description: category.description ?? undefined })}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog open={confirmId === category.id} onOpenChange={(open) => !open && setConfirmId(null)}>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setConfirmId(category.id)}
                            disabled={deletingId === category.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Eliminar categoría</AlertDialogTitle>
                            <AlertDialogDescription>
                              {category.productCount && category.productCount > 0 ? (
                                <span>
                                  Esta categoría tiene {category.productCount} producto(s). Si la eliminás, esos productos
                                  quedarán desactivados hasta que les asignés una nueva categoría.
                                </span>
                              ) : (
                                <span>¿Estás seguro que querés eliminar "{category.name}"? Esta acción no se puede deshacer.</span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} disabled={deletingId === category.id}>
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
                {categories.length === 0 && !loading && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No hay categorías aún.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => { setIsEditOpen(open); if (!open) setEditing(null) }}>
          <DialogContent className="sm:max-w-[480px]">
            <DialogHeader>
              <DialogTitle className="text-streetwear-base">EDITAR CATEGORÍA</DialogTitle>
            </DialogHeader>
            {editing && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Nombre</label>
                  <Input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Slug</label>
                  <Input
                    value={editing.slug || ''}
                    onChange={(e) => setEditing({ ...editing, slug: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <label className="text-right font-medium">Descripción</label>
                  <Input
                    value={editing.description || ''}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => { setIsEditOpen(false); setEditing(null) }}>Cancelar</Button>
                  <Button onClick={handleSaveEdit}>Guardar</Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}