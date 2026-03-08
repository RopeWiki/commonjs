/**
 * PageForms autoedit utilities
 * Provides JavaScript-based alternatives to {{#autoedit}} parser function
 *
 * This allows more control over the UI, better error handling, and eliminates
 * dependency on PageForms parser function while still using its API.
 */

/**
 * Triggers a PageForms autoedit action via API
 * Replaces {{#autoedit}} parser function with JavaScript
 *
 * @param {Object} options - Configuration object
 * @param {string} options.form - Form name (required)
 * @param {string} options.target - Target page to create/edit (required)
 * @param {Object} options.fields - Form fields as key-value pairs (required)
 *        Example: {'Page_rating[Page]': 'Canyon_Name', 'Page_rating[Rating]': '5'}
 * @param {boolean} options.reload - Reload page after edit (default: false)
 * @param {boolean} options.confirm - Show confirmation dialog (default: false)
 * @param {string} options.confirmText - Custom confirmation message
 * @param {boolean} options.minor - Mark as minor edit (default: false)
 * @param {string} options.summary - Edit summary
 * @param {Function} options.onSuccess - Success callback function(response)
 * @param {Function} options.onError - Error callback function(xhr, status, error)
 * @returns {Promise} jQuery AJAX promise
 *
 * @example
 * triggerAutoEdit({
 *     form: 'Page_rating',
 *     target: 'Votes:Canyon_Name/Username',
 *     fields: {
 *         'Page_rating[Page]': 'Canyon_Name',
 *         'Page_rating[User]': 'Username',
 *         'Page_rating[Rating]': '5'
 *     },
 *     reload: false,
 *     onSuccess: function(response) { console.log('Success!'); }
 * });
 */
function triggerAutoEdit(options) {
    // Validate required fields
    if (!options.form || !options.target || !options.fields) {
        console.error('triggerAutoEdit: form, target, and fields are required', options);
        return $.Deferred().reject('Missing required parameters').promise();
    }

    // Show confirmation if requested
    if (options.confirm) {
        var message = options.confirmText || 'Are you sure you want to perform this action?';
        if (!confirm(message)) {
            return $.Deferred().reject('User cancelled').promise();
        }
    }

    // Build query string from fields object
    var queryParts = [];
    var key;
    for (key in options.fields) {
        if (options.fields.hasOwnProperty(key)) {
            queryParts.push(key + '=' + encodeURIComponent(options.fields[key]));
        }
    }
    var queryString = queryParts.join('&');

    // Build API data
    var apiData = {
        action: 'pfautoedit',
        form: options.form,
        target: options.target,
        query: queryString
    };

    if (options.minor) {
        apiData.minor = '1';
    }

    if (options.summary) {
        apiData.summary = options.summary;
    }

    console.log('triggerAutoEdit:', {
        form: options.form,
        target: options.target,
        fields: options.fields,
        reload: options.reload || false
    });

    // Make AJAX request
    return $.ajax({
        url: SITE_BASE_URL + '/api.php',
        method: 'POST',
        data: apiData,
        success: function(response) {
            console.log('AutoEdit successful:', response);

            if (options.onSuccess) {
                options.onSuccess(response);
            }

            // Reload if requested
            if (options.reload) {
                window.location.reload();
            }
        },
        error: function(xhr, status, error) {
            console.error('AutoEdit failed:', {
                status: status,
                error: error,
                response: xhr.responseText
            });

            if (options.onError) {
                options.onError(xhr, status, error);
            } else {
                // Default error handling - show user-friendly message
                alert('Failed to save. Please try again or contact support if the problem persists.');
            }
        }
    });
}

/**
 * Creates a clickable button/link that triggers an autoedit action
 * Drop-in replacement for {{#autoedit}} generated links
 *
 * @param {Object} options - Same as triggerAutoEdit plus:
 * @param {string} options.text - Button/link text (required)
 * @param {string} options.type - 'button' or 'link' (default: 'button')
 * @param {string} options.className - CSS class to apply
 * @param {string} options.tooltip - Tooltip text
 * @param {HTMLElement} options.innerHTML - Custom HTML content (overrides text)
 * @returns {HTMLElement} The created button/link element
 *
 * @example
 * var deleteButton = createAutoEditButton({
 *     form: 'Condition',
 *     target: 'Conditions:Canyon_Name/2024-01-15',
 *     fields: {
 *         'Condition[Location]': '',
 *         'Condition[ReportedBy]': ''
 *     },
 *     text: 'Delete',
 *     type: 'button',
 *     reload: true,
 *     confirm: true,
 *     confirmText: 'Are you sure you want to delete this condition report?'
 * });
 */
function createAutoEditButton(options) {
    if (!options.text && !options.innerHTML) {
        console.error('createAutoEditButton: text or innerHTML is required');
        return null;
    }

    var element = options.type === 'link'
        ? document.createElement('a')
        : document.createElement('button');

    if (options.innerHTML) {
        element.innerHTML = options.innerHTML;
    } else {
        element.textContent = options.text;
    }

    element.className = options.className || 'autoedit-button';

    if (options.tooltip) {
        element.title = options.tooltip;
    }

    if (options.type === 'link') {
        element.href = '#';
    }

    element.onclick = function(e) {
        e.preventDefault();
        triggerAutoEdit(options);
        return false;
    };

    return element;
}

/**
 * Initialize autoedit buttons from specially-marked HTML elements
 * Scans for elements with class 'js-autoedit-trigger' and replaces them with interactive buttons
 *
 * This allows templates to output simple HTML markers that get replaced with
 * functional buttons via JavaScript, providing graceful degradation if JS is disabled.
 *
 * Expected data attributes on trigger elements:
 * - data-form: Form name
 * - data-target: Target page
 * - data-fields: JSON string of fields object
 * - data-text: Button text
 * - data-type: 'button' or 'link' (optional, default: button)
 * - data-reload: 'true' to reload after edit (optional)
 * - data-confirm: 'true' to show confirmation (optional)
 * - data-confirm-text: Custom confirmation message (optional)
 * - data-class: CSS class (optional)
 * - data-tooltip: Tooltip text (optional)
 *
 * @example HTML marker in template:
 * <span class="js-autoedit-trigger"
 *       data-form="Page_rating"
 *       data-target="Votes:Canyon/User"
 *       data-fields='{"Page_rating[Page]":"Canyon","Page_rating[Rating]":"5"}'
 *       data-text="Rate 5 stars"
 *       data-reload="false">
 *   <!-- Fallback content if JS disabled -->
 *   <noscript>{{#autoedit:...}}</noscript>
 * </span>
 */
function initializeAutoEditButtons() {
    $('.js-autoedit-trigger').each(function() {
        var $elem = $(this);

        try {
            var fieldsData = $elem.data('fields');
            var fields = typeof fieldsData === 'string' ? JSON.parse(fieldsData) : fieldsData;

            var button = createAutoEditButton({
                form: $elem.data('form'),
                target: $elem.data('target'),
                fields: fields,
                text: $elem.data('text'),
                type: $elem.data('type') || 'button',
                className: $elem.data('class'),
                tooltip: $elem.data('tooltip'),
                reload: $elem.data('reload') === 'true' || $elem.data('reload') === true,
                confirm: $elem.data('confirm') === 'true' || $elem.data('confirm') === true,
                confirmText: $elem.data('confirm-text'),
                innerHTML: $elem.data('html')
            });

            if (button) {
                $elem.replaceWith(button);
            }
        } catch (error) {
            console.error('Failed to initialize autoedit button:', error, $elem[0]);
        }
    });
}
