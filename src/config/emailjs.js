// EmailJS Configuration
// You need to replace these with your actual EmailJS credentials
// Get these from https://www.emailjs.com/

export const EMAILJS_CONFIG = {
  // Your EmailJS service ID
  SERVICE_ID: 'service_celestia', // Replace with your service ID
  
  // Your EmailJS template ID for booking confirmation
  TEMPLATE_ID: 'template_booking_confirmation', // Replace with your template ID
  
  // Your EmailJS public key
  PUBLIC_KEY: 'your_public_key_here', // Replace with your public key
};

// EmailJS template parameters for booking confirmation
export const getBookingConfirmationParams = (bookingData) => {
  return {
    to_email: bookingData.email,
    to_name: bookingData.name,
    event_title: bookingData.event_title,
    event_date: new Date(bookingData.event_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    event_location: bookingData.event_location,
    quantity: bookingData.quantity,
    reference_number: bookingData.reference_number,
    total_amount: bookingData.total_amount,
    package_type: bookingData.package_type,
    package_price: bookingData.package_price,
    student_id: bookingData.student_id,
    section: bookingData.section,
    batch_no: bookingData.batch_no,
    phone: bookingData.phone,
    special_requirements: bookingData.special_requirements || 'None',
    booking_date: new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
};
