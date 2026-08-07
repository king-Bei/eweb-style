
import magazineThemeCss from '../public/assets/magazine/theme.css?raw';
import { DEFAULT_CTA_REGISTER_URL } from './constants';
import { NOTICE_INFO_ICON } from './exportIcons';
import { prepareHtmlImagesForPreview } from './utils/imageUrls';

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
        result.push('<ul style="margin:4px 0;padding-left:22px;list-style-type:disc !important;">');
        inList = true;
        listType = 'ul';
      }
      result.push(`<li style="display:list-item;list-style-type:disc !important;margin-bottom:4px;">${bulletMatch[1]}</li>`);
    } else if (numberMatch) {
      if (!inList || listType !== 'ol') {
        if (inList) result.push(`</${listType}>`);
        result.push('<ol style="margin:4px 0;padding-left:22px;list-style-type:decimal !important;">');
        inList = true;
        listType = 'ol';
      }
      result.push(`<li style="display:list-item;list-style-type:decimal !important;margin-bottom:4px;">${numberMatch[2]}</li>`);
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

export const generateCss = () => {
  return magazineThemeCss;
};

export const generateJs = () => {
  return `
        document.addEventListener('DOMContentLoaded', () => {
            // 1. 預載畫面 (Preloader) 控制
            const preloader = document.getElementById('preloader');
            const progressInner = preloader ? preloader.querySelector('.progress-inner') : null;
            
            setTimeout(() => { if (progressInner) progressInner.style.width = '40%'; }, 100);
            setTimeout(() => { if (progressInner) progressInner.style.width = '75%'; }, 350);
            setTimeout(() => { if (progressInner) progressInner.style.width = '100%'; }, 600);
            
            window.addEventListener('load', () => {
                setTimeout(() => {
                    if (preloader) preloader.classList.add('opacity-0', 'pointer-events-none');
                    triggerScrollAnimations();
                }, 850);
            });
            setTimeout(() => {
                if (preloader) preloader.classList.add('opacity-0', 'pointer-events-none');
                triggerScrollAnimations();
            }, 1500);

            // 2. 右側分頁導覽點動態生成
            const root = document.getElementById('jollify-magazine-tour');
            if (!root) return;
            const sections = root.querySelectorAll('section');
            const navDotsContainer = root.querySelector('#nav-dots');
            const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            if (navDotsContainer) {
                sections.forEach((sec, index) => {
                    const title = sec.getAttribute('data-title') || \`Page \${index + 1}\`;
                    const dotWrapper = document.createElement('button');
                    dotWrapper.classList.add('dot-wrapper');
                    dotWrapper.type = 'button';
                    dotWrapper.setAttribute('data-index', index);
                    dotWrapper.setAttribute('aria-label', \`前往\${title}\`);
                    
                    const label = document.createElement('span');
                    label.classList.add('dot-label', 'font-sans');
                    label.textContent = title;
                    
                    const dot = document.createElement('span');
                    dot.classList.add('dot');
                    dot.setAttribute('aria-hidden', 'true');
                    
                    dotWrapper.appendChild(label);
                    dotWrapper.appendChild(dot);
                    
                    dotWrapper.addEventListener('click', () => {
                        sec.scrollIntoView({ behavior: prefersReducedMotion.matches ? 'auto' : 'smooth' });
                    });
                    
                    navDotsContainer.appendChild(dotWrapper);
                });
            }

            const dotWrappers = root.querySelectorAll('.dot-wrapper');

            // 3. 視窗滾動監聽
            const progressBar = root.querySelector('#progress-bar');
            function onScrollHandler() {
                const scrollTop = window.scrollY || document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
                const scrollPercent = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
                
                if (progressBar) {
                    progressBar.style.width = scrollPercent + '%';
                }
                triggerScrollAnimations();
            }
            window.addEventListener('scroll', onScrollHandler, { passive: true });

            // 4. Intersection Observer
            const observerOptions = {
                root: null,
                rootMargin: '-5% 0px -15% 0px',
                threshold: 0.15
            };

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const targetSection = entry.target;
                        const animatedElements = targetSection.querySelectorAll('.animate-trigger');
                        animatedElements.forEach(el => {
                            el.classList.add('animate-active');
                        });

                        const index = Array.from(sections).indexOf(targetSection);
                        dotWrappers.forEach(dw => {
                            dw.classList.remove('active');
                            dw.removeAttribute('aria-current');
                        });
                        if (dotWrappers[index]) {
                            dotWrappers[index].classList.add('active');
                            dotWrappers[index].setAttribute('aria-current', 'location');
                        }

                        if (navDotsContainer) {
                            if (targetSection.classList.contains('bg-jollify-dark') || targetSection.id === 'page-1') {
                                navDotsContainer.classList.add('dark-bg-dots');
                            } else {
                                navDotsContainer.classList.remove('dark-bg-dots');
                            }
                        }
                    }
                });
            }, observerOptions);

            sections.forEach(section => {
                const animatedElements = section.querySelectorAll('h2, h1, p, .grid, .border, .itinerary-row, img, .relative, .space-y-6, .space-y-12');
                animatedElements.forEach((el, index) => {
                    if (!el.classList.contains('animate-trigger') && !el.classList.contains('img-elegant')) {
                        el.classList.add('animate-trigger');
                        if (index > 0) {
                            const delayClass = \`delay-\${Math.min(index * 100, 700)}\`;
                            el.classList.add(delayClass);
                        }
                    }
                });
                observer.observe(section);
            });

            function triggerScrollAnimations() {
                sections.forEach(section => {
                    const rect = section.getBoundingClientRect();
                    const viewHeight = Math.max(document.documentElement.clientHeight, window.innerHeight);
                    if (!(rect.bottom < 0 || rect.top - viewHeight >= 0)) {
                        const animatedElements = section.querySelectorAll('.animate-trigger');
                        animatedElements.forEach(el => {
                            el.classList.add('animate-active');
                        });
                    }
                });
            }

            // 5. 注意事項手風琴控制 (Accordion)
            const magazineRoot = document.getElementById('jollify-magazine-tour');
            if (magazineRoot) {
                magazineRoot.addEventListener('click', (e) => {
                    const header = e.target.closest('.j-magazine-accordion-header');
                    if (header) {
                        const item = header.closest('.j-magazine-accordion-item');
                        const content = item.querySelector('.j-magazine-accordion-content');
                        const icon = item.querySelector('.j-magazine-accordion-icon');
                        
                        const isActive = item.classList.contains('is-active');
                        
                        if (isActive) {
                            item.classList.remove('is-active');
                            header.setAttribute('aria-expanded', 'false');
                            content.setAttribute('aria-hidden', 'true');
                            content.style.maxHeight = '0px';
                            if (icon) icon.style.transform = 'rotate(0deg)';
                        } else {
                            item.classList.add('is-active');
                            header.setAttribute('aria-expanded', 'true');
                            content.setAttribute('aria-hidden', 'false');
                            content.style.maxHeight = content.scrollHeight + 'px';
                            if (icon) icon.style.transform = 'rotate(135deg)';
                        }
                    }
                });
            }
        });
  `;
};

export const generateHtml = (itinerary, flights, days, hotels, cta = {}) => {
  const highlights = itinerary?.highlights;
  const spots = itinerary?.spots;
  const recommended = itinerary?.recommended;
  const quickInfo = itinerary?.quick_info || {};
  const priceData = itinerary?.price_data || {};
  const mapData = itinerary?.map_data || {};
  const visibleFlights = (flights?.items || []).filter(item => item.visible !== false);
  const visibleHighlights = (highlights?.items || []).filter(item => item.visible !== false);
  const visibleSpots = (spots?.items || []).filter(item => item.visible !== false);
  const visibleHotels = (hotels?.items || []).filter(item => item.visible !== false);

  // ── Helpers ───────────────────────────────────────────────────
  const esc = (v) => (v == null ? '' : String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
  const safe = (v, fallback = '') => v != null && v !== '' ? v : fallback;
  // URLs come from editor fields and are rendered into exported HTML. Keep
  // external navigation to web URLs only, rather than allowing executable
  // schemes such as `javascript:` through an otherwise escaped href.
  const safeHttpUrl = (value, fallback = '') => {
    const url = String(value || '').trim();
    if (!url) return fallback;
    try {
      const parsed = new URL(url);
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : fallback;
    } catch {
      return fallback;
    }
  };
  // Image fields may refer either to a public web image or to an asset served
  // from the Jollify site. Do not pass arbitrary schemes into src or CSS url().
  const safeImageUrl = (value, fallback = '') => {
    let url = String(value || '').trim();
    if (!url) return fallback;
    if (/^\/\/(?:www\.)?jollifytravel\.com\//i.test(url)) url = `https:${url}`;
    if (/^(?:www\.)?jollifytravel\.com\//i.test(url)) url = `https://${url}`;
    if (url.startsWith('/') && !url.startsWith('//')) {
      try {
        const parsed = new URL(url, 'https://jollifytravel.com');
        return `${parsed.pathname}${parsed.search}${parsed.hash}`;
      } catch {
        return fallback;
      }
    }
    return safeHttpUrl(url, fallback).replace(/'/g, '%27');
  };
  const imageCredit = source => source ? `<small class="j-image-credit absolute right-3 bottom-3 z-30 rounded-sm bg-black/60 px-2 py-1 font-sans text-[10px] leading-tight text-white">圖片來源：${esc(source)}</small>` : '';
  const destinationTitle = String(itinerary?.hero_data?.title1 || itinerary?.title || '').trim();
  const destinationValue = JSON.stringify(destinationTitle)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  const destinationClick = destinationTitle
    ? `onclick="try{localStorage.setItem('jt_dest', ${destinationValue})}catch(e){}"`
    : '';
  const registerUrl = safeHttpUrl(cta?.cta_register_url, DEFAULT_CTA_REGISTER_URL);
  const lineUrl = safeHttpUrl(cta?.cta_line_url);
  const priceConsultUrl = registerUrl;
  const hero = itinerary?.hero_data || {};
  const tags = String(hero.tags || '').split(/\n|[,，]/).map(tag => tag.trim()).filter(Boolean).join(' ‧ ')
    || '尊榮 ‧ 奢華 ‧ 絕美秘境';

  // ── Journey brief HTML ────────────────────────────────────────
  // `quick_info` is an itinerary-level JSON field. Only render it when
  // meaningful values have been supplied, so a legacy empty field does not
  // turn into a generic placeholder page in magazine exports.
  const quickInfoFields = [
    ['duration', '旅程天數'],
    ['group', '成行人數'],
    ['depart', '出發檔期'],
    ['price', '參考售價'],
    ['flight', '搭乘航空']
  ].filter(([key]) => String(quickInfo[key] || '').trim());
  const quickInfoHtml = quickInfo.visible !== false && quickInfoFields.length ? `
    <section id="page-brief" class="magazine-section bg-jollify-cream text-jollify-dark" data-title="旅程速覽">
      <div class="max-w-5xl mx-auto w-full relative z-10 px-4 md:px-8 py-16">
        <div class="text-center mb-12 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">JOURNEY AT A GLANCE</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-jollify-purple-dark">旅程速覽</h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-px overflow-hidden border border-jollify-purple/10 bg-jollify-purple/10 shadow-sm animate-trigger scale-up delay-200">
          ${quickInfoFields.map(([key, label]) => `
            <div class="${key === 'flight' && quickInfoFields.length % 2 === 1 ? 'sm:col-span-2' : ''} bg-white px-7 py-6 md:px-9 md:py-7">
              <dt class="font-sans text-xs font-bold tracking-[0.18em] text-jollify-gold">${esc(label)}</dt>
              <dd class="mt-3 font-serif text-xl font-bold leading-relaxed tracking-wide text-jollify-purple-dark">${esc(quickInfo[key])}</dd>
            </div>`).join('')}
        </dl>
      </div>
    </section>` : '';

  const priceHtml = priceData.visible !== false && [priceData.amount, priceData.note, priceData.title].some(value => String(value || '').trim()) ? `
    <section id="page-price" class="magazine-section magazine-price-section" data-title="參考售價">
      <div class="magazine-price-inner animate-trigger scale-up">
        <p class="magazine-price-kicker">${esc(priceData.subtitle || 'FROM')}</p>
        <h2>${esc(priceData.title || '尊榮旅程參考售價')}</h2>
        <div class="magazine-price-value">${esc(priceData.amount || '')}<span>${esc(priceData.unit || '每人起')}</span></div>
        <a href="${esc(priceConsultUrl)}" target="_blank" rel="noopener noreferrer" ${destinationClick} class="magazine-price-consult">我要詢問</a>
        ${priceData.note ? `<p class="magazine-price-note">${esc(priceData.note).replace(/\n/g, '<br>')}</p>` : ''}
      </div>
    </section>` : '';

  // ── Flights HTML ───────────────────────────────────────────────
  let flightsHtml = '';
  if (flights?.visible !== false && visibleFlights.length) {
    const citynames = {
      TPE: 'TAIPEI', TSA: 'TAIPEI', KHH: 'KAOHSIUNG', RMQ: 'TAICHUNG',
      HAN: 'HANOI', SGN: 'HO CHI MINH', DAD: 'DA NANG', CXR: 'NHA TRANG', PQC: 'PHU QUOC',
      HKG: 'HONG KONG', MFM: 'MACAU', NRT: 'TOKYO', HND: 'TOKYO', KIX: 'OSAKA',
      ICN: 'SEOUL', BKK: 'BANGKOK', DMK: 'BANGKOK', SIN: 'SINGAPORE', KUL: 'KUALA LUMPUR'
    };
    const isReturnFlight = (f) => String(f?.tag || '').includes('回');
    const codeOf = (f, direction) => {
      const field = direction === 'dep' ? 'dep_location_en' : 'arr_location_en';
      const legacy = direction === 'dep' ? 'fCode' : 'tCode';
      return String(f?.[field] || f?.[legacy] || '').trim().split(/\s+/).pop().toUpperCase();
    };
    const timeOf = (f, direction) => String((direction === 'dep' ? f?.dep_time || f?.departure_time || f?.fTime : f?.arr_time || f?.arrival_time || f?.tTime) || '').trim();
    const flightNoOf = (f) => String(f?.flight_no || f?.flight_number || '').replace(/\s+/g, ' ').trim();
    const prettyFlightNo = (f) => {
      const no = flightNoOf(f);
      const code = String(f?.airline_code || '').toUpperCase();
      if (!no) return code;
      return code && no.toUpperCase().startsWith(code) ? no.replace(new RegExp(`^${code}\\s*`, 'i'), `${code} `) : [code, no].filter(Boolean).join(' ');
    };
    const routeName = (outbound, inbound) => {
      const fromCode = codeOf(outbound, 'dep') || codeOf(inbound, 'arr');
      const toCode = codeOf(outbound, 'arr') || codeOf(inbound, 'dep');
      return [citynames[fromCode] || fromCode, citynames[toCode] || toCode].filter(Boolean).join(' ⇄ ');
    };
    const lineTime = (f) => {
      const depCode = codeOf(f, 'dep');
      const arrCode = codeOf(f, 'arr');
      return `${esc(depCode)} ${esc(timeOf(f, 'dep'))} <span class="flight-arrow">➜</span> ${esc(arrCode)} ${esc(timeOf(f, 'arr'))}`;
    };
    const airlineTitle = (f) => {
      const airlineZh = f?.airline_name_zh || '航空公司';
      const airlineEn = f?.airline_name_en || '';
      return `${esc(airlineZh)}${airlineEn ? ` (${esc(airlineEn)})` : ''}`;
    };
    const segmentTitle = (f, i) => {
      const tag = f?.tag || (isReturnFlight(f) ? '回程' : i === 0 ? '去程' : '航段');
      return `${esc(tag)} ${esc(prettyFlightNo(f))}`;
    };
    const periodLabel = (outbound, inbound, i) => {
      const explicit = outbound?.option_label || outbound?.plan_label || outbound?.flight_group || outbound?.flight_date;
      if (explicit) return explicit;
      const outHour = Number((timeOf(outbound, 'dep').match(/^(\d{1,2})/) || [])[1]);
      const inHour = Number((timeOf(inbound, 'dep').match(/^(\d{1,2})/) || [])[1]);
      if (outHour && outHour < 12) return '優雅首選・早去午回';
      if (outHour && outHour >= 12 && inHour && inHour >= 17) return i % 2 === 0 ? '從容愜意・午去晚回' : '精緻從容・午去晚回';
      return '航班方案';
    };
    const flightGroups = [];
    visibleFlights.forEach((flight) => {
      if (isReturnFlight(flight)) {
        const flightCode = String(flight.airline_code || '').trim().toUpperCase();
        const flightZh = String(flight.airline_name_zh || '').trim().toUpperCase();

        const sameAirlineGroup = flightGroups.find(g => {
          if (!g.outbound || g.inbound) return false;
          const outCode = String(g.outbound.airline_code || '').trim().toUpperCase();
          const outZh = String(g.outbound.airline_name_zh || '').trim().toUpperCase();
          return (flightCode && outCode && flightCode === outCode) ||
            (flightZh && outZh && flightZh === outZh);
        });

        if (sameAirlineGroup) {
          sameAirlineGroup.inbound = flight;
        } else {
          const lastOpenGroup = [...flightGroups].reverse().find(g => !g.inbound);
          if (lastOpenGroup) {
            lastOpenGroup.inbound = flight;
          } else {
            flightGroups.push({ outbound: null, inbound: flight });
          }
        }
      } else {
        flightGroups.push({ outbound: flight, inbound: null });
      }
    });
    const renderRoundtripCards = () => flightGroups.map(({ outbound, inbound }, i) => {
      const code = String(outbound?.airline_code || inbound?.airline_code || '').toUpperCase();
      const label = periodLabel(outbound, inbound || {}, i);
      const badgeBg = i % 2 === 0 ? 'bg-jollify-purple' : 'bg-jollify-dark';
      const anim = (i % 2 === 0) ? 'slide-left' : 'slide-right';
      return `
        <div class="relative bg-white border border-jollify-purple/10 shadow-sm hover:shadow-xl transition-all duration-500 min-h-[255px] px-8 md:px-12 py-10 animate-trigger ${anim} delay-200">
          <div class="absolute top-0 right-0 ${badgeBg} text-white px-5 py-2 font-sans text-sm md:text-base font-bold tracking-widest">${esc(label)}</div>
          <div class="flex items-start gap-6 mb-12">
            <div class="w-16 h-16 rounded-full bg-jollify-purple/10 flex items-center justify-center text-jollify-purple font-serif text-2xl font-bold shrink-0">${esc(code || '✈')}</div>
            <div class="pt-1">
              <h3 class="text-2xl md:text-3xl font-serif font-bold tracking-wider text-jollify-purple-dark leading-tight">${airlineTitle(outbound || inbound)}</h3>
              <p class="text-jollify-gold tracking-[0.2em] font-sans font-bold text-base mt-2 uppercase">${esc(routeName(outbound, inbound || {}))}</p>
            </div>
          </div>
          <div class="flight-card-lines">
            <div class="flight-route-row">
              <div class="flight-mark outbound">去</div>
              <div class="flight-route-label">去程 ${esc(prettyFlightNo(outbound))}</div>
              <div class="flight-route-time">${lineTime(outbound)}</div>
            </div>
            ${inbound ? `<div class="flight-route-row">
              <div class="flight-mark inbound">回</div>
              <div class="flight-route-label">回程 ${esc(prettyFlightNo(inbound))}</div>
              <div class="flight-route-time">${lineTime(inbound)}</div>
            </div>` : ''}
          </div>
        </div>`;
    }).join('');
    const renderMultiSegment = () => {
      const lead = visibleFlights[0] || {};
      const code = String(lead.airline_code || '').toUpperCase();
      const outboundSegments = visibleFlights.filter(f => !isReturnFlight(f));
      const inboundSegments = visibleFlights.filter(f => isReturnFlight(f));
      const route = [
        codeOf(outboundSegments[0] || lead, 'dep'),
        codeOf((outboundSegments[outboundSegments.length - 1] || lead), 'arr')
      ].filter(Boolean).map(c => citynames[c] || c).join(' ⇄ ');
      const renderColumn = (title, subtitle, list, markClass) => `
        <div class="flight-direction-column">
          <div class="flight-direction-head">
            <span class="flight-direction-mark ${markClass}">${title.slice(0, 1)}</span>
            <div>
              <div class="flight-direction-title">${title}</div>
              <div class="flight-direction-subtitle">${subtitle}</div>
            </div>
          </div>
          <div class="flight-timeline-lines">
            ${list.map((f, i) => `
              <div class="flight-timeline-row compact">
                <div class="flight-timeline-dot">${String(i + 1).padStart(2, '0')}</div>
                <div>
                  <div class="flight-route-label">${segmentTitle(f, i)}</div>
                  <div class="text-xs text-jollify-gray mt-1">${esc(codeOf(f, 'dep'))} → ${esc(codeOf(f, 'arr'))}</div>
                </div>
                <div class="flight-route-time">${lineTime(f)}</div>
              </div>`).join('')}
          </div>
        </div>`;
      return `
        <div class="flight-wide-card bg-white border border-jollify-purple/10 shadow-sm px-8 md:px-12 py-10 animate-trigger slide-left delay-200">
          <div class="flex items-start gap-6 mb-10">
            <div class="w-16 h-16 rounded-full bg-jollify-purple/10 flex items-center justify-center text-jollify-purple font-serif text-2xl font-bold shrink-0">${esc(code || '✈')}</div>
            <div>
              <div class="inline-flex bg-jollify-purple text-white px-4 py-1.5 text-xs tracking-widest font-sans font-bold mb-4">同航空多段航程</div>
              <h3 class="text-2xl md:text-3xl font-serif font-bold tracking-wider text-jollify-purple-dark leading-tight">${airlineTitle(lead)}</h3>
              <p class="text-jollify-gold tracking-[0.2em] font-sans font-bold text-base mt-2 uppercase">${esc(route)}</p>
            </div>
          </div>
          <div class="flight-direction-grid">
            ${renderColumn('去程航段', 'Outbound Segments', outboundSegments.length ? outboundSegments : visibleFlights.slice(0, Math.ceil(visibleFlights.length / 2)), 'outbound')}
            ${renderColumn('回程航段', 'Return Segments', inboundSegments.length ? inboundSegments : visibleFlights.slice(Math.ceil(visibleFlights.length / 2)), 'inbound')}
          </div>
        </div>`;
    };
    const renderConnectionChain = () => {
      const rows = visibleFlights.map((f, i) => {
        const domestic = String(f?.tag || '').includes('國內') || String(f?.tag || '').includes('中段');
        return `
          <div class="connection-step ${domestic ? 'domestic' : ''}">
            <div class="connection-kicker">${domestic ? '中段國內線' : esc(f?.tag || `航段 ${i + 1}`)}</div>
            <div class="connection-main">${segmentTitle(f, i)}</div>
            <div class="connection-time">${lineTime(f)}</div>
          </div>`;
      }).join('');
      return `
        <div class="flight-wide-card bg-white border border-jollify-purple/10 shadow-sm px-8 md:px-12 py-10 animate-trigger slide-right delay-200">
          <div class="mb-10">
            <div class="inline-flex bg-jollify-gold text-white px-4 py-1.5 text-xs tracking-widest font-sans font-bold mb-4">含中段銜接</div>
            <h3 class="text-2xl md:text-3xl font-serif font-bold tracking-wider text-jollify-purple-dark leading-tight">國際段與國內線銜接</h3>
            <p class="text-jollify-gray font-sans text-sm mt-2">適合一段中段國內線或目的地內單程移動。</p>
          </div>
          <div class="connection-chain">${rows}</div>
        </div>`;
    };
    const sameAirlineCount = new Set(visibleFlights.map(f => String(f.airline_code || '').toUpperCase()).filter(Boolean)).size;
    const requestedLayout = flights.magazine_layout || 'auto';
    const resolvedLayout = requestedLayout !== 'auto'
      ? requestedLayout
      : ((visibleFlights.length >= 4 && sameAirlineCount <= 1) ? 'multi_segment' : (visibleFlights.length <= 2 ? 'roundtrip_card' : 'domestic_connection'));
    const cards = resolvedLayout === 'multi_segment'
      ? renderMultiSegment()
      : resolvedLayout === 'domestic_connection'
        ? renderConnectionChain()
        : renderRoundtripCards();
    const gridClass = resolvedLayout === 'roundtrip_card' ? 'grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12' : 'space-y-8';
    flightsHtml = `
    <section id="page-2" class="magazine-section bg-jollify-cream text-jollify-dark" data-title="航班參考">
      <div class="max-w-6xl mx-auto w-full relative z-10">
        <div class="text-center mb-16 animate-trigger">
          <p class="text-jollify-purple tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">${esc(flights.subtitle || 'PREMIUM FLIGHTS')}</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-jollify-purple-dark">${esc(flights.title || '尊榮啟航 ‧ 航班資訊')}</h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="${gridClass}">${cards}</div>
        <div class="mt-12 text-center text-jollify-gray text-xs font-sans animate-trigger delay-400">
          * 實際航班時間以航空公司公告為主，若有變動將由專屬顧問即時通知。
        </div>
      </div>
    </section>`;
  }

  // ── Features HTML (Highlights) ─────────────────────────────────
  let featuresHtml = '';
  if (highlights?.visible !== false && visibleHighlights.length) {
    const cards = visibleHighlights.map((c, i) => {
      const imageUrl = safeImageUrl(c.img);
      return `
      <article class="j-mag-feature-card bg-white border border-jollify-purple/10 shadow-sm animate-trigger slide-up delay-${Math.min((i + 1) * 100, 700)}">
        <div class="j-mag-feature-media relative overflow-hidden">
          ${imageUrl
            ? `<img src="${esc(imageUrl)}" alt="${esc(c.title || '行程特色')}" class="w-full h-full object-cover img-elegant">${imageCredit(c.image_source)}`
            : `<div class="j-mag-feature-placeholder">
                <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
              </div>`}
        </div>
        <div class="j-mag-feature-body">
          ${c.subtitle ? `<p class="text-jollify-gold text-xs tracking-[0.2em] font-sans font-bold mb-2">${esc(c.subtitle)}</p>` : ''}
          <h3 class="text-xl font-serif font-bold text-jollify-purple-dark mb-3">${esc(c.title || '')}</h3>
          <p class="text-jollify-gray font-sans text-sm leading-relaxed">${esc(c.desc || '')}</p>
        </div>
      </article>
    `;
    }).join('');
    featuresHtml = `
    <section id="page-feature" class="magazine-section bg-jollify-cream" data-title="行程特色">
      <div class="max-w-6xl mx-auto w-full relative z-10 px-4 md:px-8 py-16">
        <div class="text-center mb-16 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">${esc(highlights.subtitle || 'EXCLUSIVE HIGHLIGHTS')}</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-jollify-purple-dark">
            ${esc(highlights.title || '行程特色 ‧ 專屬亮點')}
          </h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${cards}
        </div>
      </div>
    </section>`;
  }

  // ── Scenic spots HTML ─────────────────────────────────────────
  let spotsHtml = '';
  if (spots?.visible !== false && visibleSpots.length) {
    const cards = visibleSpots.map((spot, i) => {
      const imageUrl = safeImageUrl(spot.img);
      return `
      <article class="bg-white border border-jollify-purple/10 shadow-sm animate-trigger slide-up delay-${Math.min((i + 1) * 100, 700)}">
        <div class="relative h-64 overflow-hidden">
          ${imageUrl ? `<img src="${esc(imageUrl)}" alt="${esc(spot.name || '精選景點')}" class="w-full h-full object-cover img-elegant">${imageCredit(spot.image_source)}` : '<div class="j-mag-feature-placeholder"></div>'}
        </div>
        <div class="p-7">
          ${spot.tag ? `<p class="text-jollify-gold text-xs tracking-[0.2em] font-sans font-bold mb-3">${esc(spot.tag)}</p>` : ''}
          <h3 class="text-2xl font-serif font-bold text-jollify-purple-dark mb-1">${esc(spot.name || '')}</h3>
          ${spot.name_en || spot.city_zh ? `<p class="text-xs tracking-wider text-jollify-purple mb-3 font-sans">${esc([spot.name_en, spot.city_zh].filter(Boolean).join(' · '))}</p>` : ''}
          <p class="text-jollify-gray font-sans text-sm leading-relaxed">${esc(spot.desc || '')}</p>
        </div>
      </article>
    `;
    }).join('');
    spotsHtml = `
    <section id="page-spots" class="magazine-section bg-jollify-cream" data-title="精選景點">
      <div class="max-w-6xl mx-auto w-full relative z-10 px-4 md:px-8 py-16">
        <div class="text-center mb-14 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">${esc(spots.subtitle || 'SCENIC SPOTS')}</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-jollify-purple-dark">${esc(spots.title || '精選景點 ‧ 探索之美')}</h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">${cards}</div>
      </div>
    </section>`;
  }

  // ── Highlights HTML (Day overview) ─────────────────────────────
  let highlightsHtml = '';
  if (days?.visible !== false && days?.items?.length) {
    const rows = days.items.map((day, i) => {
      const pageId = `page-day-${i + 1}`;
      return `
        <div role="link" tabindex="0" aria-label="查看第 ${i + 1} 天行程：${esc(day.title || `第 ${i + 1} 天`)}"
             onclick="document.getElementById('${pageId}') && document.getElementById('${pageId}').scrollIntoView({ behavior: 'smooth' })"
             onkeydown="if(event.key === 'Enter' || event.key === ' '){ event.preventDefault(); this.click(); }"
             class="itinerary-row flex flex-col md:flex-row items-center border-b border-jollify-gold/15 pb-4 cursor-pointer p-4 border-l-4 border-l-transparent rounded-r-md">
          <div class="text-jollify-gold text-3xl font-serif font-bold w-full md:w-36 mb-2 md:mb-0">DAY ${String(i + 1).padStart(2, '0')}</div>
          <div class="flex-1 w-full">
            <h4 class="text-2xl md:text-3xl font-bold tracking-wide text-white mobile-readable-title">${esc(day.title || `第 ${i + 1} 天`)}</h4>
            <p class="j-overview-summary text-base md:text-lg mt-2 mobile-readable-body">${esc(day.summary || day.lead || day.route || '')}</p>
          </div>
          <div class="itinerary-stay w-full md:w-56 text-left md:text-right text-sm text-jollify-gold-light mt-3 md:mt-0 font-medium">${esc((day.hotel_name || day.stay) ? '宿: ' + (day.hotel_name || day.stay) : '')}</div>
        </div>`;
    }).join('');
    const totalDays = days.items.length;
    const toChineseNum = (n) => {
      const cn = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
      if (n <= 10) return cn[n] || n;
      if (n < 20) return '十' + (n % 10 === 0 ? '' : cn[n % 10]);
      return cn[Math.floor(n / 10)] + '十' + (n % 10 === 0 ? '' : cn[n % 10]);
    };
    highlightsHtml = `
    <section id="page-3" class="magazine-section bg-jollify-dark text-white" data-title="行程總覽">
      <div class="max-w-5xl mx-auto w-full relative z-10">
        <div class="text-center mb-16 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">${esc(days.subtitle || 'EXCLUSIVE ITINERARY')}</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-jollify-gold-light">
            ${esc(days.title || `${toChineseNum(totalDays)} 日行程 ‧ 精采總覽`)}
          </h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="space-y-4 font-sans max-w-4xl mx-auto">${rows}</div>
      </div>
    </section>`;
  }

  // ── Days Detail HTML ───────────────────────────────────────────
  let daysDetailHtml = '';
  if (days?.visible !== false && days?.items?.length) {
    daysDetailHtml = days.items.map((day, i) => {
      const pageId = `page-day-${i + 1}`;
      const isDark = (i % 2 !== 0);
      const bg = isDark ? 'bg-jollify-dark text-white' : 'bg-jollify-cream text-jollify-dark';
      const titleColor = isDark ? 'text-white' : 'text-jollify-purple-dark';
      const subColor = isDark ? 'text-jollify-gold-light' : 'text-jollify-gold-dark';
      const bodyColor = isDark ? 'j-day-body-dark' : 'j-day-body-light';
      const imgSide = (i % 2 === 0) ? 'flex-col lg:flex-row' : 'flex-col lg:flex-row-reverse';
      const imgAnim = (i % 2 === 0) ? 'slide-left' : 'slide-right';
      const txtAnim = (i % 2 === 0) ? 'slide-right' : 'slide-left';
      const img = safeImageUrl(day.image?.url || day.images?.[0], 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
      const imgLabel = day.image?.label ? `${esc(day.image.label)}` : `DAY ${String(i + 1).padStart(2, '0')} ‧ ${esc(day.title || '').substring(0, 10)}`;
      const imgSubtitle = day.image?.subtitle || '';
      const tagBg = isDark ? 'bg-jollify-gold/80' : 'bg-jollify-purple/80';
      const desc = esc(day.lead || day.description || '').replace(/\n/g, '<br>');
      const pointsHtml = day.points ? `<div class="${bodyColor} mb-6 leading-relaxed font-sans text-base mobile-readable-body">${esc(day.points).replace(/\n/g, '<br>')}</div>` : '';
      // meals
      const showMeals = day.meals?.show !== false;
      const hasMeals = showMeals && (day.meals?.breakfast || day.meals?.lunch || day.meals?.dinner);
      const mealsHtml = hasMeals ? `
            <div class="day-meals mt-8 pt-6 border-t ${isDark ? 'border-jollify-gold/20' : 'border-jollify-purple/10'} grid grid-cols-3 gap-3 font-sans text-xs">
              ${day.meals?.breakfast ? `<div class="day-meal"><span class="day-meal-label block font-bold ${isDark ? 'text-jollify-gold' : 'text-jollify-purple'} mb-1">早餐 B</span><span class="day-meal-value ${bodyColor}">${esc(day.meals.breakfast)}</span></div>` : '<div class="day-meal" aria-hidden="true"></div>'}
              ${day.meals?.lunch ? `<div class="day-meal"><span class="day-meal-label block font-bold ${isDark ? 'text-jollify-gold' : 'text-jollify-purple'} mb-1">午餐 L</span><span class="day-meal-value ${bodyColor}">${esc(day.meals.lunch)}</span></div>` : '<div class="day-meal" aria-hidden="true"></div>'}
              ${day.meals?.dinner ? `<div class="day-meal"><span class="day-meal-label block font-bold ${isDark ? 'text-jollify-gold' : 'text-jollify-purple'} mb-1">晚餐 D</span><span class="day-meal-value ${bodyColor}">${esc(day.meals.dinner)}</span></div>` : '<div class="day-meal" aria-hidden="true"></div>'}
            </div>` : '';

      const stayName = day.hotel_name || day.stay;
      const stayHtml = stayName ? `
            <div class="day-stay mt-5 ${!hasMeals ? `pt-6 border-t ${isDark ? 'border-jollify-gold/20' : 'border-jollify-purple/10'}` : ''} flex items-center font-sans text-sm">
              <span class="day-stay-label inline-flex items-center justify-center border ${isDark ? 'border-jollify-gold text-jollify-gold' : 'border-jollify-purple text-jollify-purple'} rounded-full px-3 py-1 text-[10px] font-bold mr-4 tracking-[0.2em] uppercase">STAY</span>
              <span class="day-stay-name ${bodyColor} font-bold text-sm md:text-base tracking-wide">${esc(stayName)}</span>
            </div>` : '';

      return `
    <section id="${pageId}" class="magazine-section p-0 ${bg}" data-title="Day ${String(i + 1).padStart(2, '0')}">
      <div class="flex ${imgSide} w-full h-full min-h-screen">
        <div class="w-full lg:w-1/2 h-[45vh] lg:h-screen relative overflow-hidden animate-trigger ${imgAnim}">
          <img src="${esc(img)}" alt="Day ${i + 1}" class="w-full h-full object-cover img-elegant">
          ${imageCredit(day.image?.source)}
          <div class="absolute inset-0 bg-gradient-to-t from-jollify-dark/40 to-transparent"></div>
          <span class="day-image-tag absolute bottom-6 left-6 text-white text-xs tracking-widest font-sans ${tagBg} px-4 py-2 backdrop-blur-md">${imgLabel}${imgSubtitle ? `<small class="day-image-subtitle block mt-1">${esc(imgSubtitle)}</small>` : ''}</span>
        </div>
        <div class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 animate-trigger ${txtAnim} delay-200">
          <div class="max-w-xl w-full">
            <p class="text-jollify-gold tracking-[0.3em] font-serif font-semibold text-base mb-2">DAY ${String(i + 1).padStart(2, '0')}</p>
            <h2 class="text-5xl md:text-6xl font-bold mb-8 leading-tight ${titleColor} font-serif mobile-readable-title">
              ${esc(day.title || `第 ${i + 1} 天`)}<br>
              <span class="text-3xl font-light italic ${subColor} mt-3 block font-serif">${esc(day.route || day.summary || '')}</span>
            </h2>
            <p class="${bodyColor} mb-4 leading-relaxed font-sans font-light text-lg mobile-readable-body">${desc}</p>
            ${pointsHtml}
            ${mealsHtml}
            ${stayHtml}
          </div>
        </div>
      </div>
    </section>`;
    }).join('');
  }

  // ── Hotels HTML ────────────────────────────────────────────────
  let hotelsHtml = '';
  if (hotels?.visible !== false && visibleHotels.length) {
    hotelsHtml = visibleHotels.map((hotel, i) => {
      const pageId = `page-hotel-${i + 1}`;
      const isDark = (i % 2 !== 0);
      const bg = isDark ? 'bg-jollify-dark text-white' : 'bg-jollify-cream text-jollify-dark';
      const titleColor = isDark ? 'text-white' : 'text-jollify-purple-dark';
      const accentColor = isDark ? 'text-jollify-gold' : 'text-jollify-purple';
      const bodyColor = isDark ? 'text-gray-300' : 'text-jollify-gray';
      const borderColor = isDark ? 'border-jollify-gold/20' : 'border-jollify-purple/10';
      const layout = (i % 2 === 0) ? 'flex-col md:flex-row' : 'flex-col md:flex-row-reverse';
      const imgAnim = (i % 2 === 0) ? 'slide-right' : 'slide-left';
      const txtAnim = (i % 2 === 0) ? 'slide-left' : 'slide-right';
      const img = safeImageUrl(hotel.image || hotel.img, 'https://images.unsplash.com/photo-1542314831-c6a420808643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80');
      const desc = esc(hotel.description || hotel.desc || '').replace(/\n/g, '<br>');
      const hotelUrl = safeHttpUrl(hotel.link);
      const linkHtml = hotelUrl ? `<a href="${esc(hotelUrl)}" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-3 text-xs tracking-[0.2em] ${accentColor} transition-colors font-semibold uppercase mt-8">探索飯店 →</a>` : '';
      const tagsHtml = hotel.tags
        ? `<div class="flex flex-wrap gap-2 mt-6">${hotel.tags.split(/[,，\n]/).filter(t => t.trim()).map(t => `<span class="px-2.5 py-0.5 text-xs font-sans tracking-wider rounded border ${isDark ? 'bg-jollify-gold/10 text-jollify-gold border-jollify-gold/20' : 'bg-jollify-purple/5 text-jollify-purple border-jollify-purple/10'}">${esc(t.trim())}</span>`).join('')}</div>`
        : '';
      return `
    <section id="${pageId}" class="magazine-section ${bg}" data-title="${esc((hotel.name || '旅宿').substring(0, 8))}">
      <div class="max-w-7xl mx-auto w-full relative z-10 flex ${layout} items-center gap-12 lg:gap-24">
        <div class="w-full md:w-1/2 animate-trigger ${imgAnim} delay-100">
          <div class="relative group">
            <div class="absolute inset-0 translate-x-4 translate-y-4 border ${borderColor} z-0 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
            <img src="${esc(img)}" class="relative z-10 w-full h-[50vh] md:h-[70vh] object-cover shadow-2xl img-elegant">
            ${imageCredit(hotel.image_source)}
          </div>
        </div>
        <div class="w-full md:w-1/2 animate-trigger ${txtAnim} delay-300">
          <p class="${accentColor} tracking-[0.3em] uppercase text-xs mb-4 font-sans font-semibold">${esc([hotels.subtitle || 'STAY IN STYLE', hotels.title, hotel.city_zh, hotel.stars].filter(Boolean).join(' · '))}</p>
          <h2 class="text-4xl md:text-5xl font-bold font-serif ${titleColor} tracking-wider ${hotel.name_en ? 'mb-2' : 'mb-6'} leading-tight" style="font-weight:700 !important;">${esc(hotel.name || '嚴選旅宿')}</h2>
          ${hotel.name_en ? `<p class="text-sm md:text-base font-sans tracking-[0.12em] ${bodyColor} mb-6">${esc(hotel.name_en)}</p>` : ''}
          <div class="w-16 h-[2px] ${isDark ? 'bg-jollify-gold' : 'bg-jollify-purple'} mb-8"></div>
          <div class="font-sans text-sm md:text-base leading-loose tracking-wide ${bodyColor} font-light"><p>${desc}</p>${tagsHtml}</div>
          ${linkHtml}
        </div>
      </div>
    </section>`;
    }).join('');
  }

  // ── Route map HTML ────────────────────────────────────────────
  // map_data is the persisted itinerary source shared with the classic theme.
  // Keep the magazine page conditional so an empty optional map never renders
  // a decorative placeholder as though it were an actual route.
  let mapHtml = '';
  const mapImageUrl = safeImageUrl(mapData.embed_url);
  if (mapData.visible !== false && mapImageUrl) {
    const mapTitle = mapData.title || '行程地圖';
    mapHtml = `
    <section id="page-map" class="magazine-section bg-jollify-cream text-jollify-dark" data-title="${esc(mapTitle)}">
      <div class="max-w-6xl mx-auto w-full relative z-10 px-4 md:px-8 py-16">
        <div class="text-center mb-12 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">ROUTE MAP</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-jollify-purple-dark">${esc(mapTitle)}</h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <figure class="animate-trigger scale-up delay-200">
          <div class="relative overflow-hidden border border-jollify-purple/10 bg-white p-2 shadow-xl md:p-4">
            <img src="${esc(mapImageUrl)}" alt="${esc(mapTitle)}" class="w-full h-auto object-contain">
            ${imageCredit(mapData.image_source)}
          </div>
          ${mapData.desc ? `<figcaption class="mx-auto mt-6 max-w-3xl text-center font-sans text-sm leading-relaxed text-jollify-gray">${esc(mapData.desc).replace(/\n/g, '<br>')}</figcaption>` : ''}
        </figure>
      </div>
    </section>`;
  }

  // ── Notices HTML ───────────────────────────────────────────────
  const hasNotices = itinerary?.notices?.visible !== false && itinerary?.notices?.items?.length;
  let noticesHtml = '';
  if (hasNotices) {
    const noticeCards = itinerary.notices.items.map((notice, i) => {
      const headerId = `j-magazine-notice-header-${i + 1}`;
      const contentId = `j-magazine-notice-content-${i + 1}`;
      return `
      <div class="j-magazine-accordion-item border border-jollify-purple/10 rounded-lg overflow-hidden bg-white shadow-sm mb-4 transition-all duration-300 animate-trigger slide-up delay-${Math.min((i + 1) * 100, 700)}">
        <button id="${headerId}" class="j-magazine-accordion-header w-full text-left px-6 py-5 flex items-center justify-between focus:outline-none" type="button" aria-expanded="false" aria-controls="${contentId}">
          <div class="flex items-center gap-4">
            <span class="bg-jollify-purple text-white w-8 h-8 rounded-full flex items-center justify-center shrink-0">${NOTICE_INFO_ICON}</span>
            <span class="text-xl md:text-2xl font-serif font-bold text-jollify-purple-dark">${esc(notice.t || notice.title || '注意事項')}</span>
          </div>
          <span class="j-magazine-accordion-icon w-4 h-4 relative transition-transform duration-300 shrink-0 ml-4">
            <span class="absolute top-1.5 left-0 w-4 h-0.5 bg-jollify-gold"></span>
            <span class="absolute top-0 left-1.5 w-0.5 h-4 bg-jollify-gold"></span>
          </span>
        </button>
        <div id="${contentId}" class="j-magazine-accordion-content max-h-0 overflow-hidden transition-all duration-300 ease-in-out bg-jollify-cream/30" role="region" aria-labelledby="${headerId}" aria-hidden="true">
          <div class="px-6 pb-6 pt-2 text-jollify-gray font-sans text-base md:text-lg leading-relaxed">
            <div>${formatNoticeDesc(esc(notice.desc || notice.description || ''))}</div>
          </div>
        </div>
      </div>
    `;
    }).join('');

    noticesHtml = `
    <section id="page-notices" class="magazine-section bg-jollify-cream text-jollify-dark" data-title="報名注意">
      <div class="max-w-4xl mx-auto w-full relative z-10">
        <div class="text-center mb-14 animate-trigger">
          <p class="text-jollify-purple tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">${esc(itinerary.notices.subtitle || 'NOTICES')}</p>
          <h2 class="text-4xl md:text-6xl font-bold tracking-[0.12em] font-serif text-jollify-purple-dark mobile-readable-title">${esc(itinerary.notices.title || '報名注意事項')}</h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="space-y-4">${noticeCards}</div>
      </div>
    </section>`;
  }

  // ── Recommended HTML ───────────────────────────────────────────
  let recommendedHtml = '';
  if (recommended?.visible !== false && recommended?.items?.length) {
    const rCards = recommended.items.map((c, i) => {
      const recommendedUrl = safeHttpUrl(c.link, '#');
      const imageUrl = safeImageUrl(c.img);
      return `
      <a href="${esc(recommendedUrl)}"${recommendedUrl === '#' ? '' : ' target="_blank" rel="noopener noreferrer"'} class="recommended-card block group relative overflow-hidden h-64 md:h-80 w-full rounded-sm animate-trigger slide-up delay-${Math.min((i + 1) * 100, 700)}">
        <div class="recommended-card-image absolute inset-0 bg-cover bg-center transition-transform duration-700"${imageUrl ? ` style="background-image:url('${esc(imageUrl)}')"` : ''}></div>
        ${imageCredit(c.image_source)}
        <div class="absolute inset-0 bg-gradient-to-t from-jollify-dark/90 via-jollify-dark/40 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6">
          <h5 class="text-white font-serif font-bold text-xl md:text-2xl mb-2 line-clamp-2">${esc(c.t || c.title || '')}</h5>
          <span class="recommended-card-cta inline-block text-jollify-gold font-sans text-xs tracking-[0.2em] uppercase transition-colors duration-300">查看行程 &rarr;</span>
        </div>
      </a>
    `;
    }).join('');
    recommendedHtml = `
    <section id="page-recommended" class="magazine-section bg-jollify-dark text-white" data-title="推薦行程">
      <div class="max-w-6xl mx-auto w-full relative z-10">
        <div class="text-center mb-16 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">${esc(recommended.subtitle || 'MORE EXPLORE')}</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-jollify-gold-light">
            ${esc(recommended.title || '探索更多奢華旅程')}
          </h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${rCards}
        </div>
      </div>
    </section>`;
  }

  // ── CTA / Last Page ────────────────────────────────────────────
  const ctaTitle = safe(cta?.title || cta?.cta_title, '開啟您的尊榮篇章');
  const ctaDesc = safe(cta?.cta_desc, '地面代理專屬尊榮企劃報價，由專屬顧問親自服務。');
  const lineBtn = lineUrl ? `<a href="${esc(lineUrl)}" target="_blank" rel="noopener noreferrer" class="j-mag-cta-button w-full sm:w-auto px-8 py-4 bg-[#06C755] text-white font-sans font-bold text-sm tracking-[0.2em] rounded-sm hover:bg-[#05b04b] transition-all duration-300 shadow-lg">客服</a>` : '';
  const regBtn = `<a href="${esc(registerUrl)}" target="_blank" rel="noopener noreferrer" ${destinationClick} class="j-mag-cta-button w-full sm:w-auto px-8 py-4 bg-jollify-gold text-jollify-dark font-sans font-bold text-sm tracking-[0.2em] rounded-sm hover:bg-white hover:text-jollify-purple transition-all duration-300 border border-jollify-gold shadow-lg">立即報名</a>`;
  const ctaSection = cta?.visible !== false ? `
    <section id="page-cta" class="magazine-section bg-jollify-dark text-white relative" data-title="報價與諮詢">
      <div class="max-w-4xl mx-auto w-full text-center relative z-20 px-6 py-12 border border-jollify-gold/20 rounded-sm glass-premium-dark animate-trigger scale-up delay-200">
        <p class="text-jollify-gold tracking-[0.4em] font-serif text-sm mb-4 uppercase">${esc(cta?.subtitle || 'JOLLIFY TRAVEL EXCLUSIVE')}</p>
        <h2 class="text-4xl md:text-6xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-jollify-gold-light to-white mb-8">${esc(ctaTitle)}</h2>
        <div class="w-16 h-[1px] bg-jollify-gold mx-auto mb-10"></div>
        <p class="text-gray-300 font-sans text-base leading-relaxed mb-10">${esc(ctaDesc)}</p>
        <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
          ${lineBtn}
          ${regBtn}
          <button type="button" onclick="window.scrollTo({ top: 0, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' })" class="j-mag-cta-button w-full sm:w-auto px-8 py-4 bg-transparent text-white font-sans text-sm tracking-[0.2em] rounded-sm hover:bg-white/10 transition-all duration-300 border border-white/20">回到首頁</button>
        </div>
        <p class="text-[10px] text-gray-500 font-sans tracking-widest mt-16">© 2026 JOLLIFY TRAVEL 鑫囍探索. ALL RIGHTS RESERVED.</p>
      </div>
    </section>` : '';

  // ── CTA floating button ────────────────────────────────────────
  const floatBtn = (cta?.visible !== false && (registerUrl || lineUrl)) ? `
    <div class="j-mag-floating-actions fixed bottom-6 right-6 z-[9000] flex flex-col gap-3 items-end" aria-label="快速諮詢與報名">
      ${lineUrl ? `<a href="${esc(lineUrl)}" target="_blank" rel="noopener noreferrer" class="j-mag-floating-action j-mag-floating-line flex items-center bg-[#06C755] text-white rounded-full px-5 py-3 shadow-lg"><img src="/material-alias/Shared_data/LINE.png" alt="" class="w-5 h-5 object-contain mr-2" /><span class="font-bold">客服</span></a>` : ''}
      <a href="${esc(registerUrl)}" target="_blank" rel="noopener noreferrer" ${destinationClick} class="j-mag-floating-action j-mag-floating-register flex items-center bg-gradient-to-r from-jollify-gold to-yellow-600 text-white rounded-full px-6 py-3 shadow-xl font-serif tracking-widest text-lg font-bold border border-white/30">我要報名</a>
    </div>` : '';

  return prepareHtmlImagesForPreview(`
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;0,700;1,300;1,400&family=Noto+Serif+TC:wght@200;300;400;600;700;900&family=Montserrat:wght@200;300;400;500;600;700&display=swap" rel="stylesheet">

    <div id="jollify-magazine-tour" class="antialiased selection:bg-jollify-gold selection:text-jollify-dark">

    <!-- 頂端閱讀進度條 -->
    <div id="progress-bar"></div>

    <!-- 預載畫面 (Preloader) -->
    <div id="preloader" class="fixed inset-0 bg-jollify-dark z-[9999] flex flex-col items-center justify-center transition-all duration-1000">
      <div class="text-center space-y-6 px-4">
        <p class="text-jollify-gold tracking-[0.4em] font-serif text-sm uppercase animate-pulse-slow">JOLLIFY TRAVEL PRESENTS</p>
        <div class="relative w-24 h-24 mx-auto">
          <div class="absolute inset-0 rounded-full border-2 border-jollify-gold/20 border-t-jollify-gold animate-spin" style="animation-duration:2s;"></div>
          <div class="absolute inset-2 rounded-full border border-jollify-purple/30 border-b-jollify-purple animate-spin" style="animation-duration:3s;animation-direction:reverse;"></div>
          <div class="absolute inset-0 flex items-center justify-center"><span class="text-jollify-gold font-serif text-2xl font-semibold">J</span></div>
        </div>
        <h2 class="text-white text-xl tracking-[0.2em] font-light">${esc(safe(itinerary?.hero_data?.title1, '精彩行程')).replace(/\n/g, '<br>')}</h2>
        <div class="w-32 h-[1px] bg-jollify-gold/30 mx-auto overflow-hidden">
          <div class="h-full bg-jollify-gold w-0 progress-inner transition-all duration-700"></div>
        </div>
      </div>
    </div>

    <!-- 左側分頁導覽 -->
    <nav class="nav-dots" id="nav-dots" aria-label="行程章節導覽"></nav>

    ${floatBtn}

    <!-- Page 1: 封面 -->
    <section id="page-1" class="magazine-section p-0 m-0 h-screen w-full relative bg-jollify-dark" data-title="封面導引">
      <div class="absolute inset-0 z-0">
        <img src="${esc(safeImageUrl(itinerary?.hero_data?.image, 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'))}" alt="Cover" class="w-full h-full object-cover img-elegant opacity-50">
        ${imageCredit(itinerary?.hero_data?.image_source)}
      </div>
      <div class="j-mag-cover-overlay absolute inset-0 z-10"></div>
      <div class="absolute inset-8 border border-jollify-gold/25 pointer-events-none z-20 hidden md:block"></div>
      <div class="magazine-cover-content z-20 text-center text-white max-w-4xl mx-auto px-6 h-full flex flex-col justify-center items-center">
        <div class="magazine-cover-kicker animate-trigger scale-up delay-100 flex items-center gap-3 mb-6">
          <span class="w-6 h-[1px] bg-jollify-gold"></span>
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs font-sans">${esc(hero.subtitle || 'Jollify Luxury Journey')}</p>
          <span class="w-6 h-[1px] bg-jollify-gold"></span>
        </div>
        <h1 class="magazine-cover-title text-5xl md:text-8xl font-black tracking-[0.15em] mb-8 leading-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-white via-jollify-gold-light to-white">
          ${esc(safe(itinerary?.hero_data?.title1, '未命名行程')).replace(/\n/g, '<br>')}<br>
          <span class="text-2xl md:text-5xl italic font-light tracking-[0.1em] text-jollify-gold-light mt-4 block font-serif">${esc(safe(itinerary?.hero_data?.title2, '')).replace(/\n/g, '<br>')}</span>
        </h1>
        <div class="magazine-cover-rule w-20 h-[1px] bg-gradient-to-r from-transparent via-jollify-gold to-transparent my-4"></div>
        <p class="magazine-cover-tags text-base md:text-xl font-light tracking-[0.25em] text-gray-200 font-sans mt-4">${esc(tags)}</p>
        ${hero.description ? `<p class="magazine-cover-description max-w-xl text-sm md:text-base font-light leading-relaxed text-gray-200 font-sans mt-5">${esc(hero.description)}</p>` : ''}
        <button type="button" class="cover-scroll-cue absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-20" aria-label="前往下一個行程章節" onclick="document.querySelector('#jollify-magazine-tour section:nth-of-type(2)')?.scrollIntoView({ behavior: 'smooth' })">
          <span class="cover-scroll-label text-xs tracking-[0.3em] text-jollify-gold transition-colors duration-300 block mb-2 font-sans">SCROLL TO DISCOVER</span>
          <div class="w-5 h-8 border border-jollify-gold/40 rounded-full mx-auto p-1 flex justify-center">
            <div class="w-1 h-2 bg-jollify-gold rounded-full animate-bounce"></div>
          </div>
        </button>
      </div>
    </section>

    ${quickInfoHtml}
    ${priceHtml}
    ${flightsHtml}
    ${featuresHtml}
    ${spotsHtml}
    ${highlightsHtml}
    ${daysDetailHtml}
    ${hotelsHtml}
    ${mapHtml}
    ${noticesHtml}
    ${recommendedHtml}
    ${ctaSection}

    </div>
  `);
};
