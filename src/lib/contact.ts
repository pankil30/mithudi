import { commerceRules } from '@/data/catalog';

export const WHATSAPP_NUMBER = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER as string | undefined) || commerceRules.whatsappNumber;
export const SUPPORT_EMAIL = commerceRules.supportEmail;

export const whatsappLink = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
