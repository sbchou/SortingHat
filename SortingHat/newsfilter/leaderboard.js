// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection titled "articles".

Articles = new Mongo.Collection("articles");

if (Meteor.isClient) { 
  Template.leaderboard.helpers({
    articles: function () {
      var currentUserId = Meteor.userId();
      p = Articles.findOne({type: {$exists:false}, 
                body: {"$exists" : true, "$ne" : ""}});
      console.log(p)
      Session.set("selectedArticle", p._id);   
      return [ p ];

    },

    /*
    'player': function(){
      var currentUserId = Meteor.userId();
      return PlayersList.find({createdBy: currentUserId},
                              {sort: {score: -1, name: 1}});
    },
    */
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
    percent_complete: function(){
      var completed = Articles.find({type: {$exists: true}}).count();
      var total = Articles.find({}).count();
      return Math.round(( completed / total ) * 100);
    },
    percent_remain: function(){
      var incompleted = Articles.find({type: {$exists: false}}).count();
      var total = Articles.find({}).count();
      return Math.round(( incompleted / total ) * 100);
    },
    selectedName: function () {
      var article = Articles.findOne(Session.get("selectedArticle"));
 
      return article && article.title;
    },
    allDone: function () {
      if (Articles.find({type: {$exists:false}}).count() === 0) {
      // If hide completed is checked, filter tasks 
      return true;
      }  
     else{
      return false;
     }
    },
    
    numTrue: function(){
      return Articles.find({type: 'yes'}).count(); 
    },
    numFalse: function () {
      return Articles.find({type: 'no'}).count();       
    },
    results: function(){
      return Articles.find({})
    }

  });


  Template.leaderboard.events({

    "change .show-completed input": function (event) {
      Session.set("showCompleted", event.target.checked);
    },

    'click .yes': function () {
      Articles.update(Session.get("selectedArticle"), {$set: {type: "yes"}});
      location.reload();
    },
 

    'click .no': function () {
      Articles.update(Session.get("selectedArticle"), 
       {$push: {'labels': {id: 5, name: 'item5'}}});
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
            var all = $.csv.toObjects(text);  
            _.each(all, function (entry) {
              entry.labels = [];
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
       if ((Articles.find().count() === 0)) {
        // If hide completed is checked, filter tasks 
          return true;
        }  
       else{
        return false;
       }
      }
    }); 
   
 }

//return Articles.find({type: {$exists: true}}).count();

// On server startup, create some articles if the database is empty.
if (Meteor.isServer) {
    //if (Articles.find().count() === 0){
    //  Session.set("noEntries", true);
    //} 
}
