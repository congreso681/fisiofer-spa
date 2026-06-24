/* ==========================================
   FISIOFER SPA — API CONNECTION LAYER
   ========================================== */

// 📌 URL de tu backend en Railway
const API_BASE_URL = 'https://fisiofer-backend-production.up.railway.app/api';

// Datos de fallback (Mock) en caso de que el backend no esté activo
const MOCK_SERVICIOS = [
  { id: 1, nombre: "Fisioterapia Clínica", descripcion: "Tratamientos especializados para recuperar tu función motriz, aliviar el dolor y rehabilitar lesiones con base científica." },
  { id: 2, nombre: "Patologías de Columna", descripcion: "Escoliosis, hipercifosis, cervicalgias, dorsalgias, lumbalgias y ciática. Tratamiento integral con técnicas manuales y agentes físicos." },
  { id: 3, nombre: "Alteraciones Ortopédicas", descripcion: "Pie plano, pie cavo, genu valgo/varo, talo valgo/varo y recurvatum. Diagnóstico biomecánico y tratamiento personalizado." },
  { id: 4, nombre: "Lesiones Deportivas", descripcion: "Rehabilitación funcional deportiva para desgarros, esguinces, tendinitis y recuperación post-esfuerzo en deportistas." },
  { id: 5, nombre: "Artritis y Artrosis", descripcion: "Cuidado kinesiátrico para disminuir la rigidez articular, mejorar la flexibilidad y atenuar dolores crónicos degenerativos." },
  { id: 6, nombre: "Displasia de Cadera en Bebés", descripcion: "Ejercicios terapéuticos específicos y guía para la correcta fijación y desarrollo articular de la cadera en infantes." },
  { id: 7, nombre: "Acupuntura y Punción Seca", descripcion: "Estimulación muscular profunda con agujas estériles finas para desactivar puntos de gatillo de dolor e inflamación crónica." },
  { id: 8, nombre: "Ventosas (Cupping)", descripcion: "Técnica de succión para promover la irrigación sanguínea local, aliviar contracturas y oxigenar el tejido miofascial." },
  { id: 9, nombre: "Piedras Calientes", descripcion: "Terapia relajante que utiliza piedras volcánicas calientes sobre canales energéticos para mejorar la circulación sanguínea." },
  { id: 10, nombre: "Masajes Terapéuticos", descripcion: "Masajes relajantes y descontracturantes con aromaterapia, musicoterapia y técnicas manuales avanzadas para aliviar el estrés y el dolor muscular." },
  { id: 11, nombre: "Estética Corporal", descripcion: "Cavitación, lipoláser, radiofrecuencia, maderoterapia, ondas rusas, gimnasia pasiva y electroestimulación muscular para el moldeamiento corporal." }
];

const MOCK_PROFESIONALES = [
  { id: 1, nombre: "Lic. Nelly Fernández", especialidad: "Fisioterapeuta · Propietaria", email: "nelly.fernandez@fisioferspa.com" },
  { id: 2, nombre: "Lic. Fidel Villca", especialidad: "Fisioterapeuta · Propietario", email: "fidel.villca@fisioferspa.com" },
  { id: 3, nombre: "Lic. Roxana Ramos", especialidad: "Fisioterapeuta", email: "roxana.ramos@fisioferspa.com" },
  { id: 4, nombre: "Helen Quispe", especialidad: "Masajista Terapeuta", email: "helen.quispe@fisioferspa.com" },
  { id: 5, nombre: "Paula Romero", especialidad: "Masajista Terapeuta", email: "paula.romero@fisioferspa.com" }
];

/**
 * Obtener todos los servicios del centro.
 */
async function fetchServicios() {
  try {
    const response = await fetch(`${API_BASE_URL}/servicios`);
    if (!response.ok) throw new Error('Servidor no disponible');
    const resData = await response.json();
    return resData.data || MOCK_SERVICIOS;
  } catch (error) {
    console.warn('⚠️ No se pudo conectar al backend. Usando datos de servicios de fallback.', error.message);
    return MOCK_SERVICIOS;
  }
}

/**
 * Obtener la lista de profesionales.
 */
async function fetchProfesionales() {
  try {
    const response = await fetch(`${API_BASE_URL}/profesionales`);
    if (!response.ok) throw new Error('Servidor no disponible');
    const resData = await response.json();
    return resData.data || MOCK_PROFESIONALES;
  } catch (error) {
    console.warn('⚠️ No se pudo conectar al backend. Usando datos de profesionales de fallback.', error.message);
    return MOCK_PROFESIONALES;
  }
}

/**
 * Consultar slots disponibles para un profesional, fecha y servicio.
 */
async function fetchDisponibilidad(fecha, servicioId, profesionalId) {
  try {
    const queryParams = new URLSearchParams({
      fecha,
      servicio_id: servicioId,
      profesional_id: profesionalId
    });
    const response = await fetch(`${API_BASE_URL}/disponibilidad?${queryParams}`);
    if (!response.ok) throw new Error('Error al consultar disponibilidad');
    const resData = await response.json();
    return resData.data.slots_disponibles || [];
  } catch (error) {
    console.warn('⚠️ Usando simulación local de turnos disponibles.', error.message);
    
    // Simulación: Genera slots de mañana y tarde
    const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
    
    // Filtrar aleatoriamente algunos slots para simular turnos ocupados
    const seed = fecha.replace(/-/g, '') + servicioId + profesionalId;
    let seededRandom = function(s) {
      let x = Math.sin(s++) * 10000;
      return x - Math.floor(x);
    };
    
    return slots.filter((slot, index) => {
      return seededRandom(parseInt(seed) + index) > 0.45;
    });
  }
}

/**
 * Registrar un nuevo turno.
 */
async function createTurno(payload) {
  try {
    const response = await fetch(`${API_BASE_URL}/turnos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Error al agendar turno');
    }
    return data;
  } catch (error) {
    console.warn('⚠️ Guardando reserva localmente (Modo simulación offline).', error.message);
    // Simulación exitosa local
    return {
      success: true,
      message: '✅ Turno confirmado exitosamente (Simulación local)',
      data: {
        id: Math.floor(Math.random() * 10000),
        paciente_nombre: payload.paciente_nombre,
        fecha: payload.fecha,
        hora: payload.hora,
        servicio_nombre: MOCK_SERVICIOS.find(s => s.id === parseInt(payload.servicio_id))?.nombre || 'Fisioterapia',
        profesional_nombre: MOCK_PROFESIONALES.find(p => p.id === parseInt(payload.profesional_id))?.nombre || 'Especialista'
      }
    };
  }
}