// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection titled "articles".

Articles = new Mongo.Collection("articles");

if (Meteor.isClient) { 
  Template.leaderboard.helpers({
    articles: function () {
       //if (Session.get("showCompleted")) {
        // If hide completed is checked, filter tasks 
       // return Articles.find({type: { $exists: true }});
       // } 
       //else {
        p = Articles.findOne({type: {$exists:false}});
        console.log(p)
        Session.set("selectedArticle", p._id);   
        return [ p ];
        // Otherwise, return all of the tasks
        //return Articles.find({});
      //}
    },
    showCompleted: function () {
      return Session.get("showCompleted");
    },
    incompleteCount: function () {
        return Articles.find({ type: { $exists: false }}).count();
    },
    completeCount: function (){
        return Articles.find({type: {$exists: true}}).count();
    },
    totalCount: function(){
        return Articles.find({}).count();
    },
    percentage: function(){
      var completed = Articles.find({type: {$exists: true}}).count();
      var total = Articles.find({}).count();
      return Math.round(( completed / total ) * 100);
    },
    selectedName: function () {
      var article = Articles.findOne(Session.get("selectedArticle"));
 
      return article && article.title;
    }

  });


  Template.leaderboard.events({

    "change .show-completed input": function (event) {
      Session.set("showCompleted", event.target.checked);
    },

    'click .person': function () {
      Articles.update(Session.get("selectedArticle"), {$set: {type: "person"}});
      location.reload();
    },

    'click .org': function () {
      Articles.update(Session.get("selectedArticle"), {$set: {type: "org"}});
      location.reload();
    } 
  });

  Template.article.helpers({
    selected: function () {
      return Session.equals("selectedArticle", this._id) ? "selected" : '';
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
              Articles.insert(entry);
            });
          }
          reader.readAsText(file);
        }
      }
    }
  });

  Template.upload.helpers({
    noEntries: function () {
       if ((Articles.find().count() === 0) || (Articles.find({type: {$exists: false}}).count() === 0)) {
        // If hide completed is checked, filter tasks 
          return true;
        }  
       else{
        return false;
       }
      }
    });
 }


// On server startup, create some articles if the database is empty.
if (Meteor.isServer) {
    //if (Articles.find().count() === 0){
    //  Session.set("noEntries", true);
    //} 
}
