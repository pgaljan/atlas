# Public Routes Documentation

These routes are accessible without authentication.  

---

## Routes

- `/` → Login  
- `/register` → Register  
- `/reset-password` → Reset Password  
- `/forgot-password` → Forgot Password  
- `/admin-portal` → Admin Login  
- `/privacy-policy` → Privacy Policy  
- `/terms-of-service` → Terms of Service  
- `/app/google-callback` → Google OAuth Callback  
- `/app/github-callback` → GitHub OAuth Callback  
- `/app/share-callback/accept-invitation` → Share Callback  
- `/subscription-plans` → Subscription Plans  
- `*` → Not Found  

---

## Notes  
- Public routes are wrapped with **`<PublicRoute>`**.  
- No authentication is required.