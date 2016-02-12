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
      var self = this;

      // store reference to elem
      self.elem  = elem;

      // store jquery reference to elem
      self.$elem = $(elem);

      // extend options
      self.options = $.extend({}, $.fn.ambientVideo.defaults,  self.$elem.data(), options);

      if(typeof self.options.videoSrc === 'undefined') {
        throw new Error('You must include a `video-src` data-attribute');
      }

      // kick it off
      self.build();
    },

    /**
     * [build description]
     * @return {[type]} [description]
     */
    build: function(){
      var self = this;

      //check to see if browser can support html5 video
      //and whether a video src exists
      if(self.check().supports_video && self.options.videoSrc !== null && !self.check().is_iOS && !self.check().is_Android) {

        self.$elem.waypoint(function(){
          self.insertVideo();
        }, {
          offset: self.options.videoOffset,
          triggerOnce: true
        });

      } else {
        self.fallback();
      }
    },

    /**
     * [check description]
     * @return {[type]} [description]
     */
    check: function(){
      return {
        supports_video: !!document.createElement('video').canPlayType,
        is_iOS:         /iPad|iPhone|iPod/i.test(navigator.userAgent),
        is_Android:     /Android/i.test(navigator.userAgent)
      };
    },

    /**
     * [insertVideo description]
     * @return {[type]} [description]
     */
    insertVideo: function(){
      var self = this;

      self.video_src_html = '' +
        '<video preload="metadata" muted>' +
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

      self.$video_dom.prop({
        loop: self.options.videoLoop
      });

      self.baseClass();
      self.load();

      // Wait until readyState is 4 (if you don't specify a poster,
      // in IE before the video loads there will be a black box)
      // Enough data is available—and the download rate is high
      // enough—that the media can be played through to the end
      // without interruption
      //
      // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement
      function checkReadyState() {
        if (self.video_dom.readyState === 4) {
          self.$video_dom.addClass('ambient-video-loaded');
          self.play();
        } else {
          setTimeout(checkReadyState, 100);
        }
      }

      checkReadyState();

      self.$video_dom.on('ended', function(){
        self.pause();

        if(typeof self.options.onComplete === 'function') {
          self.options.onComplete.apply(self.elem, arguments);
        }
      });

    },

    /**
     * [baseClass description]
     * @return {[type]} [description]
     */
    baseClass: function(){
      var self = this;

      if(self.options.videoClass) {
        self.$video_dom.addClass(self.options.videoClass);
      } else {
        self.$video_dom.addClass($.fn.ambientVideo.defaults.videoClass);
      }
    },

    /**
     * [load description]
     * @return {[type]} [description]
     */
    load: function(){
      var self = this;
      self.video_dom.load();
    },

    /**
     * [play description]
     * @return {[type]} [description]
     */
    play: function(){
      var self = this;

      if(self.video_dom.paused) {
        self.video_dom.play();
      }
    },

    /**
     * [pause description]
     * @return {[type]} [description]
     */
    pause: function(){
      var self = this;

      if(!self.video_dom.paused) {
        self.video_dom.pause();
        self.is_video_playing = false;
      }
    },

    /**
     * [toggle description]
     * @return {[type]} [description]
     */
    toggle: function(){
      var self = this;

      if(self.video_dom.paused) {
        self.play();
      } else {
        self.pause();
      }
    },

    /**
     * [replay description]
     * @return {[type]} [description]
     */
    replay: function(){
      var self = this;
      self.video_dom.currentTime = 0;
      self.video_dom.play();
    },

    /**
     * [fallback description]
     * @return {[type]} [description]
     */
    fallback: function(){
      var self = this;
      var fallback_img;

      if (self.options.videoFallback !== null) {

        fallback_img = $('<img />')
          .attr('src', self.options.videoFallback )
          .load(function() {
            $(this).remove();
            self.$elem.css('background-image', 'url(' + self.options.videoFallback + ')');
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
