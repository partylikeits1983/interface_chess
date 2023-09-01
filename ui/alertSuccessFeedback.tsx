import confetti from 'canvas-confetti';

export default function alertSuccessFeedback(message: string) {
  const toast = document.createElement('div');
  toast.innerText = message;
  toast.style.position = 'fixed';
  toast.style.bottom = '20px';
  toast.style.right = '20px';
  toast.style.backgroundColor = 'green';
  toast.style.color = '#fff';
  toast.style.padding = '10px 20px';
  toast.style.borderRadius = '4px';
  toast.style.zIndex = '9999';
  toast.style.opacity = '1';
  toast.style.transition = 'opacity 0.5s ease-in-out';

  document.body.appendChild(toast);

  // Add confetti effect
  confetti({
    particleCount: 150,
    // angle: 125,
    spread: 95,
    origin: { x: 0.5, y: 1 }, // Originating from bottom right corner
  });

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 10000);
}
