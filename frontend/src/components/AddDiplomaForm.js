import { useState } from 'react';

function DiplomaForm({ onAddDiploma }) {
  const [formData, setFormData] = useState({
    studentName: '',
    institution: '',
    degree: '',
    year: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    const result = await onAddDiploma(formData);
    
    if (result.success) {
      setFormData({
        studentName: '',
        institution: '',
        degree: '',
        year: ''
      });
    } else {
      setError(result.error || 'Failed to add diploma');
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="form-container">
      <h2>Add New Diploma</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Student Name</label>
          <input
            type="text"
            name="studentName"
            value={formData.studentName}
            onChange={handleChange}
            required
          />
        </div>
        {/* Остальные поля формы аналогично */}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add to Blockchain'}
        </button>
      </form>
    </div>
  );
}

export default DiplomaForm;