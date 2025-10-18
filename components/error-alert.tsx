'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ErrorAlert() {
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(errorParam)
      setIsVisible(true)
      
      // Auto-hide after 10 seconds
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [searchParams])

  const getErrorMessage = (errorType: string) => {
    switch (errorType) {
      case 'unauthorized':
        return {
          title: 'Acceso Denegado',
          description: 'No tienes permisos para acceder a la sección de administración. Solo los administradores pueden acceder a esta área.'
        }
      case 'server_error':
        return {
          title: 'Error del Servidor',
          description: 'Ocurrió un error al verificar tus permisos. Por favor, intenta nuevamente más tarde.'
        }
      default:
        return {
          title: 'Error',
          description: 'Ocurrió un error inesperado.'
        }
    }
  }

  if (!error || !isVisible) return null

  const { title, description } = getErrorMessage(error)

  return (
    <div className="fixed top-4 right-4 z-50 max-w-md">
      <Alert variant="destructive" className="shadow-lg">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle className="flex items-center justify-between">
          {title}
          <Button
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-destructive-foreground hover:bg-destructive/20"
            onClick={() => setIsVisible(false)}
          >
            <X className="h-3 w-3" />
          </Button>
        </AlertTitle>
        <AlertDescription className="mt-2">
          {description}
        </AlertDescription>
      </Alert>
    </div>
  )
}