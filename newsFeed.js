;

(function( $, window, document, undefined ){

    'use strict';
    let pluginName = 'newsFeed';
    let defaultParameters = {
        speed: 150,
        direction: 'right',
        duration: 3000,
        row_height: 65,
        pauseOnHover: 1,
        autoStart: 1,
        max_row : 1,
        // function initialization...
        start: function(){},
        stop: function(){},
        pause: function(){},
        unpause: function(){},
        hasMoved: function() {},
        movingUp: function() {},
        movingDown: function() {},
        movingLeft: function(){},
        movingRight: function(){},
        getNewsFeed: function(){},


    }


//Initial check if plugin is exists or not
    $.fn[pluginName] = function(argumentList){
        let args = arguments;
        return this.each(function(){
            let $this = $(this);
            let data  = $.data(this,'plugin_'+pluginName);
            let argumentLists = typeof argumentList === 'object' && argumentList;
            if(!data){
                $this.data('plugin_'+pluginName,new runPlugin(this, argumentLists));

            }
            if( typeof argumentList === 'string' ){
                data[argumentList].apply(data, Array.prototype.slice.call(args, 1));
            }
        });
    }

    
//____________Entry point of plugin ___________
    function runPlugin(selector, parameters){
        
        this.selector = selector;
        this.$selector = $(selector);
        this.moveInterval = 3000;
        this.parameters = $.extend({},defaultParameters,parameters);
        this.state = 0;
        this.paused = 0;
        this.moving = 0;
        
            this.getNewsFeed();      //fetching news...
            if(this.$selector.is('ul,li')){
                this.initialize();
                    }
               
            
            function dateFormat(pubDate) {
                var date = new Date(pubDate);
                var months = Array("January", "February", "March", "Abril", "May", "June", "July", "Agust", "September", "Octobar", "November","December");
                return date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()
              }
       

    }

    //--------------functions ---------
    runPlugin.prototype ={

        initialize: function(){
        
            this.$selector.height(this.parameters.row_height * this.parameters.max_row).css({
                overflow: 'hidden'
            });

            this.checkSpeed();
           
            if(this.parameters.pauseOnHover){
                this.$selector.hover(function(){
                    if(this.state){
                        this.pause();
                    }
                }.bind(this), function(){
                    if(this.state){
                        this.unpause();
                    }
                }.bind(this));
            }     
            if(this.parameters.autoStart){
               this.start(); 
            }
        },

        start: function(){
           let  count = 0;
           if(! this.state ){
               this.state = 1;
               this.resetInterval();
               this.parameters.start();
               
           }
        },
        resetInterval: function(){
            if(this.state){
                clearInterval(this.moveInterval);
                this.moveInterval = setInterval( function(){
                    this.move()
                }.bind(this),this.parameters.duration);
            }
        },
        move: function() {
            if (!this.paused) this.moveNext();
         },

        moveNext: function() {
                if (this.parameters.direction === 'down'){
                    this.moveDown();
                }
                else if (this.parameters.direction === 'up'){
                    this.moveUp();
                }
                else if (this.parameters.direction === 'left'){
                    this.moveLeft();
                }else if ( this.parameters.direction === 'right'){
                    this.moveRight();
                }        
        },
        moveDown: function() {
                if (!this.moving) {
                        this.moving = 1;
                        this.parameters.movingDown();
                         let des = this.$selector.children('li:last');
                            $('.fnf-newsTicker-show-news-description').html(des.text());
                        
                        this.$selector.children('li:last').detach().prependTo(this.$selector).css('marginTop', '-' + this.parameters.row_height + 'px')
                                .animate({
                                    marginTop: '0px'}, this.parameters.speed, function(){
                                        this.moving = 0;
                                        this.parameters.hasMoved();
                                }.bind(this));

                }
        },

        moveUp: function() {
                if (!this.moving) {
                        this.moving = 1;
                        this.parameters.movingUp();
                        var element = this.$selector.children('li:first');
                        $('.fnf-newsTicker-show-news-description').html(element.text());
                        
                        element.animate({
                            marginTop: '-' + this.parameters.row_height + 'px'}, this.parameters.speed,
                                function(){
                                        element.detach().css('marginTop', '0px').appendTo(this.$selector);
                                        this.moving = 0;
                                        this.parameters.hasMoved();
                                }.bind(this));
                }
        },

        moveLeft: function(){
         
                if(!this.moving){
                    this.moving = 1;
                    this.parameters.movingLeft();
                    let element = this.$selector.children('li:first');
                    $('.fnf-newsTicker-show-news-description').html(element.text());
                    element.animate({
                        marginLeft: '-' + this.getDivWidthForDisplayingNews() + 'px'
                    }, this.parameters.speed,
                   function(){
                        element.detach().css('marginLeft','0px').appendTo(this.$selector);
                        this.moving = 0;
                        this.parameters.hasMoved();
                    }.bind(this));
                }
        },
        moveRight: function(){

          if(!this.moving){
              
              this.moving = 1;
              this.parameters.movingRight();
              let element =  this.$selector.children('li:first');
              $('.fnf-newsTicker-show-news-description').html(element.text());
              element.animate({
                  marginLeft: '+' + this.getDivWidthForDisplayingNews() + 'px'
              },this.parameters.speed,
            function(){
                element.detach().css('marginLeft','0px').appendTo(this.$selector);
                this.moving = 0;
                this.parameters.hasMoved();
                
            }.bind(this));
          }
        },
        pause: function(){
            if(!this.paused){
                this.paused = 1;
                this.parameters.pause();
            }
        },
        unpause: function(){
            if(this.paused){
                this.paused = 0;
                this.parameters.unpause();
            }    
        },
        checkSpeed: function() {
            if (this.parameters.duration < (this.parameters.speed + 25))
                    this.parameters.speed = this.parameters.duration - 25;
        },
        getDivWidthForDisplayingNews: function(){
           return $('#fnf-newsTicker-layout2-right-div').width();
        },
        getNewsFeed: function(){
            
            //feed to parse
        let feed = "https://cors-anywhere.herokuapp.com/"+ "http://feeds.bbci.co.uk/news/world/rss.xml";
        
              
                    $('.fnf-newsTicker-show-news').html('<li class="fnf-news-headline">News Loading...</li>');
                    console.log('News fetching...');
                    $.ajax(feed, {
                        accepts:{
                            xml:"application/rss+xml"
                        },
                        headers: {
                            'Access-Control-Allow-Origin': '*'
                        },
                        dataType:"xml",
                        success:function(data) {
                            console.log(data + 'News fetching...');
                          let newsCollection = [], title, link;
                          let newsDescription = [];
                            $(data).find("item").each(function () { 
                                 this.title = $(this).find("title").text();
                                 this.link  = $(this).find("link").text();
                                 this.description = $(this).find("description").text();   
                                newsCollection.push('<li class="description"><a href="'+this.link+'" class="fnfnewstitle">'+this.title+'</a>'+this.description+'</li>');
                                //newsDescription.push(this.description);
                            });

                            $('.fnf-newsTicker-show-news').html(newsCollection);
                
                        },
                        error:function(error){
                           // console.log(error);
                        }
                            
                    });
        },

    }

})(jQuery, window, document);