export default function ImageAttributionInput({ value = '', onChange, label = '圖片來源／出處' }) {
  return (
    <div>
      <label className="form-label text-xs">{label}</label>
      <input
        type="text"
        className="form-control"
        value={value}
        onChange={event => onChange(event.target.value)}
        placeholder="例如：Jollify Travel、飯店官網、攝影師姓名"
      />
    </div>
  );
}
