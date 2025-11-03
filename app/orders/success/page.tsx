'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, ArrowRight, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams()
  const [paymentData, setPaymentData] = useState<any>(null)

  useEffect(() => {
    // Obtener parámetros de MercadoPago
    const paymentId = searchParams.get('payment_id')
    const status = searchParams.get('status')
    const externalReference = searchParams.get('external_reference')
    const merchantOrderId = searchParams.get('merchant_order_id')

    setPaymentData({
      paymentId,
      status,
      externalReference,
      merchantOrderId
    })
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Icono de éxito */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ¡Pago Exitoso!
          </h1>
          <p className="text-gray-600">
            Tu compra ha sido procesada correctamente
          </p>
        </div>

        {/* Información del pago */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Detalles de la Compra
            </CardTitle>
            <CardDescription>
              Información de tu pedido
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {paymentData?.paymentId && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">ID de Pago:</span>
                <Badge variant="secondary">{paymentData.paymentId}</Badge>
              </div>
            )}
            {paymentData?.externalReference && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Número de Orden:</span>
                <Badge variant="outline">{paymentData.externalReference}</Badge>
              </div>
            )}
            {paymentData?.status && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Estado:</span>
                <Badge className="bg-green-500 hover:bg-green-600">
                  {paymentData.status === 'approved' ? 'Aprobado' : paymentData.status}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botones de acción */}
        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/profile/orders">
              Ver Mis Pedidos
            </Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/" className="flex items-center justify-center gap-2">
              <Home className="w-4 h-4" />
              Volver al Inicio
            </Link>
          </Button>
        </div>

        {/* Mensaje de agradecimiento */}
        <div className="text-center text-sm text-gray-500 bg-white/50 rounded-lg p-4">
          <p>¡Gracias por tu compra en ES INDUMENTARIA!</p>
          <p>Esperamos que disfrutes tu nueva ropa streetwear.</p>
        </div>
      </div>
    </div>
  )
}