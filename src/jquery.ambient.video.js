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
     * Ensure `this.destroy()` is present as it prevents
     * the video from getting inserted into the DOM every time
     */
    build: function(){
      var self = this;
      var isMobile = supports().ios || supports().android;

      if (isMobile) {
        self.addFallbackImage(self.options.fallbackImg);
      } else {
        self.$elem.waypoint(function(direction) {
          self.insertVideo();
          this.destroy();
        }, {
          offset: self.options.offset
        });
      }
    },

    /**
     * Add fallback image
     * This sets the background-image of the video element
     *
     * @param {string} src The fallback image url
     */
    addFallbackImage: function(src) {
      var self = this;
      if (!src) return;
      console.log(self.options.fullScreen);
      if (self.options.fullScreen) {
        self.$elem.css('background-image', 'url(' + src + ')');
      } else {
        var img = $('<img />');
        img.attr('src', self.options.fallbackImg);
        img.appendTo(self.$elem).show();
      }
    },

    /**
     * Insert video into DOM
     */
    insertVideo: function(){
      var self = this;
      var poster = self.options.posterImg || '';

      self.video_src_html = '' +
        '<video preload="metadata" poster="' + poster + '" muted>' +
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
        loop: self.options.loop
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

      if (self.options.hideControls) {
        self.$video_dom.addClass('ambient-video--hide-controls');
      }

      if (self.options.class) {
        self.$video_dom.addClass(self.options.class);
      } else {
        self.$video_dom.addClass($.fn.ambientVideo.defaults.class);
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
    offset: '100%',
    class: 'ambient-video-wrap',
    fallbackImg: null,
    posterImg: null,
    loop: false,
    videoSrc: null,
    onComplete: null,
    hideControls: false,
    fullScreen: true
  };

})(jQuery, window, document);
