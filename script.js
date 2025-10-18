
        document.addEventListener('DOMContentLoaded', () => {
            // --- Generic Modal Controller ---
            const setupModal = (modalId, openBtnId, closeBtnId, onOpen = () => {}, onClose = () => {}) => {
                const modal = document.getElementById(modalId);
                if (!modal) return { open: () => {}, close: () => {} }; // Return dummy functions if modal not found
                const modalContent = modal.querySelector('div');
                const openBtn = document.getElementById(openBtnId);
                const closeBtn = document.getElementById(closeBtnId);

                const open = () => {
                    modal.classList.remove('hidden');
                    modal.classList.add('flex');
                    setTimeout(() => {
                        if(modalContent) modalContent.classList.remove('scale-95', 'opacity-0');
                    }, 50);
                    onOpen();
                };

                const close = () => {
                    if(modalContent) modalContent.classList.add('scale-95', 'opacity-0');
                    setTimeout(() => {
                        modal.classList.add('hidden');
                        modal.classList.remove('flex');
                        onClose();
                    }, 200);
                };

                if (openBtn) openBtn.addEventListener('click', open);
                if (closeBtn) closeBtn.addEventListener('click', close);
                modal.addEventListener('click', (e) => {
                    if (e.target === modal) close();
                });

                return { open, close };
            };

            // Initialize all modals
            const contactModal = setupModal('contact-modal', 'open-contact-modal', 'close-contact-modal');
            const verifiedModal = setupModal('verified-modal', 'open-verified-modal', 'close-verified-modal');
            const businessModal = setupModal('business-modal', 'open-business-modal', 'close-business-modal');
            const thankYouModal = setupModal('thank-you-modal', null, 'close-thank-you-modal');
            const reviewModal = setupModal('review-modal', 'open-review-modal', 'close-review-modal');
            const amenitiesModal = setupModal('amenities-modal', 'open-amenities-modal', 'close-amenities-modal');
            const allReviewsModal = setupModal('reviews-modal', 'open-reviews-modal', 'close-reviews-modal');
            const locationModal = setupModal('location-modal', 'open-location-modal', 'close-location-modal');
            // Note: find-us-modal remains available, but we no longer bind the See More button to open the modal.
            const findUsModal = setupModal('find-us-modal', null, 'close-find-us-modal');

            // --- Verified modal actions: Download and Back ---
            const downloadVerifiedBtn = document.getElementById('download-verified');
            const backVerifiedBtn = document.getElementById('back-verified');
            const verifiedModalEl = document.getElementById('verified-modal');
            if (downloadVerifiedBtn) {
                downloadVerifiedBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Find the image inside the verified modal
                    const img = verifiedModalEl ? verifiedModalEl.querySelector('img') : null;
                    if (img && img.src) {
                        // Create a temporary anchor to trigger download
                        const a = document.createElement('a');
                        a.href = img.src;
                        // Use a filename based on the image name
                        a.download = img.src.split('/').pop() || 'verified-image.jpg';
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                    } else {
                        // Fallback: open image in new tab
                        if (img && img.src) window.open(img.src, '_blank');
                    }
                });
            }

            if (backVerifiedBtn) {
                backVerifiedBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Close the verified modal using the modal helper
                    if (verifiedModal && typeof verifiedModal.close === 'function') verifiedModal.close();
                });
            }

            // Make the entire 'VERIFIED BUSINESS' area clickable (not just the word)
            try {
                const nodes = Array.from(document.querySelectorAll('body *'));
                const verifiedNodes = nodes.filter(n => {
                    // Only consider leaf nodes (no element children) with text content
                    if (n.children && n.children.length) return false;
                    const txt = (n.textContent || '').trim();
                    return /verified business/i.test(txt);
                });

                verifiedNodes.forEach(n => {
                    // Prefer a nearby container to attach the handler
                    const clickable = n.closest('button, a, .card, .inline-flex, .flex, .group') || n.parentElement;
                    if (!clickable) return;
                    // Avoid rebinding the original open button
                    if (clickable.id === 'open-verified-modal' || clickable.dataset.verifiedBound) return;
                    clickable.dataset.verifiedBound = '1';
                    clickable.style.cursor = 'pointer';
                    if (!clickable.hasAttribute('role')) clickable.setAttribute('role', 'button');
                    if (!clickable.hasAttribute('tabindex')) clickable.setAttribute('tabindex', '0');
                    clickable.addEventListener('click', (e) => {
                        // Allow existing button behavior to run if it's the original
                        e.preventDefault();
                        if (verifiedModal && typeof verifiedModal.open === 'function') verifiedModal.open();
                    });
                    clickable.addEventListener('keydown', (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            if (verifiedModal && typeof verifiedModal.open === 'function') verifiedModal.open();
                        }
                    });
                });
            } catch (err) {
                // swallow any unexpected errors — non-critical enhancement
                console.warn('Verified binding error', err);
            }

            // --- Form Submission Logic ---
            const businessForm = document.getElementById('business-form');
            if(businessForm) {
                businessForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    businessModal.close();
                    setTimeout(() => thankYouModal.open(), 250);
                    businessForm.reset();
                });
            }
            
            const reviewForm = document.getElementById('review-form');
            if(reviewForm) {
                reviewForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    reviewModal.close();
                    setTimeout(() => thankYouModal.open(), 250);
                    reviewForm.reset();
                    // Reset stars
                    document.querySelectorAll('#star-rating-input svg').forEach(s => s.classList.remove('selected'));
                });
            }

            const contactForm = document.getElementById('contact-form');
            if(contactForm) {
                contactForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    contactModal.close();
                    setTimeout(() => thankYouModal.open(), 250);
                    contactForm.reset();
                });
            }

            // --- Star Rating Logic ---
            const starRatingContainer = document.getElementById('star-rating-input');
            if(starRatingContainer){
                const stars = starRatingContainer.querySelectorAll('svg');
                const ratingValueInput = document.getElementById('rating-value');
                let currentRating = 0;

                stars.forEach(star => {
                    star.addEventListener('mouseover', () => {
                        const hoverValue = parseInt(star.dataset.value);
                        stars.forEach(s => {
                            s.style.color = parseInt(s.dataset.value) <= hoverValue ? '#f59e0b' : '#d1d5db';
                        });
                    });

                    star.addEventListener('mouseout', () => {
                        stars.forEach(s => {
                            s.style.color = parseInt(s.dataset.value) <= currentRating ? '#f59e0b' : '#d1d5db';
                        });
                    });

                    star.addEventListener('click', () => {
                        currentRating = parseInt(star.dataset.value);
                        ratingValueInput.value = currentRating;
                        stars.forEach(s => {
                             s.classList.toggle('selected', parseInt(s.dataset.value) <= currentRating);
                        });
                    });
                });
            }

            // --- Gallery Modal Logic ---
            const galleryModalEl = document.getElementById('gallery-modal');
            const galleryImage = document.getElementById('gallery-image');
            const closeGalleryBtn = document.getElementById('close-gallery-modal');
            const prevBtn = document.getElementById('gallery-prev');
            const nextBtn = document.getElementById('gallery-next');
            // Photos section inline arrows
            const photosPrev = document.getElementById('photos-prev');
            const photosNext = document.getElementById('photos-next');
            
            const galleryItems = document.querySelectorAll('.gallery-item');
            const images = Array.from(galleryItems).map(item => item.querySelector('img').src);
            let currentIndex = 0;

            const showImage = (index) => {
                if(galleryImage) {
                    galleryImage.classList.add('scale-95', 'opacity-0');
                    setTimeout(() => {
                        galleryImage.src = images[index];
                        galleryImage.classList.remove('scale-95', 'opacity-0');
                    }, 150);
                }
                currentIndex = index;
            };

            const openGallery = (index) => {
                if(!galleryModalEl) return;
                currentIndex = index;
                if(galleryImage) {
                    galleryImage.src = images[index];
                }
                galleryModalEl.classList.remove('hidden');
                galleryModalEl.classList.add('flex');
                setTimeout(() => {
                    if(galleryImage) galleryImage.classList.remove('scale-95', 'opacity-0');
                }, 50);
            };

            const closeGallery = () => {
                 if(!galleryModalEl) return;
                 if(galleryImage) galleryImage.classList.add('scale-95', 'opacity-0');
                setTimeout(() => {
                    galleryModalEl.classList.add('hidden');
                    galleryModalEl.classList.remove('flex');
                }, 300);
            };

            galleryItems.forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const index = parseInt(item.dataset.index, 10);
                    openGallery(index);
                });
            });

            const openGalleryAllBtn = document.getElementById('open-gallery-all');
            if (openGalleryAllBtn) {
                openGalleryAllBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    openGallery(0);
                });
            }

            if(prevBtn) prevBtn.addEventListener('click', () => {
                const newIndex = (currentIndex - 1 + images.length) % images.length;
                showImage(newIndex);
            });

            if(nextBtn) nextBtn.addEventListener('click', () => {
                const newIndex = (currentIndex + 1) % images.length;
                showImage(newIndex);
            });

            // Wire Photos arrows to open (if needed) and navigate
            const openOrNavigate = (dir) => {
                if (!images.length) return;
                // If modal is closed, open with currentIndex, default 0
                const isClosed = galleryModalEl && galleryModalEl.classList.contains('hidden');
                if (isClosed) {
                    const startIndex = typeof currentIndex === 'number' ? currentIndex : 0;
                    openGallery(startIndex);
                }
                const newIndex = (currentIndex + (dir === 'prev' ? -1 : 1) + images.length) % images.length;
                showImage(newIndex);
            };
            if (photosPrev) photosPrev.addEventListener('click', (e) => { e.preventDefault(); openOrNavigate('prev'); });
            if (photosNext) photosNext.addEventListener('click', (e) => { e.preventDefault(); openOrNavigate('next'); });

            if(closeGalleryBtn) closeGalleryBtn.addEventListener('click', closeGallery);
            if(galleryModalEl) galleryModalEl.addEventListener('click', (e) => {
                if (e.target === galleryModalEl) {
                    closeGallery();
                }
            });

            // Keyboard navigation
            document.addEventListener('keydown', (e) => {
                if (galleryModalEl && !galleryModalEl.classList.contains('hidden')) {
                    if (e.key === 'ArrowLeft') {
                        if(prevBtn) prevBtn.click();
                    } else if (e.key === 'ArrowRight') {
                        if(nextBtn) nextBtn.click();
                    } else if (e.key === 'Escape') {
                        closeGallery();
                    }
                }
            });

            // --- Reviews Rendering & Toggle ---
            const reviews = [
                { name: 'Khushi Yadav', date: 'July 5, 2025', rating: 5, text: 'Excellent service and professional staff. They resolved my issue within minutes. Highly recommended!' },
                { name: 'Ramanand Rajak', date: 'June 21, 2025', rating: 5, text: 'Great experience — the team was knowledgeable and responsive.' },
                { name: 'Anita Patel', date: 'May 10, 2025', rating: 5, text: 'Fast turnaround and helpful support. Would use again.' },
                { name: 'Saurabh Verma', date: 'April 2, 2025', rating: 4, text: 'Very good overall. A couple of small hiccups but resolved quickly.' },
                { name: 'Meena Kumari', date: 'March 18, 2025', rating: 5, text: 'Professional and friendly staff. Highly recommend their services.' },
                { name: 'Amit Joshi', date: 'Feb 9, 2024', rating: 5, text: 'Quality work and fast support. Exceeded expectations.' },
                { name: 'Priya Nair', date: 'Jan 25, 2024', rating: 4, text: 'Good value for money and dependable service.' },
                { name: 'Vikram Singh', date: 'Dec 12, 2023', rating: 5, text: 'Exceptional help and quick resolution. Great team!' },
                { name: 'Sunita Rao', date: 'Nov 30, 2022', rating: 5, text: 'The staff was patient and explained everything clearly.' },
                { name: 'Karan Malhotra', date: 'Oct 14, 2022', rating: 4, text: 'Solid experience, minor delays but overall satisfactory.' }
            ];

            const reviewsListEl = document.getElementById('reviews-list');
            const toggleReviewsBtn = document.getElementById('toggle-reviews');
            const REVIEWS_INIT = 3;

            const renderStars = (n) => {
                let out = '';
                for (let i = 1; i <= 5; i++) {
                    out += `<svg class="w-5 h-5 inline-block ${i <= n ? 'text-amber-500' : 'text-gray-300'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`;
                }
                return out;
            };

            const renderReviews = (count = REVIEWS_INIT) => {
                if (!reviewsListEl) return;
                reviewsListEl.innerHTML = '';
                const toShow = reviews.slice(0, count);
                toShow.forEach(r => {
                    const wrapper = document.createElement('div');
                    wrapper.className = 'pt-6';
                    wrapper.innerHTML = `
                        <div class="flex items-center justify-between">
                            <div>
                                <h4 class="font-semibold text-gray-800">${r.name}</h4>
                                <p class="text-sm text-gray-500">${r.date}</p>
                            </div>
                            <div class="flex text-amber-500">${renderStars(r.rating)}</div>
                        </div>
                        <p class="text-gray-600 mt-2">${r.text}</p>
                    `;
                    reviewsListEl.appendChild(wrapper);
                });
            };

            // Initial render
            renderReviews(REVIEWS_INIT);

            // Toggle behaviour
            if (toggleReviewsBtn) {
                toggleReviewsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const expanded = toggleReviewsBtn.getAttribute('aria-expanded') === 'true';
                    if (!expanded) {
                        renderReviews(reviews.length);
                        toggleReviewsBtn.setAttribute('aria-expanded', 'true');
                        toggleReviewsBtn.textContent = 'Show fewer reviews ←';
                    } else {
                        renderReviews(REVIEWS_INIT);
                        toggleReviewsBtn.setAttribute('aria-expanded', 'false');
                        toggleReviewsBtn.textContent = 'Show more reviews →';
                        toggleReviewsBtn.focus();
                    }
                });
            }

            // Toggle expand/collapse for the 'You can also find us on' extra links
            const toggleFindUsBtn = document.getElementById('toggle-find-us');
            const findUsExtra = document.getElementById('find-us-extra');
            const findUsToggleContainer = toggleFindUsBtn ? toggleFindUsBtn.parentElement : null;
            if (toggleFindUsBtn && findUsExtra) {
                toggleFindUsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const expanded = toggleFindUsBtn.getAttribute('aria-expanded') === 'true';
                    if (!expanded) {
                        findUsExtra.classList.remove('hidden');
                        toggleFindUsBtn.setAttribute('aria-expanded', 'true');
                        toggleFindUsBtn.textContent = 'Show fewer ←';
                        // Move the button container below the expanded links
                        if (findUsToggleContainer) {
                            findUsExtra.appendChild(findUsToggleContainer);
                        }
                    } else {
                        findUsExtra.classList.add('hidden');
                        toggleFindUsBtn.setAttribute('aria-expanded', 'false');
                        toggleFindUsBtn.textContent = 'See More →';
                        // Return the button container to its original position above the hidden links
                        if (findUsToggleContainer && findUsExtra.parentElement) {
                            findUsExtra.parentElement.insertBefore(findUsToggleContainer, findUsExtra);
                        }
                        toggleFindUsBtn.focus();
                    }
                });
            }

            // About section Read more toggle (bind to inline link)
            const toggleAboutLink = document.getElementById('toggle-about-inline');
            const aboutExtra = document.getElementById('about-extra');
            if (toggleAboutLink && aboutExtra) {
                toggleAboutLink.addEventListener('click', (e) => {
                    e.preventDefault();
                    const expanded = toggleAboutLink.getAttribute('aria-expanded') === 'true';
                    if (!expanded) {
                        aboutExtra.classList.add('open');
                        aboutExtra.setAttribute('aria-hidden', 'false');
                        toggleAboutLink.setAttribute('aria-expanded', 'true');
                        toggleAboutLink.textContent = 'Read Less';
                    } else {
                        aboutExtra.classList.remove('open');
                        aboutExtra.setAttribute('aria-hidden', 'true');
                        toggleAboutLink.setAttribute('aria-expanded', 'false');
                        toggleAboutLink.textContent = 'Read More…';
                        toggleAboutLink.focus();
                    }
                });
            }

            // Position 'Start here' label to occupy same width as the Get a Contact button
            (function positionStartLabel(){
                const annotation = document.querySelector('.sketch-annotation.sketch-annotation-start');
                const target = document.getElementById('open-contact-modal');
                if (!annotation || !target) return;

                // Ensure annotation text is centered
                annotation.style.textAlign = 'center';
                annotation.style.pointerEvents = 'none';

                function update() {
                    const tRect = target.getBoundingClientRect();
                    const mainRect = document.querySelector('main')?.getBoundingClientRect() || { left: 0, top: 0 };

                    // Try to measure the button's text content precisely using a Range.
                    let textLeft = null, textWidth = null;
                    try {
                        const range = document.createRange();
                        // Select only the button's textual content
                        range.selectNodeContents(target);
                        const rRect = range.getBoundingClientRect();
                        if (rRect && rRect.width > 0) {
                            textLeft = rRect.left;
                            textWidth = rRect.width;
                        }
                        range.detach && range.detach();
                    } catch (err) {
                        // ignore, fallback below
                    }

                    // Fallback to the full button width if text measurement fails
                    const usedWidth = textWidth ? Math.round(textWidth) : Math.round(tRect.width * 0.6); // use 60% of button width roughly matching text
                    const left = Math.round((textLeft !== null ? textLeft : tRect.left) - mainRect.left + ((textLeft !== null) ? 0 : Math.round((tRect.width - usedWidth)/2)));
                    const top = Math.round(tRect.top - mainRect.top + tRect.height + 8); // 8px gap

                    annotation.style.width = `${usedWidth}px`;
                    annotation.style.left = `${Math.max(2, left)}px`;
                    annotation.style.top = `${Math.max(2, top)}px`;
                    annotation.classList.remove('hidden');
                }

                update();
                let raf = null;
                const schedule = () => { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(update); };
                window.addEventListener('resize', schedule);
                window.addEventListener('scroll', schedule, { passive: true });
            })();
        });

    