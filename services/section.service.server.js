module.exports = function (app) {

  app.post('/api/course/:courseId/section', createSection);
  app.get('/api/course/:courseId/section', findSectionsForCourse)
  app.post('/api/enroll/section/:sectionId',
    enrollStudentInSection);
  app.get('/api/student/section', findSectionsForStudent)
  app.get('/api/section/:sectionId/student', findStudentsForSection)

  var sectionModel = require('../models/section/section.model.server');
  var enrollmentModel = require('../models/enrollment/enrollment.model.server');

  function findSectionsForCourse(req, res) {
    var courseId = req.params['courseId'];
    sectionModel
      .findSectionsForCourse(courseId)
      .then(function (sections) {
        res.json(sections);
      })
  }

  function createSection(req, res) {
    var section = req.body;
    sectionModel
      .createSection(section)
      .then(function (section) {
        res.json(section);
      })
  }

  function enrollStudentInSection(req, res) {
    var user = req.session['currentUser'];
    var sectionId = req.params.sectionId;
    var enrollment = {};
    enrollmentModel
      .enrollStudentInSection(
        user._id,
        sectionId)
      .then(function (_enrollment) {
        enrollment = _enrollment;
        return sectionModel.decrementSectionSeats(sectionId);
      })
      .then(function (section) {
        res.json(enrollment);
      })
  }

  function findSectionsForStudent(req, res) {
    var user = req.session['currentUser'];
    enrollmentModel
      .findSectionsForStudent(user._id)
      .then(function (enrollments) {
        res.json(enrollments);
      })
  }

  function findStudentsForSection(req, res) {
    enrollmentModel
      .findStudentsForSection(req.params.sectionId)
      .then(function (enrollments) {
        res.json(enrollments);
      })
  }
};