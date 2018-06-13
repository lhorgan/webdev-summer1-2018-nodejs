module.exports = function (app) {

  app.post('/api/enroll/student/:studentId/section/:sectionId',
    enrollStudentInSection);

  var enrollmentModel = require('../models/enrollment/enrollment.model.server');

  function enrollStudentInSection(req, res) {
    enrollmentModel
      .enrollStudentInSection(
        req.params.studentId,
        req.params.sectionId)
      .then(function (enrollment) {
        res.json(enrollment);
      });
  }
};