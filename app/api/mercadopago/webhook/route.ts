import { NextRequest, NextResponse } from 'next/server'
import { Payment } from 'mercadopago'
import { db } from '@/lib/db'
import { orders, orderItems, products, productVariants } from '@/lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { client } from '@/lib/mercadopago'

const payment = new Payment(client)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    
    console.log('Webhook received:', JSON.stringify(body, null, 2))
    
    // Manejar diferentes formatos de webhook de MercadoPago
    let paymentId: number | null = null
    
    // Formato nuevo: { data: { id: "123" }, type: "payment" }
    if (body.data && body.data.id && body.type === 'payment') {
      paymentId = body.data.id
      console.log('📧 Payment webhook format detected')
    }
    // Formato alternativo: { resource: "url", topic: "merchant_order" }
    else if (body.resource && body.topic === 'merchant_order') {
      console.log('📧 Merchant order webhook format detected, ignoring for now')
      return NextResponse.json({ received: true });
    }
    // Formato query params (fallback)
    else {
      const url = new URL(req.url)
      const idParam = url.searchParams.get('id')
      const topicParam = url.searchParams.get('topic')
      
      if (idParam && topicParam === 'payment') {
        paymentId = parseInt(idParam)
        console.log('📧 Query params webhook format detected')
      }
    }
    
    // Validar que tenemos un payment ID válido
    if (!paymentId || typeof paymentId !== 'number') {
      console.log('ℹ️ No valid payment ID found, webhook ignored')
      return NextResponse.json({ received: true });
    }

    console.log('🔍 Processing payment ID:', paymentId)

    // Obtener información del pago
    const paymentData = await payment.get({
      id: paymentId,
    })

    if (!paymentData) {
      console.error('❌ Payment not found in MercadoPago:', paymentId)
      return NextResponse.json(
        { error: "Pago no encontrado" },
        { status: 404 }
      );
    }

    console.log('Payment data:', JSON.stringify(paymentData, null, 2))

    // Buscar si ya existe una orden con esta referencia externa
    if (paymentData.external_reference) {
      try {
        console.log('🔍 Looking for order with external_reference:', paymentData.external_reference)
        
        const [existingOrder] = await db
          .select()
          .from(orders)
          .where(eq(orders.id, paymentData.external_reference))
          .limit(1)

        if (existingOrder) {
          // Actualizar orden existente
          const updateData = {
            paymentStatus: paymentData.status || 'pending',
            status: paymentData.status === 'approved' ? 'confirmed' : existingOrder.status,
            updatedAt: new Date(),
          }

          await db
            .update(orders)
            .set(updateData)
            .where(eq(orders.id, paymentData.external_reference))

          console.log('✅ Order updated successfully:', existingOrder.id)

          // Si el pago fue aprobado, reducir stock de productos
          if (paymentData.status === 'approved') {
            // Verificar si ya se procesó el stock para evitar duplicados
            if (existingOrder.paymentStatus === 'approved') {
              console.log('⚠️ Payment already processed, skipping stock reduction')
            } else {
              try {
                // Obtener los items de la orden
                const orderItemsList = await db
                  .select()
                  .from(orderItems)
                  .where(eq(orderItems.orderId, existingOrder.id))

                if (orderItemsList.length === 0) {
                  console.log('⚠️ No order items found for order:', existingOrder.id)
                  return NextResponse.json({ received: true })
                }

                console.log('📦 Processing stock reduction for items:', orderItemsList.length)

                let stockErrors = []

                for (const item of orderItemsList) {
                  try {
                    if (item.variantId) {
                      // Producto con variante (color/talle específico)
                      console.log(`📦 Reducing variant stock: ${item.productTitle} - ${item.variantTitle} x${item.quantity}`)
                      
                      // Verificar stock actual antes de reducir
                      const [currentVariant] = await db
                        .select({ inventoryQuantity: productVariants.inventoryQuantity })
                        .from(productVariants)
                        .where(eq(productVariants.id, item.variantId))
                        .limit(1)

                      if (!currentVariant) {
                        throw new Error(`Variant not found: ${item.variantId}`)
                      }

                      if (currentVariant.inventoryQuantity < item.quantity) {
                        console.warn(`⚠️ Insufficient stock for variant ${item.variantTitle}. Available: ${currentVariant.inventoryQuantity}, Required: ${item.quantity}`)
                        stockErrors.push(`Insufficient stock for ${item.variantTitle}`)
                        // Continuar con la reducción aunque sea negativo (para tracking)
                      }
                      
                      await db
                        .update(productVariants)
                        .set({
                          inventoryQuantity: sql`${productVariants.inventoryQuantity} - ${item.quantity}`,
                          updatedAt: new Date()
                        })
                        .where(eq(productVariants.id, item.variantId))

                      console.log(`✅ Variant stock reduced for: ${item.variantTitle}`)
                    } else {
                      // Producto sin variante (talle único)
                      console.log(`📦 Reducing product stock: ${item.productTitle} x${item.quantity}`)
                      
                      // Verificar stock actual antes de reducir
                      const [currentProduct] = await db
                        .select({ stock: products.stock })
                        .from(products)
                        .where(eq(products.id, item.productId))
                        .limit(1)

                      if (!currentProduct) {
                        throw new Error(`Product not found: ${item.productId}`)
                      }

                      if (currentProduct.stock < item.quantity) {
                        console.warn(`⚠️ Insufficient stock for product ${item.productTitle}. Available: ${currentProduct.stock}, Required: ${item.quantity}`)
                        stockErrors.push(`Insufficient stock for ${item.productTitle}`)
                        // Continuar con la reducción aunque sea negativo (para tracking)
                      }
                      
                      await db
                        .update(products)
                        .set({
                          stock: sql`${products.stock} - ${item.quantity}`,
                          updatedAt: new Date()
                        })
                        .where(eq(products.id, item.productId))

                      console.log(`✅ Product stock reduced for: ${item.productTitle}`)
                    }
                  } catch (stockError) {
                    console.error(`❌ Error updating stock for item ${item.id}:`, stockError)
                    stockErrors.push(`Error updating ${item.productTitle}: ${stockError instanceof Error ? stockError.message : String(stockError)}`)
                    // Continuar con los otros items aunque uno falle
                  }
                }

                if (stockErrors.length > 0) {
                  console.error('❌ Stock reduction completed with errors:', stockErrors)
                } else {
                  console.log('✅ Stock reduction completed successfully')
                }
              } catch (stockError) {
                console.error('❌ Error processing stock reduction:', stockError)
              }
            }
          }
        } else {
          console.log('⚠️ Order not found for external_reference:', paymentData.external_reference)
        }
      } catch (dbError) {
        console.error('❌ Database error in webhook:', dbError)
        return NextResponse.json(
          { error: "Error de base de datos" },
          { status: 500 }
        );
      }
    } else {
      console.log('⚠️ Payment has no external_reference, cannot link to order')
    }

    // Log del estado del pago
    switch (paymentData.status) {
      case 'approved':
        console.log('✅ Payment approved:', paymentId)
        break
      case 'pending':
        console.log('⏳ Payment pending:', paymentId)
        break
      case 'rejected':
        console.log('❌ Payment rejected:', paymentId)
        break
      case 'cancelled':
        console.log('🚫 Payment cancelled:', paymentId)
        break
      default:
        console.log('❓ Unknown payment status:', paymentData.status)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: "Error procesando webhook" },
      { status: 500 }
    );
  }
}