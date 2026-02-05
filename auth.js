// auth.js - cliente: modal de login/registro y bloqueo de navegación si no hay sesión
(function(){
  const modalHtml = `
  <div id="authModal" style="display:none;position:fixed;inset:0;z-index:9999;align-items:center;justify-content:center;background:rgba(0,0,0,0.6);">
    <div style="background:#fff;border-radius:12px;max-width:420px;width:92%;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
        <strong>Iniciar sesión / Registrarse</strong>
        <button id="authCloseBtn" style="background:#eee;border:none;padding:6px 10px;border-radius:6px;cursor:pointer;">×</button>
      </div>
      <div id="authTabs" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
        <button id="showLogin" style="padding:8px;border-radius:8px;background:#7c00e2;color:#fff;border:none;cursor:pointer;">Login</button>
        <button id="showRegister" style="padding:8px;border-radius:8px;background:#eee;border:none;cursor:pointer;">Registro</button>
      </div>
      <div id="authForms" style="min-height:140px;">
        <form id="loginForm" style="display:block;">
          <input id="loginUser" placeholder="Usuario" required style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <input id="loginPass" placeholder="Contraseña" type="password" required style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button type="submit" style="background:#7c00e2;color:#fff;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;">Entrar</button>
          </div>
        </form>
        <form id="registerForm" style="display:none;">
          <input id="regUser" placeholder="Usuario" required style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <input id="regPass" placeholder="Contraseña" type="password" required style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #ddd;border-radius:6px;" />
          <div style="display:flex;gap:8px;justify-content:flex-end;">
            <button type="submit" style="background:#00b896;color:#fff;padding:8px 12px;border-radius:8px;border:none;cursor:pointer;">Registrar</button>
          </div>
        </form>
      </div>
    </div>
  </div>`;

  document.addEventListener('DOMContentLoaded', function(){
    // inyectar modal en body
    if (!document.getElementById('authModal')) {
      const wrapper = document.createElement('div');
      wrapper.innerHTML = modalHtml;
      document.body.appendChild(wrapper.firstElementChild);
    }

    const modal = document.getElementById('authModal');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showLogin = document.getElementById('showLogin');
    const showRegister = document.getElementById('showRegister');
    const closeBtn = document.getElementById('authCloseBtn');

    let pendingNavigation = null;

    function isAuthenticated(){
      return localStorage.getItem('logged') === '1';
    }

    function showModal(){
      modal.style.display = 'flex';
    }
    function hideModal(){
      modal.style.display = 'none';
      pendingNavigation = null;
    }

    showLogin.addEventListener('click', function(){ loginForm.style.display='block'; registerForm.style.display='none'; showLogin.style.background='#7c00e2'; showLogin.style.color='#fff'; showRegister.style.background='#eee'; showRegister.style.color='#000'; });
    showRegister.addEventListener('click', function(){ loginForm.style.display='none'; registerForm.style.display='block'; showRegister.style.background='#7c00e2'; showRegister.style.color='#fff'; showLogin.style.background='#eee'; showLogin.style.color='#000'; });
    closeBtn.addEventListener('click', hideModal);

    loginForm.addEventListener('submit', function(e){
      e.preventDefault();
      // En este ejemplo simple no validamos contra servidor. Marcar como autenticado.
      localStorage.setItem('logged','1');
      hideModal();
      if (pendingNavigation) location.href = pendingNavigation;
    });

    registerForm.addEventListener('submit', function(e){
      e.preventDefault();
      // Simular registro y logueo inmediato
      localStorage.setItem('logged','1');
      hideModal();
      if (pendingNavigation) location.href = pendingNavigation;
    });

    // Interceptar clicks en enlaces relativos para requerir autenticación
    document.addEventListener('click', function(e){
      if (e.defaultPrevented) return;
      const a = e.target.closest('a');
      if (!a) return;
      const href = a.getAttribute('href');
      if (!href) return;

      // Permitir anclas, mailto, tel y externas
      if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
      if (/^https?:\/\//i.test(href) && new URL(href, location.href).origin !== location.origin) return;

      // Si es relativo o dominio igual, requerir auth
      if (!isAuthenticated()){
        e.preventDefault();
        pendingNavigation = new URL(href, location.href).href;
        showModal();
      }
    }, true);

    // Proveer funciones globales para login/status
    window.auth = {
      isAuthenticated: isAuthenticated,
      logout: function(){ localStorage.removeItem('logged'); },
      requireAuthToNavigate: function(url){ if (isAuthenticated()) location.href = url; else { pendingNavigation = url; showModal(); } }
    };
  });
})();
