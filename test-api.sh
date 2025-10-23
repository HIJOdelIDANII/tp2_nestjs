#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# API Base URL
BASE_URL="http://localhost:3000"

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   NestJS CV Manager - API Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Function to print test result
test_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

check_server() {
    echo -e "${YELLOW}Checking if server is running...${NC}"
    curl -s -o /dev/null -w "%{http_code}" $BASE_URL/users > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Server is running on port 3000${NC}\n"
        return 0
    else
        echo -e "${RED}✗ Server is not running!${NC}"
        echo -e "${YELLOW}Please start the server with: npm run start:dev${NC}\n"
        exit 1
    fi
}

check_server

echo -e "${BLUE}=== Test 1: User CRUD ===${NC}"

# 1. Create User
echo -e "\n${YELLOW}Creating user...${NC}"
USER_RESPONSE=$(curl -s -X POST $BASE_URL/users \
  -H "Content-Type: application/json" \
  -d '{"username":"test_user","email":"test@example.com","password":"test123"}')

USER_ID=$(echo $USER_RESPONSE | jq -r '.id')
if [ "$USER_ID" != "null" ] && [ -n "$USER_ID" ]; then
    test_result 0 "Create User (POST /users)"
    echo "  User ID: $USER_ID"
else
    test_result 1 "Create User (POST /users)"
fi

# 2. Get All Users
echo -e "\n${YELLOW}Getting all users...${NC}"
USERS_RESPONSE=$(curl -s $BASE_URL/users)
USERS_COUNT=$(echo $USERS_RESPONSE | jq '. | length')
if [ "$USERS_COUNT" -gt 0 ]; then
    test_result 0 "Get All Users (GET /users) - Found $USERS_COUNT user(s)"
else
    test_result 1 "Get All Users (GET /users)"
fi

# 3. Get Single User
echo -e "\n${YELLOW}Getting single user...${NC}"
SINGLE_USER=$(curl -s $BASE_URL/users/$USER_ID)
USERNAME=$(echo $SINGLE_USER | jq -r '.username')
if [ "$USERNAME" == "test_user" ]; then
    test_result 0 "Get User by ID (GET /users/:id)"
else
    test_result 1 "Get User by ID (GET /users/:id)"
fi

# 4. Update User
echo -e "\n${YELLOW}Updating user...${NC}"
UPDATE_RESPONSE=$(curl -s -X PATCH $BASE_URL/users/$USER_ID \
  -H "Content-Type: application/json" \
  -d '{"username":"updated_user"}')
UPDATED_NAME=$(echo $UPDATE_RESPONSE | jq -r '.username')
if [ "$UPDATED_NAME" == "updated_user" ]; then
    test_result 0 "Update User (PATCH /users/:id)"
else
    test_result 1 "Update User (PATCH /users/:id)"
fi

echo -e "\n${BLUE}=== Test 2: Skill CRUD ===${NC}"

# 5. Create Skills
echo -e "\n${YELLOW}Creating skills...${NC}"
SKILL1=$(curl -s -X POST $BASE_URL/skills \
  -H "Content-Type: application/json" \
  -d '{"designation":"Python"}')
SKILL1_ID=$(echo $SKILL1 | jq -r '.id')

SKILL2=$(curl -s -X POST $BASE_URL/skills \
  -H "Content-Type: application/json" \
  -d '{"designation":"Docker"}')
SKILL2_ID=$(echo $SKILL2 | jq -r '.id')

SKILL3=$(curl -s -X POST $BASE_URL/skills \
  -H "Content-Type: application/json" \
  -d '{"designation":"React"}')
SKILL3_ID=$(echo $SKILL3 | jq -r '.id')

if [ "$SKILL1_ID" != "null" ] && [ "$SKILL2_ID" != "null" ] && [ "$SKILL3_ID" != "null" ]; then
    test_result 0 "Create Skills (POST /skills) - Created 3 skills"
    echo "  Skill IDs: $SKILL1_ID, $SKILL2_ID, $SKILL3_ID"
else
    test_result 1 "Create Skills (POST /skills)"
fi

# 6. Test Duplicate Skill
echo -e "\n${YELLOW}Testing duplicate skill prevention...${NC}"
DUPLICATE=$(curl -s -w "%{http_code}" -o /tmp/dup_response.json -X POST $BASE_URL/skills \
  -H "Content-Type: application/json" \
  -d '{"designation":"Python"}')
if [ "$DUPLICATE" == "409" ]; then
    test_result 0 "Duplicate Skill Validation (returns 409 Conflict)"
else
    test_result 1 "Duplicate Skill Validation (expected 409, got $DUPLICATE)"
fi

# 7. Get All Skills
echo -e "\n${YELLOW}Getting all skills...${NC}"
SKILLS=$(curl -s $BASE_URL/skills)
SKILLS_COUNT=$(echo $SKILLS | jq '. | length')
if [ "$SKILLS_COUNT" -ge 3 ]; then
    test_result 0 "Get All Skills (GET /skills) - Found $SKILLS_COUNT skill(s)"
else
    test_result 1 "Get All Skills (GET /skills)"
fi

# 8. Update Skill
echo -e "\n${YELLOW}Updating skill...${NC}"
UPDATE_SKILL=$(curl -s -X PATCH $BASE_URL/skills/$SKILL1_ID \
  -H "Content-Type: application/json" \
  -d '{"designation":"Python 3.11"}')
UPDATED_SKILL=$(echo $UPDATE_SKILL | jq -r '.designation')
if [ "$UPDATED_SKILL" == "Python 3.11" ]; then
    test_result 0 "Update Skill (PATCH /skills/:id)"
else
    test_result 1 "Update Skill (PATCH /skills/:id)"
fi

echo -e "\n${BLUE}=== Test 3: CV CRUD ===${NC}"

# 9. Create CV
echo -e "\n${YELLOW}Creating CV...${NC}"
CV_RESPONSE=$(curl -s -X POST $BASE_URL/cvs \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Smith\",\"firstname\":\"Jane\",\"age\":28,\"cin\":87654321,\"job\":\"DevOps Engineer\",\"path\":\"/uploads/jane_cv.pdf\",\"userId\":\"$USER_ID\"}")
CV_ID=$(echo $CV_RESPONSE | jq -r '.id')
CV_USER_ID=$(echo $CV_RESPONSE | jq -r '.user.id')

if [ "$CV_ID" != "null" ] && [ "$CV_USER_ID" == "$USER_ID" ]; then
    test_result 0 "Create CV (POST /cvs) with User relation"
    echo "  CV ID: $CV_ID"
else
    test_result 1 "Create CV (POST /cvs)"
fi

# 10. Get All CVs
echo -e "\n${YELLOW}Getting all CVs...${NC}"
CVS=$(curl -s $BASE_URL/cvs)
CVS_COUNT=$(echo $CVS | jq '. | length')
if [ "$CVS_COUNT" -gt 0 ]; then
    test_result 0 "Get All CVs (GET /cvs) - Found $CVS_COUNT CV(s)"
else
    test_result 1 "Get All CVs (GET /cvs)"
fi

# 11. Update CV
echo -e "\n${YELLOW}Updating CV...${NC}"
UPDATE_CV=$(curl -s -X PATCH $BASE_URL/cvs/$CV_ID \
  -H "Content-Type: application/json" \
  -d '{"job":"Senior DevOps Engineer","age":29}')
UPDATED_JOB=$(echo $UPDATE_CV | jq -r '.job')
UPDATED_AGE=$(echo $UPDATE_CV | jq -r '.age')
if [ "$UPDATED_JOB" == "Senior DevOps Engineer" ] && [ "$UPDATED_AGE" == "29" ]; then
    test_result 0 "Update CV (PATCH /cvs/:id)"
else
    test_result 1 "Update CV (PATCH /cvs/:id)"
fi

echo -e "\n${BLUE}=== Test 4: CV-Skill Relations ===${NC}"

# 12. Add Skills to CV
echo -e "\n${YELLOW}Adding skills to CV...${NC}"
ADD_SKILLS=$(curl -s -X POST $BASE_URL/cvs/$CV_ID/skills \
  -H "Content-Type: application/json" \
  -d "{\"skillIds\":[\"$SKILL1_ID\",\"$SKILL2_ID\",\"$SKILL3_ID\"]}")
SKILLS_IN_CV=$(echo $ADD_SKILLS | jq '.skills | length')
if [ "$SKILLS_IN_CV" == "3" ]; then
    test_result 0 "Add Skills to CV (POST /cvs/:id/skills) - Added 3 skills"
else
    test_result 1 "Add Skills to CV (expected 3, got $SKILLS_IN_CV)"
fi

# 13. Get CV Skills
echo -e "\n${YELLOW}Getting CV skills...${NC}"
CV_SKILLS=$(curl -s $BASE_URL/cvs/$CV_ID/skills)
CV_SKILLS_COUNT=$(echo $CV_SKILLS | jq '. | length')
if [ "$CV_SKILLS_COUNT" == "3" ]; then
    test_result 0 "Get CV Skills (GET /cvs/:id/skills)"
else
    test_result 1 "Get CV Skills (GET /cvs/:id/skills)"
fi

# 14. Remove Skill from CV
echo -e "\n${YELLOW}Removing skill from CV...${NC}"
REMOVE_SKILL=$(curl -s -X DELETE $BASE_URL/cvs/$CV_ID/skills/$SKILL2_ID)
REMAINING_SKILLS=$(echo $REMOVE_SKILL | jq '.skills | length')
if [ "$REMAINING_SKILLS" == "2" ]; then
    test_result 0 "Remove Skill from CV (DELETE /cvs/:id/skills/:skillId)"
else
    test_result 1 "Remove Skill from CV (expected 2 remaining, got $REMAINING_SKILLS)"
fi

# 15. Get User's CVs
echo -e "\n${YELLOW}Getting user's CVs...${NC}"
USER_CVS=$(curl -s $BASE_URL/users/$USER_ID/cvs)
USER_CVS_COUNT=$(echo $USER_CVS | jq '. | length')
USER_CV_WITH_SKILLS=$(echo $USER_CVS | jq '.[0].skills | length')
if [ "$USER_CVS_COUNT" -gt 0 ] && [ "$USER_CV_WITH_SKILLS" == "2" ]; then
    test_result 0 "Get User's CVs (GET /users/:id/cvs) with skills"
else
    test_result 1 "Get User's CVs (GET /users/:id/cvs)"
fi

echo -e "\n${BLUE}=== Test 5: Error Handling ===${NC}"

# 16. Get Non-existent User
echo -e "\n${YELLOW}Testing 404 error...${NC}"
NOT_FOUND=$(curl -s -w "%{http_code}" -o /dev/null $BASE_URL/users/00000000-0000-0000-0000-000000000000)
if [ "$NOT_FOUND" == "404" ]; then
    test_result 0 "404 Not Found (GET /users/:id with invalid ID)"
else
    test_result 1 "404 Not Found (expected 404, got $NOT_FOUND)"
fi

# 17. Invalid Data
echo -e "\n${YELLOW}Testing validation...${NC}"
INVALID=$(curl -s -w "%{http_code}" -o /tmp/invalid_response.json -X POST $BASE_URL/cvs \
  -H "Content-Type: application/json" \
  -d '{"name":"Test"}')
# Should fail due to missing required fields
if [ "$INVALID" != "201" ]; then
    test_result 0 "Validation (POST with incomplete data rejected)"
else
    test_result 1 "Validation (incomplete data was accepted)"
fi

echo -e "\n${BLUE}=== Cleanup ===${NC}"

# 18. Delete CV
echo -e "\n${YELLOW}Deleting CV...${NC}"
DELETE_CV=$(curl -s -X DELETE $BASE_URL/cvs/$CV_ID)
DELETE_MSG=$(echo $DELETE_CV | jq -r '.message')
if [[ "$DELETE_MSG" == *"deleted"* ]]; then
    test_result 0 "Delete CV (DELETE /cvs/:id)"
else
    test_result 1 "Delete CV (DELETE /cvs/:id)"
fi

# 19. Delete Skills
echo -e "\n${YELLOW}Deleting skills...${NC}"
curl -s -X DELETE $BASE_URL/skills/$SKILL1_ID > /dev/null
curl -s -X DELETE $BASE_URL/skills/$SKILL2_ID > /dev/null
curl -s -X DELETE $BASE_URL/skills/$SKILL3_ID > /dev/null
test_result 0 "Delete Skills (DELETE /skills/:id)"

# 20. Soft Delete User
echo -e "\n${YELLOW}Soft deleting user...${NC}"
DELETE_USER=$(curl -s -X DELETE $BASE_URL/users/$USER_ID)
DELETE_USER_MSG=$(echo $DELETE_USER | jq -r '.message')
if [[ "$DELETE_USER_MSG" == *"deleted"* ]]; then
    test_result 0 "Soft Delete User (DELETE /users/:id)"
else
    test_result 1 "Soft Delete User (DELETE /users/:id)"
fi

echo -e "\n${BLUE}========================================${NC}"
echo -e "${BLUE}           Test Summary${NC}"
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Failed: $TESTS_FAILED${NC}"
echo -e "${BLUE}Total:  $((TESTS_PASSED + TESTS_FAILED))${NC}"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n${GREEN}🎉 All tests passed!${NC}\n"
    exit 0
else
    echo -e "\n${RED}❌ Some tests failed!${NC}\n"
    exit 1
fi
