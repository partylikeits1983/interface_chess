export default function opponentMoveNotification(message: string) {
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

  const dismissButton = document.createElement('button');
  dismissButton.innerHTML =
    '<span aria-hidden="true"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1" style="width: 24px; height: 24px;"><path d="M6 18L18 6M6 6l12 12"></path></svg></span>';
  dismissButton.style.position = 'absolute';
  dismissButton.style.top = '5px';
  dismissButton.style.right = '5px';
  dismissButton.style.backgroundColor = 'transparent';
  dismissButton.style.color = '#fff';
  dismissButton.style.border = 'none';
  dismissButton.style.cursor = 'pointer';
  dismissButton.style.fontSize = '16px';
  dismissButton.style.fontWeight = 'bold';
  dismissButton.style.padding = '0';
  dismissButton.style.marginLeft = '10px'; // Add a margin to the left of the button to separate it from the text.
  dismissButton.style.width = '30px'; // Increase the button width to accommodate the larger SVG
  dismissButton.style.height = '30px'; // Increase the button height to accommodate the larger SVG

  dismissButton.addEventListener('click', () => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  });

  toast.appendChild(dismissButton);

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 500);
  }, 10000);
}
