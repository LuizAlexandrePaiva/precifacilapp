import { MessageCircle } from "lucide-react";
import { TouchTooltip } from "@/components/TouchTooltip";

// ============================================================
// 📱 NÚMERO DO WHATSAPP DE SUPORTE — ALTERE AQUI
const WHATSAPP_NUMBER = "5534984245641";
// ============================================================

const WHATSAPP_MESSAGE = encodeURIComponent("Olá, sou assinante do plano Pro do PreciFácil e preciso de suporte.");

export function WhatsAppSupport() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
      <TouchTooltip content="Suporte via WhatsApp" iconSize="h-0 w-0" />
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white shadow-lg shadow-black/20 flex items-center justify-center"
      >
        <MessageCircle className="h-6 w-6" />
      </a>
    </div>
  );
}
