// ============================================
// Camp 8 — Shared AI Chat Engine
// Used by: chat.html, nil-rating.html,
//          combine-eval.html
// ============================================

const CAMP8_AI = (function() {
  'use strict';

  const API_ENDPOINT = '/.netlify/functions/chat';

  // Send a message to the AI
  async function send({ messages, system, max_tokens = 1024 }) {
    try {
      const res = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages, system, max_tokens }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data.content?.[0]?.text || '';
    } catch (err) {
      throw err;
    }
  }

  // Build a chat UI inside a container element
  function buildChatUI({
    container,       // DOM element to render into
    system,          // System prompt string
    welcomeMsg,      // First bot message
    placeholder,     // Input placeholder text
    accentColor,     // CSS color for accents
    onResponse,      // Optional callback(botText, messages)
  }) {
    const color = accentColor || '#d4a843';
    let messages = [];

    container.innerHTML = `
      <div class="c8ai-wrap" style="--c8-accent:${color}">
        <div class="c8ai-messages" id="c8msgs"></div>
        <div class="c8ai-input-row">
          <textarea class="c8ai-input" id="c8input" placeholder="${placeholder || 'Type a message…'}" rows="1"></textarea>
          <button class="c8ai-send" id="c8send" onclick="window._c8SendMsg()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          </button>
        </div>
        <div class="c8ai-footer">Powered by Claude AI · Camp 8</div>
      </div>`;

    const msgsEl = container.querySelector('#c8msgs');
    const inputEl = container.querySelector('#c8input');

    // Auto-resize textarea
    inputEl.addEventListener('input', function() {
      this.style.height = 'auto';
      this.style.height = Math.min(this.scrollHeight, 120) + 'px';
    });

    // Send on Enter (Shift+Enter for newline)
    inputEl.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        window._c8SendMsg();
      }
    });

    function appendMsg(role, text, isTyping) {
      const div = document.createElement('div');
      div.className = 'c8ai-msg c8ai-' + role + (isTyping ? ' c8ai-typing' : '');
      div.innerHTML = isTyping
        ? '<span class="c8ai-dot"></span><span class="c8ai-dot"></span><span class="c8ai-dot"></span>'
        : formatText(text);
      msgsEl.appendChild(div);
      msgsEl.scrollTop = msgsEl.scrollHeight;
      return div;
    }

    function formatText(text) {
      // Convert **bold**, *italic*, newlines, and basic markdown
      return text
        .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
        .replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>')
        .replace(/\*(.+?)\*/g,'<em>$1</em>')
        .replace(/\n\n/g,'</p><p>')
        .replace(/\n/g,'<br>')
        .replace(/^(.+)$/,'<p>$1</p>');
    }

    // Show welcome message
    if (welcomeMsg) {
      appendMsg('assistant', welcomeMsg);
    }

    // Global send function
    window._c8SendMsg = async function() {
      const text = inputEl.value.trim();
      if (!text) return;
      inputEl.value = '';
      inputEl.style.height = 'auto';

      appendMsg('user', text);
      messages.push({ role: 'user', content: text });

      const sendBtn = container.querySelector('#c8send');
      sendBtn.disabled = true;
      const typingEl = appendMsg('assistant', '', true);

      try {
        const reply = await send({ messages, system, max_tokens: 1024 });
        typingEl.remove();
        appendMsg('assistant', reply);
        messages.push({ role: 'assistant', content: reply });
        if (onResponse) onResponse(reply, messages);
      } catch (err) {
        typingEl.remove();
        appendMsg('assistant', 'Sorry, something went wrong. Please try again in a moment.');
      } finally {
        sendBtn.disabled = false;
        inputEl.focus();
      }
    };

    return {
      appendMsg,
      getMessages: () => messages,
      reset: () => {
        messages = [];
        msgsEl.innerHTML = '';
        if (welcomeMsg) appendMsg('assistant', welcomeMsg);
      }
    };
  }

  // CSS for the shared chat UI
  const CSS = `
.c8ai-wrap {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: var(--bg-primary, #080810);
  font-family: 'DM Sans', sans-serif;
}
.c8ai-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  scrollbar-width: thin;
  scrollbar-color: rgba(255,255,255,0.08) transparent;
}
.c8ai-msg {
  max-width: 78%;
  padding: 12px 16px;
  border-radius: 12px;
  font-size: 0.9rem;
  line-height: 1.6;
  animation: c8fadeIn 0.2s ease;
}
.c8ai-msg p { margin: 0 0 8px; }
.c8ai-msg p:last-child { margin: 0; }
@keyframes c8fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
.c8ai-user {
  align-self: flex-end;
  background: var(--c8-accent, #d4a843);
  color: #0a0a12;
  font-weight: 500;
  border-bottom-right-radius: 4px;
}
.c8ai-assistant {
  align-self: flex-start;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.08);
  color: #eeeef8;
  border-bottom-left-radius: 4px;
}
.c8ai-typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 16px;
  min-width: 60px;
}
.c8ai-dot {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--c8-accent, #d4a843);
  animation: c8bounce 1.2s infinite;
}
.c8ai-dot:nth-child(2) { animation-delay: 0.2s; }
.c8ai-dot:nth-child(3) { animation-delay: 0.4s; }
@keyframes c8bounce { 0%,80%,100% { opacity: 0.3; transform: scale(0.8); } 40% { opacity: 1; transform: scale(1.1); } }
.c8ai-input-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid rgba(255,255,255,0.07);
  background: rgba(255,255,255,0.02);
}
.c8ai-input {
  flex: 1;
  padding: 10px 14px;
  font-size: 0.88rem;
  font-family: 'DM Sans', sans-serif;
  background: rgba(255,255,255,0.06);
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: 10px;
  color: #eeeef8;
  outline: none;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  line-height: 1.5;
  transition: border-color 0.15s;
}
.c8ai-input:focus { border-color: var(--c8-accent, #d4a843); }
.c8ai-input::placeholder { color: rgba(255,255,255,0.25); }
.c8ai-send {
  width: 40px; height: 40px;
  border-radius: 10px;
  background: var(--c8-accent, #d4a843);
  color: #0a0a12;
  border: none;
  cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  transition: all 0.15s;
}
.c8ai-send:hover { opacity: 0.9; transform: scale(1.05); }
.c8ai-send:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }
.c8ai-footer {
  text-align: center;
  font-size: 0.65rem;
  color: rgba(255,255,255,0.2);
  padding: 6px;
  letter-spacing: 0.05em;
}
`;

  function injectCSS() {
    if (document.getElementById('c8ai-styles')) return;
    const style = document.createElement('style');
    style.id = 'c8ai-styles';
    style.textContent = CSS;
    document.head.appendChild(style);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', injectCSS);
  } else {
    injectCSS();
  }

  return { send, buildChatUI };
})();
