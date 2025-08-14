# 🔑 Celestia Admin Credentials

## Admin Login Details

**URL:** `/admin/login`

### Hardcoded Credentials:
- **Email:** `admin@celestia.com`
- **Password:** `admin123`

## How to Access Admin Panel

1. **Navigate to Admin Login:**
   ```
   http://localhost:3000/admin/login
   ```

2. **Enter Credentials:**
   - Email: `admin@celestia.com`
   - Password: `admin123`

3. **Access Admin Features:**
   - **Dashboard:** Overview and statistics
   - **Manage Events:** Create, edit, delete events
   - **View Bookings:** See all user bookings

## Admin Features

### Event Management
- ✅ Create new events
- ✅ Edit existing events
- ✅ Delete events
- ✅ Set event details (title, description, price, capacity, etc.)

### Booking Management
- ✅ View all user bookings
- ✅ Track booking status
- ✅ Monitor event capacity

### User Management
- ✅ View user profiles
- ✅ Monitor user activity

## Security Notes

⚠️ **Important:** These are development credentials for testing purposes.

**For Production:**
- Change default credentials
- Implement proper role-based access control
- Use secure authentication methods
- Add two-factor authentication
- Implement session management

## Troubleshooting

If you can't access the admin panel:

1. **Check URL:** Ensure you're at `/admin/login`
2. **Verify Credentials:** Use exact email and password
3. **Clear Browser Cache:** Clear cookies and local storage
4. **Check Console:** Look for JavaScript errors
5. **Verify Database:** Ensure Supabase is connected

## Quick Access

You can also access the admin panel directly by going to:
- `/admin/dashboard` (will redirect to login if not authenticated)
- `/admin/events` (will redirect to login if not authenticated)
- `/admin/bookings` (will redirect to login if not authenticated)

---

**Last Updated:** January 2025  
**Environment:** Development  
**Admin Email:** admin@celestia.com  
**Admin Password:** admin123
