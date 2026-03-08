/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

const LOGO_URL = 'https://beoprlaomytanmlwlfsi.supabase.co/storage/v1/object/public/email-assets/logo.png'

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação · PreciFácil</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Img src={LOGO_URL} width="44" height="44" alt="PreciFácil" style={logoImg} />
        </Section>
        <Section style={content}>
          <Heading style={h1}>Código de verificação</Heading>
          <Text style={text}>Olá!</Text>
          <Text style={text}>Utilize o código abaixo para confirmar sua identidade:</Text>
          <Text style={codeStyle}>{token}</Text>
          <Text style={smallText}>
            Este código expira em breve. Se você não solicitou esta verificação, pode ignorar este email com segurança.
          </Text>
          <Text style={signatureStyle}>Equipe PreciFácil</Text>
        </Section>
        <Hr style={hr} />
        <Text style={footerBrand}>
          PreciFácil &middot; <Link href="https://precifacil.app.br" style={linkStyle}>precifacil.app.br</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const PRIMARY = '#2563EB'
const FOREGROUND = '#0A0F1E'
const MUTED = '#6B7280'
const BORDER = '#E2E8F0'

const main = { backgroundColor: '#ffffff', fontFamily: "'Inter', Arial, sans-serif" }
const container = { maxWidth: '560px', margin: '0 auto' }
const header = { backgroundColor: PRIMARY, padding: '24px 32px', textAlign: 'center' as const }
const logoImg = { borderRadius: '10px' }
const content = { padding: '32px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: FOREGROUND, margin: '0 0 20px' }
const text = { fontSize: '15px', color: FOREGROUND, lineHeight: '1.6', margin: '0 0 16px' }
const codeStyle = { fontFamily: 'Courier, monospace', fontSize: '28px', fontWeight: 'bold' as const, color: PRIMARY, margin: '0 0 30px', letterSpacing: '4px' }
const smallText = { fontSize: '13px', color: MUTED, lineHeight: '1.5', margin: '24px 0 0' }
const signatureStyle = { fontSize: '15px', color: FOREGROUND, lineHeight: '1.6', margin: '24px 0 0' }
const linkStyle = { color: PRIMARY, textDecoration: 'none' }
const hr = { borderColor: BORDER, margin: '0' }
const footerBrand = { fontSize: '12px', color: MUTED, textAlign: 'center' as const, padding: '20px 32px', margin: '0' }
