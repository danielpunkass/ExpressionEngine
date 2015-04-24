<?php

namespace EllisLab\ExpressionEngine\Library;

if ( ! defined('BASEPATH')) exit('No direct script access allowed');

/**
 * ExpressionEngine - by EllisLab
 *
 * @package		ExpressionEngine
 * @author		EllisLab Dev Team
 * @copyright	Copyright (c) 2003 - 2015, EllisLab, Inc.
 * @license		http://ellislab.com/expressionengine/user-guide/license.html
 * @link		http://ellislab.com
 * @since		Version 3.0
 * @filesource
 */

// ------------------------------------------------------------------------

/**
 * ExpressionEngine CAPTCHA Class
 *
 * @package		ExpressionEngine
 * @subpackage	Library
 * @author		EllisLab Dev Team
 * @link		http://ellislab.com
 */

class Captcha {

	/**
	 * Returns a boolean indicating if a CAPTCHA should be displayed or not
	 * according to the site's CAPTCHA settings
	 *
	 * @return	boolean
	 */
	public function should_require_captcha()
	{
		return bool_config_item('require_captcha') &&
			( !
				// The only case we don't need to show captcha is if the
				// member is logged in but captcha_require_members is off
				( ! bool_config_item('captcha_require_members') &&
					ee()->session->userdata('member_id') != 0)
			);
	}

	/**
	 * Generate CAPTCHA
	 *
	 * @param	string	$old_word	Word to make CAPTCHA image out of
	 * @param	boolean	$force_word	Boolean to skip CAPTCHA creation
	 * @return	string	HTML of image tag referencing CAPTCHA
	 */
	public function create_captcha($old_word = '', $force_word = FALSE)
	{
		if (ee()->config->item('captcha_require_members') == 'n' &&
			ee()->session->userdata['member_id'] != 0 &&
			$force_word == FALSE)
		{
			return '';
		}

		// -------------------------------------------
		// 'create_captcha_start' hook.
		//  - Allows rewrite of how CAPTCHAs are created
		//
			if (ee()->extensions->active_hook('create_captcha_start') === TRUE)
			{
				$edata = ee()->extensions->call('create_captcha_start', $old_word);
				if (ee()->extensions->end_script === TRUE) return $edata;
			}
		// -------------------------------------------

		$img_path	= ee()->config->slash_item('captcha_path', 1);
		$img_url	= ee()->config->slash_item('captcha_url');
		$use_font	= (ee()->config->item('captcha_font') == 'y') ? TRUE : FALSE;

		$font_face	= "texb.ttf";
		$font_size	= 16;

		$expiration = 60*60*2;  // 2 hours

		$img_width	= 140;	// Image width
		$img_height	= 30;	// Image height

		if ($img_path == '' OR $img_url == '')
		{
			return FALSE;
		}

		if ( ! @is_dir($img_path))
		{
			return FALSE;
		}

		if ( ! is_really_writable($img_path))
		{
			return FALSE;
		}

		if ( ! file_exists(APPPATH.'config/captcha.php'))
		{
			return FALSE;
		}

		if ( ! extension_loaded('gd'))
		{
			return FALSE;
		}

		if (substr($img_url, -1) != '/') $img_url .= '/';


		// Disable DB caching if it's currently set

		$db_reset = FALSE;
		if (ee()->db->cache_on == TRUE)
		{
			ee()->db->cache_off();
			$db_reset = TRUE;
		}

		// Remove old images - add a bit of randomness so we aren't doing this every page access

		list($usec, $sec) = explode(" ", microtime());
		$now = ((float)$usec + (float)$sec);

		if ((mt_rand() % 100) < ee()->session->gc_probability)
		{
			$old = time() - $expiration;
			ee()->db->query("DELETE FROM exp_captcha WHERE date < ".$old);

			$current_dir = @opendir($img_path);

			while($filename = @readdir($current_dir))
			{
				if ($filename != "." and $filename != ".." and $filename != "index.html")
				{
					$name = str_replace(".jpg", "", $filename);

					if (($name + $expiration) < $now)
					{
						@unlink($img_path.$filename);
					}
				}
			}

			@closedir($current_dir);
		}

		// Fetch and insert word
		if ($old_word == '')
		{
			require APPPATH.'config/captcha.php';
			$word = $words[array_rand($words)];

			if (ee()->config->item('captcha_rand') == 'y')
			{
				$word .= ee()->functions->random('nozero', 2);
			}

			ee()->db->query("INSERT INTO exp_captcha (date, ip_address, word) VALUES (UNIX_TIMESTAMP(), '".ee()->input->ip_address()."', '".ee()->db->escape_str($word)."')");
		}
		else
		{
			$word = $old_word;
		}

		$this->cached_captcha = $word;

		// Determine angle and position
		$length	= strlen($word);
		$angle	= ($length >= 6) ? rand(-($length-6), ($length-6)) : 0;
		$x_axis	= rand(6, (360/$length)-16);
		$y_axis = ($angle >= 0 ) ? rand($img_height, $img_width) : rand(6, $img_height);

		// Create image
		$im = ImageCreate($img_width, $img_height);

		// Assign colors
		$bg_color		= ImageColorAllocate($im, 255, 255, 255);
		$border_color	= ImageColorAllocate($im, 153, 102, 102);
		$text_color		= ImageColorAllocate($im, 204, 153, 153);
		$grid_color		= imagecolorallocate($im, 255, 182, 182);
		$shadow_color	= imagecolorallocate($im, 255, 240, 240);

		// Create the rectangle
		ImageFilledRectangle($im, 0, 0, $img_width, $img_height, $bg_color);

		// Create the spiral pattern
		$theta		= 1;
		$thetac		= 6;
		$radius		= 12;
		$circles	= 20;
		$points		= 36;

		for ($i = 0; $i < ($circles * $points) - 1; $i++)
		{
			$theta = $theta + $thetac;
			$rad = $radius * ($i / $points );
			$x = ($rad * cos($theta)) + $x_axis;
			$y = ($rad * sin($theta)) + $y_axis;
			$theta = $theta + $thetac;
			$rad1 = $radius * (($i + 1) / $points);
			$x1 = ($rad1 * cos($theta)) + $x_axis;
			$y1 = ($rad1 * sin($theta )) + $y_axis;
			imageline($im, $x, $y, $x1, $y1, $grid_color);
			$theta = $theta - $thetac;
		}

		//imageline($im, $img_width, $img_height, 0, 0, $grid_color);

		// Write the text
		$font_path = APPPATH.'fonts/'.$font_face;

		if ($use_font == TRUE)
		{
			if ( ! file_exists($font_path))
			{
				$use_font = FALSE;
			}
		}

		if ($use_font == FALSE OR ! function_exists('imagettftext'))
		{
			$font_size = 5;
			ImageString($im, $font_size, $x_axis, $img_height/3.8, $word, $text_color);
		}
		else
		{
			imagettftext($im, $font_size, $angle, $x_axis, $img_height/1.5, $text_color, $font_path, $word);
		}

		// Create the border
		imagerectangle($im, 0, 0, $img_width-1, $img_height-1, $border_color);

		// Generate the image
		$img_name = $now.'.jpg';

		ImageJPEG($im, $img_path.$img_name);

		$img = "<img src=\"$img_url$img_name\" width=\"$img_width\" height=\"$img_height\" style=\"border:0;\" alt=\" \" />";

		ImageDestroy($im);

		// Re-enable DB caching
		if ($db_reset == TRUE)
		{
			ee()->db->cache_on();
		}

		return $img;
	}

}

// EOF
