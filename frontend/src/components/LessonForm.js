import React, { useState } from 'react';
import './LessonForm.css';

const LessonForm = ({ 
  onSubmit, 
  onCancel, 
  students = [],
  initialData = null,
  isLoading = false 
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    studentIds: initialData?.studentIds || [],
    files: initialData?.files || []
  });

  const [errors, setErrors] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tiêu đề bài học là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả bài học là bắt buộc';
    }

    if (formData.studentIds.length === 0) {
      newErrors.studentIds = 'Vui lòng chọn ít nhất một học sinh';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleStudentToggle = (studentId) => {
    setFormData(prev => ({
      ...prev,
      studentIds: prev.studentIds.includes(studentId)
        ? prev.studentIds.filter(id => id !== studentId)
        : [...prev.studentIds, studentId]
    }));

    // Clear error when user selects students
    if (errors.studentIds) {
      setErrors(prev => ({
        ...prev,
        studentIds: ''
      }));
    }
  };

  const handleSelectAll = () => {
    if (formData.studentIds.length === students.length) {
      setFormData(prev => ({
        ...prev,
        studentIds: []
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        studentIds: students.map(student => student.id)
      }));
    }

    // Clear error when user selects students
    if (errors.studentIds) {
      setErrors(prev => ({
        ...prev,
        studentIds: ''
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = [];
    const newErrors = { ...errors };

    files.forEach(file => {
      // Validate file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        newErrors.files = 'File không được vượt quá 50MB';
        return;
      }

      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'video/mp4',
        'video/avi',
        'video/mov',
        'video/wmv',
        'audio/mp3',
        'audio/wav',
        'audio/m4a',
        'application/zip',
        'application/x-rar-compressed'
      ];

      if (!allowedTypes.includes(file.type)) {
        newErrors.files = 'Chỉ hỗ trợ file PDF, Word, Excel, TXT, hình ảnh, video, audio và nén';
        return;
      }

      validFiles.push({
        id: Date.now() + Math.random(),
        file: file,
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file)
      });
    });

    if (validFiles.length > 0) {
      setUploadedFiles(prev => [...prev, ...validFiles]);
      setFormData(prev => ({
        ...prev,
        files: [...prev.files, ...validFiles]
      }));
    }

    setErrors(newErrors);
  };

  const handleRemoveFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter(file => file.id !== fileId)
    }));

    // Clear error when user removes files
    if (errors.files) {
      setErrors(prev => ({
        ...prev,
        files: ''
      }));
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm() && onSubmit) {
      onSubmit(formData);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <div className="lesson-form-overlay">
      <div className="lesson-form">
        <div className="form-header">
          <h3>{initialData ? 'Chỉnh sửa bài học' : 'Tạo bài học mới'}</h3>
          <button 
            className="close-btn"
            onClick={handleCancel}
            disabled={isLoading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="form-content">
          <div className="form-group">
            <label htmlFor="title" className="form-label">
              Tiêu đề bài học *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`form-input ${errors.title ? 'error' : ''}`}
              placeholder="Nhập tiêu đề bài học"
              disabled={isLoading}
            />
            {errors.title && (
              <span className="error-message">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="description" className="form-label">
              Mô tả bài học *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Nhập mô tả chi tiết bài học"
              rows={4}
              disabled={isLoading}
            />
            {errors.description && (
              <span className="error-message">{errors.description}</span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">
              File bài tập (tùy chọn)
            </label>
            
            <div className="file-upload-container">
              <div className="file-upload-area">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  onChange={handleFileUpload}
                  className="file-input"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.jpg,.jpeg,.png,.gif,.mp4,.avi,.mov,.wmv,.mp3,.wav,.m4a,.zip,.rar"
                  disabled={isLoading}
                />
                <label htmlFor="file-upload" className="file-upload-label">
                  <div className="upload-icon">📁</div>
                  <div className="upload-text">
                    <span className="upload-title">Kéo thả file hoặc click để chọn</span>
                    <span className="upload-subtitle">PDF, Word, Excel, TXT, hình ảnh, video, audio, nén (tối đa 50MB)</span>
                  </div>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="uploaded-files">
                  <h4 className="files-title">Files đã chọn ({uploadedFiles.length})</h4>
                  <div className="files-list">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="file-item">
                        <div className="file-info">
                          <div className="file-icon">
                            {file.type.includes('pdf') ? '📄' : 
                             file.type.includes('word') ? '📝' :
                             file.type.includes('excel') ? '📊' :
                             file.type.includes('image') ? '🖼️' :
                             file.type.includes('video') ? '🎥' :
                             file.type.includes('audio') ? '🎵' :
                             file.type.includes('zip') || file.type.includes('rar') ? '📦' : '📄'}
                          </div>
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="remove-file-btn"
                          onClick={() => handleRemoveFile(file.id)}
                          disabled={isLoading}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.files && (
                <span className="error-message">{errors.files}</span>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">
              Chọn học sinh *
            </label>
            
            {students.length === 0 ? (
              <div className="no-students">
                <p>Chưa có học sinh nào. Vui lòng thêm học sinh trước khi tạo bài học.</p>
              </div>
            ) : (
              <div className="students-selection">
                <div className="select-all-container">
                  <button
                    type="button"
                    className="select-all-btn"
                    onClick={handleSelectAll}
                    disabled={isLoading}
                  >
                    {formData.studentIds.length === students.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                  </button>
                  <span className="selected-count">
                    Đã chọn: {formData.studentIds.length}/{students.length}
                  </span>
                </div>

                <div className="students-list">
                  {students.map((student) => (
                    <label key={student.id} className="student-checkbox">
                      <input
                        type="checkbox"
                        checked={formData.studentIds.includes(student.id)}
                        onChange={() => handleStudentToggle(student.id)}
                        disabled={isLoading}
                      />
                      <span className="student-info">
                        <span className="student-name">{student.name}</span>
                        <span className="student-email">{student.email}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {errors.studentIds && (
              <span className="error-message">{errors.studentIds}</span>
            )}
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || students.length === 0}
            >
              {isLoading ? 'Đang xử lý...' : (initialData ? 'Cập nhật' : 'Tạo bài học')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LessonForm;
