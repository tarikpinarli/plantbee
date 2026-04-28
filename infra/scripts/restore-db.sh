#!/usr/bin/env bash
# Restore PlantBee RDS from a snapshot or point-in-time.
# Usage:
#   ./restore-db.sh list                          -- list available snapshots
#   ./restore-db.sh snapshot <snapshot-id>        -- restore from a specific snapshot
#   ./restore-db.sh pitr <YYYY-MM-DDTHH:MM:SSZ>  -- restore to a point in time
#
# After restore, run:
#   cd infra && cdk deploy Plantbee-Database Plantbee-Backend

set -euo pipefail

REGION="${AWS_DEFAULT_REGION:-ap-northeast-2}"
DB_INSTANCE_IDENTIFIER="Plantbee-Database-Postgres"  # CDK logical ID pattern
RESTORE_SUFFIX="recovery-$(date +%Y%m%d%H%M%S)"
RESTORE_ID="${DB_INSTANCE_IDENTIFIER}-${RESTORE_SUFFIX}"

find_db_instance() {
  aws rds describe-db-instances \
    --region "$REGION" \
    --query "DBInstances[?contains(DBInstanceIdentifier, 'plantbee') || contains(DBInstanceIdentifier, 'Plantbee')].DBInstanceIdentifier" \
    --output text | tr '\t' '\n' | grep -iv recovery | head -1
}

cmd_list() {
  local source_id
  source_id=$(find_db_instance)
  if [[ -z "$source_id" ]]; then
    echo "ERROR: No PlantBee RDS instance found in region $REGION" >&2
    exit 1
  fi
  echo "Source instance: $source_id"
  echo ""
  echo "=== Automated snapshots (last 10) ==="
  aws rds describe-db-snapshots \
    --region "$REGION" \
    --db-instance-identifier "$source_id" \
    --snapshot-type automated \
    --query "reverse(sort_by(DBSnapshots, &SnapshotCreateTime))[0:10].[DBSnapshotIdentifier,SnapshotCreateTime,Status]" \
    --output table
  echo ""
  echo "=== Manual snapshots ==="
  aws rds describe-db-snapshots \
    --region "$REGION" \
    --db-instance-identifier "$source_id" \
    --snapshot-type manual \
    --query "reverse(sort_by(DBSnapshots, &SnapshotCreateTime)).[DBSnapshotIdentifier,SnapshotCreateTime,Status]" \
    --output table
}

cmd_snapshot() {
  local snapshot_id="$1"
  local source_id
  source_id=$(find_db_instance)

  echo "Restoring from snapshot: $snapshot_id"
  echo "New instance ID:         $RESTORE_ID"
  echo ""

  # Get VPC security group and subnet group from source instance
  local subnet_group sg_id
  subnet_group=$(aws rds describe-db-instances \
    --region "$REGION" \
    --db-instance-identifier "$source_id" \
    --query "DBInstances[0].DBSubnetGroup.DBSubnetGroupName" \
    --output text)
  sg_id=$(aws rds describe-db-instances \
    --region "$REGION" \
    --db-instance-identifier "$source_id" \
    --query "DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId" \
    --output text)

  aws rds restore-db-instance-from-db-snapshot \
    --region "$REGION" \
    --db-instance-identifier "$RESTORE_ID" \
    --db-snapshot-identifier "$snapshot_id" \
    --db-subnet-group-name "$subnet_group" \
    --vpc-security-group-ids "$sg_id" \
    --no-publicly-accessible \
    --no-cli-pager

  wait_for_available "$RESTORE_ID"
  print_next_steps "$RESTORE_ID"
}

cmd_pitr() {
  local restore_time="$1"
  local source_id
  source_id=$(find_db_instance)

  echo "Source instance: $source_id"
  echo "Restore time:    $restore_time"
  echo "New instance ID: $RESTORE_ID"
  echo ""

  local subnet_group sg_id
  subnet_group=$(aws rds describe-db-instances \
    --region "$REGION" \
    --db-instance-identifier "$source_id" \
    --query "DBInstances[0].DBSubnetGroup.DBSubnetGroupName" \
    --output text)
  sg_id=$(aws rds describe-db-instances \
    --region "$REGION" \
    --db-instance-identifier "$source_id" \
    --query "DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId" \
    --output text)

  aws rds restore-db-instance-to-point-in-time \
    --region "$REGION" \
    --source-db-instance-identifier "$source_id" \
    --target-db-instance-identifier "$RESTORE_ID" \
    --restore-time "$restore_time" \
    --db-subnet-group-name "$subnet_group" \
    --vpc-security-group-ids "$sg_id" \
    --no-publicly-accessible \
    --no-cli-pager

  wait_for_available "$RESTORE_ID"
  print_next_steps "$RESTORE_ID"
}

wait_for_available() {
  local id="$1"
  echo "Waiting for $id to become available (this takes ~10 minutes)..."
  aws rds wait db-instance-available \
    --region "$REGION" \
    --db-instance-identifier "$id"
  echo "Instance is available."
}

print_next_steps() {
  local id="$1"
  local endpoint
  endpoint=$(aws rds describe-db-instances \
    --region "$REGION" \
    --db-instance-identifier "$id" \
    --query "DBInstances[0].Endpoint.Address" \
    --output text)

  echo ""
  echo "========================================"
  echo "Restored instance endpoint: $endpoint"
  echo "========================================"
  echo ""
  echo "Next steps:"
  echo "  1. Verify data:  psql -h $endpoint -U plantbee -d plantbee"
  echo "  2. Update CDK to point to restored instance:"
  echo "     Edit infra/lib/database-stack.ts — set instanceIdentifier to '$id'"
  echo "  3. Redeploy backend:  cd infra && cdk deploy Plantbee-Database Plantbee-Backend"
  echo "  4. Verify /api/status shows database: ok"
  echo "  5. Once confirmed, delete the old instance via AWS console or:"
  echo "     aws rds delete-db-instance --db-instance-identifier <old-id> --skip-final-snapshot --region $REGION"
}

case "${1:-}" in
  list)     cmd_list ;;
  snapshot) [[ -n "${2:-}" ]] || { echo "Usage: $0 snapshot <snapshot-id>"; exit 1; }; cmd_snapshot "$2" ;;
  pitr)     [[ -n "${2:-}" ]] || { echo "Usage: $0 pitr <YYYY-MM-DDTHH:MM:SSZ>"; exit 1; }; cmd_pitr "$2" ;;
  *)
    echo "Usage: $0 {list|snapshot <id>|pitr <time>}"
    echo ""
    echo "  list                         List available snapshots"
    echo "  snapshot rds:xxx-2026-04-28  Restore from a specific snapshot"
    echo "  pitr 2026-04-28T09:00:00Z    Restore to a point in time"
    exit 1
    ;;
esac
