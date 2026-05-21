
export const generateCss = () => {
  return `
        #jollify-magazine-tour {
            font-family: 'Noto Serif TC', serif;
            background-color: #FBF9FC;
            color: #150F1D;
            overflow-x: hidden;
            scroll-behavior: smooth;
        }
        
        /* 自訂高級捲動軸，呼應鑫囍紫金主題 */
        #jollify-magazine-tour::-webkit-scrollbar {
            width: 8px;
        }
        #jollify-magazine-tour::-webkit-scrollbar-track {
            background: #150F1D; 
        }
        #jollify-magazine-tour::-webkit-scrollbar-thumb {
            background: linear-gradient(to bottom, #4C2A85, #D4A93B); 
            border-radius: 4px;
        }

        /* 雜誌頁面基本樣式 */
        #jollify-magazine-tour .magazine-section {
            min-height: 100vh;
            width: 100vw;
            display: flex;
            align-items: center;
            justify-content: center;
            position: relative;
            padding: 5rem 1.5rem;
            overflow: hidden;
        }

        /* 頂級轉場動畫類別 */
        #jollify-magazine-tour .animate-trigger {
            opacity: 0;
            transform: translateY(40px);
            transition: opacity 1.2s cubic-bezier(0.16, 1, 0.3, 1), transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        #jollify-magazine-tour .animate-trigger.slide-left {
            transform: translateX(-50px);
        }

        #jollify-magazine-tour .animate-trigger.slide-right {
            transform: translateX(50px);
        }

        #jollify-magazine-tour .animate-trigger.scale-up {
            transform: scale(0.95);
        }

        #jollify-magazine-tour .animate-active {
            opacity: 1 !important;
            transform: translate(0) scale(1) !important;
        }

        /* 漸進式文字延遲 */
        #jollify-magazine-tour .delay-100 { transition-delay: 100ms; }
        #jollify-magazine-tour .delay-200 { transition-delay: 200ms; }
        #jollify-magazine-tour .delay-300 { transition-delay: 300ms; }
        #jollify-magazine-tour .delay-400 { transition-delay: 400ms; }
        #jollify-magazine-tour .delay-500 { transition-delay: 500ms; }
        #jollify-magazine-tour .delay-600 { transition-delay: 600ms; }
        #jollify-magazine-tour .delay-700 { transition-delay: 700ms; }

        /* 左側懸浮導覽列的進階設計 */
        #jollify-magazine-tour .nav-dots {
            position: fixed;
            left: 25px;
            right: auto;
            top: 50%;
            transform: translateY(-50%);
            z-index: 50;
            display: flex;
            flex-direction: column;
            gap: 16px;
        }
        
        #jollify-magazine-tour .dot-wrapper {
            display: flex;
            flex-direction: row-reverse;
            align-items: center;
            justify-content: flex-end;
            position: relative;
            cursor: pointer;
            group: pointer;
        }

        #jollify-magazine-tour .dot-label {
            opacity: 0;
            transform: translateX(-10px);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            color: #D4A93B;
            font-size: 0.8rem;
            letter-spacing: 0.15em;
            margin-left: 12px;
            margin-right: 0;
            white-space: nowrap;
            pointer-events: none;
            text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }

        #jollify-magazine-tour .dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background-color: rgba(76, 42, 133, 0.35); /* 鑫囍紫的透明度 */
            border: 1px solid rgba(212, 169, 59, 0.5); /* 鑫囍金邊框 */
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        #jollify-magazine-tour .dot-wrapper:hover .dot-label {
            opacity: 1;
            transform: translateX(0);
        }

        #jollify-magazine-tour .dot-wrapper:hover .dot {
            background-color: #D4A93B;
            transform: scale(1.4);
        }

        #jollify-magazine-tour .dot-wrapper.active .dot {
            background-color: #D4A93B;
            box-shadow: 0 0 10px #D4A93B, 0 0 4px #4C2A85;
            transform: scale(1.6);
            border-color: #4C2A85;
        }

        #jollify-magazine-tour .dark-bg-dots .dot {
            background-color: rgba(255, 255, 255, 0.25);
            border-color: rgba(214, 169, 59, 0.6);
        }
        
        #jollify-magazine-tour .dark-bg-dots .dot-wrapper.active .dot {
            background-color: #D4A93B;
            box-shadow: 0 0 10px #D4A93B, 0 0 4px #FFFFFF;
        }

        /* 圖片高質感奢華濾鏡與慢速動態 */
        #jollify-magazine-tour .img-elegant {
            filter: brightness(0.92) contrast(1.05) saturate(0.95);
            transition: transform 12s cubic-bezier(0.1, 0.8, 0.2, 1);
        }
        #jollify-magazine-tour .overflow-hidden:hover .img-elegant {
            transform: scale(1.08) rotate(0.5deg);
        }

        /* 玻璃微光質感 (Glassmorphism) */
        #jollify-magazine-tour .glass-premium {
            background: rgba(251, 249, 252, 0.75);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(76, 42, 133, 0.1);
        }

        #jollify-magazine-tour .glass-premium-dark {
            background: rgba(21, 15, 29, 0.82);
            backdrop-filter: blur(15px);
            -webkit-backdrop-filter: blur(15px);
            border: 1px solid rgba(212, 169, 59, 0.15);
        }

        /* 頁面頂端閱讀進度條 */
        #jollify-magazine-tour #progress-bar {
            position: fixed;
            top: 0;
            left: 0;
            height: 3px;
            background: linear-gradient(to right, #4C2A85, #D4A93B, #6E45B2);
            width: 0%;
            z-index: 100;
            transition: width 0.1s ease;
        }

        /* 行程總覽項目的精緻懸浮設計 */
        #jollify-magazine-tour .itinerary-row {
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        #jollify-magazine-tour .itinerary-row:hover {
            background: rgba(212, 169, 59, 0.08);
            border-left-color: #D4A93B !important;
            padding-left: 2rem !important;
        }

        #jollify-magazine-tour .flight-card-lines {
            position: relative;
            padding-left: 4rem;
            font-family: 'Montserrat', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
        }

        #jollify-magazine-tour .flight-card-lines::before {
            content: '';
            position: absolute;
            left: 1.25rem;
            top: 1.25rem;
            bottom: 1.25rem;
            width: 2px;
            background: #E5E1EA;
        }

        #jollify-magazine-tour .flight-route-row {
            position: relative;
            min-height: 4.5rem;
            display: grid;
            grid-template-columns: minmax(9rem, 1fr) minmax(16rem, 1.55fr);
            align-items: center;
            gap: 1.5rem;
            border-bottom: 1px solid rgba(76, 42, 133, 0.08);
        }

        #jollify-magazine-tour .flight-route-row:last-child {
            border-bottom: 0;
        }

        #jollify-magazine-tour .flight-mark {
            position: absolute;
            left: -3.4rem;
            top: 50%;
            transform: translateY(-50%);
            width: 2rem;
            height: 2rem;
            border-radius: 999px;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            font-size: 0.95rem;
            font-weight: 800;
            z-index: 1;
        }

        #jollify-magazine-tour .flight-mark.outbound {
            color: #4C2A85;
            border: 3px solid #4C2A85;
        }

        #jollify-magazine-tour .flight-mark.inbound {
            color: #D4A93B;
            border: 3px solid #D4A93B;
        }

        #jollify-magazine-tour .flight-route-label {
            color: #6A5E78;
            font-size: 1.35rem;
            font-weight: 700;
            letter-spacing: 0.02em;
        }

        #jollify-magazine-tour .flight-route-time {
            color: #2D1654;
            font-size: 1.5rem;
            font-weight: 900;
            text-align: right;
            letter-spacing: -0.01em;
            white-space: nowrap;
        }

        #jollify-magazine-tour .flight-arrow {
            display: inline-block;
            padding: 0 0.2rem;
        }

        #jollify-magazine-tour .flight-wide-card {
            position: relative;
            overflow: hidden;
        }

        #jollify-magazine-tour .flight-direction-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 2rem;
        }

        #jollify-magazine-tour .flight-direction-column {
            background: #FBF9FC;
            border: 1px solid rgba(76, 42, 133, 0.1);
            padding: 1.5rem;
        }

        #jollify-magazine-tour .flight-direction-head {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding-bottom: 1.25rem;
            margin-bottom: 0.5rem;
            border-bottom: 1px solid rgba(76, 42, 133, 0.08);
        }

        #jollify-magazine-tour .flight-direction-mark {
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 999px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            background: #fff;
            font-weight: 900;
            flex: 0 0 auto;
        }

        #jollify-magazine-tour .flight-direction-mark.outbound {
            color: #4C2A85;
            border: 3px solid #4C2A85;
        }

        #jollify-magazine-tour .flight-direction-mark.inbound {
            color: #D4A93B;
            border: 3px solid #D4A93B;
        }

        #jollify-magazine-tour .flight-direction-title {
            color: #2D1654;
            font-size: 1.2rem;
            font-weight: 900;
            letter-spacing: 0.08em;
        }

        #jollify-magazine-tour .flight-direction-subtitle {
            color: #D4A93B;
            font-size: 0.78rem;
            font-weight: 800;
            letter-spacing: 0.18em;
            text-transform: uppercase;
            margin-top: 0.2rem;
        }

        #jollify-magazine-tour .flight-timeline-lines {
            position: relative;
            display: grid;
            gap: 0;
            font-family: 'Montserrat', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
        }

        #jollify-magazine-tour .flight-timeline-row {
            display: grid;
            grid-template-columns: 3rem minmax(10rem, 1fr) minmax(18rem, 1.3fr);
            align-items: center;
            gap: 1.5rem;
            min-height: 5rem;
            border-bottom: 1px solid rgba(76, 42, 133, 0.08);
        }

        #jollify-magazine-tour .flight-timeline-row.compact {
            grid-template-columns: 2.75rem 1fr;
            gap: 1rem;
            align-items: start;
            padding: 1rem 0;
        }

        #jollify-magazine-tour .flight-timeline-row.compact .flight-route-time {
            grid-column: 2;
            text-align: left;
            font-size: 1.15rem;
            white-space: normal;
            margin-top: -0.25rem;
        }

        #jollify-magazine-tour .flight-timeline-row:last-child {
            border-bottom: 0;
        }

        #jollify-magazine-tour .flight-timeline-dot {
            width: 2.35rem;
            height: 2.35rem;
            border-radius: 999px;
            background: rgba(76, 42, 133, 0.08);
            color: #4C2A85;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 900;
            border: 2px solid rgba(76, 42, 133, 0.2);
        }

        #jollify-magazine-tour .connection-chain {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 1rem;
            font-family: 'Montserrat', 'PingFang TC', 'Microsoft JhengHei', sans-serif;
        }

        #jollify-magazine-tour .connection-step {
            position: relative;
            min-height: 11rem;
            padding: 1.5rem;
            background: #FBF9FC;
            border: 1px solid rgba(76, 42, 133, 0.1);
        }

        #jollify-magazine-tour .connection-step::after {
            content: '➜';
            position: absolute;
            right: -1rem;
            top: 50%;
            transform: translateY(-50%);
            color: #D4A93B;
            font-size: 1.35rem;
            font-weight: 900;
            z-index: 2;
        }

        #jollify-magazine-tour .connection-step:last-child::after {
            display: none;
        }

        #jollify-magazine-tour .connection-step.domestic {
            background: rgba(212, 169, 59, 0.08);
            border-color: rgba(212, 169, 59, 0.45);
        }

        #jollify-magazine-tour .connection-kicker {
            color: #D4A93B;
            font-size: 0.78rem;
            font-weight: 900;
            letter-spacing: 0.18em;
            margin-bottom: 1rem;
        }

        #jollify-magazine-tour .connection-main {
            color: #6A5E78;
            font-size: 1.1rem;
            font-weight: 800;
            margin-bottom: 1.5rem;
        }

        #jollify-magazine-tour .connection-time {
            color: #2D1654;
            font-size: 1.25rem;
            font-weight: 900;
            line-height: 1.35;
        }

        @media (max-width: 768px) {
            #jollify-magazine-tour .magazine-section {
                width: 100%;
                min-height: auto;
                padding: 4rem 1.25rem;
            }

            #jollify-magazine-tour .nav-dots {
                left: 10px;
                gap: 10px;
            }

            #jollify-magazine-tour .dot {
                width: 7px;
                height: 7px;
            }

            #jollify-magazine-tour .dot-label {
                display: none;
            }

            #jollify-magazine-tour .mobile-readable-title {
                font-size: 2rem !important;
                line-height: 1.2 !important;
                letter-spacing: 0.08em !important;
            }

            #jollify-magazine-tour .mobile-readable-body {
                font-size: 1rem !important;
                line-height: 1.9 !important;
            }

            #jollify-magazine-tour .flight-card-lines {
                padding-left: 3rem;
            }

            #jollify-magazine-tour .flight-card-lines::before {
                left: 1rem;
            }

            #jollify-magazine-tour .flight-route-row {
                grid-template-columns: 1fr;
                gap: 0.35rem;
                padding: 1rem 0;
            }

            #jollify-magazine-tour .flight-mark {
                left: -2.95rem;
            }

            #jollify-magazine-tour .flight-route-label {
                font-size: 1.05rem;
            }

            #jollify-magazine-tour .flight-route-time {
                text-align: left;
                font-size: clamp(1.1rem, 5.5vw, 1.4rem);
                white-space: normal;
            }

            #jollify-magazine-tour .flight-timeline-row,
            #jollify-magazine-tour .flight-direction-grid,
            #jollify-magazine-tour .connection-chain {
                grid-template-columns: 1fr;
            }

            #jollify-magazine-tour .flight-timeline-row {
                gap: 0.5rem;
                padding: 1rem 0;
            }

            #jollify-magazine-tour .connection-step::after {
                right: 50%;
                top: auto;
                bottom: -1.25rem;
                transform: translateX(50%) rotate(90deg);
            }
        }
    `;
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
            
            if (navDotsContainer) {
                sections.forEach((sec, index) => {
                    const title = sec.getAttribute('data-title') || \`Page \${index + 1}\`;
                    const dotWrapper = document.createElement('div');
                    dotWrapper.classList.add('dot-wrapper');
                    dotWrapper.setAttribute('data-index', index);
                    
                    const label = document.createElement('span');
                    label.classList.add('dot-label', 'font-sans');
                    label.textContent = title;
                    
                    const dot = document.createElement('div');
                    dot.classList.add('dot');
                    
                    dotWrapper.appendChild(label);
                    dotWrapper.appendChild(dot);
                    
                    dotWrapper.addEventListener('click', () => {
                        sec.scrollIntoView({ behavior: 'smooth' });
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
                        dotWrappers.forEach(dw => dw.classList.remove('active'));
                        if (dotWrappers[index]) {
                            dotWrappers[index].classList.add('active');
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
        });
  `;
};

export const generateHtml = (itinerary, flights, days, hotels, cta = {}) => {
  const highlights = itinerary?.highlights;
  const recommended = itinerary?.recommended;

  // ── Helpers ───────────────────────────────────────────────────
  const esc = (v) => (v == null ? '' : String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'));
  const safe = (v, fallback = '') => v != null && v !== '' ? v : fallback;
  const tags = [itinerary?.quick_info?.tag1, itinerary?.quick_info?.tag2, itinerary?.quick_info?.tag3]
    .filter(Boolean).join(' ‧ ') || '尊榮 ‧ 奢華 ‧ 絕美秘境';

  // ── Flights HTML ───────────────────────────────────────────────
  let flightsHtml = '';
  if (flights?.visible !== false && flights?.items?.length) {
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
    (flights.items || []).forEach((flight) => {
      if (isReturnFlight(flight) && flightGroups.length && !flightGroups[flightGroups.length - 1].inbound) {
        flightGroups[flightGroups.length - 1].inbound = flight;
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
      const lead = flights.items[0] || {};
      const code = String(lead.airline_code || '').toUpperCase();
      const outboundSegments = flights.items.filter(f => !isReturnFlight(f));
      const inboundSegments = flights.items.filter(f => isReturnFlight(f));
      const route = [
        codeOf(outboundSegments[0] || lead, 'dep'),
        codeOf((outboundSegments[outboundSegments.length - 1] || lead), 'arr')
      ].filter(Boolean).map(c => cityNames[c] || c).join(' ⇄ ');
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
            ${renderColumn('去程航段', 'Outbound Segments', outboundSegments.length ? outboundSegments : flights.items.slice(0, Math.ceil(flights.items.length / 2)), 'outbound')}
            ${renderColumn('回程航段', 'Return Segments', inboundSegments.length ? inboundSegments : flights.items.slice(Math.ceil(flights.items.length / 2)), 'inbound')}
          </div>
        </div>`;
    };
    const renderConnectionChain = () => {
      const rows = flights.items.map((f, i) => {
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
    const sameAirlineCount = new Set((flights.items || []).map(f => String(f.airline_code || '').toUpperCase()).filter(Boolean)).size;
    const requestedLayout = flights.magazine_layout || 'auto';
    const resolvedLayout = requestedLayout !== 'auto'
      ? requestedLayout
      : ((flights.items.length >= 4 && sameAirlineCount <= 1) ? 'multi_segment' : (flights.items.length <= 2 ? 'roundtrip_card' : 'domestic_connection'));
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
          <p class="text-jollify-purple tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">PREMIUM FLIGHTS</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-jollify-purple-dark">尊榮啟航 ‧ 航班資訊</h2>
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
  if (highlights?.visible !== false && highlights?.items?.length) {
    const cards = highlights.items.map((c, i) => `
      <div class="bg-white p-8 border border-jollify-purple/10 shadow-sm animate-trigger slide-up delay-${Math.min((i+1)*100, 700)}">
        <div class="w-12 h-12 bg-jollify-purple/10 text-jollify-purple flex items-center justify-center rounded-full mb-6">
          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
        </div>
        <h3 class="text-xl font-serif font-bold text-jollify-purple-dark mb-3">${esc(c.title || '')}</h3>
        <p class="text-jollify-gray font-sans text-sm leading-relaxed">${esc(c.desc || '')}</p>
      </div>
    `).join('');
    featuresHtml = `
    <section id="page-feature" class="magazine-section bg-jollify-cream" data-title="行程特色">
      <div class="max-w-6xl mx-auto w-full relative z-10 px-4 md:px-8 py-16">
        <div class="text-center mb-16 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">EXCLUSIVE HIGHLIGHTS</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-jollify-purple-dark">
            行程特色 ‧ 專屬亮點
          </h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          ${cards}
        </div>
      </div>
    </section>`;
  }

  // ── Highlights HTML (Day overview) ─────────────────────────────
  let highlightsHtml = '';
  if (days?.visible !== false && days?.items?.length) {
    const rows = days.items.map((day, i) => {
      const pageNum = i + 4;
      return `
        <div onclick="document.getElementById('page-${pageNum}') && document.getElementById('page-${pageNum}').scrollIntoView({ behavior: 'smooth' })"
             class="itinerary-row flex flex-col md:flex-row items-center border-b border-jollify-gold/15 pb-4 cursor-pointer p-4 border-l-4 border-l-transparent rounded-r-md">
          <div class="text-jollify-gold text-3xl font-serif font-bold w-full md:w-36 mb-2 md:mb-0">DAY ${String(i + 1).padStart(2, '0')}</div>
          <div class="flex-1 w-full">
            <h4 class="text-2xl md:text-3xl font-bold tracking-wide text-white mobile-readable-title">${esc(day.title || `第 ${i + 1} 天`)}</h4>
            <p class="text-base md:text-lg text-jollify-gray mt-2 mobile-readable-body">${esc(day.summary || '')}</p>
          </div>
          <div class="w-full md:w-56 text-left md:text-right text-sm text-jollify-gold-light mt-3 md:mt-0 font-medium">${esc((day.hotel_name || day.stay) ? '宿: ' + (day.hotel_name || day.stay) : '')}</div>
        </div>`;
    }).join('');
    const totalDays = days.items.length;
    const toChineseNum = (n) => {
      const cn = ['零','一','二','三','四','五','六','七','八','九','十'];
      if (n <= 10) return cn[n] || n;
      if (n < 20) return '十' + (n % 10 === 0 ? '' : cn[n % 10]);
      return cn[Math.floor(n / 10)] + '十' + (n % 10 === 0 ? '' : cn[n % 10]);
    };
    highlightsHtml = `
    <section id="page-3" class="magazine-section bg-jollify-dark text-white" data-title="行程總覽">
      <div class="max-w-5xl mx-auto w-full relative z-10">
        <div class="text-center mb-16 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">EXCLUSIVE ITINERARY</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-jollify-gold-light">
            ${toChineseNum(totalDays)} 日行程 ‧ 精采總覽
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
      const pageNum = i + 4;
      const isDark = (i % 2 !== 0);
      const bg = isDark ? 'bg-jollify-dark text-white' : 'bg-jollify-cream text-jollify-dark';
      const titleColor = isDark ? 'text-white' : 'text-jollify-purple-dark';
      const subColor = isDark ? 'text-jollify-gold-light' : 'text-jollify-gold-dark';
      const bodyColor = isDark ? 'text-gray-300' : 'text-jollify-gray';
      const imgSide = (i % 2 === 0) ? 'flex-col lg:flex-row' : 'flex-col lg:flex-row-reverse';
      const imgAnim = (i % 2 === 0) ? 'slide-left' : 'slide-right';
      const txtAnim = (i % 2 === 0) ? 'slide-right' : 'slide-left';
      const img = day.image?.url || day.images?.[0] || 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
      const imgLabel = day.image?.label ? `${esc(day.image.label)}` : `DAY ${String(i + 1).padStart(2, '0')} ‧ ${esc(day.title || '').substring(0, 10)}`;
      const tagBg = isDark ? 'bg-jollify-gold/80' : 'bg-jollify-purple/80';
      const desc = (day.lead || day.description || '').replace(/\n/g, '<br>');
      // meals
      const showMeals = day.meals?.show !== false;
      const hasMeals = showMeals && (day.meals?.breakfast || day.meals?.lunch || day.meals?.dinner);
      const mealsHtml = hasMeals ? `
            <div class="mt-8 pt-6 border-t ${isDark ? 'border-jollify-gold/20' : 'border-jollify-purple/10'} grid grid-cols-3 gap-3 font-sans text-xs">
              ${day.meals?.breakfast ? `<div><span class="block font-bold ${isDark ? 'text-jollify-gold' : 'text-jollify-purple'} mb-1">早餐 B</span><span class="${bodyColor}">${esc(day.meals.breakfast)}</span></div>` : '<div></div>'}
              ${day.meals?.lunch ? `<div><span class="block font-bold ${isDark ? 'text-jollify-gold' : 'text-jollify-purple'} mb-1">午餐 L</span><span class="${bodyColor}">${esc(day.meals.lunch)}</span></div>` : '<div></div>'}
              ${day.meals?.dinner ? `<div><span class="block font-bold ${isDark ? 'text-jollify-gold' : 'text-jollify-purple'} mb-1">晚餐 D</span><span class="${bodyColor}">${esc(day.meals.dinner)}</span></div>` : '<div></div>'}
            </div>` : '';

      const stayName = day.hotel_name || day.stay;
      const stayHtml = stayName ? `
            <div class="mt-5 ${!hasMeals ? `pt-6 border-t ${isDark ? 'border-jollify-gold/20' : 'border-jollify-purple/10'}` : ''} flex items-center font-sans text-sm">
              <span class="inline-flex items-center justify-center border ${isDark ? 'border-jollify-gold text-jollify-gold' : 'border-jollify-purple text-jollify-purple'} rounded-full px-3 py-1 text-[10px] font-bold mr-4 tracking-[0.2em] uppercase">STAY</span>
              <span class="${bodyColor} font-bold text-sm md:text-base tracking-wide">${esc(stayName)}</span>
            </div>` : '';

      return `
    <section id="page-${pageNum}" class="magazine-section p-0 ${bg}" data-title="Day ${String(i + 1).padStart(2, '0')}">
      <div class="flex ${imgSide} w-full h-full min-h-screen">
        <div class="w-full lg:w-1/2 h-[45vh] lg:h-screen relative overflow-hidden animate-trigger ${imgAnim}">
          <img src="${esc(img)}" alt="Day ${i + 1}" class="w-full h-full object-cover img-elegant">
          <div class="absolute inset-0 bg-gradient-to-t from-jollify-dark/40 to-transparent"></div>
          <span class="absolute bottom-6 left-6 text-white text-xs tracking-widest font-sans ${tagBg} px-4 py-2 backdrop-blur-md">${imgLabel}</span>
        </div>
        <div class="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 animate-trigger ${txtAnim} delay-200">
          <div class="max-w-xl w-full">
            <p class="text-jollify-gold tracking-[0.3em] font-serif font-semibold text-base mb-2">DAY ${String(i + 1).padStart(2, '0')}</p>
            <h2 class="text-5xl md:text-6xl font-bold mb-8 leading-tight ${titleColor} font-serif mobile-readable-title">
              ${esc(day.title || `第 ${i + 1} 天`)}<br>
              <span class="text-3xl font-light italic ${subColor} mt-3 block font-serif">${esc(day.route || day.summary || '')}</span>
            </h2>
            <p class="${bodyColor} mb-4 leading-relaxed font-sans font-light text-lg mobile-readable-body">${desc}</p>
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
  if (hotels?.visible !== false && hotels?.items?.length) {
    hotelsHtml = hotels.items.map((hotel, i) => {
      const pageNum = i + 4 + (days?.items?.length || 0);
      const isDark = (i % 2 !== 0);
      const bg = isDark ? 'bg-jollify-dark text-white' : 'bg-jollify-cream text-jollify-dark';
      const titleColor = isDark ? 'text-white' : 'text-jollify-purple-dark';
      const accentColor = isDark ? 'text-jollify-gold' : 'text-jollify-purple';
      const bodyColor = isDark ? 'text-gray-300' : 'text-jollify-gray';
      const borderColor = isDark ? 'border-jollify-gold/20' : 'border-jollify-purple/10';
      const layout = (i % 2 === 0) ? 'flex-col md:flex-row' : 'flex-col md:flex-row-reverse';
      const imgAnim = (i % 2 === 0) ? 'slide-right' : 'slide-left';
      const txtAnim = (i % 2 === 0) ? 'slide-left' : 'slide-right';
      const img = hotel.image || 'https://images.unsplash.com/photo-1542314831-c6a420808643?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80';
      const desc = (hotel.description || '').replace(/\n/g, '<br>');
      const linkHtml = hotel.link ? `<a href="${esc(hotel.link)}" target="_blank" class="inline-flex items-center gap-3 text-xs tracking-[0.2em] ${accentColor} transition-colors font-semibold uppercase mt-8">探索飯店 →</a>` : '';
      return `
    <section id="page-${pageNum}" class="magazine-section ${bg}" data-title="${esc((hotel.name || '旅宿').substring(0, 8))}">
      <div class="max-w-7xl mx-auto w-full relative z-10 flex ${layout} items-center gap-12 lg:gap-24">
        <div class="w-full md:w-1/2 animate-trigger ${imgAnim} delay-100">
          <div class="relative group">
            <div class="absolute inset-0 translate-x-4 translate-y-4 border ${borderColor} z-0 transition-transform group-hover:translate-x-6 group-hover:translate-y-6"></div>
            <img src="${esc(img)}" class="relative z-10 w-full h-[50vh] md:h-[70vh] object-cover shadow-2xl img-elegant">
          </div>
        </div>
        <div class="w-full md:w-1/2 animate-trigger ${txtAnim} delay-300">
          <p class="${accentColor} tracking-[0.3em] uppercase text-xs mb-4 font-sans font-semibold">STAY IN STYLE</p>
          <h2 class="text-4xl md:text-5xl font-bold font-serif ${titleColor} tracking-wider mb-6 leading-tight">${esc(hotel.name || '嚴選旅宿')}</h2>
          <div class="w-16 h-[2px] ${isDark ? 'bg-jollify-gold' : 'bg-jollify-purple'} mb-8"></div>
          <div class="font-sans text-sm md:text-base leading-loose tracking-wide ${bodyColor} font-light"><p>${desc}</p></div>
          ${linkHtml}
        </div>
      </div>
    </section>`;
    }).join('');
  }

  // ── Notices HTML ───────────────────────────────────────────────
  const hasNotices = itinerary?.notices?.visible !== false && itinerary?.notices?.items?.length;
  const noticesPageNum = 4 + (days?.items?.length || 0) + (hotels?.items?.length || 0);
  let noticesHtml = '';
  if (hasNotices) {
    const noticeCards = itinerary.notices.items.map((notice, i) => `
      <div class="glass-premium border border-jollify-purple/10 p-6 md:p-8 animate-trigger ${i % 2 === 0 ? 'slide-left' : 'slide-right'} delay-${Math.min((i + 1) * 100, 700)}">
        <div class="text-jollify-gold font-serif text-3xl font-bold mb-4">${String(i + 1).padStart(2, '0')}</div>
        <h3 class="text-2xl md:text-3xl font-serif font-bold text-jollify-purple-dark mb-4 mobile-readable-title">${esc(notice.t || notice.title || '注意事項')}</h3>
        <p class="text-jollify-gray font-sans text-base md:text-lg leading-loose mobile-readable-body">${esc(notice.desc || notice.description || '').replace(/\n/g, '<br>')}</p>
      </div>
    `).join('');

    noticesHtml = `
    <section id="page-${noticesPageNum}" class="magazine-section bg-jollify-cream text-jollify-dark" data-title="報名注意">
      <div class="max-w-6xl mx-auto w-full relative z-10">
        <div class="text-center mb-14 animate-trigger">
          <p class="text-jollify-purple tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">NOTICES</p>
          <h2 class="text-4xl md:text-6xl font-bold tracking-[0.12em] font-serif text-jollify-purple-dark mobile-readable-title">報名注意事項</h2>
          <div class="w-12 h-[2px] bg-jollify-gold mx-auto mt-6"></div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">${noticeCards}</div>
      </div>
    </section>`;
  }

  // ── Recommended HTML ───────────────────────────────────────────
  let recommendedHtml = '';
  if (recommended?.visible !== false && recommended?.items?.length) {
    const rCards = recommended.items.map((c, i) => `
      <a href="${esc(c.link || '#')}" target="_blank" class="block group relative overflow-hidden h-64 md:h-80 w-full rounded-sm animate-trigger slide-up delay-${Math.min((i+1)*100, 700)}">
        <div class="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110" style="background-image:url('${esc(c.img || '')}')"></div>
        <div class="absolute inset-0 bg-gradient-to-t from-jollify-dark/90 via-jollify-dark/40 to-transparent"></div>
        <div class="absolute bottom-6 left-6 right-6">
          <h5 class="text-white font-serif font-bold text-xl md:text-2xl mb-2 line-clamp-2">${esc(c.t || c.title || '')}</h5>
          <span class="inline-block text-jollify-gold font-sans text-xs tracking-[0.2em] uppercase group-hover:text-white transition-colors duration-300">查看行程 &rarr;</span>
        </div>
      </a>
    `).join('');
    recommendedHtml = `
    <section id="page-recommended" class="magazine-section bg-jollify-dark text-white" data-title="推薦行程">
      <div class="max-w-6xl mx-auto w-full relative z-10">
        <div class="text-center mb-16 animate-trigger">
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs mb-3 font-sans font-semibold">MORE EXPLORE</p>
          <h2 class="text-4xl md:text-5xl font-bold tracking-[0.15em] font-serif text-transparent bg-clip-text bg-gradient-to-r from-white to-jollify-gold-light">
            探索更多奢華旅程
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
  const lastPageNum = 4 + (days?.items?.length || 0) + (hotels?.items?.length || 0) + (hasNotices ? 1 : 0);
  const ctaTitle = safe(cta?.cta_title, '開啟您的尊榮篇章');
  const ctaDesc = safe(cta?.cta_desc, '地面代理專屬尊榮企劃報價，由專屬顧問親自服務。');
  const lineBtn = cta?.cta_line_url ? `<a href="${esc(cta.cta_line_url)}" target="_blank" class="w-full sm:w-auto px-8 py-4 bg-[#06C755] text-white font-sans font-bold text-sm tracking-[0.2em] rounded-sm hover:bg-[#05b04b] transition-all duration-300 shadow-lg">LINE 諮詢客服</a>` : '';
  const regBtn = cta?.cta_register_url ? `<a href="${esc(cta.cta_register_url)}" target="_blank" class="w-full sm:w-auto px-8 py-4 bg-jollify-gold text-jollify-dark font-sans font-bold text-sm tracking-[0.2em] rounded-sm hover:bg-white hover:text-jollify-purple transition-all duration-300 border border-jollify-gold shadow-lg">立即報名</a>` : '';
  const ctaSection = `
    <section id="page-${lastPageNum}" class="magazine-section bg-jollify-dark text-white relative" data-title="報價與諮詢">
      <div class="max-w-4xl mx-auto w-full text-center relative z-20 px-6 py-12 border border-jollify-gold/20 rounded-sm glass-premium-dark animate-trigger scale-up delay-200">
        <p class="text-jollify-gold tracking-[0.4em] font-serif text-sm mb-4 uppercase">JOLLIFY TRAVEL EXCLUSIVE</p>
        <h2 class="text-4xl md:text-6xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-jollify-gold-light to-white mb-8">${esc(ctaTitle)}</h2>
        <div class="w-16 h-[1px] bg-jollify-gold mx-auto mb-10"></div>
        <p class="text-gray-300 font-sans text-base leading-relaxed mb-10">${esc(ctaDesc)}</p>
        <div class="flex flex-col sm:flex-row justify-center items-center gap-4">
          ${lineBtn}
          ${regBtn}
          <button onclick="window.scrollTo({ top: 0, behavior: 'smooth' })" class="w-full sm:w-auto px-8 py-4 bg-transparent text-white font-sans text-sm tracking-[0.2em] rounded-sm hover:bg-white/10 transition-all duration-300 border border-white/20">回到首頁</button>
        </div>
        <p class="text-[10px] text-gray-500 font-sans tracking-widest mt-16">© 2026 JOLLIFY TRAVEL 鑫囍探索. ALL RIGHTS RESERVED.</p>
      </div>
    </section>`;

  // ── CTA floating button ────────────────────────────────────────
  const floatBtn = (cta?.visible !== false && (cta?.cta_register_url || cta?.cta_line_url)) ? `
    <div class="fixed bottom-6 right-6 z-[9000] flex flex-col gap-3 items-end">
      ${cta.cta_line_url ? `<a href="${esc(cta.cta_line_url)}" target="_blank" class="flex items-center bg-[#06C755] hover:bg-[#05b04b] text-white rounded-full px-5 py-3 shadow-lg transition-transform hover:scale-105"><svg viewBox="0 0 24 24" class="w-5 h-5 fill-current mr-2"><path d="M24 10.304c0-5.369-5.383-9.738-12-9.738-6.616 0-12 4.369-12 9.738 0 4.814 4.269 8.846 10.038 9.608.391.084.922.258 1.057.592.121.298.039.756.016.953l-.168 1.011c-.053.307-.243 1.18.591.82 1.037-.446 5.58-3.284 7.971-5.882 1.636-1.782 2.495-3.682 2.495-7.102"/></svg><span class="font-bold">LINE 客服</span></a>` : ''}
      ${cta.cta_register_url ? `<a href="${esc(cta.cta_register_url)}" target="_blank" class="flex items-center bg-gradient-to-r from-jollify-gold to-yellow-600 text-white rounded-full px-6 py-3 shadow-xl hover:scale-105 font-serif tracking-widest text-lg font-bold border border-white/30">我要報名</a>` : ''}
    </div>` : '';

  // ── Tailwind config script ─────────────────────────────────────
  const twConfig = `<script>
    if (window.tailwind) {
      tailwind.config = {
        corePlugins: {
          preflight: false
        },
        important: '#jollify-magazine-tour',
        theme: {
          extend: {
            colors: {
              'jollify': {
                'purple': '#4C2A85', 'purple-dark': '#2D1654', 'purple-light': '#6E45B2',
                'gold': '#D4A93B', 'gold-dark': '#B58C28', 'gold-light': '#E6C56E',
                'dark': '#150F1D', 'dark-gray': '#2A2038', 'cream': '#FBF9FC', 'gray': '#6A5E78'
              }
            },
            fontFamily: {
              'serif': ['"Cormorant Garamond"', '"Noto Serif TC"', 'serif'],
              'sans': ['"Montserrat"', '"PingFang TC"', '"Microsoft JhengHei"', 'sans-serif'],
            },
            animation: { 'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite' }
          }
        }
      }
    }
  <\/script>`;

  return `
    <!-- Tailwind CSS & Fonts -->
    <script>
      const _origWarn = console.warn;
      console.warn = function(...args) {
        if (typeof args[0] === 'string' && args[0].includes('cdn.tailwindcss.com should not be used in production')) return;
        _origWarn.apply(console, args);
      };
    </script>
    <script src="https://cdn.tailwindcss.com"><\/script>
    ${twConfig}
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
        <h2 class="text-white text-xl tracking-[0.2em] font-light">${esc(safe(itinerary?.hero_data?.title1, '精彩行程'))}</h2>
        <div class="w-32 h-[1px] bg-jollify-gold/30 mx-auto overflow-hidden">
          <div class="h-full bg-jollify-gold w-0 progress-inner transition-all duration-700"></div>
        </div>
      </div>
    </div>

    <!-- 左側分頁導覽 -->
    <div class="nav-dots" id="nav-dots"></div>

    ${floatBtn}

    <!-- Page 1: 封面 -->
    <section id="page-1" class="magazine-section p-0 m-0 h-screen w-full relative bg-jollify-dark" data-title="封面導引">
      <div class="absolute inset-0 z-0">
        <img src="${esc(safe(itinerary?.hero_data?.image, 'https://images.unsplash.com/photo-1528127269322-539801943592?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80'))}" alt="Cover" class="w-full h-full object-cover img-elegant opacity-50">
      </div>
      <div class="absolute inset-0 bg-gradient-to-b from-jollify-dark/80 via-transparent to-jollify-dark/95 z-10"></div>
      <div class="absolute inset-8 border border-jollify-gold/25 pointer-events-none z-20 hidden md:block"></div>
      <div class="z-20 text-center text-white max-w-4xl mx-auto px-6 h-full flex flex-col justify-center items-center">
        <div class="animate-trigger scale-up delay-100 flex items-center gap-3 mb-6">
          <span class="w-6 h-[1px] bg-jollify-gold"></span>
          <p class="text-jollify-gold tracking-[0.3em] uppercase text-xs font-sans">Jollify Luxury Journey</p>
          <span class="w-6 h-[1px] bg-jollify-gold"></span>
        </div>
        <h1 class="text-5xl md:text-8xl font-black tracking-[0.15em] mb-8 leading-tight font-serif text-transparent bg-clip-text bg-gradient-to-r from-white via-jollify-gold-light to-white">
          ${esc(safe(itinerary?.hero_data?.title1, '未命名行程'))}<br>
          <span class="text-2xl md:text-5xl italic font-light tracking-[0.1em] text-jollify-gold-light mt-4 block font-serif">${esc(safe(itinerary?.hero_data?.title2, ''))}</span>
        </h1>
        <div class="w-20 h-[1px] bg-gradient-to-r from-transparent via-jollify-gold to-transparent my-4"></div>
        <p class="text-base md:text-xl font-light tracking-[0.25em] text-gray-200 font-sans mt-4">${esc(tags)}</p>
        <div class="absolute bottom-16 left-1/2 -translate-x-1/2 text-center z-20 cursor-pointer" onclick="document.querySelector('#jollify-magazine-tour section:nth-of-type(2)')?.scrollIntoView({ behavior: 'smooth' })">
          <span class="text-xs tracking-[0.3em] text-jollify-gold hover:text-white transition-colors duration-300 block mb-2 font-sans">SCROLL TO DISCOVER</span>
          <div class="w-5 h-8 border border-jollify-gold/40 rounded-full mx-auto p-1 flex justify-center">
            <div class="w-1 h-2 bg-jollify-gold rounded-full animate-bounce"></div>
          </div>
        </div>
      </div>
    </section>

    ${flightsHtml}
    ${featuresHtml}
    ${highlightsHtml}
    ${daysDetailHtml}
    ${hotelsHtml}
    ${noticesHtml}
    ${recommendedHtml}
    ${ctaSection}

    </div>
  `;
};
