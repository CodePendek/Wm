const startBtn = document.getElementById('startBtn');
const watermarkInput = document.getElementById('watermarkInput');
const imageInput = document.getElementById('imageInput');
const previewModal = document.getElementById('previewModal');
const previewCanvas = document.getElementById('previewCanvas');
const downloadBtn = document.getElementById('downloadBtn');
const copyBtn = document.getElementById('copyBtn');
const shareBtn = document.getElementById('shareBtn');
const exitBtn = document.getElementById('exitBtn');

let watermarkText = '';

// Load watermark dari localStorage saat halaman dibuka
window.onload = () => {
	const savedWatermark = localStorage.getItem('watermark');
	if (savedWatermark) {
		watermarkInput.value = savedWatermark;
	}
};

startBtn.onclick = () => {
	watermarkText = watermarkInput.value.trim();
	localStorage.setItem('watermark', watermarkText); // Simpan meskipun kosong
	imageInput.click();
};

imageInput.onchange = (e) => {
	const file = e.target.files[0];
	if (!file) return;
	
	const reader = new FileReader();
	reader.onload = function(evt) {
		const img = new Image();
		img.onload = function() {
			const canvas = previewCanvas;
			const ctx = canvas.getContext('2d');
			
			// Gunakan ukuran asli foto (tanpa kompresi)
			canvas.width = img.width;
			canvas.height = img.height;
			ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
			
			// Set bayangan agar watermark terlihat di latar gelap/terang
			ctx.shadowColor = 'rgba(0,0,0,0.6)';
			ctx.shadowOffsetX = 2;
			ctx.shadowOffsetY = 2;
			ctx.shadowBlur = 3;
			
			const padding = 20; // jarak dari tepi
			
			// Watermark Custom (lebih besar, konsisten)
			if (watermarkText) {
				ctx.font = 'bold 28px sans-serif'; // ukuran tetap
				ctx.fillStyle = 'rgba(255,255,255,0.9)';
				ctx.textAlign = 'left';
				ctx.fillText(watermarkText, padding, canvas.height - padding - 28);
			}
			
			// Watermark Waktu (lebih kecil, konsisten)
			const now = new Date();
			const timeStamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} ${now.getFullYear()}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')}`;
			ctx.font = '18px sans-serif'; // ukuran tetap
			ctx.fillStyle = 'rgba(255,255,255,0.8)';
			ctx.fillText(timeStamp, padding, canvas.height - padding);
			
			previewModal.style.display = 'flex';
		};
		img.src = evt.target.result;
	};
	reader.readAsDataURL(file);
};

downloadBtn.onclick = () => {
	const link = document.createElement('a');
	link.download = 'watermarked.jpg';
	// Simpan dengan kualitas penuh (tidak dikompres)
	link.href = previewCanvas.toDataURL('image/jpeg', 1.0);
	link.click();
};

copyBtn.onclick = async () => {
	previewCanvas.toBlob(blob => {
		const item = new ClipboardItem({ 'image/png': blob });
		navigator.clipboard.write([item]);
	});
};

shareBtn.onclick = async () => {
	previewCanvas.toBlob(blob => {
		const file = new File([blob], 'watermarked.jpg', { type: 'image/jpeg' });
		if (navigator.canShare && navigator.canShare({ files: [file] })) {
			navigator.share({
				files: [file],
				title: 'Gambar dengan Watermark',
				text: 'Berikut hasil gambar dengan watermark.'
			});
		} else {
			alert('Fitur share tidak didukung di perangkat ini.');
		}
	}, 'image/jpeg', 1.0); // kualitas penuh
};

exitBtn.onclick = () => {
	previewModal.style.display = 'none';
};