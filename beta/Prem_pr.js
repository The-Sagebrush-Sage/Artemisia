// ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ И ПРОФИЛЯМИ ==========

// Глобальные переменные для управления профилем
let socialLinksCount = 0;
let uploadedWorksCount = 0;
const MAX_SOCIAL_LINKS = 6;
const MAX_WORKS = Infinity;

// Переменные для полноэкранного просмотра работ в профиле
let profileWorks = [];
let currentProfileWorkIndex = 0;

// Переменные для полноэкранного просмотра изображений
let currentImages = [];
let currentImageIndex = 0;

// Переменные для полноэкранного просмотра работ в личном кабинете
let cabinetWorks = [];
let currentCabinetWorkIndex = 0;

// Текущий пользователь
let currentUser = null;

// Проверка статуса авторизации
function checkAuthStatus() {
    const userData = localStorage.getItem('currentUser');
    if (userData) {
        try {
            currentUser = JSON.parse(userData);
            updateAuthUI();
        } catch (e) {
            console.error('Ошибка при чтении данных пользователя:', e);
            currentUser = null;
        }
    } else {
        currentUser = null;
        updateAuthUI();
    }

    // кнопки регистрации/входа
    updateRegistrationButton();
}

document.addEventListener('DOMContentLoaded', function () {
    // Проверяем статус авторизации
    checkAuthStatus();

});

function updateAuthUI() {
    const headerAuth = document.querySelector('.header-auth');
    const mobileAuth = document.querySelector('.mobile-auth');
    const mobileUserProfile = document.querySelector('.mobile-user-profile');
    const drawer = document.getElementById('drawer');

    if (currentUser) {
        // Пользователь авторизован
        const userProfile = localStorage.getItem('userProfile_' + currentUser.username);
        let profileData = {};

        if (userProfile) {
            profileData = JSON.parse(userProfile);
        }

        const avatarSrc = profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg';
        const displayName = profileData.profileName || currentUser.username;
        const telegramNickname = profileData.profileNickname || '@username';

        // Header для ПК
        headerAuth.innerHTML = `
            <div class="user-profile-container" style="position: relative;">
                <button class="user-profile-btn" onclick="toggleProfileDropdown()">
                    <img src="${avatarSrc}" alt="Аватар" class="user-avatar">
                    <span class="user-name">${displayName}</span>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style="margin-left: 5px;">
                        <path d="M7 10l5 5 5-5z" />
                    </svg>
                </button>
                <div class="user-profile-dropdown" id="userProfileDropdown">
                    <button class="user-profile-dropdown-item" onclick="openPersonalCabinetModal()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        Личный профиль
                    </button>
                    <button class="user-profile-dropdown-item" onclick="editProfile()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                        </svg>
                        Редактировать
                    </button>
                    <div class="user-profile-dropdown-divider"></div>
                    <button class="user-profile-dropdown-item" onclick="logout()">
                        <svg viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                        </svg>
                        Выйти
                    </button>
                </div>
            </div>
        `;

        // Мобильное меню - показываем профиль пользователя
        if (mobileUserProfile) {
            mobileUserProfile.style.display = 'flex';
            mobileUserProfile.querySelector('#mobileUserAvatar').src = avatarSrc;
            mobileUserProfile.querySelector('#mobileUserName').textContent = displayName;
            mobileUserProfile.querySelector('#mobileUserTelegram').textContent = telegramNickname;
        }

        if (mobileAuth) {
            mobileAuth.style.display = 'none';
        }
    } else {
        // Пользователь НЕ авторизован
        headerAuth.innerHTML = `
            <button class="auth-btn login-btn" onclick="openLoginModal()">Войти</button>
            <button class="auth-btn register-btn" onclick="openRegistrationModal()">Регистрация</button>
        `;

        // Мобильное меню - показываем кнопки входа/регистрации
        if (mobileUserProfile) {
            mobileUserProfile.style.display = 'none';
        }

        if (mobileAuth) {
            mobileAuth.style.display = 'flex';
            mobileAuth.innerHTML = `
                <button class="auth-btn login-btn" onclick="openLoginModal()">Войти</button>
                <button class="auth-btn register-btn" onclick="openRegistrationModal()">Регистрация</button>
            `;
        }
    }


    updateRegistrationButton();
}

function updateCabinetActionsForMobile() {
    const actionsContainer = document.querySelector('.cabinet-actions');
    if (!actionsContainer) return;


    actionsContainer.innerHTML = '';

    if (window.innerWidth <= 768) {
        // Мобильная версия: кнопка редактирования сверху, закрыть и выйти снизу
        actionsContainer.innerHTML = `
            <button class="cabinet-action-btn" onclick="editProfile()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Редактировать профиль
            </button>
            <div class="cabinet-bottom-actions">
                <button class="cabinet-action-btn secondary" onclick="closePersonalCabinetModal()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                    </svg>
                    Закрыть
                </button>
                <button class="cabinet-action-btn secondary" onclick="logout()">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                    </svg>
                    Выйти
                </button>
            </div>
        `;
    } else {
        // Десктопная версия: все кнопки в ряд
        actionsContainer.innerHTML = `
            <button class="cabinet-action-btn" onclick="editProfile()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                </svg>
                Редактировать профиль
            </button>
            <button class="cabinet-action-btn secondary" onclick="closePersonalCabinetModal()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
                Закрыть
            </button>
            <button class="cabinet-action-btn secondary" onclick="logout()">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
                Выйти
            </button>
        `;
    }
}

window.addEventListener('resize', function () {
    if (document.getElementById('personalCabinetModal').style.display === 'block') {
        updateCabinetActionsForMobile();
    }
});

function toggleProfileDropdown() {
    const dropdown = document.getElementById('userProfileDropdown');
    dropdown.classList.toggle('active');

    document.querySelectorAll('.user-profile-dropdown').forEach(menu => {
        if (menu !== dropdown) {
            menu.classList.remove('active');
        }
    });

    if (dropdown.classList.contains('active')) {
        document.addEventListener('click', closeProfileDropdownOnClickOutside);
    } else {
        document.removeEventListener('click', closeProfileDropdownOnClickOutside);
    }
}

function closeProfileDropdownOnClickOutside(event) {
    const profileContainer = document.querySelector('.user-profile-container');
    if (!profileContainer.contains(event.target)) {
        document.getElementById('userProfileDropdown').classList.remove('active');
        document.removeEventListener('click', closeProfileDropdownOnClickOutside);
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    closePersonalCabinetModal();
    showProfileSuccess('Вы успешно вышли из системы');
    updateRegistrationButton();
}

function updateRegistrationButton() {
    const registerButtons = document.querySelectorAll('.register-btn, .auth-btn.register-btn');
    const loginButtons = document.querySelectorAll('.login-btn, .auth-btn.login-btn');

    if (checkRegistrationStatus()) {
        registerButtons.forEach(btn => {
            btn.textContent = 'Войти';
            btn.onclick = openLoginModal;
            btn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        });

        loginButtons.forEach(btn => {
            btn.style.display = 'none';
        });
    } else {
        // Обычное состояние
        registerButtons.forEach(btn => {
            btn.textContent = 'Регистрация';
            btn.onclick = openRegistrationModal;
            btn.style.background = 'linear-gradient(45deg, #ffcc00, #ffdd33)';
        });

        loginButtons.forEach(btn => {
            btn.style.display = 'block';
        });
    }
}

// ========== ФУНКЦИИ РЕГИСТРАЦИИ И ВХОДА ==========

function openRegistrationModal() {
    if (checkRegistrationStatus()) {
        showRegistrationStatusMessage();
        setTimeout(() => {
            closeRegistrationModal();
            openLoginModal();
        }, 2000);
        return;
    }

    const modal = document.getElementById('registrationModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';

    document.getElementById('message').style.display = 'none';
    document.getElementById('registrationCode').value = '';

    setTimeout(() => {
        const input = document.getElementById('registrationCode');
        input.focus();

        if (document.activeElement !== input) {
            input.setAttribute('style', 'font-size: 16px;');
            setTimeout(() => input.focus(), 100);
        }
    }, 350);
}

function showRegistrationStatusMessage() {
    const registeredUsers = getRegisteredUsers();

    if (registeredUsers.length > 0) {
        if (registeredUsers.length === 1) {
            const user = registeredUsers[0];
            showMessage(`Вы уже зарегистрированы как "${user.profileName}"! Перенаправляем на вход...`, 'success');
        } else {
            showMessage(`На этом устройстве уже зарегистрировано ${registeredUsers.length} пользователя. Перенаправляем на вход...`, 'success');
        }
    } else if (currentUser) {
        showMessage(`Вы уже авторизованы как "${currentUser.profileName}"!`, 'success');
    }
}

function closeRegistrationModal() {
    const modal = document.getElementById('registrationModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
}

function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.width = '100%';
    document.getElementById('loginMessage').style.display = '';
    document.getElementById('loginEmail').value = '';
    document.getElementById('loginPassword').value = '';

    setTimeout(() => {
        const input = document.getElementById('loginEmail');
        input.focus();

        if (document.activeElement !== input) {
            input.setAttribute('style', 'font-size: 16px;');
            setTimeout(() => input.focus(), 100);
        }
    }, 350);
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
    document.body.style.position = 'static';
    document.body.style.width = 'auto';
}

function showMessage(text, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    if (window.innerWidth <= 768) {
        setTimeout(() => {
            messageDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }, 100);
    }

    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.style.display === 'block') {
                messageDiv.style.display = 'none';
            }
        }, 5000);
    }
}

function showLoginMessage(text, type) {
    const messageDiv = document.getElementById('loginMessage');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';

    if (window.innerWidth <= 768) {
        setTimeout(() => {
            messageDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }, 100);
    }

    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.style.display === 'block') {
                messageDiv.style.display = 'none';
            }
        }, 5000);
    }
}

function showWelcomeNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 300px;
                font-family: "Comfortaa", sans-serif;
                animation: slideInRight 0.5s ease-out;
            `;

    notification.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">🎉 Добро пожаловать!</div>
                <div style="font-size: 0.9em;">Регистрация в Artemisia завершена успешно!</div>
            `;

    document.body.appendChild(notification);

    // Удаляем уведомление через 5 секунд
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.5s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}

// Добавляем CSS анимации для уведомления
const style = document.createElement('style');
style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
document.head.appendChild(style);




function getUrlParameter(name) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
    const results = regex.exec(window.location.href);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}


function openModalFromUrl() {
    const modalParam = getUrlParameter('modal');

    if (modalParam === 'login') {
        openLoginModal();
    } else if (modalParam === 'register') {
        openRegistrationModal();
    } else if (modalParam === 'profile') {
        openProfileSetupModal();
    } else if (modalParam === 'cabinet') {
        openPersonalCabinetModal();
    }
}

function updateUrl(parameters) {
    const url = new URL(window.location);
    const paramsToRemove = ['modal', 'action', 'tab'];
    paramsToRemove.forEach(param => {
        url.searchParams.delete(param);
    });

    Object.keys(parameters).forEach(key => {
        if (parameters[key]) {
            url.searchParams.set(key, parameters[key]);
        }
    });

    window.history.replaceState({}, '', url);
}

function generateModalLink(modalType) {
    const url = new URL(window.location);
    url.searchParams.set('modal', modalType);
    return url.toString();
}

function openRegistrationModalWithUrl() {
    openRegistrationModal();
    updateUrl({ modal: 'register' });
}

function openLoginModalWithUrl() {
    openLoginModal();
    updateUrl({ modal: 'login' });
}

function openProfileSetupModalWithUrl() {
    openProfileSetupModal();
    updateUrl({ modal: 'profile' });
}

function openPersonalCabinetModalWithUrl() {
    openPersonalCabinetModal();
    updateUrl({ modal: 'cabinet' });
}

function closeRegistrationModalWithUrl() {
    closeRegistrationModal();
    updateUrl({});
}

function closeLoginModalWithUrl() {
    closeLoginModal();
    updateUrl({});
}

function closeProfileSetupModalWithUrl() {
    closeProfileSetupModal();
    updateUrl({});
}

function closePersonalCabinetModalWithUrl() {
    closePersonalCabinetModal();
    updateUrl({});
}

document.addEventListener('DOMContentLoaded', function () {
    initImageModal();
    setTimeout(openModalFromUrl, 100);
    updateModalLinks();
});

function updateModalLinks() {
    const headerLoginBtn = document.querySelector('.header-auth .login-btn');
    const headerRegisterBtn = document.querySelector('.header-auth .register-btn');

    if (headerLoginBtn) {
        headerLoginBtn.onclick = openLoginModalWithUrl;
    }
    if (headerRegisterBtn) {
        headerRegisterBtn.onclick = openRegistrationModalWithUrl;
    }

    const mobileLoginBtn = document.querySelector('.mobile-auth .login-btn');
    const mobileRegisterBtn = document.querySelector('.mobile-auth .register-btn');

    if (mobileLoginBtn) {
        mobileLoginBtn.onclick = openLoginModalWithUrl;
    }
    if (mobileRegisterBtn) {
        mobileRegisterBtn.onclick = openRegistrationModalWithUrl;
    }

    const profileSetupLinks = document.querySelectorAll('[onclick*="openProfileSetupModal"]');
    profileSetupLinks.forEach(link => {
        link.onclick = openProfileSetupModalWithUrl;
    });

    const cabinetLinks = document.querySelectorAll('[onclick*="openPersonalCabinetModal"]');
    cabinetLinks.forEach(link => {
        link.onclick = openPersonalCabinetModal;
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const closeRegistrationBtn = document.querySelector('#registrationModal .close-modal');
    const closeLoginBtn = document.querySelector('#loginModal .close-modal');
    const closeProfileSetupBtn = document.querySelector('#profileSetupModal .close-modal');
    const closeCabinetBtn = document.querySelector('#personalCabinetModal .close-modal');

    if (closeRegistrationBtn) {
        closeRegistrationBtn.onclick = closeRegistrationModalWithUrl;
    }
    if (closeLoginBtn) {
        closeLoginBtn.onclick = closeLoginModalWithUrl;
    }
    if (closeProfileSetupBtn) {
        closeProfileSetupBtn.onclick = closeProfileSetupModalWithUrl;
    }
    if (closeCabinetBtn) {
        closeCabinetBtn.onclick = closePersonalCabinetModalWithUrl;
    }
});

window.addEventListener('popstate', function (event) {
    closeAllModals();
    setTimeout(openModalFromUrl, 50);
});

function closeAllModals() {
    closeRegistrationModal();
    closeLoginModal();
    closeProfileSetupModal();
    closePersonalCabinetModal();
    updateUrl({});
}

function submitRegistration(event) {
    event.preventDefault();

    const code = document.getElementById('registrationCode').value.trim();
    const submitBtn = document.getElementById('submitBtn');

    if (!code) {
        showMessage('Пожалуйста, введите код подтверждения', 'error');
        document.getElementById('registrationCode').focus();
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Проверка...';

    // 888666
    setTimeout(() => {
        if (code === 'N876QwR') {
            showMessage('Код подтвержден! Теперь вы можете заполнить анкету.', 'success');

            setTimeout(() => {
                closeRegistrationModal();
                openProfileSetupModal();
            }, 2000);
        } else {
            showMessage('Неверный код подтверждения', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Получить доступ к анкете';
            document.getElementById('registrationCode').focus();
            document.getElementById('registrationCode').select();
        }
    }, 1500);
}

function checkRegistrationStatus() {
    const registeredUsers = Object.keys(localStorage).filter(key =>
        key.startsWith('user_') && key !== 'currentUser'
    );

    return registeredUsers.length > 0 || currentUser !== null;
}

function getRegisteredUsers() {
    const users = [];
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('user_') && key !== 'currentUser') {
            try {
                const userData = JSON.parse(localStorage.getItem(key));
                users.push({
                    id: key.replace('user_', ''),
                    username: userData.username,
                    profileName: userData.profileName
                });
            } catch (e) {
                console.error('Ошибка при чтении пользователя:', key, e);
            }
        }
    });
    return users;
}

function submitLogin(event) {
    event.preventDefault();

    const username = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loginBtn = document.getElementById('loginBtn');
    const messageDiv = document.getElementById('loginMessage');

    if (!username || !password) {
        showLoginMessage('Пожалуйста, заполните все поля', 'error');
        return;
    }

    loginBtn.disabled = true;
    loginBtn.textContent = 'Вход...';
    setTimeout(() => {
        if (verifyUserPassword(username, password)) {
            const userData = {
                username: username,
                registrationDate: new Date().toISOString(),
                profileComplete: true
            };

            const profileData = syncUserData(username);

            if (profileData) {
                userData.profileName = profileData.profileName;
                userData.profileNickname = profileData.profileNickname;
                localStorage.setItem('currentUser', JSON.stringify(userData));
                currentUser = userData;

                updateAuthUI();
                showLoginMessage('Вход выполнен успешно!', 'success');

                setTimeout(() => {
                    closeLoginModal();
                    if (document.getElementById('personalCabinetModal').style.display === 'block') {
                        loadPersonalCabinetData();
                    }

                    showProfileSuccess(`Добро пожаловать, ${profileData.profileName}!`);
                }, 1500);
            } else {
                showLoginMessage('Ошибка загрузки профиля', 'error');
                loginBtn.disabled = false;
                loginBtn.textContent = 'Войти';
            }
        } else {
            showLoginMessage('Неверный логин или пароль', 'error');
            loginBtn.disabled = false;
            loginBtn.textContent = 'Войти';
        }
    }, 1000);
}

function addUserToDatabase(username, userData) {
    if (!userDatabase[username]) {
        userDatabase[username] = userData;
        console.log('✅ Пользователь добавлен в базу:', username);
        return true;
    }
    console.log('⚠️ Пользователь уже существует:', username);
    return false;
}

function getAllUsersFromDatabase() {
    return Object.keys(userDatabase).map(username => ({
        username,
        ...userDatabase[username]
    }));
}

function userExistsInDatabase(username) {
    return userDatabase[username] !== undefined;
}

function loadUserProfileFromDatabase(username) {
    let userProfile = localStorage.getItem('userProfile_' + username);

    if (userProfile) {
        const profileData = JSON.parse(userProfile);
        console.log(' Загружен локальный профиль для:', username);
        return profileData;
    }

    const userDatabase = getUserDatabase();
    const userData = userDatabase[username];

    if (userData) {

        localStorage.setItem('userProfile_' + username, JSON.stringify(userData));
        console.log('📁 Загружен профиль из глобальной базы для:', username);
        return userData;
    }

    console.log('❌ Профиль не найден:', username);
    return null;
}

function showModeratorInstructions() {
    const usersWithoutPasswords = getUsersWithoutPasswords();

    console.log(`
Пользователи без паролей (${usersWithoutPasswords.length}):
${usersWithoutPasswords.map(user => `- ${user}`).join('\n')}

    `);
}
document.addEventListener('DOMContentLoaded', function () {
    setTimeout(showModeratorInstructions, 2000);
});

function openPersonalCabinetModal() {
    if (!currentUser) {
        openLoginModal();
        return;
    }

    const modal = document.getElementById('personalCabinetModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    updatePersonalCabinetHTML();
    loadPersonalCabinetData();
}

function closePersonalCabinetModal() {
    const modal = document.getElementById('personalCabinetModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function loadCabinetSocialLinks(socialLinks) {
    const container = document.getElementById('cabinetSocialLinks');
    container.innerHTML = '';

    if (socialLinks && socialLinks.length > 0) {
        socialLinks.forEach(link => {
            const socialLink = document.createElement('a');
            socialLink.href = getSocialPrefix(link.platform) + link.username;
            socialLink.target = '_blank';
            socialLink.className = 'cabinet-social-link';

            const iconSrc = getSocialIconSrc(link.platform);
            socialLink.innerHTML = `
                <img src="${iconSrc}" alt="${link.platform}" class="cabinet-social-icon">
                <span>${link.username}</span>
            `;

            container.appendChild(socialLink);
        });
    } else {
        container.innerHTML = '<p style="color: #aaa; text-align: center;">Социальные сети не добавлены</p>';
    }
}

function getSocialIconSrc(platform) {
    const icons = {
        'telegram': 'https://i.postimg.cc/cJXCqTTc/icons8-48.png',
        'tt': 'https://i.postimg.cc/sD6hSj5c/free-icon-video-13670382.png',
        'instagram': 'https://i.postimg.cc/7Lf1r6LG/image.png',
        'pinterest': 'https://i.postimg.cc/T3B57t75/icons8-pinterest-48.png',
        'youtube': 'https://i.postimg.cc/fW5tnzqN/youtube_(1).png',
        'vk': 'https://i.postimg.cc/cHhQbQ8q/image.png',
    };

    return icons[platform] || 'https://i.postimg.cc/cJXCqTTc/icons8-48.png';
}


function loadCabinetDescription(description) {
    const container = document.getElementById('cabinetDescription');

    if (description && description.trim() !== '') {
        container.innerHTML = '';
        const descriptionText = document.createElement('div');
        descriptionText.style.cssText = `
            max-height: 180px;
            overflow-y: auto;
            padding-right: 5px;
        `;

        descriptionText.innerHTML = description.replace(/\n/g, '<br>');

        container.appendChild(descriptionText);
        container.classList.remove('premium-locked');
    } else {
        container.innerHTML = `
            <div class="premium-locked">
                <div class="premium-icon"></div>
                <p class="premium-text">Описание профиля не добавлено </p>
            </div>
        `;
    }
}

function loadCabinetWorks(works) {
    const container = document.getElementById('cabinetWorksGrid');
    container.innerHTML = '';

    if (works && works.length > 0) {
        const reversedWorks = [...works].reverse();

        reversedWorks.forEach(work => {
            const workItem = document.createElement('div');
            workItem.className = 'cabinet-work-item';
            workItem.innerHTML = `<img src="${work}" alt="Работа" onclick="openCabinetFullscreenModal('${work}')">`;
            container.appendChild(workItem);
        });
    } else {
        container.innerHTML = '<p style="color: #aaa; text-align: center; grid-column: 1 / -1;">Работы не добавлены</p>';
    }
}

function openCabinetWorksModal() {
    const modal = document.getElementById('cabinetWorksModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeCabinetWorksModal() {
    const modal = document.getElementById('cabinetWorksModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}



function openCabinetFullscreenModal(workSrc) {
    const worksContainer = document.getElementById('cabinetWorksGrid');
    const workItems = worksContainer.querySelectorAll('.cabinet-work-item img');
    cabinetWorks = Array.from(workItems).map(img => img.src);
    currentCabinetWorkIndex = cabinetWorks.indexOf(workSrc);

    if (currentCabinetWorkIndex === -1) {
        currentCabinetWorkIndex = 0;
    }


    const modal = document.getElementById('cabinetFullscreenModal');
    const modalImg = document.getElementById('cabinetFullscreenImg');

    modalImg.src = cabinetWorks[currentCabinetWorkIndex];
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    updateCabinetFullscreenCounter();


    setupCabinetFullscreenModalEvents();
}


function closeCabinetFullscreenModal() {
    const modal = document.getElementById('cabinetFullscreenModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';


    removeCabinetFullscreenModalEvents();
}

function navigateCabinetWork(direction) {
    if (cabinetWorks.length === 0 || cabinetWorks.length === 1) return;

    currentCabinetWorkIndex += direction;


    if (currentCabinetWorkIndex < 0) {
        currentCabinetWorkIndex = cabinetWorks.length - 1;
    } else if (currentCabinetWorkIndex >= cabinetWorks.length) {
        currentCabinetWorkIndex = 0;
    }

    const modalImg = document.getElementById('cabinetFullscreenImg');
    modalImg.style.opacity = '0';

    setTimeout(() => {
        modalImg.src = cabinetWorks[currentCabinetWorkIndex];
        modalImg.style.opacity = '1';


        updateCabinetFullscreenCounter();
    }, 200);
}


function updateCabinetFullscreenCounter() {
    const counter = document.getElementById('cabinetFullscreenCounter');
    if (cabinetWorks.length > 1) {
        counter.textContent = `${currentCabinetWorkIndex + 1} / ${cabinetWorks.length}`;
        counter.style.display = 'block';

        document.querySelectorAll('.cabinet-fullscreen-nav').forEach(btn => {
            btn.style.display = 'flex';
        });
    } else {
        counter.style.display = 'none';


        document.querySelectorAll('.cabinet-fullscreen-nav').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}




const navigationFixStyles = `
@media (min-width: 769px) {
    .modal-nav-btn,
    .profile-works-modal-nav,
    .cabinet-fullscreen-nav {
        display: flex !important;
        align-items: center;
        justify-content: center;
    }
}

@media (max-width: 768px) {
    .modal-nav-btn,
    .profile-works-modal-nav,
    .cabinet-fullscreen-nav {
        display: none !important;
    }
}

/* Плавные переходы для изображений */
.image-modal-img,
.profile-works-modal-img,
.cabinet-fullscreen-img {
    transition: opacity 0.3s ease-in-out;
}
`;


const styleElement = document.createElement('style');
styleElement.textContent = navigationFixStyles;
document.head.appendChild(styleElement);

function setupCabinetFullscreenModalEvents() {

    if (window.innerWidth > 768) {
        document.addEventListener('keydown', handleCabinetFullscreenKeydown);
    }


    const modalContent = document.querySelector('.cabinet-fullscreen-content');
    modalContent.addEventListener('touchstart', handleCabinetFullscreenTouchStart, { passive: false });
    modalContent.addEventListener('touchmove', handleCabinetFullscreenTouchMove, { passive: false });
    modalContent.addEventListener('touchend', handleCabinetFullscreenTouchEnd);
}

function removeCabinetFullscreenModalEvents() {
    document.removeEventListener('keydown', handleCabinetFullscreenKeydown);

    const modalContent = document.querySelector('.cabinet-fullscreen-content');
    modalContent.removeEventListener('touchstart', handleCabinetFullscreenTouchStart);
    modalContent.removeEventListener('touchmove', handleCabinetFullscreenTouchMove);
    modalContent.removeEventListener('touchend', handleCabinetFullscreenTouchEnd);
}

function handleCabinetFullscreenKeydown(e) {
    if (e.key === 'Escape') {
        closeCabinetFullscreenModal();
    } else if (e.key === 'ArrowLeft') {
        navigateCabinetWork(-1);
    } else if (e.key === 'ArrowRight') {
        navigateCabinetWork(1);
    }
}

let cabinetFullscreenTouchStartX = 0;
let cabinetFullscreenTouchEndX = 0;

function handleCabinetFullscreenTouchStart(e) {
    cabinetFullscreenTouchStartX = e.touches[0].clientX;
    e.preventDefault();
}

function handleCabinetFullscreenTouchMove(e) {
    if (!cabinetFullscreenTouchStartX) return;
    cabinetFullscreenTouchEndX = e.touches[0].clientX;
    const diff = cabinetFullscreenTouchStartX - cabinetFullscreenTouchEndX;

    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
}

function handleCabinetFullscreenTouchEnd() {
    if (!cabinetFullscreenTouchStartX || !cabinetFullscreenTouchEndX) return;

    const diff = cabinetFullscreenTouchStartX - cabinetFullscreenTouchEndX;
    const threshold = 50;

    if (diff > threshold) {
        navigateCabinetWork(1);
    } else if (diff < -threshold) {
        navigateCabinetWork(-1);
    }

    cabinetFullscreenTouchStartX = 0;
    cabinetFullscreenTouchEndX = 0;
}

function editProfile() {
    closePersonalCabinetModal();
    openProfileSetupModal();
}




function isUserPublishedOnArtistOrDesign(username) {
    const publicationInfo = getPublicationPage(username);

    if (!publicationInfo) {
        return false;
    }


    return publicationInfo.page === 'artist' || publicationInfo.page === 'design';
}


function getPublicationPage(username) {
    const publicationInfo = localStorage.getItem(`publication_page_${username}`);
    return publicationInfo ? JSON.parse(publicationInfo) : null;
}

// ========== МОДАЛЬНОЕ ОКНО ПРОВЕРКИ СТРАНИЦЫ ==========

function createPageVerificationModal() {
    const userStatus = checkUserRegistrationStatus(currentUser.username);

    const modalHTML = `
        <div id="pageVerificationModal" class="registration-modal">
            <div class="registration-modal-content">
                <span class="close-modal" onclick="closePageVerificationModal()">&times;</span>

                <div class="registration-modal-header">
                    <h3 class="registration-modal-title">Подтверждение страницы</h3>
                    <p class="registration-modal-subtitle">Требуется подтверждение для редактирования профиля</p>
                </div>

                <div class="page-verification-info">
                    <h4>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="#ff9800">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Информация о вашем профиле
                    </h4>
                    <div class="user-page-info">
                        <div><strong>Страница:</strong> ${userStatus.pageDisplayName}</div>
                        <div><strong>Статус:</strong> Опубликован</div>
                    </div>
                </div>

                <form class="registration-form" onsubmit="verifyPageCode(event)">
                    <div class="form-group">
                        <label class="form-label" for="pageVerificationCode">Код подтверждения страницы:</label>
                        <input type="text" id="pageVerificationCode" class="form-input" 
                               placeholder="Введите код подтверждения" required maxlength="10" 
                               autocomplete="off" inputmode="text">
                    </div>

                    <button type="submit" class="submit-btn" id="verifyPageBtn">
                        Подтвердить и продолжить редактирование
                    </button>

                    <div id="pageVerificationMessage" class="message"></div>
                </form>

                <div class="instructions">
                    <h4 class="instructions-title">Как получить код подтверждения:</h4>
                    <ol class="instructions-list">
                        <li>Обратитесь к модераторам </li>
                        <li>Запросите код подтверждения для редактирования профиля</li>
                        <li>Введите полученный код в поле выше</li>
                        <li>Нажмите "Подтвердить и продолжить редактирование"</li>
                    </ol>
                    <p style="color: #ffcc00; margin-top: 12px; font-size: 0.85em; text-align: center;">
                        💡 Это дополнительная мера безопасности для защиты 
                    </p>
                </div>
            </div>
        </div>
    `;

    if (!document.getElementById('pageVerificationModal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }
}

document.addEventListener('DOMContentLoaded', function () {

    createPageVerificationModal();
});


function openPageVerificationModal() {
    createPageVerificationModal();

    const modal = document.getElementById('pageVerificationModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    document.getElementById('pageVerificationMessage').style.display = 'none';
    document.getElementById('pageVerificationCode').value = '';


    setTimeout(() => {
        const input = document.getElementById('pageVerificationCode');
        input.focus();

        if (document.activeElement !== input) {
            input.setAttribute('style', 'font-size: 16px;');
            setTimeout(() => input.focus(), 100);
        }
    }, 350);
}


function closePageVerificationModal() {
    const modal = document.getElementById('pageVerificationModal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
        document.body.style.width = 'auto';
    }
}


function openProfileSetupModalDirect() {
    const modal = document.getElementById('profileSetupModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    initializeProfileSetup();


    if (currentUser) {
        setTimeout(() => {
            loadExistingProfile();
        }, 100);
    }
}


function showPageVerificationMessage(text, type) {
    const messageDiv = document.getElementById('pageVerificationMessage');
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.style.display = 'block';


    if (window.innerWidth <= 768) {
        setTimeout(() => {
            messageDiv.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'nearest'
            });
        }, 100);
    }


    if (type !== 'success') {
        setTimeout(() => {
            if (messageDiv.style.display === 'block') {
                messageDiv.style.display = 'none';
            }
        }, 5000);
    }
}




function checkUserRegistrationStatus(username) {
    const publicationInfo = getPublicationPage(username);

    if (!publicationInfo) {
        return {
            isRegistered: false,
            pages: [],
            isArtistOrDesign: false
        };
    }

    const isArtistOrDesign = publicationInfo.page === 'artist' || publicationInfo.page === 'design';

    return {
        isRegistered: true,
        pages: [publicationInfo.page],
        isArtistOrDesign: isArtistOrDesign,
        pageDisplayName: getPageDisplayName(publicationInfo.page)
    };
}



const pageVerificationModalStyles = document.createElement('style');
pageVerificationModalStyles.textContent = `
    .page-verification-info {
        background: rgba(255, 152, 0, 0.1);
        padding: 15px;
        border-radius: 8px;
        margin: 15px 0;
        border-left: 3px solid #ff9800;
    }
    
    .page-verification-info h4 {
        color: #ff9800;
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
    }
    
    .user-page-info {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 10px;
        font-size: 0.9em;
    }
    
    .user-page-info div {
        padding: 5px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 4px;
        text-align: center;
    }
`;
document.head.appendChild(pageVerificationModalStyles);

// ========== ФУНКЦИИ НАСТРОЙКИ ПРОФИЛЯ ==========

function openProfileSetupModal() {
    const modal = document.getElementById('profileSetupModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    initializeProfileSetup();

    if (currentUser) {
        setTimeout(() => {
            loadExistingProfile();
        }, 100);
    }


    const passwordToggle = document.querySelector('#passwordSection .password-toggle');
    if (passwordToggle) {
        passwordToggle.classList.remove('show');
        passwordToggle.classList.add('hide');
        passwordToggle.setAttribute('title', 'Показать пароль');

        const passwordInput = document.getElementById('profilePassword');
        if (passwordInput) {
            passwordInput.type = 'password';
        }
    }
}

function openProfileSetupModal() {

    if (currentUser && isUserPublishedOnArtistOrDesign(currentUser.username)) {

        openPageVerificationModal();
        return;
    }


    const modal = document.getElementById('profileSetupModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    initializeProfileSetup();


    if (currentUser) {
        setTimeout(() => {
            loadExistingProfile();
        }, 100);
    }
}

function showModeratorPanel() {
    const pendingUsers = getPendingUsers();

    console.log(`
 Пользователей ожидает публикации: ${pendingUsers.length}
    `);

    pendingUsers.forEach((user, index) => {
        const nickname = user.id.split('_')[1];

        console.log(`
${index + 1}. ${user.name}
   ├─ User ID: ${user.id}
   ├─ Никнейм: ${nickname}
   ├─ Telegram: ${user.telegram}
   ├─ Пароль: ${user.password}
   ├─ Стиль: ${user.style}
   ├─ Работ: ${user.worksCount}
   ├─ Соц. сетей: ${user.socialCount}
   └─ Статус: ${user.hasPassword ? '✅ Пароль добавлен' : '❌ Ожидает пароль'}
   
   addUserPassword("${user.id}", "${user.password}");
   publishUserProfile("${user.id}");
        `);
    });

    if (pendingUsers.length === 0) {
        console.log('✅ Все пользователи опубликованы!');
    }


}

function unlockBasicInfoFields() {
    const nameInput = document.getElementById('profileName');
    const nicknameInput = document.getElementById('profileNickname');
    const styleSelect = document.getElementById('profileStyle');
    const customStyleInput = document.getElementById('profileCustomStyle');

    nameInput.readOnly = false;
    nicknameInput.readOnly = false;
    styleSelect.disabled = false;

    nameInput.style.backgroundColor = '';
    nameInput.style.color = '';
    nameInput.style.cursor = '';

    nicknameInput.style.backgroundColor = '';
    nicknameInput.style.color = '';
    nicknameInput.style.cursor = '';

    styleSelect.style.backgroundColor = '';
    styleSelect.style.color = '';
    styleSelect.style.cursor = '';

    customStyleInput.style.backgroundColor = '';
    customStyleInput.style.color = '';
    customStyleInput.style.cursor = '';


    removeLockedFieldHints();
}

function removeLockedFieldHints() {

    document.querySelectorAll('.locked-hint').forEach(hint => {
        hint.remove();
    });

    const infoMessage = document.querySelector('.locked-info-message');
    if (infoMessage) {
        infoMessage.remove();
    }
}


function closeProfileSetupModal() {
    const modal = document.getElementById('profileSetupModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

function initializeProfileSetup() {

    socialLinksCount = 0;
    uploadedWorksCount = 0;

    const userProfile = localStorage.getItem('userProfile_' + (currentUser ? currentUser.username : 'guest'));
    if (userProfile) {
        const profileData = JSON.parse(userProfile);


        document.getElementById('profileName').value = profileData.profileName || '';
        document.getElementById('profileNickname').value = profileData.profileNickname || '';
        document.getElementById('profileStyle').value = profileData.profileStyle || '';

        if (profileData.profileStyle === 'Другое') {
            document.getElementById('profileCustomStyle').value = profileData.profileCustomStyle || '';
            document.getElementById('profileCustomStyle').disabled = false;
        }

        document.getElementById('profileDescription').value = profileData.profileDescription || '';
        document.getElementById('profilePassword').value = profileData.userPassword || '';


        if (currentUser) {
            lockBasicInfoFields();
        }

        // Загружаем аватар
        if (profileData.avatar) {
            const preview = document.getElementById('avatarPreview');
            preview.innerHTML = `<img src="${profileData.avatar}" alt="Аватар">`;
        }

        // ЗАГРУЖАЕМ БАННЕР ПРИ РЕДАКТИРОВАНИИ
        if (profileData.banner) {
            const preview = document.getElementById('bannerPreview');
            preview.innerHTML = `<img src="${profileData.banner}" alt="Баннер">`;
        }

        // Загружаем социальные сети
        if (profileData.socialLinks && profileData.socialLinks.length > 0) {
            initializeSocialLinksWithData(profileData.socialLinks);
        }

        // Загружаем работы
        if (profileData.works && profileData.works.length > 0) {
            initializeWorksWithData(profileData.works);
        }
    } else {

        unlockBasicInfoFields();
        initializeSocialLinks();
        initializeWorks();
    }

    setupEventListeners();
    setupDynamicValidation();
    updateWorksCounter();


    setTimeout(() => {
        validateName();
        validateNickname();
        validateStyle();
        validatePassword();
        validateSocialLinks();
        validateWorks();
        validateAvatar();
        validateBanner();
        updateOverallValidation();
    }, 200);
}


function initializeSocialLinksWithData(socialLinks) {
    const container = document.getElementById('socialLinksContainer');
    container.innerHTML = '';
    socialLinksCount = 0;

    socialLinks.forEach(link => {
        addSocialLinkWithData(link.platform, link.username);
    });

    updateSocialLimitWarning();
    updateAddSocialButton();
}

function addSocialLinkWithData(platform, username) {
    if (socialLinksCount >= MAX_SOCIAL_LINKS) return;

    const container = document.getElementById('socialLinksContainer');
    const socialId = 'social_' + Date.now();

    const socialHtml = `
                <div class="social-link-input" id="${socialId}">
                    <select class="social-platform-select" onchange="updateSocialLinkPrefix(this)">
                        <option value="telegram" ${platform === 'telegram' ? 'selected' : ''}>Telegram</option>
                        <option value="tiktok" ${platform === 'tt' ? 'selected' : ''}>Tik Tok</option>
                        <option value="vk" ${platform === 'vk' ? 'selected' : ''}>VK</option>
                        <option value="instagram" ${platform === 'instagram' ? 'selected' : ''}>Instagram</option>
                        <option value="pinterest" ${platform === 'pinterest' ? 'selected' : ''}>Pinterest</option>
                        <option value="youtube" ${platform === 'youtube' ? 'selected' : ''}>YouTube</option>
                        
                    </select>
                    <div class="social-link-input-group">
                        <span class="social-link-prefix" id="${socialId}_prefix">${getSocialPrefix(platform)}</span>
                        <input type="text" class="form-input social-link-input-field" 
                               placeholder="username" value="${username || ''}"
                               oninput="validateSocialLink(this)">
                    </div>
                    <button type="button" class="remove-btn" onclick="removeSocialLink('${socialId}')">Удалить</button>
                </div>
            `;

    container.insertAdjacentHTML('beforeend', socialHtml);
    socialLinksCount++;
    updateSocialLimitWarning();
    updateAddSocialButton();
}

function initializeWorksWithData(works) {
    const container = document.getElementById('worksContainer');
    container.innerHTML = '';
    uploadedWorksCount = 0;


    const reversedWorks = [...works].reverse();

    reversedWorks.forEach(workSrc => {
        addWorkWithData(workSrc);
    });

    updateWorksCounter();
    updateAddWorkButton();
}

function addWorkWithData(workSrc) {
    if (uploadedWorksCount >= MAX_WORKS) return;

    const container = document.getElementById('worksContainer');
    const workId = 'work_' + Date.now();

    const workHtml = `
        <div class="work-link-preview" id="${workId}">
            <img src="${workSrc}" alt="Работа" onerror="handleImageError(this, 'work')" onclick="openProfileWorksModal('${workId}')">
            <button type="button" class="remove-btn" onclick="removeWork('${workId}')" style="position: absolute; top: 5px; right: 5px; padding: 2px 6px;">×</button>
        </div>
    `;

    container.insertAdjacentHTML('afterbegin', workHtml);
    uploadedWorksCount++;
    updateWorksCounter();
    updateAddWorkButton();
}

function initializeSocialLinks() {
    const container = document.getElementById('socialLinksContainer');
    container.innerHTML = '';
    socialLinksCount = 0;
    updateSocialLimitWarning();
    updateAddSocialButton();
}

function initializeWorks() {
    const container = document.getElementById('worksContainer');
    container.innerHTML = '';
    uploadedWorksCount = 0;
}

function setupEventListeners() {

    document.getElementById('profileStyle').addEventListener('change', function () {
        const customStyleInput = document.getElementById('profileCustomStyle');
        if (this.value === 'Другое') {
            customStyleInput.disabled = false;
            customStyleInput.required = true;
        } else {
            customStyleInput.disabled = true;
            customStyleInput.required = false;
            customStyleInput.value = '';
        }
    });


    document.getElementById('profileSetupForm').addEventListener('submit', saveProfile);


    document.getElementById('workLinkInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            addWorkFromLink();
        }
    });


    document.getElementById('avatarLinkInput').addEventListener('keypress', function (event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            loadAvatarFromLink();
        }
    });
}

function addSocialLink() {
    if (socialLinksCount >= MAX_SOCIAL_LINKS) {
        showSocialLimitWarning();
        return;
    }

    const container = document.getElementById('socialLinksContainer');
    const socialId = 'social_' + Date.now();

    const socialHtml = `
        <div class="social-link-input" id="${socialId}">
            <select class="social-platform-select" onchange="updateSocialLinkPrefix(this)">
                <option value="telegram">Telegram</option>
                <option value="vk">VK</option>
                <option value="tiktok">Tik Tok</option>
                <option value="instagram">Instagram</option>
                <option value="pinterest">Pinterest</option>
                <option value="youtube">YouTube</option>
            </select>
            <div class="social-link-input-group">
                <span class="social-link-prefix" id="${socialId}_prefix">https://t.me/</span>
                <input type="text" class="form-input social-link-input-field" 
                       placeholder="username" 
                       oninput="validateSocialLink(this); validateSocialLinks(); updateOverallValidation();">
            </div>
            <button type="button" class="remove-btn" onclick="removeSocialLink('${socialId}')">Удалить</button>
        </div>
    `;

    container.insertAdjacentHTML('beforeend', socialHtml);
    socialLinksCount++;
    updateSocialLimitWarning();
    updateAddSocialButton();


    setTimeout(() => {
        validateSocialLinks();
        updateOverallValidation();
    }, 100);
}


function updateSocialLinkPrefix(selectElement) {
    const platform = selectElement.value;
    const socialInput = selectElement.closest('.social-link-input');
    const prefixElement = socialInput.querySelector('.social-link-prefix');

    const prefixes = {
        'telegram': 'https://t.me/',
        'tik tok': 'https://www.tiktok.com/',
        'vk': 'https://vk.com/',
        'instagram': 'https://instagram.com/',
        'pinterest': 'https://pinterest.com/',
        'youtube': 'https://youtube.com/',

    };

    prefixElement.textContent = prefixes[platform] || 'https://';
}

function validateSocialLink(inputElement) {
    const socialInput = inputElement.closest('.social-link-input');
    const platformSelect = socialInput.querySelector('.social-platform-select');
    const platform = platformSelect.value;
    let value = inputElement.value.trim();

    if (!value) {
        inputElement.style.borderColor = '#444';
        return;
    }

    // Очищаем значение для валидации
    const prefixes = {
        'telegram': ['https://t.me/', 't.me/', '@'],
        'instagram': ['https://instagram.com/', 'instagram.com/', '@'],
        'pinterest': ['https://pinterest.com/', 'pinterest.com/'],
        'youtube': ['https://youtube.com/', 'youtube.com/', '@'],
        'vk': ['https://vk.com/', 'vk.com/'],
        'tiktok': ['https://www.tiktok.com/@', 'tiktok.com/@', '@']
    };

    const platformPrefixes = prefixes[platform] || [];
    let cleanedValue = value;
    platformPrefixes.forEach(prefix => {
        if (cleanedValue.startsWith(prefix)) {
            cleanedValue = cleanedValue.substring(prefix.length);
        }
    });
    cleanedValue = cleanedValue.replace(/\/+$/, '');

    const patterns = {
        'telegram': /^[a-zA-Z0-9_]{5,32}$/,
        'instagram': /^[a-zA-Z0-9._]{1,30}$/,
        'pinterest': /^[a-zA-Z0-9._-]{3,30}$/,
        'youtube': /^[a-zA-Z0-9._-]{3,30}$/,
        'artstation': /^[a-zA-Z0-9_-]{3,30}$/,
        'behance': /^[a-zA-Z0-9_-]{3,30}$/,
        'vk': /^[a-zA-Z0-9._-]{3,30}$/,
        'tiktok': /^[a-zA-Z0-9._-]{3,30}$/
    };

    const pattern = patterns[platform];
    if (pattern && pattern.test(cleanedValue)) {
        inputElement.style.borderColor = '#4CAF50';


        if (cleanedValue !== value) {
            inputElement.value = cleanedValue;
        }
    } else {
        inputElement.style.borderColor = '#f44336';
    }
}

function removeSocialLink(socialId) {
    const element = document.getElementById(socialId);
    if (element) {
        element.remove();
        socialLinksCount--;
        updateSocialLimitWarning();
        updateAddSocialButton();


        setTimeout(() => {
            validateSocialLinks();
            updateOverallValidation();
        }, 100);
    }
}

function updateSocialLimitWarning() {
    const warning = document.getElementById('socialLimitWarning');
    const socialCounter = document.getElementById('socialCounter');

    if (socialLinksCount === 0) {
        warning.classList.add('show');
        warning.innerHTML = '✗ <strong>Обязательно:</strong> Добавьте хотя бы одну социальную сеть';
        warning.style.color = '#ff6b6b';
    } else {
        warning.classList.remove('show');
    }


    if (socialCounter) {
        socialCounter.innerHTML = socialLinksCount === 0
            ? `<span style="color: #ff6b6b;">Обязательно: минимум 1 соцсеть | Добавлено: 0</span>`
            : `Добавлено: ${socialLinksCount} соцсетей`;
    }
}

function updateAddSocialButton() {
    const button = document.getElementById('addSocialBtn');
    if (socialLinksCount >= MAX_SOCIAL_LINKS) {
        button.classList.add('disabled');
        button.disabled = true;
        button.textContent = 'Максимум 6 социальных сетей';
    } else {
        button.classList.remove('disabled');
        button.disabled = false;
        button.textContent = '+ Добавить социальную сеть';
    }
}

function showSocialLimitWarning() {
    const warning = document.getElementById('socialLimitWarning');
    warning.innerHTML = `✗ <strong>Достигнут лимит:</strong> Максимум ${MAX_SOCIAL_LINKS} социальных сетей`;
    warning.classList.add('show');

    warning.style.animation = 'none';
    setTimeout(() => {
        warning.style.animation = 'shake 0.5s ease-in-out';
    }, 10);

    setTimeout(() => {
        warning.classList.remove('show');
    }, 3000);
}

function loadAvatarFromLink() {
    const linkInput = document.getElementById('avatarLinkInput');
    const link = linkInput.value.trim();

    if (!link) {
        alert('Пожалуйста, введите ссылку на изображение');
        return;
    }

    if (!isValidImageUrl(link)) {
        alert('Пожалуйста, введите корректную ссылку на изображение');
        return;
    }

    const preview = document.getElementById('avatarPreview');
    preview.innerHTML = `<img src="${link}" alt="Аватар" onerror="handleImageError(this, 'avatar')">`;


    linkInput.value = '';

    showAvatarSuccess();


    setTimeout(() => {
        validateAvatar();
        updateOverallValidation();
    }, 100);
}

function addWorkFromLink() {
    if (uploadedWorksCount >= MAX_WORKS) {
        showWorksLimitWarning();
        return;
    }

    const linkInput = document.getElementById('workLinkInput');
    const link = linkInput.value.trim();

    if (!link) {
        alert('Пожалуйста, введите ссылку на изображение');
        return;
    }

    if (!isValidImageUrl(link)) {
        alert('Пожалуйста, введите корректную ссылку на изображение');
        return;
    }

    const container = document.getElementById('worksContainer');
    const workId = 'work_' + Date.now();

    const workHtml = `
        <div class="work-link-preview" id="${workId}">
            <img src="${link}" alt="Работа" onerror="handleImageError(this, 'work')" onclick="openProfileWorksModal('${workId}')">
            <button type="button" class="remove-btn" onclick="removeWork('${workId}')" style="position: absolute; top: 5px; right: 5px; padding: 2px 6px;">×</button>
        </div>
    `;

    container.insertAdjacentHTML('afterbegin', workHtml);
    uploadedWorksCount++;
    updateWorksCounter();


    linkInput.value = '';


    updateAddWorkButton();


    setTimeout(() => {
        validateWorks();
        updateOverallValidation();
    }, 100);
}

function isValidImageUrl(url) {

    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp'];
    const urlLower = url.toLowerCase();


    const hasImageExtension = imageExtensions.some(ext => urlLower.includes(ext));


    try {
        new URL(url);
        return hasImageExtension;
    } catch {
        return false;
    }
}

function handleImageError(imgElement, type) {
    if (type === 'work') {

        const workId = imgElement.closest('.work-link-preview').id;
        removeWork(workId);
        alert('Не удалось загрузить изображение. Проверьте ссылку и попробуйте снова.');
    } else if (type === 'avatar') {

        const preview = document.getElementById('avatarPreview');
        preview.innerHTML = '<div class="avatar-placeholder">Аватар не выбран</div>';
        alert('Не удалось загрузить аватар. Проверьте ссылку и попробуйте снова.');
    }
}

function removeWork(workId) {
    const preview = document.getElementById(workId);
    if (preview) {
        preview.remove();
        uploadedWorksCount--;
        updateWorksCounter();
        updateAddWorkButton();

        setTimeout(() => {
            validateWorks();
            updateOverallValidation();
        }, 100);
    }
}

function updateWorksCounter() {
    const counter = document.getElementById('worksCounter');
    counter.textContent = `Добавлено: ${uploadedWorksCount} работ`;
    counter.classList.remove('warning', 'error');
}

function updateAddWorkButton() {
    const button = document.getElementById('addWorkLinkBtn');

    button.classList.remove('disabled');
    button.disabled = false;
}

function showWorksLimitWarning() {
    alert(`Максимальное количество работ в бесплатном профиле: ${MAX_WORKS}`);
}

function showAvatarSuccess() {

    const preview = document.getElementById('avatarPreview');
    const originalBorder = preview.style.border;

    preview.style.border = '3px solid #4CAF50';
    setTimeout(() => {
        preview.style.border = originalBorder || '3px solid #ffcc00';
    }, 2000);
}

function validatePassword(password) {
    const lengthReq = document.getElementById('reqLength');
    const charsReq = document.getElementById('reqChars');


    const isValidLength = password.length >= 6 && password.length <= 12;
    if (isValidLength) {
        lengthReq.classList.add('valid');
        lengthReq.classList.remove('invalid');
    } else {
        lengthReq.classList.remove('valid');
        lengthReq.classList.add('invalid');
    }


    const isValidChars = /^[a-zA-Z0-9]+$/.test(password);
    if (isValidChars) {
        charsReq.classList.add('valid');
        charsReq.classList.remove('invalid');
    } else {
        charsReq.classList.remove('valid');
        charsReq.classList.add('invalid');
    }

    return isValidLength && isValidChars;
}


function togglePasswordVisibility() {
    const passwordInput = document.getElementById('profilePassword');
    const toggleButton = document.querySelector('#passwordSection .password-toggle');

    if (passwordInput.type === 'password') {

        passwordInput.type = 'text';
        toggleButton.classList.remove('hide');
        toggleButton.classList.add('show');
        toggleButton.setAttribute('title', 'Скрыть пароль');
    } else {

        passwordInput.type = 'password';
        toggleButton.classList.remove('show');
        toggleButton.classList.add('hide');
        toggleButton.setAttribute('title', 'Показать пароль');
    }


    passwordInput.focus();
}


function saveProfile(event) {
    event.preventDefault();

    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохранение...';


    const password = document.getElementById('profilePassword').value;
    if (!validatePassword(password)) {
        alert('Пожалуйста, проверьте требования к паролю:\n- От 6 до 12 символов\n- Только английские буквы и цифры');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }


    const profileData = {
        profileName: document.getElementById('profileName').value,
        profileNickname: document.getElementById('profileNickname').value,
        profileStyle: document.getElementById('profileStyle').value === 'Другое'
            ? document.getElementById('profileCustomStyle').value
            : document.getElementById('profileStyle').value,
        profileCustomStyle: document.getElementById('profileStyle').value === 'Другое'
            ? document.getElementById('profileCustomStyle').value
            : '',
        profileDescription: document.getElementById('profileDescription').value,
        profilePassword: password,
        avatar: getAvatarSrc(),
        socialLinks: collectSocialLinks(),
        works: collectWorks(),
        lastUpdated: new Date().toISOString()
    };


    const username = 'user_' + Math.random().toString(36).substring(2, 8);


    localStorage.setItem('userProfile_' + username, JSON.stringify(profileData));


    const userData = {
        username: username,
        password: profileData.profilePassword,
        profileComplete: true,
        profileName: profileData.profileName
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('user_' + username, JSON.stringify(userData));


    currentUser = userData;


    updateAuthUI();


    const profileCode = generateProfileCode(profileData);


    setTimeout(() => {
        showProfileSuccess('Профиль успешно сохранен!');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';


        setTimeout(() => {
            closeProfileSetupModal();
            openCodeModal(profileCode);
        }, 1500);
    }, 1500);
}

function loadCabinetFromDatabase(userData) {



    document.getElementById('cabinetAvatar').src = userData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg';
    document.getElementById('cabinetUsername').textContent = userData.profileName || currentUser.username;


    document.getElementById('cabinetUserId').textContent = 'ID: ' + currentUser.username;




    setupIdCopyFunctionality();
}



function generateProfileCode(profileData, username, userPassword) {

    const profileId = profileData.profileName.toLowerCase().replace(/\s+/g, '');


    let publicationPage = 'prem_artist';
    if (profileData.profileStyle && profileData.profileStyle.toLowerCase().includes('дизайн')) {
        publicationPage = 'design';
    }
    if (profileData.isPrem) {
        publicationPage = 'artist';
    }


    const bannerUrl = profileData.banner || '';


    const premProfileStyle = bannerUrl
        ? `style="background-image: linear-gradient(to right, rgba(30, 30, 30, 0.85), rgba(30, 30, 30, 0.9)), url('${bannerUrl}')"`
        : '';

    // ВАРИАНТ 1: Обычный профиль (максимум 3 соцсети и 20 работ)
    const socialLinksHtml1 = generateSocialLinksHtml(profileData.socialLinks, 3);
    const worksHtml1 = generateWorksHtml(profileData.works, 20);

    // ВАРИАНТ 2: Prem профиль (все доступные соцсети и все работы)
    const socialLinksHtml2 = generateSocialLinksHtml(profileData.socialLinks, Infinity);
    const worksHtml2 = generateWorksHtml(profileData.works, Infinity);

    // ВАРИАНТ 3: Отдельная страница
    const profileCardHtml = generateProfileCardHtml(profileData);


    const profileCode = `<!-- 

ИНФОРМАЦИЯ ДЛЯ МОДЕРАТОРА:         
║ User ID: ${username}
║ Пароль: ${userPassword}
║ Имя: ${profileData.profileName}
║ Telegram: @${profileData.profileNickname}
║ Стиль: ${profileData.profileStyle}
║ Рекомендуемая страница: ${getPageDisplayName(publicationPage)}
║ Кол-во работ: ${profileData.works ? profileData.works.length : 0}
║ Кол-во соц. сетей: ${profileData.socialLinks ? profileData.socialLinks.length : 0}

// Добавление пароля в систему
addUserPassword("${username}", "${userPassword}");

// Публикация профиля (автоматически определит страницу)
publishUserProfile("${username}");

// Или публикация на конкретной странице:
publishUserProfileOnPage("${username}", "${publicationPage}");

<!--  ВАРИАНТ 1 -->

<!-- ${profileData.profileName} -->
<section id="${profileId}">
    <section class="profile-section" data-style="${profileData.profileStyle}">
        <img src="${profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg'}" alt="Аватар" class="avatar">
        <div class="profile-info">
            <h1>${profileData.profileName}</h1>
            <a href="https://t.me/${profileData.profileNickname.replace('@', '')}" class="profile-link">
                <img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Telegram" class="profile-link-icon"> 
                @${profileData.profileNickname}
            </a>
            <p>Стиль: ${profileData.profileStyle}</p>
            <div class="social-links">
${socialLinksHtml1}            </div>
        </div>
    </section>

    <h2 class="favorite-works">Публикации автора</h2>
    <div class="works-carousel" id="artist${profileId}Carousel">
        <div class="works-inner" id="artist${profileId}Works">
${worksHtml1}        </div>
        <button class="works-control prev" onclick="prevWork('artist${profileId}Works')">&#10094;</button>
        <button class="works-control next" onclick="nextWork('artist${profileId}Works')">&#10095;</button>
    </div>
    <button class="show-works-btn" onclick="openModal('modal${profileId}')">Ознакомиться со всеми работами</button>

    <!-- Modal -->
    <div id="modal${profileId}" class="modal">
        <span class="close-btn" onclick="closeModal('modal${profileId}')">&times;</span>
        <div class="modal-header">
            <h2>Галерея работ</h2>
        </div>
        <div class="modal-content">
${generateModalWorksHtml(profileData.works, 20)}        </div>
    </div>
</section>

<!--  ВАРИАНТ 2 -->

<!-- ${profileData.profileName} Prem -->
<section id="${profileId}_prem">
    <section class="profile-section" data-style="${profileData.profileStyle}" data-prem="true"
        ${premProfileStyle}>
        <div class="avatar-container" onclick="window.location.href='../Prem/${profileData.profileName.toLowerCase().replace(/\s+/g, '')}.html'">
            <div class="avatar-border"></div>
            <img src="${profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg'}" alt="Аватар" class="avatar">
            <div class="profile-button"> Профиль</div>
        </div>

        <div class="profile-info">
            <h1>${profileData.profileName}</h1>
            <a href="https://t.me/${profileData.profileNickname.replace('@', '')}" class="profile-link">
                <img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Telegram" class="profile-link-icon">
                @${profileData.profileNickname}
            </a>
            <p>Стиль: ${profileData.profileStyle}</p>
            <div class="social-links">
${socialLinksHtml2}            </div>
        </div>
    </section>

    <h2 class="favorite-works">Публикации автора</h2>
    <div class="works-carousel" id="artist${profileId}PremCarousel">
        <div class="works-inner" id="artist${profileId}PremWorks">
${worksHtml2}        </div>
        <button class="works-control prev" onclick="prevWork('artist${profileId}PremWorks')">&#10094;</button>
        <button class="works-control next" onclick="nextWork('artist${profileId}PremWorks')">&#10095;</button>
    </div>
    <button class="show-works-btn" onclick="openModal('modal${profileId}Prem')">Ознакомиться со всеми работами</button>

    <!-- Modal -->
    <div id="modal${profileId}Prem" class="modal">
        <span class="close-btn" onclick="closeModal('modal${profileId}Prem')">&times;</span>
        <div class="modal-header">
            <h2>Галерея работ</h2>
        </div>
        <div class="modal-content">
${generateModalWorksHtml(profileData.works, Infinity)}        </div>
    </div>
</section>

<!--  ВАРИАНТ 3 -->

<!-- Карточка профиля ${profileData.profileName} -->
<div class="profile-card">
    <div class="profile-header"
        style="background: url('${bannerUrl || profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg'}') center/cover no-repeat">
        <div class="header-overlay"></div>
    </div>
    <div class="profile-content">
        <div class="avatar-container">
            <div class="avatar-border"></div>
            <img src="${profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg'}" alt="Аватар"
                class="avatar">
        </div>
        <div class="profile-info">
            <h1 class="profile-name">${profileData.profileName}</h1>
            <a href="https://t.me/${profileData.profileNickname.replace('@', '')}" class="profile-link">
                @${profileData.profileNickname}
                <img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Telegram" class="profile-link-icon">
            </a>
            <p class="profile-bio">Стиль: ${profileData.profileStyle}</p>

            <div class="profile-badges">
                <span class="badge pro"><i class="fas fa-star"></i> Prem Artist</span>
            </div>

            <div class="social-links">
${generateProfileCardSocialLinks(profileData.socialLinks)}            </div>
        </div>
    </div>
</div>

<!-- Tabs section -->
<div class="tabs-container">
    <div class="tabs-header">
        <button class="tab-btn active" onclick="openTab(event, 'tab1')">Работы</button>
        <button class="tab-btn" onclick="openTab(event, 'tab2')">Обо мне</button>
    </div>

    <div id="tab1" class="tab-content active">
        <div class="works-header">
            <h3>
                <i class="fas fa-palette"></i> Мои работы
            </h3>
        </div>

        <p class="gallery-description">Здесь представлены мои последние работы. Кликните на изображение для
            просмотра в полном размере.</p>

        <div class="gallery-grid" id="galleryGrid">
${generateProfileCardWorks(profileData.works)}        </div>
    </div>

    <div id="tab2" class="tab-content">
        <p>${safeHtml(profileData.profileDescription) || 'Описание профиля пока не добавлено.'}</p>
    </div>
</div>

// ВАРИАНТ 4 //
"${username}": {
        username: "${username}",
        profileName: "${profileData.profileName}",
        profileNickname: "${profileData.profileNickname.replace('@', '')}",
        profileStyle: "${profileData.profileStyle}",
        avatar: "${profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg'}",
        banner: "${bannerUrl}",
        socialLinks: [
            ${profileData.socialLinks ? profileData.socialLinks.map(link =>
        `{ platform: "${link.platform}", username: "${link.username}" }`
    ).join(',\n            ') : '{ platform: "telegram", username: "' + profileData.profileNickname.replace('@', '') + '" }'}
        ],
        works: [
            ${profileData.works ? profileData.works.map(work =>
        `"${work}"`
    ).join(',\n            ') : '""'}
        ],
        publishedOn: "${publicationPage}",
        password: "${userPassword}",
        profileDescription: "${profileData.profileDescription || ''}",
        basicInfoLocked: true,
        lastUpdated: "${new Date().toISOString()}"
    }
},`;

    return profileCode;
}


function generateProfileCardHtml(profileData) {
    const bannerUrl = profileData.banner || profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg';

    return `
<!-- Карточка профиля ${profileData.profileName} -->
<div class="profile-card">
    <div class="profile-header"
        style="background: url('${bannerUrl}') center/cover no-repeat">
        <div class="header-overlay"></div>
    </div>
    <div class="profile-content">
        <div class="avatar-container">
            <div class="avatar-border"></div>
            <img src="${profileData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg'}" alt="Аватар"
                class="avatar">
        </div>
        <div class="profile-info">
            <h1 class="profile-name">${profileData.profileName}</h1>
            <a href="https://t.me/${profileData.profileNickname.replace('@', '')}" class="profile-link">
                @${profileData.profileNickname}
                <img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Telegram" class="profile-link-icon">
            </a>
            <p class="profile-bio">Стиль: ${profileData.profileStyle}</p>

            <div class="profile-badges">
                <span class="badge pro"><i class="fas fa-star"></i> Prem Artist</span>
            </div>

            <div class="social-links">
${generateProfileCardSocialLinks(profileData.socialLinks)}            </div>
        </div>
    </div>
</div>

<!-- Tabs section -->
<div class="tabs-container">
    <div class="tabs-header">
        <button class="tab-btn active" onclick="openTab(event, 'tab1')">Работы</button>
        <button class="tab-btn" onclick="openTab(event, 'tab2')">Обо мне</button>
    </div>

    <div id="tab1" class="tab-content active">
        <div class="works-header">
            <h3>
                <i class="fas fa-palette"></i> Мои работы
            </h3>
        </div>

        <p class="gallery-description">Здесь представлены мои последние работы. Кликните на изображение для
            просмотра в полном размере.</p>

        <div class="gallery-grid" id="galleryGrid">
${generateProfileCardWorks(profileData.works)}        </div>
    </div>

    <div id="tab2" class="tab-content">
        <p>${profileData.profileDescription || 'Описание профиля пока не добавлено.'}</p>
    </div>
</div>`;
}


function generateProfileCardWorks(works) {
    if (!works || works.length === 0) {
        return '            <!-- Работы не добавлены -->\n';
    }

    let worksHtml = '';
    const limitedWorks = works.slice(0, 12);

    limitedWorks.forEach((work, index) => {
        worksHtml += `            <!-- Работа ${index + 1} -->
            <div class="gallery-item" 
                onclick="openModal('${work}', this, true)">
                <img src="${work}" alt="Работа ${index + 1}">
            </div>\n`;
    });

    return worksHtml;
}


function generateProfileCardSocialLinks(socialLinks) {
    if (!socialLinks || socialLinks.length === 0) {
        return '                <!-- Социальные сети не добавлены -->\n';
    }

    let socialLinksHtml = '';

    socialLinks.forEach(link => {
        const socialIcon = getProfileCardSocialIcon(link.platform);
        socialLinksHtml += `                <a href="${getSocialPrefix(link.platform)}${link.username}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${link.platform}">
                    ${socialIcon}
                </a>\n`;
    });

    return socialLinksHtml;
}


function getProfileCardSocialIcon(platform) {
    const icons = {
        'telegram': '<img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Telegram" width="32" height="32" loading="lazy" class="social-icon">',
        'instagram': '<img src="https://i.postimg.cc/8zq7J7J7/icons8-instagram-48.png" alt="Instagram" width="32" height="32" loading="lazy" class="social-icon">',
        'pinterest': '<img src="https://i.postimg.cc/T3B57t75/icons8-pinterest-48.png" alt="Pinterest" width="32" height="32" loading="lazy" class="social-icon">',
        'youtube': '<img src="https://i.postimg.cc/fW5tnzqN/youtube_(1).png" alt="YouTube" width="32" height="32" loading="lazy" class="social-icon">',
        'artstation': '<img src="https://i.postimg.cc/8C3Q3Q3Q/icons8-artstation-48.png" alt="ArtStation" width="32" height="32" loading="lazy" class="social-icon">',
        'behance': '<img src="https://i.postimg.cc/8C3Q3Q3Q/icons8-behance-48.png" alt="Behance" width="32" height="32" loading="lazy" class="social-icon">',
        'vk': '<img src="https://i.postimg.cc/cHhQbQ8q/image.png" alt="VK" width="32" height="32" loading="lazy" class="social-icon">',
        'tiktok': '<img src="https://i.postimg.cc/sD6hSj5c/free-icon-video-13670382.png" alt="TikTok" width="32" height="32" loading="lazy" class="social-icon">'
    };

    return icons[platform] || '<img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Social" width="32" height="32" loading="lazy" class="social-icon">';
}


function generateModalWorksHtml(works, maxCount) {
    if (!works || works.length === 0) {
        return '            <!-- Работы не добавлены -->\n';
    }

    let modalWorksHtml = '';
    const limitedWorks = maxCount === Infinity ? works : works.slice(0, maxCount);


    limitedWorks.forEach((work, index) => {
        modalWorksHtml += `            <img src="${work}" class="modal-img" alt="Работа ${index + 1}">\n`;
    });

    return modalWorksHtml;
}





function generateSocialLinksHtml(socialLinks, maxCount) {
    if (!socialLinks || socialLinks.length === 0) {
        return '                <!-- Социальные сети не добавлены -->\n';
    }

    let socialLinksHtml = '';
    const limitedLinks = maxCount === Infinity ? socialLinks : socialLinks.slice(0, maxCount);

    limitedLinks.forEach(link => {
        const socialIcon = getSocialIcon(link.platform);
        socialLinksHtml += `                <a href="${getSocialPrefix(link.platform)}${link.username}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${link.platform}">
                    ${socialIcon}
                </a>\n`;
    });

    return socialLinksHtml;
}


function generateWorksHtml(works, maxCount) {
    if (!works || works.length === 0) {
        return '            <!-- Работы не добавлены -->\n';
    }

    let worksHtml = '';
    const limitedWorks = maxCount === Infinity ? works : works.slice(0, maxCount);


    limitedWorks.forEach((work, index) => {
        let workClass = 'work-thumb-3';
        if (index % 3 === 0) workClass = 'work-thumb-1';
        else if (index % 3 === 1) workClass = 'work-thumb-2';

        worksHtml += `            <img src="${work}" class="${workClass}" alt="Работа ${index + 1}">\n`;
    });

    return worksHtml;
}


function getSocialIcon(platform) {
    const icons = {
        'telegram': '<img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Telegram" class="social-icon">',
        'instagram': '<img src="https://i.postimg.cc/8zq7J7J7/icons8-instagram-48.png" alt="Instagram" class="social-icon">',
        'pinterest': '<img src="https://i.postimg.cc/T3B57t75/icons8-pinterest-48.png" alt="Pinterest" class="social-icon">',
        'youtube': '<img src="https://i.postimg.cc/fW5tnzqN/youtube_(1).png" alt="YouTube" class="social-icon">',
        'artstation': '<img src="https://i.postimg.cc/8C3Q3Q3Q/icons8-artstation-48.png" alt="ArtStation" class="social-icon">',
        'behance': '<img src="https://i.postimg.cc/8C3Q3Q3Q/icons8-behance-48.png" alt="Behance" class="social-icon">',
        'vk': '<img src="https://i.postimg.cc/cHhQbQ8q/image.png" alt="VK" class="social-icon">',
        'tiktok': '<img src="https://i.postimg.cc/sD6hSj5c/free-icon-video-13670382.png" alt="TikTok" class="social-icon">'
    };

    return icons[platform] || '<img src="https://i.postimg.cc/cJXCqTTc/icons8-48.png" alt="Social" class="social-icon">';
}


function openCodeModal(profileCode, username, userPassword, isExistingUser = false) {
    const modal = document.getElementById('codeModal');
    const codeText = document.getElementById('profileCodeText');

    codeText.textContent = profileCode;
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    const instructionsBox = modal.querySelector('.instructions-box');
    if (instructionsBox) {
        if (isExistingUser) {
            instructionsBox.innerHTML = `
                <h4 class="instructions-title">Обновление профиля</h4>
                <div style="background: rgba(33, 150, 243, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #2196F3;">
                    <div style="text-align: center; color: #2196F3; font-weight: bold; margin-bottom: 10px;">
                        ✓ Профиль успешно обновлен!
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                        <div><strong>User ID:</strong> ${username}</div>
                        <div><strong>Пароль:</strong> ${userPassword}</div>
                        <div><strong>Никнейм:</strong> ${username.split('_')[1]}</div>
                    </div>
                </div>
                
                <div style="background: rgba(76, 175, 80, 0.1); padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #4CAF50;">
                    <p style="color: #e0e0e0; font-size: 0.9em; margin: 0; text-align: center;">
                        Ваш ID остался прежним. Вы можете продолжать использовать те же данные для входа.
                    </p>
                </div>
            `;
        } else {
            instructionsBox.innerHTML = `
                <h4 class="instructions-title">📋 Информация для модератора</h4>
                <div style="background: rgba(255, 152, 0, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #ff9800;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                        <div><strong>User ID:</strong> ${username}</div>
                        <div><strong>Пароль:</strong> ${userPassword}</div>
                        <div><strong>Логин для входа:</strong> ${username}</div>
                     
                    </div>
                </div>
                
                <h4 class="instructions-title"> Что делать дальше:</h4>
                <ol class="instructions-list">
                    <li>Нажмите кнопку "Скопировать код" выше</li>
                    <li>Отправьте код модераторам в Telegram</li>
                    <li>После добавления пароля профиль будет опубликован</li>
                    <li>Вы сможете войти используя:<br>
                        <strong>Логин:</strong> ${username}<br>
                        <strong>Пароль:</strong> ${userPassword}
                    </li>
                </ol>
                
                <div style="background: rgba(76, 175, 80, 0.1); padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #4CAF50;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #4CAF50; font-weight: bold; margin-bottom: 5px;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Постоянный ID активирован!
                    </div>
                    <p style="color: #e0e0e0; font-size: 0.9em; margin: 0;">
                        Ваш ID закреплен за никнеймом.
                    </p>
                </div>
            `;
        }
    }
}


function publishUserProfileOnPage(username, page) {
    savePublicationPage(username, page);
    localStorage.setItem('profilePublished_' + username, 'true');

    console.log(`✓ Профиль ${username} опубликован на странице: ${getPageDisplayName(page)}`);
    return page;
}


function getPublishedProfilesOnCurrentPage() {
    const currentPage = getCurrentPage();
    const publishedProfiles = [];


    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profile_page_')) {
            const username = key.replace('profile_page_', '');
            const publicationInfo = getPublicationPage(username);

            if (publicationInfo && publicationInfo.page === currentPage) {
                const userProfile = localStorage.getItem('userProfile_' + username);
                if (userProfile) {
                    publishedProfiles.push({
                        username: username,
                        profileData: JSON.parse(userProfile),
                        publicationInfo: publicationInfo
                    });
                }
            }
        }
    });

    return publishedProfiles;
}


function showPublicationInfo() {
    const currentPage = getCurrentPage();
    const publishedProfiles = getPublishedProfilesOnCurrentPage();

    console.log(`📊 Статистика публикаций на странице: ${getPageDisplayName(currentPage)}`);
    console.log(`📈 Опубликовано профилей: ${publishedProfiles.length}`);

    publishedProfiles.forEach((profile, index) => {
        console.log(`
${index + 1}. ${profile.profileData.profileName}
   ├─ User ID: ${profile.username}
   ├─ Telegram: @${profile.profileData.profileNickname}
   ├─ Стиль: ${profile.profileData.profileStyle}
   ├─ Дата публикации: ${new Date(profile.publicationInfo.timestamp).toLocaleDateString('ru-RU')}
   └─ Статус: ✅ Опубликован
        `);
    });
}




function loadExistingProfile() {
    if (!currentUser) return;


    const userProfile = loadUserProfileFromDatabase(currentUser.username);

    if (userProfile) {
        console.log('📁 Загружаем', userProfile);

        // Заполняем форму данными профиля
        document.getElementById('profileName').value = userProfile.profileName || '';
        document.getElementById('profileNickname').value = userProfile.profileNickname || '';

        // Устанавливаем специальность
        if (userProfile.profileStyle) {
            const styleSelect = document.getElementById('profileStyle');
            const isStandardStyle = Array.from(styleSelect.options).some(option =>
                option.value === userProfile.profileStyle
            );

            if (isStandardStyle) {
                styleSelect.value = userProfile.profileStyle;
            } else {
                styleSelect.value = 'Другое';
                document.getElementById('profileCustomStyle').value = userProfile.profileStyle || '';
                document.getElementById('profileCustomStyle').disabled = false;
            }
        }

        document.getElementById('profileDescription').value = userProfile.profileDescription || '';


        // Загружаем баннер
        if (userProfile.banner) {
            const preview = document.getElementById('bannerPreview');
            preview.innerHTML = `<img src="${userProfile.banner}" alt="Баннер">`;
        }




        lockBasicInfoFields();

        // Загружаем аватар
        if (userProfile.avatar) {
            const preview = document.getElementById('avatarPreview');
            preview.innerHTML = `<img src="${userProfile.avatar}" alt="Аватар">`;
        }

        // Загружаем социальные сети
        if (userProfile.socialLinks && userProfile.socialLinks.length > 0) {
            initializeSocialLinksWithData(userProfile.socialLinks);
        }

        // Загружаем работы
        if (userProfile.works && userProfile.works.length > 0) {
            initializeWorksWithData(userProfile.works);
        }

        console.log(`📁 Загружен профиль: ${currentUser.username} (основная информация заблокирована)`);


        setTimeout(() => {
            validateSocialLinks();
            validateWorks();
            validateAvatar();
            validateBanner();
            updateOverallValidation();
        }, 500);
    }
}


function getOperationType() {
    if (!currentUser) return 'new';

    const userProfile = localStorage.getItem('userProfile_' + currentUser.username);
    return userProfile ? 'edit' : 'new';
}

function lockBasicInfoFields() {

    const nameInput = document.getElementById('profileName');
    const nicknameInput = document.getElementById('profileNickname');
    const styleSelect = document.getElementById('profileStyle');
    const customStyleInput = document.getElementById('profileCustomStyle');


    nameInput.readOnly = true;
    nicknameInput.readOnly = true;


    styleSelect.disabled = true;
    customStyleInput.disabled = true;


    nameInput.style.backgroundColor = '#2a2a2a';
    nameInput.style.color = '#888';
    nameInput.style.cursor = 'not-allowed';

    nicknameInput.style.backgroundColor = '#2a2a2a';
    nicknameInput.style.color = '#888';
    nicknameInput.style.cursor = 'not-allowed';

    styleSelect.style.backgroundColor = '#2a2a2a';
    styleSelect.style.color = '#888';
    styleSelect.style.cursor = 'not-allowed';

    customStyleInput.style.backgroundColor = '#2a2a2a';
    customStyleInput.style.color = '#888';
    customStyleInput.style.cursor = 'not-allowed';


    addLockedFieldHints();
}

function addLockedFieldHints() {

    const nameLabel = document.querySelector('label[for="profileName"]');
    const nicknameLabel = document.querySelector('label[for="profileNickname"]');
    const styleLabel = document.querySelector('label[for="profileStyle"]');
    const customStyleLabel = document.querySelector('label[for="profileCustomStyle"]');

    if (nameLabel && !nameLabel.querySelector('.locked-hint')) {
        const nameHint = document.createElement('span');
        nameHint.className = 'locked-hint';
        nameHint.innerHTML = ' 🔒';
        nameHint.style.color = '#ffcc00';
        nameHint.style.fontSize = '0.8em';
        nameHint.style.marginLeft = '5px';
        nameLabel.appendChild(nameHint);
    }

    if (nicknameLabel && !nicknameLabel.querySelector('.locked-hint')) {
        const nicknameHint = document.createElement('span');
        nicknameHint.className = 'locked-hint';
        nicknameHint.innerHTML = ' 🔒';
        nicknameHint.style.color = '#ffcc00';
        nicknameHint.style.fontSize = '0.8em';
        nicknameHint.style.marginLeft = '5px';
        nicknameLabel.appendChild(nicknameHint);
    }

    if (styleLabel && !styleLabel.querySelector('.locked-hint')) {
        const styleHint = document.createElement('span');
        styleHint.className = 'locked-hint';
        styleHint.innerHTML = ' 🔒 ';
        styleHint.style.color = '#ffcc00';
        styleHint.style.fontSize = '0.8em';
        styleHint.style.marginLeft = '5px';
        styleLabel.appendChild(styleHint);
    }

    if (customStyleLabel && !customStyleLabel.querySelector('.locked-hint')) {
        const customStyleHint = document.createElement('span');
        customStyleHint.className = 'locked-hint';
        customStyleHint.innerHTML = ' 🔒';
        customStyleHint.style.color = '#ffcc00';
        customStyleHint.style.fontSize = '0.8em';
        customStyleHint.style.marginLeft = '5px';
        customStyleLabel.appendChild(customStyleHint);
    }


    const mainInfoSection = document.getElementById('mainInfoSection');
    if (mainInfoSection && !mainInfoSection.querySelector('.locked-info-message')) {
        const infoMessage = document.createElement('div');
        infoMessage.className = 'locked-info-message';
        infoMessage.innerHTML = `
            <div style="background: rgba(255, 204, 0, 0.1); padding: 10px; border-radius: 8px; margin: 10px 0; border-left: 3px solid #ffcc00;">
                <div style="display: flex; align-items: center; gap: 8px; color: #ffcc00; font-weight: bold;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ffcc00">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM12 17c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zM15.1 8H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                    </svg>
                    Основная информация заблокирована
                </div>
                <p style="color: #e0e0e0; font-size: 0.85em; margin: 5px 0 0 0;">
                    Имя, юз и стиль нельзя изменить после сохранения профиля. 
                    Это обеспечивает стабильность вашего профиля на платформе.
                </p>
            </div>
        `;
        mainInfoSection.insertBefore(infoMessage, mainInfoSection.firstChild);
    }
}


function loadBannerFromLink() {
    const linkInput = document.getElementById('bannerLinkInput');
    const link = linkInput.value.trim();

    if (!link) {
        alert('Пожалуйста, введите ссылку на баннер');
        return;
    }

    if (!isValidImageUrl(link)) {
        alert('Пожалуйста, введите корректную ссылку на изображение');
        return;
    }

    const preview = document.getElementById('bannerPreview');
    preview.innerHTML = `<img src="${link}" alt="Баннер" onerror="handleBannerError(this)">`;


    linkInput.value = '';


    showBannerSuccess();
}


function handleBannerError(imgElement) {
    const preview = document.getElementById('bannerPreview');
    preview.innerHTML = '<div class="banner-placeholder">Баннер не выбран</div>';
    alert('Не удалось загрузить баннер. Проверьте ссылку и попробуйте снова.');
}


function removeBanner() {
    const preview = document.getElementById('bannerPreview');
    preview.innerHTML = '<div class="banner-placeholder">Баннер не выбран</div>';


    document.getElementById('bannerLinkInput').value = '';
}


function showBannerSuccess() {
    const preview = document.getElementById('bannerPreview');
    const originalBorder = preview.style.border;

    preview.style.border = '2px solid #4CAF50';
    setTimeout(() => {
        preview.style.border = originalBorder || '2px dashed #555';
    }, 2000);
}


function getBannerSrc() {
    const bannerImg = document.querySelector('#bannerPreview img');
    return bannerImg && bannerImg.src && !bannerImg.src.includes('data:image/svg+xml')
        ? bannerImg.src
        : '';
}

function closeCodeModal() {
    const modal = document.getElementById('codeModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';


    currentProfileCode = '';
}

function copyProfileCode() {
    const copyBtn = document.getElementById('copyCodeBtn');
    const successMessage = document.getElementById('successMessage');


    const textArea = document.createElement('textarea');
    textArea.value = currentProfileCode;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    try {
        const successful = document.execCommand('copy');
        if (successful) {

            copyBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        
                    </svg>
                    Код скопирован!
                `;
            copyBtn.classList.add('copied');


            successMessage.classList.add('show');


            setTimeout(() => {
                successMessage.classList.remove('show');
            }, 3000);


            setTimeout(() => {
                copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                        </svg>
                        Скопировать код
                    `;
                copyBtn.classList.remove('copied');
            }, 5000);

            console.log('✓ Код профиля успешно скопирован в буфер обмена');
        }
    } catch (err) {
        console.error('✗ Ошибка при копировании: ', err);


        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(currentProfileCode).then(() => {
                copyBtn.innerHTML = `
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                        </svg>
                        Код скопирован!
                    `;
                copyBtn.classList.add('copied');
                successMessage.classList.add('show');

                setTimeout(() => {
                    successMessage.classList.remove('show');
                }, 3000);

                setTimeout(() => {
                    copyBtn.innerHTML = `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            Скопировать код
                        `;
                    copyBtn.classList.remove('copied');
                }, 5000);
            }).catch(err => {
                console.error('Ош ', err);
                alert('');
            });
        } else {
            alert('');
        }
    }

    document.body.removeChild(textArea);
}

function getAvatarSrc() {
    const avatarImg = document.querySelector('#avatarPreview img');
    return avatarImg && avatarImg.src && !avatarImg.src.includes('data:image/svg+xml')
        ? avatarImg.src
        : '';
}

function collectWorks() {
    const works = [];
    const workElements = document.querySelectorAll('.work-link-preview img');


    for (let i = workElements.length - 1; i >= 0; i--) {
        const img = workElements[i];
        if (img.src) {
            works.push(img.src);
        }
    }

    return works;
}

function skipProfileSetup() {
    if (confirm('Вы уверены, что хотите пропустить настройку профиля?')) {
        closeProfileSetupModal();
    }
}

function showProfileSuccess(message) {

    const notification = document.createElement('div');
    notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(45deg, #4CAF50, #45a049);
                color: white;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 300px;
                font-family: "Comfortaa", sans-serif;
                animation: slideInRight 0.5s ease-out;
            `;

    notification.innerHTML = `
                <div style="font-weight: bold; margin-bottom: 5px;">✓ Успешно!</div>
                <div style="font-size: 0.9em;">${message}</div>
            `;

    document.body.appendChild(notification);


    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}



function initImageModal() {

    document.querySelectorAll('.work-thumb, .work-thumb-1, .work-thumb-2, .work-thumb-3, .modal-img').forEach(img => {
        img.addEventListener('click', function (e) {
            e.stopPropagation();


            const gallery = this.closest('.works-inner') || this.closest('.modal-content');
            if (gallery) {
                currentImages = Array.from(gallery.querySelectorAll('img')).map(img => img.src);
                currentImageIndex = currentImages.indexOf(this.src);

                if (currentImageIndex === -1) {
                    currentImageIndex = 0;
                }

                openImageModal(currentImages[currentImageIndex]);
            }
        });
    });
}

function openImageModal(imgSrc) {
    const imageModal = document.getElementById('imageModal');
    const expandedImg = document.getElementById('expandedImg');


    expandedImg.style.opacity = '1';
    expandedImg.src = imgSrc;
    imageModal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    updateImageCounter();


    setupImageModalEvents();
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';


    removeImageModalEvents();
}

function navigateImage(direction) {
    if (currentImages.length === 0 || currentImages.length === 1) return;

    currentImageIndex += direction;


    if (currentImageIndex < 0) {
        currentImageIndex = currentImages.length - 1;
    } else if (currentImageIndex >= currentImages.length) {
        currentImageIndex = 0;
    }

    const expandedImg = document.getElementById('expandedImg');


    expandedImg.style.opacity = '0';

    setTimeout(() => {
        expandedImg.src = currentImages[currentImageIndex];
        expandedImg.style.opacity = '1';


        updateImageCounter();
    }, 200);
}


function updateImageCounter() {
    const counter = document.getElementById('imageCounter');
    if (currentImages.length > 1) {
        counter.textContent = `${currentImageIndex + 1} / ${currentImages.length}`;
        counter.style.display = 'block';


        document.querySelectorAll('.modal-nav-btn').forEach(btn => {
            btn.style.display = 'flex';
        });
    } else {
        counter.style.display = 'none';


        document.querySelectorAll('.modal-nav-btn').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

function setupImageModalEvents() {

    if (window.innerWidth > 768) {
        document.addEventListener('keydown', handleImageKeydown);
    }


    const modalContent = document.querySelector('.image-modal-content');
    modalContent.addEventListener('touchstart', handleImageTouchStart, { passive: false });
    modalContent.addEventListener('touchmove', handleImageTouchMove, { passive: false });
    modalContent.addEventListener('touchend', handleImageTouchEnd);
}

function removeImageModalEvents() {
    document.removeEventListener('keydown', handleImageKeydown);

    const modalContent = document.querySelector('.image-modal-content');
    modalContent.removeEventListener('touchstart', handleImageTouchStart);
    modalContent.removeEventListener('touchmove', handleImageTouchMove);
    modalContent.removeEventListener('touchend', handleImageTouchEnd);
}

function handleImageKeydown(e) {
    if (e.key === 'Escape') {
        closeImageModal();
    } else if (e.key === 'ArrowLeft') {
        navigateImage(-1);
    } else if (e.key === 'ArrowRight') {
        navigateImage(1);
    }
}

let imageTouchStartX = 0;
let imageTouchEndX = 0;

function handleImageTouchStart(e) {
    imageTouchStartX = e.touches[0].clientX;
    e.preventDefault();
}

function handleImageTouchMove(e) {
    if (!imageTouchStartX) return;
    imageTouchEndX = e.touches[0].clientX;
    const diff = imageTouchStartX - imageTouchEndX;

    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
}

function handleImageTouchEnd() {
    if (!imageTouchStartX || !imageTouchEndX) return;

    const diff = imageTouchStartX - imageTouchEndX;
    const threshold = 50;

    if (diff > threshold) {
        navigateImage(1);
    } else if (diff < -threshold) {
        navigateImage(-1);
    }

    imageTouchStartX = 0;
    imageTouchEndX = 0;
}



// Menu Functions
function toggleMenu() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const menuIcon = document.getElementById('menuIcon');
    const body = document.body;
    const searchInput = document.getElementById('searchInput');


    if (!body.classList.contains('menu-open')) {
        body.style.top = `-${window.scrollY}px`;
    }

    drawer.classList.toggle('open');
    overlay.classList.toggle('active');
    menuIcon.classList.toggle('active');
    body.classList.toggle('menu-open');
    searchInput.disabled = body.classList.contains('menu-open');


    if (!body.classList.contains('menu-open')) {
        const scrollY = parseInt(body.style.top || '0');
        body.style.top = '';
        window.scrollTo(0, -scrollY);
    }
}

function closeMenu() {
    const drawer = document.getElementById('drawer');
    const overlay = document.getElementById('overlay');
    const menuIcon = document.getElementById('menuIcon');
    const body = document.body;

    drawer.classList.remove('open');
    overlay.classList.remove('active');
    menuIcon.classList.remove('active');
    body.classList.remove('menu-open');
}

// Toggle submenus
function toggleSubmenu(event) {
    event.preventDefault();
    const link = event.currentTarget;
    const submenu = link.nextElementSibling;

    // Close all other submenus first
    document.querySelectorAll('.submenu').forEach(menu => {
        if (menu !== submenu) {
            menu.classList.remove('active');
            menu.previousElementSibling.classList.remove('active');
        }
    });

    // Toggle current submenu
    link.classList.toggle('active');
    submenu.classList.toggle('active');
}

// Close menu when clicking on overlay
document.getElementById('overlay').addEventListener('click', closeMenu);

// New Search Functionality
function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    const searchBackdrop = document.getElementById('searchBackdrop');
    const isActive = searchContainer.classList.contains('active');

    if (isActive) {
        searchContainer.classList.remove('active');
        searchBackdrop.classList.remove('active');
        document.getElementById('searchResults').classList.remove('active');
        document.getElementById('searchInput').value = '';
        document.body.style.overflow = 'auto';
    } else {
        searchContainer.classList.add('active');
        searchBackdrop.classList.add('active');
        document.getElementById('searchInput').focus();
        document.body.style.overflow = 'hidden';
    }


    if (document.getElementById('drawer').classList.contains('open')) {
        toggleMenu();
    }
}

function searchArtists() {
    const searchText = document.getElementById('searchInput').value.trim().toLowerCase();
    const resultsContainer = document.getElementById('searchResults');

    if (!searchText) {
        resultsContainer.innerHTML = '<div class="no-results">Введите запрос для поиска</div>';
        resultsContainer.classList.add('active');
        return;
    }

    const artists = document.querySelectorAll('.profile-section');
    let found = false;
    resultsContainer.innerHTML = '';

    artists.forEach(artist => {
        const artistName = artist.querySelector('h1').textContent.toLowerCase();
        const artistStyle = artist.querySelector('p').textContent.toLowerCase();
        const artistLink = artist.querySelector('.profile-link').textContent.toLowerCase();
        const artistAvatar = artist.querySelector('.avatar').src;

        if (artistName.includes(searchText) || artistStyle.includes(searchText) || artistLink.includes(searchText)) {
            found = true;
            const resultItem = document.createElement('div');
            resultItem.className = 'search-result-item';

            resultItem.innerHTML = `
                        <img src="${artistAvatar}" alt="${artistName}">
                        <div class="info">
                            <div class="name">${artist.querySelector('h1').textContent}</div>
                            <div class="style">${artist.querySelector('p').textContent}</div>
                        </div>
                    `;

            resultItem.onclick = () => {
                document.getElementById('searchInput').value = '';
                scrollToArtist(artist);
                toggleSearch();
            };
            resultsContainer.appendChild(resultItem);
        }
    });

    if (!found) {
        resultsContainer.innerHTML = '<div class="no-results">Ничего не найдено</div>';
    }
    resultsContainer.classList.add('active');
}


function highlightText(element, searchText) {
    const text = element.textContent;
    const regex = new RegExp(`(${searchText})`, 'gi');
    element.innerHTML = text.replace(regex, match =>
        `<span class="highlight">${match}</span>`
    );
}


function scrollToArtist(artist) {

    document.querySelectorAll('.artist-highlight').forEach(el => {
        el.classList.remove('artist-highlight');
    });


    artist.classList.add('artist-highlight');


    const yOffset = -80;
    const y = artist.getBoundingClientRect().top + window.pageYOffset + yOffset;

    window.scrollTo({
        top: y,
        behavior: 'smooth'
    });


    setTimeout(() => {
        artist.classList.remove('artist-highlight');
    }, 3000);


    const handleInterrupt = () => {
        artist.classList.remove('artist-highlight');
    };


    window.addEventListener('scroll', handleInterrupt, {
        once: true,
        passive: true
    });


    setTimeout(() => {
        document.body.style.overflow = 'auto';
        document.body.style.position = 'static';
    }, 500);
}


function setupIdCopyFunctionality() {
    const cabinetUserId = document.getElementById('cabinetUserId');
    if (cabinetUserId) {
        cabinetUserId.style.cursor = 'pointer';
        cabinetUserId.title = 'Кликните чтобы скопировать ID';
        cabinetUserId.addEventListener('click', copyUserId);
    }
}


function copyUserId(event) {
    event.preventDefault();
    event.stopPropagation();

    const userIdText = this.textContent.replace('ID: ', '');


    const textArea = document.createElement('textarea');
    textArea.value = userIdText;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    textArea.setSelectionRange(0, 99999);

    try {
        const successful = document.execCommand('copy');
        if (successful) {

            const originalText = this.textContent;
            this.textContent = '✔ ID скопирован!';
            this.style.color = '#4CAF50';


            setTimeout(() => {
                this.textContent = originalText;
                this.style.color = '';
            }, 2000);

            console.log('✓ ID профиля скопирован в буфер обмена:', userIdText);
        }
    } catch (err) {
        console.error('✗ Ошибка при копировании ID:', err);


        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(userIdText).then(() => {
                const originalText = this.textContent;
                this.textContent = '✔ ID скопирован!';
                this.style.color = '#4CAF50';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.color = '';
                }, 2000);
            });
        }
    }

    document.body.removeChild(textArea);
}


function setupSearchResults() {
    document.querySelectorAll('.search-result-item').forEach(item => {
        item.onclick = (e) => {
            e.preventDefault();
            const artist = document.querySelector(
                `.profile-section:has([alt="${item.querySelector('img').alt}"])`
            );

            document.getElementById('searchInput').value = '';
            toggleSearch();

            setTimeout(() => {
                if (artist) {
                    scrollToArtist(artist);


                    const handleInterrupt = () => {
                        artist.classList.remove('artist-highlight');
                        window.removeEventListener('scroll', handleInterrupt);
                    };
                    window.addEventListener('scroll', handleInterrupt, { once: true });
                }
            }, 100);
        };
    });
}


document.getElementById('searchInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchArtists();
    }
});


document.getElementById('searchInput').addEventListener('input', function () {
    if (this.value.length > 0) {
        searchArtists();
    } else {
        document.getElementById('searchResults').classList.remove('active');
    }
});


document.addEventListener('click', function (e) {
    const searchContainer = document.getElementById('searchContainer');
    const searchResults = document.getElementById('searchResults');
    const searchInput = document.getElementById('searchInput');
    const mobileSearchBtn = document.getElementById('mobileSearchBtn');

    if (!searchContainer.contains(e.target) &&
        e.target !== mobileSearchBtn &&
        !searchResults.contains(e.target)) {
        searchResults.classList.remove('active');
    }
});


window.addEventListener('scroll', function () {
    if (window.innerWidth <= 768 &&
        document.getElementById('searchContainer').classList.contains('active')) {
        toggleSearch();
    }
});


function initFilters() {
    const styles = new Set();
    const filterDropdown = document.getElementById('filtersDropdown');


    document.querySelectorAll('.profile-section').forEach(section => {
        const style = section.getAttribute('data-style');
        if (style) styles.add(style);
    });


    filterDropdown.innerHTML = '';


    const allItem = document.createElement('a');
    allItem.href = '#';
    allItem.textContent = 'Все стили';
    allItem.onclick = (e) => {
        applyFilter('all', e);
        updateActiveFilter(e.target);
    };
    filterDropdown.appendChild(allItem);


    const premItem = document.createElement('a');
    premItem.href = '#';
    premItem.textContent = 'Prem Artist';
    premItem.onclick = (e) => {
        applyFilter('prem', e);
        updateActiveFilter(e.target);
    };
    filterDropdown.appendChild(premItem);


    styles.forEach(style => {
        const item = document.createElement('a');
        item.href = '#';
        item.textContent = style;
        item.onclick = (e) => {
            applyFilter(style, e);
            updateActiveFilter(e.target);
        };
        filterDropdown.appendChild(item);
    });
}

function updateActiveFilter(clickedElement) {
    document.querySelectorAll('.filters-dropdown a').forEach(a => {
        a.classList.remove('active-filter');
    });
    clickedElement.classList.add('active-filter');
}

function getNextElements(element) {
    const elements = [];
    let next = element.nextElementSibling;

    while (next) {
        if (next.classList.contains('favorite-works') ||
            next.classList.contains('works-carousel') ||
            next.classList.contains('show-works-btn')) {
            elements.push(next);
        } else if (next.classList.contains('profile-section')) {
            break;
        }
        next = next.nextElementSibling;
    }

    return elements;
}

function toggleFilters(event) {
    event.stopPropagation();
    const filtersDropdown = document.getElementById('filtersDropdown');
    filtersDropdown.classList.toggle('active');
    document.querySelector('.filters-button').classList.toggle('active');

    if (filtersDropdown.classList.contains('active')) {
        document.addEventListener('click', closeFiltersOnClickOutside);
    } else {
        document.removeEventListener('click', closeFiltersOnClickOutside);
    }
}

function closeFiltersOnClickOutside(event) {
    const filtersContainer = document.querySelector('.filters-container');
    if (!filtersContainer.contains(event.target)) {
        document.getElementById('filtersDropdown').classList.remove('active');
        document.querySelector('.filters-button').classList.remove('active');
        document.removeEventListener('click', closeFiltersOnClickOutside);
    }
}


const carouselStates = {};

function initCarousel(worksInnerId) {
    if (!carouselStates[worksInnerId]) {
        carouselStates[worksInnerId] = {
            currentTranslate: 0,
            prevTranslate: 0,
            isDragging: false,
            startPos: 0,
            animationID: 0
        };
    }

    const worksInner = document.getElementById(worksInnerId);
    const works = worksInner.querySelectorAll('.work-thumb, .work-thumb-1, .work-thumb-2, .work-thumb-3');


    worksInner.addEventListener('mousedown', (e) => {
        const state = carouselStates[worksInnerId];
        state.isDragging = true;
        state.startPos = e.clientX;
        state.prevTranslate = state.currentTranslate;
        state.animationID = requestAnimationFrame(() => animation(worksInnerId));
        worksInner.style.cursor = 'grabbing';
        worksInner.style.transition = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        const state = carouselStates[worksInnerId];
        if (!state.isDragging) return;
        const currentPosition = e.clientX;
        state.currentTranslate = state.prevTranslate + currentPosition - state.startPos;
    });

    window.addEventListener('mouseup', () => {
        const state = carouselStates[worksInnerId];
        if (!state.isDragging) return;
        state.isDragging = false;
        cancelAnimationFrame(state.animationID);
        worksInner.style.cursor = 'grab';

        const movedBy = state.currentTranslate - state.prevTranslate;
        const visibleWorks = getVisibleWorksCount(worksInnerId);

        if (movedBy < -100) nextWork(worksInnerId, visibleWorks);
        else if (movedBy > 100) prevWork(worksInnerId, visibleWorks);
        else setPosition(worksInnerId);

        worksInner.style.transition = 'transform 0.5s ease';
    });


    worksInner.addEventListener('touchstart', (e) => {
        const state = carouselStates[worksInnerId];
        state.isDragging = true;
        state.startPos = e.touches[0].clientX;
        state.prevTranslate = state.currentTranslate;
        state.animationID = requestAnimationFrame(() => animation(worksInnerId));
        worksInner.style.transition = 'none';
    });

    window.addEventListener('touchmove', (e) => {
        const state = carouselStates[worksInnerId];
        if (!state.isDragging) return;

        const currentPosition = e.touches[0].clientX;
        const newTranslate = state.prevTranslate + currentPosition - state.startPos;


        if (window.innerWidth <= 768) {
            const totalWorksWidth = Array.from(works).reduce((sum, work) => sum + work.offsetWidth + 35, 0);
            const containerWidth = worksInner.parentElement.offsetWidth;
            const maxTranslate = -(totalWorksWidth - containerWidth);


            state.currentTranslate = Math.max(Math.min(newTranslate, 0), maxTranslate);
        } else {
            state.currentTranslate = newTranslate;
        }
    });

    window.addEventListener('touchend', () => {
        const state = carouselStates[worksInnerId];
        if (!state.isDragging) return;
        state.isDragging = false;
        cancelAnimationFrame(state.animationID);

        const movedBy = state.currentTranslate - state.prevTranslate;
        const visibleWorks = getVisibleWorksCount(worksInnerId);

        if (movedBy < -100) nextWork(worksInnerId, visibleWorks);
        else if (movedBy > 100) prevWork(worksInnerId, visibleWorks);
        else setPosition(worksInnerId);

        worksInner.style.transition = 'transform 0.5s ease';
    });
}

function animation(worksInnerId) {
    setPosition(worksInnerId);
    const state = carouselStates[worksInnerId];
    if (state.isDragging) requestAnimationFrame(() => animation(worksInnerId));
}

function setPosition(worksInnerId) {
    const state = carouselStates[worksInnerId];
    const worksInner = document.getElementById(worksInnerId);
    worksInner.style.transform = `translateX(${state.currentTranslate}px)`;
}

function getVisibleWorksCount(worksInnerId) {
    const worksInner = document.getElementById(worksInnerId);
    const works = worksInner.querySelectorAll('.work-thumb, .work-thumb-1, .work-thumb-2, .work-thumb-3');
    if (works.length === 0) return 1;

    const containerWidth = worksInner.parentElement.offsetWidth;
    const workWidth = works[0].offsetWidth + 35;
    return Math.floor(containerWidth / workWidth);
}

function nextWork(worksInnerId, step = null) {
    const worksInner = document.getElementById(worksInnerId);
    if (!worksInner) return;

    const works = worksInner.querySelectorAll('.work-thumb, .work-thumb-1, .work-thumb-2, .work-thumb-3');
    const state = carouselStates[worksInnerId];

    if (works.length === 0) return;

    if (step === null) step = getVisibleWorksCount(worksInnerId);

    const containerWidth = worksInner.parentElement.offsetWidth;
    const totalWorksWidth = Array.from(works).reduce((sum, work) => sum + work.offsetWidth + 35, 0);
    const maxPosition = Math.min(0, containerWidth - totalWorksWidth - 35);

    const newPosition = state.currentTranslate - (step * (works[0].offsetWidth + 35));


    state.currentTranslate = Math.max(newPosition, maxPosition);

    worksInner.style.transition = 'transform 0.5s ease';
    setPosition(worksInnerId);
}

function prevWork(worksInnerId, step = null) {
    const worksInner = document.getElementById(worksInnerId);
    if (!worksInner) return;

    const works = worksInner.querySelectorAll('.work-thumb, .work-thumb-1, .work-thumb-2, .work-thumb-3');
    const state = carouselStates[worksInnerId];

    if (works.length === 0) return;

    if (step === null) step = getVisibleWorksCount(worksInnerId);

    const newPosition = state.currentTranslate + (step * (works[0].offsetWidth + 35));


    state.currentTranslate = Math.min(newPosition, 0);

    worksInner.style.transition = 'transform 0.5s ease';
    setPosition(worksInnerId);
}


function openModal(modalId) {
    document.getElementById(modalId).style.display = 'block';
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
    document.body.style.overflow = 'auto';
}


window.onclick = function (event) {
    document.querySelectorAll('.modal').forEach(modal => {
        if (event.target == modal) {
            closeModal(modal.id);
        }
    });

    if (event.target === document.getElementById('imageModal')) {
        closeImageModal();
    }
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && document.getElementById('codeModal').style.display === 'block') {
        closeCodeModal();
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal').forEach(modal => {
            if (modal.style.display === 'block') {
                closeModal(modal.id);
            }
        });

        if (document.getElementById('imageModal').style.display === 'block') {
            closeImageModal();
        }
    }
});


function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


window.addEventListener('scroll', function () {
    const backToTopBtn = document.getElementById('backToTopBtn');
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('active');
    } else {
        backToTopBtn.classList.remove('active');
    }
});


function openTabByLink(tabId) {

    console.log('Opening tab:', tabId);
}


document.addEventListener('DOMContentLoaded', function () {
    setTimeout(showPublicationInfo, 3000);
});


document.addEventListener('DOMContentLoaded', function () {

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');


                if (entry.target.classList.contains('modal-img')) {
                    setTimeout(() => {
                        entry.target.classList.add('visible');
                    }, 100 * index);
                }
            }
        });
    }, observerOptions);


    document.querySelectorAll('.profile-section, .favorite-works, .works-carousel, .show-works-btn').forEach(el => {
        observer.observe(el);
    });


    document.querySelectorAll('.modal-img').forEach((img, index) => {
        observer.observe(img);
    });
});


function applyFilter(selectedStyle, event) {
    event.preventDefault();


    closeFilters();

    document.querySelectorAll('.profile-section').forEach(profile => {
        const style = profile.getAttribute('data-style');
        const isPrem = profile.getAttribute('data-prem') === 'true';
        const nextElements = getNextElements(profile);

        if (selectedStyle === 'all' ||
            (selectedStyle === 'prem' && isPrem) ||
            (selectedStyle !== 'prem' && style === selectedStyle)) {
            profile.classList.remove('hidden');
            nextElements.forEach(el => {
                el.classList.remove('hidden');
                el.style.transitionDelay = '0.2s';
            });
        } else {
            profile.classList.add('hidden');
            nextElements.forEach(el => el.classList.add('hidden'));
        }
    });


    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

function closeFilters() {
    const filtersDropdown = document.getElementById('filtersDropdown');
    const filtersButton = document.querySelector('.filters-button');

    filtersDropdown.classList.remove('active');
    filtersButton.classList.remove('active');
    document.removeEventListener('click', closeFiltersOnClickOutside);
}


function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    setTimeout(() => {
        modal.querySelectorAll('.modal-img').forEach((img, index) => {
            setTimeout(() => img.classList.add('visible'), 50 * index);
        });
    }, 100);
}


function handleAnchorLinks() {

    if (window.location.hash) {
        const artistId = window.location.hash.substring(1);
        const artistSection = document.getElementById(artistId);

        if (artistSection) {

            setTimeout(() => {
                artistSection.scrollIntoView({ behavior: 'smooth' });


                const profile = artistSection.querySelector('.profile-section');
                if (profile) {
                    profile.classList.add('artist-highlight');


                    setTimeout(() => {
                        profile.classList.remove('artist-highlight');
                    }, 3000);
                }
            }, 100);
        }
    }
}


window.addEventListener('load', handleAnchorLinks);


window.addEventListener('hashchange', handleAnchorLinks);


function autoResizeTextarea(textarea) {

    textarea.style.height = 'auto';


    const newHeight = Math.min(textarea.scrollHeight, 300);


    textarea.style.height = newHeight + 'px';


    textarea.style.transition = 'height 0.2s ease-out';
}


document.addEventListener('DOMContentLoaded', function () {
    const textareas = document.querySelectorAll('.form-textarea');
    textareas.forEach(textarea => {

        autoResizeTextarea(textarea);


        textarea.addEventListener('input', function () {
            autoResizeTextarea(this);
        });


        textarea.addEventListener('focus', function () {
            autoResizeTextarea(this);
        });
    });
});


function openProfileWorksModal(workId) {

    const worksContainer = document.getElementById('worksContainer');
    const workPreviews = worksContainer.querySelectorAll('.work-link-preview img');


    profileWorks = Array.from(workPreviews).map(img => img.src);


    currentProfileWorkIndex = Array.from(workPreviews).findIndex(img =>
        img.closest('.work-link-preview').id === workId
    );

    if (currentProfileWorkIndex === -1) {
        currentProfileWorkIndex = 0;
    }


    const modal = document.getElementById('profileWorksModal');
    const modalImg = document.getElementById('profileWorksModalImg');

    modalImg.src = profileWorks[currentProfileWorkIndex];
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    updateProfileWorksCounter();


    setupProfileWorksModalEvents();
}

function closeProfileWorksModal() {
    const modal = document.getElementById('profileWorksModal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';


    removeProfileWorksModalEvents();
}

function navigateProfileWork(direction) {
    if (profileWorks.length === 0 || profileWorks.length === 1) return;

    currentProfileWorkIndex += direction;


    if (currentProfileWorkIndex < 0) {
        currentProfileWorkIndex = profileWorks.length - 1;
    } else if (currentProfileWorkIndex >= profileWorks.length) {
        currentProfileWorkIndex = 0;
    }

    const modalImg = document.getElementById('profileWorksModalImg');


    modalImg.style.opacity = '0';

    setTimeout(() => {
        modalImg.src = profileWorks[currentProfileWorkIndex];
        modalImg.style.opacity = '1';


        updateProfileWorksCounter();
    }, 200);
}

function updateProfileWorksCounter() {
    const counter = document.getElementById('profileWorksModalCounter');
    if (profileWorks.length > 1) {
        counter.textContent = `${currentProfileWorkIndex + 1} / ${profileWorks.length}`;
        counter.style.display = 'block';


        document.querySelectorAll('.profile-works-modal-nav').forEach(btn => {
            btn.style.display = 'flex';
        });
    } else {
        counter.style.display = 'none';


        document.querySelectorAll('.profile-works-modal-nav').forEach(btn => {
            btn.style.display = 'none';
        });
    }
}

function setupProfileWorksModalEvents() {

    if (window.innerWidth > 768) {
        document.addEventListener('keydown', handleProfileWorksKeydown);
    }


    const modalContent = document.querySelector('.profile-works-modal-content');
    modalContent.addEventListener('touchstart', handleProfileWorksTouchStart, { passive: false });
    modalContent.addEventListener('touchmove', handleProfileWorksTouchMove, { passive: false });
    modalContent.addEventListener('touchend', handleProfileWorksTouchEnd);
}

function removeProfileWorksModalEvents() {
    document.removeEventListener('keydown', handleProfileWorksKeydown);

    const modalContent = document.querySelector('.profile-works-modal-content');
    modalContent.removeEventListener('touchstart', handleProfileWorksTouchStart);
    modalContent.removeEventListener('touchmove', handleProfileWorksTouchMove);
    modalContent.removeEventListener('touchend', handleProfileWorksTouchEnd);
}

function handleProfileWorksKeydown(e) {
    if (e.key === 'Escape') {
        closeProfileWorksModal();
    } else if (e.key === 'ArrowLeft') {
        navigateProfileWork(-1);
    } else if (e.key === 'ArrowRight') {
        navigateProfileWork(1);
    }
}

let profileWorksTouchStartX = 0;
let profileWorksTouchEndX = 0;

function handleProfileWorksTouchStart(e) {
    profileWorksTouchStartX = e.touches[0].clientX;
    e.preventDefault();
}

function handleProfileWorksTouchMove(e) {
    if (!profileWorksTouchStartX) return;
    profileWorksTouchEndX = e.touches[0].clientX;
    const diff = profileWorksTouchStartX - profileWorksTouchEndX;

    if (Math.abs(diff) > 10) {
        e.preventDefault();
    }
}

function handleProfileWorksTouchEnd() {
    if (!profileWorksTouchStartX || !profileWorksTouchEndX) return;

    const diff = profileWorksTouchStartX - profileWorksTouchEndX;
    const threshold = 50;

    if (diff > threshold) {
        navigateProfileWork(1);
    } else if (diff < -threshold) {
        navigateProfileWork(-1);
    }

    profileWorksTouchStartX = 0;
    profileWorksTouchEndX = 0;
}


document.addEventListener('click', function (event) {
    if (event.target === document.getElementById('profileSetupModal')) {
        closeProfileSetupModal();
    }
    if (event.target === document.getElementById('profileWorksModal')) {
        closeProfileWorksModal();
    }
    if (event.target === document.getElementById('personalCabinetModal')) {
        closePersonalCabinetModal();
    }
    if (event.target === document.getElementById('registrationModal')) {
        closeRegistrationModal();
    }
    if (event.target === document.getElementById('loginModal')) {
        closeLoginModal();
    }
    if (event.target === document.getElementById('codeModal')) {
        closeCodeModal();
    }
    if (event.target === document.getElementById('cabinetWorksModal')) {
        closeCabinetWorksModal();
    }
    if (event.target === document.getElementById('cabinetFullscreenModal')) {
        closeCabinetFullscreenModal();
    }
});

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        if (document.getElementById('profileSetupModal').style.display === 'block') {
            closeProfileSetupModal();
        }
        if (document.getElementById('profileWorksModal').style.display === 'block') {
            closeProfileWorksModal();
        }
        if (document.getElementById('personalCabinetModal').style.display === 'block') {
            closePersonalCabinetModal();
        }
        if (document.getElementById('registrationModal').style.display === 'block') {
            closeRegistrationModal();
        }
        if (document.getElementById('loginModal').style.display === 'block') {
            closeLoginModal();
        }
        if (document.getElementById('codeModal').style.display === 'block') {
            closeCodeModal();
        }
        if (document.getElementById('cabinetWorksModal').style.display === 'block') {
            closeCabinetWorksModal();
        }
        if (document.getElementById('cabinetFullscreenModal').style.display === 'block') {
            closeCabinetFullscreenModal();
        }
    }
});

document.querySelector('.profile-setup-content').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector('.profile-works-modal-content').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector('.personal-cabinet-content').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector('.registration-modal-content').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector('#loginModal .registration-modal-content').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector('.code-modal-content').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector('.cabinet-works-content').addEventListener('click', function (event) {
    event.stopPropagation();
});

document.querySelector('.cabinet-fullscreen-content').addEventListener('click', function (event) {
    event.stopPropagation();
});


const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
            @keyframes shake {
                0%, 100% { transform: translateX(0); }
                25% { transform: translateX(-5px); }
                75% { transform: translateX(5px); }
            }
        `;
document.head.appendChild(shakeStyle);

document.addEventListener('DOMContentLoaded', function () {
    console.log('Страница загружена. Регистрация и вход готовы к работе');
});

window.addEventListener('resize', function () {
    updateAuthUI();
});

function checkProfilePublicationStatus(username) {

    const publishedProfiles = document.querySelectorAll('.profile-section');
    let isPublished = false;


    publishedProfiles.forEach(profile => {
        const profileName = profile.querySelector('h1')?.textContent?.trim();
        const profileData = localStorage.getItem('userProfile_' + username);

        if (profileData) {
            const userProfile = JSON.parse(profileData);
            if (userProfile.profileName === profileName) {
                isPublished = true;
            }
        }
    });

    return isPublished;
}


function updatePublicationStatus() {
    if (!currentUser) return;

    const publicationStatus = getProfilePublicationStatus(currentUser.username);
    const statusElement = document.getElementById('publicationStatus');

    if (statusElement) {
        if (publicationStatus.isPublished && publicationStatus.page) {

            statusElement.innerHTML = `
                <div class="status-text">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Опубликован на: ${publicationStatus.pageDisplayName}
                </div>
            `;
            statusElement.classList.add('published');
        } else if (publicationStatus.isPublished) {

            statusElement.innerHTML = `
                <div class="status-text">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#4CAF50">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                    Профиль опубликован
                </div>
            `;
            statusElement.classList.add('published');
        } else {

            statusElement.innerHTML = `
                <div class="status-text">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff9800">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    Проходит проверку
                </div>
            `;
            statusElement.classList.remove('published');
        }
    }
}


function loadPersonalCabinetData() {
    if (!currentUser) return;

    const userProfile = loadUserProfileFromDatabase(currentUser.username);

    if (userProfile) {
        // ЗАГРУЖАЕМ БАННЕР
        const bannerContainer = document.getElementById('cabinetBannerContainer');
        const bannerImg = document.getElementById('cabinetBanner');

        if (userProfile.banner && userProfile.banner.trim() !== '') {
            bannerImg.src = userProfile.banner;
            bannerContainer.style.display = 'block';

            // Обработка ошибки загрузки баннера
            bannerImg.onerror = function () {
                console.error('Ошибка загрузки баннера:', userProfile.banner);
                bannerContainer.style.display = 'none';
            };
        } else {
            bannerContainer.style.display = 'none';
        }


        document.getElementById('cabinetAvatar').src = userProfile.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg';
        document.getElementById('cabinetUsername').textContent = userProfile.profileName || currentUser.username;
        document.getElementById('cabinetUserId').textContent = 'ID: ' + currentUser.username;
        document.getElementById('cabinetTelegramText').textContent = userProfile.profileNickname || '@username';
        document.getElementById('cabinetTelegramLink').href = 'https://t.me/' + (userProfile.profileNickname || 'username').replace('@', '');


        if (userProfile.publishedOn) {
            updatePublicationStatus();
        }


        loadCabinetSocialLinks(userProfile.socialLinks);


        loadCabinetDescription(userProfile.profileDescription);


        loadCabinetWorks(userProfile.works);


        updateCabinetActionsForMobile();
    }

    setTimeout(() => {
        setupIdCopyFunctionality();
    }, 100);

}


function updateUserInDatabase(username, profileData) {
    if (userDatabase[username]) {
        userDatabase[username] = {
            ...userDatabase[username],
            ...profileData,
            banner: profileData.banner || userDatabase[username].banner || '', // Сохраняем баннер
            lastUpdated: new Date().toISOString()
        };

        console.log('✓ Данные пользователя обновлены в базе:', username);

        // Сохраняем в localStorage с баннером
        localStorage.setItem('userProfile_' + username, JSON.stringify({
            ...userDatabase[username],
            banner: profileData.banner || userDatabase[username].banner || ''
        }));

        return true;
    }

    console.log('✗ Пользователь не найден в базе:', username);
    return false;
}

function syncBannerOnLogin(username) {
    const userProfile = loadUserProfileFromDatabase(username);
    const localProfile = localStorage.getItem('userProfile_' + username);

    if (userProfile && userProfile.banner) {
        // Если в базе есть баннер, обновляем локальные данные
        if (localProfile) {
            const localData = JSON.parse(localProfile);
            localData.banner = userProfile.banner;
            localStorage.setItem('userProfile_' + username, JSON.stringify(localData));
        }

        console.log('🎨 Баннер синхронизирован из базы данных');
        return userProfile.banner;
    }

    return null;
}

function validateBanner() {
    const bannerSrc = getBannerSrc();
    const bannerSection = document.getElementById('bannerSection');


    if (bannerSrc) {
        bannerSection.style.borderLeftColor = '#4CAF50';
    } else {
        bannerSection.style.borderLeftColor = '#ffcc00';
    }
    return true;
}


function updatePersonalCabinetHTML() {
    const cabinetContent = document.querySelector('.cabinet-content');
    if (cabinetContent && !document.getElementById('publicationStatus')) {
        const profileSection = cabinetContent.querySelector('.cabinet-profile-section');
        if (profileSection) {
            const statusHTML = `
                <div class="publication-status" id="publicationStatus" style="margin-top: 15px; padding: 10px; background: rgba(255,255,255,0.1); border-radius: 8px; text-align: center;">
                    <div style="display: flex; align-items: center; gap: 8px; color: #ff9800; font-weight: bold;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff9800">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                        Проходит проверку
                    </div>
                </div>
            `;
            profileSection.insertAdjacentHTML('beforeend', statusHTML);
        }
    }
}


function getCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('Design.html')) return 'design';
    if (path.includes('Artist.html')) return 'artist';
    if (path.includes('ArtistN.html')) return 'artistN';
    if (path.includes('Prem_Artist.html')) return 'prem_artist';
    if (path.includes('proba3.html')) return 'main';
    return 'unknown';
}


function getPageDisplayName(page) {
    const pageNames = {
        'design': 'Дизайнеры',
        'artist': 'Художники',
        'artistN': 'НеактивХудожники',
        'prem_artist': 'Prem Artist',
        'main': 'Главная',
        'unknown': 'Неизвестно'
    };
    return pageNames[page] || page;
}


function savePublicationPage(username, page) {
    const publicationInfo = {
        page: page,
        timestamp: new Date().toISOString(),
        pageDisplayName: getPageDisplayName(page)
    };
    localStorage.setItem(`publication_page_${username}`, JSON.stringify(publicationInfo));
}


function getPublicationPage(username) {
    const publicationInfo = localStorage.getItem(`publication_page_${username}`);
    return publicationInfo ? JSON.parse(publicationInfo) : null;
}


function publishUserProfileOnCurrentPage(username) {
    const currentPage = getCurrentPage();
    savePublicationPage(username, currentPage);


    localStorage.setItem('profilePublished_' + username, 'true');

    console.log(`✓ Профиль ${username} опубликован на странице: ${getPageDisplayName(currentPage)}`);
    return currentPage;
}


function publishUserProfile(username) {
    const userProfile = localStorage.getItem('userProfile_' + username);
    if (!userProfile) {
        console.error('Профиль пользователя не найден');
        return false;
    }

    const profileData = JSON.parse(userProfile);
    const currentPage = getCurrentPage();


    savePublicationPage(username, currentPage);


    localStorage.setItem('profilePublished_' + username, 'true');


    updatePublicationStatus();

    console.log(`✓ Профиль ${username} опубликован на странице: ${getPageDisplayName(currentPage)}`);
    return currentPage;
}


function unpublishUserProfile(username) {

    localStorage.removeItem('profilePublished_' + username);




    updatePublicationStatus();

    return true;
}


function getProfilePublicationStatus(username) {
    const isPublished = localStorage.getItem('profilePublished_' + username) === 'true';
    const publicationPage = getPublicationPage(username);

    return {
        isPublished: isPublished,
        page: publicationPage ? publicationPage.page : null,
        pageDisplayName: publicationPage ? publicationPage.pageDisplayName : null,
        timestamp: publicationPage ? publicationPage.timestamp : null
    };
}


function collectProfileData() {
    return {
        profileName: document.getElementById('profileName').value,
        profileNickname: document.getElementById('profileNickname').value,
        profileStyle: document.getElementById('profileStyle').value === 'Другое'
            ? document.getElementById('profileCustomStyle').value
            : document.getElementById('profileStyle').value,
        profileCustomStyle: document.getElementById('profileStyle').value === 'Другое'
            ? document.getElementById('profileCustomStyle').value
            : '',
        profileDescription: document.getElementById('profileDescription').value,
        userPassword: document.getElementById('profilePassword').value,
        avatar: getAvatarSrc(),
        banner: getBannerSrc(),
        socialLinks: collectSocialLinks(),
        works: collectWorks(),
        lastUpdated: new Date().toISOString(),
        publicationStatus: 'pending',
        basicInfoLocked: true
    };
}


function openPersonalCabinetModal() {
    if (!currentUser) {
        openLoginModal();
        return;
    }

    const modal = document.getElementById('personalCabinetModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';


    updatePersonalCabinetHTML();


    loadPersonalCabinetData();
}


function toggleLoginPasswordVisibility() {
    const passwordInput = document.getElementById('loginPassword');
    const toggleButton = document.querySelector('#loginModal .password-toggle');

    if (passwordInput.type === 'password') {

        passwordInput.type = 'text';
        toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
            </svg>
        `;
        toggleButton.setAttribute('title', 'Скрыть пароль');
    } else {

        passwordInput.type = 'password';
        toggleButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
        `;
        toggleButton.setAttribute('title', 'Показать пароль');
    }


    passwordInput.focus();
}


function saveProfile(event) {
    event.preventDefault();

    const saveBtn = document.getElementById('saveProfileBtn');
    saveBtn.disabled = true;
    saveBtn.textContent = 'Сохранение...';


    const isNewProfile = !currentUser;
    const isEditing = currentUser && localStorage.getItem('userProfile_' + currentUser.username);

    console.log(`Режим операции: ${isNewProfile ? 'НОВЫЙ ПРОФИЛЬ' : 'РЕДАКТИРОВАНИЕ'}`);




    const avatarSrc = getAvatarSrc();
    if (!avatarSrc) {
        alert('❌ Пожалуйста, загрузите аватарку профиля');
        document.getElementById('avatarLinkInput').focus();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }


    const profileName = document.getElementById('profileName').value.trim();
    if (isNewProfile) {
        if (!profileName) {
            alert('✗ Пожалуйста, введите имя или псевдоним');
            document.getElementById('profileName').focus();
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить профиль';
            return;
        }

        if (profileName.length > 20) {
            alert('✗ Имя/псевдоним не может превышать 20 символов');
            document.getElementById('profileName').focus();
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить профиль';
            return;
        }
    }


    const profileNickname = document.getElementById('profileNickname').value.trim();
    if (isNewProfile && !profileNickname) {
        alert('✗ Пожалуйста, укажите ваш юзер в Telegram');
        document.getElementById('profileNickname').focus();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }


    const profileStyle = document.getElementById('profileStyle').value;
    if (isNewProfile && !profileStyle) {
        alert('✗ Пожалуйста, выберите стиль');
        document.getElementById('profileStyle').focus();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }


    if (isNewProfile && profileStyle === 'Другое') {
        const customStyle = document.getElementById('profileCustomStyle').value.trim();
        if (!customStyle) {
            alert('✗ Пожалуйста, укажите ваш стиль в поле "Другой стиль"');
            document.getElementById('profileCustomStyle').focus();
            saveBtn.disabled = false;
            saveBtn.textContent = 'Сохранить профиль';
            return;
        }
    }


    const socialLinks = collectSocialLinks();
    if (socialLinks.length === 0) {
        alert('✗ Пожалуйста, добавьте хотя бы одну социальную сеть');
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }


    if (uploadedWorksCount < 5) {
        alert(`✗ Пожалуйста, добавьте минимум 5 примеров работ. Сейчас добавлено: ${uploadedWorksCount}/5`);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }


    const userPassword = document.getElementById('profilePassword').value;
    if (!userPassword) {
        alert('✗ Пожалуйста, придумайте пароль для входа на сайт');
        document.getElementById('profilePassword').focus();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }

    if (!validatePassword(userPassword)) {
        alert('Пожалуйста, проверьте требования к паролю:\n- От 6 до 12 символов\n- Только английские буквы и цифры');
        document.getElementById('profilePassword').focus();
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }


    if (socialLinksCount > MAX_SOCIAL_LINKS) {
        alert(`✗ Максимум ${MAX_SOCIAL_LINKS} социальных сетей в бесплатном профиле`);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }

    if (uploadedWorksCount > MAX_WORKS) {
        alert(`✗ Максимум ${MAX_WORKS} работ в бесплатном профиле`);
        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';
        return;
    }




    let username;
    const existingUserId = findExistingUserId(profileNickname);

    if (existingUserId) {

        username = existingUserId;
        console.log(`🔄 Найден существующий профиль: ${username}`);
    } else {

        username = generateUserId(profileNickname);
        console.log(`🆕 Создан новый профиль: ${username}`);
    }


    let existingProfileData = {};
    if (isEditing) {
        const existingProfile = localStorage.getItem('userProfile_' + currentUser.username);
        if (existingProfile) {
            existingProfileData = JSON.parse(existingProfile);
            console.log('📁 Загружены существующие данные профиля для сохранения');
        }
    }


    const profileData = {
        profileName: isEditing ? existingProfileData.profileName : profileName,
        profileNickname: isEditing ? existingProfileData.profileNickname : profileNickname,
        profileStyle: isEditing ? existingProfileData.profileStyle :
            (profileStyle === 'Другое' ? document.getElementById('profileCustomStyle').value : profileStyle),
        profileCustomStyle: isEditing ? existingProfileData.profileCustomStyle :
            (profileStyle === 'Другое' ? document.getElementById('profileCustomStyle').value : ''),
        profileDescription: document.getElementById('profileDescription').value,
        userPassword: userPassword,
        avatar: avatarSrc,
        banner: getBannerSrc(), // <- ДОБАВЛЕНО
        socialLinks: socialLinks,
        works: collectWorks(),
        lastUpdated: new Date().toISOString(),
        publicationStatus: 'pending',
        userId: username,
        basicInfoLocked: true
    };


    localStorage.setItem('userProfile_' + username, JSON.stringify(profileData));


    if (!existingUserId) {
        localStorage.setItem('profilePublished_' + username, 'false');
    }


    const userData = {
        username: username,
        profileComplete: true,
        profileName: profileData.profileName,
        profileNickname: profileData.profileNickname,
        hasPassword: true,
        isNewProfile: !existingUserId
    };

    localStorage.setItem('currentUser', JSON.stringify(userData));
    localStorage.setItem('user_' + username, JSON.stringify(userData));


    currentUser = userData;


    updateAuthUI();


    const profileCode = generateProfileCode(profileData, username, userPassword);


    setTimeout(() => {
        if (existingUserId) {
            showProfileSuccess('✓ Профиль успешно обновлен! Основная информация сохранена.');
        } else {
            showProfileSuccess('');
        }

        saveBtn.disabled = false;
        saveBtn.textContent = 'Сохранить профиль';


        setTimeout(() => {
            closeProfileSetupModal();
            openCodeModal(profileCode, username, userPassword, existingUserId);
        }, 1500);
    }, 1500);


    localStorage.setItem('device_registered', 'true');

    if (existingUserId) {

        updateUserInDatabase(username, profileData);
    }
}


function syncUserData(username) {
    const localProfile = localStorage.getItem('userProfile_' + username);
    const dbProfile = userDatabase[username];

    if (!dbProfile) {
        console.log('✗ Пользователь не найден в базе данных:', username);
        return null;
    }

    // Обновляем локальные данные данными из базы (включая баннер)
    const mergedData = {
        ...dbProfile,
        username: dbProfile.username
    };

    // Сохраняем объединенные данные обратно в localStorage
    localStorage.setItem('userProfile_' + username, JSON.stringify(mergedData));

    console.log('🔄 Данные синхронизированы для:', username);

    // Специальная логика для баннера: если в базе есть баннер, используем его
    if (dbProfile.banner && dbProfile.banner.trim() !== '') {
        mergedData.banner = dbProfile.banner;
        console.log('🎨 Баннер загружен из базы данных');
    }

    return mergedData;
}

function getBannerSrc() {
    const bannerImg = document.querySelector('#bannerPreview img');
    return bannerImg && bannerImg.src && !bannerImg.src.includes('data:image/svg+xml')
        ? bannerImg.src
        : '';
}


function getAvatarSrc() {
    const avatarImg = document.querySelector('#avatarPreview img');
    return avatarImg && avatarImg.src && !avatarImg.src.includes('data:image/svg+xml')
        ? avatarImg.src
        : '';
}


function collectSocialLinks() {
    const socialLinks = [];
    document.querySelectorAll('.social-link-input').forEach(socialInput => {
        const platform = socialInput.querySelector('.social-platform-select').value;
        const usernameInput = socialInput.querySelector('.social-link-input-field');
        let username = usernameInput.value.trim();


        if (username) {

            const prefixes = {
                'telegram': ['https://t.me/', 't.me/', '@'],
                'instagram': ['https://instagram.com/', 'instagram.com/', '@'],
                'pinterest': ['https://pinterest.com/', 'pinterest.com/'],
                'youtube': ['https://youtube.com/', 'youtube.com/', '@'],
                'artstation': ['https://artstation.com/', 'artstation.com/'],
                'behance': ['https://behance.net/', 'behance.net/'],
                'vk': ['https://vk.com/', 'vk.com/'],
                'tiktok': ['https://www.tiktok.com/@', 'tiktok.com/@', '@']
            };

            const platformPrefixes = prefixes[platform] || [];


            let cleanedUsername = username;
            platformPrefixes.forEach(prefix => {
                if (cleanedUsername.startsWith(prefix)) {
                    cleanedUsername = cleanedUsername.substring(prefix.length);
                }
            });


            cleanedUsername = cleanedUsername.replace(/\/+$/, '');


            if (cleanedUsername !== username) {
                usernameInput.value = cleanedUsername;
            }

            username = cleanedUsername;
        }


        if (username && platform) {
            socialLinks.push({
                platform,
                username,
                fullUrl: getSocialPrefix(platform) + username
            });
        }
    });
    return socialLinks;
}


function collectWorks() {
    const works = [];
    const workElements = document.querySelectorAll('.work-link-preview img');


    for (let i = workElements.length - 1; i >= 0; i--) {
        const img = workElements[i];
        if (img.src) {
            works.push(img.src);
        }
    }

    return works;
}


function generateUserId(nickname) {

    const cleanNickname = nickname.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();


    const randomSuffix = Math.random().toString(36).substring(2, 6);

    return `user_${cleanNickname}_${randomSuffix}`;
}


function findExistingUserId(nickname) {
    const allUsers = Object.keys(localStorage).filter(key => key.startsWith('userProfile_'));

    for (let userKey of allUsers) {
        const userId = userKey.replace('userProfile_', '');
        const userProfile = JSON.parse(localStorage.getItem(userKey));

        if (userProfile && userProfile.profileNickname === nickname) {
            return userId;
        }
    }

    return null;
}


function getSocialPrefix(platform) {
    const prefixes = {
        'telegram': 'https://t.me/',
        'instagram': 'https://instagram.com/',
        'pinterest': 'https://pinterest.com/',
        'youtube': 'https://youtube.com/@',
        'artstation': 'https://artstation.com/',
        'behance': 'https://behance.net/',
        'vk': 'https://vk.com/',
        'tiktok': 'https://www.tiktok.com/@'
    };

    return prefixes[platform] || 'https://';
}


function validatePassword(password) {
    const isValidLength = password.length >= 6 && password.length <= 12;
    const isValidChars = /^[a-zA-Z0-9]+$/.test(password);

    return isValidLength && isValidChars;
}


function showProfileSuccess(message) {

    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(45deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.3);
        z-index: 10000;
        max-width: 300px;
        font-family: "Comfortaa", sans-serif;
        animation: slideInRight 0.5s ease-out;
    `;

    notification.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">✓ Успешно!</div>
        <div style="font-size: 0.9em;">${message}</div>
    `;

    document.body.appendChild(notification);


    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.4s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 500);
    }, 5000);
}



let currentProfileCode = '';


function openCodeModal(profileCode, username, userPassword, isExistingUser = false) {
    currentProfileCode = profileCode;

    const modal = document.getElementById('codeModal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    // Сбрасываем состояние кнопки
    const copyBtn = document.getElementById('copyCodeBtn');
    copyBtn.classList.remove('copied');
    copyBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            Скопировать код
        `;


    document.getElementById('successMessage').classList.remove('show');


    const instructionsBox = document.querySelector('.instructions-box');
    if (instructionsBox) {
        if (isExistingUser) {
            instructionsBox.innerHTML = `
                    <h4 class="instructions-title">Обновление профиля</h4>
                    <div style="background: rgba(33, 150, 243, 0.1); padding: 15px; border-radius: 8px; margin: 15px 0; border-left: 3px solid #2196F3;">
                        <div style="text-align: center; color: #2196F3; font-weight: bold; margin-bottom: 10px;">
                             Профиль успешно обновлен!
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.9em;">
                            <div><strong>User ID:</strong> ${username}</div>
                            <div><strong>Статус:</strong> Проходит проверку</div>
                        </div>
                    </div>
                    
                    <h4 class="instructions-title">Дальнейшие действия:</h4>
                    <ol class="instructions-list">
                        <li>Нажмите кнопку <strong>"Скопировать код"</strong></li>
                        <li>Отправьте код модераторам для обновления информации</li>
                        <li>Войти в аккаунт вы можете, введя ID и свой пароль, после проверки модератором </li>
                    </ol>
                    
                    <div style="background: rgba(76, 175, 80, 0.1); padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #4CAF50;">
                        <p style="color: #e0e0e0; font-size: 0.9em; margin: 0; text-align: center;">
                            Ваш ID остался прежним. Вы можете продолжать использовать те же данные для входа.
                        </p>
                    </div>
                `;
        } else {
            instructionsBox.innerHTML = `
                    <h4 class="instructions-title"> Что делать дальше:</h4>
                    <ol class="instructions-list">
                        <li>Нажмите кнопку <strong>"Скопировать код"</strong> выше</li>
                        <li>Перейдите в предложку канала:
                            <a href="https://t.me/Artemisia_website" class="instructions-link" target="_blank">
                                @Artemisia_website
                            </a>
                        </li>
                        <li>Отправьте скопированный код </li>
                        <li>Ожидайте проверки вашей анкеты модераторами</li>
                        <li>После проверки ваш профиль появится на сайте</li>
                    </ol>
                    
                    <div style="background: rgba(255, 152, 0, 0.1); padding: 12px; border-radius: 8px; margin-top: 15px; border-left: 3px solid #ff9800;">
                        <div style="display: flex; align-items: center; gap: 8px; color: #ff9800; font-weight: bold; margin-bottom: 5px;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="#ff9800">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                            </svg>
                            Код содержит всю необходимую информацию
                        </div>
                    </div>
                    
                    <p style="color: #ffcc00; margin-top: 15px; font-size: 0.9em; text-align: center;">
                        ⏳ Обычно проверка занимает от 1 до 3 дней
                    </p>
                `;
        }
    }
}


function formatText(command) {
    const textarea = document.getElementById('profileDescription');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);

    let formattedText = '';

    switch (command) {
        case 'bold':
            formattedText = `<b>${selectedText}</b>`;
            break;
        case 'italic':
            formattedText = `<i>${selectedText}</i>`;
            break;
        case 'underline':
            formattedText = `<u>${selectedText}</u>`;
            break;
        case 'link':
            const url = prompt('Введите URL ссылки:', 'https://');
            if (url) {
                formattedText = `<a href="${url}" target="_blank">${selectedText}</a>`;
            } else {
                return;
            }
            break;
        default:
            return;
    }


    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.value = newValue;


    autoResizeTextarea(textarea);


    updateDescriptionCounter(textarea);


    const newCursorPos = start + formattedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    textarea.focus();
}


function safeHtml(html) {
    if (!html) return '';


    const allowedTags = {
        'b': true, 'strong': true,
        'i': true, 'em': true,
        'u': true,
        'a': ['href', 'target'],
        'br': true,
        'p': true
    };


    let cleanedHtml = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/on\w+="[^"]*"/g, '')
        .replace(/on\w+='[^']*'/g, '')
        .replace(/javascript:/gi, '');

    return cleanedHtml;
}




function generateUserId(nickname) {

    const cleanNickname = nickname.replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();


    const randomSuffix = Math.random().toString(36).substring(2, 6);

    return `user_${cleanNickname}_${randomSuffix}`;
}


function findExistingUserId(nickname) {
    const allUsers = Object.keys(localStorage).filter(key => key.startsWith('userProfile_'));

    for (let userKey of allUsers) {
        const userId = userKey.replace('userProfile_', '');
        const userProfile = JSON.parse(localStorage.getItem(userKey));

        if (userProfile && userProfile.profileNickname === nickname) {
            return userId;
        }
    }

    return null;
}


document.addEventListener('DOMContentLoaded', function () {
    checkAuthStatus();


    const registeredUsers = getRegisteredUsers();
    if (registeredUsers.length > 0) {
        console.log('📋 Зарегистрированные пользователи на этом устройстве:', registeredUsers);
    }




    const firstFilter = document.querySelector('.filters-dropdown a:first-child');
    if (firstFilter) firstFilter.classList.add('active-filter');


    window.addEventListener('resize', () => {
        Object.keys(carouselStates).forEach(worksInnerId => {
            carouselStates[worksInnerId].currentTranslate = 0;
            setPosition(worksInnerId);
        });
    });


    initImageModal();
});



function setupDynamicValidation() {

    document.getElementById('profileName').addEventListener('input', validateName);
    document.getElementById('profileNickname').addEventListener('input', validateNickname);
    document.getElementById('profileStyle').addEventListener('change', validateStyle);
    document.getElementById('profileCustomStyle').addEventListener('input', validateCustomStyle);
    document.getElementById('profilePassword').addEventListener('input', validatePassword);


    document.addEventListener('input', function (e) {
        if (e.target.classList.contains('social-link-input-field')) {

            setTimeout(() => {
                validateSocialLink(e.target);
            }, 100);
        }
    });

    document.addEventListener('input', updateOverallValidation);
}


function validateName() {
    const nameInput = document.getElementById('profileName');
    const nameValue = nameInput.value.trim();
    const counter = document.getElementById('nameCharCounter');

    if (nameValue.length > 0 && nameValue.length <= 20) {
        nameInput.style.borderColor = '#4CAF50';
        nameInput.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        if (counter) counter.style.color = '#4CAF50';
        return true;
    } else {
        nameInput.style.borderColor = '#f44336';
        nameInput.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        if (counter) counter.style.color = '#f44336';
        return false;
    }
}


function validateNickname() {
    const nicknameInput = document.getElementById('profileNickname');
    const nicknameValue = nicknameInput.value.trim();

    if (nicknameValue.length > 0) {
        nicknameInput.style.borderColor = '#4CAF50';
        nicknameInput.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        return true;
    } else {
        nicknameInput.style.borderColor = '#f44336';
        nicknameInput.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        return false;
    }
}


function validateStyle() {
    const styleSelect = document.getElementById('profileStyle');
    const customStyleInput = document.getElementById('profileCustomStyle');
    const styleValue = styleSelect.value;

    if (styleValue === 'Другое') {
        customStyleInput.disabled = false;
        customStyleInput.required = true;
        validateCustomStyle();
        return validateCustomStyle();
    } else if (styleValue) {
        styleSelect.style.borderColor = '#4CAF50';
        styleSelect.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        customStyleInput.disabled = true;
        customStyleInput.required = false;
        customStyleInput.style.borderColor = '#444';
        customStyleInput.style.boxShadow = 'none';
        return true;
    } else {
        styleSelect.style.borderColor = '#f44336';
        styleSelect.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        return false;
    }
}


function validateCustomStyle() {
    const customStyleInput = document.getElementById('profileCustomStyle');
    const customStyleValue = customStyleInput.value.trim();

    if (customStyleInput.disabled) {
        customStyleInput.style.borderColor = '#444';
        customStyleInput.style.boxShadow = 'none';
        return true;
    }

    if (customStyleValue.length > 0) {
        customStyleInput.style.borderColor = '#4CAF50';
        customStyleInput.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        return true;
    } else {
        customStyleInput.style.borderColor = '#f44336';
        customStyleInput.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        return false;
    }
}


function validatePassword() {
    const passwordInput = document.getElementById('profilePassword');
    const passwordValue = passwordInput.value;
    const requirements = document.getElementById('passwordRequirements');

    const isValidLength = passwordValue.length >= 6 && passwordValue.length <= 12;
    const isValidChars = /^[a-zA-Z0-9]+$/.test(passwordValue);
    const isValid = isValidLength && isValidChars;


    const lengthReq = document.getElementById('reqLength');
    const charsReq = document.getElementById('reqChars');

    if (isValidLength) {
        lengthReq.classList.add('valid');
        lengthReq.classList.remove('invalid');
    } else {
        lengthReq.classList.remove('valid');
        lengthReq.classList.add('invalid');
    }

    if (isValidChars) {
        charsReq.classList.add('valid');
        charsReq.classList.remove('invalid');
    } else {
        charsReq.classList.remove('valid');
        charsReq.classList.add('invalid');
    }


    if (isValid) {
        passwordInput.style.borderColor = '#4CAF50';
        passwordInput.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
    } else {
        passwordInput.style.borderColor = '#f44336';
        passwordInput.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
    }

    return isValid;
}


function validateSocialLinks() {
    const socialLinks = collectSocialLinks();
    const socialCounter = document.getElementById('socialCounter');
    const socialSection = document.querySelector('.form-section:nth-child(4)');

    if (socialLinks.length >= 1) {
        socialSection.style.borderLeftColor = '#4CAF50';
        socialCounter.style.color = '#4CAF50';
        socialCounter.innerHTML = `✓ Минимум достигнут | Добавлено: ${socialLinks.length}`;
        return true;
    } else {
        socialSection.style.borderLeftColor = '#f44336';
        socialCounter.style.color = '#f44336';
        socialCounter.innerHTML = `✗ Обязательно: минимум 1 соцсеть | Добавлено: ${socialLinks.length}`;
        return false;
    }
}


function validateWorks() {
    const works = collectWorks();
    const worksCounter = document.getElementById('worksCounter');
    const worksSection = document.querySelector('.form-section:nth-child(5)');

    if (works.length >= 5) {
        worksSection.style.borderLeftColor = '#4CAF50';
        worksCounter.style.color = '#4CAF50';
        worksCounter.textContent = `✓ Минимум достигнут | Добавлено: ${works.length}работ`;
        return true;
    } else if (works.length > 0) {
        worksSection.style.borderLeftColor = '#ff9800';
        worksCounter.style.color = '#ff9800';
        worksCounter.textContent = `⚠️ Нужно еще ${5 - works.length} работ | Добавлено: ${works.length}`;
        return false;
    } else {
        worksSection.style.borderLeftColor = '#f44336';
        worksCounter.style.color = '#f44336';
        worksCounter.textContent = `✗ Минимум: 5 работ | Добавлено: ${works.length} работ`;
        return false;
    }
}


function validateAvatar() {
    const avatarSrc = getAvatarSrc();
    const avatarSection = document.querySelector('.form-section:first-child');

    if (avatarSrc) {
        avatarSection.style.borderLeftColor = '#4CAF50';
        return true;
    } else {
        avatarSection.style.borderLeftColor = '#f44336';
        return false;
    }
}


function toggleDescription() {
    const description = document.getElementById('cabinetDescription');
    const expandBtn = document.getElementById('expandDescriptionBtn');

    if (description.classList.contains('expanded')) {

        description.style.maxHeight = '200px';
        expandBtn.textContent = 'Развернуть';
        description.classList.remove('expanded');
    } else {

        description.style.maxHeight = 'none';
        expandBtn.textContent = 'Свернуть';
        description.classList.add('expanded');
    }
}


function loadCabinetDescription(description) {
    const container = document.getElementById('cabinetDescription');
    const expandBtn = document.getElementById('expandDescriptionBtn');

    if (description && description.trim() !== '') {

        container.innerHTML = safeHtml(description);
        container.classList.remove('premium-locked');


        const textHeight = container.scrollHeight;
        if (textHeight > 200) {
            expandBtn.style.display = 'block';
        } else {
            expandBtn.style.display = 'none';
        }
    } else {
        container.innerHTML = `
            <div class="premium-locked">
                <div class="premium-icon"></div>
                <p class="premium-text">Описание профиля не добавлено</p>
            </div>
        `;
        expandBtn.style.display = 'none';
    }
}


function updateOverallValidation() {
    const isNameValid = validateName();
    const isNicknameValid = validateNickname();
    const isStyleValid = validateStyle();
    const isPasswordValid = validatePassword();
    const isSocialValid = validateSocialLinks();
    const isWorksValid = validateWorks();
    const isAvatarValid = validateAvatar();
    const isBannerValid = validateBanner();

    const allValid = isNameValid && isNicknameValid && isStyleValid &&
        isPasswordValid && isSocialValid && isWorksValid &&
        isAvatarValid && isBannerValid;


    const saveBtn = document.getElementById('saveProfileBtn');
    if (allValid) {
        saveBtn.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
        saveBtn.style.cursor = 'pointer';
    } else {
        saveBtn.style.background = 'linear-gradient(45deg, #ffcc00, #ffdd33)';
        saveBtn.style.cursor = 'not-allowed';
    }

    return allValid;
}


function getAllPublishedProfiles() {
    const publishedProfiles = [];

    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('profile_page_')) {
            const username = key.replace('profile_page_', '');
            const publicationInfo = getPublicationPage(username);
            const userProfile = localStorage.getItem('userProfile_' + username);

            if (userProfile) {
                publishedProfiles.push({
                    username: username,
                    profileData: JSON.parse(userProfile),
                    publicationInfo: publicationInfo
                });
            }
        }
    });

    return publishedProfiles;
}


function showFullPublicationStats() {
    const allProfiles = getAllPublishedProfiles();
    const statsByPage = {};

    allProfiles.forEach(profile => {
        const page = profile.publicationInfo.page;
        if (!statsByPage[page]) {
            statsByPage[page] = [];
        }
        statsByPage[page].push(profile);
    });

    console.log('📊 Стата');
    console.log('══════════════════════════════════');

    Object.keys(statsByPage).forEach(page => {
        console.log(`\n📁 ${getPageDisplayName(page)}: ${statsByPage[page].length} профилей`);
        statsByPage[page].forEach((profile, index) => {
            console.log(`   ${index + 1}. ${profile.profileData.profileName} (@${profile.profileData.profileNickname})`);
        });
    });

    console.log(`\n📈 ВСЕГО: ${allProfiles.length} опубликованных профилей`);
}


function showModeratorStats() {
    showFullPublicationStats();
}

function getUserDatabase() {
    return userDatabase;
}


function verifyUserPassword(username, password) {
    const userData = userDatabase[username];
    if (!userData) return false;

    return userData.password === password;
}

function addUserPassword(userId, password) {
    if (userId && password) {
        moderatorPasswords[userId] = password;
        console.log(`Пароль для пользователя ${userId} добавлен модератором`);
        return true;
    }
    return false;
}

function verifyUserPassword(username, password) {
    const user = userDatabase[username];
    if (!user) {
        console.log('❌ Пользователь не найден:', username);
        return false;
    }

    const isPasswordCorrect = user.password === password;
    console.log(`🔐 Проверка пароля для ${username}: ${isPasswordCorrect ? '✅' : '❌'}`);
    return isPasswordCorrect;
}

function getUsersWithoutPasswords() {
    const users = [];
    const allUsers = Object.keys(localStorage).filter(key => key.startsWith('userProfile_'));

    allUsers.forEach(userKey => {
        const userId = userKey.replace('userProfile_', '');
        if (!moderatorPasswords[userId]) {
            users.push(userId);
        }
    });

    return users;
}

function copyProfileLink() {
    if (!currentUser) return;

    // Показываем лоадер/состояние загрузки
    const shareBtn = document.querySelector('.share-link-btn');
    if (shareBtn) {
        const originalHTML = shareBtn.innerHTML;
        shareBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="white"><path d="M19 8l-4 4h3c0 3.31-2.69 6-6 6-1.01 0-1.97-.25-2.8-.7l-1.46 1.46C8.97 19.54 10.43 20 12 20c4.42 0 8-3.58 8-8h3l-4-4zM6 12c0-3.31 2.69-6 6-6 1.01 0 1.97.25 2.8.7l1.46-1.46C15.03 4.46 13.57 4 12 4c-4.42 0-8 3.58-8 8H1l4 4 4-4H6z"/></svg>';
        shareBtn.style.transform = 'scale(0.9)';

        setTimeout(() => {
            shareBtn.innerHTML = originalHTML;
            shareBtn.style.transform = '';
        }, 300);
    }

    // Ищем профиль по ID пользователя в localStorage
    const userProfile = localStorage.getItem('userProfile_' + currentUser.username);
    let profileUrl = '';

    if (userProfile) {
        try {
            const profileData = JSON.parse(userProfile);

            // 1. Сначала пытаемся найти профиль по имени из данных пользователя
            const profileNameForSearch = profileData.profileName || '';
            const profileIdFromName = profileNameForSearch.toLowerCase().replace(/\s+/g, '');

            // Ищем профиль на странице
            let foundProfile = null;
            document.querySelectorAll('section[id]').forEach(section => {
                const sectionId = section.id;
                // Проверяем, содержит ли ID имя пользователя
                if (sectionId.includes(profileIdFromName) ||
                    section.querySelector('h1')?.textContent?.toLowerCase() === profileNameForSearch.toLowerCase()) {
                    foundProfile = section;
                }
            });

            if (foundProfile) {
                // Формируем ссылку с найденным ID раздела
                const baseUrl = window.location.origin + window.location.pathname;
                profileUrl = `${baseUrl}#${foundProfile.id}`;
            } else {
                // 2. Если профиль не найден на странице, формируем ID из имени
                const baseUrl = window.location.origin + window.location.pathname;
                profileUrl = `${baseUrl}#${profileIdFromName}`;
            }

        } catch (e) {
            console.error('Ошибка при парсинге профиля:', e);
        }
    }

    // Если не удалось сформировать URL из профиля, используем старый метод
    if (!profileUrl) {
        const profileName = document.getElementById('cabinetUsername')?.textContent || 'profile';
        const profileId = profileName.toLowerCase().replace(/\s+/g, '');
        const baseUrl = window.location.origin + window.location.pathname;
        profileUrl = `${baseUrl}#${profileId}`;
    }

    // Используем modern Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(profileUrl).then(() => {
            // Показываем уведомление об успехе
            showLinkCopiedNotification();
            console.log('✓ Ссылка скопирована:', profileUrl);
        }).catch(err => {
            console.error('✗ Ошибка при копировании ссылки:', err);
            showErrorNotification('Не удалось скопировать ссылку');
        });
    } else {
        // Fallback для старых браузеров
        const textArea = document.createElement('textarea');
        textArea.value = profileUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                showLinkCopiedNotification();
                console.log('✓ Ссылка скопирована (fallback):', profileUrl);
            } else {
                showErrorNotification('Не удалось скопировать ссылку');
            }
        } catch (err) {
            console.error('✗ Ошибка fallback копирования:', err);
            showErrorNotification('Ошибка копирования');
        } finally {
            document.body.removeChild(textArea);
        }
    }
}

function findProfileSectionId(username) {
    // Получаем данные профиля
    const userProfile = localStorage.getItem('userProfile_' + username);
    if (!userProfile) return null;

    try {
        const profileData = JSON.parse(userProfile);
        const profileName = profileData.profileName || '';

        // Ищем все секции с профилями на странице
        const profileSections = document.querySelectorAll('section[id]');

        for (const section of profileSections) {
            const h1Element = section.querySelector('h1');
            if (h1Element && h1Element.textContent.trim() === profileName.trim()) {
                return section.id; // Возвращаем точный ID секции
            }
        }

        // Если не нашли точное совпадение, ищем по части имени
        const profileNameLower = profileName.toLowerCase().replace(/\s+/g, '');
        for (const section of profileSections) {
            const sectionId = section.id;
            if (sectionId.includes(profileNameLower)) {
                return sectionId;
            }
        }

        return null;
    } catch (e) {
        console.error('Ошибка поиска секции профиля:', e);
        return null;
    }
}

function showLinkCopiedNotification() {
    // Вибрация для мобильных устройств (если поддерживается)
    if (navigator.vibrate) {
        navigator.vibrate(50); // Вибрация 50ms
    }

    // Удаляем старое уведомление если есть
    const oldNotification = document.getElementById('linkCopiedNotification');
    if (oldNotification) {
        oldNotification.remove();
    }

    // Создаем новое уведомление
    const notification = document.createElement('div');
    notification.id = 'linkCopiedNotification';
    notification.className = 'link-copied-notification show';
    notification.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
        </svg>
        <span>Ссылка скопирована!</span>
    `;

    document.body.appendChild(notification);

    // Автоматически скрываем через 2.5 секунды
    setTimeout(() => {
        notification.classList.remove('show');
        notification.style.animation = 'slideOutLeft 0.3s ease-in';

        // Удаляем из DOM после анимации
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 2500);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.id = 'errorNotification';
    notification.className = 'link-copied-notification show';
    notification.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
    notification.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        notification.style.animation = 'slideOutLeft 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showErrorNotification(message) {
    const notification = document.createElement('div');
    notification.id = 'errorNotification';
    notification.className = 'link-copied-notification show';
    notification.style.background = 'linear-gradient(45deg, #f44336, #d32f2f)';
    notification.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-12S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
        </svg>
        <span>${message}</span>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.classList.remove('show');
        notification.style.animation = 'slideOutLeft 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function loadCabinetFromDatabase(userData) {
    // Заполняем данные в личном кабинете
    document.getElementById('cabinetAvatar').src = userData.avatar || 'https://i.postimg.cc/Rhz86Z09/photo_5337314107818374848_c.jpg';
    document.getElementById('cabinetUsername').textContent = userData.profileName || currentUser.username;
    document.getElementById('cabinetUserId').textContent = 'ID: ' + currentUser.username;
    document.getElementById('cabinetTelegramText').textContent = userData.profileNickname || '@username';
    document.getElementById('cabinetTelegramLink').href = 'https://t.me/' + (userData.profileNickname || 'username').replace('@', '');

    // Обновляем статус публикации
    const publicationStatus = getProfilePublicationStatus(currentUser.username);
    updatePublicationStatus(publicationStatus, userData);

    // Инициализируем функциональность копирования ID
    setupIdCopyFunctionality();

    // Загружаем социальные сети
    loadCabinetSocialLinks(userData.socialLinks);

    // Загружаем описание
    loadCabinetDescription(userData.profileDescription);


    loadCabinetWorks(userData.works);


    updateCabinetActionsForMobile();

    console.log(`✅ Личный кабинет загружен из базы данных для: ${currentUser.username}`);
}

// ========== ДОПОЛНИТЕЛЬНЫЕ СТИЛИ ДЛЯ СТАТУСОВ ==========

const enhancedStatusStyles = document.createElement('style');
enhancedStatusStyles.textContent = `
.publication-status {
    position: absolute;
    top: 0;
    right: 0;
    padding: 10px 15px;
    background: rgba(255, 152, 0, 0.1);
    border-radius: 8px;
    border-left: 3px solid #ff9800;
    max-width: 250px;
    text-align: right;
}

.publication-status.published {
    background: rgba(76, 175, 80, 0.1);
    border-left-color: #4CAF50;
}

.publication-status .status-text {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #ff9800;
    font-weight: bold;
    font-size: 0.9em;
    justify-content: flex-end;
}

.publication-status.published .status-text {
    color: #4CAF50;
}

/* АДАПТАЦИЯ ДЛЯ МОБИЛЬНЫХ УСТРОЙСТВ */
@media (max-width: 768px) {
    .publication-status {
        position: static;
        margin-top: 15px;
        text-align: center;
        max-width: 100%;
    }
    
    .publication-status .status-text {
        justify-content: center;
    }
}

/* Стили для расширенной информации о публикации */
.publication-details {
    font-size: 0.8em;
    color: #aaa;
    margin-top: 5px;
    text-align: center;
}
`;
document.head.appendChild(enhancedStatusStyles);


document.getElementById('profileName').addEventListener('input', function () {
    const maxLength = 20;
    const currentLength = this.value.length;
    const counter = document.getElementById('nameCharCounter');

    if (counter) {
        counter.textContent = `${currentLength}/${maxLength} символов`;


        counter.classList.remove('warning', 'error');
        if (currentLength >= maxLength - 5 && currentLength < maxLength) {
            counter.classList.add('warning');
        } else if (currentLength >= maxLength) {
            counter.classList.add('error');
        }


        if (currentLength > maxLength) {
            this.value = this.value.substring(0, maxLength);
        }
    }
});


function updateDescriptionCounter(textarea) {
    const counter = document.getElementById('descriptionCharCounter');
    const maxLength = 1000;
    const currentLength = textarea.value.length;
    const remaining = maxLength - currentLength;

    counter.textContent = `Осталось символов: ${remaining}`;


    counter.classList.remove('warning', 'error');
    if (remaining <= 50 && remaining > 20) {
        counter.classList.add('warning');
        counter.style.color = '#ffcc00';
    } else if (remaining <= 20) {
        counter.classList.add('error');
        counter.style.color = '#ff6b6b';
    } else {
        counter.style.color = '#aaa';
    }
}


function validateDescription() {
    const descriptionInput = document.getElementById('profileDescription');
    const descriptionValue = descriptionInput.value.trim();


    if (descriptionValue.length <= 1000) {
        descriptionInput.style.borderColor = '#4CAF50';
        descriptionInput.style.boxShadow = '0 0 0 2px rgba(76, 175, 80, 0.2)';
        return true;
    } else {
        descriptionInput.style.borderColor = '#f44336';
        descriptionInput.style.boxShadow = '0 0 0 2px rgba(244, 67, 54, 0.2)';
        return false;
    }
}


function autoResizeTextarea(textarea) {
    // Сбрасываем высоту до auto для корректного расчета
    textarea.style.height = 'auto';

    // Вычисляем новую высоту на основе scrollHeight
    const newHeight = Math.min(textarea.scrollHeight, 200);

    // Устанавливаем новую высоту
    textarea.style.height = newHeight + 'px';

    // Добавляем плавный переход
    textarea.style.transition = 'height 0.2s ease-out';
}


function verifyPageCode(event) {
    event.preventDefault();

    const code = document.getElementById('pageVerificationCode').value.trim();
    const verifyBtn = document.getElementById('verifyPageBtn');
    const messageDiv = document.getElementById('pageVerificationMessage');

    if (!code) {
        showPageVerificationMessage('Пожалуйста, введите код подтверждения', 'error');
        document.getElementById('pageVerificationCode').focus();
        return;
    }

    verifyBtn.disabled = true;
    verifyBtn.textContent = 'Проверка...';

    // Проверка кода 888666 - здесь можно настроить разные коды для разных страниц
    setTimeout(() => {
        // Коды для разных страниц (можно настроить)
        const pageCodes = {
            '888666': 'all',

        };

        if (pageCodes[code]) {
            const allowedPage = pageCodes[code];
            const userPage = getPublicationPage(currentUser.username).page;


            if (allowedPage === 'all' || allowedPage === userPage) {
                showPageVerificationMessage('Код подтвержден! Теперь вы можете редактировать профиль.', 'success');

                // Через 2 секунды закрываем модальное окно и открываем настройку профиля
                setTimeout(() => {
                    closePageVerificationModal();
                    openProfileSetupModalDirect();
                }, 2000);
            } else {
                showPageVerificationMessage('Этот код не подходит для вашей страницы.', 'error');
                verifyBtn.disabled = false;
                verifyBtn.textContent = 'Подтвердить и продолжить';
            }
        } else {
            showPageVerificationMessage('Неверный код подтверждения.', 'error');
            verifyBtn.disabled = false;
            verifyBtn.textContent = 'Подтвердить и продолжить';
            document.getElementById('pageVerificationCode').focus();
            document.getElementById('pageVerificationCode').select();
        }
    }, 1500);
}
