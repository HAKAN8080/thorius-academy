/**
 * Sahne spot ışıkları — popüler eğitimler vitrin arka planı.
 */
export function FeaturedCourseStageLights() {
  return (
    <div
      className="featured-stage featured-stage--light pointer-events-none absolute inset-0 overflow-hidden"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-white" />

      <div className="featured-stage-light featured-stage-light--left featured-stage-light--red" />
      <div className="featured-stage-light featured-stage-light--center featured-stage-light--yellow" />
      <div className="featured-stage-light featured-stage-light--right featured-stage-light--blue" />
      <div className="featured-stage-light featured-stage-light--accent featured-stage-light--yellow" />

      <div className="featured-stage-beam featured-stage-beam--left featured-stage-beam--red" />
      <div className="featured-stage-beam featured-stage-beam--center featured-stage-beam--yellow" />
      <div className="featured-stage-beam featured-stage-beam--right featured-stage-beam--blue" />

      <div className="featured-stage-floor-glow featured-stage-floor-glow--light" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_55%_at_50%_100%,rgba(255,255,255,0.92),transparent_70%)]" />
    </div>
  );
}
