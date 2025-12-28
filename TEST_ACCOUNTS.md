# Test Accounts - Quick Reference

## 3 Ready-to-Use Test Accounts

### Account 1
```
Email: test1@mandastrong.com
Password: TestPass123!
Status: Active Premium (10 years)
```

### Account 2
```
Email: test2@mandastrong.com
Password: TestPass123!
Status: Active Premium (10 years)
```

### Account 3
```
Email: test3@mandastrong.com
Password: TestPass123!
Status: Active Premium (10 years)
```

## How to Set Up (One-Time Setup)

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard
   - Select your project

2. **Go to SQL Editor**
   - Click "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy & Paste the SQL**
   - Open the file: `setup-test-users.sql`
   - Copy all the SQL code
   - Paste it into the SQL Editor

4. **Run the Script**
   - Click "Run" or press Cmd/Ctrl + Enter
   - Wait for "Success" message

5. **Done!**
   - All 3 test accounts are now ready to use

## What Each Test Account Has

- ✅ **Active Premium Subscription** - No payment required
- ✅ **Full Upload Access** - Upload videos, images, audio
- ✅ **All AI Tools** - Access to all creative tools
- ✅ **Media Library** - Store and manage media
- ✅ **Community Features** - Post and interact
- ✅ **Create Unlimited Projects** - No restrictions
- ✅ **Valid for 10 Years** - Won't expire during testing

## Testing on Your Live App

1. Go to your Render URL: `https://your-app.onrender.com`
2. Click "Login"
3. Enter any test account email + password
4. You're in! Full access, no payment required

## Use Cases

- **Demos**: Show potential customers the full experience
- **QA Testing**: Test all features without payment
- **Team Access**: Share with developers/designers
- **User Acceptance Testing**: Let stakeholders test
- **Video Tutorials**: Record walkthroughs

## Important Notes

- These accounts bypass ALL payment requirements
- They work exactly like real paying customers
- Subscriptions are valid for 10 years
- You can create more test accounts using the same SQL pattern
- Password is the same for all 3 accounts for easy testing

## Security

- Test accounts are marked as regular "user" role (not admin)
- They cannot access admin-only features like Video Manager
- They can only upload their own content
- Perfect for testing the customer experience

## Need More Test Accounts?

Edit `setup-test-users.sql` and add more users following the same pattern:

```sql
-- Test User 4
INSERT INTO auth.users (...)
VALUES (..., 'test4@mandastrong.com', crypt('TestPass123!', gen_salt('bf')), ...)
```

Then run the updated script in Supabase SQL Editor.
