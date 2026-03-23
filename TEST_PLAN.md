# Test Plan for triggerLowMoistureProcess Function

## Objective
Test that the `triggerLowMoistureProcess` function correctly:
1. Detects when plant moisture falls below the threshold (TargetMoisture / 2)
2. Randomly selects an available user with `intend_to_help = true`
3. Creates a task and assigns it to that user

## Prerequisites
- Backend server running on `http://localhost:8080`
- Database is accessible and initialized
- At least one user exists with `intend_to_help = true`
- A plant exists with a sensor_id

## Test Steps

### Step 1: Create a Test User (if needed)
This user will have `intend_to_help = true` to be available for task assignment.

```bash
# Set user intention to help
curl -X POST http://localhost:8080/api/user/welcome \
  -H "Content-Type: application/json" \
  -b "auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzM5MjY5NTYsImxvZ2luIjoidHBpbmFybGkiLCJ1c2VyX2lkIjoxfQ.wDyq3Rt-JP_ox6T2mg5rMYt-tSLhlTfGbUhZ_JQvTKc" \
  -d '{
    "intend_to_help": true
  }'
```

**Expected Response:** 200 OK

---

### Step 2: Create a Test Plant (if needed)
Make sure you have a plant with the target_moisture set (e.g., 50%).

```bash
curl -X POST http://localhost:8080/plants/add \
  -H "Content-Type: application/json" \
  -b "auth_token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE3NzM5MjY5NTYsImxvZ2luIjoidHBpbmFybGkiLCJ1c2VyX2lkIjoxfQ.wDyq3Rt-JP_ox6T2mg5rMYt-tSLhlTfGbUhZ_JQvTKc" \
  -d '{                
    "name": "test_plant",             
    "species": "Test Species",       
    "category": "Tropical",
    "pot_volume_l": 2.0,            
    "light_need": "high",           
    "target_moisture": 60,        
    "sensor_id": "test_sensor_01",                                     
    "image_url": "https://example.com/images/test.jpg"
  }'
```

**Expected Response:** 201 Created (or 200 OK)

---

### Step 3: Send a Sensor Reading ABOVE Threshold
This should NOT trigger task creation (moisture is high enough).

```bash
curl -X POST http://localhost:8080/api/reading \
  -H "Content-Type: application/json" \
  -d '{
    "sensor_id": "test_sensor_01",
    "moisture": 45,
    "duration_ms": 1500
  }'
```

**Expected Response:** 200 OK
**Expected in logs:** 🌿 PLANT SERVICE log with moisture bar, NO alert, NO task created
**Check Database:** Query `SELECT * FROM tasks WHERE plant_id = <plant_id>;` - should be empty or not updated

---

### Step 4: Send a Sensor Reading BELOW Threshold
This SHOULD trigger task creation and user assignment.
- Plant target_moisture = 60
- Threshold = 60 / 2 = 30
- Send moisture = 20 (below threshold)

```bash
curl -X POST http://localhost:8080/api/reading \
  -H "Content-Type: application/json" \
  -d '{
    "sensor_id": "test_sensor_01",
    "moisture": 20,
    "duration_ms": 1500
  }'
```

**Expected Response:** 200 OK

**Expected in logs:**
```
⚠️ ALERT: Plant 'test_plant' moisture (20%) is critically low (target: 60%)
✅ Task assigned to user: tpinarli (ID: 1)
🌿 [HH:MM:SS] [PLANT SERVICE] PACKET: ID=test_sensor_01 | Time=1.50s | Moisture=██░░░░░░░░ 20%
```

---

### Step 5: Verify Task was Created in Database

```sql
SELECT id, plant_id, type, water_amount, status, volentee_id, scheduled_at 
FROM tasks 
WHERE plant_id = <plant_id> 
ORDER BY id DESC 
LIMIT 1;
```

**Expected Results:**
| id | plant_id | type   | water_amount | status | volentee_id | scheduled_at       |
|----|----------|--------|--------------|--------|-------------|-------------------|
| N  | X        | water  | 80           | open   | 1           | 2026-03-23 HH:MM |

**Key verifications:**
- ✅ `status` = "open"
- ✅ `volentee_id` is NOT NULL (should be the user ID that intends to help)
- ✅ `water_amount` is calculated correctly: `pot_volume * (target - moisture) / 100 * 1000` = `2.0 * (60 - 20) / 100 * 1000` = `80 ml`
- ✅ `type` = "water"

---

## Test with Multiple Users

To test the random user selection, create multiple users with `intend_to_help = true`, then repeat Step 4 multiple times. Each time a new task is created, it should be assigned to a different random user.

```bash
# Check all tasks created for this plant
SELECT id, plant_id, volentee_id, scheduled_at 
FROM tasks 
WHERE plant_id = <plant_id> 
ORDER BY id DESC;
```

**Expected:** Different `volentee_id` values in different tasks (random distribution).

---

## Troubleshooting

### Issue: No user is being assigned (volentee_id is NULL)
**Possible Cause:** No user in the database has `intend_to_help = true`
**Solution:** Run Step 1 to set a user's intention to help

### Issue: Task is created but without user assignment
**Check logs for:** `⚠️ Warning: Could not find available user to assign task`
**Solution:** Verify users table has at least one record with `intend_to_help = true`

### Issue: Function not being triggered (no alert message)
**Possible Cause:** Moisture reading is not below threshold
**Solution:** Lower the moisture value further, or verify plant's target_moisture is set correctly

---

## Success Criteria
- ✅ Sensor reading below threshold triggers alert
- ✅ Random available user is selected and logged
- ✅ Task is created with correct water_amount
- ✅ Task is assigned to the selected user (volentee_id is NOT NULL)
- ✅ Multiple test runs show different random user assignments
