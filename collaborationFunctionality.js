/**
 * @summary Update and return the list of collaborations to which this user
 *          has access.
 * @locus Server
 * @memberOf User
 * @returns {Array}
 * @example
 * ```js
 * MedBook.findUser(userId).getCollaborations()
 * ```
 */
getCollaborations = function () {
  if (!this.collaborations || !this.collaborations.personal) {
    throw new Meteor.Error("User document must have collaborations");
  }

  // this seems kind of hacky...
  var collaborations = getAssociatedCollaborations({
    name: this.collaborations.personal
  });

  Meteor.users.update(this._id, {
    $set: {
      "collaborations.memberOf": collaborations
    }
  });

  return collaborations;
};

// =============================================================================

// Collaborations

// there is a transform on the server
Collaborations = new Meteor.Collection("collaboration", {
  transform: function (doc) {
    // NOTE: this might break things by not using `return new Collaboration(doc)`.
    // I didn't want to do that before because I didn't think it'd work, and now
    // I'm too lazy to change it. Feel free to!
    doc.getAssociatedCollaborators = _.partial(getAssociatedCollaborators, doc);
    doc.getAssociatedCollaborations = _.partial(getAssociatedCollaborations, doc);
    return doc;
  }
});

/**
 * @summary Traverse the collaboration graph downwards.
 *          Returns the collaborators that have access to this collaboration.
 * @locus Server
 * @memberOf Collaboration
 * @returns {Array}
 * @example
 * ```js
 * Collaborations.findOne({name: "UCSC"}).getAssociatedCollaborators()
 * ```
 */
function getAssociatedCollaborators (doc) {
  // TRANSITIVE CLOSURE QUEUE METHOD (even after Teo's changes?)

  // the graph of collaborators we want to return (collaboration names)
  // This is stored as an object because objects are dictionaries.
  var associatedCollaborators = {};

  // the dynamic queue of tree nodes that we're going to parse through
  // NOTE: list of collaboration names
  var collaborationLookupQueue = [];

  // add the current collaboration to start
  // NOTE: associatedCollaborators will not contain doc.name
  collaborationLookupQueue.push(doc.name);

  // for each node in our queue
  for (var i = 0; i < collaborationLookupQueue.length; i++) {
    // look it up in the collection
    var currentCollaboration = Collaborations.findOne({name: collaborationLookupQueue[i]});

    if (currentCollaboration && currentCollaboration.collaborators) {
      // look through the collaborators
      for (var index in currentCollaboration.collaborators) {
        // save the current collaborator name to a variable
        var collaborationName = currentCollaboration.collaborators[index];

        // add nodes (non-leaves, non-users) to the lookup queue
        if (!collaborationName.startsWith("user:")) {
          collaborationLookupQueue.push(collaborationName);
        }

        // make sure each one is in associatedCollaborators
        // NOTE: a collaborator can be added to associatedCollaborators twice if
        //       it is part of a collaboration two different ways, which is
        //       why associatedCollaborators is stored as a dictionary.
        associatedCollaborators[collaborationName] = 1;
      }
    } else {
      throw new Error("Invalid collaborator name:" + collaborationLookupQueue[i]);
    }
  }

  // when all done, return the graph
  return Object.keys(associatedCollaborators);
}

/**
 * @summary Traverse the collaboration graph upwards.
 *          Returns the collaborations that a given collaborator has access to.
 * @locus Server
 * @memberOf Collaboration
 * @returns {Array}
 * @example
 * ```js
 * Collaborations.findOne({name: "UCSC"}).getAssociatedCollaborations()
 * ```
 */
function getAssociatedCollaborations (doc) {
  // TRANSITIVE CLOSURE QUEUE METHOD (even after Teo's changes?)

  // the graph of collaborations we want to return
  // This is stored as an object because objects are dictionaries.
  var associatedCollaborations = {};
  associatedCollaborations[doc.name] = 1;

  // the dynamic queue of tree nodes that we're going to parse through,
  // starting with the current one
  var collaborationLookupQueue = [doc.name];

  // for each node in our queue
  for (var i = 0; i < collaborationLookupQueue.length; i++) {

    // save it in a variable
    var collaborator = collaborationLookupQueue[i];

    // find collaborations that have this one as a collaborator
    var parentCollaborations = Collaborations.find({
      collaborators: doc.name,
    }, {
      fields: { name: 1 } // speed-up
    }).fetch();
    var parentCollaborationNames = _.pluck(parentCollaborations, "name");

    // loop through each parent
    for (var index in parentCollaborationNames) {
      var parentName = parentCollaborationNames[index];

      // add the parent collaboration to the lookup queue only if we haven't
      // seen it before
      if (!associatedCollaborations[parentName]) {
        collaborationLookupQueue.push(parentName);
      }

      // make sure the parent collaboration is in the list to return
      associatedCollaborations[parentName] = 1;
    }
  }

  // when all done, return the graph
  return Object.keys(associatedCollaborations);
}
