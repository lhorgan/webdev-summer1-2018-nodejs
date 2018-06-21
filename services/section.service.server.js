module.exports = function (app) {

  app.post('/api/course/:courseId/section', createSection);
  app.get('/api/course/:courseId/section', findSectionsForCourse);
  app.post('/api/section/:sectionId/enrollment', enrollStudentInSection);
  app.get('/api/student/section', findSectionsForStudent);
  app.put('/api/section/:sectionId', updateSection);

  var sectionModel = require('../models/section/section.model.server');
  var enrollmentModel = require('../models/enrollment/enrollment.model.server');

  function findSectionsForStudent(req, res) {
    var currentUser = req.session.currentUser;
    var studentId = currentUser._id;
    enrollmentModel
      .findSectionsForStudent(studentId)
      .then(function(enrollments) {
        let promises = [];
        for(let i = 0; i < enrollments.length; i++) {
          console.log(enrollments[i].section._id);
          promises.push(enrollmentModel.countEnrollmentsForSection(enrollments[i].section._id)
                                       .then((count) => {enrollments[i].seatsLeft = count; return count;}));
        }
        Promise.all(promises).then(values => {
          //console.log(values);
          //console.log(enrollments);
          /*for(var i = 0; i < enrollments.length; i++) {
            console.log("adding " + values[i] + "seats");
            enrollments[i].seatsLeft = values[i];
            console.log(enrollments[i].seatsLeft);
          }
          console.log(enrollments);*/
          var enrollmentsAnnotated = enrollments.map((enrollment, index) => {
            return {"enrollment": enrollment, "seatsLeft": enrollment.section.seats - values[index]};
          });
          res.json(enrollmentsAnnotated);
        });
      });
  }

  function enrollStudentInSection(req, res) {
    var sectionId = req.params.sectionId;
    var currentUser = req.session.currentUser;
    var studentId = currentUser._id;
    var enrollment = {
      student: studentId,
      section: sectionId
    };

    sectionModel
      .decrementSectionSeats(sectionId)
      .then(function () {
        return enrollmentModel
          .enrollStudentInSection(enrollment)
      })
      .then(function (enrollment) {
        res.json(enrollment);
      })
  }

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

  function updateSection(req, res) {
    var id = req.params['sectionId'];
    console.log(id);
    var updatedSection = req.body;
    console.log(JSON.stringify(updatedSection));
    sectionModel.updateSection(id, updatedSection)
             .then(updatedSectionInDB => {
               console.log("here's the updated user in the database");
               console.log(updatedSectionInDB);
               res.send(updatedSectionInDB);
             });
  }
};
