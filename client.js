// no transform on the client
Collaborations = new Meteor.Collection("collaboration");

// We need this so that we get the extra fields in the user objects
Tracker.autorun(function () {
  // include Meteor.userId() so that it is reactive on the client
  var userId = Meteor.userId();

  if (userId) {
    Meteor.subscribe("/collaborations/user", userId);
  }
});