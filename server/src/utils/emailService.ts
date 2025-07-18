/**
 * Email Service
 * 
 * This module provides functionality for sending emails, including error notifications.
 */

import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Email configuration
const emailConfig = {
  host: process.env.EMAIL_HOST || 'smtp.example.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER || 'user@example.com',
    pass: process.env.EMAIL_PASSWORD || 'password',
  },
  from: process.env.EMAIL_FROM || 'Candle E-commerce <noreply@example.com>',
};

// Create nodemailer transporter
const transporter = nodemailer.createTransport({
  host: emailConfig.host,
  port: emailConfig.port,
  secure: emailConfig.secure,
  auth: {
    user: emailConfig.auth.user,
    pass: emailConfig.auth.pass,
  },
});

/**
 * Send an email
 * @param to - Recipient email address
 * @param subject - Email subject
 * @param text - Plain text content
 * @param html - HTML content (optional)
 * @returns Promise that resolves with the send result
 */
export async function sendEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<any> {
  try {
    const mailOptions = {
      from: emailConfig.from,
      to,
      subject,
      text,
      html: html || text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

/**
 * Send an error notification email
 * @param error - The error object or message
 * @param context - Additional context information
 * @returns Promise that resolves with the send result
 */
export async function sendErrorNotification(
  error: Error | string,
  context: Record<string, any> = {}
): Promise<any> {
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : '';
  
  const subject = `[ERROR] Candle E-commerce: ${errorMessage.substring(0, 50)}`;
  
  const text = `
Error occurred in Candle E-commerce application

Error: ${errorMessage}

Stack Trace:
${errorStack || 'No stack trace available'}

Context:
${JSON.stringify(context, null, 2)}

Time: ${new Date().toISOString()}
  `;
  
  const html = `
<h2>Error occurred in Candle E-commerce application</h2>

<h3>Error:</h3>
<pre>${errorMessage}</pre>

<h3>Stack Trace:</h3>
<pre>${errorStack || 'No stack trace available'}</pre>

<h3>Context:</h3>
<pre>${JSON.stringify(context, null, 2)}</pre>

<p><strong>Time:</strong> ${new Date().toISOString()}</p>
  `;
  
  // Get admin email from environment variable or use default
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  
  return sendEmail(adminEmail, subject, text, html);
}

/**
 * Send an order confirmation email
 * @param to - Recipient email address
 * @param orderDetails - Order details
 * @returns Promise that resolves with the send result
 */
export async function sendOrderConfirmation(
  to: string,
  orderDetails: any
): Promise<any> {
  const subject = `Order Confirmation: ${orderDetails.orderNumber}`;
  
  const text = `
Thank you for your order!

Order Number: ${orderDetails.orderNumber}
Date: ${new Date(orderDetails.createdAt).toLocaleDateString()}

Items:
${orderDetails.items.map((item: any) => 
  `- ${item.productSnapshot.name} x${item.quantity}: $${item.price.toFixed(2)}`
).join('\n')}

Subtotal: $${orderDetails.subtotal.toFixed(2)}
Tax: $${orderDetails.tax.toFixed(2)}
Shipping: $${orderDetails.shippingCost.toFixed(2)}
Total: $${orderDetails.totalPrice.toFixed(2)}

Shipping Address:
${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}
${orderDetails.shippingAddress.street}
${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}
${orderDetails.shippingAddress.country}

Thank you for shopping with us!
  `;
  
  const html = `
<h2>Thank you for your order!</h2>

<p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
<p><strong>Date:</strong> ${new Date(orderDetails.createdAt).toLocaleDateString()}</p>

<h3>Items:</h3>
<ul>
  ${orderDetails.items.map((item: any) => 
    `<li>${item.productSnapshot.name} x${item.quantity}: $${item.price.toFixed(2)}</li>`
  ).join('')}
</ul>

<p><strong>Subtotal:</strong> $${orderDetails.subtotal.toFixed(2)}</p>
<p><strong>Tax:</strong> $${orderDetails.tax.toFixed(2)}</p>
<p><strong>Shipping:</strong> $${orderDetails.shippingCost.toFixed(2)}</p>
<p><strong>Total:</strong> $${orderDetails.totalPrice.toFixed(2)}</p>

<h3>Shipping Address:</h3>
<p>
  ${orderDetails.shippingAddress.firstName} ${orderDetails.shippingAddress.lastName}<br>
  ${orderDetails.shippingAddress.street}<br>
  ${orderDetails.shippingAddress.city}, ${orderDetails.shippingAddress.state} ${orderDetails.shippingAddress.zipCode}<br>
  ${orderDetails.shippingAddress.country}
</p>

<p>Thank you for shopping with us!</p>
  `;
  
  return sendEmail(to, subject, text, html);
}

export default {
  sendEmail,
  sendErrorNotification,
  sendOrderConfirmation,
};