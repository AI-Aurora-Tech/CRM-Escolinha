


/**
 * Envia uma mensagem de texto via Evolution API.
 */
export const sendEvolutionMessage = async (phone: string, message: string): Promise<boolean> => {
  try {
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
    const instanceName = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME;

    if (!apiKey || !instanceName) {
        console.error('Evolution API credentials not found in environment variables.');
        return false;
    }

    const url = `/api/evolution/message/sendText/${instanceName}`;
    console.log(`Sending to Evolution API: ${url}`);

    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;

    const payload = {
      number: formattedPhone,
      text: message
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
    const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL;
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
    const instanceName = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME;

    if (!apiUrl || !apiKey || !instanceName) {
        console.error('Evolution API credentials not found in environment variables.');
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
