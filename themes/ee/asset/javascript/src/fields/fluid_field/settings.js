/**
 * ExpressionEngine (https://expressionengine.com)
 *
 * @link      https://expressionengine.com/
 * @copyright Copyright (c) 2003-2017, EllisLab, Inc. (https://ellislab.com)
 * @license   https://expressionengine.com/license
 */

"use strict";

(function ($) {
	$(document).ready(function () {
		$('.modal-remove-field input.btn').on('click', function(e) {
			e.preventDefault();
			$('.form-standard form').off('submit');

			// Cannot use .submit() because we have inputs named "submit", see
			// https://api.jquery.com/submit/
			$('button[type=submit][value=save]').click();
		});

		$('.form-standard form').on('submit', function(e) {
			var existing_fields = EE.fields.fluid_field.fields;
			var field;
			var showModal = false;

			for (var i = 0, len = existing_fields.length; i < len; i++) {
				field = $('[name="field_channel_fields[]"][value="' + existing_fields[i] + '"]');
				if (field.size() == 0 || field.prop('checked') == false) {
					showModal = true;
					break;
				}
			}

			if (showModal) {
				e.preventDefault();
				$('.modal-remove-field input.btn').attr('disabled', false);
				$('.modal-remove-field').trigger('modal:open');
			}
		});
	});
})(jQuery);
