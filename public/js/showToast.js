function showToast(message, type) {
  const isSuccess = type === 'success';
  
  Toastify({
      text: message,
      duration: 4000,
      close: true,
      gravity: "bottom",
      position: "right",
      style: { background: isSuccess ? "#28a745" : "#dc3545" }, // ✅ Fix applied
      stopOnFocus: true,
      className: isSuccess ? "success-toast" : "",
  }).showToast();
}