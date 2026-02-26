


/**
 * Envia uma mensagem de texto via Evolution API.
 */
export const sendEvolutionMessage = async (phone: string, message: string): Promise<boolean> => {
  try {
    const apiUrl = import.meta.env.VITE_EVOLUTION_API_URL;
    const apiKey = import.meta.env.VITE_EVOLUTION_API_KEY;
    const instanceName = import.meta.env.VITE_EVOLUTION_INSTANCE_NAME;

    if (!apiUrl || !apiKey || !instanceName) {
        console.error('Evolution API credentials not found in environment variables.');
        return false;
    }

    const url = `${apiUrl}/message/sendText/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: `55${phone.replace(/\D/g, '')}`,
        textMessage: {
          text: message
        }
      })
    });

    return response.ok;
  } catch (err) {
    console.error('Erro de conexão com a Evolution API:', err);
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

    const url = `${apiUrl}/message/sendMedia/${instanceName}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': apiKey
      },
      body: JSON.stringify({
        number: `55${phone.replace(/\D/g, '')}`,
        mediaMessage: {
          mediaType: 'document',
          media: base64,
          fileName: fileName
        }
      })
    });

    return response.ok;
  } catch (err) {
    console.error('Erro de conexão com a Evolution API ao enviar documento:', err);
    return false;
  }
};
