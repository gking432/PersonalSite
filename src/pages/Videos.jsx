import './Videos.css'

function Videos() {
  return (
    <div className="videos">
      <section className="videos-hero section">
        <div className="container">
          <h1>Video Essays & Explorations</h1>
          <p className="videos-subtitle">
            One video per week on topics that fascinate me.
          </p>
        </div>
      </section>

      {/* YouTube Integration */}
      <section className="youtube-section section">
        <div className="container">
          <div className="youtube-content">
            <h2>Watch on YouTube</h2>
            <p className="youtube-description">
              All my videos are published on YouTube. Subscribe to get notified when new videos are released.
            </p>
            <div className="youtube-cta">
              <a 
                href="https://youtube.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-primary"
              >
                Subscribe on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Video */}
      <section className="featured-video-section section alt">
        <div className="container">
          <h2 className="section-title">Latest Video</h2>
          <div className="featured-video-container">
            <div className="video-placeholder">
              <div className="video-placeholder-content">
                <p>Latest video will appear here</p>
                <a 
                  href="https://youtube.com" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="btn btn-secondary"
                >
                  View on YouTube
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Grid */}
      <section className="videos-grid-section section">
        <div className="container">
          <h2 className="section-title">Recent Videos</h2>
          <div className="videos-grid">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="video-card">
                <div className="video-thumbnail">
                  <div className="thumbnail-content">Video {num}</div>
                </div>
                <div className="video-info">
                  <h3>Video Title {num}</h3>
                  <p className="video-meta">Coming Soon</p>
                </div>
              </div>
            ))}
          </div>
          <div className="view-channel-cta">
            <a 
              href="https://youtube.com" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="btn btn-secondary"
            >
              View Full Channel
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Videos
