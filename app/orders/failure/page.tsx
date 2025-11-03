'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { XCircle, CreditCard, ArrowLeft, Home, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function PaymentFailurePage() {
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

  const getErrorMessage = (status: string, statusDetail: string) => {
    if (status === 'rejected') {
      switch (statusDetail) {
        case 'cc_rejected_insufficient_amount':
          return 'Fondos insuficientes en la tarjeta'
        case 'cc_rejected_bad_filled_security_code':
          return 'Código de seguridad incorrecto'
        case 'cc_rejected_bad_filled_date':
          return 'Fecha de vencimiento incorrecta'
        case 'cc_rejected_bad_filled_other':
          return 'Datos de la tarjeta incorrectos'
        case 'cc_rejected_high_risk':
          return 'Pago rechazado por seguridad'
        default:
          return 'El pago fue rechazado por el banco'
      }
    }
    return 'Hubo un problema procesando tu pago'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Icono de error */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mb-4">
            <XCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Pago No Procesado
          </h1>
          <p className="text-gray-600">
            No pudimos procesar tu pago en este momento
          </p>
        </div>

        {/* Información del error */}
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700">
            {paymentData?.status && paymentData?.statusDetail 
              ? getErrorMessage(paymentData.status, paymentData.statusDetail)
              : 'Hubo un problema procesando tu pago. Por favor, intenta nuevamente.'
            }
          </AlertDescription>
        </Alert>

        {/* Información del pago */}
        {paymentData && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Detalles del Intento
              </CardTitle>
              <CardDescription>
                Información del pago fallido
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
                  <Badge variant="destructive">
                    {paymentData.status === 'rejected' ? 'Rechazado' : paymentData.status}
                  </Badge>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Sugerencias */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">¿Qué puedes hacer?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-gray-600">
            <p className="flex items-start gap-2">
              <CreditCard className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
              Verifica los datos de tu tarjeta (número, fecha, código de seguridad)
            </p>
            <p className="flex items-start gap-2">
              <RefreshCw className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              Intenta con otra tarjeta o método de pago
            </p>
            <p className="flex items-start gap-2">
              <XCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              Contacta a tu banco si el problema persiste
            </p>
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/shop" className="flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4" />
              Intentar Nuevamente
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
          <p className="font-medium mb-1">¿Necesitas ayuda?</p>
          <p>Contacta nuestro soporte para asistencia personalizada</p>
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