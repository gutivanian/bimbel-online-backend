// controllers/class.controller.js
const Class = require('../models/class.model');
const eventModel = require('../models/event.model');
 
// Fungsi untuk mendapatkan semua kelas
const getAllClasses = async (req, res) => {
  try {
    const params = {
      sortField: req.query.sortField || 'id',
      sortOrder: req.query.sortOrder || 'asc',
      search: req.query.search || '',
      searchDate: req.query.searchDate || '',
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      status: req.query.status || '',
      courseId: req.query.courseId || '',
      teacherId: req.query.teacherId || '',
      studentId: req.query.studentId || '',
      startDate: req.query.startDate || '',
      endDate: req.query.endDate || ''
    };
    console.log('test:', params.studentId);
    const { classes, total } = await Class.getClasses(params);
    // console.log("class:", classes)
    // console.log("total:", total);
    const processedClasses = classes.map((cls) => ({
      id: cls.id,
      event_id: cls.event_id,
      starter_user_id: cls.starter_user_id, 
      is_started: cls.is_started,
      name: cls.name,
      course_name: cls.course_name,
      course_id: cls.course_id,
      teacher_id: cls.teacher_id,
      description: cls.description,
      teacher_name: cls.teacher_name,
      student_list_ids: cls.student_list,
      student_list_names: cls.student_list_names,
      students_display:
        cls.student_list_names.join(', ').length > 20
          ? cls.student_list_names.join(', ').slice(0, 20) + '...'
          : cls.student_list_names.join(', '),
      date: new Date(cls.start_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      start_time: new Date(cls.start_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      end_time: new Date(cls.end_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',  
        minute: '2-digit',
      
      }),
      real_start_datetime: cls.start_date,
      real_end_datetime:cls.end_date,
      creator: cls.creator_name,
      create_user_id: cls.create_user_id,
      create_date: cls.create_date,
      edit_user_id: cls.edit_user_id,
      edit_date: cls.edit_date,
      status: cls.status
    }));

    // console.log(processedClasses)
    res.json({
      data: processedClasses,
      total,
      page: parseInt(params.page),
      totalPages: Math.ceil(total / params.limit)
    });
  } catch (error) {
    console.error('Get All Classes Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
}; 

// Fungsi untuk mendapatkan kelas berdasarkan ID
const getClassById = async (req, res) => {
  const { id } = req.params;

  try {
    const cls = await Class.getById(id);
    if (!cls) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    const processedClass = {
      id: cls.id,
      name: cls.name,
      course_name: cls.course_name,
      description: cls.description,
      teacher_name: cls.teacher_name,
      student_list_ids: cls.student_list,
      student_list_names: cls.student_list_names,
      students_display:
        cls.student_list_names.join(', ').length > 20
          ? cls.student_list_names.join(', ').slice(0, 20) + '...'
          : cls.student_list_names.join(', '),
      date: new Date(cls.start_date).toLocaleDateString('id-ID', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      start_time: new Date(cls.start_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      end_time: new Date(cls.end_date).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }),
      creator: cls.creator_name,
      create_user_id: cls.create_user_id,
      create_date: cls.create_date,
      edit_user_id: cls.edit_user_id,
      edit_date: cls.edit_date,
    };

    res.json(processedClass);
  } catch (error) {
    console.error('Get Class By ID Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
 
// Fungsi untuk membuat kelas baru
const createClass = async (req, res) => {
  try { 
    const {name, description, start_date, end_date, create_user_id, teacher_id, student_list} = req.body
    const assign = [teacher_id, ...student_list];

    const newClass = await Class.createClass(req.body);

    const classId = newClass.id;
    const newEvent = await eventModel.createEvent({
      title : name,
      notes: description,
      start_time: start_date,
      end_time: end_date,
      create_user_id : create_user_id,
      assigned_to : assign,
      starter_user_id :teacher_id,
      role: ["teacher", "student"],
      event_type: 1,
      master_id: classId
    });

    const responseObj = {
      ...newClass,            // semua properti dari newClass
      event_id: newEvent.id,  // tambahkan event_id = id di newEvent
      starter_user_id: newEvent.starter_user_id, // tambahkan
    };
    
    return res.status(201).json(responseObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// Fungsi untuk mengupdate kelas
const updateClass = async (req, res) => {
  const {event_id} = req.body

  try {
    const updatedClass = await Class.updateClass(req.params.id, req.body);
    const updatedEvent = await eventModel.updateEvent(event_id, req.body);
    res.status(200).json(updatedClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const deleteClass = async (req, res) => {
  try {
    const deletedClass = await Class.deleteClass(req.params.id);
    res.status(200).json(deletedClass);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Fungsi untuk menghapus kelas
exports.deleteClass = async (req, res) => {
  const { id } = req.params;

  try {
    // Cek keberadaan kelas
    const existingClass = await Class.getById(id);
    if (!existingClass) {
      return res.status(404).json({ message: 'Kelas tidak ditemukan' });
    }

    // Cek hak akses
    // if (req.user.role !== 'admin' && existingClass.teacher_id !== req.user.user_id) {
    //   return res.status(403).json({ message: 'Akses ditolak: Anda tidak memiliki hak untuk menghapus kelas ini' });
    // }

    await Class.delete(id);
    res.status(204).send(); // No Content
  } catch (error) {
    console.error('Delete Class Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getAllClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass,
};