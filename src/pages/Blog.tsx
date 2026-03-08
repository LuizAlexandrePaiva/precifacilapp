import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { blogPosts } from '@/data/blogPosts';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

export default function Blog() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Blog · Dicas de precificação para freelancers"
        description="Artigos práticos sobre como cobrar corretamente, montar propostas e viver de freelancer no Brasil."
        path="/blog"
      />

      {/* Header */}
      <header className="border-b border-border/50 bg-secondary/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-secondary-foreground">
            Preci<span className="text-primary">Fácil</span>
          </Link>
          <div className="flex gap-2">
            {user ? (
              <Button asChild>
                <Link to="/app">Ir para o App</Link>
              </Button>
            ) : (
              <>
                <Button variant="ghost" className="text-secondary-foreground hover:text-primary" asChild>
                  <Link to="/login">Entrar</Link>
                </Button>
                <Button asChild>
                  <Link to="/cadastro">Criar conta grátis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 md:py-24" style={{
        background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(213 74% 25%) 50%, hsl(213 74% 49%) 100%)',
      }}>
        <div className="container max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
            Blog do Preci<span className="text-blue-300">Fácil</span>
          </h1>
          <p className="text-lg text-blue-100/80 max-w-xl mx-auto">
            Artigos práticos sobre precificação, propostas e vida freelancer no Brasil.
          </p>
        </div>
      </section>

      {/* Post list */}
      <section className="py-16">
        <div className="container max-w-3xl mx-auto">
          <div className="space-y-6">
            {blogPosts.map((post) => (
              <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
                <Card className="border border-border shadow-sm hover:shadow-md transition-shadow bg-card">
                  <CardContent className="p-6 md:p-8">
                    <h2 className="text-xl md:text-2xl font-bold text-foreground group-hover:text-primary transition-colors mb-3">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4">
                      {post.description}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(post.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-primary font-medium text-sm mt-4 group-hover:gap-2 transition-all">
                      Ler artigo <ArrowRight className="h-4 w-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10" style={{
        background: 'linear-gradient(180deg, hsl(222 47% 11%) 0%, hsl(222 47% 8%) 100%)',
      }}>
        <div className="container text-center text-sm text-blue-200/50">
          <span className="font-semibold text-white">Preci<span className="text-primary">Fácil</span></span>{' '}
          &copy; {new Date().getFullYear()}. Feito para freelancers e MEIs brasileiros.
        </div>
      </footer>
    </div>
  );
}
