'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Clock, CreditCard, AlertCircle, Home, RefreshCw, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function PaymentPendingPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Obtener parámetros de MercadoPago
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const externalReference = searchParams.get('external_reference')
    const statusDetail = searchParams.get('status_detail')

    setPaymentData({
      paymentId,
      status,
      externalReference,
      statusDetail
    })
  }, [searchParams])

  const getPendingMessage = (statusDetail: string) => {
    switch (statusDetail) {
      case 'pending_contingency':
        return 'Estamos procesando tu pago. Te notificaremos el resultado por email.'
      case 'pending_review_manual':
        return 'Tu pago está siendo revisado. Te contactaremos en las próximas horas.'
      case 'pending_waiting_transfer':
        return 'Esperando la transferencia bancaria.'
      case 'pending_waiting_payment':
        return 'Esperando el pago en efectivo o transferencia.'
      default:
        return 'Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.'
    }
  }

  const getEstimatedTime = (statusDetail: string) => {
    switch (statusDetail) {
      case 'pending_contingency':
        return '2-3 días hábiles'
      case 'pending_review_manual':
        return '24-48 horas'
      case 'pending_waiting_transfer':
        return '1-2 días hábiles'
      case 'pending_waiting_payment':
        return 'Hasta 3 días'
      default:
        return '1-3 días hábiles'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Icono de pendiente */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-yellow-500 rounded-full flex items-center justify-center mb-4">
            <Clock className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago Pendiente
          </h1>
          <p className="text-gray-600">
            Tu pago está siendo procesado
          </p>
        </div>

        {/* Información del estado */}
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertCircle className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800">
            {paymentData?.statusDetail 
              ? getPendingMessage(paymentData.statusDetail)
              : 'Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.'
            }
          </AlertDescription>
        </Alert>

        {/* Información del pago */}
        {paymentData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Detalles del Pago
              </CardTitle>
              <CardDescription>
                Información de tu transacción
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {paymentData.paymentId && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">ID de Pago:</span>
                  <Badge variant="secondary">{paymentData.paymentId}</Badge>
                </div>
              )}
              {paymentData.externalReference && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Número de Orden:</span>
                  <Badge variant="outline">{paymentData.externalReference}</Badge>
                </div>
              )}
              {paymentData.status && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <Badge className="bg-yellow-500 hover:bg-yellow-600">
                    Pendiente
                  </Badge>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tiempo estimado:</span>
                <span className="text-sm font-medium">
                  {paymentData?.statusDetail 
                    ? getEstimatedTime(paymentData.statusDetail)
                    : '1-3 días hábiles'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Próximos pasos */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">¿Qué sigue?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <Mail className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              Te enviaremos un email cuando el pago sea confirmado
            </p>
            <p className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Puedes verificar el estado en tu perfil en cualquier momento
            </p>
            <p className="flex items-start gap-2">
              <Clock className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              Si no hay novedades en 3 días, contacta nuestro soporte
            </p>
          </CardContent>
        </Card>

        {/* Información importante */}
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="space-y-2 text-sm">
              <p className="font-medium text-blue-900">Importante:</p>
              <p className="text-blue-800">
                Tu pedido ha sido reservado y el stock está apartado. 
                No es necesario que realices el pago nuevamente.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/profile/orders">
              Ver Estado del Pedido
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Volver al Inicio
            </Link>
          </Button>
        </div>

        {/* Soporte */}
        <div className="text-center text-sm text-gray-500 bg-white/50 rounded-lg p-4">
          <p className="font-medium mb-1">¿Tienes dudas?</p>
          <p>Nuestro equipo está aquí para ayudarte</p>
          <Button variant="link" className="p-0 h-auto text-sm mt-2">
            <Link href="/contact">
              Contactar Soporte
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}