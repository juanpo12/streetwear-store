import { useState, useCallback } from 'react'

interface UploadedImage {
  originalName: string
  fileName: string
  filePath: string
  url: string
  size: number
  type: string
}

interface ImageFile {
  file: File
  preview: string
  id: string
}

interface UseImageUploadReturn {
  uploadImages: (images: ImageFile[]) => Promise<UploadedImage[]>
  deleteImage: (filePath: string) => Promise<void>
  uploading: boolean
  error: string | null
}

export const useImageUpload = (): UseImageUploadReturn => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadImages = useCallback(async (images: ImageFile[]): Promise<UploadedImage[]> => {
    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      
      images.forEach((image) => {
        formData.append('files', image.file)
      })

      const response = await fetch('/api/upload-test', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Upload failed')
      }

      return result.files
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed'
      setError(message)
      throw err
    } finally {
      setUploading(false)
    }
  }, [])

  const deleteImage = useCallback(async (filePath: string): Promise<void> => {
    setError(null)

    try {
      const response = await fetch('/api/upload', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ filePath }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Delete failed')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Delete failed'
      setError(message)
      throw err
    }
  }, [])

  return {
    uploadImages,
    deleteImage,
    uploading,
    error,
  }
}