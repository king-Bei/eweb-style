document.addEventListener('DOMContentLoaded', function() {
    var container = document.getElementById('jollify-tour-module');
    if (!container) return;

    container.addEventListener('click', function(e) {
        var dayTab = e.target.closest('.j-day-tab');
        if (dayTab && container.contains(dayTab)) {
            e.preventDefault();
            container.querySelectorAll('.j-day-tab').forEach(function(tab) {
                tab.classList.remove('is-active');
            });
            container.querySelectorAll('.j-day-panel').forEach(function(panel) {
                panel.style.display = 'none';
                panel.classList.remove('is-active');
            });
            dayTab.classList.add('is-active');
            var targetPanel = container.querySelector('#' + dayTab.dataset.target);
            if (targetPanel) {
                targetPanel.style.display = '';
                targetPanel.classList.add('is-active');
            }
            return;
        }

        var accordionHeader = e.target.closest('.j-accordion-header');
        if (accordionHeader && container.contains(accordionHeader)) {
            e.preventDefault();
            var item = accordionHeader.closest('.j-accordion-item');
            if (item) item.classList.toggle('is-active');
        }
    });
});
