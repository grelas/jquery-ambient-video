'use strict';

if(typeof Object.create !== 'function') {
  Object.create = function(obj) {
    function F(){}
    F.prototype = obj;
    return new F();
  };
}


(function($, window, document, undefined) {
  var AmbientVideo = {
    init: function(options, elem) {

      // cache this
      var self = this;

      // store reference to elem
      self.elem  = elem;

      // store jquery reference to elem
      self.$elem = $(elem);

      // extend options
      self.options = $.extend({}, $.fn.ambientVideo.defaults,  self.$elem.data(), options);

      console.log('data attributes: ');
      console.log(self.$elem.data());
      console.log('------------------');
      console.log(' user passed options: ');
      console.log(options);
      console.log('------------------');
      console.log(' combined options ');
      console.log(self.options);
      console.log('------------------');

      if(typeof self.options.videoSrc === 'undefined') {
        console.log('-- div does not have a `video-src` data-attribute ');
      }

      // kick it off
      self.build();
    },

    build: function(){
      console.log('BUILD VIDEO');
      var self = this;

      //check to see if browser can support html5 video
      //and whether a video src exists
      if(self.check().supports_video && self.options.videoSrc !== null && !self.check().is_iOS && !self.check().is_Android) {

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

      self.video_src_html = '<video preload="metadata" muted>' +
                            '<source src="'+ self.options.videoSrc + '.webm" type="video/webm; codecs=vp8,vorbis">' +
                            '<source src="'+ self.options.videoSrc + '.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2">' +
                            '</video>';

      // html5 video
     // self.video_html = '<video preload muted>' + self.video_src_html + '</video>';

      // insert the full <video><source></source></video> into the element{
      self.$elem.append(self.video_src_html);
      //self.$elem.html(self.video_html);

      // store the video dom node so we can use html5 video methods like play/pause
      self.video_dom = self.$elem.find('video')[0];

      // store jquery version of the video node
      self.$video_dom = $(self.video_dom);

      // Disable visibility, while loading
      //self.$video_dom.css("visibility", "hidden");

      // check to see if video should loop
      // if(self.options.videoLoop) {
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

      // Wait until readyState is 4 (if you don't specify a poster, in IE before the video loads there will be a black box)
      // Enough data is available—and the download rate is high enough—that the media can be played through to the end without interruption
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
      function checkReadyState() {
        console.log(self.video_dom.readyState);

        if (self.video_dom.readyState === 4) {
          console.log('readystate === 4');
          self.$video_dom.addClass('ambient-video-loaded');
          self.play();
        } else {
          setTimeout(checkReadyState, 100);
        }
      }

      checkReadyState();

      // self.$video_dom.on('loadeddata', function(){
      //   console.log('video loadeddata loaded');
      //   self.$video_dom.addClass('ambient-video-loaded');
      // });

      // self.$video_dom.on('loadedmetadata', function(){
      //   console.log('video loadedmetadata loaded');

      // });

      // self.$video_dom.on('canplaythrough', function(){
      //   console.log('video canplaythrough loaded');
      //   self.$video_dom.addClass('ambient-video-loaded');
      //   self.play();
      // });


      self.$video_dom.on('ended', function(){
        console.log('video ended');

        self.pause();
        console.log(self.video_dom.paused);

        if(typeof self.options.onComplete === 'function') {
          self.options.onComplete.apply(self.elem, arguments);
        }
      });

    },

    baseClass: function(){
      var self = this;

      if(self.options.videoClass) {
        self.$video_dom.addClass(self.options.videoClass);
      } else {
        self.$video_dom.addClass($.fn.ambientVideo.defaults.videoClass);
      }
    },

    load: function(){
      console.log(' -- load video');
      var self = this;
      self.video_dom.load();
    },

    play: function(){
      var self = this;

      if(self.video_dom.paused) {
        console.log(' -- play video');
        self.video_dom.play();
      }
    },

    pause: function(){
      var self = this;

      if(!self.video_dom.paused) {
        console.log(' -- pause video');
        self.video_dom.pause();
        self.is_video_playing = false;
      }
    },

    toggle: function(){
      var self = this;
      if(self.video_dom.paused) {
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

      var self = this,
          fallback_img;

      if(self.options.videoFallback !== null) {

        fallback_img = $('<img />')
          .attr('src', self.options.videoFallback )
          .load(function() {
              if(!this.complete || typeof this.naturalWidth === 'undefined' || this.naturalWidth === 0) {
                  console.log('broken image!');
              } else {
                $(this).remove();
                self.$elem.css('background-image', 'url(' + self.options.videoFallback + ')');
              }
          });
      }
    }
  };


  $.fn.ambientVideo = function(options) {

    // return this to maintain jquery chaining
    return this.each(function(){

      // create a new AmbientVideo object via Object.create
      var video = Object.create(AmbientVideo);

      // run the initialzation function of the AmbientVideo object
      video.init(options, this);


      // Save the instance of the video object in the element's data store
      $.data(this, 'ambientVideo', video);
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

})(jQuery, window, document);