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
                     countEnrollmentsForSection(enrollment.section._id).then((count) => {
                       if(enrollment.section.seats - count > 0) {
                         return enrollmentModel.create(enrollment);
                       }
                       console.log("THE SECTION IS FULL!");
                       return null;
                     });
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

function studentInSection(sectionId, studentId) {
  return enrollmentModel
         .count({section: sectionId, student: studentId})
         .then((count) => {
           return count > 0;
         });
}

module.exports = {
  enrollStudentInSection: enrollStudentInSection,
  findSectionsForStudent: findSectionsForStudent,
  countEnrollmentsForSection: countEnrollmentsForSection,
  studentInSection: studentInSection
};
