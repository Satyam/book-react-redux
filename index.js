jQuery(function($){ // on document load
  $('pre code.language-html').each(function(i, block) {
    const b = $(this);
    b.text(b.html());
  });
  $('pre code').each(function(i, block) {
    hljs.highlightBlock(block);
  });
  $('a').each(function(i, block) {
    const a = $(this);
    const href = a.attr('href');
    a.html(a.html() + '<span class="href">(' + href + ')</span>');
  });
  var $toc = $('.toc');
  var $contents = $('.contents');
  $toc.ddscrollSpy({spyTarget: $contents});
  $('.close').on('click', function(ev) {
    var c = $(this);
    if ($contents.hasClass('unfolded')) {
      $toc.hide();
      c.text('open >');
    } else {
      $toc.show();
      c.text('< close');
    }
    $contents.toggleClass('unfolded');
  })
})
