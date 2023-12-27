export default function delegationWalletModal() {
  const content =
    'To create a delegated wallet, sign the seed generation message';

  // Create the modal container
  const modalContainer = document.createElement('div');
  modalContainer.style.position = 'fixed';
  modalContainer.style.top = '0';
  modalContainer.style.left = '0';
  modalContainer.style.width = '100%';
  modalContainer.style.height = '100%';
  modalContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)'; // Darker background
  modalContainer.style.zIndex = '1000';
  modalContainer.style.display = 'flex';
  modalContainer.style.justifyContent = 'center';
  modalContainer.style.alignItems = 'center';

  // Create the modal content box
  const modalContent = document.createElement('div');
  modalContent.style.backgroundColor = '#333'; // Dark background for content
  modalContent.style.color = '#fff'; // White text for contrast
  modalContent.style.padding = '20px';
  modalContent.style.borderRadius = '10px'; // Rounded edges
  modalContent.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)'; // Slightly heavier shadow
  modalContent.style.minWidth = '300px'; // Minimum width
  modalContent.style.maxWidth = '80%'; // Max width to avoid too wide on large screens
  modalContent.style.textAlign = 'center'; // Center text alignment
  modalContent.innerHTML = content;

  // Append modal content to modal container
  modalContainer.appendChild(modalContent);

  // Append modal container to body
  document.body.appendChild(modalContainer);

  // Function to close the modal
  modalContainer.onclick = function () {
    document.body.removeChild(modalContainer);
  };
}
