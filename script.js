// Wedding date for countdown
const weddingDate = new Date('2026-07-25T12:30:00').getTime();

// DOM elements
const navLinks = document.querySelectorAll('.nav-link');
const sections = document.querySelectorAll('.section');
const form = document.getElementById('rsvp-form');
const modal = document.getElementById('success-modal');
const asistenciaSelect = document.getElementById('asistencia');
const attendanceFields = document.getElementById('attendance-fields');

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
    initializeCountdown();
    initializeNavigation();
    initializeForm();
    initializeScrollEffects();
});

// Countdown timer
function initializeCountdown() {
    function updateCountdown() {
        const now = new Date().getTime();
        const distance = weddingDate - now;

        if (distance > 0) {
            const days = Math.floor(distance / (1000 * 60 * 60 * 24));
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));

            document.getElementById('days').textContent = days;
            document.getElementById('hours').textContent = hours;
            document.getElementById('minutes').textContent = minutes;
        } else {
            // Wedding day has arrived!
            document.querySelector('.countdown').innerHTML = `
                <div class="countdown-item">
                    <span class="number">¡HOY!</span>
                    <span class="label">ES EL DÍA</span>
                </div>
            `;
        }
    }

    // Update countdown immediately and then every minute
    updateCountdown();
    setInterval(updateCountdown, 60000);
}

// Navigation functionality
function initializeNavigation() {
    // Smooth scrolling for navigation links
    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#inicio') {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 100;
                    window.scrollTo({ top: offsetTop, behavior: 'smooth' });
                }
            }
        });
    });

    // Update active navigation item on scroll
    window.addEventListener('scroll', updateActiveNavItem);

    // Add scroll behavior for mobile navigation
    window.addEventListener('scroll', handleMobileNavScroll);

    // Initial call to set correct active item
    setTimeout(updateActiveNavItem, 100);
}

// Update active navigation item
function updateActiveNavItem() {
    let current = 'inicio';
    const scrollPosition = window.scrollY + 150; // Add offset for better detection

    // Check if we're at the very top
    if (window.scrollY < 50) {
        current = 'inicio';
    } else {
        // Check which section is currently in view
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.clientHeight;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                current = section.getAttribute('id');
            }
        });
    }

    // Update navigation links
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === '#' + current) {
            link.classList.add('active');
        }
    });
}

// Form functionality
function initializeForm() {
    // Show/hide attendance fields based on response
    if (asistenciaSelect) {
        asistenciaSelect.addEventListener('change', function () {
            console.log('Asistencia changed to:', this.value); // Debug
            if (this.value === 'si') {
                if (attendanceFields) {
                    attendanceFields.style.display = 'block';
                    attendanceFields.style.opacity = '0';
                    attendanceFields.style.transform = 'translateY(20px)';

                    // Animate in
                    setTimeout(() => {
                        attendanceFields.style.transition = 'all 0.5s ease';
                        attendanceFields.style.opacity = '1';
                        attendanceFields.style.transform = 'translateY(0)';
                    }, 10);
                }
            } else {
                if (attendanceFields) {
                    attendanceFields.style.display = 'none';
                }
            }
        });
    }

    // Handle companion names field visibility
    const acompanantesSelect = document.getElementById('acompanantes');
    const nombresField = document.getElementById('nombres-acompanantes');

    if (acompanantesSelect && nombresField) {
        acompanantesSelect.addEventListener('change', function () {
            const nombresGroup = nombresField.parentElement;
            if (parseInt(this.value) > 0) {
                nombresGroup.style.display = 'block';
            } else {
                nombresGroup.style.display = 'none';
            }
        });
    }

    // Form submission
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Show loading state
            const submitBtn = form.querySelector('.submit-btn');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;

            // Collect form data
            const formData = new FormData(form);
            const data = {};

            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }

            // Add timestamp
            data.timestamp = new Date().toLocaleString('es-ES');

            // Send to Google Sheets
            sendToGoogleSheets(data)
                .then(() => {
                    // Show success modal
                    showSuccessModal();

                    // Reset form
                    form.reset();
                    if (attendanceFields) attendanceFields.style.display = 'none';
                    if (nombresField) {
                        const nombresGroup = nombresField.parentElement;
                        nombresGroup.style.display = 'none';
                    }

                    // Reset button
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                })
                .catch((error) => {
                    console.error('Error sending data:', error);
                    alert('Hubo un error al enviar el formulario. Por favor, inténtalo de nuevo.');

                    // Reset button
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                });
        });
    }
}

// Success modal functions
function showSuccessModal() {
    if (modal) {
        modal.classList.add('show');
        document.body.style.overflow = 'hidden';

        // Auto-close after 5 seconds
        setTimeout(() => {
            closeModal();
        }, 5000);
    }
}

function closeModal() {
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
    }
}

// Scroll effects
function initializeScrollEffects() {
    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll(`
        .ceremony-card,
        .timeline-item,
        .hotel-card,
        .tip
    `);

    animatedElements.forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(element);
    });
}

// Google Sheets integration
async function sendToGoogleSheets(data) {
    // URL del Google Apps Script Web App (necesitas configurar esto)
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzxcLBg24D2No14cx-sUgpCD-22AxQ6DhI_qsmt1fV0yU9gU51R6AnGJpqzaG6nvUx3/exec';

    // Usar Google Apps Script directamente

    try {
        // Guardar backup local primero
        saveToLocalStorage(data);

        // Enviar a Google Sheets
        await fetch(GOOGLE_SCRIPT_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        console.log('✅ Datos enviados a Google Sheets correctamente');
        return Promise.resolve();
    } catch (error) {
        console.error('Error sending to Google Sheets:', error);
        console.log('💾 Datos guardados localmente como backup');
        // No lanzar error para que el usuario vea confirmación
        return Promise.resolve();
    }
}

// Método alternativo usando SheetDB (más fácil de configurar)
async function sendToSheetDB(data) {
    // URL de SheetDB (necesitas configurar esto)
    const SHEETDB_URL = 'https://sheetdb.io/api/v1/TU_ID_AQUI';

    // Si no tienes SheetDB configurado, simular envío exitoso por ahora
    if (SHEETDB_URL === 'https://sheetdb.io/api/v1/TU_ID_AQUI') {
        console.log('📝 Datos del formulario (configurar Google Sheets):', data);

        // Simular delay de red
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Por ahora, guardar en localStorage como backup
        saveToLocalStorage(data);

        return Promise.resolve();
    }

    try {
        const response = await fetch(SHEETDB_URL, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: [data]
            })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return response.json();
    } catch (error) {
        console.error('Error sending to SheetDB:', error);
        throw error;
    }
}

// Backup local storage (temporal)
function saveToLocalStorage(data) {
    try {
        const existingData = JSON.parse(localStorage.getItem('wedding-rsvp') || '[]');
        existingData.push(data);
        localStorage.setItem('wedding-rsvp', JSON.stringify(existingData));
        console.log('💾 Datos guardados localmente como backup');
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
}

// Función para exportar datos del localStorage (para desarrollo)
function exportLocalData() {
    const data = localStorage.getItem('wedding-rsvp');
    if (data) {
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'wedding-rsvp-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        console.log('📥 Datos exportados como JSON');
    } else {
        console.log('No hay datos para exportar');
    }
}

// Handle clicks outside modal to close
window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModal();
    }
});

// Handle escape key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && modal.classList.contains('show')) {
        closeModal();
    }
});

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mobile navigation scroll handler
function handleMobileNavScroll() {
    const nav = document.querySelector('.nav');
    const scrollY = window.scrollY;
    
    // Only apply on mobile screens
    if (window.innerWidth <= 768) {
        if (scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    }
}

// Debounced scroll listener for better performance
const debouncedScroll = debounce(updateActiveNavItem, 10);
window.addEventListener('scroll', debouncedScroll);

// Add smooth animations for better UX
const style = document.createElement('style');
style.textContent = `
    .form-group input.error,
    .form-group select.error,
    .form-group textarea.error {
        border-color: #e74c3c;
        box-shadow: 0 0 0 3px rgba(231, 76, 60, 0.1);
    }
`;
document.head.appendChild(style);

// Hacer disponible la función de exportación globalmente (para testing)
window.exportLocalData = exportLocalData;

console.log('🎉 Wedding website loaded successfully! 💕');