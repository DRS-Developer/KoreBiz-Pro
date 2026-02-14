
import emailjs from '@emailjs/browser';

interface EmailData {
  name: string;
  email: string;
  phone: string;
  message: string;
  to_name?: string; 
}

interface EmailSettings {
  provider: 'emailjs' | 'supabase';
  emailjs: {
    serviceId: string;
    templateId: string;
    publicKey: string;
  };
  supabase: {
    functionUrl: string;
    anonKey: string;
  };
}

export const sendContactEmail = async (data: EmailData, settings?: EmailSettings): Promise<void> => {
  // Use settings from DB if provided, otherwise fallback to environment variables
  const provider = settings?.provider || 'emailjs';
  
  if (provider === 'emailjs') {
    const serviceId = settings?.emailjs?.serviceId || import.meta.env.VITE_EMAILJS_SERVICE_ID;
    const templateId = settings?.emailjs?.templateId || import.meta.env.VITE_EMAILJS_TEMPLATE_ID;
    const publicKey = settings?.emailjs?.publicKey || import.meta.env.VITE_EMAILJS_PUBLIC_KEY;

    if (!serviceId || !templateId || !publicKey) {
      console.warn('EmailJS not configured. Check Admin Settings or environment variables.');
      return; 
    }

    try {
      const templateParams = {
        from_name: data.name,
        from_email: data.email,
        phone: data.phone,
        message: data.message,
        to_name: data.to_name || 'ArsInstalações',
      };

      const response = await emailjs.send(
        serviceId,
        templateId,
        templateParams,
        publicKey
      );

      console.log('SUCCESS!', response.status, response.text);
    } catch (error) {
      console.error('FAILED...', error);
      throw new Error('Falha ao enviar e-mail via EmailJS.');
    }
  } else if (provider === 'supabase') {
    // Supabase Edge Function logic
    const functionUrl = settings?.supabase?.functionUrl;
    const anonKey = settings?.supabase?.anonKey;

    if (!functionUrl) {
      console.warn('Supabase Function URL not configured.');
      return;
    }

    try {
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${anonKey}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Supabase Function Error: ${response.statusText}`);
      }
    } catch (error) {
      console.error('FAILED...', error);
      throw new Error('Falha ao enviar e-mail via Supabase Function.');
    }
  }
};
