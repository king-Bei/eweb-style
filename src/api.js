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
    if (!user) throw new Error('User not authenticated');

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
    if (!user) throw new Error('User not authenticated');

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
    // 簡單的同步方式：先刪除舊的再新增新的
    await supabase.from('itinerary_flights').delete().eq('itinerary_id', itineraryId);
    if (flightDataArray && flightDataArray.length > 0) {
      const inserts = flightDataArray.map(f => ({ itinerary_id: itineraryId, flight_data: f }));
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
    await supabase.from('itinerary_days').delete().eq('itinerary_id', itineraryId);
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
    await supabase.from('itinerary_hotels').delete().eq('itinerary_id', itineraryId);
    if (hotelsArray && hotelsArray.length > 0) {
      const inserts = hotelsArray.map(h => ({
        itinerary_id: itineraryId,
        hotel_group_data: h
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
