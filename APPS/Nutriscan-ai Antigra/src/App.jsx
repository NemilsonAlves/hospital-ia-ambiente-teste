import { useState } from 'react'
import './App.css'
import { useSectionCursor } from './hooks/useDynamicCursor'
import AnalysisPage from './components/AnalysisPage'
import PhoneMockup from './components/PhoneMockup'

function App() {
  // Ativa cursores diferentes por seção da página
  useSectionCursor();

  // Sistema de navegação simples
  const [currentPage, setCurrentPage] = useState('home');

  // Se estiver na página de análise, renderiza apenas ela
  if (currentPage === 'analysis') {
    return <AnalysisPage onBack={() => setCurrentPage('home')} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="container nav-content">
          <div className="logo">
            <span style={{ color: 'var(--color-primary)' }}>Nutriscan</span> AI
          </div>
          <nav>
            {/* Nav items can go here */}
          </nav>
          <button className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            Entrar
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section container">
          <div className="hero-content">
            <h1 className="hero-title">
              Sua Nutrição, <br />
              <span className="gradient-text">Potencializada por IA</span>
            </h1>
            <p className="hero-subtitle">
              O app definitivo para transformar sua saúde. Tire uma foto da sua refeição e descubra calorias, macros e micronutrientes em segundos.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => setCurrentPage('analysis')}>🚀 Testar Agora na Web</button>
              <button className="btn btn-secondary">📖 Como Funciona</button>
            </div>
            <div className="store-badges">
              <div className="badges-wrapper">
                <div className="badges-group">
                  <p className="store-label">Baixe o App:</p>
                  <div className="badges-container">
                    <button className="store-btn apple-btn">
                      <span className="store-icon">🍎</span>
                      <div className="store-text">
                        <span className="small-text">Download on the</span>
                        <span className="big-text">App Store</span>
                      </div>
                    </button>
                    <button className="store-btn google-btn">
                      <span className="store-icon">🤖</span>
                      <div className="store-text">
                        <span className="small-text">GET IT ON</span>
                        <span className="big-text">Google Play</span>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="qr-code-container desktop-only">
                  <div className="qr-code-box">
                    <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://nutriscan.ai/download" alt="QR Code para Download" className="qr-img" />
                  </div>
                  <p className="qr-text">Escaneie para baixar</p>
                </div>
              </div>
            </div>
          </div>
          <div className="hero-image-container">
            <PhoneMockup
              imageSrc="https://images.unsplash.com/photo-1517832207067-4db24a2ae47c?auto=format&fit=crop&w=800&q=80"
              altText="Nutriscan App Interface"
            />
          </div>
        </section>

        <section className="features-section container">
          <h2 style={{ textAlign: 'center' }}>Por que Nutriscan AI?</h2>
          <p className="section-subtitle">
            Tecnologia de ponta para transformar sua relação com a alimentação
          </p>
          <div className="features-grid">
            <div className="feature-card glass-panel">
              <div className="feature-icon">📸</div>
              <h3 className="feature-title">Análise Visual Instantânea</h3>
              <p className="feature-desc">Tire uma foto da sua comida e receba uma análise nutricional completa em segundos.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon">⚡</div>
              <h3 className="feature-title">Insights em Tempo Real</h3>
              <p className="feature-desc">Saiba exatamente o que você está comendo: calorias, macros e micronutrientes.</p>
            </div>
            <div className="feature-card glass-panel">
              <div className="feature-icon">🎯</div>
              <h3 className="feature-title">Planos Personalizados</h3>
              <p className="feature-desc">Receba recomendações personalizadas baseadas nos seus objetivos e histórico.</p>
            </div>
          </div>
        </section>

        {/* Como Funciona Section */}
        <section className="how-it-works-section container">
          <h2 style={{ textAlign: 'center' }}>Como Funciona?</h2>
          <p className="section-subtitle">
            Três passos simples para transformar sua nutrição
          </p>

          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📱</div>
              <h3 className="step-title">Tire uma Foto</h3>
              <p className="step-desc">
                Fotografe sua refeição com o celular. Nossa IA reconhece automaticamente os alimentos.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🤖</div>
              <h3 className="step-title">IA Analisa</h3>
              <p className="step-desc">
                Nossa inteligência artificial processa a imagem e identifica todos os nutrientes em segundos.
              </p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">📊</div>
              <h3 className="step-title">Receba Insights</h3>
              <p className="step-desc">
                Veja análise completa: calorias, proteínas, carboidratos, gorduras e recomendações personalizadas.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section">
          <div className="container cta-content">
            <h2 className="cta-title">Pronto para Transformar sua Alimentação?</h2>
            <p className="cta-subtitle">
              Junte-se a milhares de pessoas que já melhoraram sua saúde com Nutriscan AI
            </p>
            <div className="cta-actions">
              <button className="btn btn-primary btn-large" onClick={() => setCurrentPage('analysis')}>🚀 Começar Agora - É Grátis</button>
            </div>
            <p className="cta-note">✨ Sem cartão de crédito necessário • Análises ilimitadas</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container footer-content">
          <div className="footer-grid">
            <div className="footer-column">
              <div className="footer-logo">
                <span style={{ color: 'var(--color-primary)' }}>Nutriscan</span> AI
              </div>
              <p className="footer-desc">
                Transformando a nutrição com inteligência artificial.
                Análise instantânea, insights precisos, resultados reais.
              </p>
              <div className="footer-badges" style={{ marginTop: '1.5rem' }}>
                <div className="badges-container" style={{ gap: '0.5rem' }}>
                  <button className="store-btn apple-btn" style={{ minWidth: '140px', padding: '6px 12px' }}>
                    <span className="store-icon" style={{ fontSize: '1.5rem' }}>🍎</span>
                    <div className="store-text">
                      <span className="small-text" style={{ fontSize: '0.55rem' }}>Download on the</span>
                      <span className="big-text" style={{ fontSize: '0.9rem' }}>App Store</span>
                    </div>
                  </button>
                  <button className="store-btn google-btn" style={{ minWidth: '140px', padding: '6px 12px' }}>
                    <span className="store-icon" style={{ fontSize: '1.5rem' }}>🤖</span>
                    <div className="store-text">
                      <span className="small-text" style={{ fontSize: '0.55rem' }}>GET IT ON</span>
                      <span className="big-text" style={{ fontSize: '0.9rem' }}>Google Play</span>
                    </div>
                  </button>
                </div>
              </div>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">💼</a>
              </div>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Produto</h4>
              <ul className="footer-links">
                <li><a href="#features">Funcionalidades</a></li>
                <li><a href="#how-it-works">Como Funciona</a></li>
                <li><a href="#pricing">Preços</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Empresa</h4>
              <ul className="footer-links">
                <li><a href="#about">Sobre Nós</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Carreiras</a></li>
                <li><a href="#contact">Contato</a></li>
              </ul>
            </div>

            <div className="footer-column">
              <h4 className="footer-title">Legal</h4>
              <ul className="footer-links">
                <li><a href="#privacy">Privacidade</a></li>
                <li><a href="#terms">Termos de Uso</a></li>
                <li><a href="#cookies">Cookies</a></li>
                <li><a href="#licenses">Licenças</a></li>
              </ul>
            </div>
          </div>

          <div className="footer-bottom">
            <p className="copyright">
              © 2024 Nutriscan AI. Todos os direitos reservados.
            </p>
            <p className="made-with">
              Feito com 💚 para uma vida mais saudável
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
