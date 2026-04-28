# PlantBee Disaster Recovery Runbook

Region: `ap-northeast-2`
Stack prefix: `Plantbee-*`

---

## Scenario 1 — API server down (ECS task crash)

The ECS circuit breaker automatically rolls back to the previous task definition.
If manual intervention is needed:

```bash
# Check service status
aws ecs describe-services \
  --cluster <cluster-name> \
  --services <service-name> \
  --region ap-northeast-2 \
  --query "services[0].{status:status,running:runningCount,desired:desiredCount,deployments:deployments[*].{status:status,taskDef:taskDefinition}}"

# Force redeploy (without changing the image)
aws ecs update-service \
  --cluster <cluster-name> \
  --service <service-name> \
  --force-new-deployment \
  --region ap-northeast-2
```

> Cluster and service names are available in the CDK deploy outputs (`EcsClusterName`, `EcsServiceName`)
> or via AWS Console → ECS.

**Expected recovery time:** 2–5 minutes

---

## Scenario 2 — Data corruption / accidental data deletion

Restore from RDS automated snapshots (7-day retention) or PITR (up to the last 5 minutes).

### 2-1. List available snapshots

```bash
cd infra/scripts
chmod +x restore-db.sh
./restore-db.sh list
```

### 2-2a. Restore from a specific snapshot

```bash
./restore-db.sh snapshot rds:plantbee-database-postgres-2026-04-28-03-00
```

### 2-2b. Restore to a point in time (PITR)

```bash
# Restore to just before the incident
./restore-db.sh pitr 2026-04-28T08:55:00Z
```

### 2-3. Update CDK after restore

Follow the instructions printed by the script:

1. Add `instanceIdentifier` to `infra/lib/database-stack.ts` pointing to the restored instance
2. `cd infra && cdk deploy Plantbee-Database Plantbee-Backend`
3. Verify `/api/status` shows `database: ok`
4. Delete the old instance

**Expected recovery time:** 15–20 minutes (RDS restore ~10 min + CDK redeploy ~5 min)

---

## Scenario 3 — RDS instance failure

`multiAz: true` is configured, so AWS automatically fails over to the standby replica (~1–2 minutes).
No manual action required. Poll `/api/status` to confirm recovery.

If the outage persists, follow Scenario 2 to restore from a snapshot.

---

## Scenario 4 — CDK stack accidentally deleted

`removalPolicy: SNAPSHOT` ensures the DB is preserved as a final snapshot on stack deletion.

```bash
# Find the last snapshot
aws rds describe-db-snapshots \
  --region ap-northeast-2 \
  --snapshot-type manual \
  --query "reverse(sort_by(DBSnapshots, &SnapshotCreateTime))[0:5].[DBSnapshotIdentifier,SnapshotCreateTime]" \
  --output table

# Once you have the snapshot ID, follow Scenario 2-2a
./restore-db.sh snapshot <snapshot-id>
```

Then redeploy all stacks:

```bash
cd infra
cdk deploy --all
```

**Expected recovery time:** 30–40 minutes

---

## Recovery checklist

- [ ] `/api/status` returns `{ status: "ok", api: "ok", database: "ok" }`
- [ ] Login and plant data queries work correctly
- [ ] Image upload works correctly (EFS mount verified)
- [ ] Old RDS instance deleted

---

## Useful AWS CLI commands

```bash
# Tail API logs (CloudWatch)
aws logs tail /plantbee/api --follow --region ap-northeast-2

# Check RDS instance status
aws rds describe-db-instances \
  --region ap-northeast-2 \
  --query "DBInstances[?contains(DBInstanceIdentifier,'plantbee')].[DBInstanceIdentifier,DBInstanceStatus,Endpoint.Address]" \
  --output table

# List running ECS tasks
aws ecs list-tasks \
  --cluster <cluster-name> \
  --region ap-northeast-2
```
