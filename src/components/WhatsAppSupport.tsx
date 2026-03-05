import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// ============================================================
// 📱 NÚMERO DO WHATSAPP DE SUPORTE — ALTERE AQUI
// Formato: código do país + DDD + número, sem espaços ou sinais
// Exemplo Brasil: 5511999999999
const WHATSAPP_NUMBER = "5534984245641";
// ============================================================

const WHATSAPP_MESSAGE = encodeURIComponent("Olá, sou assinante do plano Pro do PreciFácil e preciso de suporte.");

export function WhatsAppSupport() {
  const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-[#25D366] hover:bg-[#1da851] text-white shadow-lg shadow-black/20"
            onClick={() => window.open(url, "_blank")}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="left">Suporte via WhatsApp</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
