import { Outlet } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { WhatsAppSupport } from '@/components/WhatsAppSupport';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function AppLayout() {
  const { displayName } = useAuth();
  const { plan } = useSubscription();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-14 flex items-center justify-between border-b px-4">
            <div className="flex items-center gap-2 ml-1">
              <SidebarTrigger />
              <span className="text-sm font-medium text-muted-foreground">Menu</span>
            </div>
            <span className="text-sm text-muted-foreground">{displayName}</span>
          </header>
          <main className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </main>
          <footer className="border-t px-4 py-3 text-center text-sm text-muted-foreground">
            Dúvidas? Fale com a gente:{' '}
            <a href="mailto:suporte@precifacil.app.br" className="text-primary hover:underline">
              suporte@precifacil.app.br
            </a>
          </footer>
        </div>
        {plan === 'pro' && <WhatsAppSupport />}
      </div>
    </SidebarProvider>
  );
}
