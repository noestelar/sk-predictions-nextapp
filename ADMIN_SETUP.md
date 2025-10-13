# Admin System Setup Guide

This application now includes a role-based admin system to protect administrative functions.

## Overview

The admin system controls access to:
- Setting cutoff dates for predictions
- Recording actual gift exchange results
- Managing the game dynamics

## How It Works

1. **Database**: A boolean `isAdmin` field has been added to the User model (default: `false`)
2. **Authentication**: Admin status is included in the session JWT token
3. **Authorization**: All admin pages and API routes check for `session.user.isAdmin`
4. **UI**: Admin users see a "Panel Admin" link in the header dropdown menu

## Setting Up Admins

### Method 1: Using the Helper Scripts (Recommended)

We've included three helper scripts to manage admin users:

#### Set a user as admin:
```bash
node scripts/set-admin.js user@example.com
```

#### Remove admin privileges:
```bash
node scripts/remove-admin.js user@example.com
```

#### List all admins:
```bash
node scripts/list-admins.js
```

### Method 2: Direct Database Update

You can also manually update the database:

```bash
# Using Prisma Studio (GUI)
npx prisma studio

# Or via SQL
psql -d sk_predictions -c "UPDATE \"User\" SET \"isAdmin\" = true WHERE email = 'user@example.com';"
```

## Important Notes

1. **First Login**: Users must log in at least once via Facebook OAuth before you can make them an admin (so their user record exists in the database)

2. **Session Refresh**: After making someone an admin, they need to sign out and sign back in for the change to take effect in their session

3. **Security**: The admin status is stored in the JWT token and verified on both client and server side

4. **Access Control**: 
   - Non-admin users see "Acceso Denegado" (Access Denied) if they try to access admin pages
   - API routes return 401 Unauthorized for non-admin requests

## Testing

To test the admin functionality:

1. Log in with a test user
2. Make that user an admin using one of the methods above
3. Sign out and sign back in
4. You should now see "Panel Admin" in the header dropdown
5. Click it to access the admin panel

## Protected Routes

### Pages
- `/admin` - Admin dashboard
- `/admin/cutoff` - Set prediction cutoff dates
- `/admin/results` - Record actual gift exchange results

### API Routes
- `POST /api/admin/cutoff` - Save cutoff date
- `GET /api/admin/cutoff` - Get cutoff date
- `POST /api/admin/results` - Save results
- `GET /api/admin/results` - Get results

All of these routes now require the user to be authenticated AND have `isAdmin: true`.

