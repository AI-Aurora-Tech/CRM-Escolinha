


import { supabase } from '../lib/supabaseClient';

/**
 * Obtém as configurações da Evolution API do Supabase ou variáveis de ambiente.
 */
const getEvolutionConfig = async () => {
  const { data } = await supabase.from('app_settings').select('*');
  
  let url = import.meta.env.VITE_EVOLUTION_API_URL;
  let key = import.meta.env.VITE_EVOLUTION_API_KEY;
  let instance = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME;

  if (data) {
    const dbUrl = data.find(s => s.key === 'evolution_api_url')?.value;
    const dbKey = data.find(s => s.key === 'evolution_api_key')?.value;
    const dbInstance = data.find(s => s.key === 'evolution_instance_name')?.value;

    if (dbUrl) url = dbUrl;
    if (dbKey) key = dbKey;
    if (dbInstance) instance = dbInstance;
  }

  return { url, key, instance };
};

/**
 * Envia uma mensagem de texto via Evolution API.
 */
export const sendEvolutionMessage = async (phone: string, message: string): Promise<boolean> => {
  try {
    const { key: apiKey, instance: instanceName } = await getEvolutionConfig();

    if (!apiKey || !instanceName) {
        console.error('Evolution API credentials not found.');
        return false;
    }

    // Sanitização: Trocar "Escolinha Pitangueiras" por "Pitangueiras FC"
    const sanitizedMessage = message.replace(/escolinha\s+Pitangueiras/gi, 'Pitangueiras FC');

    const url = `/api/evolution/message/sendText/${instanceName}`;
    console.log(`Sending to Evolution API: ${url}`);

    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const payload = {
      number: formattedPhone,
      text: sanitizedMessage
    };
    console.log('Payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify(payload)
    });

    console.log('Evolution API Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Evolution API Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: url
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error('Fetch Error to Evolution API:', err);
    return false;
  }
};

/**
 * Envia um documento PDF via Evolution API utilizando Base64.
 */
export const sendEvolutionDocument = async (phone: string, base64: string, fileName: string): Promise<boolean> => {
  try {
    const { url: apiUrl, key: apiKey, instance: instanceName } = await getEvolutionConfig();

    if (!apiUrl || !apiKey || !instanceName) {
        console.error('Evolution API credentials not found.');
        return false;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const url = `/api/evolution/message/sendMedia/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: formattedPhone,
        mediaMessage: {
          mediaType: 'document',
          media: base64,
          fileName: fileName
        }
      })
    });

    console.log('Evolution API Document Response Status:', response.status, response.statusText);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Evolution API Document Error Details:', {
        status: response.status,
        statusText: response.statusText,
        body: errorBody,
        url: url
      });
      return false;
    }

    return true;
  } catch (err) {
    console.error('Erro de conexão com a Evolution API ao enviar documento:', err);
    return false;
  }
};
