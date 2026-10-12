import { useState } from 'react';

const PHOTO_SRC = `${import.meta.env.BASE_URL}assets/images/diwali-diyas.jpg`;

function isValidPercentOff(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 1 && value <= 100;
}

export default function DiwaliBanner({ promo, onShowPricing }) {
  const [photoFailed, setPhotoFailed] = useState(false);
  if (!isValidPercentOff(promo?.percentOff)) {
    throw new Error(`Invalid promo percentOff: ${String(promo?.percentOff)}; expected a number from 1 to 100`);
  }

  return (
    <section className="promo" aria-labelledby="promo-title">
      <div className="l-wrap promo-inner">
        {/* The CSS diya stays underneath, so a missing photo still leaves a festive cue. */}
        <div className="promo-media">
          <span className="promo-diya" aria-hidden="true">
            <span className="promo-flame" />
            <span className="promo-bowl" />
            <span className="promo-diya-caption">Diwali diya</span>
          </span>
          {!photoFailed && (
            <img
              className="promo-photo"
              src={PHOTO_SRC}
              alt=""
              width="120"
              height="120"
              onError={() => setPhotoFailed(true)}
            />
          )}
        </div>
        <div className="promo-text">
          <h2 id="promo-title">{promo.title}</h2>
          <p>{promo.message}</p>
        </div>
        <div className="promo-actions">
          <span className="promo-pill"><span aria-hidden="true">🪔</span> {promo.percentOff}% off paid plans</span>
          <button type="button" className="btn btn-lg promo-cta" onClick={onShowPricing}>See Diwali prices</button>
        </div>
      </div>
    </section>
  );
}
