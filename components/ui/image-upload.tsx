"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Upload, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useImageUpload } from '@/hooks/use-image-upload'

interface ImageFile {
  file: File
  preview: string
  id: string
}

interface UploadedImage {
  originalName: string
  fileName: string
  filePath: string
  url: string
  size: number
  type: string
}

interface ImageUploadProps {
  onImagesChange: (images: UploadedImage[]) => void
  maxImages?: number
  maxSize?: number // in bytes
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({
  onImagesChange,
  maxImages = 10,
  maxSize = 5 * 1024 * 1024, // 5MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className
}: ImageUploadProps) {
  const [localImages, setLocalImages] = useState<ImageFile[]>([])
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([])
  const [error, setError] = useState<string | null>(null)
  const { uploadImages, deleteImage, uploading, error: uploadError } = useImageUpload()

  const onDrop = useCallback(async (acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)

    // Handle rejected files
    if (rejectedFiles.length > 0) {
      const errors = rejectedFiles.map(({ file, errors }) => {
        const errorMessages = errors.map((e: any) => {
          switch (e.code) {
            case 'file-too-large':
              return `${file.name} es demasiado grande (máximo ${maxSize / 1024 / 1024}MB)`
            case 'file-invalid-type':
              return `${file.name} no es un tipo de archivo válido`
            default:
              return `Error con ${file.name}: ${e.message}`
          }
        })
        return errorMessages.join(', ')
      })
      setError(errors.join('; '))
      return
    }

    // Check if adding new files would exceed max limit
    if (uploadedImages.length + acceptedFiles.length > maxImages) {
      setError(`Solo puedes subir un máximo de ${maxImages} imágenes`)
      return
    }

    // Process accepted files for preview
    const newLocalImages: ImageFile[] = acceptedFiles.map(file => ({
      file,
      preview: URL.createObjectURL(file),
      id: Math.random().toString(36).substr(2, 9)
    }))

    setLocalImages(prev => [...prev, ...newLocalImages])

    try {
      // Upload images
      const uploaded = await uploadImages(newLocalImages)
      
      // Update uploaded images
      const updatedUploadedImages = [...uploadedImages, ...uploaded]
      setUploadedImages(updatedUploadedImages)
      onImagesChange(updatedUploadedImages)
      
      // Clear local images after successful upload
      setLocalImages(prev => prev.filter(img => !newLocalImages.some(newImg => newImg.id === img.id)))
      
      // Cleanup preview URLs
      newLocalImages.forEach(img => URL.revokeObjectURL(img.preview))
      
    } catch (error) {
      // Keep local images for retry if upload fails
      console.error('Upload failed:', error)
    }
  }, [uploadedImages, maxImages, maxSize, onImagesChange, uploadImages])

  const removeImage = useCallback(async (id: string, isUploaded: boolean = false, filePath?: string) => {
    if (isUploaded && filePath) {
      try {
        await deleteImage(filePath)
        const updatedUploadedImages = uploadedImages.filter(img => img.filePath !== filePath)
        setUploadedImages(updatedUploadedImages)
        onImagesChange(updatedUploadedImages)
      } catch (error) {
        console.error('Failed to delete image:', error)
        setError('Error al eliminar la imagen')
      }
    } else {
      // Remove local image
      const updatedLocalImages = localImages.filter(img => {
        if (img.id === id) {
          URL.revokeObjectURL(img.preview)
          return false
        }
        return true
      })
      setLocalImages(updatedLocalImages)
    }
  }, [localImages, uploadedImages, onImagesChange, deleteImage])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize,
    multiple: true,
    disabled: uploadedImages.length >= maxImages || uploading
  })

  // Cleanup object URLs on unmount
  React.useEffect(() => {
    return () => {
      localImages.forEach(img => URL.revokeObjectURL(img.preview))
    }
  }, [])

  // Combine error messages
  const displayError = error || uploadError

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
          isDragActive 
            ? "border-primary bg-primary/5" 
            : "border-muted-foreground/25 hover:border-muted-foreground/50",
          (uploadedImages.length >= maxImages || uploading) && "opacity-50 cursor-not-allowed"
        )}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <Loader2 className="h-8 w-8 mx-auto mb-4 text-primary animate-spin" />
        ) : (
          <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
        )}
        {uploading ? (
          <p className="text-sm text-primary">Subiendo imágenes...</p>
        ) : isDragActive ? (
          <p className="text-sm text-primary">Suelta las imágenes aquí...</p>
        ) : (
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Arrastra y suelta imágenes aquí, o haz clic para seleccionar
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              Máximo {maxImages} imágenes, {maxSize / 1024 / 1024}MB cada una
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              disabled={uploadedImages.length >= maxImages || uploading}
              type="button"
            >
              SELECCIONAR ARCHIVOS
            </Button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {displayError && (
        <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
          {displayError}
        </div>
      )}

      {/* Image Previews */}
      {(localImages.length > 0 || uploadedImages.length > 0) && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Imágenes</h4>
            <Badge variant="secondary">
              {uploadedImages.length + localImages.length} / {maxImages}
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* Uploaded Images */}
            {uploadedImages.map((image) => (
              <Card key={image.filePath} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={image.url}
                      alt={image.originalName}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage('', true, image.filePath)}
                        className="h-8 w-8 p-0"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="default" className="text-xs">
                        Subida
                      </Badge>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.originalName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(image.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Local Images (being uploaded) */}
            {localImages.map((image) => (
              <Card key={image.id} className="relative group overflow-hidden">
                <CardContent className="p-0">
                  <div className="aspect-square relative">
                    <img
                      src={image.preview}
                      alt={image.file.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => removeImage(image.id)}
                        className="h-8 w-8 p-0"
                        type="button"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        Subiendo
                      </Badge>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground truncate">
                      {image.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(image.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}