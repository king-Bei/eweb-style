import baseCss from '../public/主題css/sely.css?raw';
import classicThemeCss from '../public/assets/classic/theme.css?raw';

function formatNoticeDesc(desc) {
  if (!desc) return '';
  const lines = desc.split('\n');
  let inList = false;
  let listType = null;
  let result = [];

  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      result.push('<br/>');
      return;
    }

    const bulletMatch = trimmed.match(/^[-*•]\s*(.*)/);
    const numberMatch = trimmed.match(/^(\d+[.)]|\(\d+\))\s*(.*)/);

    if (bulletMatch) {
      if (!inList || listType !== 'ul') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ul style="margin: 4px 0 4px 20px; padding: 0; list-style-type: disc;">');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li style="margin-bottom: 4px;">${bulletMatch[1]}</li>`);
    } else if (numberMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol style="margin: 4px 0 4px 20px; padding: 0; list-style-type: decimal;">');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li style="margin-bottom: 4px;">${numberMatch[2]}</li>`);
    } else {
      if (inList) {
        result.push(`</${listType}>`);
        inList = false;
        listType = null;
      }
      result.push(`<p style="margin: 4px 0;">${trimmed}</p>`);
    }
  });

  if (inList) {
    result.push(`</${listType}>`);
  }

  return result.join('\n');
}

export const generateHtml = (itinerary, flights, days, hotels, cta = {}, origin = '', moduleOrder = []) => {
  const { hero_data, highlights, spots, notices, recommended, map_data } = itinerary;
  const destinationTitle = String(hero_data?.title1 || itinerary?.title || '').trim();
  const destinationValue = JSON.stringify(destinationTitle)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const destinationClick = destinationTitle
    ? `onclick="try{localStorage.setItem('jt_dest', ${destinationValue})}catch(e){}"`
    : '';


  const order = (moduleOrder && moduleOrder.length > 0)
    ? moduleOrder.filter(k => k !== 'quick_info' && k !== 'quick')
    : ['hero', 'highlights', 'spots', 'flights', 'hotels', 'days', 'notices', 'map', 'recommended'];

  let html = `
<style>
/* 科威後台專用：全域主題變數，可在此直接修改顏色 */
:root, .jollify-luxury-theme {
  --c-pri: #4c2a85; /* 主色 */
  --c-sec: #d4a93b; /* 次色 */
  --c-bg: #ffffff;  /* 背景色 */
}
</style>
<div class="jollify-luxury-theme" id="jollify-tour-module">`;

  order.forEach(moduleKey => {
    switch (moduleKey) {
      case 'hero':
        if (hero_data?.visible !== false) {
          const style = hero_data?.titleStyle || 'classic';

          if (style === 'alternative') {
            let tagsList = [];
            if (hero_data?.tags) {
              tagsList = hero_data.tags.split('\n').filter(t => t.trim());
            }
            let tagsHtml = '';
            if (tagsList.length > 0) {
              tagsHtml += `<div class="k-hero__tags">`;
              tagsList.forEach(t => {
                tagsHtml += `<span class="k-tag">${t}</span>`;
              });
              tagsHtml += `</div>`;
            }

            const title1Str = (hero_data?.title1 || '').replace(/x|×/g, '<em>×</em>').replace(/\n/g, '<br>');
            const title2Str = (hero_data?.title2 || '').replace(/\n/g, '<br>');
            const descStr = (hero_data?.description || '').replace(/\n/g, '<br>');

            const consultHref = cta?.cta_register_url || 'https://jollifytravel.com/bespoke/';
            const consultTarget = 'target="_blank"';
            const consultClick = destinationClick;

            html += `
  <!-- ░░ HERO ░░ -->
  <section class="k-hero" id="top">
    <div class="k-hero__bg" style="background-image:url('${hero_data?.image || ''}');"></div>
    <div class="k-hero__grad"></div>
    <div class="k-hero__body">
      <span class="k-eyebrow">${hero_data?.subtitle || 'FEATURED ITINERARY · 精選行程'}</span>
      <h1 class="k-hero__h1">
        ${title1Str}<br>
        ${title2Str}
      </h1>
      <p class="k-hero__sub">${descStr}</p>
      ${tagsHtml}
      <div class="k-hero__btns">
        <a href="#itinerary" class="k-btn k-btn--teal">查看完整行程</a>
        <a href="${consultHref}" ${consultTarget} ${consultClick} class="k-btn k-btn--ghost">立即諮詢顧問</a>
      </div>
    </div>
  </section>`;
          } else {
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
            const classicTitle1 = (hero_data?.title1 || '').replace(/\n/g, '<br>');
            const classicTitle2 = (hero_data?.title2 || '').replace(/\n/g, '<br>');
            html += `<div class="j-hero wow fadeIn" id="top"><div class="j-hero-overlay"></div><img src="${hero_data?.image || ''}" alt="Banner"><div class="j-hero-content"><span class="j-hero-sub">${classicTitle2}</span><h1 class="j-hero-title">${classicTitle1}</h1>${tagsHtml}</div></div>`;
          }
        }
        break;
      case 'highlights':
        if (highlights?.visible !== false) {
          let hlHtml = '';
          const layout = highlights?.layout || 'grid';
          (highlights?.items || []).forEach((c, i) => {
            if (layout === 'grid') {
              const numStr = String(i + 1).padStart(2, '0');
              const subHtml = c.subtitle ? `<div class="j-hl-category">${c.subtitle}</div>` : '';
              hlHtml += `<div class="j-hl-item wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-hl-number">${numStr}</div>${subHtml}<h4 class="j-hl-title">${c.title || ''}</h4><p class="j-hl-desc">${(c.desc || '').replace(/\n/g, '<br>')}</p></div>`;
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
            const sectionBg = (layout === 'grid' || layout === 'card') ? 'j-highlights-section' : '';
            const hlTitle = highlights?.title || '行程特色 ‧ 奢旅亮點';
            const hlSubtitle = highlights?.subtitle || 'Highlights';
            html += `<div class="j-section ${sectionBg}" id="highlights"><div class="j-heading wow fadeInUp"><span class="j-badge">${hlSubtitle}</span><h2>${hlTitle}</h2></div><div class="j-wrapper"><div class="${wrapClass}">${hlHtml}</div></div></div>`;
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
            const spotsTitle = spots?.title || '精選景點 ‧ 探索之美';
            const spotsSubtitle = spots?.subtitle || 'Scenic Spots';
            html += `<div class="j-section" id="spots"><div class="j-heading wow fadeInUp"><span class="j-badge">${spotsSubtitle}</span><h2>${spotsTitle}</h2></div><div class="${wrapClass}">${spotHtml}</div></div>`;
          }
        }
        break;
      case 'flights':
        if (flights?.visible !== false) {
          // 支援新版 groups 與舊版 flat items 向下相容
          let flightGroups = [];
          if (flights.groups && flights.groups.length > 0) {
            flightGroups = flights.groups;
          } else if (flights.items && flights.items.length > 0) {
            const gMap = {}; const gOrder = [];
            (flights.items || []).forEach(item => {
              const key = item.airline_name_zh || item.airline_code || '航班資訊';
              if (!gMap[key]) { gMap[key] = []; gOrder.push(key); }
              gMap[key].push(item);
            });
            flightGroups = gOrder.map(name => ({ group_name: name, layout: 'timeline', items: gMap[name] }));
          }

          let allGroupsHtml = '';

          flightGroups.forEach(group => {
            const gItems = group.items || [];
            if (gItems.length === 0) return;
            const gLayout = group.layout || 'timeline';
            const gName = group.group_name || '';
            const gDirection = group.direction || (gName.includes('回') ? 'return' : 'outbound');
            const directionLabel = gDirection === 'return' ? '回程' : (gDirection === 'outbound' ? '去程' : '');
            const directionClass = gDirection === 'return' ? 'return' : (gDirection === 'outbound' ? 'outbound' : 'custom');
            let innerHtml = '';

            if (gLayout === 'timeline') {
              gItems.forEach((c, i) => {
                const isRet = directionClass === 'return' || (c.tag || gName).includes('回') ? 'return' : '';
                const tagText = c.tag || directionLabel || gName;
                innerHtml += `<div class="j-editorial-route wow fadeInUp" data-wow-delay="${i * 0.08}s"><div class="j-e-station"><div class="j-e-time">${c.dep_time || c.fTime || ''}</div><div class="j-e-code">${c.dep_location_zh || ''} ${c.dep_location_en || c.fCode || ''}</div></div><div class="j-e-divider"><span class="j-e-tag ${isRet}">${tagText}</span><div class="j-e-airline">${c.airline_name_zh || ''} ${c.airline_name_en || ''} ${c.flight_no || c.fn || ''}</div><div class="j-e-line"></div><div class="j-e-duration">${c.dur || ''}</div></div><div class="j-e-station"><div class="j-e-time">${c.arr_time || c.tTime || ''}</div><div class="j-e-code">${c.arr_location_zh || ''} ${c.arr_location_en || c.tCode || ''}</div></div></div>`;
              });
              innerHtml = `<div class="j-editorial-flight-box">${innerHtml}</div>`;
            } else if (gLayout === 'card') {
              gItems.forEach((c, i) => {
                const tagText = c.tag || directionLabel || gName;
                let tagClass = '';
                if (tagText.includes('回')) {
                  tagClass = 'return';
                } else if (tagText.includes('中')) {
                  tagClass = 'mid';
                }
                innerHtml += `<div class="j-flight-card wow fadeInUp" data-wow-delay="${i * 0.08}s"><div class="j-fc-airline">${c.airline_code || ''} <strong>${c.airline_name_zh || ''}</strong> <span>${c.airline_name_en || ''}</span><span class="j-fc-tag ${tagClass}">${tagText}</span></div><div class="j-fc-body"><div class="j-fc-station"><div class="j-fc-time">${c.dep_time || c.fTime || ''}</div><div class="j-fc-city">${c.dep_location_zh || ''}</div><div class="j-fc-code">${c.dep_location_en || ''}</div></div><div class="j-fc-middle"><div class="j-fc-no">${c.flight_no || c.fn || ''}</div><div class="j-fc-arrow">✈</div></div><div class="j-fc-station"><div class="j-fc-time">${c.arr_time || c.tTime || ''}</div><div class="j-fc-city">${c.arr_location_zh || ''}</div><div class="j-fc-code">${c.arr_location_en || ''}</div></div></div></div>`;
              });
              innerHtml = `<div class="j-flight-card-grid">${innerHtml}</div>`;
            } else if (gLayout === 'boarding') {
              gItems.forEach((c, i) => {
                const isRet = directionClass === 'return' || (c.tag || gName).includes('回') ? 'return' : '';
                const tagText = c.tag || directionLabel || gName;
                const airline = c.airline_name_zh || c.airline_name_en || '';
                const flightNo = c.flight_no || c.fn || '';
                innerHtml += `<div class="j-boarding-pass wow fadeInUp" data-wow-delay="${i * 0.08}s"><div class="j-bp-left"><span class="j-bp-tag ${isRet}">${tagText}</span><div class="j-bp-route"><div class="j-bp-station"><div class="j-bp-time">${c.dep_time || c.fTime || ''}</div><div class="j-bp-code">${c.dep_location_zh || ''} ${c.dep_location_en || c.fCode || ''}</div></div><div class="j-bp-plane">✈</div><div class="j-bp-station"><div class="j-bp-time">${c.arr_time || c.tTime || ''}</div><div class="j-bp-code">${c.arr_location_zh || ''} ${c.arr_location_en || c.tCode || ''}</div></div></div><div class="j-bp-meta"><span>${airline}</span><span>${flightNo}</span>${c.dur ? `<span>${c.dur}</span>` : ''}</div></div><div class="j-bp-perforation"></div><div class="j-bp-right"><div class="j-bp-stub-label">BOARDING PASS</div><div class="j-bp-stub-code">${flightNo}</div></div></div>`;
              });
              innerHtml = `<div class="j-boarding-wrapper">${innerHtml}</div>`;
            } else {
              let rows = '';
              gItems.forEach(c => {
                rows += `<tr><td>${c.airline_code || ''} ${c.airline_name_zh || ''}</td><td>${c.flight_no || ''}</td><td>${c.dep_location_zh || ''} (${c.dep_location_en || ''})</td><td>${c.dep_time || c.fTime || ''}</td><td>→</td><td>${c.arr_location_zh || ''} (${c.arr_location_en || ''})</td><td>${c.arr_time || c.tTime || ''}</td></tr>`;
              });
              innerHtml = `<div class="j-flight-table-wrap"><table class="j-flight-table"><thead><tr><th>航空公司</th><th>航班號</th><th>出發地</th><th>起飛</th><th></th><th>目的地</th><th>抵達</th></tr></thead><tbody>${rows}</tbody></table></div>`;
            }

            allGroupsHtml += `<div class="j-flight-group wow fadeInUp">${gName ? `<div class="j-flight-group-label"><span class="j-fgl-tag ${directionClass}">${directionLabel ? `<small>${directionLabel}</small>` : ''}${gName}</span></div>` : ''}${innerHtml}</div>`;
          });

          if (allGroupsHtml) {
            const flightsSubtitle = flights?.subtitle || 'Flight Information';
            const flightsTitle = flights?.title || '航程紀實 ‧ 優雅啟程';
            html += `<div class="j-section" id="flights"><div class="j-heading wow fadeInUp"><span class="j-badge">${flightsSubtitle}</span><h2>${flightsTitle}</h2></div><div class="j-wrapper j-flights-wrapper">${allGroupsHtml}</div></div>`;
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
            const hotelsTitle = hotels?.title || '嚴選旅宿 ‧ 奢華棲所';
            const hotelsSubtitle = hotels?.subtitle || 'Exclusive Stays';
            const wrapClass = layout === 'grid' ? 'j-hotel-grid-wrapper' : 'j-wrapper';
            html += `<div class="j-section" id="hotels"><div class="j-heading wow fadeInUp"><span class="j-badge">${hotelsSubtitle}</span><h2>${hotelsTitle}</h2></div><div class="${wrapClass}">${hotelHtml}</div></div>`;
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
                  const boldClass = days?.points_bold === true ? ' j-points-bold' : '';
                  tlHtml += `<div class="k-tl${boldClass}">`;
                  lines.forEach(line => {
                    const parts = line.split('|');
                    let lbl = '', note = '';
                    let ev;
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
                    <p class="k-label" style="display:inline-block; font-size: 11px; letter-spacing: 3px; background: var(--c-sec); color: #fff; padding: 5px 15px; border-radius: 20px; text-transform: uppercase; margin-bottom:15px;">${days?.subtitle || '每日行程'}</p>
                    <h2 class="k-h2" style="font-size:32px; color:var(--c-pri); font-weight:bold; letter-spacing:2px; margin:0;">${days?.title ? days.title : `${totalDays} 天 ${totalNights} 夜完整規劃`}</h2>
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
                          <ul class="day-points${days?.points_bold === true ? ' j-points-bold' : ''}">${pointsHtml}</ul>
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
              const daysTitle = days?.title || '每日行程';
              const daysSubtitle = days?.subtitle || 'Daily Itinerary';
              html += `<div class="j-section" id="itinerary"><div class="j-heading wow fadeInUp"><span class="j-badge">${daysSubtitle}</span><h2>${daysTitle}</h2></div><div class="j-wrapper"><div class="j-magazine-box"><div class="j-tabs-row">${tabsHtml}</div><div class="j-panels-row">${panelsHtml}</div></div></div></div>`;
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
                  <div>${formatNoticeDesc(c.desc || '')}</div>
                </div>
              </div>
            </div>`;
          });
          if (nHtml) {
            const noticesTitle = notices?.title || '報名注意事項';
            const noticesSubtitle = notices?.subtitle || 'Notices';
            html += `<div class="j-section bg-light-gray" id="notices"><div class="j-heading wow fadeInUp"><span class="j-badge">${noticesSubtitle}</span><h2>${noticesTitle}</h2></div><div class="j-wrapper"><div class="j-accordion">${nHtml}</div></div></div>`;
          }
        }
        break;
      case 'map': {
        const mapVisible = map_data?.visible !== false;
        const mapUrl = map_data?.embed_url || '';
        if (mapVisible && mapUrl) {
          const mapTitle = map_data?.title || '行程地圖';
          const mapDesc = map_data?.desc || '';
          html += `
<div class="j-section j-map-section" id="map" style="background: none; border: none; padding: 40px 0;">
  <div class="j-wrapper" style="max-width: 100%; padding: 0;">
    <div class="j-heading wow fadeInUp" style="margin-bottom: 20px; text-align: center;">
      <span class="j-badge">Route Map</span>
      <h2>${mapTitle}</h2>
    </div>
    <div class="j-map-img-box wow fadeInUp" style="width: 100%; max-width: 100%;">
      <img
        src="${mapUrl}"
        alt="${mapTitle}"
        style="width: 100%; height: auto; display: block; max-width: 1200px; margin: 0 auto; border: none; box-shadow: none;"
      />
    </div>
    ${mapDesc ? `<p class="j-map-desc" style="max-width: 800px; margin: 20px auto 0; text-align: center; color: #666; font-size: 14px;">${mapDesc}</p>` : ''}
  </div>
</div>`;
        }
        break;
      }
      case 'recommended':
        if (recommended?.visible !== false) {
          let rHtml = '';
          (recommended?.items || []).forEach((c, i) => {
            rHtml += `<a href="${c.link || '#'}" target="_blank" class="j-rec-card wow fadeInUp" data-wow-delay="${i * 0.1}s"><div class="j-rec-img" style="background-image:url('${c.img || ''}')"></div><div class="j-rec-txt"><h5>${c.t || ''}</h5><span class="j-rec-btn">查看行程 &rarr;</span></div></a>`;
          });
          if (rHtml) {
            html += `<div class="j-section" id="recommended"><div class="j-heading wow fadeInUp"><span class="j-badge">Recommended</span><h2>探索更多奢華旅程</h2></div><div class="j-wrapper"><div class="j-rec-grid">${rHtml}</div></div></div>`;
          }
        }
        break;
    }
  });

  // 10. Floating CTA
  if (cta?.visible !== false && (cta?.cta_register_url || cta?.cta_line_url)) {
    html += '<div class="j-floating-cta">';
    if (cta.cta_line_url) {
      html += `<a href="${cta.cta_line_url}" target="_blank" class="j-cta-btn j-cta-line"><img src="/material-alias/Shared_data/LINE.png" alt="LINE" style="width:20px;height:20px;object-fit:contain;" />LINE 客服</a>`;
    }
    if (cta.cta_register_url) {
      html += `<a href="${cta.cta_register_url}" target="_blank" ${destinationClick} class="j-cta-btn j-cta-register">我要報名</a>`;
    }
    html += '</div>';
  }

  html += `</div>`;

  if (origin) {
    html += `\n<!-- 鑫囍探索 經典版專用樣式 (JS 請於科威頁面自行外部導入) -->\n`;
    html += `<link rel="stylesheet" href="${origin}/assets/classic/theme.css">\n`;
  }

  return html.replace(/https:\/\/jollifytravel\.com/g, '');
};

export const generateCss = (theme = 'classic', isExport = false) => {
  let finalCss = isExport ? '/* --- Theme Styles --- */\n\n' : (baseCss + '\n\n/* --- Theme Styles --- */\n\n');
  if (theme === 'classic') {
    finalCss += classicThemeCss;
  }
  return finalCss;
};

export const generateJs = () => {
  return `
    document.addEventListener('DOMContentLoaded', function() {
        function prefillBespokeDestination() {
            var destination;
            try {
                destination = localStorage.getItem('jt_dest');
            } catch (e) {
                return false;
            }
            if (!destination) return false;

            var field = document.getElementById('content_6')
                || document.querySelector('[placeholder="例如：峇里島"]');
            if (!field) return false;

            if (!String(field.value || '').trim()) {
                field.value = destination;
                field.dispatchEvent(new Event('input', { bubbles: true }));
                field.dispatchEvent(new Event('change', { bubbles: true }));
            }
            try {
                localStorage.removeItem('jt_dest');
            } catch (e) {
                // The field is already populated; storage cleanup is optional.
            }
            return true;
        }

        if (!prefillBespokeDestination()) {
            setTimeout(prefillBespokeDestination, 400);
            setTimeout(prefillBespokeDestination, 1200);
        }

        var container = document.getElementById('jollify-tour-module');
        if (!container) return;

        container.addEventListener('click', function(e) {
            var dayTab = e.target.closest('.j-day-tab');
            if (dayTab && container.contains(dayTab)) {
                e.preventDefault();
                container.querySelectorAll('.j-day-tab').forEach(function(tab) {
                    tab.classList.remove('is-active');
                });
                container.querySelectorAll('.j-day-panel').forEach(function(panel) {
                    panel.style.display = 'none';
                    panel.classList.remove('is-active');
                });
                dayTab.classList.add('is-active');
                var targetPanel = container.querySelector('#' + dayTab.dataset.target);
                if (targetPanel) {
                    targetPanel.style.display = '';
                    targetPanel.classList.add('is-active');
                }
                return;
            }

            var accordionHeader = e.target.closest('.j-accordion-header');
            if (accordionHeader && container.contains(accordionHeader)) {
                e.preventDefault();
                var item = accordionHeader.closest('.j-accordion-item');
                if (item) item.classList.toggle('is-active');
            }
        });
    });
`;
};
