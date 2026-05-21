export const generateHtml = (itinerary, flights, days, hotels, cta = {}) => {
  const { hero_data, quick_info, highlights, spots, notices, recommended } = itinerary;

  let html = `<div class="jollify-luxury-theme" id="jollify-tour-module">`;

  // 1. Hero
  if (hero_data?.visible !== false) {
    html += `<div class="j-hero wow fadeIn"><div class="j-hero-overlay"></div><img src="${hero_data?.image || ''}" alt="Banner"><div class="j-hero-content"><span class="j-hero-sub">${hero_data?.title2 || ''}</span><h1 class="j-hero-title">${hero_data?.title1 || ''}</h1></div></div>`;
  }

  // 2. Quick Info
  if (quick_info?.visible !== false) {
    html += `<div class="j-wrapper wow fadeInUp" data-wow-delay="0.2s"><div class="j-quickinfo"><div class="j-quick-item"><div class="j-q-label">天數</div><div class="j-q-val">${quick_info?.duration || ''}</div></div><div class="j-quick-item"><div class="j-q-label">出發人數</div><div class="j-q-val">${quick_info?.group || ''}</div></div><div class="j-quick-item"><div class="j-q-label">出發日期</div><div class="j-q-val">${quick_info?.depart || ''}</div></div><div class="j-quick-item"><div class="j-q-label">參考價格</div><div class="j-q-val">${quick_info?.price || ''}</div></div><div class="j-quick-item" style="border-right:none;"><div class="j-q-label">航班資訊</div><div class="j-q-val">${quick_info?.flight || ''}</div></div></div></div>`;
  }

  // 3. Highlights
  if (highlights?.visible !== false) {
    let hlHtml = '';
    (highlights?.items || []).forEach((c, i) => {
      hlHtml += `<div class="j-hl-item wow fadeInUp" data-wow-delay="${i * 0.1}s"><svg class="j-hl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg><h4 class="j-hl-title">${c.title || ''}</h4><p class="j-hl-desc">${c.desc || ''}</p></div>`;
    });
    if (hlHtml) {
      html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Highlights</span><h2>行程特色 ‧ 奢旅亮點</h2></div><div class="j-wrapper"><div class="j-hl-grid">${hlHtml}</div></div></div>`;
    }
  }
  // 4. Scenic Spots
  if (spots?.visible !== false) {
    let spotHtml = '';
    const spotLayout = spots?.layout || 'fullimg';
    (spots?.items || []).forEach((c, i) => {
      const tagHtml = c.tag ? `<span class="j-spot-tag">${c.tag}</span>` : '';
      if (spotLayout === 'fullimg') {
        spotHtml += `<div class="j-spot-fullimg wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-spot-fi-img"><img src="${c.img || ''}" alt="${c.name || ''}"></div><div class="j-spot-fi-caption">${tagHtml}<h3 class="j-spot-name">${c.name || ''}</h3><p class="j-spot-desc">${c.desc || ''}</p></div></div>`;
      } else if (spotLayout === 'ltr') {
        const isRev = i % 2 !== 0 ? 'reverse' : '';
        spotHtml += `<div class="j-spot-ltr ${isRev} wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-spot-ltr-img"><img src="${c.img || ''}" alt="${c.name || ''}"></div><div class="j-spot-ltr-text">${tagHtml}<h3 class="j-spot-name">${c.name || ''}</h3><p class="j-spot-desc">${c.desc || ''}</p></div></div>`;
      } else {
        spotHtml += `<div class="j-spot-grid-card wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-spot-grid-img"><img src="${c.img || ''}" alt="${c.name || ''}"></div><div class="j-spot-grid-info">${tagHtml}<h4 class="j-spot-name">${c.name || ''}</h4><p class="j-spot-desc">${c.desc || ''}</p></div></div>`;
      }
    });
    if (spotHtml) {
      const wrapClass = spotLayout === 'grid' ? 'j-spot-grid-wrapper' : 'j-wrapper';
      html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Scenic Spots</span><h2>精選景點 ‧ 探索之美</h2></div><div class="${wrapClass}">${spotHtml}</div></div>`;
    }
  }

  // 5. Flights
  if (flights?.visible !== false) {
    let flightHtml = '';
    (flights?.items || []).forEach((c, i) => {
      let isRet = (c.tag || '').includes('回') ? 'return' : '';
      flightHtml += `<div class="j-editorial-route wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-e-station"><div class="j-e-time">${c.fTime || ''}</div><div class="j-e-code">${c.fCode || ''}</div></div><div class="j-e-divider"><span class="j-e-tag ${isRet}">${c.tag || ''}</span><div class="j-e-airline">${c.fn || ''}</div><div class="j-e-line"></div><div class="j-e-duration">${c.dur || ''}</div></div><div class="j-e-station"><div class="j-e-time">${c.tTime || ''}</div><div class="j-e-code">${c.tCode || ''}</div></div></div>`;
    });
    if (flightHtml) {
      html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Flight Information</span><h2>航程紀實 ‧ 優雅啟程</h2></div><div class="j-wrapper"><div class="j-editorial-flight-box">${flightHtml}</div></div></div>`;
    }
  }

  // 6. Hotels
  if (hotels?.visible !== false) {
    let hotelHtml = '';
    const layout = hotels?.layout || 'overlap';
    (hotels?.items || []).forEach((c, i) => {
      if (layout === 'overlap') {
        const isRev = i % 2 !== 0 ? 'reverse' : '';
        hotelHtml += `<div class="j-luxury-hotel-card ${isRev} wow fadeInUp"><div class="j-h-image"><img src="${c.img || ''}" alt="Hotel"></div><div class="j-h-info"><div class="j-h-stars">${c.stars || ''}</div><h3 class="j-h-name">${c.name || ''}</h3><p class="j-h-desc">${(c.desc || '').replace(/\n/g, '<br>')}</p></div></div>`;
      } else {
        hotelHtml += `<div class="j-grid-hotel-card wow fadeInUp" data-wow-delay="${i * 0.1}s"><img src="${c.img || ''}" alt="Hotel"><div class="j-grid-h-info"><div class="j-h-stars">${c.stars || ''}</div><h4>${c.name || ''}</h4><p>${(c.desc || '').replace(/\n/g, '<br>')}</p></div></div>`;
      }
    });
    if (hotelHtml) {
      let wrapClass = layout === 'grid' ? 'j-hotel-grid-wrapper' : 'j-wrapper';
      html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Exclusive Stays</span><h2>嚴選旅宿 ‧ 奢華棲所</h2></div><div class="${wrapClass}">${hotelHtml}</div></div>`;
    }
  }

  // 7. Itinerary
  if (days?.visible !== false) {
    let tabsHtml = '', panelsHtml = '';
    (days?.items || []).forEach((c, i) => {
      const dayNum = i + 1;
      const act = i === 0 ? 'is-active' : '';
      const sty = i === 0 ? 'display:block;' : 'display:none;';
      tabsHtml += `<button class="j-day-tab ${act}" data-target="panel-${dayNum}"><span class="j-tab-num">0${dayNum}</span><span class="j-tab-label">DAY</span></button>`;

      let pointsHtml = '';
      if (c.points) {
        c.points.split('\n').filter(p => p.trim()).forEach(p => {
          pointsHtml += `<li>${p}</li>`;
        });
      }

      const hasImg = !!(c.image?.url);
      panelsHtml += `
      <div id="panel-${dayNum}" class="day-panel j-day-panel ${act}" style="${sty}">
          <div class="day-grid${hasImg ? '' : ' no-image'}">
              ${hasImg ? `<div class="day-image-area">
                  <div class="day-stamp">${c.image?.label || ''}</div>
                  <img src="${c.image?.url}" alt="Day ${dayNum}">
                  <div class="img-slot"><span class="slot-label">${c.image?.subtitle || ''}</span></div>
              </div>` : ''}
              <div class="day-text-area">
                  <span class="day-route">${c.route || ''}</span>
                  <h3 class="day-title">${c.title || ''}</h3>
                  <p class="day-lead">${(c.lead || '').replace(/\n/g, '<br>')}</p>
                  <ul class="day-points">${pointsHtml}</ul>
                  ${c.meals?.show !== false ? `<div class="day-meals-row">
                      <span><strong>B</strong>${c.meals?.breakfast || '機上餐食或自理'}</span>
                      <span><strong>L</strong>${c.meals?.lunch || '機上餐食或自理'}</span>
                      <span><strong>D</strong>${c.meals?.dinner || '機上餐食或自理'}</span>
                  </div>` : ''}
                  <div class="day-stay">
                      <span class="stay-label">STAY</span>
                      <span class="stay-name">${c.stay || ''}</span>
                  </div>
              </div>
          </div>
      </div>`;
    });
    if (tabsHtml) {
      html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Daily Itinerary</span><h2>每日行程</h2></div><div class="j-wrapper"><div class="j-magazine-box"><div class="j-tabs-row">${tabsHtml}</div><div class="j-panels-row">${panelsHtml}</div></div></div></div>`;
    }
  }

  // 8. Notice
  if (notices?.visible !== false) {
    let nHtml = '';
    (notices?.items || []).forEach((c, i) => {
      nHtml += `<div class="j-notice-item wow fadeInUp" data-wow-delay="${i * 0.1}s"><h4><span class="j-n-num">${i + 1}</span>${c.t || ''}</h4><p>${(c.desc || '').replace(/\n/g, '<br>')}</p></div>`;
    });
    if (nHtml) {
      html += `<div class="j-section bg-light-gray"><div class="j-heading wow fadeInUp"><span class="j-badge">Notices</span><h2>報名注意事項</h2></div><div class="j-wrapper"><div class="j-notice-grid">${nHtml}</div></div></div>`;
    }
  }

  // 9. Recommended
  if (recommended?.visible !== false) {
    let rHtml = '';
    (recommended?.items || []).forEach((c, i) => {
      rHtml += `<a href="${c.link || '#'}" target="_blank" class="j-rec-card wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-rec-img" style="background-image:url('${c.img || ''}')"></div><div class="j-rec-txt"><h5>${c.t || ''}</h5><span class="j-rec-btn">查看行程 &rarr;</span></div></a>`;
    });
    if (rHtml) {
      html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Recommended</span><h2>探索更多奢華旅程</h2></div><div class="j-wrapper"><div class="j-rec-grid">${rHtml}</div></div></div>`;
    }
  }

  // 10. Floating CTA
  if (cta?.visible !== false && (cta?.cta_register_url || cta?.cta_line_url)) {
    html += '<div style="position:fixed;bottom:20px;right:20px;z-index:9000;display:flex;flex-direction:column;gap:10px;align-items:flex-end;">';
    if (cta.cta_line_url) {
      html += `<a href="${cta.cta_line_url}" target="_blank" style="display:flex;align-items:center;justify-content:center;background:#06C755;color:#fff;text-decoration:none;padding:12px 20px;border-radius:50px;box-shadow:0 4px 10px rgba(0,0,0,0.2);font-weight:bold;font-family:sans-serif;transition:0.3s;" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'"><svg viewBox="0 0 24 24" style="width:20px;height:20px;fill:currentColor;margin-right:8px;"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.038 9.608.391.084.922.258 1.057.592.121.298.039.756.016.953l-.168 1.011c-.053.307-.243 1.18.591.82 1.037-.446 5.58-3.284 7.971-5.882 1.636-1.782 2.495-3.682 2.495-7.102"/></svg>LINE 客服</a>`;
    }
    if (cta.cta_register_url) {
      html += `<a href="${cta.cta_register_url}" target="_blank" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(to right, #C5A059, #a08147);color:#fff;text-decoration:none;padding:12px 24px;border-radius:50px;box-shadow:0 5px 15px rgba(0,0,0,0.3);font-weight:bold;letter-spacing:1px;font-size:16px;font-family:serif;transition:0.3s;border:1px solid rgba(255,255,255,0.3);" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">我要報名</a>`;
    }
    html += '</div>';
  }

  html += `</div>`;
  return html;
};

export const generateCss = () => {
  return `.jollify-luxury-theme { --c-pri: #4c2a85; --c-sec: #d4a93b; --c-bg: #fff; font-family: "PingFang TC", "Microsoft JhengHei", sans-serif !important; color: #333 !important; line-height: 1.6 !important; width: 100% !important; background: var(--c-bg) !important; padding-bottom:50px;}
.jollify-luxury-theme .j-wrapper { max-width: 1000px !important; margin: 0 auto !important; padding: 0 20px !important; }
.jollify-luxury-theme .j-section { padding: 60px 0 !important; }
.jollify-luxury-theme .bg-light-gray { background: #f9f9fb !important; border-top: 1px solid #eee; border-bottom: 1px solid #eee;}
.jollify-luxury-theme .j-heading { text-align: center !important; margin-bottom: 50px !important; }
.jollify-luxury-theme .j-badge { display: inline-block !important; font-size: 11px !important; letter-spacing: 3px !important; background: var(--c-sec) !important; color: #fff !important; padding: 5px 15px !important; border-radius: 20px !important; margin-bottom: 15px !important; text-transform: uppercase; }
.jollify-luxury-theme .j-heading h2 { font-size: 32px !important; color: var(--c-pri) !important; margin: 0 !important; font-weight: 300 !important; letter-spacing: 2px !important;}

/* Hero & Quick */
.jollify-luxury-theme .j-hero { position: relative !important; width: 100% !important; height: 60vh !important; min-height: 400px !important; display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; margin-bottom: -40px !important; z-index:1;}
.jollify-luxury-theme .j-hero img { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: 1 !important; }
.jollify-luxury-theme .j-hero-overlay { position: absolute !important; inset: 0 !important; background: rgba(0,0,0,0.4) !important; z-index: 2 !important; }
.jollify-luxury-theme .j-hero-content { position: relative !important; z-index: 3 !important; color: white !important; }
.jollify-luxury-theme .j-hero-sub { font-size: 14px !important; letter-spacing: 3px !important; color: var(--c-sec) !important; display: block !important; margin-bottom: 10px !important; text-transform: uppercase; }
.jollify-luxury-theme .j-hero-title { font-size: 42px !important; font-weight: 300 !important; letter-spacing: 2px !important; margin: 0 !important; }
.jollify-luxury-theme .j-quickinfo { position: relative !important; z-index: 10 !important; background: #fff !important; border-radius: 4px !important; box-shadow: 0 15px 40px rgba(0,0,0,0.06) !important; display: flex !important; padding: 35px 20px !important; border-top: 3px solid var(--c-pri) !important;}
.jollify-luxury-theme .j-quick-item { flex: 1 !important; text-align: center !important; border-right: 1px solid #f0f0f0 !important; padding: 0 10px !important; }
.jollify-luxury-theme .j-quick-item:last-child { border: none !important; }
.jollify-luxury-theme .j-q-label { font-size: 13px !important; color: #999 !important; letter-spacing: 2px !important; text-transform: uppercase !important; margin-bottom: 8px !important; }
.jollify-luxury-theme .j-q-val { font-size: 18px !important; font-weight: 600 !important; color: var(--c-pri) !important; }

/* Highlights */
.jollify-luxury-theme .j-hl-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 40px !important; }
.jollify-luxury-theme .j-hl-item { text-align: center !important; }
.jollify-luxury-theme .j-hl-icon { width: 45px !important; height: 45px !important; color: var(--c-sec) !important; margin-bottom: 15px !important; opacity:0.8;}
.jollify-luxury-theme .j-hl-title { font-size: 20px !important; color: var(--c-pri) !important; font-weight: 400 !important; margin-bottom: 12px !important; }
.jollify-luxury-theme .j-hl-desc { font-size: 15px !important; color: #666 !important; text-align: justify !important; line-height: 1.8 !important;}

/* Flight */
.jollify-luxury-theme .j-editorial-flight-box { background: #fff !important; padding: 50px 60px !important; border-radius: 2px !important; box-shadow: 0 15px 40px rgba(0,0,0,0.04) !important; border-top: 4px solid var(--c-pri) !important; }
.jollify-luxury-theme .j-editorial-route { display: flex !important; align-items: center !important; justify-content: space-between !important; margin-bottom: 40px !important; padding-bottom: 40px !important; border-bottom: 1px solid #f0f0f0 !important; }
.jollify-luxury-theme .j-editorial-route:last-child { margin-bottom: 0 !important; padding-bottom: 0 !important; border-bottom: none !important; }
.jollify-luxury-theme .j-e-station { text-align: center !important; flex: 1 !important; }
.jollify-luxury-theme .j-e-time { font-size: 22px !important; color: #888 !important; margin-bottom: 5px !important; font-family: 'Times New Roman', serif !important; }
.jollify-luxury-theme .j-e-code { font-size: 36px !important; font-weight: 300 !important; color: var(--c-pri) !important; letter-spacing: 2px !important; line-height: 1 !important; }
.jollify-luxury-theme .j-e-divider { flex: 2 !important; text-align: center !important; padding: 0 20px !important; position: relative !important; }
.jollify-luxury-theme .j-e-tag { display: inline-block; font-size: 10px; background: rgba(76,42,133,0.08); color: var(--c-pri); padding: 2px 10px; border-radius: 12px; margin-bottom: 8px; letter-spacing:1px;}
.jollify-luxury-theme .j-e-tag.return { background: rgba(212,169,59,0.15); color: #b58b21; }
.jollify-luxury-theme .j-e-airline { font-size: 12px !important; color: #aaa !important; letter-spacing: 1px !important; margin-bottom: 8px !important; }
.jollify-luxury-theme .j-e-line { width: 100% !important; height: 1px !important; background: #ddd !important; position: relative !important; }
.jollify-luxury-theme .j-e-line::after { content: '✈' !important; position: absolute !important; font-size: 16px !important; color: var(--c-sec) !important; top: -12px !important; right: -5px !important; }
.jollify-luxury-theme .j-e-duration { font-size: 12px !important; color: #888 !important; margin-top: 8px !important; font-style: italic !important; }

/* Hotel: Overlap */
.jollify-luxury-theme .j-luxury-hotel-card { display: flex !important; align-items: center !important; margin-bottom: 80px !important; position: relative !important; }
.jollify-luxury-theme .j-luxury-hotel-card.reverse { flex-direction: row-reverse !important; }
.jollify-luxury-theme .j-h-image { width: 60% !important; position: relative !important; z-index: 1 !important; }
.jollify-luxury-theme .j-h-image img { width: 100% !important; height: 400px !important; object-fit: cover !important; border-radius: 2px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.1) !important; }
.jollify-luxury-theme .j-h-info { width: 50% !important; background: #fff !important; padding: 50px 40px !important; position: relative !important; z-index: 2 !important; margin-left: -10% !important; box-shadow: 0 15px 40px rgba(0,0,0,0.06) !important; border: 1px solid #f9f9f9 !important; }
.jollify-luxury-theme .j-luxury-hotel-card.reverse .j-h-info { margin-left: 0 !important; margin-right: -10% !important; }
.jollify-luxury-theme .j-h-stars { color: var(--c-sec) !important; font-size: 14px !important; letter-spacing: 4px !important; margin-bottom: 10px !important; }
.jollify-luxury-theme .j-h-name { font-size: 26px !important; color: var(--c-pri) !important; margin: 0 0 15px 0 !important; font-weight: 400 !important; }
.jollify-luxury-theme .j-h-desc { font-size: 15px !important; color: #555 !important; line-height: 1.9 !important; text-align: justify !important; margin: 0 !important; }

/* Hotel: Grid */
.jollify-luxury-theme .j-hotel-grid-wrapper { max-width: 1100px !important; margin: 0 auto !important; padding: 0 20px !important; display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important;}
.jollify-luxury-theme .j-grid-hotel-card { background: #fff; border-radius: 6px; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border: 1px solid #eee;}
.jollify-luxury-theme .j-grid-hotel-card img { width: 100%; height: 220px; object-fit: cover; }
.jollify-luxury-theme .j-grid-h-info { padding: 25px; }
.jollify-luxury-theme .j-grid-h-info h4 { font-size: 20px !important; color: var(--c-pri) !important; margin: 0 0 10px 0 !important;}
.jollify-luxury-theme .j-grid-h-info p { font-size: 14px !important; color: #666 !important; line-height: 1.6 !important; margin:0;}

/* Scenic Spots: Shared */
.jollify-luxury-theme .j-spot-tag { display: inline-block !important; font-size: 11px !important; letter-spacing: 2px !important; background: rgba(76,42,133,0.08) !important; color: var(--c-pri) !important; padding: 3px 12px !important; border-radius: 12px !important; margin-bottom: 12px !important; border: 1px solid rgba(76,42,133,0.15) !important; }
.jollify-luxury-theme .j-spot-name { font-size: 24px !important; color: var(--c-pri) !important; font-weight: 400 !important; margin: 0 0 14px 0 !important; letter-spacing: 1px !important; }
.jollify-luxury-theme .j-spot-desc { font-size: 15px !important; color: #555 !important; line-height: 1.9 !important; text-align: justify !important; margin: 0 !important; }

/* Scenic Spots: fullimg */
.jollify-luxury-theme .j-spot-fullimg { margin-bottom: 60px !important; }
.jollify-luxury-theme .j-spot-fullimg:last-child { margin-bottom: 0 !important; }
.jollify-luxury-theme .j-spot-fi-img { width: 100% !important; overflow: hidden !important; border-radius: 2px !important; }
.jollify-luxury-theme .j-spot-fi-img img { width: 100% !important; height: 480px !important; object-fit: cover !important; display: block !important; transition: transform 0.5s ease !important; }
.jollify-luxury-theme .j-spot-fi-img img:hover { transform: scale(1.02) !important; }
.jollify-luxury-theme .j-spot-fi-caption { max-width: 700px !important; margin: 30px auto 0 auto !important; text-align: center !important; padding: 0 20px !important; }

/* Scenic Spots: ltr */
.jollify-luxury-theme .j-spot-ltr { display: flex !important; align-items: center !important; gap: 60px !important; margin-bottom: 70px !important; }
.jollify-luxury-theme .j-spot-ltr:last-child { margin-bottom: 0 !important; }
.jollify-luxury-theme .j-spot-ltr.reverse { flex-direction: row-reverse !important; }
.jollify-luxury-theme .j-spot-ltr-img { flex: 0 0 55% !important; }
.jollify-luxury-theme .j-spot-ltr-img img { width: 100% !important; height: 380px !important; object-fit: cover !important; border-radius: 2px !important; box-shadow: 0 15px 40px rgba(0,0,0,0.08) !important; display: block !important; }
.jollify-luxury-theme .j-spot-ltr-text { flex: 1 !important; }

/* Scenic Spots: grid */
.jollify-luxury-theme .j-spot-grid-wrapper { max-width: 1100px !important; margin: 0 auto !important; padding: 0 20px !important; display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important; }
.jollify-luxury-theme .j-spot-grid-card { background: #fff !important; border-radius: 6px !important; overflow: hidden !important; box-shadow: 0 5px 20px rgba(0,0,0,0.05) !important; border: 1px solid #eee !important; transition: transform 0.3s !important; }
.jollify-luxury-theme .j-spot-grid-card:hover { transform: translateY(-4px) !important; }
.jollify-luxury-theme .j-spot-grid-img img { width: 100% !important; height: 220px !important; object-fit: cover !important; display: block !important; }
.jollify-luxury-theme .j-spot-grid-info { padding: 25px !important; }
.jollify-luxury-theme .j-spot-grid-info .j-spot-name { font-size: 18px !important; }
.jollify-luxury-theme .j-spot-grid-info .j-spot-desc { font-size: 14px !important; }

/* Itinerary */
.jollify-luxury-theme .j-magazine-box { border: 1px solid #eee !important; border-radius: 2px !important; overflow: hidden !important; box-shadow: 0 15px 40px rgba(0,0,0,0.05) !important; background: #fff !important; }
.jollify-luxury-theme .j-tabs-row { display: flex !important; background: #561ca7ff !important; overflow-x: auto !important; -webkit-overflow-scrolling: touch !important; scrollbar-width: none; }
.jollify-luxury-theme .j-tabs-row::-webkit-scrollbar { display: none; }
.jollify-luxury-theme .j-day-tab { flex: 1 0 auto !important; min-width: 110px !important; padding: 20px 10px !important; background: transparent !important; border: none !important; color: #999 !important; cursor: pointer !important; text-align: center !important; border-bottom: 4px solid transparent !important; transition: 0.4s !important; border-radius: 8px 8px 0 0 !important; }
.jollify-luxury-theme .j-day-tab.is-active { color: #fff !important; border-bottom-color: var(--c-pri) !important; background: transparent !important; }
.jollify-luxury-theme .j-tab-num { display: block !important; font-size: 22px !important; font-weight: bold !important; margin-bottom: 2px !important;}
.jollify-luxury-theme .j-tab-label { font-size: 11px !important; letter-spacing: 1px !important; text-transform: uppercase !important;}
.jollify-luxury-theme .day-panel { width: 100% !important; }
.jollify-luxury-theme .day-grid { display: flex !important; min-height: 450px !important; }
.jollify-luxury-theme .day-grid.no-image { display: block !important; min-height: unset !important; }
.jollify-luxury-theme .day-grid.no-image .day-text-area { padding: 40px 50px !important; columns: 2 !important; column-gap: 60px !important; }
.jollify-luxury-theme .day-image-area { flex: 1 !important; position: relative !important; min-height: 350px !important; display: flex !important; flex-direction: column !important; justify-content: center !important; align-items: center !important; background: #f8f8f8 !important;}
.jollify-luxury-theme .day-image-area img { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: 1 !important;}
.jollify-luxury-theme .day-stamp { position: absolute !important; top: 20px !important; left: 20px !important; background: var(--c-pri) !important; color: #fff !important; padding: 6px 15px !important; font-size: 13px !important; letter-spacing: 2px !important; border-radius: 2px !important; z-index: 2 !important; }
.jollify-luxury-theme .img-slot { text-align: center !important; color: #aaa !important; font-size: 13px !important; z-index: 1 !important; }
.jollify-luxury-theme .img-slot .slot-label { display: block !important; font-weight: bold !important; color: var(--c-pri) !important; }
.jollify-luxury-theme .day-text-area { flex: 1 !important; padding: 50px 40px !important; display: flex !important; flex-direction: column !important; justify-content: center !important; }
.jollify-luxury-theme .day-route { display: inline-block !important; font-size: 12px !important; color: var(--c-sec) !important; margin-bottom: 15px !important; letter-spacing: 1px !important; font-weight: bold !important; }
.jollify-luxury-theme .day-title { font-size: 26px !important; font-weight: 400 !important; color: var(--c-pri) !important; margin-bottom: 20px !important; }
.jollify-luxury-theme .day-lead { color: #555 !important; font-size: 15px !important; line-height: 1.9 !important; margin-bottom: 20px !important; text-align: justify !important;}
.jollify-luxury-theme .day-points { margin: 0 0 25px 0 !important; padding-left: 20px !important; color: #444 !important; font-size: 14px !important; line-height: 1.8 !important; }
.jollify-luxury-theme .day-points li { margin-bottom: 8px !important; }
.jollify-luxury-theme .day-meals-row { display: flex !important; flex-wrap: wrap !important; gap: 15px !important; margin-bottom: 25px !important; padding: 15px !important; background: #fdfdfd !important; border: 1px solid #eee !important; border-radius: 4px !important; font-size: 13px !important; color: #555 !important;}
.jollify-luxury-theme .day-meals-row span strong { color: var(--c-pri) !important; margin-right: 5px !important; font-family: Arial, sans-serif !important; }
.jollify-luxury-theme .day-stay { display: flex !important; align-items: center !important; }
.jollify-luxury-theme .stay-label { font-size: 11px !important; letter-spacing: 2px !important; text-transform: uppercase !important; color: #888 !important; border: 1px solid #ddd !important; padding: 4px 10px !important; border-radius: 20px !important; margin-right: 12px !important; }
.jollify-luxury-theme .stay-name { font-size: 15px !important; font-weight: bold !important; color: var(--c-sec) !important; }

/* Notice */
.jollify-luxury-theme .j-notice-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 30px !important; }
.jollify-luxury-theme .j-notice-item { background: #fff !important; border-left: 3px solid var(--c-sec) !important; padding: 25px !important; box-shadow: 0 4px 15px rgba(0,0,0,0.03) !important; border-radius: 0 6px 6px 0 !important;}
.jollify-luxury-theme .j-notice-item h4 { font-size: 18px !important; color: var(--c-pri) !important; margin: 0 0 15px 0 !important; display: flex !important; align-items: center !important; gap: 10px !important;}
.jollify-luxury-theme .j-n-num { background: var(--c-pri) !important; color: #fff !important; width: 24px !important; height: 24px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important; font-size: 12px !important; font-weight: bold !important;}
.jollify-luxury-theme .j-notice-item p { font-size: 14px !important; color: #666 !important; line-height: 1.8 !important; margin: 0 !important;}

/* Recommend */
.jollify-luxury-theme .j-rec-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important; }
.jollify-luxury-theme .j-rec-card { display: block !important; text-decoration: none !important; background: #fff !important; border-radius: 6px !important; overflow: hidden !important; box-shadow: 0 5px 20px rgba(0,0,0,0.05) !important; transition: 0.3s !important; border: 1px solid #eee !important;}
.jollify-luxury-theme .j-rec-card:hover { transform: translateY(-5px) !important; box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
.jollify-luxury-theme .j-rec-img { width: 100% !important; height: 200px !important; background-size: cover !important; background-position: center !important; }
.jollify-luxury-theme .j-rec-txt { padding: 20px !important; text-align: center !important;}
.jollify-luxury-theme .j-rec-txt h5 { font-size: 18px !important; color: var(--c-pri) !important; margin: 0 0 15px 0 !important; font-weight: 400 !important;}
.jollify-luxury-theme .j-rec-btn { font-size: 13px !important; color: var(--c-sec) !important; letter-spacing: 1px !important; font-weight: bold !important;}

/* RWD */
@media (max-width: 900px) {
    .jollify-luxury-theme .j-quickinfo { flex-wrap: wrap !important; }
    .jollify-luxury-theme .j-quick-item { flex: 1 1 50% !important; border-right: none !important; border-bottom: 1px solid #eee !important; padding: 15px 0 !important; }
    .jollify-luxury-theme .j-hl-grid, .jollify-luxury-theme .j-notice-grid, .jollify-luxury-theme .j-hotel-grid-wrapper, .jollify-luxury-theme .j-rec-grid { grid-template-columns: 1fr !important; }
    .jollify-luxury-theme .j-editorial-flight-box { padding: 30px 20px !important; }
    .jollify-luxury-theme .j-editorial-route { flex-direction: column !important; padding-bottom: 30px !important; }
    .jollify-luxury-theme .j-e-divider { margin: 20px 0 !important; width: 100% !important; }
    .jollify-luxury-theme .j-luxury-hotel-card, .jollify-luxury-theme .j-luxury-hotel-card.reverse { flex-direction: column !important; margin-bottom: 50px !important; }
    .jollify-luxury-theme .j-h-image { width: 100% !important; }
    .jollify-luxury-theme .j-h-info { width: 90% !important; margin: -50px auto 0 auto !important; padding: 30px 25px !important; text-align: center !important; }
    .jollify-luxury-theme .j-h-desc { text-align: left !important; }
    .jollify-luxury-theme .day-panel { overflow: hidden !important; }
    .jollify-luxury-theme .day-grid { display: flex !important; flex-direction: row !important; overflow-x: auto !important; scroll-snap-type: x mandatory !important; -webkit-overflow-scrolling: touch !important; gap: 0 !important; position: relative !important; }
    .jollify-luxury-theme .day-image-area, .jollify-luxury-theme .day-text-area { flex: 0 0 88% !important; scroll-snap-align: start !important; }
    .jollify-luxury-theme .day-grid::after { content: '' !important; position: sticky !important; right: 0 !important; flex: 0 0 34px !important; width: 34px !important; pointer-events: none !important; background: linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.92)) !important; }
    .jollify-luxury-theme .day-grid.is-swipe-hint { animation: jollifySwipeHint 1.35s ease-in-out 0.4s 1 !important; }
    .jollify-luxury-theme .day-grid::-webkit-scrollbar { display: none !important; }
    .jollify-luxury-theme .day-text-area { padding: 30px 20px !important; }
    .jollify-luxury-theme .j-spot-grid-wrapper { grid-template-columns: 1fr !important; }
    .jollify-luxury-theme .j-spot-ltr, .jollify-luxury-theme .j-spot-ltr.reverse { flex-direction: column !important; gap: 25px !important; margin-bottom: 50px !important; }
    .jollify-luxury-theme .j-spot-ltr-img { flex: none !important; width: 100% !important; }
    .jollify-luxury-theme .j-spot-ltr-img img { height: 260px !important; }
    .jollify-luxury-theme .j-spot-fi-img img { height: 280px !important; }
}

@keyframes jollifySwipeHint {
    0% { transform: translateX(0); }
    30% { transform: translateX(-18px); }
    60% { transform: translateX(8px); }
    100% { transform: translateX(0); }
}
`;
};

export const generateJs = () => {
  return `
    $(document).ready(function(){
        var container = $('#jollify-tour-module');
        if(container.length === 0) return;
        container.on('click', '.j-day-tab', function(e){
            e.preventDefault();
            container.find('.j-day-tab').removeClass('is-active');
            container.find('.j-day-panel').hide().removeClass('is-active');
            $(this).addClass('is-active');
            var targetPanel = container.find('#' + $(this).data('target'));
            if(targetPanel.length) { targetPanel.show().addClass('is-active'); }
        });
    });
`;
};
