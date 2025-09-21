import React from 'react';
import './LessonList.css';

const LessonList = ({ 
  lessons = [], 
  userRole = 'student',
  onCompleteLesson,
  onViewLesson,
  isLoading = false 
}) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleCompleteLesson = (lessonId) => {
    if (onCompleteLesson) {
      onCompleteLesson(lessonId);
    }
  };

  if (isLoading) {
    return (
      <div className="lesson-list">
        <div className="lesson-list-header">
          <h3>Danh sách bài học</h3>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lesson-list">
      <div className="lesson-list-header">
        <h3>Danh sách bài học</h3>
        <span className="lesson-count">{lessons.length} bài học</span>
      </div>

      {lessons.length === 0 ? (
        <div className="no-lessons">
          <div className="no-lessons-icon">📚</div>
          <p>Chưa có bài học nào</p>
          {userRole === 'instructor' && (
            <p className="no-lessons-hint">Tạo bài học mới để giao cho học sinh</p>
          )}
        </div>
      ) : (
        <div className="lessons-grid">
          {lessons.map((lesson) => (
            <div key={lesson.id} className="lesson-card">
              {/* Left Side - Main Content */}
              <div className="lesson-main">
                <div className="lesson-header">
                  <h4 className="lesson-title">{lesson.title}</h4>
                  <div className="lesson-status">
                    {lesson.isCompleted ? (
                      <span className="status completed">✅ Hoàn thành</span>
                    ) : (
                      <span className="status pending">⏳ Chưa hoàn thành</span>
                    )}
                    {userRole === 'instructor' && lesson.totalStudents && (
                      <span className="completion-info">
                        ({lesson.completedCount || 0}/{lesson.totalStudents} học sinh)
                      </span>
                    )}
                  </div>
                </div>

                <div className="lesson-content">
                  <p className="lesson-description">{lesson.description}</p>
                  
                  {userRole === 'instructor' && lesson.studentIds && (
                    <div className="lesson-students">
                      <span className="students-label">Giao cho {lesson.studentIds.length} học sinh</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Side - Files & Actions */}
              <div className="lesson-sidebar">
                {lesson.files && lesson.files.length > 0 && (
                  <div className="lesson-files">
                    <div className="files-header">
                      <span className="files-label">📎 Files ({lesson.files.length})</span>
                    </div>
                    <div className="files-list">
                      {lesson.files.map((file, index) => (
                        <div key={index} className="file-item">
                          <div className="file-icon">
                            {file.type?.includes('pdf') ? '📄' : 
                             file.type?.includes('word') ? '📝' :
                             file.type?.includes('excel') ? '📊' :
                             file.type?.includes('image') ? '🖼️' :
                             file.type?.includes('video') ? '🎥' :
                             file.type?.includes('audio') ? '🎵' :
                             file.type?.includes('zip') || file.type?.includes('rar') ? '📦' : '📄'}
                          </div>
                          <div className="file-details">
                            <span className="file-name">{file.name}</span>
                            <span className="file-size">{formatFileSize(file.size)}</span>
                          </div>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => window.open(file.url, '_blank')}
                            title="Tải xuống"
                          >
                            ⬇️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="lesson-actions">
                  {userRole === 'student' && !lesson.isCompleted && (
                    <button 
                      className="btn btn-success btn-full"
                      onClick={() => handleCompleteLesson(lesson.id)}
                    >
                      Hoàn thành
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonList;
