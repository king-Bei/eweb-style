import { useState } from 'react';
import { countryCodeApi } from '../api';

export default function CountryCodeFields({ value = {}, onChange }) {
  const [lookupError, setLookupError] = useState('');

  const lookupCountry = async () => {
    const code = String(value.country_code || '').trim().toUpperCase();
    if (!code) return;
    try {
      const country = await countryCodeApi.get(code);
      if (!country) {
        setLookupError(`找不到國家代碼 ${code}`);
        return;
      }
      setLookupError('');
      onChange({ country_code: country.code, country: country.name_zh, country_en: country.name_en });
    } catch (error) {
      setLookupError(error?.code === 'PGRST205' ? '無法讀取 countries 資料表' : (error?.message || '國家代碼查詢失敗'));
    }
  };

  return (
    <div className="col-span-2 grid grid-cols-1 gap-2 md:grid-cols-[110px_1fr_1fr]">
      <div>
        <label className="form-label text-xs">國家代碼</label>
        <input
          type="text"
          className="form-control uppercase"
          maxLength={10}
          value={value.country_code || ''}
          onChange={event => onChange({ country_code: event.target.value.toUpperCase() })}
          onBlur={lookupCountry}
          placeholder="JP"
          title="輸入國家代碼後離開欄位，自動帶入國名"
        />
        {lookupError && <small className="block -mt-3 mb-2 text-xs text-red-600">{lookupError}</small>}
      </div>
      <div>
        <label className="form-label text-xs">國家中文</label>
        <input type="text" className="form-control" value={value.country || ''} onChange={event => onChange({ country: event.target.value })} placeholder="日本" />
      </div>
      <div>
        <label className="form-label text-xs">國家英文</label>
        <input type="text" className="form-control" value={value.country_en || ''} onChange={event => onChange({ country_en: event.target.value })} placeholder="Japan" />
      </div>
    </div>
  );
}
