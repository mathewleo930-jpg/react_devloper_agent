import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tasksApi } from '../api/tasks.js';

export default function AddTask() {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [titleError, setTitleError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setTitleError('Title is required');
      return;
    }

    setSubmitting(true);
    setSubmitError('');
    try {
      await tasksApi.create({ title: title.trim(), description: description.trim() || null });
      navigate('/');
    } catch (err) {
      setSubmitError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <section className="narrow">
      <div className="page-header">
        <h1>Add Task</h1>
      </div>

      <form className="card form" onSubmit={handleSubmit} noValidate>
        {submitError && <div className="alert">{submitError}</div>}

        <label htmlFor="title">
          Title <span className="required">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          maxLength={200}
          autoFocus
          placeholder="e.g. Prepare sprint review"
          className={titleError ? 'invalid' : ''}
          onChange={(e) => {
            setTitle(e.target.value);
            if (titleError) setTitleError('');
          }}
        />
        {titleError && <p className="field-error">{titleError}</p>}

        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          rows={4}
          value={description}
          maxLength={2000}
          placeholder="Optional details"
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="form-actions">
          <button type="button" className="btn" onClick={() => navigate('/')} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create Task'}
          </button>
        </div>
      </form>
    </section>
  );
}
