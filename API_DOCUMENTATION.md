# API Endpoints - CV Manager

## Base Configuration

- Global Prefix: `main` (from `main.ts`)
- All routes start with `/main`

---

## 🟢 User Module

**Base route:** `/main/users`

| Method | Route                     | Body/Params                        | Description               |
| ------ | ------------------------- | ---------------------------------- | ------------------------- |
| POST   | `/main/users`             | `{ username, email, password }`    | Create a new user         |
| GET    | `/main/users`             | —                                  | Get all users             |
| GET    | `/main/users/:id`         | —                                  | Get user by ID            |
| PUT    | `/main/users/:id`         | `{ username?, email?, password? }` | Full update               |
| PATCH  | `/main/users/:id`         | `{ username?, email?, password? }` | Partial update            |
| DELETE | `/main/users/:id`         | —                                  | Soft delete user          |
| PATCH  | `/main/users/:id/restore` | —                                  | Restore soft-deleted user |
| DELETE | `/main/users/:id/hard`    | —                                  | Permanent delete          |
| GET    | `/main/users/:id/cvs`     | —                                  | Get all CVs of a user     |

---

## 🟡 CV Module

**Base route:** `/main/cvs`

| Method | Route                           | Body/Params                                        | Description                      |
| ------ | ------------------------------- | -------------------------------------------------- | -------------------------------- |
| POST   | `/main/cvs`                     | `{ name, firstname, age, cin, job, path, userId }` | Create a CV                      |
| GET    | `/main/cvs`                     | —                                                  | Get all CVs (with user & skills) |
| GET    | `/main/cvs/:id`                 | —                                                  | Get CV by ID (with relations)    |
| PATCH  | `/main/cvs/:id`                 | `{ name?, firstname?, age?, cin?, job?, path? }`   | Update CV info                   |
| DELETE | `/main/cvs/:id`                 | —                                                  | Delete CV                        |
| GET    | `/main/cvs/:id/skills`          | —                                                  | Get all skills of a CV           |
| POST   | `/main/cvs/:id/skills`          | `{ skillIds: string[] }`                           | Add skills to CV                 |
| DELETE | `/main/cvs/:id/skills/:skillId` | —                                                  | Remove skill from CV             |

---

## 🔵 Skill Module

**Base route:** `/main/skills`

| Method | Route              | Body/Params        | Description                         |
| ------ | ------------------ | ------------------ | ----------------------------------- |
| POST   | `/main/skills`     | `{ designation }`  | Create a skill (unique designation) |
| GET    | `/main/skills`     | —                  | Get all skills                      |
| GET    | `/main/skills/:id` | —                  | Get skill by ID                     |
| PATCH  | `/main/skills/:id` | `{ designation? }` | Update skill name                   |
| DELETE | `/main/skills/:id` | —                  | Delete skill                        |

---

## Example Usage

### 1. Create a User

```bash
curl -X POST http://localhost:3000/main/users \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "securepass123"
  }'
```

### 2. Create Skills

```bash
curl -X POST http://localhost:3000/main/skills \
  -H "Content-Type: application/json" \
  -d '{"designation": "JavaScript"}'

curl -X POST http://localhost:3000/main/skills \
  -H "Content-Type: application/json" \
  -d '{"designation": "TypeScript"}'
```

### 3. Create a CV

```bash
curl -X POST http://localhost:3000/main/cvs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Doe",
    "firstname": "John",
    "age": 30,
    "cin": 12345678,
    "job": "Software Developer",
    "path": "/uploads/john_cv.pdf",
    "userId": "USER_UUID_HERE"
  }'
```

### 4. Add Skills to CV

```bash
curl -X POST http://localhost:3000/main/cvs/CV_UUID_HERE/skills \
  -H "Content-Type: application/json" \
  -d '{
    "skillIds": ["SKILL_UUID_1", "SKILL_UUID_2"]
  }'
```

### 5. Get User's CVs

```bash
curl http://localhost:3000/main/users/USER_UUID_HERE/cvs
```

### 6. Remove Skill from CV

```bash
curl -X DELETE http://localhost:3000/main/cvs/CV_UUID_HERE/skills/SKILL_UUID_HERE
```

---

## Features Implemented

### User Service

✅ Full CRUD operations  
✅ Soft delete with restore  
✅ Hard delete  
✅ Get user's CVs with relations  
✅ Error handling with NotFoundException

### CV Service

✅ Full CRUD operations  
✅ User relationship validation  
✅ Skill management (add/remove many-to-many)  
✅ Load relations (user, skills)  
✅ Duplicate skill prevention  
✅ Error handling

### Skill Service

✅ Full CRUD operations  
✅ Unique designation validation  
✅ Conflict detection (duplicate names)  
✅ Error handling

---

## DTOs Created

### User Module

- `CreateUserDto` - username, email, password
- `UpdateUserDto` - all fields optional

### CV Module

- `CreateCvDto` - name, firstname, age, cin, job, path, userId
- `UpdateCvDto` - all fields optional (except userId)
- `AddSkillsDto` - skillIds: string[]

### Skill Module

- `CreateSkillDto` - designation
- `UpdateSkillDto` - designation (optional)

---

## Database Relations

### User ↔ CV (One-to-Many)

- User has many CVs
- CV belongs to one User
- Accessed via `user.cvs` or `cv.user`

### CV ↔ Skill (Many-to-Many)

- CV has many Skills
- Skill belongs to many CVs
- Join table created automatically
- Accessed via `cv.skills`

---

## Notes

- All entities extend `TimestampAbstract` (createdAt, updatedAt, deletedAt)
- UUIDs used for all primary keys
- Soft delete enabled on User (can be restored)
- CIN must be unique per CV
- Skill designation must be unique
- Email must be unique per User
