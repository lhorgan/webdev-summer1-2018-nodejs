var mongoose = require('mongoose');
var enrollmentSchema = require('./enrollment.schema.server');
var enrollmentModel = mongoose.model(
  'EnrollmentModel',
  enrollmentSchema
);

function enrollStudentInSection(enrollment) {
  return enrollmentModel.find(enrollment)
                 .then((res) => {
                   console.log("here's what we got... (" + res.length + ")");
                   console.log(res);
                   if(res.length === 0) {
                     return enrollmentModel.create(enrollment);
                   }
                   return res;
                 })
  //return enrollmentModel.create(enrollment);
}

function findSectionsForStudent(studentId) {
  return enrollmentModel
    .find({student: studentId})
    .populate('section')
    .exec();
}

function countEnrollmentsForSection(sectionId) {
  return enrollmentModel
      .count({section: sectionId});
}

module.exports = {
  enrollStudentInSection: enrollStudentInSection,
  findSectionsForStudent: findSectionsForStudent,
  countEnrollmentsForSection: countEnrollmentsForSection
};
