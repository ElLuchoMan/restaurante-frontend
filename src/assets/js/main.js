(function ($) {
  'use strict';

  $(document).ready(function () {
    // Smooth scrolling on the navbar links
    $('.navbar-nav a').on('click', function (event) {
      if (this.hash !== '') {
        event.preventDefault();
        let target = $(this.hash);
        if (target.length) {
          $('html, body').animate(
            {
              scrollTop: target.offset().top - 45,
            },
            1500,
            'easeInOutExpo',
          );
        }
        if ($(this).parents('.navbar-nav').length) {
          $('.navbar-nav .active').removeClass('active');
          $(this).closest('a').addClass('active');
        }
      }
    });

    // Back to top button
    $(window).scroll(function () {
      $('.back-to-top').toggle($(this).scrollTop() > 100);
    });

    $('.back-to-top').click(function () {
      $('html, body').animate({ scrollTop: 0 }, 1500, 'easeInOutExpo');
      return false;
    });

    // Modal Video
    var $videoSrc;
    $('.btn-play').click(function () {
      $videoSrc = $(this).data('src');
    });

    $('#videoModal').on('shown.bs.modal', function () {
      $('#video').attr('src', $videoSrc + '?autoplay=1&modestbranding=1&showinfo=0');
    });

    $('#videoModal').on('hide.bs.modal', function () {
      $('#video').attr('src', '');
    });

    // Initialize Bootstrap Carousel
    $('#header-carousel').carousel({
      interval: 3000,
      ride: 'carousel',
    });

    // Initialize Owl Carousel safely
    if ($.fn.owlCarousel) {
      $('.service-carousel, .team-carousel').owlCarousel({
        autoplay: false,
        smartSpeed: 1500,
        margin: 30,
        dots: false,
        loop: true,
        nav: true,
        navText: [
          '<i class="fa fa-angle-left" aria-hidden="true"></i>',
          '<i class="fa fa-angle-right" aria-hidden="true"></i>',
        ],
        responsive: {
          0: { items: 1 },
          576: { items: 1 },
          768: { items: 2 },
          992: { items: 3 },
        },
      });

      $('.product-carousel').owlCarousel({
        autoplay: false,
        smartSpeed: 1500,
        margin: 30,
        dots: false,
        loop: true,
        nav: true,
        navText: [
          '<i class="fa fa-angle-left" aria-hidden="true"></i>',
          '<i class="fa fa-angle-right" aria-hidden="true"></i>',
        ],
        responsive: {
          0: { items: 1 },
          576: { items: 2 },
          768: { items: 3 },
          992: { items: 4 },
        },
      });

      $('.testimonial-carousel').owlCarousel({
        autoplay: true,
        smartSpeed: 1500,
        dots: true,
        loop: true,
        items: 1,
      });
    } else {
      console.error(
        'Owl Carousel no está cargado. Verifica que el script está incluido correctamente.',
      );
    }

    // Portfolio isotope and filter
    var $portfolioContainer = $('.portfolio-container');
    if ($portfolioContainer.length && $.fn.isotope) {
      var portfolioIsotope = $portfolioContainer.isotope({
        itemSelector: '.portfolio-item',
        layoutMode: 'fitRows',
      });

      $('#portfolio-flters li').on('click', function () {
        $('#portfolio-flters li').removeClass('active');
        $(this).addClass('active');
        portfolioIsotope.isotope({ filter: $(this).data('filter') });
      });
    }
  });
})(jQuery);
