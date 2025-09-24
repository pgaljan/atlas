# Private Routes Documentation

These routes require authentication. They are grouped into **User**, **Admin**, and **API Management** routes.  

---

## User Private Routes (`<PrivateRoute>`)

- `/app/dashboard` → Dashboard  
- `/app/backups` → Backups  
- `/app/shared-with-me` → Shared With Me
- `/app/templates` → Templates  
- `/app/invitations` → Invitations  
- `/app/upgrade-plans` → Upgrade Plans  
- `/app/syncfusion` → Syncfusion  
- `/app/privacy-policy` → User Privacy Policy  
- `/app/terms-of-service` → User Terms of Service  
- `/app/s/:username/:structureId` → Structure Renderer  
- `/app/coming-soon` → Coming Soon  
- `/app/user-settings` → User Settings  

---

## Admin Private Routes (`<AdminPrivateRoute>`)

- `/app/admin-portal/user-management` → User Management  
- `/app/admin-portal/structure-Catalogs` → Structure Catalogs  
- `/app/admin-portal/user-profile` → User Profile  
- `/app/admin-portal/subscription-plan` → Subscription Management  
- `/app/admin-portal/dashboard` → Admin Dashboard  
- `/app/admin-portal/policy` → Privacy Policy  
- `/app/admin-portal/terms-of-service` → Terms of Service  
- `/app/admin-portal/settings` → Admin Settings  

---

## API Management Private Routes (`<APIKeyPrivateRoute>`)

- `/api-management/overview` → Overview  
- `/api-management/favorites/apis` → Favorite APIs  
- `/api-management/favorites/activity-overview` → Activity Overview  
- `/api-management/explore` → Explore APIs  
- `/api-management/apis` → APIs  
- `/api-management/try-it` → Try It  
- `/api-management/api-templates` → API Templates  
- `/api-management/examples` → Examples  
- `/api-management/webhooks` → Webhooks  
- `/api-management/support` → Support  
- `/api-management/security/keys` → API Keys  
- `/api-management/security/policies` → Security Policies  
- `/api-management/security/certificates` → Security Certificates  

---

## Notes  
- **PrivateRoute** → Requires user login.  
- **AdminPrivateRoute** → Requires admin privileges.  
- **APIKeyPrivateRoute** → Requires valid API key.