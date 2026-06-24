/* ==========================================
   FISIOFERSPA BOLIVIA — INTERACTIVIDAD JS
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initMobileMenu();
  initScrollAnimations();
  initStatsCounter();
  initBookingFlow();
  initYearFooter();
});

// --- Manejo de la Navbar ---
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }, { passive: true });
}

// --- Menú Móvil ---
function initMobileMenu() {
  const mobileToggle = document.getElementById('mobileToggle');
  const mobileNav = document.getElementById('mobileNav');
  const mobileNavClose = document.getElementById('mobileNavClose');

  if (!mobileToggle || !mobileNav) return;

  mobileToggle.addEventListener('click', () => {
    mobileNav.classList.add('active');
    document.body.style.overflow = 'hidden';
  });

  const closeMenu = () => {
    mobileNav.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (mobileNavClose) mobileNavClose.addEventListener('click', closeMenu);

  document.querySelectorAll('#mobileNav a').forEach(link => {
    link.addEventListener('click', closeMenu);
  });
}

// --- Animaciones suaves de Entrada ---
function initScrollAnimations() {
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.fade-in').forEach(el => {
    observer.observe(el);
  });
}

// --- Contadores Numéricos Animados ---
function initStatsCounter() {
  const statsSection = document.getElementById('stats');
  if (!statsSection) return;

  let animated = false;

  const countUp = (element, targetValue) => {
    let start = 0;
    const duration = 2000; // 2 segundos
    const stepTime = Math.abs(Math.floor(duration / targetValue));
    
    // Evitar llamadas de 0 ms
    const minStepTime = Math.max(stepTime, 20);
    const stepIncrement = Math.ceil(targetValue / (duration / minStepTime));
    
    const timer = setInterval(() => {
      start += stepIncrement;
      if (start >= targetValue) {
        element.textContent = targetValue + (element.getAttribute('data-suffix') || '');
        clearInterval(timer);
      } else {
        element.textContent = start + (element.getAttribute('data-suffix') || '');
      }
    }, minStepTime);
  };

  const observer = new IntersectionObserver((entries) => {
    const [entry] = entries;
    if (entry.isIntersecting && !animated) {
      document.querySelectorAll('.stat-number').forEach(num => {
        const val = parseInt(num.getAttribute('data-target'), 10);
        countUp(num, val);
      });
      animated = true;
      observer.unobserve(statsSection);
    }
  }, { threshold: 0.2 });

  observer.observe(statsSection);
}

// --- Año en Footer ---
function initYearFooter() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

// --- Flujo de Reservas / Booking Modal ---
function initBookingFlow() {
  const openButtons = document.querySelectorAll('.trigger-booking');
  const modal = document.getElementById('bookingModal');
  const closeButton = document.getElementById('bookingModalClose');
  const form = document.getElementById('formBooking');
  
  if (!modal) return;

  // Variables para controlar carga
  let serviciosCargados = false;
  let profesionalesCargados = false;

  const openModal = async (e) => {
    if (e) e.preventDefault();
    
    // Obtener y popular servicios en el select
    const selectServicio = document.getElementById('bookingServicio');
    const selectProfesional = document.getElementById('bookingProfesional');
    
    // Cargar servicios solo si no están cargados
    if (selectServicio && !serviciosCargados) {
      try {
        const servicios = await fetchServicios();
        // Limpiar opciones existentes (mantener la primera opción por defecto)
        while (selectServicio.options.length > 1) {
          selectServicio.remove(1);
        }
        servicios.forEach(s => {
          const opt = document.createElement('option');
          opt.value = s.id;
          opt.textContent = s.nombre;
          selectServicio.appendChild(opt);
        });
        serviciosCargados = true;
      } catch (error) {
        console.error('Error cargando servicios:', error);
      }
    }

    // Cargar profesionales solo si no están cargados
    if (selectProfesional && !profesionalesCargados) {
      try {
        const profesionales = await fetchProfesionales();
        // Limpiar opciones existentes
        while (selectProfesional.options.length > 1) {
          selectProfesional.remove(1);
        }
        profesionales.forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.nombre + ' — ' + p.especialidad;
          selectProfesional.appendChild(opt);
        });
        profesionalesCargados = true;
      } catch (error) {
        console.error('Error cargando profesionales:', error);
      }
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (form) form.reset();
    const container = document.getElementById('slotsContainer');
    if (container) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-body); font-size: 0.9rem;">
          Por favor seleccione fecha, servicio y profesional para ver disponibilidad.
        </div>
      `;
    }
    // Resetear slot seleccionado
    const slotHidden = document.getElementById('bookingSelectedSlot');
    if (slotHidden) slotHidden.value = '';
  };

  openButtons.forEach(btn => btn.addEventListener('click', openModal));
  if (closeButton) closeButton.addEventListener('click', closeModal);

  // Cerrar modal al hacer clic fuera del contenido
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });

  // Escuchar cambios en fecha/servicio/profesional para buscar disponibilidad
  const inputs = ['bookingFecha', 'bookingServicio', 'bookingProfesional'];
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', fetchAndRenderSlots);
  });

  async function fetchAndRenderSlots() {
    const fecha = document.getElementById('bookingFecha')?.value;
    const servicio = document.getElementById('bookingServicio')?.value;
    const profesional = document.getElementById('bookingProfesional')?.value;
    const container = document.getElementById('slotsContainer');

    if (!container) return;
    container.innerHTML = '';

    if (!fecha || !servicio || !profesional) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: var(--text-body); font-size: 0.9rem;">
          Por favor seleccione fecha, servicio y profesional para ver disponibilidad.
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; color: var(--text-body);">
        <i class="fas fa-spinner fa-spin"></i> Buscando horarios disponibles...
      </div>
    `;

    try {
      const slots = await fetchDisponibilidad(fecha, servicio, profesional);
      container.innerHTML = '';

      if (slots.length === 0) {
        container.innerHTML = `
          <div style="grid-column: 1/-1; text-align: center; color: var(--text-body);">
            No hay horarios disponibles para esta fecha. Intenta con otro día.
          </div>
        `;
        return;
      }

      slots.forEach(slot => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'slot-btn';
        btn.textContent = slot;
        btn.addEventListener('click', () => {
          document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('selected'));
          btn.classList.add('selected');
          document.getElementById('bookingSelectedSlot').value = slot;
        });
        container.appendChild(btn);
      });
    } catch (error) {
      console.error('Error buscando disponibilidad:', error);
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; color: #EF4444; font-size: 0.9rem;">
          ⚠️ Error al cargar los horarios. Por favor intenta nuevamente.
        </div>
      `;
    }
  }

  // Submit del Formulario de Reserva
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nombre = document.getElementById('bookingNombre').value.trim();
      const telefono = document.getElementById('bookingTelefono').value.trim();
      const email = document.getElementById('bookingEmail').value.trim();
      const servicio = document.getElementById('bookingServicio').value;
      const profesional = document.getElementById('bookingProfesional').value;
      const fecha = document.getElementById('bookingFecha').value;
      const hora = document.getElementById('bookingSelectedSlot').value;

      // Validaciones
      if (!nombre || nombre.length < 2) {
        alert('⚠️ Por favor ingresa un nombre completo válido.');
        return;
      }

      if (!telefono || telefono.length < 7) {
        alert('⚠️ Por favor ingresa un número de teléfono válido.');
        return;
      }

      if (!servicio) {
        alert('⚠️ Por favor selecciona un servicio.');
        return;
      }

      if (!profesional) {
        alert('⚠️ Por favor selecciona un especialista.');
        return;
      }

      if (!fecha) {
        alert('⚠️ Por favor selecciona una fecha.');
        return;
      }

      if (!hora) {
        alert('⚠️ Por favor selecciona un horario disponible.');
        return;
      }

      // Validar que la fecha no sea en el pasado
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const selectedDate = new Date(fecha + 'T00:00:00');
      if (selectedDate < today) {
        alert('⚠️ No se pueden agendar citas en fechas pasadas.');
        return;
      }

      const payload = {
        paciente_nombre: nombre,
        paciente_telefono: telefono,
        paciente_email: email || null,
        servicio_id: parseInt(servicio),
        profesional_id: parseInt(profesional),
        fecha,
        hora
      };

      try {
        const result = await createTurno(payload);

        if (result.success) {
          alert(`✅ ¡Cita Confirmada!\n\nPaciente: ${result.data.paciente_nombre}\nFecha: ${result.data.fecha}\nHora: ${result.data.hora}\nServicio: ${result.data.servicio_nombre}\nEspecialista: ${result.data.profesional_nombre}`);
          closeModal();
        } else {
          alert('❌ Error: ' + (result.error || 'No se pudo reservar el turno. Intenta nuevamente.'));
        }
      } catch (error) {
        console.error('Error al crear turno:', error);
        alert('❌ Ocurrió un error al procesar tu reserva. Por favor intenta nuevamente o contáctanos por WhatsApp.');
      }
    });
  }

  // Resetear estado de carga cuando se cierra el modal
  const resetCarga = () => {
    // No resetear para que no se recargue cada vez que se abre
  };
}