import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify request method
    if (req.method !== 'POST') {
      throw new Error('Method not allowed')
    }

    // Get environment variables
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!stripeSecretKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error('Missing environment variables')
    }

    // Initialize Stripe with secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client with service role key for admin operations
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse and validate request body
    const body = await req.json()
    
    if (!body.booking_id || !body.amount || !body.currency || !body.customer_email || !body.customer_name) {
      throw new Error('Missing required fields')
    }

    // Validate amount (minimum LKR 50, maximum LKR 1,000,000)
    const amountInCents = Math.round(body.amount * 100)
    if (amountInCents < 5000 || amountInCents > 100000000) {
      throw new Error('Invalid amount - must be between LKR 50.00 and LKR 1,000,000.00')
    }

    // Validate currency
    if (!/^[a-z]{3}$/.test(body.currency)) {
      throw new Error('Invalid currency')
    }

    // Verify booking exists and belongs to authenticated user
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', body.booking_id)
      .single()

    if (bookingError || !booking) {
      throw new Error('Booking not found')
    }

    // Verify amount matches booking total
    if (Math.abs(booking.total_price - body.amount) > 0.01) {
      throw new Error('Amount mismatch')
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: body.currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        booking_id: body.booking_id,
        event_title: body.event_title,
        customer_email: body.customer_email,
        customer_name: body.customer_name,
        ...body.metadata
      },
      description: `Payment for ${body.event_title} - ${body.customer_name}`,
      receipt_email: body.customer_email,
      capture_method: 'automatic',
      confirmation_method: 'automatic',
      setup_future_usage: 'off_session',
    })

    // Store payment intent in database
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        booking_id: body.booking_id,
        stripe_payment_intent_id: paymentIntent.id,
        amount: body.amount,
        currency: body.currency,
        status: paymentIntent.status,
        payment_method_types: paymentIntent.payment_method_types,
        capture_method: paymentIntent.capture_method,
        confirmation_method: paymentIntent.confirmation_method,
        description: paymentIntent.description,
        receipt_email: paymentIntent.receipt_email,
        metadata: paymentIntent.metadata
      })

    if (paymentError) {
      console.error('Error storing payment:', paymentError)
      // Continue even if database storage fails
    }

    // Update booking with payment intent ID
    await supabase
      .from('bookings')
      .update({ 
        status: 'pending',
        updated_at: new Date().toISOString()
      })
      .eq('id', body.booking_id)

    const response = {
      client_secret: paymentIntent.client_secret,
      payment_intent_id: paymentIntent.id,
      status: paymentIntent.status
    }

    return new Response(
      JSON.stringify(response),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    console.error('Payment intent creation error:', error)
    
    const errorResponse = {
      error: error.message || 'Internal server error',
      status: 'error'
    }

    return new Response(
      JSON.stringify(errorResponse),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
