function toggleStatus(userId, currentStatus) {
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
  const currentDate = new Date();
  const dateOfExpiry = new Date(currentDate);
  dateOfExpiry.setMonth(dateOfExpiry.getMonth() + 12);

  const updatedData = {
    status: newStatus,
    dateOfPurchase: currentDate,
    dateOfExpiry: dateOfExpiry,
  };

  fetch(`/portfolio/buyportfolio/${userId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updatedData),
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response or perform any necessary actions
      console.log(data);
      console.log(`Status before update: ${currentStatus}`);
      console.log(`Status after update: ${data.portfolio.status}`);
      // Check if the status was changed successfully
      if (data.message === 'Status updated successfully') {
        // Update the UI to reflect the new status
        location.reload();
      } else {
        // Handle the error or display an error message
        console.error('Failed to update status');
      }
    })
    .catch(error => {
      // Handle the error or display an error message
      console.error(error);
    });
}
