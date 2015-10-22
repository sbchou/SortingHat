// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection titled "articles".

Articles = new Mongo.Collection("articles");

if (Meteor.isClient) { 
  Meteor.subscribe('theArticles');

  Template.leaderboard.helpers({

    articles: function () {
      var currentUserId = Meteor.userId(); 
      // objects we haven't labeled yet. does this work?
      //IF NO MORE LEFT
      p = Articles.findOne({'body':{$ne:''}, 'labels.userid':{$ne:currentUserId}});
      if(typeof p === 'undefined'){
        console.log('NO MORE ARTICLES');
        allDone = true;
        return [];
      }
      else{      
        Session.set("selectedArticle", p._id);   
        return [ p ];
      }
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
        return Articles.find({'labels.userid':{$ne : Meteor.userId()}, body:{$ne:''}}).count();
    },
    completeCount: function (){
        return Articles.find({'labels.userid': Meteor.userId()}).count()    },
    totalCount: function(){
        return Articles.find({'body':{$ne:''}}).count();
    },
    percent_complete: function(){
      var completed = Articles.find({'labels.userid': Meteor.userId()}).count();
      var total = Articles.find({'body':{$ne:''}}).count();
      return Math.round(( completed / total ) * 100);
    },
    percent_remain: function(){
      var incompleted = Articles.find({'labels.userid':{$ne : Meteor.userId()}, body:{$ne:''}}).count();
      var total = Articles.find({}).count();
      return Math.round(( incompleted / total ) * 100);
    },
    selectedName: function () {
      var article = Articles.findOne(Session.get("selectedArticle"));
 
      return article && article.title;
    },
    
    numTrue: function(){
      return Articles.find({'labels.userid':Meteor.userId(), 'labels.label':'Yes'}).count();
    },
    numFalse: function(){
      return Articles.find({'labels.userid':Meteor.userId(), 'labels.label':'No'}).count();
    },

    results: function(){
      console.log(Articles.findOne({'labels.userid':Meteor.userId()}, {title:1}));
      return Articles.find({'labels.userid':Meteor.userId()}, 
        {fields : {'title':1, 'labels':1, 'confidence':1}});

    }

  });


  Template.leaderboard.events({

    'click .yes': function () {
      Articles.update(Session.get("selectedArticle"),
       {$push: {'labels': {userid: Meteor.userId(), username: Meteor.user().profile['name'], label: 'Yes'}}});
        $("#leaderboard").load(location.href + " #leaderboard");
    },
 

    'click .no': function () {
      Articles.update(Session.get("selectedArticle"), 
       {$push: {'labels': {userid: Meteor.userId(), username: Meteor.user().profile['name'], label: 'No'}}});
        $("#leaderboard").load(location.href + " #leaderboard");
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
              entry.labels = []; // add labels array
              entry.confidence = Math.floor(parseFloat(entry.election_news_confidence) * 100);
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
       if ((Articles.find().count() === 0) && Meteor.user().profile['name'] === 'Sophie Chou') {
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

    Meteor.publish('theArticles', function(){
      var currentUserId = this.userId;
      return Articles.find({});
    });
    //if (Articles.find().count() === 0){
    //  Session.set("noEntries", true);
    //} 
}
