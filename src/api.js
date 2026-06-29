import { supabase } from './supabase';

// 認證相關 (自訂員工編號登入)
export const authApi = {
  async signIn(employeeId, password) {
    const { data, error } = await supabase.rpc('login_employee', { emp_id: employeeId, emp_pwd: password });
    if (error) throw error;
    if (!data.success) throw new Error(data.message);

    // 設定 6 小時後過期
    const expiresAt = new Date().getTime() + 6 * 60 * 60 * 1000;
    const userData = { ...data.user, expiresAt };
    localStorage.setItem('jollify_user', JSON.stringify(userData));
    return { user: userData };
  },
  async signOut() {
    localStorage.removeItem('jollify_user');
  },
  async getUser() {
    const userStr = localStorage.getItem('jollify_user');
    if (!userStr) return null;
    
    const user = JSON.parse(userStr);
    // 檢查是否超過 6 小時
    if (user.expiresAt && new Date().getTime() > user.expiresAt) {
      localStorage.removeItem('jollify_user');
      window.dispatchEvent(new Event('auth-expired'));
      return null;
    }
    return user;
  }
};

// 主行程表相關
export const itineraryApi = {

  async saveVersion(itineraryId, snapshotData, user) {
    const { data, error } = await supabase
      .from('itinerary_versions')
      .insert([{
        itinerary_id: itineraryId,
        modifier_id: user?.id,
        modifier_name: user?.name || user?.id || '未知',
        snapshot_data: snapshotData
      }]);
    if (error) throw error;
    return data;
  },

  async getVersions(itineraryId) {
    const { data, error } = await supabase
      .from('itinerary_versions')
      .select('id, modifier_name, created_at')
      .eq('itinerary_id', itineraryId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async getVersionData(versionId) {
    const { data, error } = await supabase
      .from('itinerary_versions')
      .select('snapshot_data')
      .eq('id', versionId)
      .single();
    if (error) throw error;
    return data.snapshot_data;
  },

  async updateStatus(id, updates) {
    // updates could contain { status, publish_date_note, config_updates }
    // Fetch current config first if there are config_updates
    let finalUpdates = { ...updates };

    if (updates.config_updates) {
      const { data: current } = await supabase.from('itineraries').select('config').eq('id', id).single();
      finalUpdates.config = { ...(current?.config || {}), ...updates.config_updates };
      delete finalUpdates.config_updates;
    }

    const { data, error } = await supabase
      .from('itineraries')
      .update(finalUpdates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async getAll() {
    const { data, error } = await supabase
      .from('itineraries')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async getById(id) {
    const { data, error } = await supabase
      .from('itineraries')
      .select(`
        *,
        itinerary_days (*),
        itinerary_flights (*),
        itinerary_hotels (*)
      `)
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },
  async create(title, theme = 'classic') {
    const user = await authApi.getUser();
    if (!user) {
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('itineraries')
      .insert([{
        title,
        user_id: user.id,
        status: '草稿',
        last_modifier_name: user.email || user.id,
        config: { theme }
      }])
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async update(id, updates) {
    const { data, error } = await supabase
      .from('itineraries')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },
  async remove(id) {
    const { error } = await supabase.from('itineraries').delete().eq('id', id);
    if (error) throw error;
  },
  async duplicate(id) {
    const user = await authApi.getUser();
    if (!user) {
      window.dispatchEvent(new Event('auth-expired'));
      throw new Error('User not authenticated');
    }

    // Get original itinerary
    const original = await this.getById(id);
    if (!original) throw new Error('Original itinerary not found');

    // Create new itinerary
    const { data: newItin, error: createError } = await supabase
      .from('itineraries')
      .insert([{
        title: original.title + ' (複製)',
        user_id: user.id,
        status: '草稿',
        last_modifier_name: user.email || user.id,
        hero_data: original.hero_data,
        quick_info: original.quick_info,
        highlights: original.highlights,
        spots: original.spots,
        notices: original.notices,
        recommended: original.recommended,
        config: original.config
      }])
      .select()
      .single();

    if (createError) throw createError;
    const newId = newItin.id;

    // Copy flights
    if (original.itinerary_flights && original.itinerary_flights.length > 0) {
      const flights = original.itinerary_flights.map(f => ({ itinerary_id: newId, flight_data: f.flight_data }));
      await supabase.from('itinerary_flights').insert(flights);
    }

    // Copy days
    if (original.itinerary_days && original.itinerary_days.length > 0) {
      const days = original.itinerary_days.map(d => ({ itinerary_id: newId, day_index: d.day_index, content: d.content }));
      await supabase.from('itinerary_days').insert(days);
    }

    // Copy hotels
    if (original.itinerary_hotels && original.itinerary_hotels.length > 0) {
      const hotels = original.itinerary_hotels.map(h => ({ itinerary_id: newId, hotel_group_data: h.hotel_group_data }));
      await supabase.from('itinerary_hotels').insert(hotels);
    }

    return newItin;
  }
};

// 航班資訊相關
export const flightApi = {
  async save(itineraryId, flightDataArray) {
    const { error: deleteError } = await supabase.from('itinerary_flights').delete().eq('itinerary_id', itineraryId);
    if (deleteError) throw deleteError;
    if (flightDataArray && flightDataArray.length > 0) {
      const inserts = flightDataArray.map((flight, index) => ({
        itinerary_id: itineraryId,
        flight_data: { ...flight, __sort_index: index }
      }));
      const { data, error } = await supabase.from('itinerary_flights').insert(inserts).select();
      if (error) throw error;
      return data;
    }
    return [];
  }
};

// 每日行程相關
export const daysApi = {
  async save(itineraryId, daysArray) {
    const { error: deleteError } = await supabase.from('itinerary_days').delete().eq('itinerary_id', itineraryId);
    if (deleteError) throw deleteError;
    if (daysArray && daysArray.length > 0) {
      const inserts = daysArray.map(d => ({
        itinerary_id: itineraryId,
        day_index: d.day_index,
        content: d.content
      }));
      const { data, error } = await supabase.from('itinerary_days').insert(inserts).select();
      if (error) throw error;
      return data;
    }
    return [];
  }
};

// 嚴選住宿相關
export const hotelsApi = {
  async save(itineraryId, hotelsArray) {
    const { error: deleteError } = await supabase.from('itinerary_hotels').delete().eq('itinerary_id', itineraryId);
    if (deleteError) throw deleteError;
    if (hotelsArray && hotelsArray.length > 0) {
      const inserts = hotelsArray.map((hotel, index) => ({
        itinerary_id: itineraryId,
        hotel_group_data: { ...hotel, __sort_index: index }
      }));
      const { data, error } = await supabase.from('itinerary_hotels').insert(inserts).select();
      if (error) throw error;
      return data;
    }
    return [];
  }
};

// 航班字典 (Flight Templates) 相關
export const flightTemplateApi = {
  async search(query) {
    if (!query) return [];
    const { data, error } = await supabase
      .from('flight_templates')
      .select('*')
      .or(`flight_no.ilike.%${query}%,airline_code.ilike.%${query}%,dep_location_en.ilike.%${query}%,arr_location_en.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data;
  },
  async save(flightData) {
    const { data: insertData, error: insertError } = await supabase
      .from('flight_templates')
      .insert([flightData])
      .select();
    if (insertError) throw insertError;
    return insertData;
  },
  async getAll() {
    const { data, error } = await supabase
      .from('flight_templates')
      .select('*')
      .order('flight_no', { ascending: true });
    if (error) throw error;
    return data;
  }
};

// 景點資料庫 (Spot Templates) 相關
export const spotTemplateApi = {
  async search(query = '', country = '') {
    const keyword = String(query).trim().replace(/[(),]/g, ' ');
    const countryKeyword = String(country).trim().replace(/[(),]/g, ' ');
    if (!keyword && !countryKeyword) return [];

    let request = supabase
      .from('spot_templates')
      .select('*')
      .order('country_zh', { ascending: true })
      .order('name_zh', { ascending: true });

    if (keyword) {
      request = request.or(`name_zh.ilike.%${keyword}%,name_en.ilike.%${keyword}%,city_zh.ilike.%${keyword}%,tag.ilike.%${keyword}%`);
    }
    if (countryKeyword) {
      request = request.or(`country_code.ilike.%${countryKeyword.toUpperCase()}%,country_zh.ilike.%${countryKeyword}%,country_en.ilike.%${countryKeyword}%`);
    }

    const { data, error } = await request.limit(20);
    if (error) throw error;
    return data || [];
  },

  async save(spot) {
    const countryCode = String(spot.country_code || '').trim().toUpperCase();
    const countryZh = String(spot.country_zh || spot.country || '').trim();
    const nameZh = String(spot.name_zh || spot.name || '').trim();
    if (!countryCode) throw new Error('請先輸入國家代碼');
    if (!countryZh) throw new Error('請先輸入國家');
    if (!nameZh) throw new Error('請先輸入景點名稱');

    const payload = {
      country_code: countryCode,
      country_zh: countryZh,
      country_en: String(spot.country_en || '').trim() || null,
      city_zh: String(spot.city_zh || '').trim() || null,
      name_zh: nameZh,
      name_en: String(spot.name_en || '').trim() || null,
      description: String(spot.desc || spot.description || '').trim() || null,
      tag: String(spot.tag || '').trim() || null,
      image_url: String(spot.img || spot.image_url || '').trim() || null,
      image_source: String(spot.image_source || '').trim() || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('spot_templates')
      .upsert(payload, { onConflict: 'country_zh,name_zh' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// 飯店資料庫 (Hotel Templates) 相關
export const hotelTemplateApi = {
  async search(query = '', country = '') {
    const keyword = String(query).trim().replace(/[(),]/g, ' ');
    const countryKeyword = String(country).trim().replace(/[(),]/g, ' ');
    if (!keyword && !countryKeyword) return [];

    let request = supabase
      .from('hotel_templates')
      .select('*')
      .order('country_code', { ascending: true })
      .order('name_zh', { ascending: true });
    if (keyword) {
      request = request.or(`name_zh.ilike.%${keyword}%,name_en.ilike.%${keyword}%,city_zh.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }
    if (countryKeyword) {
      request = request.or(`country_code.ilike.%${countryKeyword.toUpperCase()}%,country_zh.ilike.%${countryKeyword}%,country_en.ilike.%${countryKeyword}%`);
    }

    const { data, error } = await request.limit(20);
    if (error) throw error;
    return data || [];
  },

  async save(hotel) {
    const countryCode = String(hotel.country_code || '').trim().toUpperCase();
    const nameZh = String(hotel.name_zh || hotel.name || '').trim();
    if (!countryCode) throw new Error('請先輸入國家代碼');
    if (!nameZh) throw new Error('請先輸入飯店名稱');

    const payload = {
      country_code: countryCode,
      country_zh: String(hotel.country_zh || hotel.country || '').trim() || null,
      country_en: String(hotel.country_en || '').trim() || null,
      city_zh: String(hotel.city_zh || '').trim() || null,
      name_zh: nameZh,
      name_en: String(hotel.name_en || '').trim() || null,
      stars: String(hotel.stars || '').trim() || null,
      description: String(hotel.desc || hotel.description || '').trim() || null,
      image_url: String(hotel.img || hotel.image_url || '').trim() || null,
      image_source: String(hotel.image_source || '').trim() || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('hotel_templates')
      .upsert(payload, { onConflict: 'country_code,name_zh' })
      .select()
      .single();
    if (error) throw error;
    return data;
  }
};

// 既有國家資料表
export const countryCodeApi = {
  async get(code) {
    if (!code) return null;
    const { data, error } = await supabase
      .from('countries')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  }
};

// 航空公司 / 城市代碼字典
export const codeLookupApi = {
  async getAirline(code) {
    if (!code) return null;
    const { data, error } = await supabase
      .from('airline_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async getCity(code) {
    if (!code) return null;
    const { data, error } = await supabase
      .from('city_codes')
      .select('*')
      .eq('code', code.trim().toUpperCase())
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async searchAirlines(query) {
    if (!query) return [];
    const q = query.trim().toUpperCase();
    const { data, error } = await supabase
      .from('airline_codes')
      .select('*')
      .or(`code.ilike.%${q}%,name_zh.ilike.%${query}%,name_en.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data;
  },

  async searchCities(query) {
    if (!query) return [];
    const q = query.trim().toUpperCase();
    const { data, error } = await supabase
      .from('city_codes')
      .select('*')
      .or(`code.ilike.%${q}%,city_zh.ilike.%${query}%,city_en.ilike.%${query}%,airport_name_zh.ilike.%${query}%`)
      .limit(10);
    if (error) throw error;
    return data;
  }
};

// 注意事項範本 (Notice Templates) 相關
export const noticeTemplateApi = {
  async getAll() {
    const { data, error } = await supabase
      .from('notice_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },
  async save(templateData) {
    if (templateData.id) {
      // Update
      const { data, error } = await supabase
        .from('notice_templates')
        .update({ ...templateData, updated_at: new Date().toISOString() })
        .eq('id', templateData.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } else {
      // Insert
      const { data, error } = await supabase
        .from('notice_templates')
        .insert([templateData])
        .select()
        .single();
      if (error) throw error;
      return data;
    }
  },
  async remove(id) {
    const { error } = await supabase.from('notice_templates').delete().eq('id', id);
    if (error) throw error;
  }
};
