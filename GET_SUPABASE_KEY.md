# 🔑 How to Get Your Supabase Anon Key

## Step 1: Open Your Supabase Project

1. Go to https://supabase.com/dashboard
2. Sign in with your account
3. Click on your project: **dgf**
4. Project URL: `https://ygucygkmdklngczxgbyw.supabase.co`

## Step 2: Get the Anon Key

1. In the left sidebar, click **Project Settings** (gear icon at bottom)
2. Click **API** in the settings menu
3. Look for the section **Project API keys**
4. Copy the **anon** **public** key (NOT the service_role key)

The key will look like this:
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS...
```

It's a long JWT token that starts with `eyJ`

## Step 3: Send Me the Key

Once you have the anon key, send it to me and I'll:
1. Update the database configuration
2. Migrate all your data from the old database
3. Test the connection

## Important Notes

⚠️ The **anon (public) key** is safe to use in your frontend app
⚠️ Do NOT share the **service_role key** (it has admin access)

---

**What I need from you:**
- The **anon** **public** key from the API settings

**Project Details:**
- Project Name: dgf
- Project URL: https://ygucygkmdklngczxgbyw.supabase.co
