# Postman Setup Guide - Freelancer Website API

This guide will help you set up and use the Postman collection for the Freelancer Website API.

## 📥 Importing the Collection

### Method 1: Import from File

1. Open Postman
2. Click on **"Import"** button (top left)
3. Click **"Choose Files"** or drag and drop
4. Select `Freelancer_API.postman_collection.json`
5. Click **"Import"**

### Method 2: Import via Raw Text

1. Open Postman
2. Click **"Import"** → **"Raw text"** tab
3. Copy the entire contents of `Freelancer_API.postman_collection.json`
4. Paste into the text area
5. Click **"Import"**

## 🔧 Collection Structure

The collection is organized into **9 main folders**:

```
📁 Freelancer Website API
├── 📂 Health Check (1 request)
├── 📂 User Management (9 requests)
├── 📂 Profile Management (9 requests)
├── 📂 Project Management (9 requests)
├── 📂 Proposal Management (8 requests)
├── 📂 Contract Management (9 requests)
├── 📂 Milestone Management (7 requests)
├── 📂 Payment Management (6 requests)
├── 📂 Skill Management (6 requests)
└── 📂 Portfolio Management (7 requests)
```

**Total: 71 API Endpoints**

## ⚙️ Collection Variables

The collection uses variables for dynamic data. These are automatically set by test scripts after successful API calls.

### Variables List:

| Variable | Description | Example Value |
|----------|-------------|---------------|
| `base_url` | API base URL | `http://localhost:5000/api` |
| `jwt_token` | JWT authentication token | Auto-set after login |
| `user_id` | Current user ID | Auto-set after registration/login |
| `profile_id` | Profile ID | Auto-set after profile creation |
| `project_id` | Project ID | Auto-set after project creation |
| `proposal_id` | Proposal ID | Auto-set after proposal creation |
| `contract_id` | Contract ID | Auto-set after contract creation |
| `milestone_id` | Milestone ID | Auto-set after milestone creation |
| `payment_id` | Payment order ID | Auto-set after payment creation |
| `skill_id` | Skill ID | Auto-set after skill creation |
| `portfolio_id` | Portfolio item ID | Auto-set after portfolio item creation |

### Viewing/Editing Variables:

1. Click on the collection name **"Freelancer Website API"**
2. Select the **"Variables"** tab
3. View or edit variable values
4. Click **"Save"** after making changes

## 🚀 Getting Started - Step by Step

### Step 1: Update Base URL (if needed)

If your API is running on a different port or URL:

1. Click on the collection
2. Go to **Variables** tab
3. Update `base_url` (e.g., `http://localhost:3000/api` or `https://your-domain.com/api`)
4. Click **Save**

### Step 2: Register a New User

1. Navigate to: **User Management → Register User**
2. The request body is pre-filled with example data
3. Update the email to your email address
4. Click **Send**
5. ✅ **Success**: `user_id` variable is automatically set

### Step 3: Login

1. Navigate to: **User Management → Login User**
2. Use the same email and password from registration
3. Click **Send**
4. ✅ **Success**: `jwt_token` and `user_id` are automatically set

### Step 4: Test Authenticated Endpoints

Now you can test any authenticated endpoint. The JWT token is automatically included in the Authorization header.

Example: **User Management → Get Current User Profile**
- Click **Send**
- You'll see your user profile data

## 🔐 Authentication

### How It Works:

1. The collection uses **Bearer Token** authentication
2. After logging in, the `jwt_token` variable is automatically set
3. All authenticated requests use `{{jwt_token}}` in the Authorization header

### Manual Token Setup (if needed):

1. Click on the collection name
2. Go to **Authorization** tab
3. Type: **Bearer Token**
4. Token: `{{jwt_token}}`

### Testing Without Auth:

To test endpoints without authentication:
1. Open the specific request
2. Go to **Authorization** tab
3. Select **"No Auth"**

## 📝 Common Workflows

### Workflow 1: Complete User Journey (Freelancer)

```
1. Register User
2. Login User
3. Create Profile (with displayName, bio, hourlyRate)
4. Create Skills (JavaScript, Node.js, etc.)
5. Add Skills to Profile
6. Create Portfolio Items
7. Browse Projects
8. Create Proposal for a Project
```

### Workflow 2: Complete Client Journey

```
1. Register User (role: "client")
2. Login User
3. Create Project
4. View Proposals on Project
5. Accept Proposal
6. Create Contract
7. Create Milestones
8. Fund Milestone (Create Payment Order)
9. Release Milestone Payment
```

### Workflow 3: Admin Operations

```
1. Login as Admin
2. Get All Users
3. Update User Status
4. Get All Projects
5. Manage Contracts
6. View All Payments
```

## 🧪 Test Scripts

The collection includes automatic test scripts that:

1. **Extract Response Data**: After successful requests, important IDs are automatically saved to collection variables
2. **Auto-Set Variables**: You don't need to manually copy/paste IDs between requests

### Example: Login Request

After a successful login, the test script automatically:
- Saves the JWT token to `jwt_token` variable
- Saves the user ID to `user_id` variable

## 🎯 Request Examples

### Create Profile Request

**Endpoint**: `POST {{base_url}}/profiles`

**Body**:
```json
{
    "userId": "{{user_id}}",
    "displayName": "John the Developer",
    "bio": "Full-stack developer with 5 years of experience",
    "hourlyRate": 50,
    "location": "New York, USA",
    "experienceLevel": "intermediate",
    "profilePhoto": "https://example.com/photo.jpg"
}
```

**Auto-saved**: `profile_id`

### Create Project Request

**Endpoint**: `POST {{base_url}}/projects`

**Body**:
```json
{
    "title": "E-commerce Website Development",
    "description": "Looking for a skilled developer...",
    "budgetMin": 1000,
    "budgetMax": 3000
}
```

**Auto-saved**: `project_id`

### Create Proposal Request

**Endpoint**: `POST {{base_url}}/proposals`

**Body**:
```json
{
    "projectId": "{{project_id}}",
    "coverLetter": "I am interested in your project...",
    "bidAmount": 2500,
    "durationInDays": 30
}
```

**Auto-saved**: `proposal_id`

## 🔍 Query Parameters

Many GET requests support query parameters for filtering and pagination:

### Common Query Parameters:

- `limit`: Number of results per page (default: 50)
- `offset`: Starting position (default: 0)
- `keyword`: Search keyword
- `orderBy`: Field to sort by (e.g., `createdAt`, `name`)
- `sortBy`: Sort direction (`ASC` or `DESC`)

### Example: Get All Users with Filters

```
GET {{base_url}}/users?limit=20&offset=0&keyword=john&orderBy=createdAt&sortBy=DESC
```

## 🎨 Postman Environment Setup (Optional)

For managing multiple environments (dev, staging, production):

### Create Environment:

1. Click **"Environments"** in sidebar
2. Click **"+"** to create new environment
3. Name it (e.g., "Development")
4. Add variables:
   - `base_url`: `http://localhost:5000/api`
   - `jwt_token`: (leave empty)
5. Click **"Save"**

### Switch Environments:

1. Top-right dropdown
2. Select your environment
3. Variables will use environment values instead of collection values

## 📊 Collection Runner

To test multiple requests sequentially:

1. Right-click on a folder (e.g., "User Management")
2. Select **"Run folder"**
3. Configure:
   - Number of iterations
   - Delay between requests
4. Click **"Run"**

## 🛠️ Troubleshooting

### Issue: "401 Unauthorized"

**Solution**:
- Make sure you've logged in
- Check if `jwt_token` variable is set
- Token might be expired - login again

### Issue: "404 Not Found"

**Solution**:
- Verify server is running (`npm run dev`)
- Check `base_url` variable is correct
- Ensure you're using correct endpoint path

### Issue: "400 Bad Request"

**Solution**:
- Check request body format
- Verify all required fields are provided
- Check field validation (e.g., valid email format)

### Issue: Variables Not Auto-Setting

**Solution**:
- Check the **Tests** tab in the request
- Make sure the request was successful (200, 201 status)
- Manually set the variable if needed

### Issue: "Cannot find module" or Server Errors

**Solution**:
- Check server logs in terminal
- Verify database is running
- Check `.env` file configuration

## 📱 Mobile Testing

Postman has mobile apps for iOS and Android:

1. Download Postman app
2. Sign in to your account
3. Your collections will sync automatically
4. Update `base_url` to your deployed API or use `ngrok` for local testing

## 🔄 Syncing Collections

If you're working in a team:

1. Sign in to Postman account
2. Collections auto-sync across devices
3. Team members can access shared collections
4. Use version control for collection files

## 💡 Tips and Best Practices

### 1. Use Variables
Always use `{{variable}}` instead of hardcoding values

### 2. Save Requests
After modifying requests, click **Save** (Ctrl+S)

### 3. Use Folders
Keep related requests organized in folders

### 4. Add Descriptions
Document each request with usage examples

### 5. Test Scripts
Review test scripts to understand what variables are auto-set

### 6. Pre-request Scripts
Use pre-request scripts to set dynamic data (timestamps, random values)

### 7. Console Logs
View **Console** (bottom panel) to debug requests

### 8. Response Tabs
- **Pretty**: Formatted JSON
- **Raw**: Raw response
- **Preview**: HTML preview
- **Headers**: Response headers

## 📚 Additional Resources

- [Postman Documentation](https://learning.postman.com/docs/)
- [API Documentation](./README.md)
- [Environment Variables Guide](https://learning.postman.com/docs/sending-requests/variables/)

## 🎉 Quick Start Checklist

- [ ] Import collection to Postman
- [ ] Update `base_url` variable
- [ ] Start your API server (`npm run dev`)
- [ ] Register a new user
- [ ] Login and verify `jwt_token` is set
- [ ] Test "Get Current User Profile" endpoint
- [ ] Explore other endpoints!

---

## 📞 Support

If you encounter issues:
1. Check server logs
2. Verify environment variables
3. Review request/response in Postman Console
4. Check API documentation in README.md

**Happy Testing! 🚀**

