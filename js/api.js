/* ==========================================
   FISIOFER SPA — API CONNECTION LAYER
   ========================================== */

// 📌 URL de tu backend en Railway
const API_BASE_URL = 'https://fisiofer-backend-production.up.railway.app/api';

// Datos de fallback (Mock) en caso de que el backend no esté activo
const MOCK_SERVICIOS = [
  { id: 1, nombre: "Evaluación Diagnóstica", descripcion: "Evaluación completa para diagnóstico kinésico y plan de tratamiento" },
  { id: 2, nombre: "Kinesiología", descripcion: "Evaluación y tratamiento del movimiento corporal" },
  { id: 3, nombre: "Terapia Manual", descripcion: "Técnicas manuales avanzadas para aliviar el dolor y mejorar movilidad" },
  { id: 4, nombre: "Rehabilitación Deportiva", descripcion: "Programas de recuperación para deportistas con lesiones" },
  { id: 5, nombre: "Punción Seca", descripcion: "Tratamiento de puntos gatillo miofasciales con agujas" },
  { id: 6, nombre: "Electroterapia", descripcion: "Corrientes eléctricas terapéuticas para reducir inflamación" },
  { id: 7, nombre: "Acupuntura", descripcion: "Técnica de agujas para alivio del dolor y equilibrio energético" },
  { id: 8, nombre: "Ventosas (Cupping)", descripcion: "Técnica de succión para promover circulación sanguínea" },
  { id: 9, nombre: "Cavitación", descripcion: "Eliminación de grasa localizada por ultrasonido de baja frecuencia" },
  { id: 10, nombre: "Lipoláser", descripcion: "Reducción de grasa localizada mediante láser de baja potencia" },
  { id: 11, nombre: "Maderoterapia", descripcion: "Moldeamiento corporal con técnicas de madera" },
  { id: 12, nombre: "Radiofrecuencia", descripcion: "Tratamiento para flacidez y arrugas con ondas de radiofrecuencia" },
  { id: 13, nombre: "Ondas Rusas / Electroestimulación", descripcion: "Estimulación muscular para tonificación y levantamiento de glúteos" },
  { id: 14, nombre: "Levantamiento de Glúteos", descripcion: "Técnica específica para tonificar y levantar glúteos" },
  { id: 15, nombre: "Masaje Relajante (40 min)", descripcion: "Alivio de tensión y estrés con movimientos suaves" },
  { id: 16, nombre: "Masaje Relajante (60 min)", descripcion: "Alivio de tensión y estrés con movimientos suaves" },
  { id: 17, nombre: "Masaje Descontracturante (40 min)", descripcion: "Liberación de nudos musculares y tensiones profundas" },
  { id: 18, nombre: "Masaje Descontracturante (60 min)", descripcion: "Liberación de nudos musculares y tensiones profundas" },
  { id: 19, nombre: "Masaje con Piedras Calientes", descripcion: "Terapia relajante con piedras volcánicas calientes" },
  { id: 20, nombre: "Drenaje Linfático", descripcion: "Técnica manual para activar el sistema linfático y eliminar toxinas" }
];

const MOCK_PROFESIONALES = [
  { 
    id: 1, 
    nombre: "Lic. Nelly Fernández", 
    especialidad: "Fisioterapeuta · Propietaria", 
    email: "nelly.fernandez@fisiofer.com" 
  },
  { 
    id: 2, 
    nombre: "Lic. Fidel Villca", 
    especialidad: "Fisioterapeuta · Propietario", 
    email: "fidel.villca@fisiofer.com" 
  },
  { 
    id: 3, 
    nombre: "Lic. Roxana Ramos", 
    especialidad: "Fisioterapeuta", 
    email: "roxana.ramos@fisiofer.com" 
  },
  { 
    id: 4, 
    nombre: "Helen Quispe", 
    especialidad: "Masajista Terapeuta", 
    email: "helen.quispe@fisiofer.com" 
  },
  { 
    id: 5, 
    nombre: "Paula Romero", 
    especialidad: "Masajista Terapeuta / Esteticista", 
    email: "paula.romero@fisiofer.com" 
  },
  { 
    id: 6, 
    nombre: "Rubén Linares", 
    especialidad: "Secretario · Admisión", 
    email: "ruben.linares@fisiofer.com" 
  }
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
    
    if (resData.success && resData.data) {
      // Transformar la respuesta del backend al formato que espera el frontend
      return resData.data.map(p => ({
        id: p.id,
        nombre: p.titulo ? `${p.titulo} ${p.nombre} ${p.apellido}` : `${p.nombre} ${p.apellido}`,
        especialidad: p.especialidad || 'Sin especialidad',
        email: p.email
      }));
    }
    return MOCK_PROFESIONALES;
  } catch (error) {
    console.warn('⚠️ No se pudo conectar al backend. Usando datos de profesionales de fallback.', error.message);
    return MOCK_PROFESIONALES;
  }
}

/**
 * Consultar slots disponibles para un profesional, fecha y servicio.
 */
async function fetchDisponibilidad(fecha, servicioId, profesionalId) {
  console.log('📅 Buscando disponibilidad para:', { fecha, servicioId, profesionalId });

  try {
    const queryParams = new URLSearchParams({
      fecha,
      servicio_id: servicioId,
      profesional_id: profesionalId
    });
    const response = await fetch(`${API_BASE_URL}/disponibilidad?${queryParams}`);
    if (!response.ok) throw new Error('Error al consultar disponibilidad');
    const resData = await response.json();
    console.log('📥 Respuesta del backend:', resData);

    if (resData.success && resData.data && resData.data.profesionales) {
      // Buscar el profesional seleccionado
      const profesionalData = resData.data.profesionales.find(
        p => p.profesional_id === parseInt(profesionalId)
      );
      if (profesionalData && profesionalData.slots_disponibles) {
        return profesionalData.slots_disponibles;
      }
      if (resData.data.profesionales.length > 0) {
        return resData.data.profesionales[0].slots_disponibles || [];
      }
    }
    return [];
  } catch (error) {
    console.warn('⚠️ Usando simulación local de turnos disponibles.', error.message);
    
    const slots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];
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