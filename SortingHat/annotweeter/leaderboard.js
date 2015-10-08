// Set up a collection to contain player information. On the server,
// it is backed by a MongoDB collection named "players".

Players = new Mongo.Collection("players");

if (Meteor.isClient) { 
  Template.leaderboard.helpers({
    players: function () {
       if (Session.get("showCompleted")) {
        // If hide completed is checked, filter tasks 
        return Players.find({type: { $exists: true }});
        } 
       else {
        p = Players.findOne({type: {$exists:false}});
        Session.set("selectedPlayer", p._id);
        var url = p.picture;
        url = url.replace("_normal", "");
        p.picture = url;
        return [ p ];
        // Otherwise, return all of the tasks
        //return Players.find({});
      }
    },
    showCompleted: function () {
      return Session.get("showCompleted");
    },
    incompleteCount: function () {
        return Players.find({ type: { $exists: false }}).count();
    },
    completeCount: function (){
        return Players.find({type: {$exists: true}}).count();
    },
    totalCount: function(){
        return Players.find({}).count();
    },
    percentage: function(){
      var completed = Players.find({type: {$exists: true}}).count();
      var total = Players.find({}).count();
      return Math.round(( completed / total ) * 100);
    },
    selectedName: function () {
      var player = Players.findOne(Session.get("selectedPlayer"));
 
      return player && player.name;
    }

  });


  Template.leaderboard.events({

    "change .show-completed input": function (event) {
      Session.set("showCompleted", event.target.checked);
    },

    'click .person': function () {
      Players.update(Session.get("selectedPlayer"), {$set: {type: "person"}});
      location.reload();
    },

    'click .org': function () {
      Players.update(Session.get("selectedPlayer"), {$set: {type: "org"}});
      location.reload();
    },

    'click .unsure': function () {
      Players.update(Session.get("selectedPlayer"), {$set: {type: "unsure"}});
      location.reload();
    }
  });

  Template.player.helpers({
    selected: function () {
      return Session.equals("selectedPlayer", this._id) ? "selected" : '';
    }
  });

  Template.upload.events({
    "change #files": function (e) {
      var files = e.target.files || e.dataTransfer.files;
      for (var i = 0, file; file = files[i]; i++) {
        if (file.type.indexOf("text") == 0) {
          var reader = new FileReader();
          reader.onloadend = function (e) {
            var text = e.target.result;
            console.log(text)
            var all = $.csv.toObjects(text);
            //console.log(all)
            _.each(all, function (entry) {
              Players.insert(entry);
            });
          }
          reader.readAsText(file);
        }
      }
    }
  });

  Template.upload.helpers({
    noEntries: function () {
       if ((Players.find().count() === 0) || (Players.find({type: {$exists: false}}).count() === 0)) {
        // If hide completed is checked, filter tasks 
          return true;
        }  
       else{
        return false;
       }
      }
    });
 }


// On server startup, create some players if the database is empty.
if (Meteor.isServer) {
    //if (Players.find().count() === 0){
    //  Session.set("noEntries", true);
    //} 
}
