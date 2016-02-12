'use strict';

if (typeof Object.create !== 'function') {
  Object.create = function(obj) {
    function F(){}
    F.prototype = obj;
    return new F();
  };
}

(function($, window, document, undefined) {

  /**
   * Helper function to list out browser support/user agent
   * @return {object} An object of boolean values
   */
  function supports() {
    return {
      ios: /iPad|iPhone|iPod/i.test(navigator.userAgent),
      android: /Android/i.test(navigator.userAgent),
      video: !!document.createElement('video').canPlayType
    };
  }

  /**
   * Ambient video
   * @type {Object}
   */
  var AmbientVideo = {
    init: function(options, elem) {
      var self = this;

      // store reference to elem
      self.elem  = elem;

      // store jquery reference to elem
      self.$elem = $(elem);

      // extend options
      self.options = $.extend({}, $.fn.ambientVideo.defaults, self.$elem.data(), options);

      if (!self.options.videoSrc) {
        throw new Error('You must include a `video-src` data-attribute');
      }

      // kick it off
      self.build();
    },

    /**
     * Build
     */
    build: function(){
      var self = this;
      var showVideo = supports().video && !supports().ios && !supports().android;

      if (showVideo) {
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
     * Insert video into DOM
     */
    insertVideo: function(){
      var self = this;

      self.video_src_html = '' +
        '<video preload="metadata" muted>' +
          '<source src="'+ self.options.videoSrc + '.webm" type="video/webm; codecs=vp8,vorbis">' +
          '<source src="'+ self.options.videoSrc + '.mp4" type="video/mp4; codecs=avc1.42E01E,mp4a.40.2">' +
        '</video>';

      // insert the full <video><source></source></video> into the element
      self.$elem.append(self.video_src_html);

      // store the video dom node so we can use html5 video methods like play/pause
      self.video_dom = self.$elem.find('video')[0];

      // store jquery version of the video node
      self.$video_dom = $(self.video_dom);

      self.$video_dom.prop({
        loop: self.options.videoLoop
      });

      self.addClass();
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

        if (typeof self.options.onComplete === 'function') {
          self.options.onComplete.apply(self.elem, arguments);
        }
      });
    },

    /**
     * Add class
     */
    addClass: function(){
      var self = this;

      if (self.options.videoClass) {
        self.$video_dom.addClass(self.options.videoClass);
      } else {
        self.$video_dom.addClass($.fn.ambientVideo.defaults.videoClass);
      }
    },

    /**
     * Load video
     */
    load: function(){
      var self = this;
      self.video_dom.load();
    },

    /**
     * Play video
     */
    play: function(){
      var self = this;

      if (self.video_dom.paused) {
        self.video_dom.play();
      }
    },

    /**
     * Pause video
     */
    pause: function(){
      var self = this;

      if (!self.video_dom.paused) {
        self.video_dom.pause();
        self.is_video_playing = false;
      }
    },

    /**
     * Toggle video playback
     */
    toggle: function(){
      var self = this;

      if (self.video_dom.paused) {
        self.play();
      } else {
        self.pause();
      }
    },

    /**
     * Start the video from the beginning
     */
    replay: function(){
      var self = this;
      self.video_dom.currentTime = 0;
      self.video_dom.play();
    },

    /**
     * Fallback
     */
    fallback: function(){
      var self = this;
      var fallback_img;

      if (self.options.videoFallback) {
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

  // Set defaults for the plugin
  $.fn.ambientVideo.defaults = {
    videoOffset: '100%',
    videoClass: 'ambient-video-wrap',
    videoFallback: null,
    videoLoop: false,
    videoSrc: null,
    onComplete: null
  };

})(jQuery, window, document);
