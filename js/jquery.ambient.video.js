/*
 *  jQuery Ambient Video v1.0.0
 *  Author: Greg LaSpina
 *
 */

if( typeof Object.create !== 'function' ) {
  Object.create = function( obj ) {
    function F(){};
    F.prototype = obj;
    return new F();
  };
}

(function( $, window, document, undefined ){
  'use strict';

  var AmbientVideo = {
    init: function( options, elem ){

      // cache this
      var self = this;

      // store reference to elem (i.e. <div id="video"></div>)
      self.elem  = elem;

      // store jquery reference to elem
      self.$elem = $( elem );

      // extend options
      self.options = $.extend( {}, $.fn.ambientVideo.defaults,  self.$elem.data(), options );

      console.log('data attributes: ');
      console.log( self.$elem.data() );
      console.log('------------------');
      console.log(' user passed options: ');
      console.log( options );
      console.log('------------------');
      console.log(' combined options ');
      console.log( self.options );
      console.log('------------------');

      if( typeof self.options.videoSrc === 'undefined' ) {
        console.log( '-- div does not have a `video-src` data-attribute ');
      }

      // kick it off
      self.build();
    },

    build: function(){
      console.log('BUILD VIDEO');
      var self = this;

      //check to see if browser can support html5 video
      //and whether a video src exists
      if( self.check().supports_video && self.options.videoSrc !== null && !self.check().is_iOS && !self.check().is_Android ) {

        self.$elem.waypoint(function(){
          console.log(' -- insert video');
          self.insertVideo();
        }, { 
          offset: self.options.videoOffset,
          triggerOnce: true
        });

      } else {
        self.fallback();
      }

    },

    check: function(){
      return {
        supports_video: !!document.createElement('video').canPlayType,
        is_iOS:         /iPad|iPhone|iPod/i.test(navigator.userAgent),
        is_Android:     /Android/i.test(navigator.userAgent)
      };
    },

    insertVideo: function(){
      var self = this;

      self.video_src_html = '<video preload muted>' +
                            '<source src="'+ self.options.videoSrc + '.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2">' +
                            '<source src="'+ self.options.videoSrc + '.webm" type="video/webm; codecs=vp8,vorbis">' + 
                            '</video>';
      
      console.log( self.video_src_html );
      // html5 video 
     // self.video_html = '<video preload muted>' + self.video_src_html + '</video>';
      
      // insert the full <video><source></source></video> into the element{
      self.$elem.html( self.video_src_html );
      //self.$elem.html( self.video_html );
    
      // store the video dom node so we can use html5 video methods like play/pause
      self.video_dom = self.$elem.find('video')[0];

      // store jquery version of the video node
      self.$video_dom = $( self.video_dom );

      // Disable visibility, while loading
      //self.$video_dom.css("visibility", "hidden");
      
      // check to see if video should loop
      // if( self.options.videoLoop ){
      //   console.log(' -- video should loop');
      //   self.video_dom.loop = true;
      // } else {
      //   console.log(' -- video should NOT loop');
      // }

      self.$video_dom.prop({
        loop: self.options.videoLoop
      });

      self.baseClass();
      self.load();
      self.play();

      self.$video_dom.on('loadedmetadata', function(){
        console.log( 'video loadedmetadata loaded');
        self.$video_dom.addClass('ambient-video-loaded');
      });

      // when the video ends
      // if( typeof self.options.onComplete === 'function' ) {
      //   self.video_dom.addEventListener( 'ended', self.options.onComplete, false );
      // }

      self.video_dom.addEventListener( 'ended', function(){
        console.log('video ended');
        // if( self.options.videoLoop ) {
        //   self.restart();
        // }
        if( typeof self.options.onComplete === 'function' ) {
          self.options.onComplete.apply( self.elem, arguments );
        }
      }, false );

    },

    // restart: function(){
    //   var self = this;

    //   self.currentTime = 0.1;
    //   self.play();
    // },

    baseClass: function(){
      var self = this;

      if( self.options.videoClass ) {
        self.$video_dom.addClass( self.options.videoClass );
      } else {
        self.$video_dom.addClass( $.fn.ambientVideo.defaults.videoClass );
      }
    },

    load: function(){
      console.log(' -- load video');
      var self = this;
      self.video_dom.load();
    },

    play: function(){
      var self = this;

      if( self.video_dom.paused ){
        console.log(' -- play video');
        self.video_dom.play();
      }
    },

    pause: function(){
      var self = this;
      
      if( !self.video_dom.paused ){
        console.log(' -- pause video');
        self.video_dom.pause();
        self.is_video_playing = false;
      }
    },

    toggle: function(){
      var self = this;
      if( self.video_dom.paused ){
        self.play();
      } else {
        self.pause();
      }
    },

    replay: function(){
      console.log(' -- replay video');
      var self = this;
      self.video_dom.currentTime = 0;
      self.video_dom.play();
    },

    fallback: function(){
      console.log('show fallback');
      var self = this;

      if( self.options.videoFallback !== null ) {
        $.get(self.options.videoFallback).done(function () {
          self.$elem.css("background-image", "url(" + self.options.videoFallback + ")");
        });
      }
    }
  };
    
  
  $.fn.ambientVideo = function( options ){

    // return this to maintain jquery chaining
    return this.each(function(){

      // create a new AmbientVideo object via Object.create
      var video = Object.create( AmbientVideo );

      // run the initialzation function of the AmbientVideo object
      video.init( options, this );


      // Save the instance of the video object in the element's data store
      $.data( this, 'ambientVideo', video );
    });
  };

  $.fn.ambientVideo.defaults = {
    videoOffset: '100%',
    videoClass:  'ambient-video-wrap',
    videoFallback: null,
    videoLoop:   false,
    videoSrc:    null,
    onComplete:  null
  };

})( jQuery, window, document );