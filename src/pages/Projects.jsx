import './Projects.css'

function Projects() {
  const priorityProjects = [
    {
      id: 1,
      name: 'Aptos Token Launcher',
      tagline: 'Blockchain-based token creation platform',
      description: 'Built a user-friendly interface for creating and deploying tokens on the Aptos blockchain. Simplified a complex technical process into an accessible web application.',
      tech: ['Aptos blockchain', 'React', 'TypeScript'],
      links: {
        github: '#',
        documentation: '#'
      }
    },
    {
      id: 2,
      name: 'PrepMe - AI Interview Simulator',
      tagline: 'AI-powered interview practice platform',
      description: 'Developed an application that conducts realistic job interviews using Claude AI, provides real-time feedback, and helps users improve their interview skills.',
      tech: ['React', 'Anthropic API', 'JavaScript'],
      links: {
        demo: '#',
        github: '#'
      }
    }
  ]

  const secondaryProjects = [
    {
      id: 3,
      name: 'To-Do List App',
      tagline: 'Productivity tool',
      description: 'A clean, functional to-do list application built to practice core development skills.',
      tech: ['React', 'JavaScript'],
      links: {
        github: '#'
      }
    }
  ]

  return (
    <div className="projects">
      <section className="projects-hero section">
        <div className="container">
          <h1>I Build What I Imagine</h1>
          <p className="projects-subtitle">
            From blockchain applications to AI-powered tools, here's what happens when curiosity meets execution.
          </p>
        </div>
      </section>

      {/* Priority Projects */}
      <section className="priority-projects section">
        <div className="container">
          <h2 className="section-title">Featured Projects</h2>
          <div className="priority-grid">
            {priorityProjects.map(project => (
              <div key={project.id} className="project-card-large">
                <div className="project-image-large">
                  <div className="project-placeholder-large">{project.name}</div>
                </div>
                <div className="project-details">
                  <h3>{project.name}</h3>
                  <p className="project-tagline">{project.tagline}</p>
                  <p className="project-description">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((tech, idx) => (
                      <span key={idx} className="tech-badge">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links-large">
                    {project.links.demo && (
                      <a href={project.links.demo} className="project-link-btn">Live Demo</a>
                    )}
                    {project.links.github && (
                      <a href={project.links.github} className="project-link-btn">GitHub</a>
                    )}
                    {project.links.documentation && (
                      <a href={project.links.documentation} className="project-link-btn">Documentation</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Secondary Projects */}
      <section className="secondary-projects section alt">
        <div className="container">
          <h2 className="section-title">Other Projects</h2>
          <div className="secondary-grid">
            {secondaryProjects.map(project => (
              <div key={project.id} className="project-card-small">
                <div className="project-image-small">
                  <div className="project-placeholder-small">{project.name}</div>
                </div>
                <div className="project-details-small">
                  <h4>{project.name}</h4>
                  <p className="project-tagline-small">{project.tagline}</p>
                  <p className="project-description-small">{project.description}</p>
                  <div className="project-tech-small">
                    {project.tech.map((tech, idx) => (
                      <span key={idx} className="tech-badge-small">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links-small">
                    {project.links.demo && (
                      <a href={project.links.demo} className="project-link-small">Demo</a>
                    )}
                    {project.links.github && (
                      <a href={project.links.github} className="project-link-small">GitHub</a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Marketing Work Showcase */}
      <section className="marketing-showcase section">
        <div className="container">
          <h2 className="section-title">Client Campaign Results</h2>
          <div className="case-studies">
            <div className="case-study">
              <h3>Challenge</h3>
              <p>Drive customer acquisition across multiple channels for diverse client portfolio.</p>
            </div>
            <div className="case-study">
              <h3>Strategy</h3>
              <p>Integrated digital, audio, and direct mail campaigns with data-driven optimization.</p>
            </div>
            <div className="case-study">
              <h3>Results</h3>
              <p>Generated high-quality leads and improved conversion rates across all channels.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Work in Progress */}
      <section className="work-in-progress section alt">
        <div className="container">
          <h2 className="section-title">What I'm Building Next</h2>
          <p className="wip-text">
            Always shipping. Check back soon for new projects and updates.
          </p>
        </div>
      </section>
    </div>
  )
}

export default Projects
