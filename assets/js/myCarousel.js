/**
 * Created by Vladyslav on 03.01.2016.
 * Based on http://codepen.io/barrel/pres/oBefw
 */

;(function (factory) {
  factory(jQuery);

})(function ($) {
  var Carousel = (function (element, settings) {
    /**
     * The constructor
     *
     */
    function _Carousel(element, settings) {
      this.defaults = {
        slideDuration: '3000',
        speed: 300,
        arrowRight: '.arrow-right',
        arrowLeft: '.arrow-left'
      };

      this.settings = $.extend({}, this, this.defaults, settings);

      // This object holds values that will change as the plugin operates
      this.initials = {
        currSlide: 0,
        $currSlide: null,
        totalSlides: 0,
        cssTransitions: false
      };

      // Attaches the properties of this.initials as direct properties of Zippy
      $.extend(this, this.initials);

      this.$el = $(element);

      // Ensure that the the value of 'this' always references Zippy
      this.changeSlide = $.proxy(this.changeSlide, this);

      //Initialising carousel
      this.init();
    }

    return _Carousel;
  })();

  /**
   * Called once per instance
   * Calls starter methods and associates classes
   */
  Carousel.prototype.init = function () {
    //Test to see if cssanimations are available
    this.csstransitionsTest();

    this.$el.addClass('my-carousel');

    // Build out any DOM elements needed for the plugin to run
    // Eg, we'll create an indicator dot for every slide in the carousel
    this.build();
    // Eg. Let the user click next/prev arrows or indicator dots
    this.events();
    // Bind any events we'll need for the carousel to function
    this.activate();
    // Start the timer loop to control progression to the next slide
    if (this.totalSlides > 1)
      this.initTimer();
  };

  /**
   * Test to see if CSSTransitions are available
   *
   */
  Carousel.prototype.csstransitionsTest = function () {
    var elem = document.createElement('modernizr');
    //A list of properties to test for
    var props = ["transition", "WebkitTransition", "MozTransition", "OTransition", "msTransition"];
    //Iterate through our new element's Style property to see if these properties exist
    for (var i in props) {
      var prop = props[i];
      var result = elem.style[prop] !== undefined ? prop : false;
      if (result) {
        console.log(result);
        this.csstransitions = result;
        break;
      }
    }
  };

  /**
   * Adding css animation
   */
  Carousel.prototype.addCSSDuration = function () {
    var context = this;
    this.$el.find('.slide').each(function () {
      this.style[context.csstransitions + 'Duration'] = context.settings.speed + 'ms';
    });
  };

  //Removing css animation
  Carousel.prototype.removeCSSDuration = function () {
    var context = this;

    this.$el.find('.slide').each(function () {
      this.style[context.csstransitions + 'Duration'] = '';
    })
  };

  /**
   * Build out any necessary DOM elements like slide indicators
   */
  Carousel.prototype.build = function () {
    var $indicators = this.$el.append('<ul class="indicators" >').find('.indicators');
    this.totalSlides = this.$el.find('.slide').length;

    for (var i = 0; i < this.totalSlides; i++)
      $indicators.append('<li data-index=' + i + '>');
  };

  /**
   * Activate the first slide
   */
  Carousel.prototype.activate = function () {
    this.$currSlide = this.$el.find('.slide').eq(0);
    this.$el.find('.indicators li').eq(0).addClass('active');
  };

  /**
   * Associate event handlers to events
   *
   */
  Carousel.prototype.events = function () {
    $('body')
      .on('click', this.settings.arrowRight, {direction: 'right'}, this.changeSlide)
      .on('click', this.settings.arrowLeft, {direction: 'left'}, this.changeSlide)
      .on('click', '.indicators li', {}, this.changeSlide);
  };

  /**
   * Clear timer
   */
  Carousel.prototype.clearTimer = function () {
    if (this.timer)
      clearInterval(this.timer);
  };

  /**
   * Initialize the timer
   */
  Carousel.prototype.initTimer = function () {
    this.timer = setInterval(this.changeSlide, this.settings.slideDuration);
  };

  /**
   * Start the timer
   */
  Carousel.prototype.startTimer = function () {
    this.throttle = false;
    this.initTimer()
  };

  /**
   * Returns the animation direction, right or left
   * @param e {object} event
   * @returns {string} animation direction
   * @private
   */

  Carousel.prototype._direction = function (e) {
    // Default to forward movement
    var direction = 'right';

    if (typeof e !== 'undefined' && typeof e.data !== 'undefined' && typeof e.data.direction !== 'undefined')
      direction = e.data.direction;

    return direction;
  };

  Carousel.prototype._next = function (event, direction) {
    //taking index from event(if clicked on indicator)
    var index = typeof event !== 'undefined' ? $(event.currentTarget).data('index') : undefined;

    if (typeof index !== 'undefined') {
      if (this.currSlide === index) {
        this.startTimer();
        return false;
      }
      this.currSlide = index;
    }
    else if (direction === 'right' && this.currSlide < this.totalSlides - 1)
      this.currSlide++;
    else if (direction === 'right')
      this.currSlide = 0;
    else if (direction === 'left' && this.currSlide === 0)
      this.currSlide = this.totalSlides - 1;
    else if (direction === 'left')
      this.currSlide--;

    return true;
  };

  /**
   * MAIN LOGIC HANDLER
   * Control the logic behind transitioning to the next slide
   * - Determine in what direction we need to animate
   * - Determine which slide will be active next
   * @param event {object} event
   */
  Carousel.prototype.changeSlide = function (event) {
    //Only one animation per time
    if (this.throttle)
      return;

    this.throttle = true;

    this.clearTimer();

    var direction = this._direction(event);

    var animate = this._next(event, direction);

    //if we are on slide we need
    if (!animate)
      return;

    var $nextSlide = this.$el.find('.slide').eq(this.currSlide).addClass(direction + ' active');

    if (!this.csstransitions)
      this._jsAnimation($nextSlide, direction);
    else
      this._cssAnimation($nextSlide, direction);
  };

  /**
   * Control the CSS animations
   * @param nextSlide
   * @param direction
   * @private
   */
  Carousel.prototype._cssAnimation = function (nextSlide, direction) {
    setTimeout(function () {
      this.$el.addClass('transition');
      this.addCSSDuration();
      this.$currSlide.addClass('shift-' + direction);

    }.bind(this), 100);

    setTimeout(function () {
      this.$el.removeClass('transition');
      this.removeCSSDuration();
      this.$currSlide.removeClass('active shift-left shift-right');
      this.$currSlide = nextSlide.removeClass(direction);
      this._updateIndicators();
      this.startTimer();
    }.bind(this), 100 + this.settings.speed);
  };

  /**
   * Control the JS animations
   *
   */
  Carousel.prototype._jsAnimation = function (nextSlide, direction) {
    //Cache this reference for use inside animate functions
    var context = this;

    // See CSS for explanation of .js-reset-left
    if (direction == 'right')
      context.$currSlide.addClass('js-reset-left');

    var animation = {};
    animation[direction] = '0%';

    var animationPrev = {};
    animationPrev[direction] = '100%';

    //Animation: Current slide
    this.$currSlide.animate(animationPrev, this.settings.speed);

    //Animation: Next slide
    nextSlide.animate(animation, this.settings.speed, 'swing', function () {
      //Get rid of any JS animation residue
      context.$currSlide.removeClass('active js-reset-left').attr('style', '');

      context.$currSlide = nextSlide.removeClass(direction).attr('style', '');
      context._updateIndicators();
      context.startTimer();
    });
  };

  /**
   * Update the slide indicators once each slide animation has ended
   *
   */
  Carousel.prototype._updateIndicators = function () {
    this.$el.find('.indicators li').removeClass('active').eq(this.currSlide).addClass('active');

  };

  $.fn.Carousel = function (options) {
    return this.each(function (index, el) {
      el.Carousel = new Carousel(el, options);
    });

  };
});
