import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { catalogFabrics, catalogProducts } from '../data/aiDemoCatalog'
import FurnitureVisual from '../features/ai-demos/FurnitureVisual'
import './AIDemos.css'
import './AICatalog.css'

const ease = [0.22, 1, 0.36, 1]

function AICatalog() {
  const sessionCode = useMemo(() => new URLSearchParams(window.location.search).get('session') || 'preview', [])
  const [page, setPage] = useState(1)
  const [highlighted, setHighlighted] = useState(null)
  const [product, setProduct] = useState(null)
  const [fabric, setFabric] = useState(null)
  const [mockupReady, setMockupReady] = useState(false)
  const [assistantMessage, setAssistantMessage] = useState('Find the Harbor Lounge. It is on page two, in the sixth position.')
  const channelRef = useRef(null)

  const products = catalogProducts.filter((item) => item.page === page)
  const compatibleFabrics = product
    ? catalogFabrics.filter((item) => product.supportedFabrics.includes(item.id))
    : []

  const send = (message) => channelRef.current?.postMessage(message)

  useEffect(() => {
    if (!('BroadcastChannel' in window)) return undefined
    const channel = new BroadcastChannel(`gunnar-ai-demo-${sessionCode}`)
    channelRef.current = channel
    const readyTimer = window.setTimeout(() => channel.postMessage({ type: 'catalog.ready' }), 200)
    return () => {
      window.clearTimeout(readyTimer)
      channel.close()
    }
  }, [sessionCode])

  const guideToProduct = () => {
    setPage(2)
    setHighlighted(null)
    setAssistantMessage('Opening page two now. Look for the highlighted product in the sixth position.')
    window.setTimeout(() => setHighlighted('harbor-lounge'), 350)
  }

  const selectProduct = (item) => {
    setProduct(item)
    setFabric(null)
    setMockupReady(false)
    setHighlighted(null)
    const isTarget = item.id === 'harbor-lounge'
    setAssistantMessage(isTarget
      ? 'That is the Harbor Lounge. Now choose a fabric for the upholstery.'
      : 'That product is selected, but the guided challenge is looking for the Harbor Lounge.')
    send({ type: 'catalog.product', productId: item.id, productName: item.name })
  }

  const selectFabric = (item) => {
    setFabric(item)
    setMockupReady(false)
    setAssistantMessage(`${item.name} is selected. You now have everything required to generate the mockup.`)
    send({ type: 'catalog.fabric', fabricId: item.id, fabricName: item.name })
  }

  const generateMockup = () => {
    if (!product) {
      setAssistantMessage('I still need a product. Select the Harbor Lounge first, then I can help with the fabric.')
      send({ type: 'catalog.error', reason: 'missing-product' })
      return
    }
    if (!fabric) {
      setAssistantMessage('The product is ready, but the fabric is missing. Choose one of the compatible options first.')
      send({ type: 'catalog.error', reason: 'missing-fabric' })
      return
    }
    setMockupReady(true)
    setAssistantMessage('Done. The selected product and fabric have been carried into the finished mockup.')
    send({ type: 'catalog.mockup', productName: product.name, fabricName: fabric.name })
    window.setTimeout(() => document.querySelector('.ai-mockup-result')?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 80)
  }

  const returnToAssistant = () => {
    if (window.opener && !window.opener.closed) {
      window.opener.focus()
      return
    }
    window.location.href = '/ai-demos'
  }

  return (
    <div className="ai-demo-page ai-catalog-page">
      <header className="ai-catalog-topbar">
        <button type="button" className="ai-catalog-brand" onClick={returnToAssistant}>
          <span>GN</span>
          <strong>AI mockup generator</strong>
        </button>
        <button type="button" className="ai-catalog-session" onClick={returnToAssistant}>
          <i /> AI assistant live <span>Return to conversation ↗</span>
        </button>
      </header>

      <main className="ai-catalog-section">
        <div className="ai-demo-shell">
          <motion.div className="ai-catalog-head" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, ease }}>
            <div>
              <span className="ai-demo-eyebrow">Guided workflow · Furniture catalog</span>
              <h1>Find it. Configure it.<br />See it.</h1>
              <p>The assistant can navigate structured product data, track your selections, catch missing information and carry the final choices into a visual output.</p>
            </div>
            <aside className="ai-challenge-card">
              <span>Your challenge</span>
              <strong>Find the Harbor Lounge</strong>
              <small>Page 2 · Position 6</small>
              <button type="button" onClick={guideToProduct}>Ask the assistant to find it →</button>
            </aside>
          </motion.div>

          <div className="ai-catalog-layout">
            <section className="ai-catalog-browser" aria-label="Furniture catalog">
              <div className="ai-catalog-toolbar">
                <div><span className="ai-catalog-mark">FORM</span><small>Contract furniture · 12 products</small></div>
                <div className="ai-page-controls" aria-label="Catalog pages">
                  {[1, 2].map((number) => <button type="button" key={number} className={page === number ? 'is-active' : ''} onClick={() => { setPage(number); setHighlighted(null) }}>{number}</button>)}
                </div>
              </div>
              <div className="ai-product-grid">
                {products.map((item) => (
                  <button
                    type="button"
                    key={item.id}
                    className={`ai-product-card${highlighted === item.id ? ' is-highlighted' : ''}${product?.id === item.id ? ' is-selected' : ''}`}
                    onClick={() => selectProduct(item)}
                  >
                    {highlighted === item.id && <span className="ai-assistant-pointer">Assistant found it</span>}
                    <FurnitureVisual form={item.form} compact />
                    <span className="ai-product-card__meta">{item.category} · {item.code}</span>
                    <strong>{item.name}</strong>
                    <small>Position {item.position}</small>
                  </button>
                ))}
              </div>
            </section>

            <aside className="ai-selection-panel">
              <span className="ai-demo-eyebrow">Your configuration</span>
              {!product ? (
                <div className="ai-empty-selection"><span>01</span><p>Select a product in the catalog. The assistant is looking for the Harbor Lounge.</p></div>
              ) : (
                <>
                  <div className="ai-selected-product">
                    <FurnitureVisual form={product.form} compact />
                    <div><small>{product.code} · {product.category}</small><h3>{product.name}</h3><p>{product.description}</p></div>
                  </div>
                  {compatibleFabrics.length ? (
                    <div className="ai-fabric-picker">
                      <div className="ai-fabric-picker__head"><strong>Choose upholstery</strong><small>{compatibleFabrics.length} compatible</small></div>
                      <div className="ai-fabric-list">
                        {compatibleFabrics.map((item) => (
                          <button type="button" key={item.id} className={fabric?.id === item.id ? 'is-selected' : ''} onClick={() => selectFabric(item)}>
                            <span className={`ai-fabric-swatch pattern-${item.pattern}`} style={{ '--swatch': item.color, '--swatch-accent': item.accent }} />
                            <span><strong>{item.name}</strong><small>{item.family}</small></span>
                            {fabric?.id === item.id && <em>Selected</em>}
                          </button>
                        ))}
                      </div>
                      {fabric && <p className="ai-fabric-reason">{fabric.note}</p>}
                    </div>
                  ) : <p className="ai-no-fabrics">This product does not support upholstery. Choose a compatible seating product.</p>}
                  <button type="button" className="ai-generate-button" onClick={generateMockup}>Generate product mockup <span>→</span></button>
                </>
              )}
            </aside>
          </div>

          <AnimatePresence>
            {mockupReady && product && fabric && (
              <motion.section className="ai-mockup-result" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .65, ease }}>
                <div className="ai-mockup-copy">
                  <span className="ai-demo-eyebrow">Generated output</span>
                  <h2>{product.name}<br /><em>in {fabric.name}</em></h2>
                  <p>The workflow preserved both selections and produced a reviewable result. In the connected version, the same structured inputs are passed to an image model with the product reference and material constraints.</p>
                  <dl><div><dt>Product</dt><dd>{product.code}</dd></div><div><dt>Material</dt><dd>{fabric.family}</dd></div><div><dt>Status</dt><dd>Ready for review</dd></div></dl>
                </div>
                <div className="ai-mockup-stage">
                  <span>AI-assisted concept preview</span>
                  <FurnitureVisual form={product.form} fabric={fabric} />
                  <div className="ai-mockup-caption"><span>{product.name}</span><span>{fabric.name} · {fabric.family}</span></div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>

      <aside className="ai-catalog-assistant-toast" aria-live="polite">
        <span className="ai-catalog-toast-orb"><i /><i /><i /></span>
        <div><small>AI Assistant · Live</small><p>{assistantMessage}</p></div>
        <button type="button" onClick={returnToAssistant}>↗</button>
      </aside>
    </div>
  )
}

export default AICatalog
