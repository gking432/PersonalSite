function patternStyle(fabric) {
  if (!fabric) return { '--fabric': '#d8d2c5', '--fabric-accent': '#eee9df' }
  return {
    '--fabric': fabric.color,
    '--fabric-accent': fabric.accent,
    '--fabric-pattern': fabric.pattern,
  }
}

export default function FurnitureVisual({ form = 'lounge', fabric = null, compact = false }) {
  return (
    <div
      className={`furniture-visual furniture-visual--${form}${compact ? ' is-compact' : ''}`}
      style={patternStyle(fabric)}
      aria-hidden="true"
    >
      <div className="furniture-visual__shadow" />
      <div className="furniture-visual__back" />
      <div className="furniture-visual__seat" />
      <div className="furniture-visual__arm furniture-visual__arm--left" />
      <div className="furniture-visual__arm furniture-visual__arm--right" />
      <div className="furniture-visual__leg furniture-visual__leg--left" />
      <div className="furniture-visual__leg furniture-visual__leg--right" />
    </div>
  )
}
