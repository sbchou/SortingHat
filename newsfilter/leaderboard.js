// Set up a collection to contain article information. On the server,
// it is backed by a MongoDB collection titled "articles".

Articles = new Mongo.Collection("articles");
Labels = new Mongo.Collection("labels");



if (Meteor.isClient) { 
  var width = $(window).width() - 25; 
  $("#outer").width(width);


  Meteor.subscribe('theArticles');
  Meteor.subscribe('theLabels');

  globalHotkeys = new Hotkeys();

  // LEFT KEY MEANS NO NO MEANS NO
  globalHotkeys.add({
    combo : "left",
    callback : function () {
      $('.no').css("background-color", "#4099FF");
      $('.no').css("color", "#fff");
      setTimeout( function (){  
        $('.no').trigger('click'); 
      }, 200);
    }
  })

  globalHotkeys.add({
    combo : "right",
    callback : function () {
      $('.yes').css("background-color", "#4099FF");
      $('.yes').css("color", "#fff");
      setTimeout( function (){  
        $('.yes').trigger('click'); 
      }, 200);
    }
  })

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

    numTrue: function(){
      return Labels.find({'user_id':Meteor.userId(), user_label : 1}).count();
    },
    numFalse: function(){
      return Labels.find({'user_id':Meteor.userId(), user_label : 0}).count();
    },

    numMachineTrue: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$gt: 50}}).count();
    },


    numMachineFalse: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$lt: 50}}).count();
    },

    falseNegCount: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$lt: 50}, user_label: 1}).count();
    },

    falsePosCount: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$gt: 50}, user_label: 0}).count();
    },


    falseNeg: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$lt: 50}, user_label: 1});
    },

    falsePos: function(){
      return Labels.find({'user_id':Meteor.userId(), article_conf : {$gt: 50}, user_label: 0});
    },

    
    //all of your answers
    results: function(){ 

      //var labels = Labels.find({'user_id': Meteor.userId()}, 
      //  {$sort: { timestamp: -1 }, skip:0, limit: 10}); 
      var labels = Labels.find({'user_id': Meteor.userId()}); 
      return labels;
    },

    //all of sorting hat's answers
    machineResults: function(){  
      //var values = Labels.find({'user_id': Meteor.userId()}, {fields : {'article_conf':1}}, {$sort: { timestamp: -1 }, skip:0, limit: 10}).map(function(x) { return x.article_conf;});
      var values = Labels.find({'user_id': Meteor.userId()}, {fields : {'article_conf':1}}).map(function(x) { return x.article_conf;});
 
      // can't do list comprehensions
      var bools = []
      // map function still returns all, so i cut it here
      for (var i = 0; i < values.length; i++) {
           bools.push(values[i] > 50);
      } 
      return bools;
    }
 

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
              entry.label_ids = []; // references to labels
              entry.labels = []; // add labels array
              entry.user_ids = [];
              entry.confidence = Math.floor(parseFloat(entry.election_confidence) * 100); 
               //FUCKING DOUBLE QUOTES FOR JSON
              
              entry.people = entry.people.replace(/'/g, "\"");
              entry.people = entry.people.replace("O\"Malley", "O'Malley")
              console.log(entry.people)
              entry.people = JSON.parse(entry.people); 


              
              entry.orgs = JSON.parse(entry.orgs.replace(/'/g, "\"")); 

              var body = entry.body.trim();
              var people = entry.people;  
              for (i = 0; i < people.length; i++){
                var names = people[i].split(" ");
                for (j = 0; j < names.length; j++){
                  var re = new RegExp(names[j],"g");
                  body = body.replace(re, '<b><font color="blue">'+ names[j] +'</font></b>');
                }
              }  

              var orgs = entry.orgs; 
              for (i = 0; i < orgs.length; i++){  
                var re = new RegExp(orgs[i], "g");
                body = body.replace(re, '<b><font color="green">' + orgs[i] + '</font></b>'); 
              }  
              entry.body = body; 
               
              Articles.insert(entry);

            });
          }
          reader.readAsText(file);
        }
      }
    },

    'click .yes': function () {

      id = Date.now().toString().substr(4);
      article_title = Articles.find( {_id:Session.get("selectedArticle")}).map(function(x) { return x.title;});
      article_conf = Articles.find( {_id:Session.get("selectedArticle")}, {fields: {'confidence': 1}}).map(function(x) {return x.confidence;}); 
 
      Labels.insert({
        _id : id,
        article_id : Session.get("selectedArticle"),
        article_title: article_title[0],
        article_conf: article_conf[0],
        user_id : Meteor.userId(),
        timestamp : Date.now(),
        user_label: 1

      }); 

      //add this user and this label to the article
      Articles.update(Session.get("selectedArticle"),
       {$push: {'label_ids': id, 'labels': 1, 'user_ids': Meteor.userId()}
      });

      $("#leaderboard").load(location.href + " #leaderboard");
    },
 

    'click .no': function () {

      id = Date.now().toString().substr(4);

      article_title = Articles.find( {_id:Session.get("selectedArticle")}).map(function(x) { return x.title;});

      console.log(article_title);

      article_conf = Articles.find( {_id:Session.get("selectedArticle")}, {fields: {'confidence': 1}}).map(function(x) {return x.confidence;});

      console.log(article_conf);
      
 
      Labels.insert({
        _id : id,
        article_id : Session.get("selectedArticle"),
        article_title: article_title[0],
        article_conf: article_conf[0],
        user_id : Meteor.userId(),
        timestamp : Date.now(),
        user_label: 0

      }); 

      //add this user and this label to the article
      Articles.update(Session.get("selectedArticle"),
       {$push: {'label_ids': id, labels: 0, 'user_ids': Meteor.userId()}
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

// On server startup, create some articles if the database is empty
if (Meteor.isServer) {
     if (Articles.find().count() === 0) {
          console.log("Importing private/products.json to db")
          //stop hardcode...
          var data = JSON.parse(Assets.getText("20.json"));

          data.forEach(function (item, index, array) { 
              item.label_ids = []; // add labels array
              item.user_ids = [];
              item.confidence = Math.floor(parseFloat(item.election_confidence) * 100); 
              //FUCKING DOUBLE QUOTES FOR JSON
              console.log(item.people)
              
              var body = item.body.trim();
              var people = item.people;  
              for (i = 0; i < people.length; i++){
                var names = people[i].split(" ");
                for (j = 0; j < names.length; j++){
                  var re = new RegExp(names[j],"g");
                  body = body.replace(re, '<b><font color="blue">'+ names[j] +'</font></b>');
                }
              }  

              var orgs = item.orgs; 
              for (i = 0; i < orgs.length; i++){  
                var re = new RegExp(orgs[i], "g");
                body = body.replace(re, '<b><font color="green">' + orgs[i] + '</font></b>'); 
              }  
              item.body = body; 
              Articles.insert(item);
          })
      }

    Meteor.publish('theArticles', function(){
      var currentUserId = this.userId; 
      //return Articles.find({}); 
      return Articles.find({'user_id':{$ne : currentUserId}, body:{$ne:''}}, {skip:0, limit: 20}); 
    });

    Meteor.publish('theLabels', function(){
      var currentUserId = this.userId;
      return Labels.find({});
    });
}
