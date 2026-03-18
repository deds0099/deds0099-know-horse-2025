/**
 * Helper para integração com o Checkout Pro do Mercado Pago (Modal)
 */

declare global {
  interface Window {
    MercadoPago: any;
  }
}

let mpInstance: any = null;

/**
 * Inicializa o SDK do Mercado Pago
 */
export const initMercadoPago = () => {
  if (mpInstance) return mpInstance;

  const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
  if (!publicKey) {
    console.error('VITE_MERCADOPAGO_PUBLIC_KEY não configurada no .env');
    return null;
  }

  if (window.MercadoPago) {
    mpInstance = new window.MercadoPago(publicKey, {
      locale: 'pt-BR'
    });
    return mpInstance;
  }

  console.error('SDK do Mercado Pago não encontrado no window. Verifique se o script foi carregado no index.html');
  return null;
};

/**
 * Abre o Checkout Pro em modal
 * @param preferenceId ID da preferência gerada no backend
 */
export const openCheckout = (preferenceId: string) => {
  const mp = initMercadoPago();
  if (!mp) {
    console.error('Não foi possível inicializar o Mercado Pago');
    return;
  }

  const checkout = mp.checkout({
    preference: {
      id: preferenceId
    },
    autoOpen: true, // Abre automaticamente o modal
  });

  return checkout;
};
