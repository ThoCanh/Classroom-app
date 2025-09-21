const { db } = require('../config/firebaseAdmin');

// Get student profile
const getProfile = async (req, res) => {
  try {
    const studentId = req.user.id;

    const studentDoc = await db.collection('students').doc(studentId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Hồ sơ học sinh không tồn tại' });
    }

    const student = studentDoc.data();
    
    // Get instructor name if instructorId exists
    let instructorName = null;
    if (student.instructorId) {
      try {
        const instructorDoc = await db.collection('instructors').doc(student.instructorId).get();
        if (instructorDoc.exists) {
          instructorName = instructorDoc.data().name;
        }
      } catch (error) {
        console.error('Error getting instructor name:', error);
      }
    }

    res.json({
      success: true,
      profile: {
        id: student.id,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        username: student.username,
        instructorId: student.instructorId,
        instructorName: instructorName,
        createdAt: student.createdAt
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Update student profile
const updateProfile = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { name, email, phoneNumber } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;

    await db.collection('students').doc(studentId).update(updateData);

    res.json({ success: true, message: 'Cập nhật hồ sơ thành công' });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Get lessons assigned to student
const getLessons = async (req, res) => {
  try {
    const studentId = req.user.id;

    const lessonsQuery = await db.collection('lessons')
      .where('studentIds', 'array-contains', studentId)
      .get();

    const lessons = lessonsQuery.docs.map(doc => {
      const data = doc.data();
      const completedStudents = data.completedStudents || [];
      const isCompletedByStudent = completedStudents.includes(studentId);
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        instructorId: data.instructorId,
        isCompleted: isCompletedByStudent,
        files: data.files || [],
        createdAt: data.createdAt
      };
    });

    // Sort by createdAt in JavaScript instead of Firestore
    lessons.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json({ success: true, lessons });

  } catch (error) {
    console.error('Get lessons error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Mark lesson as completed
const completeLesson = async (req, res) => {
  try {
    const { lessonId } = req.params;
    const studentId = req.user.id;

    // Check if lesson is assigned to student
    const lessonDoc = await db.collection('lessons').doc(lessonId).get();
    
    if (!lessonDoc.exists) {
      return res.status(404).json({ error: 'Bài học không tồn tại' });
    }

    const lesson = lessonDoc.data();
    
    if (!lesson.studentIds.includes(studentId)) {
      return res.status(403).json({ error: 'Bạn không được giao bài học này' });
    }

    // Update lesson completion status for this specific student
    const completedStudents = lesson.completedStudents || [];
    if (!completedStudents.includes(studentId)) {
      completedStudents.push(studentId);
    }
    
    await db.collection('lessons').doc(lessonId).update({
      completedStudents: completedStudents,
      updatedAt: new Date()
    });

    res.json({ success: true, message: 'Đánh dấu hoàn thành bài học thành công' });

  } catch (error) {
    console.error('Complete lesson error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Get chat messages with instructor
const getMessages = async (req, res) => {
  try {
    const studentId = req.user.id;
    const { instructorId } = req.params;

    // Get messages between student and instructor
    const messagesQuery = await db.collection('messages')
      .where('senderId', 'in', [studentId, instructorId])
      .where('receiverId', 'in', [studentId, instructorId])
      .orderBy('timestamp', 'asc')
      .get();

    const messages = messagesQuery.docs.map(doc => {
      const data = doc.data();
      return {
        id: data.id,
        message: data.message,
        senderId: data.senderId,
        receiverId: data.receiverId,
        senderRole: data.senderRole,
        receiverRole: data.receiverRole,
        timestamp: data.timestamp,
        isRead: data.isRead
      };
    });

    res.json({ success: true, messages });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Send message to instructor
const sendMessage = async (req, res) => {
  try {
    const { message, instructorId } = req.body;
    const studentId = req.user.id;

    if (!message || !instructorId) {
      return res.status(400).json({ error: 'Tin nhắn và ID giáo viên là bắt buộc' });
    }

    // Create message
    const messageRef = db.collection('messages').doc();
    const messageData = {
      id: messageRef.id,
      message,
      senderId: studentId,
      receiverId: instructorId,
      senderRole: 'student',
      receiverRole: 'instructor',
      timestamp: new Date(),
      isRead: false
    };

    await messageRef.set(messageData);

    res.json({
      success: true,
      message: 'Gửi tin nhắn thành công',
      messageData: {
        id: messageData.id,
        message: messageData.message,
        senderId: messageData.senderId,
        receiverId: messageData.receiverId,
        senderRole: messageData.senderRole,
        receiverRole: messageData.receiverRole,
        timestamp: messageData.timestamp
      }
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getLessons,
  completeLesson,
  getMessages,
  sendMessage
};
