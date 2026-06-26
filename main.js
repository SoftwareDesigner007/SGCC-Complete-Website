/**
 * main.js — SGCC Primary JavaScript Module
 * ─────────────────────────────────────────
 * This is the central JS file loaded on EVERY page (as a module via <script type="module">).
 * It is responsible for six key behaviors:
 *
 *  1. Global component injection  → Adds the toast notification container to every page.
 *  2. AOS animation init          → Initializes scroll-triggered entrance animations.
 *  3. Course filtering            → Search bar + category chip filters on courses.html.
 *  4. Enquiry redirection         → "Enquire Now" buttons anywhere → /enquiry.html?course=...
 *  5. Toast notification system   → In-app slide-in pop-up messages.
 *  6. Page transition animations  → Smooth slide-in/out between pages.
 *
 * Data Storage:
 *  • sgcc_courses   (localStorage) → Array of course objects managed by admin.html
 *  • sgcc_enquiries (localStorage) → Array of submitted enquiry objects
 */

// ── Global Components Template ──────────────────────────────────────────────
// The toast container is injected into the bottom of <body> on every page.
// Toast messages appear here (top-right corner).
const globalComponents = `
<div id="toast-container" class="fixed top-24 right-8 z-[100] flex flex-col gap-2 pointer-events-none"></div>
<div id="sgcc-info-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm hidden opacity-0 transition-opacity duration-300" onclick="if(event.target===this)closeSgccModal()">
  <div class="bg-surface-container glass-card p-6 md:p-10 rounded-2xl max-w-2xl w-full mx-4 border border-outline/30 relative max-h-[85vh] overflow-y-auto">
    <button onclick="closeSgccModal()" class="absolute top-4 right-4 text-on-surface-variant hover:text-primary transition-colors">
      <span class="material-symbols-outlined text-3xl">close</span>
    </button>
    <div class="flex items-center gap-4 mb-6 border-b border-outline/20 pb-4">
      <img src="./logo.png" alt="SGCC Logo" class="w-16 h-16 object-contain rounded-xl drop-shadow-[0_0_12px_rgba(0,255,209,0.5)]">
      <div>
        <h3 class="text-2xl font-headline font-bold text-on-surface tracking-tight" style="background: linear-gradient(90deg, #ffe04a, #ffb347); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">SGCC</h3>
        <p class="text-[10px] sm:text-xs font-label font-semibold tracking-widest text-on-surface-variant uppercase">Shree Ganesh Computer Classes</p>
      </div>
    </div>
    
    <div class="space-y-6 text-on-surface-variant text-sm font-body leading-relaxed">
      <div>
        <h4 class="text-primary font-headline font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-sm">info</span> What is SGCC?</h4>
        <p>Shree Ganesh Computer Classes (SGCC) is Mumbai's premier technical education hub, offering certified courses in programming, designing, database management, and more.</p>
      </div>
      <div>
        <h4 class="text-secondary font-headline font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-sm">lightbulb</span> Why SGCC?</h4>
        <p>Our mission is to democratize high-end computer education and bridge the gap between traditional academics and the futuristic demands of the digital economy.</p>
      </div>
      <div>
        <h4 class="text-tertiary font-headline font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-sm">workspace_premium</span> Benefits of Joining</h4>
        <ul class="list-disc pl-5 space-y-1">
          <li><strong>Expert Mentorship:</strong> Learn from industry veterans with 20+ years of experience.</li>
          <li><strong>Modern Curriculum:</strong> Updated bi-annually to stay in sync with the global tech landscape.</li>
          <li><strong>Recognized Certifications:</strong> Official center for MKCL (MS-CIT) and YCMOU.</li>
          <li><strong>Placement Ready:</strong> Soft-skills training and mock interviews for MNC recruitment.</li>
          <li><strong>Top Facilities:</strong> Air-conditioned labs with high-speed internet.</li>
        </ul>
      </div>
      <div class="bg-surface-container-high p-4 rounded-xl border border-outline/20">
        <h4 class="text-on-surface font-headline font-bold mb-2 flex items-center gap-2"><span class="material-symbols-outlined text-sm text-primary">location_on</span> Location</h4>
        <p>Church Of St. Joseph The Worker, B-9, next to Cardinal School, Subhash Nagar, Bandra East, Mumbai, Maharashtra 400051</p>
      </div>
    </div>
  </div>
</div>
`;

// Wait for the full DOM to be ready before running any logic.
document.addEventListener('DOMContentLoaded', () => {

    // ── 1. INJECT GLOBAL COMPONENTS ──────────────────────────────────────────
    // Append the toast container to the page body.
    document.body.insertAdjacentHTML('beforeend', globalComponents);

    // Make nav logos clickable to open SGCC Info modal
    const navLogos = document.querySelectorAll('nav img[src*="logo.png"]');
    navLogos.forEach(logo => {
        logo.style.cursor = 'pointer';
        logo.addEventListener('click', window.openSgccModal);
    });


    // ── 2. INITIALIZE AOS (ANIMATE ON SCROLL) ────────────────────────────────
    // AOS is a CDN library that adds entrance animations when elements scroll into view.
    // 'once: true' means each animation plays only once per page load.
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,          // Animation duration in milliseconds
            easing: 'ease-out-cubic', // Smooth deceleration easing curve
            once: true,             // Animate only on first scroll into view
            offset: 50              // Trigger animation 50px before element enters viewport
        });
    }


    // ── 3. COURSE FILTERING ──────────────────────────────────────────────────
    // Used on courses.html — allows users to search or filter courses by category.
    const searchInput = document.getElementById('course-search');
    const filterContainer = document.getElementById('course-filters');

    /**
     * buildFilterChips()
     * Reads courses from localStorage and dynamically generates category filter buttons.
     * Called after admin syncs courses (via 'courses_synced' event) or on page load.
     */
    function buildFilterChips() {
        if (!filterContainer) return;
        const stored = localStorage.getItem('sgcc_courses');
        if (!stored) return;
        const courses = JSON.parse(stored);

        // Extract unique category names from all courses
        const categories = [...new Set(courses.map(c => c.category))].filter(Boolean);

        // Remember which category button was active before rebuilding
        const currentActive = filterContainer.querySelector('.filter-btn.border-2')?.textContent.trim() || 'All Programs';

        // Rebuild HTML: "All Programs" first, then one button per unique category
        filterContainer.innerHTML = `<button class="filter-btn px-5 py-2 rounded-full border-2 border-primary bg-primary/10 text-primary font-label text-sm font-bold neon-glow-text shadow-[0_0_10px_rgba(255,45,120,0.2)]">All Programs</button>`
            + categories.map(cat =>
                `<button class="filter-btn px-5 py-2 rounded-full border border-outline-variant bg-surface-container text-on-surface-variant font-label text-sm hover:border-secondary hover:text-secondary transition-all">${cat}</button>`
            ).join('');

        attachFilterListeners();

        // Restore the previously active filter button after rebuild
        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            if (btn.textContent.trim() === currentActive) {
                filterContainer.querySelectorAll('.filter-btn').forEach(b => b.className = 'filter-btn px-5 py-2 rounded-full border border-outline-variant bg-surface-container text-on-surface-variant font-label text-sm hover:border-secondary hover:text-secondary transition-all');
                btn.className = 'filter-btn px-5 py-2 rounded-full border-2 border-primary bg-primary/10 text-primary font-label text-sm font-bold neon-glow-text shadow-[0_0_10px_rgba(255,45,120,0.2)]';
            }
        });
    }

    /**
     * filterCourses(searchTerm, category)
     * Shows or hides course cards based on the active search text and category chip.
     * If no cards match, displays a "No courses found" message.
     *
     * @param {string} searchTerm - Text typed into the search bar (already lowercased)
     * @param {string} category   - Category name from clicked chip (already lowercased)
     */
    function filterCourses(searchTerm, category) {
        // Select all course cards (works for both static and dynamically rendered grids)
        const cards = document.querySelectorAll('#dynamic-course-grid .group, section.max-w-7xl.mx-auto.px-6.grid .group');
        if (!cards.length) return;

        cards.forEach(card => {
            let match = true;

            // Check text search match against the card's heading
            if (searchTerm) {
                const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
                if (!title.includes(searchTerm)) match = false;
            }

            // Check category filter match against the card's category label
            if (category && category !== 'all programs') {
                const catSpan = card.querySelector('.tracking-tighter');
                if (catSpan) {
                    const cardCat = catSpan.textContent.trim().toLowerCase();
                    // Support partial match in either direction (e.g. "hardware" matches "hardware & networking")
                    let catMatch = cardCat === category || cardCat.includes(category) || category.includes(cardCat);
                    if (!catMatch) match = false;
                }
            }

            // Show or hide the card based on match result
            card.style.display = match ? 'flex' : 'none';
        });

        // Show "No courses found" message if all cards are hidden
        const grid = document.querySelector('#dynamic-course-grid, section.max-w-7xl.mx-auto.px-6.grid');
        if (grid) {
            let noResultsEl = grid.parentNode.querySelector('#no-results-msg');
            const visible = [...cards].some(c => c.style.display !== 'none');
            if (!visible) {
                if (!noResultsEl) {
                    noResultsEl = document.createElement('p');
                    noResultsEl.id = 'no-results-msg';
                    noResultsEl.className = 'col-span-full text-center text-on-surface-variant py-12 font-body';
                    noResultsEl.textContent = 'No courses found for this filter.';
                    grid.after(noResultsEl);
                }
            } else if (noResultsEl) {
                noResultsEl.remove(); // Remove the message once cards are visible again
            }
        }
    }

    /**
     * attachFilterListeners()
     * Adds click event listeners to all filter chip buttons.
     * When clicked: highlights the active chip and re-runs filterCourses().
     */
    function attachFilterListeners() {
        if (!filterContainer) return;
        const filterBtns = filterContainer.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Deactivate all buttons, then activate the clicked one
                filterBtns.forEach(b => b.className = 'filter-btn px-5 py-2 rounded-full border border-outline-variant bg-surface-container text-on-surface-variant font-label text-sm hover:border-secondary hover:text-secondary transition-all');
                btn.className = 'filter-btn px-5 py-2 rounded-full border-2 border-primary bg-primary/10 text-primary font-label text-sm font-bold neon-glow-text shadow-[0_0_10px_rgba(255,45,120,0.2)]';

                const category = btn.textContent.trim().toLowerCase();
                const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
                filterCourses(searchTerm, category);
            });
        });
    }

    // Wire up the live search bar to re-filter on every keystroke
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const activeBtn = filterContainer?.querySelector('.filter-btn.border-2');
            const category = activeBtn ? activeBtn.textContent.trim().toLowerCase() : 'all programs';
            filterCourses(e.target.value.toLowerCase(), category);
        });
    }

    // Use dynamic chips if admin has customized courses, otherwise use the static HTML chips
    if (filterContainer && localStorage.getItem('sgcc_courses')) {
        buildFilterChips();
    } else {
        attachFilterListeners();
    }

    // Re-build filter chips whenever the admin sync script updates courses in the DOM
    window.addEventListener('courses_synced', () => {
        buildFilterChips();
    });

    // ── 3.5 QUERY PARAMETER PARSING ──────────────────────────────────────────
    // Parse URL query parameters (e.g. ?search=python or ?filter=programming) on page load
    const urlParams = new URLSearchParams(window.location.search);
    const searchParam = urlParams.get('search');
    const filterParam = urlParams.get('filter');

    if (searchParam || filterParam) {
        // Wait a short moment to ensure the filter chips and course cards are fully rendered
        setTimeout(() => {
            let activeCategory = 'all programs';

            // 1. Process filter param
            if (filterParam && filterContainer) {
                const filterBtns = filterContainer.querySelectorAll('.filter-btn');
                let foundBtn = null;
                const fpLower = filterParam.toLowerCase();

                for (const btn of filterBtns) {
                    const btnTextLower = btn.textContent.trim().toLowerCase();
                    if (btnTextLower === fpLower || 
                        btnTextLower.includes(fpLower) || 
                        fpLower.includes(btnTextLower) ||
                        (fpLower === 'designing' && btnTextLower.includes('design')) ||
                        (fpLower === 'cybersecurity' && btnTextLower.includes('hardware')) ||
                        (fpLower === 'database' && (btnTextLower.includes('finance') || btnTextLower.includes('office') || btnTextLower.includes('fundamental') || btnTextLower.includes('data')))
                    ) {
                        foundBtn = btn;
                        break;
                    }
                }

                if (foundBtn) {
                    // Update active button state
                    filterBtns.forEach(b => {
                        b.className = 'filter-btn px-5 py-2 rounded-full border border-outline-variant bg-surface-container text-on-surface-variant font-label text-sm hover:border-secondary hover:text-secondary transition-all';
                    });
                    foundBtn.className = 'filter-btn px-5 py-2 rounded-full border-2 border-primary bg-primary/10 text-primary font-label text-sm font-bold neon-glow-text shadow-[0_0_10px_rgba(255,45,120,0.2)]';
                    activeCategory = foundBtn.textContent.trim().toLowerCase();
                }
            }

            // 2. Process search param
            if (searchParam && searchInput) {
                searchInput.value = searchParam;
            }

            // 3. Apply the filters
            const term = searchInput ? searchInput.value.toLowerCase() : '';
            filterCourses(term, activeCategory);
        }, 150);
    }


    // ── 4. ENQUIRY REDIRECTION LOGIC ─────────────────────────────────────────
    // Any "Enquire Now" button or .enquire-btn anywhere on the page navigates to
    // the enquiry page and pre-fills the course name via a URL query parameter.
    document.body.addEventListener('click', (e) => {
        let target = e.target;

        // Walk up the DOM tree to find the button/link that was clicked
        while (target && target !== document.body) {
            if (target.tagName === 'BUTTON' || target.tagName === 'A') {
                if (target.textContent.trim().toLowerCase() === 'enquire now' || target.classList.contains('enquire-btn')) {
                    if (target.tagName === 'A') e.preventDefault();

                    // Try to get the course name from the parent card's <h3> heading
                    let courseTitle = '';
                    const card = target.closest('.group');
                    if (card) {
                        const titleEl = card.querySelector('h3');
                        if (titleEl) {
                            courseTitle = titleEl.textContent.trim();
                        }
                    }

                    // Navigate to enquiry page — with or without course pre-fill
                    if (courseTitle) {
                        window.location.href = `/enquiry.html?course=${encodeURIComponent(courseTitle)}`;
                    } else {
                        window.location.href = '/enquiry.html';
                    }
                    return;
                }
            }
            target = target.parentNode;
        }
    });


    // ── 5. TOAST NOTIFICATION SYSTEM ─────────────────────────────────────────

    /**
     * showToast(message)
     * Displays a slide-in notification banner at the top-right of the screen.
     * The toast auto-dismisses after 3 seconds with a slide-out animation.
     *
     * @param {string} message - The text to display inside the toast
     */
    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'glass-card bg-surface-container-highest px-6 py-3 rounded-lg border border-secondary/50 shadow-[0_0_20px_rgba(0,255,204,0.2)] text-on-surface font-headline font-bold text-sm flex items-center gap-3 transform translate-x-full transition-transform duration-300';
        toast.innerHTML = `<span class="material-symbols-outlined text-secondary">check_circle</span> ${message}`;
        container.appendChild(toast);

        // Trigger slide-in: small delay needed so the browser registers the initial position
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 10);

        // Auto-dismiss: slide out then remove from DOM
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * playNotificationRing()
     * Plays a short ping sound when a new enquiry is received.
     * Browser autoplay policy may block this if the user hasn't interacted with the page yet.
     */
    let notificationAudio = null;
    function playNotificationRing() {
        try {
            if (!notificationAudio) {
                notificationAudio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
                notificationAudio.volume = 0.6;
            }
            notificationAudio.currentTime = 0;
            const playPromise = notificationAudio.play();
            if (playPromise !== undefined) {
                playPromise.catch(e => console.log('Audio playback prevented by browser policy'));
            }
        } catch (error) {
            console.warn('Audio system error:', error);
        }
    }

    // Play notification ring on the same tab when a new enquiry is submitted
    window.addEventListener('enquiry_added', () => {
        playNotificationRing();
    });

    // Listen for enquiry additions from OTHER open tabs (cross-tab sync via storage event)
    window.addEventListener('storage', (e) => {
        if (e.key === 'sgcc_enquiries') {
            const oldVal = e.oldValue ? JSON.parse(e.oldValue) : [];
            const newVal = e.newValue ? JSON.parse(e.newValue) : [];
            if (newVal.length > oldVal.length) {
                playNotificationRing();
                showToast('New enquiry received!');
                window.dispatchEvent(new Event('enquiry_synced'));
            }
        }
    });


    // ── FULL ENQUIRY FORM SUBMISSION (enquiry.html) ───────────────────────────
    // Collects all fields, builds an enquiry object, saves it to localStorage,
    // then shows a success toast and resets the form.
    const enquiryForm = document.getElementById('enquiry-form');
    if (enquiryForm) {
        enquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Read all form field values
            const nameInput    = enquiryForm.querySelector('input[type="text"]');
            const emailInput   = enquiryForm.querySelector('input[type="email"]');
            const phoneInput   = enquiryForm.querySelector('input[type="tel"]');
            const select       = enquiryForm.querySelector('select');
            const messageInput = enquiryForm.querySelector('textarea');

            const name    = nameInput?.value    || 'Unknown';
            const email   = emailInput?.value   || 'Unknown';
            const phone   = phoneInput?.value   || '';
            const course  = select?.options[select.selectedIndex]?.text || select?.value || 'Unknown';
            const message = messageInput?.value || '';
            const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            // Send enquiry to the backend API
            try {
                const response = await fetch('http://localhost:5000/api/enquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentName: name,
                        email: email,
                        phone: phone,
                        course: course,
                        message: message,
                        timestamp: timestamp
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to submit enquiry');
                }
            } catch (error) {
                console.error("Error submitting enquiry:", error);
                showToast('Failed to submit enquiry. Ensure the backend server is running.', 'error');
                return;
            }

            // Close any open modal (if enquiry form is in a modal overlay)
            if (typeof closeModal === 'function') closeModal();

            showToast('Enquiry submitted successfully! We will contact you soon.');
            enquiryForm.reset();

            // Notify other parts of the app that an enquiry was just added
            window.dispatchEvent(new Event('enquiry_added'));
        });
    }

    // ── NEWSLETTER FORM SUBMISSION (index.html footer) ───────────────────────
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showToast('Subscribed to newsletter!');
            newsletterForm.reset();
        });
    }

    // ── QUICK ENQUIRY FORM SUBMISSION (contact.html sidebar) ─────────────────
    // Simpler version of the full form — no phone field.
    const quickEnquiryForm = document.getElementById('quick-enquiry-form');
    if (quickEnquiryForm) {
        quickEnquiryForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameInput    = quickEnquiryForm.querySelector('input[type="text"]');
            const emailInput   = quickEnquiryForm.querySelector('input[type="email"]');
            const select       = quickEnquiryForm.querySelector('select');
            const messageInput = quickEnquiryForm.querySelector('textarea');

            const name    = nameInput?.value    || 'Unknown';
            const email   = emailInput?.value   || 'Unknown';
            const course  = select?.options[select.selectedIndex]?.text || select?.value || 'Unknown';
            const phone   = ''; // Phone field not present in the quick form
            const message = messageInput?.value || '';
            const timestamp = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

            try {
                const response = await fetch('http://localhost:5000/api/enquiries', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        studentName: name,
                        email: email,
                        phone: phone,
                        course: course,
                        message: message,
                        timestamp: timestamp
                    })
                });
                
                if (!response.ok) {
                    throw new Error('Failed to submit quick enquiry');
                }
            } catch (error) {
                console.error("Error submitting quick enquiry:", error);
                showToast('Failed to submit enquiry. Ensure the backend server is running.', 'error');
                return;
            }

            showToast('Quick enquiry submitted successfully! We will contact you soon.');
            quickEnquiryForm.reset();

            window.dispatchEvent(new Event('enquiry_added'));
        });
    }


    // ── 7. PAGE TRANSITION ANIMATIONS ────────────────────────────────────────
    // Creates smooth directional slide animations when navigating between pages.
    // Direction is determined by the page's position in the site navigation order.

    // Map of all pages in navigation order
    const currentPath = window.location.pathname === '/' ? '/index.html' : window.location.pathname;
    const pageOrder = ['/index.html', '/courses.html', '/study-material.html', '/about.html', '/contact.html', '/admin.html'];
    const currentIndex = pageOrder.indexOf(currentPath);

    // Prepare the body for animated transitions
    document.body.style.transition = 'opacity 0.4s ease-out, transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';

    // Read the direction set by the previous page before navigating here
    const direction = sessionStorage.getItem('nav_direction') || 'forward';

    // Page entrance animation — slide in from the correct direction
    if (direction === 'forward') {
        document.body.style.opacity = '0';
        document.body.style.transform = 'translateX(40px)';   // Enter from the right
    } else {
        document.body.style.opacity = '0';
        document.body.style.transform = 'translateX(-40px)';  // Enter from the left
    }

    // Animate to resting position after a short delay (allows browser to register the start state)
    setTimeout(() => {
        document.body.style.opacity = '1';
        document.body.style.transform = 'translateX(0)';
        setTimeout(() => {
            document.body.style.transform = 'none'; // Remove inline transform after animation
        }, 400);
    }, 50);

    // Intercept clicks on internal page links to apply exit animation before navigating
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;

        const href = link.getAttribute('href');

        // Only intercept same-site absolute links (not anchors, not external links)
        if (href && href.startsWith('/') && !href.startsWith('#') && link.target !== '_blank') {
            e.preventDefault();

            const targetIndex = pageOrder.indexOf(href);
            let exitDirection = 'forward';

            // Navigate "backward" if the target page is earlier in the nav order
            if (currentIndex !== -1 && targetIndex !== -1 && targetIndex < currentIndex) {
                exitDirection = 'backward';
            }

            // Store the direction so the next page knows which side to enter from
            sessionStorage.setItem('nav_direction', exitDirection);

            // Apply exit animation
            if (exitDirection === 'forward') {
                document.body.style.transform = 'translateX(-40px)'; // Exit to the left
            } else {
                document.body.style.transform = 'translateX(40px)';  // Exit to the right
            }
            document.body.style.opacity = '0';

            // Navigate after the exit animation completes (350ms)
            setTimeout(() => {
                window.location.href = href;
            }, 350);
        }
    });
});

window.openFaqModal = function(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('faq-modal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
  }
}
window.closeFaqModal = function() {
  const modal = document.getElementById('faq-modal');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }
}

window.openSgccModal = function(e) {
  if (e) e.preventDefault();
  const modal = document.getElementById('sgcc-info-modal');
  if (modal) {
    modal.classList.remove('hidden');
    setTimeout(() => modal.classList.remove('opacity-0'), 10);
    document.body.style.overflow = 'hidden';
  }
}
window.closeSgccModal = function() {
  const modal = document.getElementById('sgcc-info-modal');
  if (modal) {
    modal.classList.add('opacity-0');
    setTimeout(() => {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }, 300);
  }
}
