
import { supabase } from '../lib/supabaseClient';

/**
 * Envia uma mensagem de texto via Evolution API.
 */
export const sendEvolutionMessage = async (phone: string, message: string): Promise<boolean> => {
  try {
    const { data: settings, error } = await supabase.from('app_settings').select('*');
    if (error || !settings) return false;

    const apiUrl = settings.find(s => s.key === 'evolution_api_url')?.value;
    const apiKey = settings.find(s => s.key === 'evolution_api_key')?.value;
    const instanceName = settings.find(s => s.key === 'evolution_instance_name')?.value;

    if (!apiUrl || !apiKey || !instanceName) return false;

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
    const { data: settings, error } = await supabase.from('app_settings').select('*');
    if (error || !settings) return false;

    const apiUrl = settings.find(s => s.key === 'evolution_api_url')?.value;
    const apiKey = settings.find(s => s.key === 'evolution_api_key')?.value;
    const instanceName = settings.find(s => s.key === 'evolution_instance_name')?.value;

    if (!apiUrl || !apiKey || !instanceName) return false;

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
