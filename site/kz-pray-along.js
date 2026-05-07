/* ============================================================
   KZ PRAY-ALONG — shared prayer room
   - Presence over Supabase Realtime channel.
   - Optional voice via WebRTC mesh (small rooms ≤ 8 ppl).
   - Signaling rides on the same Supabase channel (broadcast).

   Requires: window.KZ_SUPABASE_URL + KZ_SUPABASE_ANON
   ============================================================ */
(function(){
  'use strict';

  const $ = (s) => document.querySelector(s);

  const ui = {
    join:        $('#paJoin'),
    roomName:    $('#paRoomName'),
    presence:    $('#paPresence'),
    count:       document.querySelector('[data-pa-count]'),
    nameInput:   $('#paName'),
    joinBtn:     $('#paJoinBtn'),
    micBtn:      $('#paMicBtn'),
    muteBtn:     $('#paMute'),
    leaveBtn:    $('#paLeave'),
    status:      $('#paStatus')
  };

  const roomSection = $('#paRoomSection');
  const roomInput   = $('#paRoomInput');

  // Try to auto-join from ?room=
  try {
    const u = new URL(location.href);
    const r = u.searchParams.get('room');
    if (r && roomInput) roomInput.value = r;
  } catch {}

  let supa = null;
  let channel = null;
  let me = null;
  let micStream = null;
  let micEnabled = false;
  const peers = new Map(); // id -> RTCPeerConnection
  const remoteAudios = new Map(); // id -> <audio>

  function setStatus(msg, type='info'){
    if (!ui.status) return;
    ui.status.hidden = false;
    ui.status.textContent = msg;
    ui.status.dataset.type = type;
  }

  function ensureSupa(){
    if (supa) return supa;
    if (!window.supabase || !window.KZ_SUPABASE_URL || !window.KZ_SUPABASE_ANON){
      setStatus('Supabase לא מוגדר. הוסף KZ_SUPABASE_URL + KZ_SUPABASE_ANON ב-index.html', 'err');
      return null;
    }
    supa = window.supabase.createClient(window.KZ_SUPABASE_URL, window.KZ_SUPABASE_ANON);
    return supa;
  }

  function genId(){ return 'u_' + Math.random().toString(36).slice(2, 10); }

  async function toggleMic(){
    if (micEnabled){
      micStream?.getTracks().forEach(t => t.stop());
      micStream = null;
      micEnabled = false;
      if (ui.micBtn) { ui.micBtn.classList.remove('is-on'); ui.micBtn.textContent = '🎙 הפעל מיקרופון'; }
      // Tear down peers
      peers.forEach(pc => pc.close());
      peers.clear();
      remoteAudios.forEach(a => a.remove());
      remoteAudios.clear();
      return;
    }
    try {
      micStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
      micEnabled = true;
      if (ui.micBtn) { ui.micBtn.classList.add('is-on'); ui.micBtn.textContent = '🎙 מיקרופון פעיל'; }
      // Re-broadcast offers to all known peers
      if (channel && me){
        channel.track({ ...me, mic: true });
        peers.forEach((_, id) => negotiate(id, true));
      }
    } catch (err) {
      setStatus('לא הצלחנו לפתוח מיקרופון: ' + err.message, 'err');
    }
  }

  function renderPresence(state){
    if (!ui.presence) return;
    ui.presence.innerHTML = '';
    const people = [];
    Object.values(state).forEach(arr => arr.forEach(p => people.push(p)));
    (ui.count || {}).textContent = people.length;
    people.forEach(p => {
      const el = document.createElement('div');
      el.className = 'pa-person';
      if (p.speaking) el.classList.add('is-speaking');
      const initial = (p.name || '?').slice(0, 1).toUpperCase();
      el.innerHTML = `<span class="pa-person-avatar">${initial}</span><span>${escapeHtml(p.name || 'מתפלל')}</span>${p.mic ? '<span title="מיקרופון פעיל">🎙</span>' : ''}`;
      ui.presence.appendChild(el);
    });
  }

  function escapeHtml(s){
    return String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  }

  /* ─── WebRTC mesh ─── */
  function makePeer(remoteId){
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });
    pc.ontrack = (e) => {
      let audio = remoteAudios.get(remoteId);
      if (!audio){
        audio = document.createElement('audio');
        audio.autoplay = true;
        audio.playsInline = true;
        audio.dataset.peer = remoteId;
        document.body.appendChild(audio);
        remoteAudios.set(remoteId, audio);
      }
      audio.srcObject = e.streams[0];
    };
    pc.onicecandidate = (e) => {
      if (e.candidate && channel){
        channel.send({ type: 'broadcast', event: 'rtc', payload: { to: remoteId, from: me.id, kind: 'ice', candidate: e.candidate } });
      }
    };
    if (micStream){
      micStream.getTracks().forEach(t => pc.addTrack(t, micStream));
    }
    peers.set(remoteId, pc);
    return pc;
  }

  async function negotiate(remoteId, recreate=false){
    if (recreate){ peers.get(remoteId)?.close(); peers.delete(remoteId); }
    const pc = peers.get(remoteId) || makePeer(remoteId);
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    channel.send({ type: 'broadcast', event: 'rtc', payload: { to: remoteId, from: me.id, kind: 'offer', sdp: offer } });
  }

  async function onSignal(payload){
    if (!payload || payload.to !== me.id) return;
    const remote = payload.from;
    let pc = peers.get(remote);
    if (!pc) pc = makePeer(remote);
    if (payload.kind === 'offer'){
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      channel.send({ type: 'broadcast', event: 'rtc', payload: { to: remote, from: me.id, kind: 'answer', sdp: answer } });
    } else if (payload.kind === 'answer'){
      await pc.setRemoteDescription(new RTCSessionDescription(payload.sdp));
    } else if (payload.kind === 'ice' && payload.candidate){
      try { await pc.addIceCandidate(payload.candidate); } catch {}
    }
  }

  async function join(){
    const roomCode = (roomInput?.value || '').trim();
    const name     = (ui.nameInput?.value || '').trim() || 'מתפלל';
    if (!roomCode){ setStatus('הזן/י קוד חדר', 'err'); return; }
    const s = ensureSupa();
    if (!s) return;

    me = { id: genId(), name, mic: micEnabled };
    channel = s.channel('pa-' + roomCode, { config: { presence: { key: me.id } } });

    channel.on('presence', { event: 'sync' }, () => {
      renderPresence(channel.presenceState());
      // For any new peer not yet in `peers`, initiate negotiation if we have mic
      const state = channel.presenceState();
      Object.values(state).flat().forEach(p => {
        if (p.id && p.id !== me.id && micEnabled && !peers.has(p.id)){
          // Tie-break: only the lexicographically smaller id initiates
          if (me.id < p.id) negotiate(p.id);
        }
      });
    });
    channel.on('broadcast', { event: 'rtc' }, ({ payload }) => onSignal(payload));

    await channel.subscribe(async (status) => {
      if (status !== 'SUBSCRIBED') return;
      await channel.track(me);
      ui.join.hidden = true;
      roomSection.hidden = false;
      ui.roomName.textContent = roomCode;

      // Add room to the URL for easy sharing
      const u = new URL(location.href);
      u.searchParams.set('room', roomCode);
      history.replaceState(null, '', u.toString());
    });
  }

  async function leave(){
    try { await channel?.unsubscribe(); } catch {}
    channel = null;
    if (micEnabled) toggleMic();
    ui.join.hidden = false;
    roomSection.hidden = true;
  }

  function toggleMute(){
    if (!micStream) return;
    const track = micStream.getAudioTracks()[0];
    if (!track) return;
    track.enabled = !track.enabled;
    ui.muteBtn.textContent = track.enabled ? '🔇 השתק מיקרופון' : '🎙 הפעל קול';
    me.mic = track.enabled;
    channel?.track(me);
  }

  ui.joinBtn?.addEventListener('click', join);
  ui.micBtn?.addEventListener('click', toggleMic);
  ui.muteBtn?.addEventListener('click', toggleMute);
  ui.leaveBtn?.addEventListener('click', leave);
})();
