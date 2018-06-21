var mongoose = require('mongoose');
var enrollmentSchema = require('./enrollment.schema.server');
var enrollmentModel = mongoose.model('EnrollmentModel', enrollmentSchema);

var sectionModel = require('../section/section.model.server');

function enrollStudentInSection(enrollment) {
  return enrollmentModel.find(enrollment)
                 .then((res) => {
                   console.log("here's what we got... (" + res.length + ")");
                   console.log(res);
                   if(res.length === 0) {
                     //console.log(sectionModel);
                     sectionModel.getSection(enrollment.section).then(section => {
                       console.log("got section")
                       console.log(section);
                       countEnrollmentsForSection(section._id).then((count) => {
                         console.log(section.seats + ", " + count);
                         if(section.seats - count > 0) {
                           return enrollmentModel.create(enrollment);
                         }
                         console.log("THE SECTION IS FULL!");
                         return null;
                       });
                     });
                   }
                   return res;
                 })
  //return enrollmentModel.create(enrollment);
}

function unEnrollStudentInSection(enrollment) {
  return enrollmentModel.find(enrollment).remove().exec();
}

function findSection(sectionId) {
  console.log("SEARCHING FOR SECTION WITH ID " + sectionId);
  return enrollmentModel.findOne({section: sectionId}).populate('section').exec();
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
  studentInSection: studentInSection,
  unEnrollStudentInSection: unEnrollStudentInSection,
  findSection: findSection
};
