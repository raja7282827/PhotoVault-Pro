const galleryEl = document.getElementById("gallery");
const uploadForm = document.getElementById("uploadForm");

// load photos
async function loadPhotos() {
  const res = await fetch("/api/photos");
  const photos = await res.json();
  galleryEl.innerHTML = "";
  photos.forEach(renderPhoto);
}

function renderPhoto(p) {
  const div = document.createElement("div");
  div.className = "photo-item";
  div.innerHTML = `
    <p class="user-name">Uploaded by: <b>${p.uploader?.username || "Unknown"}</b></p>
    <img src="${"/" + p.filepath.replace(/\\/g, "/")}" class="uploaded-photo" />
    <div class="photo-actions">
      <button data-id="${p._id}" class="like-btn">❤️ Like (<span>${p.likes?.length || 0}</span>)</button>
      <button data-id="${p._id}" class="delete-btn">❌ Delete</button>
      <a href="/api/photos/${p._id}/download" class="download-btn">⬇️ Download</a>
    </div>
    <div class="comments-section">
      <input type="text" placeholder="Add a comment..." class="comment-input" />
      <button data-id="${p._id}" class="comment-post">Post</button>
      <div class="comments-list">
        ${(p.comments || [])
          .map(
            (c) =>
              `<div class="comment"><b>${c.user?.username || "User"}:</b> ${c.text}</div>`
          )
          .join("")}
      </div>
    </div>
  `;
  galleryEl.appendChild(div);
}

// upload new photo
uploadForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const fd = new FormData(uploadForm);
  const res = await fetch("/api/photos", { method: "POST", body: fd });
  if (!res.ok) return alert("Upload failed");
  await loadPhotos();
  uploadForm.reset();
});

// handle actions (like / delete / comment / fullscreen)
galleryEl.addEventListener("click", async (e) => {
  // LIKE
  const likeBtn = e.target.closest(".like-btn");
  if (likeBtn) {
    const id = likeBtn.dataset.id;
    const res = await fetch(`/api/photos/${id}/like`, { method: "POST" });
    if (res.ok) {
      const data = await res.json();
      likeBtn.innerHTML = data.liked
        ? `💖 Liked (<span>${data.likes}</span>)`
        : `❤️ Like (<span>${data.likes}</span>)`;
    } else {
      alert("Login required to like");
    }
    return; // stop here
  }

  // DELETE
  const delBtn = e.target.closest(".delete-btn");
  if (delBtn) {
    const id = delBtn.dataset.id;
    if (!confirm("Delete this photo?")) return;
    const res = await fetch(`/api/photos/${id}`, { method: "DELETE" });
    if (res.ok) loadPhotos();
    else alert("Only uploader can delete or login required");
    return;
  }

  // COMMENT
  const cmtBtn = e.target.closest(".comment-post");
  if (cmtBtn) {
    const id = cmtBtn.dataset.id;
    const input = cmtBtn.parentElement.querySelector(".comment-input");
    const txt = input.value.trim();
    if (!txt) return;
    const res = await fetch(`/api/photos/${id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: txt }),
    });
    if (res.ok) {
      const c = await res.json();
      const list = cmtBtn.parentElement.querySelector(".comments-list");
      const div = document.createElement("div");
      div.className = "comment";
      div.innerHTML = `<b>${c.user?.username || "User"}:</b> ${c.text}`;
      list.prepend(div);
      input.value = "";
    } else {
      alert("Login required to comment");
    }
    return;
  }

  // FULLSCREEN IMAGE
  const img = e.target.closest(".uploaded-photo");
  if (img) {
    openModal(img.src);
    return;
  }
});

// =============== MODAL ===============
const modal = document.getElementById("photoModal");
const modalImg = document.getElementById("modalImg");
const closeBtn = document.querySelector(".close");

function openModal(src) {
  modal.style.display = "block";
  modalImg.src = src;
}

closeBtn.addEventListener("click", () => (modal.style.display = "none"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.style.display = "none";
});

// init
loadPhotos();
