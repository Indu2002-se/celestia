-- Create events table
CREATE TABLE IF NOT EXISTS public.events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    full_description TEXT,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    venue TEXT NOT NULL,
    address TEXT,
    price DECIMAL(10, 2) NOT NULL,
    capacity INTEGER NOT NULL,
    image_url TEXT NOT NULL,
    featured_image_1 TEXT,
    featured_image_2 TEXT,
    category TEXT NOT NULL DEFAULT 'movie',
    organizer TEXT DEFAULT 'Celestia Cinema',
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create bookings table
CREATE TABLE IF NOT EXISTS public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    reference_number TEXT NOT NULL UNIQUE,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    tickets_count INTEGER NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    email_sent BOOLEAN DEFAULT false,
    special_requirements TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_event_id ON public.bookings(event_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events(date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Create policies for events table
-- Anyone can view published events
CREATE POLICY "Anyone can view published events" 
ON public.events FOR SELECT 
USING (is_published = true);

-- Only admins can insert, update, delete events
CREATE POLICY "Admins can manage events" 
ON public.events FOR ALL 
USING (auth.role() = 'service_role');

-- Create policies for bookings table
-- Users can view their own bookings
CREATE POLICY "Users can view their own bookings" 
ON public.bookings FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own bookings
CREATE POLICY "Users can create their own bookings" 
ON public.bookings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Only admins can view all bookings
CREATE POLICY "Admins can view all bookings" 
ON public.bookings FOR SELECT 
USING (auth.role() = 'service_role');

-- Only admins can update any booking
CREATE POLICY "Admins can update any booking" 
ON public.bookings FOR UPDATE 
USING (auth.role() = 'service_role');

-- Sample movie event
INSERT INTO public.events (
    title, 
    description, 
    full_description,
    date, 
    end_time,
    venue, 
    address,
    price, 
    capacity, 
    image_url,
    featured_image_1,
    featured_image_2,
    category
) VALUES (
    'Interstellar: IMAX Experience', 
    'Experience Christopher Nolan''s epic space adventure like never before on our giant IMAX screen with immersive sound.',
    'Join us for a special screening of Christopher Nolan''s masterpiece "Interstellar" in stunning IMAX format. This epic adventure follows a team of explorers who travel through a wormhole in space in an attempt to ensure humanity''s survival. Featuring breathtaking visuals, a powerful score by Hans Zimmer, and mind-bending science, this is cinema at its most ambitious. The IMAX experience enhances every aspect of the film with crystal-clear images and precision sound for the ultimate movie-going experience.',
    NOW() + INTERVAL '7 days' + INTERVAL '19 hours',
    NOW() + INTERVAL '7 days' + INTERVAL '22 hours',
    'Celestia IMAX Theatre',
    '123 Starview Avenue, Downtown',
    14.99,
    120,
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1000',
    'https://images.unsplash.com/photo-1506443432602-ac2fcd6f54e0?q=80&w=1000',
    'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?q=80&w=1000',
    'movie'
); 