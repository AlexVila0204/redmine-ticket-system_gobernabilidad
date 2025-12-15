
const REDMINE_API_KEY = 'e7a11d669cac0296017269f8ce4687283004a2e4'; 
const PROJECT_IDENTIFIER = 'gestion-de-sistema-de-tickets';
const BASE_URL = 'http://localhost:8080/api';
const REDMINE_URL = `${BASE_URL}/projects/${PROJECT_IDENTIFIER}/issues.json`;

const statusIndicator = document.querySelector('.footer-text');
const form = document.getElementById('ticketForm');
const messageElement = document.getElementById('message');

async function checkConnection() {
    try {
        const response = await fetch(`${BASE_URL}/projects/${PROJECT_IDENTIFIER}.json`, {
            method: 'GET',
            headers: {
                'X-Redmine-API-Key': REDMINE_API_KEY
            }
        });

        if (response.ok) {
            updateStatus(true, 'Conectado a Redmine');
            return true;
        } else {
            updateStatus(false, 'Error de autenticación');
            return false;
        }
    } catch (error) {
        console.error('Error de conexión:', error);
        updateStatus(false, 'Sin conexión a Redmine');
        return false;
    }
}

function updateStatus(connected, text) {
    if (statusIndicator) {
        const icon = connected 
            ? '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
            : '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
        
        statusIndicator.innerHTML = icon + ' ' + text;
        statusIndicator.style.color = connected ? 'hsl(142, 76%, 56%)' : 'hsl(0, 78%, 62%)';
    }
}

function showMessage(text, type) {
    messageElement.textContent = text;
    messageElement.className = 'show ' + type;
}

async function submitTicket(subject, description) {
    const payload = {
        issue: {
            subject: subject,
            description: description,
        }
    };

    showMessage('Enviando ticket...', 'loading');

    try {
        const response = await fetch(REDMINE_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Redmine-API-Key': REDMINE_API_KEY
            },
            body: JSON.stringify(payload)
        });

        if (response.ok) {
            const result = await response.json();
            showMessage(`✅ Ticket creado exitosamente. ID: #${result.issue.id}`, 'success');
            form.reset();
        } else {
            const errorText = await response.text();
            showMessage(`❌ Error al crear ticket: ${response.status}`, 'error');
            console.error('Error:', errorText);
        }

    } catch (error) {
        console.error('Error de red/conexión:', error);
        showMessage('❌ Error de conexión. Verifica que Redmine esté corriendo.', 'error');
    }
}

form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const subject = document.getElementById('subject').value;
    const description = document.getElementById('description').value;
    
    await submitTicket(subject, description);
});

document.addEventListener('DOMContentLoaded', function() {
    checkConnection();
    
    setInterval(checkConnection, 30000);
});
