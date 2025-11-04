# Guía de Estilos - Proyecto EBPB2

Esta guía documenta todos los estilos personalizados utilizados en el proyecto de la Estación Biológica de Puerto Blest (EBPB2). Está basada en Bootstrap 5.3.0 con personalizaciones minimalistas.

## 📦 Dependencias Externas

### CSS
```html
<link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.8.0/font/bootstrap-icons.css">
```

### JavaScript
```html
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
<script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
```

## 🎨 Paleta de Colores

### Colores Principales
- **Azul Grisáceo (Primario)**: `#607d8b` - Color principal del navbar y elementos primarios
- **Azul Grisáceo Hover**: `#546e7a` - Estado hover para elementos primarios
- **Azul Acento**: `#4285f4` - Acentos y focus states
- **Verde Éxito**: `#34a853` - Confirmaciones y éxito
- **Rojo Peligro**: `#ea4335` - Errores y elementos de peligro
- **Amarillo Advertencia**: `#fbbc05` - Advertencias
- **Azul Información**: `#4fc3f7` - Información general

### Colores de Fondo y Neutros
- **Fondo Principal**: `#fff` (blanco)
- **Fondo Secundario**: `#f8f9fa` - Formularios y elementos secundarios
- **Fondo Header Sección**: `#fafafa` - Headers de cards
- **Bordes**: `#eee` - Bordes sutiles
- **Texto Principal**: `#555` - Texto principal
- **Texto Secundario**: `#999` - Texto de menor importancia
- **Texto Muted**: `#888` - Texto deshabilitado

## 📝 Tipografía

### Fuente Principal
```css
font-family: 'Inter', 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
```

### Tamaños y Jerarquía
```css
/* Tamaños de encabezados */
h1 { font-size: 1.6rem; }
h2 { font-size: 1.4rem; }
h3 { font-size: 1.25rem; }
h4 { font-size: 1.1rem; }
h5 { font-size: 0.95rem; }
h6 { font-size: 0.85rem; }

/* Tamaños de texto */
body { font-size: 0.85rem; line-height: 1.4; }
.text-muted { font-size: 0.8rem; }
```

### Pesos de Fuente
- **300**: `.fw-light` - Texto ligero
- **400**: Peso normal por defecto
- **500**: Encabezados y elementos importantes
- **600**: `.fw-medium` - Elementos destacados

## 🧭 Navegación

### Navbar
```css
.navbar {
    background-color: #607d8b !important;
    border-bottom: 1px solid #f0f0f0;
    padding: 0.5rem 0.8rem;
    box-shadow: none;
}

.navbar-brand {
    font-weight: 600;
    font-size: 1rem;
    color: #c0ccd6 !important;
}

.nav-link {
    color: #c0ccd6;
    font-size: 0.8rem;
    padding: 0.3rem 0.5rem;
    margin: 0 0.1rem;
    border-radius: 3px;
}

.nav-link:hover {
    color: black;
}

.nav-link.active {
    color: black;
    font-weight: 600;
}
```

### Dropdown
```css
.dropdown-menu {
    border: 1px solid #eee;
    border-radius: 4px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.04);
    padding: 0.3rem;
}

.dropdown-item {
    border-radius: 3px;
    padding: 0.4rem 0.8rem;
    font-size: 0.85rem;
}

.dropdown-item:hover {
    background-color: #f5f5f5;
    color: #2563eb;
}
```

## 🎯 Botones

### Botón Primario
```css
.btn-primary {
    background-color: #607d8b;
    border-color: #607d8b;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.btn-primary:hover {
    background-color: #546e7a;
    border-color: #546e7a;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
```

### Botón Outline
```css
.btn-outline-primary {
    color: #607d8b;
    border-color: #d6e3fa;
    background-color: transparent;
}

.btn-outline-primary:hover {
    background-color: #f4f7fd;
    border-color: #607d8b;
    color: #546e7a;
}
```

### Botón Light
```css
.btn-light {
    background-color: #f8f9fa;
    border-color: #eee;
    color: #666;
}

.btn-light:hover {
    background-color: #f1f3f5;
    border-color: #ddd;
    color: #444;
}
```

### Botón Peligro
```css
.btn-danger {
    background-color: #ea4335;
    border-color: #ea4335;
}

.btn-danger:hover {
    background-color: #d33426;
    border-color: #d33426;
}
```

### Propiedades Generales
```css
.btn {
    border-radius: 4px;
    font-weight: 400;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    transition: all 0.15s ease;
}
```

## 📋 Formularios

### Campos de Formulario
```css
.form-control, .form-select {
    font-size: 0.85rem;
    background-color: #f8f9fa;
    border-color: #ddd;
    transition: all 0.2s ease-in-out;
}

.form-control:hover, .form-select:hover {
    box-shadow: 0 0 0 0.1rem rgba(96, 125, 139, 0.1);
}

.form-control:focus, .form-select:focus {
    border-color: rgba(96, 125, 139, 0.5);
    box-shadow: 0 0 0 0.15rem rgba(96, 125, 139, 0.15);
}
```

### Labels y Texto
```css
.form-label {
    font-size: 0.75rem;
    margin-bottom: 0.3rem;
    color: #607d8b;
}

.form-text {
    font-size: 0.7rem;
    color: #999;
}

.form-required::after {
    content: " *";
    color: #ea4335;
    font-weight: bold;
}
```

### Secciones de Formulario
```css
.form-section {
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
    border-bottom: 1px solid #f0f0f0;
    position: relative;
    padding: 1.5rem 0;
}

.form-section:last-child {
    border-bottom: none;
    padding-bottom: 0;
}

.form-section-title {
    display: flex;
    align-items: center;
    margin-bottom: 1.2rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid rgba(96, 125, 139, 0.1);
    color: #607d8b;
    font-weight: 500;
    font-size: 1.1rem;
}

.form-section-title i {
    margin-right: 0.6rem;
    opacity: 0.8;
}

.form-section-header {
    background-color: rgba(96, 125, 139, 0.05);
    border: 1px solid rgba(96, 125, 139, 0.1);
    border-radius: 4px;
    padding: 0.75rem;
    margin-bottom: 1rem;
}
```

### Input Groups
```css
.input-group-text {
    color: #607d8b;
}
```

### Entradas Especiales (Fechas y Participantes)
```css
.date-entry, .participant-entry {
    transition: all 0.2s ease;
    border-radius: 8px;
    border: 1px solid #f0f0f0;
    margin-bottom: 1rem;
    padding: 1rem;
    background-color: #f8f9fa;
}

.date-entry:hover, .participant-entry:hover {
    border-color: #607d8b;
    background-color: #f5f7f8;
}
```

## 📦 Cards y Contenedores

### Cards Básicas
```css
.card {
    border: 1px solid #eee;
    border-radius: 4px;
    box-shadow: none;
    margin-bottom: 1rem;
    transition: all 0.15s ease-in-out;
}

.card:hover {
    border-color: #ddd;
}
```

### Card Headers
```css
.card-header {
    font-weight: 500;
    font-size: 0.85rem;
    border-bottom: 1px solid #eee;
    background-color: #fafafa;
    border-radius: 4px 4px 0 0 !important;
    padding: 0.6rem 0.8rem;
}

.card-header.bg-primary {
    background-color: #607d8b !important;
    color: white;
    border-bottom: none;
}

.card-header h2 {
    font-size: 1.2rem;
    font-weight: 500;
}
```

### Card Body
```css
.card-body {
    padding: 0.8rem;
}
```

### Feature Cards (Cards especiales de funcionalidades)
```css
.feature-card {
    /* Utiliza las clases base de .card */
}

.feature-icon {
    /* Contenedor para iconos en feature cards */
}
```

## 🏷️ Badges y Etiquetas

### Badge Base
```css
.badge {
    font-weight: 400;
    padding: 0.25em 0.5em;
    border-radius: 3px;
    font-size: 0.75rem;
}
```

### Variantes de Color
```css
.badge.bg-primary { background-color: #607d8b !important; }
.badge.bg-success { background-color: #34a853 !important; }
.badge.bg-warning { 
    background-color: #fbbc05 !important;
    color: #5f6368 !important;
}
.badge.bg-danger { background-color: #ea4335 !important; }
.badge.bg-info { background-color: #4fc3f7 !important; }
.badge.bg-secondary { background-color: #9aa0a6 !important; }
```

## 🚨 Alertas

### Alert Base
```css
.alert {
    padding: 0.75rem;
    font-size: 0.85rem;
    border-radius: 4px;
    transition: all 0.2s ease-in-out;
}
```

### Variantes de Alertas
```css
.alert-primary {
    background-color: rgba(96, 125, 139, 0.1);
    border-color: rgba(96, 125, 139, 0.2);
    color: #607d8b;
}

.alert-info {
    background-color: rgba(79, 195, 247, 0.1);
    border-color: rgba(79, 195, 247, 0.2);
    color: #4fc3f7;
}

.alert-success {
    background-color: rgba(52, 168, 83, 0.1);
    border-color: rgba(52, 168, 83, 0.2);
    color: #34a853;
}

.alert-warning {
    background-color: rgba(251, 188, 5, 0.1);
    border-color: rgba(251, 188, 5, 0.2);
    color: #fbbc05;
}

.alert-danger {
    background-color: rgba(234, 67, 53, 0.1);
    border-color: rgba(234, 67, 53, 0.2);
    color: #ea4335;
}
```

## 📊 Tablas

### Tabla Base
```css
.table {
    font-size: 0.75rem;
}

.table th {
    font-weight: 500;
}
```

## 📄 List Groups

### List Group Items
```css
.list-group-item {
    border-color: #eee;
    padding: 0.5rem 0.75rem;
    font-size: 0.8rem;
}

.list-group-flush .list-group-item {
    border-right-width: 0;
    border-left-width: 0;
    border-radius: 0;
}
```

## 🎭 Elementos Especiales

### Hero Section
```css
.hero-section {
    /* Sección principal de la página de inicio */
}
```

### Section Title
```css
.section-title {
    font-size: 1.1rem;
    margin-bottom: 0.75rem;
    color: #555;
    font-weight: 500;
    letter-spacing: -0.01em;
}
```

### Footer
```css
.footer {
    margin-top: 1.5rem;
    padding: 0.8rem 0;
    border-top: 1px solid #eee;
    color: #999;
    font-size: 0.75rem;
}
```

### Confirmation Message
```css
.confirmation-msg {
    color: #34a853;
    font-size: 0.8rem;
    padding: 0.3rem 0;
    opacity: 0.9;
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(-5px); }
    to { opacity: 0.9; transform: translateY(0); }
}
```

### Display Numbers (Dashboard)
```css
.display-4 {
    font-size: 2rem !important;
    font-weight: 600;
    line-height: 1.2;
    margin-bottom: 0;
}

.card-text.display-4 {
    margin-top: 0.25rem;
}
```

## 🎨 Utilidades y Overrides

### Backgrounds
```css
.bg-light {
    background-color: #f8f9fa !important;
}
```

### Borders
```css
p.border {
    border-color: #eee !important;
    border-radius: 3px;
    font-size: 0.8rem;
    padding: 0.5rem !important;
}

hr {
    opacity: 0.1;
    margin: 1.5rem 0;
}
```

### Spacing Overrides
```css
.container {
    padding: 0 0.8rem;
}

.mb-4 { margin-bottom: 1rem !important; }
.mb-3 { margin-bottom: 0.75rem !important; }
.py-3 { 
    padding-top: 0.75rem !important;
    padding-bottom: 0.75rem !important;
}
.py-2 { 
    padding-top: 0.5rem !important;
    padding-bottom: 0.5rem !important;
}
.mt-4 { margin-top: 1rem !important; }
.mt-3 { margin-top: 0.75rem !important; }
```

### Text Utilities
```css
p {
    margin-bottom: 0.4rem;
}

strong {
    font-weight: 500;
}

.reservation-detail p {
    font-size: 0.8rem;
    margin-bottom: 0.25rem;
}
```

### Icons
```css
.bi {
    vertical-align: -0.125em;
    font-size: 90%;
}
```

### Shadow Removal
```css
.shadow, .shadow-sm {
    box-shadow: none !important;
}
```

## 📱 Responsive Design

### Mobile Breakpoints
```css
@media (max-width: 767.98px) {
    .btn-group {
        display: flex;
        flex-direction: column;
    }
    
    .btn-group .btn {
        margin-bottom: 0.5rem;
        border-radius: 0.25rem !important;
    }
}
```

## 🎯 Transiciones y Animaciones

### Transiciones Generales
```css
.form-control, .form-select, .btn, .input-group-text,
.card, .alert, .date-entry, .participant-entry {
    transition: all 0.2s ease-in-out;
}
```

### Hover Effects
```css
/* Los efectos hover están definidos individualmente para cada componente */
```

## 💡 Consejos de Uso

1. **Consistencia**: Utiliza siempre la paleta de colores definida
2. **Tipografía**: Mantén la jerarquía de tamaños de fuente
3. **Spacing**: Respeta los espaciados definidos para mantener la coherencia visual
4. **Transiciones**: Aplica las transiciones suaves para mejor UX
5. **Responsive**: Considera el comportamiento en dispositivos móviles

## 🔧 Personalización

Para personalizar estos estilos en otro proyecto:

1. Modifica las variables CSS de colores principales
2. Ajusta los tamaños de fuente según necesidades
3. Adapta los espaciados y paddings
4. Personaliza las transiciones y animaciones
5. Ajusta los border-radius para diferentes estilos

---

**Nota**: Este sistema de estilos está optimizado para una interfaz minimalista y limpia, priorizando la legibilidad y la usabilidad.