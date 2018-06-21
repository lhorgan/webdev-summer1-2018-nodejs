module.exports = function (app) {

  app.post('/api/course/:courseId/section', createSection);
  app.get('/api/course/:courseId/section', findSectionsForCourse);
  app.post('/api/section/:sectionId/enrollment', enrollStudentInSection);
  app.get('/api/student/section', findSectionsForStudent);
  app.put('/api/section/:sectionId', updateSection);
  app.delete('/api/section/:sectionId/enrollment', unEnrollStudentInSection);

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

    enrollmentModel
      .enrollStudentInSection(enrollment)
      .then((enrollment) => {
        res.json(enrollment);
      });
  }

  function unEnrollStudentInSection(req, res) {
    console.log("un-enrolling");
    var sectionId = req.params.sectionId;
    var currentUser = req.session.currentUser;
    var enrollment = { student: currentUser._id, section: sectionId };
    console.log(enrollment);
    enrollmentModel.unEnrollStudentInSection(enrollment)
                   .then(res.send("successs"));
  }

  function findSectionsForCourse(req, res) {
    var courseId = req.params['courseId'];
    var currentUser = req.session.currentUser;
    console.log("THE CURRENT USER");
    console.log(currentUser);
    sectionModel
      .findSectionsForCourse(courseId)
      .then((sections) => {
        let promises = [];
        for(let i = 0; i < sections.length; i++) {
          promises.push(enrollmentModel.countEnrollmentsForSection(sections[i]._id));
          promises.push(enrollmentModel.studentInSection(sections[i]._id, currentUser._id));
        }
        Promise.all(promises).then((values) => {
          console.log(values);
          let index = 0;
          res.json(sections.map((section) => {
            return {section: section, seatsLeft: section.seats - values[index++], enrolled: values[index++]};
          }));
        });
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
