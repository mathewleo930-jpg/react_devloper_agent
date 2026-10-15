import { useEffect, useRef, useState } from 'react';
import { submitFeedback } from '../api/feedback.js';
import { APP_NAME } from '../data/constants.js';
import { FEEDBACK_TOPICS, MESSAGE_MAX, RATING_LABELS, validateFeedback } from '../lib/feedback.js';
import CharCounter from './CharCounter.jsx';
import Icon from './Icon.jsx';

const EMPTY_FORM = { rating: '', topic: '', message: '', email: '', website: '' };
const FIELD_ORDER = ['rating', 'topic', 'email', 'message'];
const RATINGS = Object.entries(RATING_LABELS);

// Ids of the control that receives focus when its field is invalid.
const FOCUS_TARGET = { rating: 'fb-rating-1', topic: 'fb-topic', message: 'fb-message', email: 'fb-email' };

const describedBy = (...ids) => ids.filter(Boolean).join(' ') || undefined;

export default function FeedbackSection({ submit = submitFeedback }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [replyTo, setReplyTo] = useState(null);
  const thanksRef = useRef(null);
  const refocusForm = useRef(false);

  useEffect(() => {
    if (status === 'sent') thanksRef.current.focus();
    if (status === 'idle' && refocusForm.current) {
      refocusForm.current = false;
      document.getElementById(FOCUS_TARGET.rating).focus();
    }
  }, [status]);

  const set = (field) => (e) => {
    const { value } = e.target;
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((errs) => {
      if (!errs[field]) return errs;
      const { [field]: _cleared, ...rest } = errs;
      return rest;
    });
  };

  async function onSubmit(e) {
    e.preventDefault();
    // Honeypot: people never see this field, so a value means a bot. Pretend it worked.
    if (form.website) {
      setReplyTo(null);
      setStatus('sent');
      return;
    }

    const { errors: next, value } = validateFeedback(form);
    setErrors(next);
    const firstInvalid = FIELD_ORDER.find((field) => next[field]);
    if (firstInvalid) {
      document.getElementById(FOCUS_TARGET[firstInvalid]).focus();
      return;
    }

    setStatus('sending');
    try {
      await submit(value);
      setReplyTo(value.email);
      setStatus('sent');
    } catch {
      setStatus('failed');
    }
  }

  function startOver() {
    setForm(EMPTY_FORM);
    setErrors({});
    setReplyTo(null);
    refocusForm.current = true;
    setStatus('idle');
  }

  const sending = status === 'sending';

  return (
    <section className="l-section" id="feedback" aria-labelledby="feedback-title">
      <div className="l-wrap l-narrow">
        <div className="l-head">
          <span className="eyebrow-plain">Feedback</span>
          <h2 id="feedback-title" tabIndex={-1}>Tell us what you think</h2>
          <p className="muted">
            Using the demo or comparing helpdesks? Two minutes of feedback helps us decide what to build next.
          </p>
        </div>

        <div className="feedback-card">
          {status === 'sent' ? (
            <div className="feedback-done" role="status">
              <span className="feedback-done-icon"><Icon name="check" size={28} strokeWidth={2.4} /></span>
              <h3 ref={thanksRef} tabIndex={-1}>Thanks for your feedback!</h3>
              <p>
                It’s on its way to the {APP_NAME} team. We read every message
                {replyTo ? <>, and we’ll reply to <strong>{replyTo}</strong> if we have questions.</> : '.'}
              </p>
              <button type="button" className="btn btn-lg" onClick={startOver}>Send more feedback</button>
            </div>
          ) : (
            <form className="form-grid feedback-form" onSubmit={onSubmit} noValidate aria-busy={sending}>
              <fieldset
                className="field field-full rating"
                aria-describedby={errors.rating ? 'fb-rating-err' : undefined}
              >
                <legend>How would you rate {APP_NAME}? <span className="required">*</span></legend>
                <div className="rating-options">
                  {RATINGS.map(([n, word]) => (
                    <label key={n} className="rating-option">
                      <input
                        id={`fb-rating-${n}`}
                        className="rating-input"
                        type="radio"
                        name="rating"
                        value={n}
                        checked={form.rating === n}
                        onChange={set('rating')}
                        aria-invalid={Boolean(errors.rating)}
                        aria-required="true"
                      />
                      <span className="rating-pill">
                        <span className="rating-num">{n}</span>
                        <span className="visually-hidden"> · </span>
                        <span className="rating-word">{word}</span>
                      </span>
                    </label>
                  ))}
                </div>
                {errors.rating && <p id="fb-rating-err" className="field-error">{errors.rating}</p>}
              </fieldset>

              <div className="field">
                <label htmlFor="fb-topic">Topic <span className="required">*</span></label>
                <select
                  id="fb-topic"
                  className={`select ${errors.topic ? 'input-invalid' : ''}`}
                  value={form.topic}
                  onChange={set('topic')}
                  aria-required="true"
                  aria-invalid={Boolean(errors.topic)}
                  aria-describedby={errors.topic ? 'fb-topic-err' : undefined}
                >
                  <option value="">Choose a topic…</option>
                  {FEEDBACK_TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.topic && <p id="fb-topic-err" className="field-error">{errors.topic}</p>}
              </div>

              <div className="field">
                <label htmlFor="fb-email">Email (optional)</label>
                <input
                  id="fb-email"
                  type="email"
                  className={`input ${errors.email ? 'input-invalid' : ''}`}
                  value={form.email}
                  onChange={set('email')}
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={describedBy(errors.email && 'fb-email-err', 'fb-email-hint')}
                />
                {errors.email && <p id="fb-email-err" className="field-error">{errors.email}</p>}
                <p id="fb-email-hint" className="field-hint">Only if you’d like a reply. We won’t add you to a mailing list.</p>
              </div>

              <div className="field field-full">
                <label htmlFor="fb-message">Your feedback <span className="required">*</span></label>
                <textarea
                  id="fb-message"
                  className={`input ${errors.message ? 'input-invalid' : ''}`}
                  rows={5}
                  value={form.message}
                  maxLength={MESSAGE_MAX}
                  onChange={set('message')}
                  placeholder={`What’s working well, and what would make ${APP_NAME} better for your team?`}
                  aria-required="true"
                  aria-invalid={Boolean(errors.message)}
                  aria-describedby={describedBy(errors.message && 'fb-message-err', 'fb-message-count')}
                />
                <div className="field-meta">
                  {errors.message && <p id="fb-message-err" className="field-error">{errors.message}</p>}
                  <CharCounter id="fb-message-count" length={form.message.length} max={MESSAGE_MAX} />
                </div>
              </div>

              <div className="feedback-hp" aria-hidden="true">
                <label htmlFor="fb-website">Website</label>
                <input
                  id="fb-website"
                  name="website"
                  tabIndex={-1}
                  autoComplete="off"
                  value={form.website}
                  onChange={set('website')}
                />
              </div>

              {status === 'failed' && (
                <p className="alert field-full" role="alert">
                  We couldn’t send your feedback. Check your connection and try again.
                </p>
              )}
              <div className="form-actions field-full feedback-actions">
                <button type="submit" className="btn btn-primary btn-lg" disabled={sending}>
                  {sending ? 'Sending…' : 'Send feedback'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
