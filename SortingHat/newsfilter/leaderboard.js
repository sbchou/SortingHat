// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection titled "articles".

Articles = new Mongo.Collection("articles");
Labels = new Mongo.Collection("labels");

if (Meteor.isClient) { 
  Meteor.subscribe('theArticles');
  Meteor.subscribe('theLabels');

  Template.leaderboard.helpers({

    articles: function () {
      var currentUserId = Meteor.userId(); 
      // objects we haven't labeled yet. does this work?
      //IF NO MORE LEFT
      p = Articles.findOne({'body':{$ne:''}, 'user_ids':{$ne:currentUserId}});
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

    isAdmin: function(){
      return (Meteor.user().profile['name'] === 'Sophie Chou');
    },
 
    noEntries: function () {
     return (Articles.find().count() === 0);
    },

    allDone: function (){
    return Articles.find({'user_ids':{$ne : Meteor.userId()}, body:{$ne:''}}).count() === 0;
    },

    selectedArticle: function () {
      var article = Articles.findOne(Session.get("selectedArticle"));
 
      return article && article.title;
    },
    completeCount: function (){
      return Articles.find({'user_ids': Meteor.userId()}).count()
    },
    percent_complete: function(){
      var completed = Articles.find({'user_ids': Meteor.userId()}).count();
      var total = Articles.find({'body':{$ne:''}}).count();
      return Math.round(( completed / total ) * 100);
    },

    /*
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
    */

  });


  Template.leaderboard.events({
    // for the file uploader
    "change #files": function (e) {
      var files = e.target.files || e.dataTransfer.files;
      for (var i = 0, file; file = files[i]; i++) {
        if (file.type.indexOf("text") == 0) {
          var reader = new FileReader();
          reader.onloadend = function (e) {
            var text = e.target.result;  
            var all = $.csv.toObjects(text);  
            _.each(all, function (entry) {
              entry.label_ids = []; // add labels array
              entry.user_ids = [];
              entry.confidence = Math.floor(parseFloat(entry.election_news_confidence) * 100);
              Articles.insert(entry);
            });
          }
          reader.readAsText(file);
        }
      }
    },

    'click .yes': function () {

      id = Date.now().toString().substr(4);

      Labels.insert({
        _id : id,
        article_id : Session.get("selectedArticle"),
        user_id : Meteor.userId(),
        timestamp : Date.now(),
        is_election: 1
      });

      console.log(id);
      //add this user and this label to the article
      Articles.update(Session.get("selectedArticle"),
       {$push: {'label_ids': id, 'user_ids': Meteor.userId()}
      });

      $("#leaderboard").load(location.href + " #leaderboard");
    },
 

    'click .no': function () {

      id = Date.now().toString().substr(4);

      Labels.insert({
        _id : id,
        article_id : Session.get("selectedArticle"),
        user_id : Meteor.userId(),
        timestamp : Date.now(),
        is_election: 0
      });

      console.log(id);
      //add this user and this label to the article
      Articles.update(Session.get("selectedArticle"),
       {$push: {'label_ids': id, 'user_ids': Meteor.userId()}
      });

      $("#leaderboard").load(location.href + " #leaderboard");
    }
  });

  Template.article.helpers({
    selected: function () {
      return Session.equals("selectedArticle", this._id) ? "selected" : '';
    }
  });  
   
 }

//return Articles.find({type: {$exists: true}}).count();

// On server startup, create some articles if the database is empty
if (Meteor.isServer) {

    Meteor.publish('theArticles', function(){
      var currentUserId = this.userId;
      return Articles.find({});
    });

    Meteor.publish('theLabels', function(){
      var currentUserId = this.userId;
      return Labels.find({});
    });
}
