import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiCalendar, FiMapPin, FiClock, FiMail, FiDownload, FiArrowLeft, FiCreditCard, FiCopy } from 'react-icons/fi';
import { supabase } from '../../supabaseClient';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Confirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  
  console.log('Confirmation component loaded with bank details and PDF download');
  
  const { event, quantity, formData, booking } = location.state || {};
  
  // Bank account details
  const bankDetails = {
    accountNumber: '108852549699',
    accountHolder: 'B D S Mendis',
    bankName: 'Sampath Bank',
    branch: 'Negombo 2'
  };
  
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log('Copied to clipboard:', text);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const downloadPDF = async () => {
    // Create a temporary container with only the content we want in the PDF
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '800px';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.padding = '20px';
    tempContainer.style.fontFamily = 'Arial, sans-serif';
    
    // Add the content we want in the PDF
    tempContainer.innerHTML = `
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #6366f1; font-size: 28px; margin-bottom: 10px;">Booking Confirmed!</h1>
        <p style="color: #666; font-size: 16px;">Thank you for your purchase. Your tickets have been booked successfully.</p>
        <p style="color: #666; font-size: 16px;">After payment, we will confirm your booking.</p>
      </div>
      
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">Booking Details</h2>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1; margin-right: 20px;">
            <h3 style="color: #6366f1; font-size: 16px; margin-bottom: 10px;">Event Information</h3>
            <p style="font-weight: bold; font-size: 18px; margin-bottom: 10px;">${event.title}</p>
            <p style="color: #666; margin: 5px 0;">📅 ${new Date(event.date).toLocaleDateString()}</p>
            <p style="color: #666; margin: 5px 0;">🕐 ${new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            <p style="color: #666; margin: 5px 0;">📍 ${event.location}</p>
          </div>
          
          <div style="flex: 1;">
            <h3 style="color: #6366f1; font-size: 16px; margin-bottom: 10px;">Ticket Information</h3>
            <p style="color: #666; margin: 5px 0;"><strong>Reference:</strong> ${booking.reference_number}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Quantity:</strong> ${quantity}</p>
            <p style="color: #666; margin: 5px 0;"><strong>Name:</strong> ${formData.fullName}</p>
            <p style="color: #666; margin: 5px 0;">📧 ${formData.email}</p>
          </div>
        </div>
        
                 <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
           <div style="display: flex; justify-content: space-between; margin: 10px 0; font-weight: bold; font-size: 18px; color: #6366f1;">
             <span>Total Amount</span>
             <span>LKR ${booking.total_amount.toFixed(0)}</span>
           </div>
         </div>
      </div>
      
      <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px;">
        <h2 style="color: #1f2937; font-size: 20px; margin-bottom: 20px;">💳 Payment Information</h2>
        
        <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin-bottom: 20px;">
          <p style="color: #92400e; font-weight: bold; margin: 0;">Please make payment to the following account:</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px;">
          <div style="flex: 1; margin-right: 20px;">
            <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
              <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Account Number</p>
              <p style="font-weight: bold; font-size: 16px; margin: 0;">${bankDetails.accountNumber}</p>
            </div>
            <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px;">
              <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Account Holder</p>
              <p style="font-weight: bold; font-size: 16px; margin: 0;">${bankDetails.accountHolder}</p>
            </div>
          </div>
          
          <div style="flex: 1;">
            <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px; margin-bottom: 10px;">
              <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Bank Name</p>
              <p style="font-weight: bold; font-size: 16px; margin: 0;">${bankDetails.bankName}</p>
            </div>
            <div style="background-color: #f9fafb; border-radius: 6px; padding: 15px;">
              <p style="color: #666; font-size: 14px; margin: 0 0 5px 0;">Branch</p>
              <p style="font-weight: bold; font-size: 16px; margin: 0;">${bankDetails.branch}</p>
            </div>
          </div>
        </div>
        
        <div style="background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 6px; padding: 15px;">
          <p style="color: #1e40af; font-size: 14px; margin: 0;">
            <strong>Important:</strong> After making the payment, please keep the payment receipt. 
            Your booking will be confirmed once payment is verified by our team.
          </p>
        </div>
      </div>
    `;
    
    document.body.appendChild(tempContainer);
    
    const canvas = await html2canvas(tempContainer, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });
    
    document.body.removeChild(tempContainer);
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;
    
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
    
    pdf.save(`booking-confirmation-${booking.reference_number}.pdf`);
  };
  
  // Removed email sending logic since we're using bank transfer payments

  if (!event || !booking) {
    return (
      <div className="celestia-container my-10">
        <div className="glass-card p-8 text-center">
          <h2 className="text-2xl font-bold text-dark mb-4">Booking Information Not Found</h2>
          <p className="text-gray-600 mb-4">We couldn't find details of your booking. Please check your email for confirmation details.</p>
          <button 
            onClick={() => navigate('/events')}
            className="btn-primary"
          >
            Browse Events
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="celestia-container my-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="glass-card max-w-3xl mx-auto p-8 text-center"
      >
        <div className="flex justify-center mb-6">
          <FiCheckCircle className="text-green-500 text-6xl" />
        </div>
        
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary text-transparent bg-clip-text">
          Booking Confirmed!
        </h1>
        
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 mb-4">
          <p className="text-green-800 text-sm font-medium">✓ Updated with bank details and PDF download - {new Date().toLocaleTimeString()}</p>
        </div>
        
        <p className="text-gray-700 mb-8">
          Thank you for your purchase. Your tickets have been booked successfully.
          After payment, we will confirm your booking.
        </p>
        
        <div className="glass-card mb-8">
          <div className="p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4 text-dark">Booking Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-medium mb-2 text-primary">Event Information</h3>
                <p className="text-gray-700 font-semibold text-lg mb-2">{event.title}</p>
                <div className="flex items-center text-gray-600 mb-1">
                  <FiCalendar className="mr-2" />
                  <span>{new Date(event.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center text-gray-600 mb-1">
                  <FiClock className="mr-2" />
                  <span>{new Date(event.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex items-center text-gray-600">
                  <FiMapPin className="mr-2" />
                  <span>{event.location}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2 text-primary">Ticket Information</h3>
                <p className="text-gray-700 mb-1"><span className="font-medium">Reference:</span> {booking.reference_number}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Quantity:</span> {quantity}</p>
                <p className="text-gray-700 mb-1"><span className="font-medium">Name:</span> {formData.fullName}</p>
                <div className="flex items-center text-gray-600">
                  <FiMail className="mr-2" />
                  <span>{formData.email}</span>
                </div>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4 mb-4">
               <div className="flex justify-between items-center py-2 font-bold">
                 <span>Total Amount</span>
                 <span>LKR {booking.total_amount.toFixed(0)}</span>
              </div>
             </div>
          </div>
        </div>
        
        {/* Payment Information */}
        <div className="glass-card mb-8">
          <div className="p-6 text-left">
            <h2 className="text-2xl font-semibold mb-4 text-dark flex items-center">
              <FiCreditCard className="mr-2 text-primary" />
              Payment Information
            </h2>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-yellow-800 font-medium mb-2">Please make payment to the following account:</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Account Number</p>
                    <p className="font-semibold text-gray-900">{bankDetails.accountNumber}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountNumber)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    title="Copy to clipboard"
                  >
                    <FiCopy />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Account Holder</p>
                    <p className="font-semibold text-gray-900">{bankDetails.accountHolder}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.accountHolder)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    title="Copy to clipboard"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Bank Name</p>
                    <p className="font-semibold text-gray-900">{bankDetails.bankName}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.bankName)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    title="Copy to clipboard"
                  >
                    <FiCopy />
                  </button>
                </div>
                
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Branch</p>
                    <p className="font-semibold text-gray-900">{bankDetails.branch}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(bankDetails.branch)}
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    title="Copy to clipboard"
                  >
                    <FiCopy />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Important:</strong> After making the payment, please keep the payment receipt. 
                Your booking will be confirmed once payment is verified by our team.
              </p>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button 
            onClick={() => navigate('/events')}
            className="flex items-center justify-center px-6 py-2 border-2 border-primary text-primary font-medium rounded-lg hover:bg-primary hover:text-white transition-all"
          >
            <FiArrowLeft className="mr-2" /> Browse More Events
          </button>
          <button 
            onClick={downloadPDF}
            className="flex items-center justify-center btn-primary"
          >
            <FiDownload className="mr-2" /> Download Confirmation
          </button>
        </div>
      </motion.div>
      
      <div className="max-w-3xl mx-auto mt-8 p-4 glass-card">
        <h3 className="font-semibold mb-2 text-dark">Important Information:</h3>
        <ul className="list-disc list-inside text-gray-600 space-y-1">
          <li>Please arrive at least 15 minutes before the event starts.</li>
          <li>Bring your confirmation email or reference number for quick check-in.</li>
          <li>For any questions or changes, please contact us at support@celestia.com.</li>
        </ul>
      </div>
    </div>
  );
};

export default Confirmation; 