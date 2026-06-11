/* ==========================================================================
   Arelio — Shopify storefront behaviour
   - AJAX add-to-cart for the offer buttons (falls back to a normal form
     submit if anything goes wrong, so the buttons always work).
   - A small toast confirmation.
   - Tries to refresh Dawn's cart bubble / cart drawer without depending on
     Dawn internals, so it never breaks the theme if those elements change.
   Loaded once per page; guarded against double initialisation.
   ========================================================================== */
(function () {
  if (window.__arelioInit) return;
  window.__arelioInit = true;

  /* ----- Toast ----- */
  var toast;
  function showToast(message) {
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'arelio-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    // force reflow so the transition replays on rapid clicks
    void toast.offsetWidth;
    toast.classList.add('show');
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      toast.classList.remove('show');
    }, 1900);
  }

  /* ----- Refresh Dawn's cart UI (best effort) ----- */
  function refreshCartUI() {
    // Update the header cart count bubble(s) used by Dawn.
    fetch(window.Shopify && window.Shopify.routes ? window.Shopify.routes.root + 'cart.js' : '/cart.js', {
      headers: { Accept: 'application/json' }
    })
      .then(function (r) { return r.json(); })
      .then(function (cart) {
        var count = cart.item_count;
        document.querySelectorAll('.cart-count-bubble span[aria-hidden="true"], .cart-count-bubble span:first-child')
          .forEach(function (el) { el.textContent = count; });

        // If Dawn's cart-icon-bubble is hidden when empty, reveal it.
        var bubbleHost = document.getElementById('cart-icon-bubble');
        if (bubbleHost && count > 0 && !bubbleHost.querySelector('.cart-count-bubble')) {
          // Pull a fresh rendering of the bubble section if available.
          fetch((window.Shopify && window.Shopify.routes ? window.Shopify.routes.root : '/') +
            '?section_id=cart-icon-bubble')
            .then(function (res) { return res.text(); })
            .then(function (html) { bubbleHost.innerHTML = html; })
            .catch(function () {});
        }
      })
      .catch(function () {});
  }

  /* ----- Open Dawn's cart drawer if present ----- */
  function maybeOpenDrawer() {
    var drawer = document.querySelector('cart-drawer');
    if (drawer && typeof drawer.open === 'function') {
      try { drawer.open(); } catch (e) {}
    }
  }

  /* ----- AJAX add-to-cart ----- */
  document.addEventListener('submit', function (event) {
    var form = event.target;
    if (!form.classList || !form.classList.contains('arelio-add-form')) return;

    event.preventDefault();

    var button = form.querySelector('[type="submit"]');
    var original = button ? button.textContent : '';
    if (button) { button.disabled = true; button.textContent = 'Adding…'; }

    fetch(form.action + (form.action.indexOf('.js') === -1 ? '.js' : ''), {
      method: 'POST',
      headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: new FormData(form)
    })
      .then(function (response) {
        if (!response.ok) throw new Error('add failed');
        return response.json();
      })
      .then(function (item) {
        showToast((item.product_title || 'Item') + ' added to cart');
        refreshCartUI();
        maybeOpenDrawer();
      })
      .catch(function () {
        // Graceful fallback: let the browser do a normal /cart/add post.
        form.submit();
      })
      .finally(function () {
        if (button) { button.disabled = false; button.textContent = original; }
      });
  });
})();
