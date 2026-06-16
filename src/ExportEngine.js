export const generateHtml = (itinerary, flights, days, hotels, cta = {}, origin = '', moduleOrder = []) => {
  const { hero_data, highlights, spots, notices, recommended } = itinerary;

  const order = (moduleOrder && moduleOrder.length > 0)
    ? moduleOrder.filter(k => k !== 'quick_info' && k !== 'quick')
    : ['hero', 'highlights', 'spots', 'flights', 'hotels', 'days', 'notices', 'recommended'];

  let html = `<div class="jollify-luxury-theme" id="jollify-tour-module">`;

  order.forEach(moduleKey => {
    switch (moduleKey) {
      case 'hero':
        if (hero_data?.visible !== false) {
          let tagsHtml = '';
          if (hero_data?.tags) {
            const tagsList = hero_data.tags.split('\n').filter(t => t.trim());
            if (tagsList.length > 0) {
              tagsHtml += `<div class="k-hero__tags">`;
              tagsList.forEach(t => {
                tagsHtml += `<span class="k-tag">${t}</span>`;
              });
              tagsHtml += `</div>`;
            }
          }
          html += `<div class="j-hero wow fadeIn"><div class="j-hero-overlay"></div><img src="${hero_data?.image || ''}" alt="Banner"><div class="j-hero-content"><span class="j-hero-sub">${hero_data?.title2 || ''}</span><h1 class="j-hero-title">${hero_data?.title1 || ''}</h1>${tagsHtml}</div></div>`;
        }
        break;
      case 'highlights':
        if (highlights?.visible !== false) {
          let hlHtml = '';
          const layout = highlights?.layout || 'grid';
          (highlights?.items || []).forEach((c, i) => {
            if (layout === 'grid') {
              hlHtml += `<div class="j-hl-item wow fadeInUp" data-wow-delay="${i * 0.1}s"><svg class="j-hl-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg><h4 class="j-hl-title">${c.title || ''}</h4><p class="j-hl-desc">${c.desc || ''}</p></div>`;
            } else if (layout === 'card') {
              hlHtml += `
              <div class="j-hl-card-item wow fadeInUp" data-wow-delay="${i * 0.1}s">
                <div class="j-hl-card-img">
                  ${c.img ? `<img src="${c.img}" alt="${c.title || ''}">` : `<div class="j-hl-img-placeholder">✦</div>`}
                </div>
                <div class="j-hl-card-info">
                  <h4 class="j-hl-card-title">${c.title || ''}</h4>
                  <p class="j-hl-card-desc">${(c.desc || '').replace(/\n/g, '<br>')}</p>
                </div>
              </div>`;
            } else if (layout === 'overlap') {
              const isRev = i % 2 !== 0 ? 'reverse' : '';
              hlHtml += `
              <div class="j-hl-overlap-item ${isRev} wow fadeInUp">
                <div class="j-hl-overlap-img">
                  ${c.img ? `<img src="${c.img}" alt="${c.title || ''}">` : `<div class="j-hl-img-placeholder">✦</div>`}
                </div>
                <div class="j-hl-overlap-info">
                  <h4 class="j-hl-overlap-title">${c.title || ''}</h4>
                  <p class="j-hl-overlap-desc">${(c.desc || '').replace(/\n/g, '<br>')}</p>
                </div>
              </div>`;
            }
          });
          if (hlHtml) {
            const wrapClass = layout === 'grid' ? 'j-hl-grid' : (layout === 'card' ? 'j-hl-card-grid' : 'j-hl-overlap-wrapper');
            html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Highlights</span><h2>行程特色 ‧ 奢旅亮點</h2></div><div class="j-wrapper"><div class="${wrapClass}">${hlHtml}</div></div></div>`;
          }
        }
        break;
      case 'spots':
        if (spots?.visible !== false) {
          let spotHtml = '';
          const spotLayout = spots?.layout || 'fullimg';
          (spots?.items || []).forEach((c, i) => {
            let tagHtml = '';
            if (c.tag) {
              const tags = c.tag.split(/[\s,，、]+/).filter(t => t.trim());
              tags.forEach(t => {
                tagHtml += `<span class="j-spot-tag">${t}</span>`;
              });
            }
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
        break;
      case 'flights':
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
        break;
      case 'hotels':
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
        break;
      case 'days':
        if (days?.visible !== false) {
          const daysLayout = days?.layout || 'leftimg';
          if (daysLayout === 'timeline') {
            const totalDays = (days?.items || []).length;
            const totalNights = totalDays > 1 ? totalDays - 1 : 0;
            
            let daysHtml = '';
            (days?.items || []).forEach((c, i) => {
              // 解析 points 成時間線 k-tl
              let tlHtml = '';
              if (c.points) {
                const lines = c.points.split('\n').filter(p => p.trim());
                if (lines.length > 0) {
                  tlHtml += `<div class="k-tl">`;
                  lines.forEach(line => {
                    const parts = line.split('|');
                    let lbl = '', ev = '', note = '';
                    if (parts.length >= 3) {
                      lbl = parts[0].trim();
                      ev = parts[1].trim();
                      note = parts[2].trim();
                    } else if (parts.length === 2) {
                      ev = parts[0].trim();
                      note = parts[1].trim();
                    } else {
                      ev = line.trim();
                    }
                    
                    tlHtml += `
                      <div class="k-tl__item">
                        <div class="k-tl__dot"></div>
                        ${lbl ? `<p class="k-tl__lbl">${lbl}</p>` : ''}
                        <p class="k-tl__ev">${ev}</p>
                        ${note ? `<p class="k-tl__note">${note}</p>` : ''}
                      </div>`;
                  });
                  tlHtml += `</div>`;
                }
              }
              
              // 解析 pills
              let pillsHtml = '';
              if (c.image?.label) {
                pillsHtml += `<span class="k-pill k-pill--star">⭐ ${c.image.label}</span>`;
              }
              if (c.stay) {
                pillsHtml += `<span class="k-pill k-pill--hotel">🏨 ${c.stay}</span>`;
              }
              if (c.image?.subtitle) {
                pillsHtml += `<span class="k-pill">🛏️ ${c.image.subtitle}</span>`;
              }
              if (c.meals?.show !== false && c.meals) {
                const { breakfast, lunch, dinner } = c.meals;
                if (breakfast) pillsHtml += `<span class="k-pill">🍽️ 早: ${breakfast}</span>`;
                if (lunch) pillsHtml += `<span class="k-pill">🍽️ 午: ${lunch}</span>`;
                if (dinner) pillsHtml += `<span class="k-pill">🍽️ 晚: ${dinner}</span>`;
              }
              
              daysHtml += `
                <div class="k-day wow fadeInUp">
                  <div class="k-day__num"><span class="k-day__n">${i + 1}</span><span class="k-day__d">DAY</span></div>
                  <div class="k-day__body">
                    ${c.route ? `<div class="k-day__route">${c.route}</div>` : ''}
                    <h3 class="k-day__title">${c.title || ''}</h3>
                    <p class="k-day__desc">${(c.lead || '').replace(/\n/g, '<br>')}</p>
                    ${tlHtml}
                    ${pillsHtml ? `<div class="k-day__pills" style="margin-top:1rem;">${pillsHtml}</div>` : ''}
                  </div>
                </div>`;
            });
            
            html += `
              <div class="j-section bg-light-gray k-sec k-sec--mist" id="itinerary">
                <div class="j-wrapper k-wrap">
                  <div class="wow fadeInUp" style="margin-bottom:3rem; text-align:center;">
                    <p class="k-label" style="display:inline-block; font-size: 11px; letter-spacing: 3px; background: var(--c-sec); color: #fff; padding: 5px 15px; border-radius: 20px; text-transform: uppercase; margin-bottom:15px;">逐日行程</p>
                    <h2 class="k-h2" style="font-size:32px; color:var(--c-pri); font-weight:bold; letter-spacing:2px; margin:0;">${totalDays} 天 ${totalNights} 夜完整規劃</h2>
                    <div class="k-rule" style="width:50px; height:2px; background:var(--c-sec); margin:15px auto 0 auto;"></div>
                  </div>
                  <div class="k-days">${daysHtml}</div>
                </div>
              </div>`;
          } else {
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
                  <div class="day-grid j-day-layout-${daysLayout}${hasImg ? '' : ' no-image'}">
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
        }
        break;
      case 'notices':
        if (notices?.visible !== false) {
          let nHtml = '';
          (notices?.items || []).forEach((c, i) => {
            nHtml += `
            <div class="j-accordion-item wow fadeInUp" data-wow-delay="${i * 0.1}s">
              <button class="j-accordion-header" type="button">
                <span class="j-n-num">${i + 1}</span>
                <span class="j-accordion-title">${c.t || ''}</span>
                <span class="j-accordion-icon"></span>
              </button>
              <div class="j-accordion-content">
                <div class="j-accordion-content-inner">
                  <p>${(c.desc || '').replace(/\n/g, '<br>')}</p>
                </div>
              </div>
            </div>`;
          });
          if (nHtml) {
            html += `<div class="j-section bg-light-gray"><div class="j-heading wow fadeInUp"><span class="j-badge">Notices</span><h2>報名注意事項</h2></div><div class="j-wrapper"><div class="j-accordion">${nHtml}</div></div></div>`;
          }
        }
        break;
      case 'recommended':
        if (recommended?.visible !== false) {
          let rHtml = '';
          (recommended?.items || []).forEach((c, i) => {
            rHtml += `<a href="${c.link || '#'}" target="_blank" class="j-rec-card wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-rec-img" style="background-image:url('${c.img || ''}')"></div><div class="j-rec-txt"><h5>${c.t || ''}</h5><span class="j-rec-btn">查看行程 &rarr;</span></div></a>`;
          });
          if (rHtml) {
            html += `<div class="j-section"><div class="j-heading wow fadeInUp"><span class="j-badge">Recommended</span><h2>探索更多奢華旅程</h2></div><div class="j-wrapper"><div class="j-rec-grid">${rHtml}</div></div></div>`;
          }
        }
        break;
    }
  });

  // 10. Floating CTA
  if (cta?.visible !== false && (cta?.cta_register_url || cta?.cta_line_url)) {
    html += '<div class="j-floating-cta">';
    if (cta.cta_line_url) {
      html += `<a href="${cta.cta_line_url}" target="_blank" class="j-cta-btn j-cta-line"><svg viewBox="0 0 24 24"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.038 9.608.391.084.922.258 1.057.592.121.298.039.756.016.953l-.168 1.011c-.053.307-.243 1.18.591.82 1.037-.446 5.58-3.284 7.971-5.882 1.636-1.782 2.495-3.682 2.495-7.102"/></svg>LINE 客服</a>`;
    }
    if (cta.cta_register_url) {
      html += `<a href="${cta.cta_register_url}" target="_blank" class="j-cta-btn j-cta-register">我要報名</a>`;
    }
    html += '</div>';
  }

  html += `</div>`;

  if (origin) {
    html += `\n<!-- 鑫囍探索 經典版專用樣式與腳本 (自動引入) -->\n`;
    html += `<link rel="stylesheet" href="${origin}/assets/classic/theme.css">\n`;
    html += `<script src="${origin}/assets/classic/theme.js"></script>\n`;
  }

  return html;
};

export const generateCss = () => {
  return `.jollify-luxury-theme { --c-pri: #4c2a85; --c-sec: #d4a93b; --c-bg: #fff; font-family: "Noto Serif TC", "PingFang TC", "Microsoft JhengHei", serif !important; color: #333 !important; line-height: 1.6 !important; width: 100% !important; background: var(--c-bg) !important; padding-bottom:50px;}
.jollify-luxury-theme button, .jollify-luxury-theme input, .jollify-luxury-theme select, .jollify-luxury-theme textarea { font-family: inherit !important; }
.jollify-luxury-theme .j-wrapper { max-width: 1000px !important; margin: 0 auto !important; padding: 0 20px !important; }
.jollify-luxury-theme .j-section { padding: 60px 0 !important; }
.jollify-luxury-theme .bg-light-gray { background: #f9f9fb !important; border-top: 1px solid #eee; border-bottom: 1px solid #eee;}
.jollify-luxury-theme .j-heading { text-align: center !important; margin-bottom: 50px !important; }
.jollify-luxury-theme .j-badge { display: inline-block !important; font-size: 11px !important; letter-spacing: 3px !important; background: var(--c-sec) !important; color: #fff !important; padding: 5px 15px !important; border-radius: 20px !important; margin-bottom: 15px !important; text-transform: uppercase; }
.jollify-luxury-theme .j-heading h2 { font-size: 32px !important; color: var(--c-pri) !important; margin: 0 !important; font-weight: bold !important; letter-spacing: 2px !important;}

/* Hero Banner */
.jollify-luxury-theme .j-hero { position: relative !important; width: 100% !important; height: 60vh !important; min-height: 400px !important; display: flex !important; align-items: center !important; justify-content: center !important; text-align: center !important; z-index:1;}
.jollify-luxury-theme .j-hero img { position: absolute !important; inset: 0 !important; width: 100% !important; height: 100% !important; object-fit: cover !important; z-index: 1 !important; }
.jollify-luxury-theme .j-hero-overlay { position: absolute !important; inset: 0 !important; background: rgba(0,0,0,0.4) !important; z-index: 2 !important; }
.jollify-luxury-theme .j-hero-content { position: relative !important; z-index: 3 !important; color: white !important; }
.jollify-luxury-theme .j-hero-sub { font-size: 20px !important; font-weight: 600 !important; letter-spacing: 4px !important; color: var(--c-sec) !important; display: block !important; margin-bottom: 15px !important; text-transform: uppercase; text-shadow: 0 2px 4px rgba(0,0,0,0.5) !important; }
.jollify-luxury-theme .j-hero-title { font-size: 48px !important; font-weight: bold !important; letter-spacing: 2px !important; margin: 0 !important; text-shadow: 0 2px 8px rgba(0,0,0,0.6) !important; }

/* Highlights */
.jollify-luxury-theme .j-hl-grid { display: grid !important; grid-template-columns: repeat(2, 1fr) !important; gap: 40px !important; }
.jollify-luxury-theme .j-hl-item { text-align: center !important; }
.jollify-luxury-theme .j-hl-icon { width: 45px !important; height: 45px !important; color: var(--c-sec) !important; margin-bottom: 15px !important; opacity:0.8;}
.jollify-luxury-theme .j-hl-title { font-size: 20px !important; color: var(--c-pri) !important; font-weight: 400 !important; margin-bottom: 12px !important; }
.jollify-luxury-theme .j-hl-desc { font-size: 15px !important; color: #666 !important; text-align: justify !important; line-height: 1.8 !important;}

/* Highlights: card */
.jollify-luxury-theme .j-hl-card-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important; }
.jollify-luxury-theme .j-hl-card-item { background: #fff !important; border: 1px solid #eee !important; border-radius: 12px !important; overflow: hidden !important; box-shadow: 0 4px 15px rgba(0,0,0,0.03) !important; display: flex !important; flex-direction: column !important; transition: transform 0.3s ease !important; }
.jollify-luxury-theme .j-hl-card-item:hover { transform: translateY(-5px) !important; box-shadow: 0 10px 25px rgba(0,0,0,0.06) !important; }
.jollify-luxury-theme .j-hl-card-img { width: 100% !important; height: 200px !important; background: #fafafa !important; overflow: hidden !important; display: flex !important; align-items: center !important; justify-content: center !important; }
.jollify-luxury-theme .j-hl-card-img img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
.jollify-luxury-theme .j-hl-img-placeholder { font-size: 36px !important; color: var(--c-sec) !important; }
.jollify-luxury-theme .j-hl-card-info { padding: 25px !important; flex-grow: 1 !important; display: flex !important; flex-direction: column !important; }
.jollify-luxury-theme .j-hl-card-title { font-size: 20px !important; color: var(--c-pri) !important; font-weight: bold !important; margin: 0 0 12px 0 !important; }
.jollify-luxury-theme .j-hl-card-desc { font-size: 14px !important; color: #666 !important; line-height: 1.7 !important; text-align: justify !important; margin: 0 !important; }

/* Highlights: overlap */
.jollify-luxury-theme .j-hl-overlap-wrapper { display: flex !important; flex-direction: column !important; gap: 60px !important; }
.jollify-luxury-theme .j-hl-overlap-item { display: flex !important; align-items: center !important; gap: 50px !important; position: relative !important; }
.jollify-luxury-theme .j-hl-overlap-item.reverse { flex-direction: row-reverse !important; }
.jollify-luxury-theme .j-hl-overlap-img { width: 55% !important; height: 350px !important; background: #fafafa !important; overflow: hidden !important; border-radius: 12px !important; box-shadow: 0 15px 35px rgba(0,0,0,0.08) !important; display: flex !important; align-items: center !important; justify-content: center !important; z-index: 1 !important; }
.jollify-luxury-theme .j-hl-overlap-img img { width: 100% !important; height: 100% !important; object-fit: cover !important; }
.jollify-luxury-theme .j-hl-overlap-info { width: 50% !important; background: #fff !important; padding: 45px 40px !important; box-shadow: 0 10px 30px rgba(0,0,0,0.05) !important; border: 1px solid #f3f4f6 !important; border-radius: 12px !important; position: relative !important; z-index: 2 !important; margin-left: -8% !important; }
.jollify-luxury-theme .j-hl-overlap-item.reverse .j-hl-overlap-info { margin-left: 0 !important; margin-right: -8% !important; }
.jollify-luxury-theme .j-hl-overlap-title { font-size: 24px !important; color: var(--c-pri) !important; font-weight: bold !important; margin: 0 0 15px 0 !important; }
.jollify-luxury-theme .j-hl-overlap-desc { font-size: 15px !important; color: #555 !important; line-height: 1.8 !important; text-align: justify !important; margin: 0 !important; }

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
.jollify-luxury-theme .j-h-image img { width: 100% !important; height: 400px !important; object-fit: cover !important; border-radius: 12px !important; box-shadow: 0 20px 50px rgba(0,0,0,0.1) !important; }
.jollify-luxury-theme .j-h-info { width: 50% !important; background: #fff !important; padding: 50px 40px !important; position: relative !important; z-index: 2 !important; margin-left: -10% !important; box-shadow: 0 15px 40px rgba(0,0,0,0.06) !important; border: 1px solid #f9f9f9 !important; border-radius: 12px !important; }
.jollify-luxury-theme .j-luxury-hotel-card.reverse .j-h-info { margin-left: 0 !important; margin-right: -10% !important; }
.jollify-luxury-theme .j-h-stars { color: var(--c-sec) !important; font-size: 14px !important; letter-spacing: 4px !important; margin-bottom: 10px !important; }
.jollify-luxury-theme .j-h-name { font-size: 26px !important; color: var(--c-pri) !important; margin: 0 0 15px 0 !important; font-weight: 400 !important; }
.jollify-luxury-theme .j-h-desc { font-size: 15px !important; color: #555 !important; line-height: 1.9 !important; text-align: justify !important; margin: 0 !important; }
 
/* Hotel: Grid */
.jollify-luxury-theme .j-hotel-grid-wrapper { max-width: 1100px !important; margin: 0 auto !important; padding: 0 20px !important; display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important;}
.jollify-luxury-theme .j-grid-hotel-card { background: #fff; border-radius: 12px !important; overflow: hidden; box-shadow: 0 5px 20px rgba(0,0,0,0.05); border: 1px solid #eee;}
.jollify-luxury-theme .j-grid-hotel-card img { width: 100%; height: 220px; object-fit: cover; }
.jollify-luxury-theme .j-grid-h-info { padding: 25px; }
.jollify-luxury-theme .j-grid-h-info h4 { font-size: 20px !important; color: var(--c-pri) !important; margin: 0 0 10px 0 !important;}
.jollify-luxury-theme .j-grid-h-info p { font-size: 14px !important; color: #666 !important; line-height: 1.6 !important; margin:0;}

/* Scenic Spots: Shared */
.jollify-luxury-theme .j-spot-tag { display: inline-block !important; font-size: 11px !important; letter-spacing: 2px !important; background: rgba(76,42,133,0.08) !important; color: var(--c-pri) !important; padding: 3px 12px !important; border-radius: 12px !important; margin-right: 6px !important; margin-bottom: 12px !important; border: 1px solid rgba(76,42,133,0.15) !important; }
.jollify-luxury-theme .j-spot-name { font-size: 24px !important; color: var(--c-pri) !important; font-weight: 400 !important; margin: 0 0 14px 0 !important; letter-spacing: 1px !important; }
.jollify-luxury-theme .j-spot-desc { font-size: 15px !important; color: #555 !important; line-height: 1.9 !important; text-align: justify !important; margin: 0 !important; }

/* Scenic Spots: fullimg */
.jollify-luxury-theme .j-spot-fullimg { margin-bottom: 60px !important; }
.jollify-luxury-theme .j-spot-fullimg:last-child { margin-bottom: 0 !important; }
.jollify-luxury-theme .j-spot-fi-img { width: 100% !important; overflow: hidden !important; border-radius: 16px !important; }
.jollify-luxury-theme .j-spot-fi-img img { width: 100% !important; height: 480px !important; object-fit: cover !important; display: block !important; transition: transform 0.5s ease !important; }
.jollify-luxury-theme .j-spot-fi-img img:hover { transform: scale(1.02) !important; }
.jollify-luxury-theme .j-spot-fi-caption { max-width: 700px !important; margin: 30px auto 0 auto !important; text-align: center !important; padding: 0 20px !important; }

/* Scenic Spots: ltr */
.jollify-luxury-theme .j-spot-ltr { display: flex !important; align-items: center !important; gap: 60px !important; margin-bottom: 70px !important; }
.jollify-luxury-theme .j-spot-ltr:last-child { margin-bottom: 0 !important; }
.jollify-luxury-theme .j-spot-ltr.reverse { flex-direction: row-reverse !important; }
.jollify-luxury-theme .j-spot-ltr-img { flex: 0 0 55% !important; }
.jollify-luxury-theme .j-spot-ltr-img img { width: 100% !important; height: 380px !important; object-fit: cover !important; border-radius: 16px !important; box-shadow: 0 15px 40px rgba(0,0,0,0.08) !important; display: block !important; }
.jollify-luxury-theme .j-spot-ltr-text { flex: 1 !important; }

/* Scenic Spots: grid */
.jollify-luxury-theme .j-spot-grid-wrapper { max-width: 1100px !important; margin: 0 auto !important; padding: 0 20px !important; display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important; }
.jollify-luxury-theme .j-spot-grid-card { background: #fff !important; border-radius: 12px !important; overflow: hidden !important; box-shadow: 0 5px 20px rgba(0,0,0,0.05) !important; border: 1px solid #eee !important; transition: transform 0.3s !important; }
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
.jollify-luxury-theme .j-day-tab.is-active { color: #fff !important; border-bottom-color: var(--c-sec) !important; background: rgba(255, 255, 255, 0.12) !important; }
.jollify-luxury-theme .j-tab-num { display: block !important; font-size: 22px !important; font-weight: bold !important; margin-bottom: 2px !important;}
.jollify-luxury-theme .j-tab-label { font-size: 11px !important; letter-spacing: 1px !important; text-transform: uppercase !important;}
.jollify-luxury-theme .day-panel { width: 100% !important; }
.jollify-luxury-theme .day-grid { display: flex !important; min-height: 450px !important; }
.jollify-luxury-theme .j-day-layout-rightimg { flex-direction: row-reverse !important; }
.jollify-luxury-theme .j-day-layout-topimg { flex-direction: column !important; }
.jollify-luxury-theme .j-day-layout-topimg .day-image-area { flex: none !important; width: 100% !important; height: 350px !important; min-height: unset !important; }
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

/* Notice (Accordion) */
.jollify-luxury-theme .j-accordion { max-width: 850px !important; margin: 0 auto !important; display: flex !important; flex-direction: column !important; gap: 16px !important; }
.jollify-luxury-theme .j-accordion-item { background: #fff !important; border: 1px solid #e5e7eb !important; border-radius: 8px !important; overflow: hidden !important; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.02) !important; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important; }
.jollify-luxury-theme .j-accordion-item.is-active { border-color: var(--c-sec) !important; box-shadow: 0 10px 25px rgba(76, 42, 133, 0.06) !important; }
.jollify-luxury-theme .j-accordion-header { width: 100% !important; background: none !important; border: none !important; padding: 22px 28px !important; display: flex !important; align-items: center !important; text-align: left !important; cursor: pointer !important; outline: none !important; transition: background-color 0.2s ease !important; }
.jollify-luxury-theme .j-accordion-header:hover { background-color: #fafafc !important; }
.jollify-luxury-theme .j-n-num { background: var(--c-pri) !important; color: #fff !important; width: 28px !important; height: 28px !important; display: inline-flex !important; align-items: center !important; justify-content: center !important; border-radius: 50% !important; font-size: 13px !important; font-weight: bold !important; flex-shrink: 0 !important; }
.jollify-luxury-theme .j-accordion-title { font-size: 18px !important; color: var(--c-pri) !important; font-weight: bold !important; flex-grow: 1 !important; margin: 0 0 0 16px !important; letter-spacing: 0.5px !important; }
.jollify-luxury-theme .j-accordion-icon { width: 14px !important; height: 14px !important; position: relative !important; transition: transform 0.3s ease !important; flex-shrink: 0 !important; margin-left: 10px !important; }
.jollify-luxury-theme .j-accordion-icon::before, .jollify-luxury-theme .j-accordion-icon::after { content: '' !important; position: absolute !important; background-color: var(--c-sec) !important; transition: transform 0.3s ease !important; }
.jollify-luxury-theme .j-accordion-icon::before { top: 6px !important; left: 0 !important; width: 14px !important; height: 2px !important; }
.jollify-luxury-theme .j-accordion-icon::after { top: 0 !important; left: 6px !important; width: 2px !important; height: 14px !important; }
.jollify-luxury-theme .j-accordion-item.is-active .j-accordion-icon { transform: rotate(135deg) !important; }
.jollify-luxury-theme .j-accordion-content { max-height: 0 !important; overflow: hidden !important; transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1) !important; background-color: #fafafc !important; }
.jollify-luxury-theme .j-accordion-item.is-active .j-accordion-content { max-height: 1000px !important; }
.jollify-luxury-theme .j-accordion-content-inner { padding: 24px 28px 28px 72px !important; border-top: 1px solid #f3f4f6 !important; font-size: 15px !important; color: #4b5563 !important; line-height: 1.8 !important; text-align: justify !important; }

/* Recommend */
.jollify-luxury-theme .j-rec-grid { display: grid !important; grid-template-columns: repeat(3, 1fr) !important; gap: 30px !important; }
.jollify-luxury-theme .j-rec-card { display: block !important; text-decoration: none !important; background: #fff !important; border-radius: 12px !important; overflow: hidden !important; box-shadow: 0 5px 20px rgba(0,0,0,0.05) !important; transition: 0.3s !important; border: 1px solid #eee !important;}
.jollify-luxury-theme .j-rec-card:hover { transform: translateY(-5px) !important; box-shadow: 0 15px 30px rgba(0,0,0,0.1) !important; }
.jollify-luxury-theme .j-rec-img { width: 100% !important; height: 200px !important; background-size: cover !important; background-position: center !important; }
.jollify-luxury-theme .j-rec-txt { padding: 20px !important; text-align: center !important;}
.jollify-luxury-theme .j-rec-txt h5 { font-size: 18px !important; color: var(--c-pri) !important; margin: 0 0 15px 0 !important; font-weight: 400 !important;}
.jollify-luxury-theme .j-rec-btn { font-size: 13px !important; color: var(--c-sec) !important; letter-spacing: 1px !important; font-weight: bold !important;}

/* Floating CTA */
.jollify-luxury-theme .j-floating-cta {
    position: fixed !important;
    bottom: 20px !important;
    right: 20px !important;
    z-index: 9000 !important;
    display: flex !important;
    flex-direction: column !important;
    gap: 10px !important;
    align-items: flex-end !important;
}
.jollify-luxury-theme .j-cta-btn {
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    text-decoration: none !important;
    border-radius: 50px !important;
    font-weight: bold !important;
    transition: 0.3s !important;
    box-shadow: 0 4px 15px rgba(0,0,0,0.2) !important;
}
.jollify-luxury-theme .j-cta-btn:hover {
    transform: scale(1.05) !important;
}
.jollify-luxury-theme .j-cta-line {
    background: #06C755 !important;
    color: #fff !important;
    padding: 12px 20px !important;
    font-family: sans-serif !important;
}
.jollify-luxury-theme .j-cta-line svg {
    width: 20px !important;
    height: 20px !important;
    fill: currentColor !important;
    margin-right: 8px !important;
}
.jollify-luxury-theme .j-cta-register {
    background: linear-gradient(to right, #C5A059, #a08147) !important;
    color: #fff !important;
    padding: 12px 24px !important;
    letter-spacing: 1px !important;
    font-size: 16px !important;
    font-family: serif !important;
    border: 1px solid rgba(255,255,255,0.3) !important;
}

/* RWD */
@media (max-width: 900px) {
    .jollify-luxury-theme .j-hl-grid, .jollify-luxury-theme .j-hl-card-grid, .jollify-luxury-theme .j-hotel-grid-wrapper, .jollify-luxury-theme .j-rec-grid { grid-template-columns: 1fr !important; }
    .jollify-luxury-theme .j-hl-overlap-item, .jollify-luxury-theme .j-hl-overlap-item.reverse { flex-direction: column !important; gap: 20px !important; }
    .jollify-luxury-theme .j-hl-overlap-img { width: 100% !important; height: 240px !important; }
    .jollify-luxury-theme .j-hl-overlap-info { width: 92% !important; margin: -40px auto 0 auto !important; padding: 25px 20px !important; }
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

/* Hero Tags */
.jollify-luxury-theme .k-hero__tags {
    display: flex !important;
    flex-wrap: wrap !important;
    justify-content: center !important;
    gap: 10px !important;
    margin-top: 25px !important;
    max-width: 800px !important;
    margin-left: auto !important;
    margin-right: auto !important;
}
.jollify-luxury-theme .k-tag {
    background: rgba(255, 255, 255, 0.15) !important;
    border: 1px solid rgba(255, 255, 255, 0.3) !important;
    color: #fff !important;
    padding: 6px 16px !important;
    border-radius: 30px !important;
    font-size: 13px !important;
    letter-spacing: 1px !important;
    backdrop-filter: blur(5px) !important;
    -webkit-backdrop-filter: blur(5px) !important;
    transition: all 0.3s ease !important;
    font-weight: bold !important;
}
.jollify-luxury-theme .k-tag:hover {
    background: rgba(255, 255, 255, 0.25) !important;
    border-color: var(--c-sec) !important;
}

/* Itinerary Timeline Layout */
.jollify-luxury-theme .k-sec--mist {
    background: #f9f9fb !important;
}
.jollify-luxury-theme .k-days {
    display: flex !important;
    flex-direction: column !important;
    gap: 40px !important;
    position: relative !important;
    max-width: 900px !important;
    margin: 0 auto !important;
    padding-left: 20px !important;
}
.jollify-luxury-theme .k-day {
    display: flex !important;
    gap: 30px !important;
    position: relative !important;
}
.jollify-luxury-theme .k-days::before {
    content: '' !important;
    position: absolute !important;
    left: 65px !important;
    top: 20px !important;
    bottom: 20px !important;
    width: 2px !important;
    background: rgba(76, 42, 133, 0.1) !important;
    z-index: 1 !important;
}
.jollify-luxury-theme .k-day__num {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    width: 90px !important;
    height: 90px !important;
    border-radius: 50% !important;
    background: #fff !important;
    border: 3px solid var(--c-pri) !important;
    box-shadow: 0 8px 20px rgba(76, 42, 133, 0.06) !important;
    z-index: 2 !important;
    flex-shrink: 0 !important;
}
.jollify-luxury-theme .k-day__n {
    font-size: 32px !important;
    font-weight: 800 !important;
    color: var(--c-pri) !important;
    line-height: 1 !important;
    font-family: 'Times New Roman', serif !important;
}
.jollify-luxury-theme .k-day__d {
    font-size: 10px !important;
    font-weight: 700 !important;
    color: var(--c-sec) !important;
    letter-spacing: 1px !important;
    margin-top: 2px !important;
}
.jollify-luxury-theme .k-day__body {
    flex: 1 !important;
    background: #fff !important;
    padding: 30px 40px !important;
    border-radius: 12px !important;
    border: 1px solid rgba(0, 0, 0, 0.04) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.02) !important;
    position: relative !important;
    z-index: 2 !important;
}
.jollify-luxury-theme .k-day__route {
    font-size: 15px !important;
    font-weight: bold !important;
    color: var(--c-sec) !important;
    margin-bottom: 8px !important;
    display: block !important;
}
.jollify-luxury-theme .k-day__title {
    font-size: 22px !important;
    font-weight: bold !important;
    color: var(--c-pri) !important;
    margin: 0 0 15px 0 !important;
    letter-spacing: 0.5px !important;
}
.jollify-luxury-theme .k-day__desc {
    font-size: 15px !important;
    color: #555 !important;
    line-height: 1.8 !important;
    margin: 0 0 20px 0 !important;
    text-align: justify !important;
}
.jollify-luxury-theme .k-info {
    background: rgba(212, 169, 59, 0.06) !important;
    border-left: 3px solid var(--c-sec) !important;
    padding: 12px 18px !important;
    border-radius: 0 8px 8px 0 !important;
    font-size: 14px !important;
    color: #8a6d27 !important;
    line-height: 1.6 !important;
    margin-bottom: 20px !important;
}
.jollify-luxury-theme .k-tl {
    display: flex !important;
    flex-direction: column !important;
    gap: 15px !important;
    margin-bottom: 25px !important;
    position: relative !important;
    padding-left: 15px !important;
}
.jollify-luxury-theme .k-tl__item {
    position: relative !important;
    padding-left: 20px !important;
}
.jollify-luxury-theme .k-tl__dot {
    position: absolute !important;
    left: 0 !important;
    top: 7px !important;
    width: 6px !important;
    height: 6px !important;
    background: var(--c-sec) !important;
    border-radius: 50% !important;
}
.jollify-luxury-theme .k-tl__lbl {
    font-size: 12px !important;
    color: #999 !important;
    font-weight: bold !important;
    text-transform: uppercase !important;
    margin: 0 0 4px 0 !important;
}
.jollify-luxury-theme .k-tl__ev {
    font-size: 16px !important;
    font-weight: bold !important;
    color: var(--c-pri) !important;
    margin: 0 0 4px 0 !important;
}
.jollify-luxury-theme .k-tl__note {
    font-size: 14px !important;
    color: #666 !important;
    line-height: 1.6 !important;
    margin: 0 !important;
}
.jollify-luxury-theme .k-day__pills {
    display: flex !important;
    flex-wrap: wrap !important;
    gap: 8px !important;
}
.jollify-luxury-theme .k-pill {
    display: inline-block !important;
    font-size: 12px !important;
    background: #f3f4f6 !important;
    color: #4b5563 !important;
    padding: 4px 12px !important;
    border-radius: 20px !important;
    font-weight: 500 !important;
}
.jollify-luxury-theme .k-pill--hotel {
    background: rgba(76, 42, 133, 0.08) !important;
    color: var(--c-pri) !important;
    font-weight: bold !important;
}
.jollify-luxury-theme .k-pill--star {
    background: rgba(212, 169, 59, 0.12) !important;
    color: #b58b21 !important;
    font-weight: bold !important;
}

@media (max-width: 768px) {
    .jollify-luxury-theme .j-section { padding: 40px 0 !important; }
    .jollify-luxury-theme .j-heading { margin-bottom: 30px !important; }
    .jollify-luxury-theme .j-heading h2 { font-size: 24px !important; }
    .jollify-luxury-theme .j-badge { font-size: 10px !important; padding: 4px 12px !important; margin-bottom: 10px !important; }
    
    .jollify-luxury-theme .j-hero { height: 45vh !important; min-height: 300px !important; }
    .jollify-luxury-theme .j-hero-title { font-size: 28px !important; }
    .jollify-luxury-theme .j-hero-sub { font-size: 14px !important; letter-spacing: 2px !important; }
    .jollify-luxury-theme .k-tag { font-size: 11px !important; padding: 4px 10px !important; }
    .jollify-luxury-theme .k-hero__tags { gap: 6px !important; margin-top: 15px !important; padding: 0 15px !important; }
    
    .jollify-luxury-theme .j-hl-title { font-size: 18px !important; }
    .jollify-luxury-theme .j-hl-desc { font-size: 14px !important; }
    .jollify-luxury-theme .j-hl-card-title { font-size: 18px !important; }
    .jollify-luxury-theme .j-hl-card-desc { font-size: 13px !important; }
    .jollify-luxury-theme .j-hl-overlap-title { font-size: 20px !important; }
    .jollify-luxury-theme .j-hl-overlap-desc { font-size: 14px !important; }
    
    .jollify-luxury-theme .j-spot-name { font-size: 20px !important; }
    .jollify-luxury-theme .j-spot-desc { font-size: 14px !important; }
    .jollify-luxury-theme .j-spot-tag { font-size: 10px !important; padding: 2px 8px !important; }
    
    .jollify-luxury-theme .j-h-name { font-size: 22px !important; }
    .jollify-luxury-theme .j-h-desc { font-size: 14px !important; }
    .jollify-luxury-theme .j-grid-h-info h4 { font-size: 18px !important; }
    .jollify-luxury-theme .j-grid-h-info p { font-size: 13px !important; }
    
    .jollify-luxury-theme .j-e-code { font-size: 28px !important; }
    .jollify-luxury-theme .j-e-time { font-size: 18px !important; }
    
    .jollify-luxury-theme .day-title { font-size: 20px !important; }
    .jollify-luxury-theme .day-lead { font-size: 14px !important; }
    .jollify-luxury-theme .day-points { font-size: 13px !important; }
    .jollify-luxury-theme .stay-name { font-size: 14px !important; }
    .jollify-luxury-theme .day-meals-row { font-size: 12px !important; padding: 10px !important; gap: 8px !important; }
    
    .jollify-luxury-theme .k-days::before {
        left: 35px !important;
    }
    .jollify-luxury-theme .k-day {
        gap: 15px !important;
    }
    .jollify-luxury-theme .k-day__num {
        width: 60px !important;
        height: 60px !important;
        border-width: 2px !important;
    }
    .jollify-luxury-theme .k-day__n {
        font-size: 22px !important;
    }
    .jollify-luxury-theme .k-day__d {
        font-size: 8px !important;
    }
    .jollify-luxury-theme .k-day__body {
        padding: 20px !important;
    }
    .jollify-luxury-theme .k-day__title {
        font-size: 18px !important;
    }
    .jollify-luxury-theme .k-day__route {
        font-size: 13px !important;
    }
    .jollify-luxury-theme .k-day__desc {
        font-size: 14px !important;
    }
    .jollify-luxury-theme .k-tl__ev {
        font-size: 14px !important;
    }
    .jollify-luxury-theme .k-tl__note {
        font-size: 13px !important;
    }
    .jollify-luxury-theme .k-pill {
        font-size: 11px !important;
        padding: 3px 10px !important;
    }
    
    .jollify-luxury-theme .j-accordion-title { font-size: 15px !important; }
    .jollify-luxury-theme .j-accordion-content-inner { padding: 15px 15px 20px 58px !important; font-size: 13px !important; }
    .jollify-luxury-theme .j-rec-txt h5 { font-size: 16px !important; }
    
    .jollify-luxury-theme .j-floating-cta {
        bottom: 12px !important;
        right: 12px !important;
        gap: 8px !important;
    }
    .jollify-luxury-theme .j-cta-line {
        padding: 8px 14px !important;
        font-size: 13px !important;
    }
    .jollify-luxury-theme .j-cta-line svg {
        width: 15px !important;
        height: 15px !important;
        margin-right: 5px !important;
    }
    .jollify-luxury-theme .j-cta-register {
        padding: 8px 16px !important;
        font-size: 13px !important;
    }
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
        container.on('click', '.j-accordion-header', function(e){
            e.preventDefault();
            var item = $(this).closest('.j-accordion-item');
            item.toggleClass('is-active');
        });
    });
`;
};
