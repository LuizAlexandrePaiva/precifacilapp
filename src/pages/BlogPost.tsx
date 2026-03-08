import { useParams, Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowLeft, Calculator } from 'lucide-react';
import { getPostBySlug } from '@/data/blogPosts';
import { SEO } from '@/components/SEO';
import { useAuth } from '@/contexts/AuthContext';
import { Helmet } from 'react-helmet-async';

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
}

/** Minimal markdown-to-HTML: ## headings + paragraphs + **bold** */
function renderMarkdown(content: string) {
  return content
    .split('\n\n')
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, i) => {
      if (block.startsWith('## ')) {
        return (
          <h2 key={i} className="text-xl md:text-2xl font-bold text-foreground mt-10 mb-4">
            {block.replace('## ', '')}
          </h2>
        );
      }
      // numbered list items
      if (/^\d+\.\s/.test(block)) {
        const items = block.split('\n').filter(Boolean);
        return (
          <ol key={i} className="list-decimal list-inside space-y-2 text-muted-foreground leading-relaxed my-4">
            {items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/^\d+\.\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
            ))}
          </ol>
        );
      }
      // unordered list
      if (block.startsWith('- ')) {
        const items = block.split('\n').filter(Boolean);
        return (
          <ul key={i} className="list-disc list-inside space-y-2 text-muted-foreground leading-relaxed my-4">
            {items.map((item, j) => (
              <li key={j} dangerouslySetInnerHTML={{ __html: item.replace(/^-\s/, '').replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
            ))}
          </ul>
        );
      }
      // bold paragraph
      const html = block.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>');
      return (
        <p key={i} className="text-muted-foreground leading-relaxed my-4" dangerouslySetInnerHTML={{ __html: html }} />
      );
    });
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;
  const { user } = useAuth();

  if (!post) return <Navigate to="/blog" replace />;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          "headline": post.title,
          "description": post.description,
          "datePublished": post.date,
          "author": { "@type": "Organization", "name": "PreciFácil" },
          "publisher": { "@type": "Organization", "name": "PreciFácil" },
          "mainEntityOfPage": `https://precifacil.app.br/blog/${post.slug}`,
        })}</script>
      </Helmet>

      {/* Header */}
      <header className="border-b border-border/50 bg-secondary/95 backdrop-blur-md sticky top-0 z-50">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold tracking-tight text-secondary-foreground">
            Preci<span className="text-primary">Fácil</span>
          </Link>
           {user ? (
              <Button asChild>
                <Link to="/app">Ir para o App</Link>
              </Button>
            ) : (
              <Button asChild>
                <Link to="/cadastro">Criar conta grátis</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Article */}
      <article className="py-12 md:py-20">
        <div className="container max-w-2xl mx-auto">
          <Link to="/blog" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="h-4 w-4" /> Voltar ao blog
          </Link>

          <h1 className="text-3xl md:text-4xl font-extrabold text-foreground leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-10">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </div>

          <div className="prose-custom">
            {renderMarkdown(post.content)}
          </div>

          {/* CTA */}
          <div className="mt-16 p-8 rounded-2xl text-center" style={{
            background: 'linear-gradient(135deg, hsl(222 47% 11%) 0%, hsl(213 74% 30%) 100%)',
          }}>
            <Calculator className="h-10 w-10 text-blue-300 mx-auto mb-4" />
            <h3 className="text-xl md:text-2xl font-bold text-white mb-3">
              Descubra seu preço mínimo agora
            </h3>
            <p className="text-blue-100/70 mb-6 max-w-md mx-auto">
              Use a calculadora do PreciFácil e saiba exatamente quanto cobrar — em menos de 2 minutos.
            </p>
            <Button size="lg" className="px-8 py-6 text-base font-bold rounded-xl" asChild>
              <Link to={user ? '/app/calculadora' : '/cadastro'}>
                {user ? 'Abrir calculadora' : 'Criar conta e calcular grátis'}
              </Link>
            </Button>
          </div>
        </div>
      </article>

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
