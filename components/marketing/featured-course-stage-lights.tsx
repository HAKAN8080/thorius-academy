/**
 * Sahne spot ışıkları — yeni eğitimler vitrin arka planı.
 */
export function FeaturedCourseStageLights() {
  return (
    <div
      className="pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-b from-[#060b18] via-primary-950 to-[#0a1228]" />

      <div className="featured-stage-light featured-stage-light--left" />
      <div className="featured-stage-light featured-stage-light--center" />
      <div className="featured-stage-light featured-stage-light--right" />
      <div className="featured-stage-light featured-stage-light--accent" />

      <div className="featured-stage-beam featured-stage-beam--left" />
      <div className="featured-stage-beam featured-stage-beam--center" />
      <div className="featured-stage-beam featured-stage-beam--right" />

      <div className="featured-stage-floor-glow" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_100%,rgba(6,11,24,0.72),transparent_68%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_50%,transparent_32%,rgba(6,11,24,0.42)_100%)]" />
    </div>
  );
}
