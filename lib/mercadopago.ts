import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

// Configuración de Mercado Pago
const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN!;

export const client = new MercadoPagoConfig({
  accessToken,
  options: {
    timeout: 5000,
  },
});

export const preference = new Preference(client);
export const payment = new Payment(client);

// Función para generar claves de idempotencia únicas
function generateIdempotencyKey(orderId: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return `pref_${orderId}_${timestamp}_${random}`;
}

// Los ítems deben venir en el formato esperado por MercadoPago
export interface PreferenceItem {
  id: string;
  title: string;
  description?: string;
  quantity: number;
  unit_price: number;
  currency_id?: string;
  picture_url?: string;
  category_id?: string;
}

export interface CreatePreferenceData {
  items: PreferenceItem[];
  orderId: string;
  payer?: {
    name?: string;
    surname?: string;
    email?: string;
    phone?: {
      area_code?: string;
      number?: string;
    };
  };
}

export async function createPreference(data: CreatePreferenceData) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const idempotencyKey = generateIdempotencyKey(data.orderId);

    const preferenceData: any = {
      items: data.items,
      ...(process.env.MERCADOPAGO_ENABLE_SHIPMENTS === 'true'
        ? {
            shipments: {
              mode: 'me2',
              local_pickup: true,
              dimensions: '30x30x30,500',
            },
          }
        : {}),
      back_urls: {
        success: `${baseUrl}/orders/success`,
        failure: `${baseUrl}/orders/failure`,
        pending: `${baseUrl}/orders/pending`,
      },
      auto_return: "approved",
      statement_descriptor: "ES INDUMENTARIA",
      external_reference: data.orderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      // Campos avanzados removidos para evitar bloqueos del PolicyAgent.
    };

    // Solo agregar payer si se proporciona
    if (data.payer && (data.payer.email || data.payer.name)) {
      preferenceData.payer = data.payer;
    }

    const response = await preference.create({ 
      body: preferenceData,
      requestOptions: {
        idempotencyKey: idempotencyKey
      }
    });
    return response;
  } catch (error) {
    console.error("Error creating preference:", error);
    throw error;
  }
}