const { db } = require('../config/firebaseAdmin');
const { generateStudentPassword } = require('../utils/jwt');
const { sendWelcomeEmail, sendLessonAssignmentEmail } = require('../utils/mailer');

// Add new student
const addStudent = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const instructorId = req.user.id;

    if (!name || !email || !phoneNumber) {
      return res.status(400).json({ error: 'Tên, email và số điện thoại là bắt buộc' });
    }

    // Format phone number for Firebase (add +84 for Vietnam)
    const formattedPhone = phoneNumber.startsWith('0') 
      ? `+84${phoneNumber.substring(1)}` 
      : `+84${phoneNumber}`;

    // Check if user already exists with this phone number
    const existingUserQuery = await db.collection('users')
      .where('phoneNumber', '==', formattedPhone)
      .limit(1)
      .get();

    let studentId;
    let isNewUser = false;

    if (existingUserQuery.empty) {
      // Create new student user
      const userRef = db.collection('users').doc();
      const newUser = {
        id: userRef.id,
        phoneNumber: formattedPhone,
        name: name,
        role: 'student',
        email: email,
        instructorId: instructorId, // Assign instructor to student
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await userRef.set(newUser);
      studentId = userRef.id;
      isNewUser = true;
      console.log('Created new student user:', studentId);
    } else {
      // User already exists
      const existingUser = existingUserQuery.docs[0].data();
      
      // Check if it's already a student
      if (existingUser.role === 'student') {
        studentId = existingUser.id;
        console.log('Using existing student user:', studentId);
        
        // Update instructorId for existing student
        await db.collection('users').doc(studentId).update({
          instructorId: instructorId,
          updatedAt: new Date()
        });
        console.log('Updated instructorId for existing student:', studentId);
      } else {
        return res.status(400).json({ 
          error: 'Số điện thoại này đã được sử dụng bởi tài khoản khác' 
        });
      }
    }

    // Check if student is already assigned to this instructor
    const existingStudent = await db.collection('instructorStudents')
      .where('instructorId', '==', instructorId)
      .where('studentId', '==', studentId)
      .limit(1)
      .get();

    if (!existingStudent.empty) {
      return res.status(400).json({ error: 'Học sinh đã được thêm vào lớp của bạn' });
    }

    // Add student to instructor's class
    const instructorStudentRef = db.collection('instructorStudents').doc();
    const instructorStudent = {
      id: instructorStudentRef.id,
      instructorId,
      studentId: studentId,
      studentName: name,
      studentEmail: email,
      studentPhoneNumber: formattedPhone,
      addedAt: new Date(),
      isActive: true
    };

    await instructorStudentRef.set(instructorStudent);

    // Send welcome email to student
    const emailResult = await sendWelcomeEmail(email, name, 'Học sinh', `Đăng nhập bằng số điện thoại: ${phoneNumber}`);

    res.json({
      success: true,
      message: isNewUser ? 'Tạo tài khoản học sinh thành công' : 'Thêm học sinh thành công',
      student: {
        id: studentId,
        name: name,
        email: email,
        phoneNumber: formattedPhone,
        role: 'student'
      },
      emailSent: emailResult.success,
      isNewUser: isNewUser
    });

  } catch (error) {
    console.error('Add student error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Get all students for instructor
const getStudents = async (req, res) => {
  try {
    const instructorId = req.user.id;
    console.log('=== GET STUDENTS API CALLED ===');
    console.log('Instructor ID:', instructorId);

    const instructorStudentsQuery = await db.collection('instructorStudents')
      .where('instructorId', '==', instructorId)
      .where('isActive', '==', true)
      .get();

    console.log(`Found ${instructorStudentsQuery.docs.length} instructor-student relationships`);

    if (instructorStudentsQuery.docs.length === 0) {
      console.log('No students found for this instructor');
      return res.json({ success: true, students: [] });
    }

    const students = await Promise.all(instructorStudentsQuery.docs.map(async (doc) => {
      const data = doc.data();
      console.log('Processing student:', data.studentName, 'ID:', data.studentId);
      
      // Get last message time for this student
      let lastMessageTime = null;
      try {
        // Use the same roomId format as socket handler and message controller
        const sortedIds = [instructorId, data.studentId].sort();
        const roomId = `conversation_${sortedIds[0]}_${sortedIds[1]}`;
        
        const lastMessageQuery = await db.collection('messages')
          .where('roomId', '==', roomId)
          .orderBy('timestamp', 'desc')
          .limit(1)
          .get();
        
        if (!lastMessageQuery.empty) {
          const lastMessage = lastMessageQuery.docs[0].data();
          lastMessageTime = lastMessage.timestamp.toDate();
        }
      } catch (error) {
        console.error('Error getting last message time:', error);
      }

      return {
        id: data.studentId,
        name: data.studentName,
        email: data.studentEmail,
        phoneNumber: data.studentPhoneNumber,
        role: 'student',
        isActive: data.isActive,
        addedAt: data.addedAt,
        lastMessageTime: lastMessageTime
      };
    }));

    // Sort by last message time (most recent first), then by addedAt
    students.sort((a, b) => {
      if (a.lastMessageTime && b.lastMessageTime) {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      } else if (a.lastMessageTime && !b.lastMessageTime) {
        return -1; // a has messages, b doesn't
      } else if (!a.lastMessageTime && b.lastMessageTime) {
        return 1; // b has messages, a doesn't
      } else {
        // Both have no messages, sort by addedAt
        return new Date(b.addedAt) - new Date(a.addedAt);
      }
    });

    console.log(`Returning ${students.length} students:`, students.map(s => s.name));
    res.json({ success: true, students });

  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Update student
const updateStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const { name, email, phoneNumber } = req.body;
    const instructorId = req.user.id;

    // Check if student belongs to instructor
    const instructorStudentQuery = await db.collection('instructorStudents')
      .where('instructorId', '==', instructorId)
      .where('studentId', '==', studentId)
      .limit(1)
      .get();
    
    if (instructorStudentQuery.empty) {
      return res.status(404).json({ error: 'Học sinh không tồn tại trong lớp của bạn' });
    }

    const instructorStudentDoc = instructorStudentQuery.docs[0];
    const instructorStudentData = instructorStudentDoc.data();

    // Update instructor-student relationship
    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.studentName = name;
    if (email) updateData.studentEmail = email;
    if (phoneNumber) {
      const formattedPhone = phoneNumber.startsWith('0') 
        ? `+84${phoneNumber.substring(1)}` 
        : `+84${phoneNumber}`;
      updateData.studentPhoneNumber = formattedPhone;
    }

    await instructorStudentDoc.ref.update(updateData);

    res.json({ success: true, message: 'Cập nhật học sinh thành công' });

  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Delete student
const deleteStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const instructorId = req.user.id;

    // Check if student belongs to instructor
    const instructorStudentQuery = await db.collection('instructorStudents')
      .where('instructorId', '==', instructorId)
      .where('studentId', '==', studentId)
      .limit(1)
      .get();
    
    if (instructorStudentQuery.empty) {
      return res.status(404).json({ error: 'Học sinh không tồn tại trong lớp của bạn' });
    }

    const instructorStudentDoc = instructorStudentQuery.docs[0];

    // Soft delete (mark as inactive)
    await instructorStudentDoc.ref.update({
      isActive: false,
      removedAt: new Date()
    });

    res.json({ success: true, message: 'Xóa học sinh thành công' });

  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Create lesson
const createLesson = async (req, res) => {
  try {
    const { title, description, studentIds, files } = req.body;
    const instructorId = req.user.id;

    if (!title || !description || !studentIds || !Array.isArray(studentIds)) {
      return res.status(400).json({ error: 'Tiêu đề, mô tả và danh sách học sinh là bắt buộc' });
    }

    // Process files if provided
    let processedFiles = [];
    if (files && Array.isArray(files)) {
      processedFiles = files.map(file => ({
        id: file.id,
        name: file.name,
        size: file.size,
        type: file.type,
        url: file.url || null, // Will be set after upload
        uploadedAt: new Date()
      }));
    }

    // Create lesson
    const lessonRef = db.collection('lessons').doc();
    const lesson = {
      id: lessonRef.id,
      title,
      description,
      instructorId,
      studentIds,
      files: processedFiles,
      completedStudents: [], // Initialize empty array for completed students
      isCompleted: false, // Keep for backward compatibility
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await lessonRef.set(lesson);

    // Send email to assigned students
    const emailPromises = studentIds.map(async (studentId) => {
      const studentDoc = await db.collection('users').doc(studentId).get();
      if (studentDoc.exists) {
        const student = studentDoc.data();
        return sendLessonAssignmentEmail(student.email, student.name, title, description);
      }
    });

    await Promise.all(emailPromises);

    res.json({
      success: true,
      message: 'Tạo bài học thành công',
      lesson: {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        studentIds: lesson.studentIds,
        files: lesson.files,
        createdAt: lesson.createdAt
      }
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

// Get all lessons for instructor
const getLessons = async (req, res) => {
  try {
    const instructorId = req.user.id;

    const lessonsQuery = await db.collection('lessons')
      .where('instructorId', '==', instructorId)
      .get();

    const lessons = lessonsQuery.docs.map(doc => {
      const data = doc.data();
      const completedStudents = data.completedStudents || [];
      const totalStudents = data.studentIds ? data.studentIds.length : 0;
      const completedCount = completedStudents.length;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description,
        studentIds: data.studentIds,
        files: data.files || [],
        isCompleted: completedCount === totalStudents && totalStudents > 0,
        completedStudents: completedStudents,
        completedCount: completedCount,
        totalStudents: totalStudents,
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

// Assign existing student to instructor
const assignStudent = async (req, res) => {
  try {
    const { studentId, instructorId } = req.body;
    const currentInstructorId = req.user.id;
    
    // Use provided instructorId or current user's ID
    const targetInstructorId = instructorId || currentInstructorId;
    
    console.log('=== ASSIGN STUDENT ===');
    console.log('Student ID:', studentId);
    console.log('Instructor ID:', targetInstructorId);
    
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }
    
    // Check if student exists
    const studentDoc = await db.collection('users').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    const student = studentDoc.data();
    if (student.role !== 'student') {
      return res.status(400).json({ error: 'User is not a student' });
    }
    
    // Check if instructor exists
    const instructorDoc = await db.collection('users').doc(targetInstructorId).get();
    if (!instructorDoc.exists) {
      return res.status(404).json({ error: 'Instructor not found' });
    }
    
    const instructor = instructorDoc.data();
    if (instructor.role !== 'instructor') {
      return res.status(400).json({ error: 'User is not an instructor' });
    }
    
    // Update student's instructorId
    await db.collection('users').doc(studentId).update({
      instructorId: targetInstructorId,
      updatedAt: new Date()
    });
    
    // Check if relationship already exists
    const existingRelation = await db.collection('instructorStudents')
      .where('instructorId', '==', targetInstructorId)
      .where('studentId', '==', studentId)
      .limit(1)
      .get();
    
    if (existingRelation.empty) {
      // Create instructor-student relationship
      const instructorStudentRef = db.collection('instructorStudents').doc();
      const instructorStudent = {
        id: instructorStudentRef.id,
        instructorId: targetInstructorId,
        studentId: studentId,
        studentName: student.name,
        studentEmail: student.email,
        studentPhoneNumber: student.phoneNumber,
        addedAt: new Date(),
        isActive: true
      };
      
      await instructorStudentRef.set(instructorStudent);
    }
    
    console.log('✅ Student assigned to instructor successfully');
    
    res.json({
      success: true,
      message: 'Student assigned to instructor successfully',
      student: {
        id: studentId,
        name: student.name,
        email: student.email,
        phoneNumber: student.phoneNumber,
        instructorId: targetInstructorId
      }
    });
    
  } catch (error) {
    console.error('Assign student error:', error);
    res.status(500).json({ error: 'Lỗi hệ thống' });
  }
};

module.exports = {
  addStudent,
  getStudents,
  updateStudent,
  deleteStudent,
  createLesson,
  getLessons,
  assignStudent
};
