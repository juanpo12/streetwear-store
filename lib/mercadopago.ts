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

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  variantId?: string;
  variantTitle?: string;
  size?: string;
  color?: string;
}

export interface CreatePreferenceData {
  items: CartItem[];
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
      items: data.items.map((item) => ({
        id: item.id,
        title: item.name,
        description: item.variantTitle 
          ? `${item.name} - ${item.variantTitle}` 
          : item.name,
        quantity: item.quantity,
        unit_price: item.price,
        currency_id: "ARS",
      })),
      shipments: {
        mode: "me2", // Activa Mercado Envíos
        local_pickup: true, // Permitir "retiro en el local"
        dimensions: "30x30x30,500"
      },
      back_urls: {
        success: `${baseUrl}/orders/success`,
        failure: `${baseUrl}/orders/failure`,
        pending: `${baseUrl}/orders/pending`,
      },
      auto_return: "approved",
      statement_descriptor: "ES INDUMENTARIA",
      external_reference: data.orderId,
      notification_url: `${baseUrl}/api/mercadopago/webhook`,
      expires: false,
      binary_mode: false,
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