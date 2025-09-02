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

    // Initialize Stripe
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2024-12-18.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    })

    // Initialize Supabase client with service role key
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Parse and validate request body
    const body = await req.json()
    
    if (!body.payment_intent_id || !body.booking_id) {
      throw new Error('Missing required fields')
    }

    // Validate payment intent ID format
    if (!body.payment_intent_id.startsWith('pi_')) {
      throw new Error('Invalid payment intent ID format')
    }

    // Verify payment intent exists in Stripe
    let paymentIntent
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(body.payment_intent_id)
    } catch (error) {
      throw new Error('Payment intent not found in Stripe')
    }

    // Verify payment intent belongs to the specified booking
    if (paymentIntent.metadata?.booking_id !== body.booking_id) {
      throw new Error('Payment intent does not match booking')
    }

    // Get payment record from database
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('stripe_payment_intent_id', body.payment_intent_id)
      .single()

    if (paymentError || !payment) {
      throw new Error('Payment record not found')
    }

    // Verify payment belongs to the specified booking
    if (payment.booking_id !== body.booking_id) {
      throw new Error('Payment does not match booking')
    }

    // Check payment status
    if (paymentIntent.status === 'succeeded') {
      // Update payment status
      await supabase
        .from('payments')
        .update({
          status: paymentIntent.status,
          stripe_payment_id: paymentIntent.latest_charge,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      // Update booking status
      await supabase
        .from('bookings')
        .update({
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('id', body.booking_id)

      // Send confirmation email
      try {
        await supabase.functions.invoke('send-confirmation-email', {
          body: {
            booking_id: body.booking_id,
            payment_intent_id: body.payment_intent_id
          }
        })
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Continue even if email fails
      }

      const response = {
        success: true,
        status: 'confirmed',
        message: 'Payment confirmed successfully'
      }

      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } else if (paymentIntent.status === 'requires_payment_method') {
      // Payment failed or requires action
      await supabase
        .from('payments')
        .update({
          status: paymentIntent.status,
          error_message: paymentIntent.last_payment_error?.message || 'Payment requires action',
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      const response = {
        success: false,
        status: 'requires_action',
        message: 'Payment requires additional action'
      }

      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } else if (paymentIntent.status === 'canceled') {
      // Payment was canceled
      await supabase
        .from('payments')
        .update({
          status: paymentIntent.status,
          updated_at: new Date().toISOString()
        })
        .eq('id', payment.id)

      await supabase
        .from('bookings')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', body.booking_id)

      const response = {
        success: false,
        status: 'canceled',
        message: 'Payment was canceled'
      }

      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )

    } else {
      // Other statuses
      const response = {
        success: false,
        status: paymentIntent.status,
        message: `Payment status: ${paymentIntent.status}`
      }

      return new Response(
        JSON.stringify(response),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      )
    }

  } catch (error) {
    console.error('Payment confirmation error:', error)
    
    const errorResponse = {
      success: false,
      status: 'error',
      message: 'Payment confirmation failed',
      error: error.message || 'Internal server error'
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
