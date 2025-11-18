function uid(){
  const k='chat_user_id';
  let v=localStorage.getItem(k);
  if(!v){ v=crypto.randomUUID(); localStorage.setItem(k,v); }
  return v;
}

const chat = createChat({
  webhookUrl: window.CHAT_WEBHOOK_URL,
  target: '#n8n-chat',
  mode: 'fullscreen',
  enableStreaming: true,
  loadPreviousSession: true,
  allowFileUploads: true,
  allowedFilesMimeTypes: 'image/*,application/pdf,audio/*,video/*',
  i18n: {
    en: {
      title: 'Assistente',
      subtitle: 'Envie mensagens, arquivos e áudio.',
      getStarted: 'Nova conversa',
      inputPlaceholder: 'Digite sua mensagem...'
    }
  },
  initialMessages: [
    'Olá! 👋',
    'Sou o assistente. Como posso ajudar hoje?'
  ],
  metadata: { userId: uid() }
});

const fileInput = document.getElementById('fileInput');
const uploadBtn = document.getElementById('uploadBtn');
const uploadStatus = document.getElementById('uploadStatus');
const sectorHintInput = document.getElementById('sectorHint');

uploadBtn.addEventListener('click', async () => {
  const f = fileInput.files && fileInput.files[0];
  if (!f) { uploadStatus.textContent = 'Selecione um arquivo.'; return; }
  uploadStatus.textContent = 'Enviando...';
  try {
    const fd = new FormData();
    fd.append('file', f, f.name);
    fd.append('userId', uid());
    if (sectorHintInput.value) fd.append('sectorHint', sectorHintInput.value);
    const res = await fetch(window.UPLOAD_WEBHOOK_URL, { method: 'POST', body: fd });
    if (!res.ok) throw new Error('Falha no upload');
    uploadStatus.textContent = 'Arquivo enviado. Indexação em andamento.';
    fileInput.value = '';
  } catch (e) {
    uploadStatus.textContent = 'Erro ao enviar arquivo.';
  }
});

const startRecBtn = document.getElementById('startRecBtn');
const stopRecBtn = document.getElementById('stopRecBtn');
const clearRecBtn = document.getElementById('clearRecBtn');
const voiceStatus = document.getElementById('voiceStatus');
const audioPreview = document.getElementById('audioPreview');

let mediaRecorder = null;
let chunks = [];

startRecBtn.addEventListener('click', async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    chunks = [];
    mediaRecorder.ondataavailable = e => { if (e.data.size > 0) chunks.push(e.data); };
    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      audioPreview.src = URL.createObjectURL(blob);
      voiceStatus.textContent = 'Enviando áudio...';
      try {
        const fd = new FormData();
        fd.append('audio', blob, 'voice.webm');
        fd.append('userId', uid());
        if (sectorHintInput.value) fd.append('sectorHint', sectorHintInput.value);
        const res = await fetch(window.VOICE_WEBHOOK_URL, { method: 'POST', body: fd });
        if (!res.ok) throw new Error('Falha no envio de áudio');
        voiceStatus.textContent = 'Áudio enviado para transcrição.';
      } catch {
        voiceStatus.textContent = 'Erro ao enviar áudio.';
      }
    };
    mediaRecorder.start();
    voiceStatus.textContent = 'Gravando...';
    startRecBtn.disabled = true;
    stopRecBtn.disabled = false;
  } catch {
    voiceStatus.textContent = 'Permissão de microfone negada ou indisponível.';
  }
});

stopRecBtn.addEventListener('click', () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
    startRecBtn.disabled = false;
    stopRecBtn.disabled = true;
  }
});

clearRecBtn.addEventListener('click', () => {
  audioPreview.src = '';
  voiceStatus.textContent = '';
});
