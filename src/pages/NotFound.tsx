import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SEO } from "@/components/SEO";
const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center px-4">
        <h1 className="text-[80px] font-[800] leading-none text-foreground">404</h1>
        <p className="mt-4 text-xl text-foreground">Página não encontrada</p>
        <p className="mt-2 text-sm text-muted-foreground">
          O endereço que você acessou não existe ou foi removido.
        </p>
        <Button
          onClick={() => navigate("/")}
          className="mt-8"
        >
          Voltar ao início
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
