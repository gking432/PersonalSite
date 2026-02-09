import './Writing.css'

function Writing() {
  return (
    <div className="writing">
      <section className="writing-hero section">
        <div className="container">
          <h1>Thoughts on Marketing, AI, and Building</h1>
          <p className="writing-subtitle">
            I write about whatever I'm curious about—usually at the intersection of technology and human behavior.
          </p>
        </div>
      </section>

      {/* Substack Integration */}
      <section className="substack-section section">
        <div className="container">
          <div className="substack-content">
            <h2>Read on Substack</h2>
            <p className="substack-description">
              All my writing is published on Substack. Subscribe to get new articles delivered to your inbox.
            </p>
            <div className="substack-cta">
              <a 
                href="https://substack.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                Subscribe on Substack
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Articles Placeholder */}
      <section className="articles-section section alt">
        <div className="container">
          <h2 className="section-title">Recent Articles</h2>
          <div className="articles-list">
            <div className="article-card">
              <div className="article-meta">
                <span className="article-date">Coming Soon</span>
              </div>
              <h3>Latest Article Title</h3>
              <p className="article-excerpt">
                Check back soon for articles on marketing strategy, AI applications, building products, and business observations.
              </p>
              <a href="https://substack.com" target="_blank" rel="noopener noreferrer" className="article-link">
                Read on Substack →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categories-section section">
        <div className="container">
          <h2 className="section-title">Topics I Write About</h2>
          <div className="categories-grid">
            <div className="category-card">
              <h3>AI & Technology</h3>
              <p>Practical insights on how AI is changing the way we work and live</p>
            </div>
            <div className="category-card">
              <h3>Marketing Strategy</h3>
              <p>Thoughts on customer acquisition, branding, and campaign execution</p>
            </div>
            <div className="category-card">
              <h3>Building & Shipping</h3>
              <p>Lessons learned from building products and turning ideas into reality</p>
            </div>
            <div className="category-card">
              <h3>Business Observations</h3>
              <p>Observations on business, strategy, and the intersection of technology and commerce</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Writing
