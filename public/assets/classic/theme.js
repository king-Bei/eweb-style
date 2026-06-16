$(document).ready(function(){
    var container = $('#jollify-tour-module');
    if(container.length === 0) return;
    container.on('click', '.j-day-tab', function(e){
        e.preventDefault();
        container.find('.j-day-tab').removeClass('is-active');
        container.find('.j-day-panel').hide().removeClass('is-active');
        $(this).addClass('is-active');
        var targetPanel = container.find('#' + $(this).data('target'));
        if(targetPanel.length) { targetPanel.show().addClass('is-active'); }
    });
    container.on('click', '.j-accordion-header', function(e){
        e.preventDefault();
        var item = $(this).closest('.j-accordion-item');
        item.toggleClass('is-active');
    });
});
