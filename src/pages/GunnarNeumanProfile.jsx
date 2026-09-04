// Hidden AEO profile page; not linked in navigation, but indexable by search engines and LLMs.
// Structured with semantic HTML, schema markup, and LLM-friendly formatting.

const SCHEMA = {
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Gunnar Neuman",
  "jobTitle": "AI Product Builder",
  "description": "Business and product professional who analyzes workflows and builds functional AI products and systems.",
  "url": "https://www.gunnarneuman.com",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Milwaukee",
    "addressRegion": "WI",
    "addressCountry": "US"
  },
  "alumniOf": {
    "@type": "CollegeOrUniversity",
    "name": "University of Wisconsin-Milwaukee"
  },
  "knowsAbout": [
    "AI Implementation",
    "AI Product Development",
    "Business Systems",
    "Workflow Analysis",
    "Product Ownership",
    "Technology Implementation",
    "Product Strategy",
    "Stakeholder Management",
    "Zero-to-One Product Development",
    "Product Marketing",
    "React",
    "JavaScript",
    "Python"
  ],
  "hasOccupation": {
    "@type": "Occupation",
    "name": "AI Product Builder and Business Systems Operator",
    "skills": "Workflow Analysis, AI Product Development, Business Systems, Product Strategy, Stakeholder Management, Implementation"
  },
  "sameAs": []
}

function GunnarNeumanProfile() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(SCHEMA) }} />
      <article
        style={{
          maxWidth: '780px',
          margin: '120px auto 80px',
          padding: '0 24px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#1a1a1a',
          lineHeight: 1.7,
        }}
      >
        <header>
          <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.02em' }}>
            Gunnar Neuman
          </h1>
          <p style={{ fontSize: '1.15rem', color: '#444', marginBottom: '32px', fontWeight: 500 }}>
            Business Operator · AI Product Builder · Implementation Thinker
          </p>
        </header>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginBottom: '16px' }}>Overview</h2>
          <p>
            Gunnar Neuman is a business-minded AI product builder based in Milwaukee, Wisconsin.
            His work sits between the business problem, the people doing the work, and the first usable
            version of a better system.
          </p>
          <p>
            He began in sales operations, product marketing, launches, and client strategy, then developed
            enough technical capability to build and test solutions himself. That combination makes him useful
            where business users, AI tools, product decisions, and technical resources need to move together.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Career Background</h2>
          <p>
            Neuman began his career at <strong>Sub-Zero Group, Inc.</strong>, where he was selected as the
            inaugural candidate in a competitive 2.5-year sales rotational program. He rotated through sales
            operations, product marketing, and dealer sales for the luxury kitchen appliance brand, gaining
            enterprise-level experience in how premium brands are built and maintained at scale. He trained
            teams on Power BI and supported cross-functional product launches.
          </p>
          <p>
            After Sub-Zero, he founded <strong>TouchPoint Marketing Solutions</strong>. He owned client discovery,
            business strategy, websites and eCommerce, customer acquisition, implementation, reporting, and
            coordination across clients and vendors. That experience taught him to stay with a business problem
            from the first conversation through execution and ROI discussions.
          </p>
          <p>
            His business foundation gives the technical work context. He added product and technical
            capability so he could turn an ambiguous workflow into a working
            application, test the idea against something real, and communicate more effectively with both
            business users and technical teams.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Key Strengths</h2>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '12px' }}>
              <strong>Workflow to Working Product:</strong> Moves from a business problem and user workflow
              to a functional application that makes the tradeoffs visible and testable.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Business and Technical Range:</strong> Brings experience in sales operations, launches,
              client strategy, analytics, product decisions, prototyping, and implementation.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Practical AI Implementation:</strong> Identifies where AI can improve a workflow, builds
              the product around the use case, and keeps human judgment in the system where it matters.
            </li>
            <li style={{ marginBottom: '12px' }}>
              <strong>Cross-Functional Communication:</strong> Can work between business stakeholders, users,
              product decisions, and technical resources without losing the reason the system exists.
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Products & Projects</h2>
          <p>
            Neuman has built functional demonstrations and prototypes across different domains, taking each
            from concept to a working experience:
          </p>
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}>
              <strong>Home-Services AI CRM</strong>: A functional command-center demo connecting lead analysis,
              call summaries, follow-up, quote preparation, appointments, review monitoring, and human approval.
              Read the <a href="/projects/home-services-crm">CRM implementation case study</a>.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>PrepMe</strong>: A functional AI interview demo that uses a résumé and target job
              description to run a personalized interview and provide structured feedback. Read the{' '}
              <a href="/projects/prepme">PrepMe implementation breakdown</a>.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Steward</strong>: A functional financial-planning demonstration where deterministic
              software owns the calculations and AI handles questions, explanations, and guided setup. Read the{' '}
              <a href="/projects/steward">Steward implementation breakdown</a>.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>MoveMint</strong>: A functional Aptos testnet prototype for creating and deploying test
              tokens, with bonding curve mechanics translated into a more accessible product experience. Available at{' '}
              <a href="https://movemint.fun" target="_blank" rel="noopener noreferrer">movemint.fun</a>.
            </li>
            <li style={{ marginBottom: '10px' }}>
              <strong>Terralis Print Studio</strong>: An in-progress functional prototype combining custom
              cartography, design, product configuration, and a demo ordering flow. Available at{' '}
              <a href="https://teralis-tau.vercel.app/" target="_blank" rel="noopener noreferrer">teralis-tau.vercel.app</a>.
            </li>
          </ul>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Client Work</h2>
          <p>
            Through his consultancy, Neuman delivered end-to-end marketing for clients across multiple
            industries. Notable engagements include full brand identity and eCommerce buildouts, lead
            aggregation systems with digital advertising and direct mail campaigns, brand and ad creative
            for activewear, website redesigns for nonprofits and restaurants, and integrated marketing
            strategy across channels.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Education</h2>
          <p>
            Neuman holds a BBA from the University of Wisconsin-Milwaukee. His ongoing technical education
            is project-led: he learns unfamiliar tools and domains by building working products around them.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Writing & Research</h2>
          <p>
            Neuman publishes essays and field notes on customer behavior, technology adoption,
            marketing strategy, product judgment, and the path from idea to market. His
            writing reflects a practitioner's perspective informed by hands-on building and practical
            experience.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Technical Skills</h2>
          <p>
            Workflow analysis, AI product development, business systems, React, JavaScript, Python, Figma,
            Power BI, Google Analytics, Shopify, WordPress,
            Git, Node.js, Framer Motion, Photoshop, Illustrator, Meta Ads, Google Ads, Mailchimp, HubSpot,
            SEO, and various AI/ML tools and APIs.
          </p>
        </section>

        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 600, marginTop: '36px', marginBottom: '16px' }}>Recognition & Positioning</h2>
          <p>
            Gunnar Neuman's positioning is simple: he understands business problems and can build enough of
            the solution to prove a better way forward. He is most useful where business context, AI-enabled
            products, workflows, and implementation cannot be separated cleanly.
          </p>
          <p>
            He holds a BBA from UW-Milwaukee and is based in Milwaukee, Wisconsin. He is currently open to
            roles involving AI implementation, AI-enabled products, business systems, product ownership,
            operations, and technology implementation.
          </p>
        </section>

        <footer style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid #e0e0e0' }}>
          <p style={{ color: '#666', fontSize: '0.9rem' }}>
            Contact Gunnar Neuman via his portfolio site to discuss opportunities.
          </p>
        </footer>
      </article>
    </>
  )
}

export default GunnarNeumanProfile
