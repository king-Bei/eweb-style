document.addEventListener('DOMContentLoaded', function() {
    function prefillBespokeDestination() {
        var destination;
        try {
            destination = localStorage.getItem('jt_dest');
        } catch {
            return false;
        }
        if (!destination) return false;

        var field = document.getElementById('content_6')
            || document.querySelector('[placeholder="例如：峇里島"]');
        if (!field) return false;

        if (!String(field.value || '').trim()) {
            field.value = destination;
            field.dispatchEvent(new Event('input', { bubbles: true }));
            field.dispatchEvent(new Event('change', { bubbles: true }));
        }
        try {
            localStorage.removeItem('jt_dest');
        } catch {
            // The field is already populated; storage cleanup is optional.
        }
        return true;
    }

    if (!prefillBespokeDestination()) {
        setTimeout(prefillBespokeDestination, 400);
        setTimeout(prefillBespokeDestination, 1200);
    }

    var container = document.getElementById('jollify-tour-module');
    if (!container) return;

    container.addEventListener('click', function(e) {
        var hotelThumb = e.target.closest('.j-hotel-hero-thumb');
        if (hotelThumb && container.contains(hotelThumb)) {
            e.preventDefault();
            var nextImage = hotelThumb.getAttribute('data-hotel-image');
            var hotelCard = hotelThumb.closest('.j-hotel-hero-card');
            var mainImage = hotelCard ? hotelCard.querySelector('.j-hotel-hero-main') : null;
            if (!nextImage || !mainImage || mainImage.getAttribute('src') === nextImage) return;
            hotelCard.querySelectorAll('.j-hotel-hero-thumb').forEach(function(thumb) {
                thumb.classList.remove('is-active');
            });
            hotelThumb.classList.add('is-active');
            mainImage.classList.remove('is-switching');
            void mainImage.offsetWidth;
            mainImage.classList.add('is-switching');
            window.setTimeout(function() {
                mainImage.setAttribute('src', nextImage);
            }, 120);
            return;
        }

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
