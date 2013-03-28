<?php

//  parse categories
class EE_Channel_category_parser implements EE_Channel_parser_plugin {

	public function understands($tag)
	{
		return TRUE;
	}

	public function replace($tagdata, EE_Channel_data_parser $obj)
	{
		$tag = $obj->tag();
		$data = $obj->row();
		$prefix = $obj->prefix();

		$categories = $obj->data('categories', array());

		$tagname = $prefix.'categories';

		if (strncmp($tag, $tagname, strlen($tagname)) == 0)
		{
			$cat_chunk = $obj->preparsed()->cat_chunks;

			if (isset($categories[$data['entry_id']]) AND is_array($categories[$data['entry_id']]) AND count($cat_chunk) > 0)
			{
				// Get category ID from URL for {if active} conditional
				get_instance()->load->helper('segment');
				$active_cat = ($obj->channel()->pagination->dynamic_sql && $obj->channel()->cat_request) ? parse_category($this->query_string) : FALSE;
				
				foreach ($cat_chunk as $catkey => $catval)
				{
					$cats = '';
					$i = 0;
					
					//  We do the pulling out of categories before the "prepping" of conditionals
					//  So, we have to do it here again too.  How annoying...
	// @todo conditionals
	//				$catval[0] = get_instance()->functions->prep_conditionals($catval[0], $cond);
	//				$catval[2] = get_instance()->functions->prep_conditionals($catval[2], $cond);

					$not_these		  = array();
					$these			  = array();
					$not_these_groups = array();
					$these_groups	  = array();

					if (isset($catval[1]['show']))
					{
						if (strncmp($catval[1]['show'], 'not ', 4) == 0)
						{
							$not_these = explode('|', trim(substr($catval[1]['show'], 3)));
						}
						else
						{
							$these = explode('|', trim($catval[1]['show']));
						}
					}

					if (isset($catval[1]['show_group']))
					{
						if (strncmp($catval[1]['show_group'], 'not ', 4) == 0)
						{
							$not_these_groups = explode('|', trim(substr($catval[1]['show_group'], 3)));
						}
						else
						{
							$these_groups = explode('|', trim($catval[1]['show_group']));
						}
					}

					foreach ($categories[$data['entry_id']] as $k => $v)
					{
						if (in_array($v[0], $not_these) OR (isset($v[5]) && in_array($v[5], $not_these_groups)))
						{
							continue;
						}
						elseif( (count($these) > 0 && ! in_array($v[0], $these)) OR
						 		(count($these_groups) > 0 && isset($v[5]) && ! in_array($v[5], $these_groups)))
						{
							continue;
						}

						$temp = $catval[0];

						if (preg_match_all("#".LD."path=(.+?)".RD."#", $temp, $matches))
						{
							foreach ($matches[1] as $match)
							{
								if ($this->use_category_names == TRUE)
								{
									$temp = preg_replace("#".LD."path=.+?".RD."#", reduce_double_slashes(get_instance()->functions->create_url($match).'/'.$this->reserved_cat_segment.'/'.$v[6]), $temp, 1);
								}
								else
								{
									$temp = preg_replace("#".LD."path=.+?".RD."#", reduce_double_slashes(get_instance()->functions->create_url($match).'/C'.$v[0]), $temp, 1);
								}
							}
						}
						else
						{
							$temp = preg_replace("#".LD."path=.+?".RD."#", get_instance()->functions->create_url("SITE_INDEX"), $temp);
						}
						
						get_instance()->load->library('file_field');
						$cat_image = get_instance()->file_field->parse_field($v[3]);
						
						$cat_vars = array(
							'category_name'			=> $v[2],
							'category_url_title'	=> $v[6],
							'category_description'	=> (isset($v[4])) ? $v[4] : '',
							'category_group'		=> (isset($v[5])) ? $v[5] : '',
							'category_image'		=> $cat_image['url'],
							'category_id'			=> $v[0],
							'parent_id'				=> $v[1],
							'active'				=> ($active_cat == $v[0] || $active_cat == $v[6])
						);

						// add custom fields for conditionals prep
						foreach ($obj->channel()->catfields as $cv)
						{
							$cat_vars[$cv['field_name']] = ( ! isset($v['field_id_'.$cv['field_id']])) ? '' : $v['field_id_'.$cv['field_id']];
						}

						$temp = get_instance()->functions->prep_conditionals($temp, $cat_vars);

						$temp = str_replace(
							array(
								LD."category_id".RD,
								LD."category_name".RD,
								LD."category_url_title".RD,
								LD."category_image".RD,
								LD."category_group".RD,
								LD.'category_description'.RD,
								LD.'parent_id'.RD
							),
							array($v[0],
								get_instance()->functions->encode_ee_tags($v[2]),
								$v[6],
								$cat_image['url'],
								(isset($v[5])) ? $v[5] : '',
								(isset($v[4])) ? get_instance()->functions->encode_ee_tags($v[4]) : '',
								$v[1]
							),
							$temp
						);

						foreach($obj->channel()->catfields as $cv2)
						{
							if (isset($v['field_id_'.$cv2['field_id']]) AND $v['field_id_'.$cv2['field_id']] != '')
							{
								$field_content = get_instance()->typography->parse_type(
									$v['field_id_'.$cv2['field_id']],
									array(
										'text_format'		=> $v['field_ft_'.$cv2['field_id']],
										'html_format'		=> $v['field_html_formatting'],
										'auto_links'		=> 'n',
										'allow_img_url'	=> 'y'
									)
								);
								
								$temp = str_replace(LD.$cv2['field_name'].RD, $field_content, $temp);
							}
							else
							{
								// garbage collection
								$temp = str_replace(LD.$cv2['field_name'].RD, '', $temp);
							}

							$temp = reduce_double_slashes($temp);
						}

						$cats .= $temp;

						if (is_array($catval[1]) && isset($catval[1]['limit']) && $catval[1]['limit'] == ++$i)
						{
							break;
						}
					}

					if (is_array($catval[1]) AND isset($catval[1]['backspace']))
					{
						$cats = substr($cats, 0, - $catval[1]['backspace']);
					}

					// Check to see if we need to parse {filedir_n}
					if (strpos($cats, '{filedir_') !== FALSE)
					{
						get_instance()->load->library('file_field');
						$cats = get_instance()->file_field->parse_string($cats);
					}
					
					$tagdata = str_replace($catval[2], $cats, $tagdata);
				}
			}
			else
			{
				$tagdata = get_instance()->TMPL->delete_var_pairs($tag, 'categories', $tagdata);
			}
		}

		return $tagdata;
	}
}